const express = require('express');
const { dbAsync } = require('../database/db');
const { v4: uuidv4 } = require('uuid');
const router = express.Router();

// 獲取購物車內容
router.get('/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    const cartItems = await dbAsync.all(`
      SELECT
        ci.id,
        ci.quantity,
        ci.session_id,
        ci.variant_id,
        p.id as product_id,
        p.name,
        p.price as base_price,
        p.image_url,
        p.brand,
        p.category,
        pv.variant_type,
        pv.variant_value,
        pv.price_modifier,
        (p.price + COALESCE(pv.price_modifier, 0)) as price,
        (p.price + COALESCE(pv.price_modifier, 0)) * ci.quantity as total_price
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      LEFT JOIN product_variants pv ON ci.variant_id = pv.id
      WHERE ci.session_id = ?
      ORDER BY ci.created_at DESC
    `, [sessionId]);
    
    const totalAmount = cartItems.reduce((sum, item) => sum + item.total_price, 0);
    
    res.json({
      items: cartItems,
      totalAmount,
      itemCount: cartItems.length
    });
  } catch (error) {
    console.error('獲取購物車失敗:', error);
    res.status(500).json({ error: '獲取購物車失敗' });
  }
});

// 添加商品到購物車
router.post('/', async (req, res) => {
  try {
    const { sessionId, productId, variantId, quantity = 1 } = req.body;
    
    if (!sessionId || !productId) {
      return res.status(400).json({ error: '缺少必要參數' });
    }
    
    // 檢查產品是否存在
    const product = await dbAsync.get(
      'SELECT * FROM products WHERE id = ?',
      [productId]
    );
    
    if (!product) {
      return res.status(404).json({ error: '產品不存在' });
    }
    
    // 檢查是否已存在相同商品（包括變體）
    const existingItem = await dbAsync.get(`
      SELECT * FROM cart_items 
      WHERE session_id = ? AND product_id = ? AND variant_id ${variantId ? '= ?' : 'IS NULL'}
    `, variantId ? [sessionId, productId, variantId] : [sessionId, productId]);
    
    if (existingItem) {
      // 更新數量
      const result = await dbAsync.run(`
        UPDATE cart_items 
        SET quantity = quantity + ? 
        WHERE id = ?
      `, [quantity, existingItem.id]);
      
      res.json({ 
        message: '商品數量已更新',
        cartItemId: existingItem.id
      });
    } else {
      // 新增商品
      const result = await dbAsync.run(`
        INSERT INTO cart_items (session_id, product_id, variant_id, quantity)
        VALUES (?, ?, ?, ?)
      `, [sessionId, productId, variantId || null, quantity]);
      
      res.status(201).json({
        message: '商品已添加到購物車',
        cartItemId: result.id
      });
    }
  } catch (error) {
    console.error('添加到購物車失敗:', error);
    res.status(500).json({ error: '添加到購物車失敗' });
  }
});

// 更新購物車商品數量
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;
    
    if (!quantity || quantity < 1) {
      return res.status(400).json({ error: '商品數量必須大於0' });
    }
    
    const result = await dbAsync.run(`
      UPDATE cart_items SET quantity = ? WHERE id = ?
    `, [quantity, id]);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: '購物車商品不存在' });
    }
    
    res.json({ message: '商品數量已更新' });
  } catch (error) {
    console.error('更新購物車失敗:', error);
    res.status(500).json({ error: '更新購物車失敗' });
  }
});

// 從購物車移除商品
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await dbAsync.run('DELETE FROM cart_items WHERE id = ?', [id]);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: '購物車商品不存在' });
    }
    
    res.json({ message: '商品已從購物車移除' });
  } catch (error) {
    console.error('移除購物車商品失敗:', error);
    res.status(500).json({ error: '移除購物車商品失敗' });
  }
});

// 清空購物車
router.delete('/clear/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    await dbAsync.run('DELETE FROM cart_items WHERE session_id = ?', [sessionId]);
    
    res.json({ message: '購物車已清空' });
  } catch (error) {
    console.error('清空購物車失敗:', error);
    res.status(500).json({ error: '清空購物車失敗' });
  }
});

module.exports = router;
