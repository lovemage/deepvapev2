const bcrypt = require('bcryptjs');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

console.log('🔍 Railway Admin 檢查工具');
console.log('=' .repeat(50));

// Railway 環境檢查
console.log('📊 環境變數檢查:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('DATABASE_PATH:', process.env.DATABASE_PATH);
console.log('JWT_SECRET:', process.env.JWT_SECRET ? '✅ 已設定' : '❌ 未設定');

// 使用 Railway 實際的數據庫路徑
const dbPath = process.env.DATABASE_PATH || '/app/data/vape_store.db';
console.log('\n🗄️ 數據庫配置:');
console.log('數據庫路徑:', dbPath);
console.log('文件是否存在:', fs.existsSync(dbPath));

if (!fs.existsSync(dbPath)) {
  console.log('❌ 數據庫文件不存在！');
  process.exit(1);
}

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ 數據庫連接失敗:', err.message);
    process.exit(1);
  } else {
    console.log('✅ 數據庫連接成功');
  }
});

async function checkAdminStatus() {
  try {
    console.log('\n🔧 檢查管理員狀態...');
    
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
    
    console.log('👤 admins 表存在:', tableExists ? '✅' : '❌');
    
    if (!tableExists) {
      console.log('❌ admins 表不存在，需要初始化數據庫');
      return;
    }
    
    // 2. 檢查現有管理員
    const existingAdmins = await new Promise((resolve, reject) => {
      db.all('SELECT * FROM admins', (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
    
    console.log('\n👥 現有管理員列表:');
    console.log('管理員數量:', existingAdmins.length);
    
    if (existingAdmins.length === 0) {
      console.log('❌ 沒有管理員帳戶');
      return;
    }
    
    existingAdmins.forEach((admin, index) => {
      console.log(`${index + 1}. ID: ${admin.id}, 用戶名: ${admin.username}, 創建時間: ${admin.created_at}`);
    });
    
    // 3. 測試 admin/admin123 登入
    const adminUser = existingAdmins.find(admin => admin.username === 'admin');
    
    if (adminUser) {
      console.log('\n🔐 測試 admin 帳戶密碼...');
      const testPassword = 'admin123';
      const isValid = await bcrypt.compare(testPassword, adminUser.password_hash);
      console.log('密碼 "admin123" 驗證結果:', isValid ? '✅ 正確' : '❌ 錯誤');
      
      if (!isValid) {
        console.log('🔧 建議執行: node railway-admin-fix.js 來重設密碼');
      }
    } else {
      console.log('\n❌ 沒有找到用戶名為 "admin" 的帳戶');
      console.log('🔧 建議執行: node railway-admin-fix.js 來創建管理員');
    }
    
    // 4. 檢查其他重要表
    console.log('\n📋 檢查其他數據表:');
    const tables = ['products', 'coupons', 'announcements', 'system_settings'];
    
    for (const tableName of tables) {
      const tableExists = await new Promise((resolve, reject) => {
        db.get(
          "SELECT name FROM sqlite_master WHERE type='table' AND name=?",
          [tableName],
          (err, row) => {
            if (err) reject(err);
            else resolve(!!row);
          }
        );
      });
      
      if (tableExists) {
        const count = await new Promise((resolve, reject) => {
          db.get(`SELECT COUNT(*) as count FROM ${tableName}`, (err, row) => {
            if (err) reject(err);
            else resolve(row.count);
          });
        });
        console.log(`✅ ${tableName}: ${count} 筆記錄`);
      } else {
        console.log(`❌ ${tableName}: 表不存在`);
      }
    }
    
  } catch (error) {
    console.error('❌ 檢查過程中發生錯誤:', error);
  } finally {
    db.close((err) => {
      if (err) {
        console.error('❌ 關閉數據庫連接失敗:', err.message);
      } else {
        console.log('\n🔐 檢查完成，數據庫連接已關閉');
      }
    });
  }
}

// 執行檢查
checkAdminStatus(); 