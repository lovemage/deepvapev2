// =================================================================================================
// 警告：此腳本會清空並重置整個資料庫！
// 執行前請務必確認您了解其後果。
// 如果您確實需要重置資料庫，請手動移除下方清理數據區塊的註解。
// =================================================================================================

const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');
const { db, dbAsync } = require('../database/db');

const dbPath = path.join(__dirname, '../../database/vape_store.db');
const db = new sqlite3.Database(dbPath);

// 30種口味
const flavors = [
  '草莓', '芒果', '薄荷', '煙草', '香草', '藍莓', '蘋果', '西瓜', '葡萄', '櫻桃',
  '檸檬', '橘子', '桃子', '椰子', '咖啡', '巧克力', '蜂蜜', '奶油', '玫瑰', '薰衣草',
  '青檸', '柚子', '荔枝', '龍眼', '榴蓮', '百香果', '奇異果', '鳳梨', '葡萄柚', '覆盆子'
];

// 顏色選項
const colors = ['黑色', '白色', '銀色', '藍色', '紅色', '金色'];

const products = [
  // ... (產品數據保持不變)
];

const seed = async () => {
  try {
    console.log('⏳ 開始填充種子數據...');
    await dbAsync.run('BEGIN TRANSACTION');

    // 填充產品和變體
    for (const product of products) {
      const { variants, ...productData } = product;
      const result = await dbAsync.run(
        'INSERT INTO products (name, category, brand, price, description, image_url, stock) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [productData.name, productData.category, productData.brand, productData.price, productData.description, productData.image_url, productData.stock]
      );
      const productId = result.lastID;

      if (variants && variants.length > 0) {
        for (const variant of variants) {
          await dbAsync.run(
            'INSERT INTO product_variants (product_id, variant_type, variant_value, stock, price_modifier) VALUES (?, ?, ?, ?, ?)',
            [productId, variant.variant_type, variant.variant_value, variant.stock, variant.price_modifier || 0]
          );
        }
      }
    }
    console.log('✅ 產品數據填充完成');

    // ... (其他數據填充邏輯保持不變)

    await dbAsync.run('COMMIT');
    console.log('🎉 所有種子數據填充成功！');
  } catch (err) {
    await dbAsync.run('ROLLBACK');
    console.error('❌ 填充種子數據失敗:', err);
    throw err;
  }
};

// 如果直接運行此文件，則執行填充
if (require.main === module) {
  console.log('作為獨立腳本運行: seed-data.js');
  db.serialize(async () => {
    try {
      await seed();
    } catch (err) {
      console.error("Seed failed:", err);
    } finally {
      db.close((err) => {
        if (err) {
          return console.error('關閉數據庫連接失敗:', err.message);
        }
        console.log('✅ 數據庫連接已關閉');
      });
    }
  });
}
