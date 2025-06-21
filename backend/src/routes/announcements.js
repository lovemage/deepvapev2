const express = require('express');
const { dbAsync } = require('../database/db');
const router = express.Router();

// 獲取所有活躍公告
router.get('/', async (req, res) => {
  try {
    const announcements = await dbAsync.all(`
      SELECT * FROM announcements 
      WHERE is_active = 1 
      ORDER BY created_at DESC
    `);
    
    res.json(announcements);
  } catch (error) {
    console.error('獲取公告失敗:', error);
    res.status(500).json({ error: '獲取公告失敗' });
  }
});

// 獲取所有公告（管理員）
router.get('/admin', async (req, res) => {
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

// 創建公告（管理員）
router.post('/', async (req, res) => {
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
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, type } = req.body;
    
    if (!title || !content || !type) {
      return res.status(400).json({ error: '缺少必要參數' });
    }
    
    const validTypes = ['info', 'warning', 'promotion'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ error: '公告類型無效' });
    }
    
    const result = await dbAsync.run(`
      UPDATE announcements 
      SET title = ?, content = ?, type = ?
      WHERE id = ?
    `, [title, content, type, id]);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: '公告不存在' });
    }
    
    res.json({ message: '公告更新成功' });
  } catch (error) {
    console.error('更新公告失敗:', error);
    res.status(500).json({ error: '更新公告失敗' });
  }
});

// 更新公告狀態
router.put('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { is_active } = req.body;
    
    const result = await dbAsync.run(`
      UPDATE announcements SET is_active = ? WHERE id = ?
    `, [is_active ? 1 : 0, id]);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: '公告不存在' });
    }
    
    res.json({ 
      message: `公告已${is_active ? '啟用' : '停用'}` 
    });
  } catch (error) {
    console.error('更新公告狀態失敗:', error);
    res.status(500).json({ error: '更新公告狀態失敗' });
  }
});

// 刪除公告
router.delete('/:id', async (req, res) => {
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

module.exports = router;
