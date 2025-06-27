const bcrypt = require('bcryptjs');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

console.log('🚀 Railway Admin 修復工具啟動');
console.log('=' .repeat(50));

// Railway 環境檢查
console.log('📊 環境變數檢查:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('DATABASE_PATH:', process.env.DATABASE_PATH);
console.log('FRONTEND_URL:', process.env.FRONTEND_URL);
console.log('JWT_SECRET:', process.env.JWT_SECRET ? '✅ 已設定' : '❌ 未設定');
console.log('VITE_SITE_URL:', process.env.VITE_SITE_URL);

// 使用 Railway 實際的數據庫路徑
const dbPath = process.env.DATABASE_PATH || '/app/data/vape_store.db';
console.log('\n🗄️ 數據庫配置:');
console.log('數據庫路徑:', dbPath);
console.log('文件是否存在:', fs.existsSync(dbPath));

// 如果是生產環境但數據庫不存在，嘗試創建目錄
if (process.env.NODE_ENV === 'production' && !fs.existsSync(dbPath)) {
  const dbDir = path.dirname(dbPath);
  console.log('📁 創建數據庫目錄:', dbDir);
  try {
    fs.mkdirSync(dbDir, { recursive: true });
    console.log('✅ 目錄創建成功');
  } catch (error) {
    console.error('❌ 目錄創建失敗:', error.message);
  }
}

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ 數據庫連接失敗:', err.message);
    process.exit(1);
  } else {
    console.log('✅ 數據庫連接成功');
  }
});

async function fixRailwayAdmin() {
  try {
    console.log('\n🔧 開始修復 Railway Admin...');
    
    // 1. 檢查 admins 表是否存在
    const tableExists = await new Promise((resolve, reject) => {
      db.get(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='admins'",
        (err, row) => {
          if (err) reject(err);
          else resolve(!!row);
        }
      );
    });
    
    console.log('admins 表存在:', tableExists ? '✅' : '❌');
    
    // 2. 如果表不存在，創建表
    if (!tableExists) {
      console.log('📋 創建 admins 表...');
      await new Promise((resolve, reject) => {
        db.run(`
          CREATE TABLE admins (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `, (err) => {
          if (err) reject(err);
          else {
            console.log('✅ admins 表創建成功');
            resolve();
          }
        });
      });
    }
    
    // 3. 檢查現有管理員
    const existingAdmins = await new Promise((resolve, reject) => {
      db.all('SELECT * FROM admins', (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
    
    console.log('現有管理員數量:', existingAdmins.length);
    existingAdmins.forEach(admin => {
      console.log(`- ID: ${admin.id}, 用戶名: ${admin.username}, 創建時間: ${admin.created_at}`);
    });
    
    // 4. 刪除現有的 admin 用戶
    const username = 'admin';
    const password = 'admin123';
    
    await new Promise((resolve, reject) => {
      db.run('DELETE FROM admins WHERE username = ?', [username], function(err) {
        if (err) reject(err);
        else {
          console.log(`🗑️ 刪除舊 admin 帳戶 (影響行數: ${this.changes})`);
          resolve();
        }
      });
    });
    
    // 5. 創建新的管理員帳戶
    console.log('🔐 生成新密碼哈希...');
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    
    const result = await new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO admins (username, password_hash, created_at) VALUES (?, ?, datetime("now"))',
        [username, passwordHash],
        function(err) {
          if (err) reject(err);
          else resolve(this);
        }
      );
    });
    
    console.log(`✅ 新管理員帳戶創建成功！ID: ${result.lastID}`);
    
    // 6. 驗證密碼
    const isValid = await bcrypt.compare(password, passwordHash);
    console.log('🔍 密碼驗證:', isValid ? '✅ 正確' : '❌ 錯誤');
    
    // 7. 最終確認
    const finalAdmin = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM admins WHERE username = ?', [username], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    if (finalAdmin) {
      console.log('\n🎉 修復完成！');
      console.log('=' .repeat(50));
      console.log('📋 Railway Admin 登入資訊:');
      console.log('🌐 管理頁面: https://deepvape.org/admin');
      console.log('👤 帳號:', username);
      console.log('🔑 密碼:', password);
      console.log('🆔 管理員 ID:', finalAdmin.id);
      console.log('📅 創建時間:', finalAdmin.created_at);
      console.log('=' .repeat(50));
    } else {
      console.log('❌ 管理員帳戶創建失敗');
    }
    
  } catch (error) {
    console.error('❌ 修復過程中發生錯誤:', error);
  } finally {
    db.close((err) => {
      if (err) {
        console.error('❌ 關閉數據庫連接失敗:', err.message);
      } else {
        console.log('🔐 數據庫連接已關閉');
      }
    });
  }
}

// 執行修復
fixRailwayAdmin(); 