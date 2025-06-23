const bcrypt = require('bcryptjs');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database/vape_store.db');
const db = new sqlite3.Database(dbPath);

async function resetAdmin() {
  try {
    const username = 'admin';
    const password = 'admin123';
    
    console.log('🔄 重置管理員帳戶...');
    
    // 刪除現有管理員
    await new Promise((resolve, reject) => {
      db.run('DELETE FROM admins WHERE username = ?', [username], function(err) {
        if (err) reject(err);
        else {
          console.log('🗑️ 已刪除舊管理員帳戶');
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
            console.log('✅ 新管理員帳戶創建成功！');
            resolve();
          }
        }
      );
    });
    
    // 驗證密碼
    const isValid = await bcrypt.compare(password, passwordHash);
    console.log('🔍 密碼驗證結果:', isValid ? '✅ 正確' : '❌ 錯誤');
    
    console.log('\n📋 登入資訊:');
    console.log('帳號:', username);
    console.log('密碼:', password);
    console.log('登入網址: http://localhost:5173/admin');
    
  } catch (error) {
    console.error('❌ 重置失敗:', error);
  } finally {
    db.close();
  }
}

resetAdmin();
