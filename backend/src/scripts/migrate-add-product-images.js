const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// 獲取數據庫路徑
const dbPath = process.env.RAILWAY_DEPLOYMENT_ID 
  ? '/app/data/vape_store.db'  // Railway 生產環境
  : path.join(__dirname, '../database/vape_store.db');  // 本地開發環境

console.log(`🔄 開始添加產品圖片表遷移...`);
console.log(`📁 數據庫路徑: ${dbPath}`);

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ 數據庫連接失敗:', err.message);
    process.exit(1);
  } else {
    console.log('✅ 成功連接到數據庫');
  }
});

// 封裝Promise方法
const dbAsync = {
  get: (sql, params = []) => {
    return new Promise((resolve, reject) => {
      db.get(sql, params, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  },

  all: (sql, params = []) => {
    return new Promise((resolve, reject) => {
      db.all(sql, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  },

  run: (sql, params = []) => {
    return new Promise((resolve, reject) => {
      db.run(sql, params, function(err) {
        if (err) {
          reject(err);
        } else {
          resolve(this);
        }
      });
    });
  }
};

const addProductImagesTable = async () => {
  try {
    console.log('🔄 開始添加產品圖片表...');
    
    await dbAsync.run('BEGIN TRANSACTION');
    
    // 檢查product_images表是否已存在
    const tableExists = await dbAsync.get(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name='product_images'
    `);
    
    if (tableExists) {
      console.log('✅ product_images表已存在，跳過創建');
      await dbAsync.run('ROLLBACK');
      return;
    }
    
    // 創建產品圖片表
    await dbAsync.run(`
      CREATE TABLE product_images (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_id INTEGER NOT NULL,
        image_url TEXT NOT NULL,
        sort_order INTEGER DEFAULT 0,
        is_primary BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE
      )
    `);
    
    console.log('✅ product_images表創建成功');
    
    // 創建索引
    await dbAsync.run(`
      CREATE INDEX IF NOT EXISTS idx_product_images_product_id 
      ON product_images(product_id)
    `);
    
    await dbAsync.run(`
      CREATE INDEX IF NOT EXISTS idx_product_images_sort_order 
      ON product_images(product_id, sort_order)
    `);
    
    console.log('✅ 索引創建成功');
    
    // 遷移現有產品的單張圖片到新表
    const productsWithImages = await dbAsync.all(`
      SELECT id, image_url FROM products 
      WHERE image_url IS NOT NULL AND image_url != ''
    `);
    
    console.log(`📋 發現 ${productsWithImages.length} 個產品有圖片需要遷移`);
    
    for (const product of productsWithImages) {
      await dbAsync.run(`
        INSERT INTO product_images (product_id, image_url, sort_order, is_primary)
        VALUES (?, ?, 0, 1)
      `, [product.id, product.image_url]);
    }
    
    console.log('✅ 現有產品圖片遷移完成');
    
    await dbAsync.run('COMMIT');
    console.log('🎉 產品圖片表遷移完成！');
    
  } catch (error) {
    await dbAsync.run('ROLLBACK');
    console.error('❌ 添加產品圖片表失敗:', error);
    throw error;
  } finally {
    db.close();
  }
};

// 導出函數供server.js調用
module.exports = addProductImagesTable;

// 如果直接運行此文件，則執行遷移
if (require.main === module) {
  addProductImagesTable().catch(console.error);
} 