const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../../database/vape_store.db');

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
          resolve({ id: this.lastID, changes: this.changes });
        }
      });
    });
  }
};

module.exports = { db, dbAsync, testConnection };
