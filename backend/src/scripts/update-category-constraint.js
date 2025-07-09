const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// 檢查是否在Railway生產環境
if (!process.env.RAILWAY_ENVIRONMENT || process.env.RAILWAY_ENVIRONMENT !== 'production') {
  console.log('❌ 此腳本僅能在Railway生產環境執行');
  console.log('🔒 為了保護開發端數據，已阻止執行');
  process.exit(1);
}

// 使用Railway生產環境的數據庫路徑
const dbPath = process.env.DATABASE_PATH || '/app/data/vape_store.db';
console.log(`🚂 Railway環境檢測通過，連接到生產數據庫: ${dbPath}`);

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ 數據庫連接失敗:', err.message);
    process.exit(1);
  } else {
    console.log('✅ 成功連接到Railway生產數據庫');
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

const updateCategoryConstraint = async () => {
  try {
    console.log('🔄 開始更新數據庫category約束...');
    
    await dbAsync.run('BEGIN TRANSACTION');
    
    // 先檢查現有的products表結構
    const tableInfo = await dbAsync.all(`PRAGMA table_info(products)`);
    console.log('📋 現有products表結構:');
    tableInfo.forEach(col => {
      console.log(`   ${col.name}: ${col.type} ${col.notnull ? 'NOT NULL' : ''} ${col.dflt_value ? `DEFAULT ${col.dflt_value}` : ''}`);
    });
    
    // 獲取現有數據
    const existingProducts = await dbAsync.all(`SELECT * FROM products`);
    console.log(`📦 現有產品數量: ${existingProducts.length}`);
    
    // 創建新的products表（包含oil分類）
    console.log('🔧 創建新的products表...');
    await dbAsync.run(`
      CREATE TABLE products_new (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        category TEXT NOT NULL CHECK (category IN ('host', 'cartridge', 'disposable', 'oil')),
        brand TEXT NOT NULL,
        price REAL NOT NULL,
        description TEXT,
        image_url TEXT,
        stock INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // 複製現有數據到新表
    console.log('📋 複製現有數據到新表...');
    for (const product of existingProducts) {
      await dbAsync.run(`
        INSERT INTO products_new (id, name, category, brand, price, description, image_url, stock, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [product.id, product.name, product.category, product.brand, product.price, product.description, product.image_url, product.stock, product.created_at]);
    }
    
    // 刪除舊表並重命名新表
    console.log('🔄 替換舊表...');
    await dbAsync.run(`DROP TABLE products`);
    await dbAsync.run(`ALTER TABLE products_new RENAME TO products`);
    
    // 重新創建索引（如果有的話）
    console.log('🔧 重新創建索引...');
    await dbAsync.run(`CREATE INDEX IF NOT EXISTS idx_products_category ON products(category)`);
    await dbAsync.run(`CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand)`);
    
    await dbAsync.run('COMMIT');
    
    console.log('✅ 數據庫category約束更新完成！');
    console.log('🎉 現在支援的產品分類: host, cartridge, disposable, oil');
    
    // 驗證更新
    const newTableInfo = await dbAsync.all(`PRAGMA table_info(products)`);
    console.log('📋 更新後的products表結構:');
    newTableInfo.forEach(col => {
      console.log(`   ${col.name}: ${col.type} ${col.notnull ? 'NOT NULL' : ''} ${col.dflt_value ? `DEFAULT ${col.dflt_value}` : ''}`);
    });
    
    // 檢查數據完整性
    const finalProductCount = await dbAsync.get(`SELECT COUNT(*) as count FROM products`);
    console.log(`📦 更新後產品數量: ${finalProductCount.count}`);
    
    if (finalProductCount.count === existingProducts.length) {
      console.log('✅ 數據完整性驗證通過！');
    } else {
      console.log('⚠️ 數據數量不匹配，請檢查！');
    }
    
  } catch (error) {
    await dbAsync.run('ROLLBACK');
    console.error('❌ 更新數據庫category約束失敗:', error);
    throw error;
  }
};

// 執行更新
db.serialize(async () => {
  try {
    await updateCategoryConstraint();
  } catch (err) {
    console.error("更新失敗:", err);
  } finally {
    db.close((err) => {
      if (err) {
        console.error('❌ 關閉數據庫失敗:', err);
      } else {
        console.log('✅ 數據庫連接已關閉');
      }
    });
  }
}); 