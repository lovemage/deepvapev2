const express = require('express');
const { dbAsync } = require('../database/db');
const router = express.Router();

// 獲取公開系統設置
router.get('/public', async (req, res) => {
  try {
    const settings = await dbAsync.all(`
      SELECT key, value FROM system_settings
      WHERE key IN ('free_shipping_threshold', 'hero_image_url', 'show_product_reviews', 'show_product_preview')
    `);

    const settingsObj = {};
    settings.forEach(setting => {
      settingsObj[setting.key] = setting.value;
    });

    res.json(settingsObj);
  } catch (error) {
    console.error('獲取公開系統設置失敗:', error);
    res.status(500).json({ error: '獲取系統設置失敗' });
  }
});

module.exports = router; 