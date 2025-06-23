const express = require('express');
const { dbAsync } = require('../database/db');
const router = express.Router();

// 提交訂單並發送Telegram通知
router.post('/submit', async (req, res) => {
  const { orderData } = req.body;
  if (!orderData) {
    return res.status(400).json({ error: '缺少訂單數據' });
  }

  // 為 orderData 添加 orderNumber 佔位符，以便通知函數使用
  // 實際的 orderNumber 會在稍後生成並更新
  const tempOrderNumber = `ORD-TEMP-${Date.now()}`;
  const orderDataForNotification = { ...orderData, orderNumber: tempOrderNumber };


  try {
    await dbAsync.run('BEGIN TRANSACTION');

    // 1. 插入訂單主表，讓數據庫生成ID
    const orderResult = await dbAsync.run(`
      INSERT INTO orders (customer_name, customer_phone, customer_line_id, shipping_method, shipping_store_name, shipping_store_number, subtotal, shipping_fee, discount, total_amount, status, coupon_code)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      orderData.customerInfo.name,
      orderData.customerInfo.phone,
      orderData.customerInfo.lineId || null,
      orderData.shippingMethod || '7-11',
      orderData.customerInfo.storeName || null,
      orderData.customerInfo.storeNumber || null,
      orderData.totals.subtotal,
      orderData.totals.shipping,
      orderData.totals.discount,
      orderData.totals.finalTotal,
      'pending',
      orderData.appliedCoupon?.coupon.code || null
    ]);

    const orderId = orderResult.lastID;

    // 生成可讀訂單號並更新回訂單表
    const orderNumber = `ORD-${new Date().getFullYear()}-${String(orderId).padStart(6, '0')}`;
    await dbAsync.run('UPDATE orders SET order_number = ? WHERE id = ?', [orderNumber, orderId]);

    // 更新通知物件中的訂單號
    orderDataForNotification.orderNumber = orderNumber;
    orderDataForNotification.orderId = orderId; // 確保 orderId 也可用

    // 2. 處理訂單項目和庫存
    for (const item of orderData.items) {
      // 插入訂單項目
      await dbAsync.run(`
        INSERT INTO order_items (order_id, product_id, variant_id, quantity, price, product_name, variant_value)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [
        orderId,
        item.product_id,
        item.variant_id || null,
        item.quantity,
        item.price,
        item.name,
        item.variant_value || null
      ]);

      // 更新庫存
      if (item.variant_id) {
        const variantStockResult = await dbAsync.run(
          'UPDATE product_variants SET stock = stock - ? WHERE id = ? AND stock >= ?',
          [item.quantity, item.variant_id, item.quantity]
        );
        if (variantStockResult.changes === 0) {
          throw new Error(`產品變體 ${item.name} (${item.variant_value}) 庫存不足`);
        }
      } else {
        const productStockResult = await dbAsync.run(
          'UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?',
          [item.quantity, item.product_id, item.quantity]
        );
        if (productStockResult.changes === 0) {
          throw new Error(`產品 ${item.name} 庫存不足`);
        }
      }
    }

    await dbAsync.run('COMMIT');
    
    // 3. 發送Telegram通知 (成功後)
    try {
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

      if (botToken && chatId) {
        // 使用更新後的 orderDataForNotification
        await sendTelegramNotification(orderDataForNotification, botToken, chatId);
      }
    } catch (telegramError) {
      console.error('訂單已創建，但Telegram通知發送失敗:', telegramError);
    }

    res.json({ 
      success: true, 
      message: '訂單提交成功',
      orderId: orderId,
      orderNumber: orderNumber
    });

  } catch (error) {
    await dbAsync.run('ROLLBACK');
    console.error('提交訂單失敗，交易已回滾:', error);
    res.status(500).json({ error: error.message || '提交訂單失敗' });
  }
});

const sendTelegramNotification = async (orderData, botToken, chatId) => {
  try {
    const { orderNumber, customerInfo, items, totals, appliedCoupon } = orderData;
    
    const productList = items.map(item => {
      let productText = `• ${item.name} x${item.quantity} - NT$${item.total_price}`;
      if (item.variant_value) {
        productText += `\n  └ ${item.variant_type || '口味'}: ${item.variant_value}`;
      }
      return productText;
    }).join('\n');

    const message = `🛒 *新訂單通知*

📋 *訂單編號:* \`${orderNumber}\`
📅 *訂單時間:* ${new Date().toLocaleString('zh-TW')}

👤 *客戶資訊:*
• *姓名:* ${customerInfo.name}
• *電話:* \`${customerInfo.phone}\`
${customerInfo.lineId ? `• *Line ID:* ${customerInfo.lineId}` : ''}

🏪 *取貨門市:*
${customerInfo.storeName ? `• *店名:* ${customerInfo.storeName}` : ''}
${customerInfo.storeNumber ? `• *店號:* \`${customerInfo.storeNumber}\`` : ''}

🛍️ *訂購商品:*
${productList}

💰 *金額明細:*
• *商品小計:* NT$${totals.subtotal}
• *運費:* NT$${totals.shipping}
${appliedCoupon ? `• *優惠券:* ${appliedCoupon.coupon.code} (-NT$${totals.discount})` : ''}
• *總計:* *NT$${totals.finalTotal}*

請盡快處理此訂單！`;

    await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'Markdown'
      }),
    });

    console.log('Telegram通知發送成功！');
    return true;
  } catch (error) {
    console.error('Telegram通知發送失敗:', error);
    return false;
  }
};

module.exports = router;