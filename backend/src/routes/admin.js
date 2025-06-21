const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { dbAsync } = require('../database/db');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const JWT_SECRET = process.env.JWT_SECRET || 'vape-store-secret-key';

// 圖片上傳目錄
const uploadDir = path.join(__dirname, '../../../public/images');

// 確保目錄存在
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer 配置
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // 防止文件名重複
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 1000 * 1024 }, // 1MB
  fileFilter: (req, file, cb) => {
    // 只接受圖片
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('只允許上傳圖片文件！'), false);
    }
    cb(null, true);
  }
});

// 中間件：驗證JWT令牌
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: '缺少訪問令牌' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: '無效的訪問令牌' });
    }
    req.user = user;
    next();
  });
};

// 管理員登錄
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: '請提供用戶名和密碼' });
    }
    
    const admin = await dbAsync.get(
      'SELECT * FROM admins WHERE username = ?',
      [username]
    );
    
    if (!admin) {
      return res.status(401).json({ error: '用戶名或密碼錯誤' });
    }
    
    const isValidPassword = await bcrypt.compare(password, admin.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: '用戶名或密碼錯誤' });
    }
    
    const token = jwt.sign(
      { id: admin.id, username: admin.username },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.json({
      message: '登錄成功',
      token,
      admin: {
        id: admin.id,
        username: admin.username
      }
    });
  } catch (error) {
    console.error('管理員登錄失敗:', error);
    res.status(500).json({ error: '登錄失敗' });
  }
});

// 驗證令牌
router.get('/verify', authenticateToken, (req, res) => {
  res.json({
    valid: true,
    admin: {
      id: req.user.id,
      username: req.user.username
    }
  });
});

// 管理員儀表板數據
router.get('/dashboard', authenticateToken, async (req, res) => {
  try {
    // 統計數據
    const stats = {
      totalProducts: 0,
      totalCoupons: 0,
      totalAnnouncements: 0,
      activeProducts: 0
    };
    
    // 產品統計
    const productCount = await dbAsync.get('SELECT COUNT(*) as count FROM products');
    stats.totalProducts = productCount.count;
    
    const activeProductCount = await dbAsync.get('SELECT COUNT(*) as count FROM products WHERE stock > 0');
    stats.activeProducts = activeProductCount.count;
    
    // 優惠券統計
    const couponCount = await dbAsync.get('SELECT COUNT(*) as count FROM coupons');
    stats.totalCoupons = couponCount.count;
    
    // 公告統計
    const announcementCount = await dbAsync.get('SELECT COUNT(*) as count FROM announcements');
    stats.totalAnnouncements = announcementCount.count;
    
    // 分類統計
    const categoryStats = await dbAsync.all(`
      SELECT category, COUNT(*) as count 
      FROM products 
      GROUP BY category
    `);
    
    // 品牌統計
    const brandStats = await dbAsync.all(`
      SELECT brand, COUNT(*) as count 
      FROM products 
      GROUP BY brand
    `);
    
    // 庫存警告（庫存少於10的產品）
    const lowStockProducts = await dbAsync.all(`
      SELECT name, stock 
      FROM products 
      WHERE stock < 10 
      ORDER BY stock ASC
    `);
    
    res.json({
      stats,
      categoryStats,
      brandStats,
      lowStockProducts
    });
  } catch (error) {
    console.error('獲取儀表板數據失敗:', error);
    res.status(500).json({ error: '獲取儀表板數據失敗' });
  }
});

// 圖片管理 - 獲取所有圖片
router.get('/images', authenticateToken, (req, res) => {
  fs.readdir(uploadDir, (err, files) => {
    if (err) {
      console.error('讀取圖片目錄失敗:', err);
      return res.status(500).json({ error: '無法讀取圖片列表' });
    }
    // 過濾掉非圖片文件和隱藏文件
    const imageFiles = files.filter(file => /\.(jpg|jpeg|png|gif|webp)$/i.test(file));
    res.json(imageFiles.reverse()); // 最近的在最前面
  });
});

// 圖片管理 - 上傳圖片
router.post('/upload-image', authenticateToken, (req, res) => {
  const uploader = upload.single('image');
  
  uploader(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      // Multer 錯誤
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: '圖片大小不能超過 1MB' });
      }
      return res.status(400).json({ error: `上傳失敗: ${err.message}` });
    } else if (err) {
      // 其他錯誤
      return res.status(400).json({ error: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ error: '請選擇要上傳的圖片' });
    }

    res.status(201).json({
      message: '圖片上傳成功',
      filename: req.file.filename,
      path: `/images/${req.file.filename}`
    });
  });
});

// 產品管理 - 獲取所有產品
router.get('/products', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 20, category, brand } = req.query;
    
    let sql = 'SELECT * FROM products WHERE 1=1';
    const params = [];
    
    if (category) {
      sql += ' AND category = ?';
      params.push(category);
    }
    
    if (brand) {
      sql += ' AND brand = ?';
      params.push(brand);
    }
    
    sql += ' ORDER BY created_at DESC';
    
    // 分頁
    const offset = (parseInt(page) - 1) * parseInt(limit);
    sql += ' LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);
    
    const products = await dbAsync.all(sql, params);
    
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
    
    const countResult = await dbAsync.get(countSql, countParams);
    
    res.json({
      products,
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

// 批量更新產品庫存
router.put('/products/batch-stock', authenticateToken, async (req, res) => {
  try {
    const { updates } = req.body; // [{ id, stock }, ...]
    
    if (!Array.isArray(updates) || updates.length === 0) {
      return res.status(400).json({ error: '無效的更新數據' });
    }
    
    for (const update of updates) {
      await dbAsync.run(
        'UPDATE products SET stock = ? WHERE id = ?',
        [update.stock, update.id]
      );
    }
    
    res.json({ message: '庫存更新成功' });
  } catch (error) {
    console.error('批量更新庫存失敗:', error);
    res.status(500).json({ error: '批量更新庫存失敗' });
  }
});

// 創建產品
router.post('/products', authenticateToken, async (req, res) => {
  try {
    const { name, category, brand, price, description, image_url, stock } = req.body;
    
    if (!name || !category || !brand || !price) {
      return res.status(400).json({ error: '缺少必要參數' });
    }
    
    const validCategories = ['host', 'cartridge', 'disposable'];
    if (!validCategories.includes(category)) {
      return res.status(400).json({ error: '產品類別無效' });
    }
    
    const result = await dbAsync.run(`
      INSERT INTO products (name, category, brand, price, description, image_url, stock)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [name, category, brand, price, description || '', image_url || '', stock || 0]);
    
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
router.put('/products/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, brand, price, description, image_url, stock } = req.body;
    
    if (!name || !category || !brand || !price) {
      return res.status(400).json({ error: '缺少必要參數' });
    }
    
    const validCategories = ['host', 'cartridge', 'disposable'];
    if (!validCategories.includes(category)) {
      return res.status(400).json({ error: '產品類別無效' });
    }
    
    const result = await dbAsync.run(`
      UPDATE products 
      SET name = ?, category = ?, brand = ?, price = ?, 
          description = ?, image_url = ?, stock = ?
      WHERE id = ?
    `, [name, category, brand, price, description || '', image_url || '', stock || 0, id]);
    
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
router.delete('/products/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    // 先刪除相關的變體
    await dbAsync.run('DELETE FROM product_variants WHERE product_id = ?', [id]);
    
    // 刪除產品
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

// ============ 產品變體管理 ============

// 獲取產品變體
router.get('/products/:id/variants', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const variants = await dbAsync.all(`
      SELECT * FROM product_variants WHERE product_id = ?
      ORDER BY variant_type, variant_value
    `, [id]);
    
    res.json(variants);
  } catch (error) {
    console.error('獲取產品變體失敗:', error);
    res.status(500).json({ error: '獲取產品變體失敗' });
  }
});

// 創建產品變體
router.post('/products/:id/variants', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { variant_type, variant_value, stock, price_modifier } = req.body;
    
    if (!variant_type || !variant_value) {
      return res.status(400).json({ error: '缺少必要參數' });
    }
    
    // 檢查產品是否存在
    const product = await dbAsync.get('SELECT id FROM products WHERE id = ?', [id]);
    if (!product) {
      return res.status(404).json({ error: '產品不存在' });
    }
    
    const result = await dbAsync.run(`
      INSERT INTO product_variants (product_id, variant_type, variant_value, stock, price_modifier)
      VALUES (?, ?, ?, ?, ?)
    `, [id, variant_type, variant_value, stock || 0, price_modifier || 0]);
    
    res.status(201).json({
      id: result.id,
      message: '產品變體創建成功'
    });
  } catch (error) {
    console.error('創建產品變體失敗:', error);
    res.status(500).json({ error: '創建產品變體失敗' });
  }
});

// 更新產品變體
router.put('/variants/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { variant_type, variant_value, stock, price_modifier } = req.body;
    
    if (!variant_type || !variant_value) {
      return res.status(400).json({ error: '缺少必要參數' });
    }
    
    const result = await dbAsync.run(`
      UPDATE product_variants 
      SET variant_type = ?, variant_value = ?, stock = ?, price_modifier = ?
      WHERE id = ?
    `, [variant_type, variant_value, stock || 0, price_modifier || 0, id]);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: '產品變體不存在' });
    }
    
    res.json({ message: '產品變體更新成功' });
  } catch (error) {
    console.error('更新產品變體失敗:', error);
    res.status(500).json({ error: '更新產品變體失敗' });
  }
});

// 刪除產品變體
router.delete('/variants/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await dbAsync.run('DELETE FROM product_variants WHERE id = ?', [id]);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: '產品變體不存在' });
    }
    
    res.json({ message: '產品變體刪除成功' });
  } catch (error) {
    console.error('刪除產品變體失敗:', error);
    res.status(500).json({ error: '刪除產品變體失敗' });
  }
});

// ============ 優惠券管理 ============

// 獲取所有優惠券
router.get('/coupons', authenticateToken, async (req, res) => {
  try {
    const coupons = await dbAsync.all(`
      SELECT * FROM coupons 
      ORDER BY created_at DESC
    `);
    
    res.json(coupons);
  } catch (error) {
    console.error('獲取優惠券列表失敗:', error);
    res.status(500).json({ error: '獲取優惠券列表失敗' });
  }
});

// 創建優惠券
router.post('/coupons', authenticateToken, async (req, res) => {
  try {
    const { code, type, value, min_amount, expires_at } = req.body;
    
    if (!code || !type || !value) {
      return res.status(400).json({ error: '缺少必要參數' });
    }
    
    const validTypes = ['percentage', 'fixed'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ error: '優惠券類型無效' });
    }
    
    // 檢查優惠碼是否已存在
    const existingCoupon = await dbAsync.get(
      'SELECT id FROM coupons WHERE code = ?',
      [code]
    );
    
    if (existingCoupon) {
      return res.status(400).json({ error: '優惠碼已存在' });
    }
    
    const result = await dbAsync.run(`
      INSERT INTO coupons (code, type, value, min_amount, expires_at, is_active)
      VALUES (?, ?, ?, ?, ?, 1)
    `, [code, type, value, min_amount || 0, expires_at || null]);
    
    res.status(201).json({
      id: result.id,
      message: '優惠券創建成功'
    });
  } catch (error) {
    console.error('創建優惠券失敗:', error);
    res.status(500).json({ error: '創建優惠券失敗' });
  }
});

// 更新優惠券
router.put('/coupons/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { code, type, value, min_amount, expires_at, is_active } = req.body;
    
    if (!code || !type || !value) {
      return res.status(400).json({ error: '缺少必要參數' });
    }
    
    const validTypes = ['percentage', 'fixed'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ error: '優惠券類型無效' });
    }
    
    const result = await dbAsync.run(`
      UPDATE coupons 
      SET code = ?, type = ?, value = ?, min_amount = ?, expires_at = ?, is_active = ?
      WHERE id = ?
    `, [code, type, value, min_amount || 0, expires_at || null, is_active ? 1 : 0, id]);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: '優惠券不存在' });
    }
    
    res.json({ message: '優惠券更新成功' });
  } catch (error) {
    console.error('更新優惠券失敗:', error);
    res.status(500).json({ error: '更新優惠券失敗' });
  }
});

// 刪除優惠券
router.delete('/coupons/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await dbAsync.run('DELETE FROM coupons WHERE id = ?', [id]);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: '優惠券不存在' });
    }
    
    res.json({ message: '優惠券刪除成功' });
  } catch (error) {
    console.error('刪除優惠券失敗:', error);
    res.status(500).json({ error: '刪除優惠券失敗' });
  }
});

// ============ 公告管理 ============

// 獲取所有公告
router.get('/announcements', authenticateToken, async (req, res) => {
  try {
    const announcements = await dbAsync.all(`
      SELECT * FROM announcements 
      ORDER BY created_at DESC
    `);
    
    res.json(announcements);
  } catch (error) {
    console.error('獲取公告列表失敗:', error);
    res.status(500).json({ error: '獲取公告列表失敗' });
  }
});

// 創建公告
router.post('/announcements', authenticateToken, async (req, res) => {
  try {
    const { title, content, type } = req.body;
    
    if (!title || !content || !type) {
      return res.status(400).json({ error: '缺少必要參數' });
    }
    
    const validTypes = ['info', 'warning', 'promotion'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ error: '公告類型無效' });
    }
    
    const result = await dbAsync.run(`
      INSERT INTO announcements (title, content, type, is_active)
      VALUES (?, ?, ?, 1)
    `, [title, content, type]);
    
    res.status(201).json({
      id: result.id,
      message: '公告創建成功'
    });
  } catch (error) {
    console.error('創建公告失敗:', error);
    res.status(500).json({ error: '創建公告失敗' });
  }
});

// 更新公告
router.put('/announcements/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, type, is_active } = req.body;
    
    if (!title || !content || !type) {
      return res.status(400).json({ error: '缺少必要參數' });
    }
    
    const validTypes = ['info', 'warning', 'promotion'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ error: '公告類型無效' });
    }
    
    const result = await dbAsync.run(`
      UPDATE announcements 
      SET title = ?, content = ?, type = ?, is_active = ?
      WHERE id = ?
    `, [title, content, type, is_active ? 1 : 0, id]);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: '公告不存在' });
    }
    
    res.json({ message: '公告更新成功' });
  } catch (error) {
    console.error('更新公告失敗:', error);
    res.status(500).json({ error: '更新公告失敗' });
  }
});

// 刪除公告
router.delete('/announcements/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await dbAsync.run('DELETE FROM announcements WHERE id = ?', [id]);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: '公告不存在' });
    }
    
    res.json({ message: '公告刪除成功' });
  } catch (error) {
    console.error('刪除公告失敗:', error);
    res.status(500).json({ error: '刪除公告失敗' });
  }
});

// 系統設置 - 獲取設置
router.get('/settings', authenticateToken, async (req, res) => {
  try {
    const settings = await dbAsync.all('SELECT * FROM system_settings');
    const settingsObj = {};
    
    settings.forEach(setting => {
      settingsObj[setting.key] = {
        value: setting.value,
        updated_at: setting.updated_at
      };
    });
    
    res.json(settingsObj);
  } catch (error) {
    console.error('獲取系統設置失敗:', error);
    res.status(500).json({ error: '獲取系統設置失敗' });
  }
});

// 系統設置 - 更新設置
router.put('/settings', authenticateToken, async (req, res) => {
  try {
    const { key, value } = req.body;
    
    if (!key || value === undefined) {
      return res.status(400).json({ error: '請提供設置鍵和值' });
    }
    
    await dbAsync.run(
      `INSERT OR REPLACE INTO system_settings (key, value, updated_at) 
       VALUES (?, ?, datetime('now'))`,
      [key, value]
    );
    
    res.json({ message: '設置更新成功' });
  } catch (error) {
    console.error('更新系統設置失敗:', error);
    res.status(500).json({ error: '更新系統設置失敗' });
  }
});

// 系統設置 - 批量更新設置
router.put('/settings/batch', authenticateToken, async (req, res) => {
  try {
    const settings = req.body;
    
    if (!settings || typeof settings !== 'object') {
      return res.status(400).json({ error: '請提供有效的設置對象' });
    }
    
    for (const [key, value] of Object.entries(settings)) {
      await dbAsync.run(
        `INSERT OR REPLACE INTO system_settings (key, value, updated_at) 
         VALUES (?, ?, datetime('now'))`,
        [key, value]
      );
    }
    
    res.json({ message: '設置批量更新成功' });
  } catch (error) {
    console.error('批量更新系統設置失敗:', error);
    res.status(500).json({ error: '批量更新系統設置失敗' });
  }
});

// 管理員管理 - 獲取所有管理員
router.get('/admins', authenticateToken, async (req, res) => {
  try {
    const admins = await dbAsync.all(
      'SELECT id, username, created_at FROM admins ORDER BY created_at DESC'
    );
    
    res.json(admins);
  } catch (error) {
    console.error('獲取管理員列表失敗:', error);
    res.status(500).json({ error: '獲取管理員列表失敗' });
  }
});

// 管理員管理 - 創建新管理員
router.post('/admins', authenticateToken, async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: '請提供用戶名和密碼' });
    }
    
    if (password.length < 6) {
      return res.status(400).json({ error: '密碼長度至少6位' });
    }
    
    // 檢查用戶名是否已存在
    const existingAdmin = await dbAsync.get(
      'SELECT id FROM admins WHERE username = ?',
      [username]
    );
    
    if (existingAdmin) {
      return res.status(400).json({ error: '用戶名已存在' });
    }
    
    // 加密密碼
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    
    // 創建管理員
    const result = await dbAsync.run(
      'INSERT INTO admins (username, password_hash, created_at) VALUES (?, ?, datetime(\'now\'))',
      [username, passwordHash]
    );
    
    res.json({ 
      message: '管理員創建成功',
      admin: {
        id: result.lastID,
        username
      }
    });
  } catch (error) {
    console.error('創建管理員失敗:', error);
    res.status(500).json({ error: '創建管理員失敗' });
  }
});

// 管理員管理 - 更改密碼
router.put('/admins/:id/password', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;
    
    if (!newPassword) {
      return res.status(400).json({ error: '請提供新密碼' });
    }
    
    if (newPassword.length < 6) {
      return res.status(400).json({ error: '密碼長度至少6位' });
    }
    
    // 檢查管理員是否存在
    const admin = await dbAsync.get('SELECT id FROM admins WHERE id = ?', [id]);
    if (!admin) {
      return res.status(404).json({ error: '管理員不存在' });
    }
    
    // 加密新密碼
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(newPassword, saltRounds);
    
    // 更新密碼
    await dbAsync.run(
      'UPDATE admins SET password_hash = ? WHERE id = ?',
      [passwordHash, id]
    );
    
    res.json({ message: '密碼更新成功' });
  } catch (error) {
    console.error('更新密碼失敗:', error);
    res.status(500).json({ error: '更新密碼失敗' });
  }
});

// 管理員管理 - 刪除管理員
router.delete('/admins/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    // 檢查是否為當前登錄的管理員
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({ error: '不能刪除當前登錄的管理員' });
    }
    
    // 檢查管理員是否存在
    const admin = await dbAsync.get('SELECT id FROM admins WHERE id = ?', [id]);
    if (!admin) {
      return res.status(404).json({ error: '管理員不存在' });
    }
    
    // 刪除管理員
    await dbAsync.run('DELETE FROM admins WHERE id = ?', [id]);
    
    res.json({ message: '管理員刪除成功' });
  } catch (error) {
    console.error('刪除管理員失敗:', error);
    res.status(500).json({ error: '刪除管理員失敗' });
  }
});

// 測試Telegram Bot
router.post('/test-telegram', authenticateToken, async (req, res) => {
  try {
    const { botToken, chatId, message } = req.body;
    
    if (!botToken || !chatId || !message) {
      return res.status(400).json({ error: '請提供Bot Token、Chat ID和測試消息' });
    }
    
    const telegramAPI = `https://api.telegram.org/bot${botToken}/sendMessage`;
    
    const response = await fetch(telegramAPI, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML'
      })
    });
    
    const result = await response.json();
    
    if (result.ok) {
      res.json({ 
        success: true, 
        message: '測試消息發送成功',
        messageId: result.result.message_id
      });
    } else {
      res.status(400).json({ 
        success: false, 
        error: result.description || '發送失敗' 
      });
    }
  } catch (error) {
    console.error('測試Telegram Bot失敗:', error);
    res.status(500).json({ error: '測試Telegram Bot失敗' });
  }
});

module.exports = router;
