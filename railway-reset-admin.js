const bcrypt = require('bcryptjs');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Railway 環境中的數據庫路徑
const dbPath = process.env.DATABASE_PATH || './backend/database/vape_store.db';
console.log('🔍 數據庫路徑:', dbPath);

const db = new sqlite3.Database(dbPath);

async function resetAdminForRailway() {
  try {
    const username = 'admin';
    const password = 'admin123';
    
    console.log('🔄 Railway 環境 - 重置管理員帳戶...');
    console.log('📍 環境:', process.env.NODE_ENV || 'development');
    console.log('🗄️ 數據庫:', dbPath);
    
    // 刪除現有管理員
    await new Promise((resolve, reject) => {
      db.run('DELETE FROM admins WHERE username = ?', [username], function(err) {
        if (err) reject(err);
        else {
          console.log('🗑️ 已刪除舊管理員帳戶 (影響行數:', this.changes, ')');
          resolve();
        }
      });
    });
    
    // 創建新密碼哈希
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    console.log('🔐 密碼哈希已生成');
    
    // 插入新管理員
    await new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO admins (username, password_hash, created_at) VALUES (?, ?, datetime("now"))',
        [username, passwordHash],
        function(err) {
          if (err) reject(err);
          else {
            console.log('✅ 新管理員帳戶創建成功！ID:', this.lastID);
            resolve();
          }
        }
      );
    });
    
    // 驗證密碼
    const isValid = await bcrypt.compare(password, passwordHash);
    console.log('🔍 密碼驗證結果:', isValid ? '✅ 正確' : '❌ 錯誤');
    
    // 檢查數據庫中的管理員
    await new Promise((resolve, reject) => {
      db.get('SELECT * FROM admins WHERE username = ?', [username], (err, row) => {
        if (err) reject(err);
        else if (row) {
          console.log('👤 管理員資料確認:');
          console.log('   ID:', row.id);
          console.log('   用戶名:', row.username);
          console.log('   創建時間:', row.created_at);
          resolve();
        } else {
          console.log('❌ 管理員帳戶未找到');
          resolve();
        }
      });
    });
    
    console.log('\n📋 Railway 登入資訊:');
    console.log('帳號:', username);
    console.log('密碼:', password);
    console.log('管理頁面: <你的Railway域名>/admin');
    
  } catch (error) {
    console.error('❌ 重置失敗:', error);
  } finally {
    db.close();
    console.log('🔐 數據庫連接已關閉');
  }
}

resetAdminForRailway(); 