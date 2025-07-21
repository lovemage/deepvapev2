const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// 使用與 db.js 相同的路徑邏輯
let dbPath;
if (process.env.NODE_ENV === 'production') {
  dbPath = process.env.DATABASE_PATH || '/app/data/vape_store.db';
} else {
  dbPath = path.join(__dirname, '../../database/vape_store.db');
}

console.log(`🔄 數據庫遷移: 添加 coupon_excluded 字段`);
console.log(`📍 數據庫路徑: ${dbPath}`);

const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  // 檢查字段是否已存在
  db.all("PRAGMA table_info(products)", (err, columns) => {
    if (err) {
      console.error('❌ 檢查表結構失敗:', err);
      return;
    }
    
    const hasCouponExcludedField = columns.some(col => col.name === 'coupon_excluded');
    
    if (hasCouponExcludedField) {
      console.log('✅ coupon_excluded 字段已存在，無需遷移');
      db.close();
      return;
    }
    
    console.log('📝 添加 coupon_excluded 字段...');
    
    // 添加字段
    db.run(`ALTER TABLE products ADD COLUMN coupon_excluded BOOLEAN DEFAULT 0`, (err) => {
      if (err) {
        console.error('❌ 添加字段失敗:', err);
      } else {
        console.log('✅ 成功添加 coupon_excluded 字段');
        
        // 驗證字段添加成功
        db.all("PRAGMA table_info(products)", (err, newColumns) => {
          if (err) {
            console.error('❌ 驗證失敗:', err);
          } else {
            const couponExcludedField = newColumns.find(col => col.name === 'coupon_excluded');
            if (couponExcludedField) {
              console.log('✅ 字段驗證成功:', couponExcludedField);
              console.log('🎉 數據庫遷移完成！');
            } else {
              console.error('❌ 字段驗證失敗');
            }
          }
          
          db.close((err) => {
            if (err) {
              console.error('❌ 關閉數據庫失敗:', err);
            } else {
              console.log('✅ 數據庫連接已關閉');
            }
          });
        });
      }
    });
  });
});
