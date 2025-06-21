const express = require('express');
const { dbAsync } = require('../database/db');
const router = express.Router();

// 獲取產品列表（支持分類和搜索）
router.get('/', async (req, res) => {
  try {
    const { category, brand, search, page = 1, limit = 12 } = req.query;
    
    let sql = `
      SELECT * FROM products p WHERE 1=1
    `;
    
    const params = [];
    
    if (category) {
      sql += ' AND p.category = ?';
      params.push(category);
    }
    
    if (brand) {
      sql += ' AND p.brand = ?';
      params.push(brand);
    }
    
    if (search) {
      sql += ' AND (p.name LIKE ? OR p.description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    
    sql += ' ORDER BY p.created_at DESC';
    
    // 分頁
    const offset = (parseInt(page) - 1) * parseInt(limit);
    sql += ' LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);
    
    const products = await dbAsync.all(sql, params);
    
    // 為每個產品獲取變體數據
    const processedProducts = await Promise.all(products.map(async (product) => {
      const variants = await dbAsync.all(`
        SELECT * FROM product_variants WHERE product_id = ?
      `, [product.id]);
      
      return {
        ...product,
        variants
      };
    }));
    
    // 獲取總數
    let countSql = 'SELECT COUNT(*) as total FROM products WHERE 1=1';
    const countParams = [];
    
    if (category) {
      countSql += ' AND category = ?';
      countParams.push(category);
    }
    
    if (brand) {
      countSql += ' AND brand = ?';
      countParams.push(brand);
    }
    
    if (search) {
      countSql += ' AND (name LIKE ? OR description LIKE ?)';
      countParams.push(`%${search}%`, `%${search}%`);
    }
    
    const countResult = await dbAsync.get(countSql, countParams);
    
    res.json({
      products: processedProducts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: countResult.total,
        pages: Math.ceil(countResult.total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('獲取產品列表失敗:', error);
    res.status(500).json({ error: '獲取產品列表失敗' });
  }
});

// 獲取單個產品詳情
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const product = await dbAsync.get(`
      SELECT * FROM products WHERE id = ?
    `, [id]);
    
    if (!product) {
      return res.status(404).json({ error: '產品不存在' });
    }
    
    const variants = await dbAsync.all(`
      SELECT * FROM product_variants WHERE product_id = ?
    `, [id]);
    
    res.json({
      ...product,
      variants
    });
  } catch (error) {
    console.error('獲取產品詳情失敗:', error);
    res.status(500).json({ error: '獲取產品詳情失敗' });
  }
});

// 獲取分類列表
router.get('/categories/list', async (req, res) => {
  try {
    const categories = await dbAsync.all(`
      SELECT category, COUNT(*) as count 
      FROM products 
      GROUP BY category
    `);
    
    res.json(categories);
  } catch (error) {
    console.error('獲取分類列表失敗:', error);
    res.status(500).json({ error: '獲取分類列表失敗' });
  }
});

// 獲取品牌列表
router.get('/brands/list', async (req, res) => {
  try {
    const { category } = req.query;
    
    let sql = 'SELECT brand, COUNT(*) as count FROM products';
    const params = [];
    
    if (category) {
      sql += ' WHERE category = ?';
      params.push(category);
    }
    
    sql += ' GROUP BY brand';
    
    const brands = await dbAsync.all(sql, params);
    
    res.json(brands);
  } catch (error) {
    console.error('獲取品牌列表失敗:', error);
    res.status(500).json({ error: '獲取品牌列表失敗' });
  }
});

// 創建產品（管理員功能）
router.post('/', async (req, res) => {
  try {
    const { name, category, brand, price, description, image_url, stock } = req.body;
    
    const result = await dbAsync.run(`
      INSERT INTO products (name, category, brand, price, description, image_url, stock)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [name, category, brand, price, description, image_url, stock]);
    
    res.status(201).json({
      id: result.id,
      message: '產品創建成功'
    });
  } catch (error) {
    console.error('創建產品失敗:', error);
    res.status(500).json({ error: '創建產品失敗' });
  }
});

// 更新產品
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, brand, price, description, image_url, stock } = req.body;
    
    const result = await dbAsync.run(`
      UPDATE products 
      SET name = ?, category = ?, brand = ?, price = ?, 
          description = ?, image_url = ?, stock = ?
      WHERE id = ?
    `, [name, category, brand, price, description, image_url, stock, id]);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: '產品不存在' });
    }
    
    res.json({ message: '產品更新成功' });
  } catch (error) {
    console.error('更新產品失敗:', error);
    res.status(500).json({ error: '更新產品失敗' });
  }
});

// 刪除產品
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await dbAsync.run('DELETE FROM products WHERE id = ?', [id]);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: '產品不存在' });
    }
    
    res.json({ message: '產品刪除成功' });
  } catch (error) {
    console.error('刪除產品失敗:', error);
    res.status(500).json({ error: '刪除產品失敗' });
  }
});

module.exports = router;
