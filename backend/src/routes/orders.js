const express = require('express');
const { dbAsync } = require('../database/db');
const router = express.Router();

// 提交訂單並發送Telegram通知
router.post('/submit', async (req, res) => {
  try {
    const { orderData } = req.body;
    
    if (!orderData) {
      return res.status(400).json({ error: '缺少訂單數據' });
    }

    // 獲取Telegram設置
    const telegramSettings = await dbAsync.all(`
      SELECT key, value FROM system_settings 
      WHERE key IN ('telegram_bot_token', 'telegram_chat_id')
    `);
    
    const settings = {};
    telegramSettings.forEach(setting => {
      settings[setting.key] = setting.value;
    });

    const botToken = settings.telegram_bot_token;
    const chatId = settings.telegram_chat_id;

    if (!botToken || !chatId) {
      console.warn('Telegram設置未配置，跳過通知發送');
      return res.json({ 
        success: true, 
        message: '訂單提交成功',
        telegramSent: false 
      });
    }

    // 發送Telegram通知
    const telegramSent = await sendTelegramNotification(orderData, botToken, chatId);
    
    res.json({ 
      success: true, 
      message: '訂單提交成功',
      telegramSent 
    });
  } catch (error) {
    console.error('提交訂單失敗:', error);
    res.status(500).json({ error: '提交訂單失敗' });
  }
});

const sendTelegramNotification = async (orderData, botToken, chatId) => {
  try {
    const { orderId, customerInfo, items, totals, appliedCoupon } = orderData;
    
    // 格式化商品列表
    const productList = items.map(item => {
      let productText = `• ${item.name} x${item.quantity} - NT$${item.total_price}`;
      if (item.variant_value) {
        productText += `\n  ${item.variant_type}: ${item.variant_value}`;
      }
      return productText;
    }).join('\n');

    // 構建訊息
    const message = `🛒 新訂單通知

📋 訂單編號: ${orderId}
📅 訂單時間: ${new Date().toLocaleString('zh-TW')}

👤 客戶資訊:
• 姓名: ${customerInfo.name}
• 電話: ${customerInfo.phone}
${customerInfo.lineId ? `• Line ID: ${customerInfo.lineId}` : ''}

🏪 取貨門市:
${customerInfo.storeName ? `• ${customerInfo.storeName}` : ''}
${customerInfo.storeNumber ? `• 店號: ${customerInfo.storeNumber}` : ''}

🛍️ 訂購商品:
${productList}

💰 金額明細:
• 商品小計: NT$${totals.subtotal}
• 運費: NT$${totals.shipping}
${appliedCoupon ? `• 優惠券使用: ${appliedCoupon.coupon.code} -NT$${totals.discount}` : ''}
• 總計: NT$${totals.finalTotal}

請盡快處理此訂單！`;

    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML'
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('Telegram API 錯誤:', result);
      return false;
    }

    console.log('Telegram通知發送成功！');
    return true;
  } catch (error) {
    console.error('Telegram通知發送失敗:', error);
    return false;
  }
};

module.exports = router; 