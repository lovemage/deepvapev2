const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');

// 強制管理員重設腳本
async function forceAdminReset() {
  console.log('🚨 強制執行管理員重設...');
  
  // 使用生產環境數據庫路徑
  const dbPath = process.env.DATABASE_PATH || '/app/data/vape_store.db';
  console.log('📍 數據庫路徑:', dbPath);
  
  const db = new sqlite3.Database(dbPath);
  
  return new Promise((resolve, reject) => {
    db.serialize(async () => {
      try {
        // 確保 admins 表存在
        db.run(`
          CREATE TABLE IF NOT EXISTS admins (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `, (err) => {
          if (err) {
            console.error('❌ 創建 admins 表失敗:', err);
            return reject(err);
          }
          console.log('✅ admins 表已確保存在');
        });
        
        // 刪除所有現有管理員
        db.run('DELETE FROM admins', (err) => {
          if (err) {
            console.error('❌ 清空 admins 表失敗:', err);
            return reject(err);
          }
          console.log('🗑️ 已清空現有管理員');
        });
        
        // 創建新管理員
        const hashedPassword = await bcrypt.hash('admin123', 10);
        db.run(
          'INSERT INTO admins (username, password_hash) VALUES (?, ?)',
          ['admin', hashedPassword],
          function(err) {
            if (err) {
              console.error('❌ 創建管理員失敗:', err);
              return reject(err);
            }
            console.log('✅ 管理員已創建，ID:', this.lastID);
            
            // 驗證創建結果
            db.all('SELECT * FROM admins', (err, rows) => {
              if (err) {
                console.error('❌ 查詢管理員失敗:', err);
                return reject(err);
              }
              console.log('📋 當前管理員:', rows);
              
              // 測試密碼
              bcrypt.compare('admin123', hashedPassword, (compareErr, isValid) => {
                if (compareErr) {
                  console.error('❌ 密碼驗證失敗:', compareErr);
                  return reject(compareErr);
                }
                console.log('🔍 密碼驗證結果:', isValid ? '✅ 正確' : '❌ 錯誤');
                
                db.close((closeErr) => {
                  if (closeErr) {
                    console.error('❌ 數據庫關閉失敗:', closeErr);
                    return reject(closeErr);
                  }
                  console.log('🎉 管理員重設完成！');
                  console.log('📋 登入資訊:');
                  console.log('  帳號: admin');
                  console.log('  密碼: admin123');
                  resolve();
                });
              });
            });
          }
        );
      } catch (error) {
        console.error('❌ 重設過程失敗:', error);
        db.close();
        reject(error);
      }
    });
  });
}

// 如果通過環境變數觸發或直接執行
if (process.env.FORCE_ADMIN_RESET === 'true' || require.main === module) {
  forceAdminReset().catch(console.error);
}

module.exports = forceAdminReset; 