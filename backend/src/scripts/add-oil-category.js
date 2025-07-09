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

const addOilCategory = async () => {
  try {
    console.log('🔄 開始添加煙油產品種類...');
    
    // 檢查現有的產品種類
    const existingCategories = await dbAsync.all(`
      SELECT DISTINCT category FROM products
    `);
    
    console.log('📋 現有產品種類:', existingCategories.map(c => c.category));
    
    // 檢查是否已有煙油種類的產品
    const oilProducts = await dbAsync.all(`
      SELECT * FROM products WHERE category = 'oil'
    `);
    
    if (oilProducts.length > 0) {
      console.log('ℹ️ 煙油種類已存在，包含以下產品:');
      oilProducts.forEach(product => {
        console.log(`   - ${product.name} (ID: ${product.id})`);
      });
    } else {
      console.log('✅ 煙油種類準備就緒，可以開始添加煙油產品');
    }
    
    // 顯示所有種類統計
    const categoryStats = await dbAsync.all(`
      SELECT category, COUNT(*) as count 
      FROM products 
      GROUP BY category
    `);
    
    console.log('📊 產品種類統計:');
    categoryStats.forEach(stat => {
      const categoryName = {
        'host': '主機',
        'cartridge': '煙彈',
        'disposable': '拋棄式',
        'oil': '煙油'
      }[stat.category] || stat.category;
      
      console.log(`   ${categoryName}: ${stat.count} 個產品`);
    });
    
    console.log('🎉 煙油種類添加完成！現在可以開始添加煙油產品了');
    
  } catch (error) {
    console.error('❌ 添加煙油種類失敗:', error);
    throw error;
  }
};

// 執行添加煙油種類
db.serialize(async () => {
  try {
    await addOilCategory();
  } catch (err) {
    console.error("添加煙油種類失敗:", err);
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