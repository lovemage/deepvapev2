const express = require('express');
const { dbAsync } = require('../database/db');
const router = express.Router();

// 驗證優惠券
router.post('/validate', async (req, res) => {
  try {
    const { code, amount } = req.body;
    
    if (!code) {
      return res.status(400).json({ error: '請輸入優惠碼' });
    }
    
    const coupon = await dbAsync.get(`
      SELECT * FROM coupons 
      WHERE code = ? AND is_active = 1
    `, [code]);
    
    if (!coupon) {
      return res.status(404).json({ error: '優惠碼不存在或已失效' });
    }
    
    // 檢查是否過期
    if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
      return res.status(400).json({ error: '優惠碼已過期' });
    }
    
    // 檢查最低消費金額
    if (amount && amount < coupon.min_amount) {
      return res.status(400).json({ 
        error: `訂單金額需滿 $${coupon.min_amount} 才能使用此優惠碼` 
      });
    }
    
    // 計算折扣金額
    let discountAmount = 0;
    if (coupon.type === 'percentage') {
      discountAmount = Math.round((amount * coupon.value / 100) * 100) / 100;
    } else if (coupon.type === 'fixed') {
      discountAmount = coupon.value;
    }
    
    res.json({
      valid: true,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        type: coupon.type,
        value: coupon.value,
        min_amount: coupon.min_amount
      },
      discountAmount,
      finalAmount: Math.max(0, amount - discountAmount)
    });
  } catch (error) {
    console.error('驗證優惠券失敗:', error);
    res.status(500).json({ error: '驗證優惠券失敗' });
  }
});

// 獲取所有優惠券（管理員）
router.get('/', async (req, res) => {
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

// 創建優惠券（管理員）
router.post('/', async (req, res) => {
  try {
    const { code, type, value, min_amount, expires_at } = req.body;
    
    if (!code || !type || !value) {
      return res.status(400).json({ error: '缺少必要參數' });
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

// 更新優惠券狀態
router.put('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { is_active } = req.body;
    
    const result = await dbAsync.run(`
      UPDATE coupons SET is_active = ? WHERE id = ?
    `, [is_active ? 1 : 0, id]);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: '優惠券不存在' });
    }
    
    res.json({ 
      message: `優惠券已${is_active ? '啟用' : '停用'}` 
    });
  } catch (error) {
    console.error('更新優惠券狀態失敗:', error);
    res.status(500).json({ error: '更新優惠券狀態失敗' });
  }
});

// 刪除優惠券
router.delete('/:id', async (req, res) => {
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

module.exports = router;
