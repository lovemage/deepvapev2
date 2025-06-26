const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// 數據庫路徑配置 - Railway Volume 兼容
let dbPath;
if (process.env.NODE_ENV === 'production') {
  // Railway 生產環境：使用 Volume 掛載路徑
  dbPath = process.env.DATABASE_PATH || '/app/data/vape_store.db';
} else {
  // 本地開發環境
  dbPath = path.join(__dirname, '../../database/vape_store.db');
}

// 確保數據庫目錄存在
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  try {
    fs.mkdirSync(dbDir, { recursive: true });
    console.log(`📁 創建數據庫目錄: ${dbDir}`);
  } catch (error) {
    console.error(`❌ 創建數據庫目錄失敗: ${error.message}`);
  }
}

console.log(`🗄️ 數據庫路徑: ${dbPath}`);
console.log(`🌍 運行環境: ${process.env.NODE_ENV || 'development'}`);
console.log(`📂 工作目錄: ${process.cwd()}`);
console.log(`🔧 DATABASE_PATH 環境變量: ${process.env.DATABASE_PATH || '未設置'}`);
console.log(`📁 數據庫目錄: ${dbDir}`);
console.log(`📋 目錄是否存在: ${fs.existsSync(dbDir)}`);

// 創建數據庫連接
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ 數據庫連接失敗:', err.message);
  } else {
    console.log('✅ 數據庫連接成功');
  }
});

// 設置外鍵約束
db.run('PRAGMA foreign_keys = ON');

// 測試數據庫連接
const testConnection = () => {
  return new Promise((resolve, reject) => {
    db.get('SELECT 1 as test', (err, row) => {
      if (err) {
        console.error('❌ 數據庫連接測試失敗:', err.message);
        reject(err);
      } else {
        console.log('✅ 數據庫連接測試成功');
        resolve(row);
      }
    });
  });
};

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

module.exports = { db, dbAsync, testConnection };
