const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Railway 生產環境路徑
const dbPath = process.env.DATABASE_PATH || '/app/data/vape_store.db';

console.log('🚀 Railway 生產環境數據庫遷移腳本');
console.log(`📍 數據庫路徑: ${dbPath}`);

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ 數據庫連接失敗:', err.message);
    process.exit(1);
  } else {
    console.log('✅ 成功連接到生產數據庫');
  }
});

// 封裝Promise方法
const dbAsync = {
  get: (sql, params = []) => {
    return new Promise((resolve, reject) => {
      db.get(sql, params, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
  },

  all: (sql, params = []) => {
    return new Promise((resolve, reject) => {
      db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  },

  run: (sql, params = []) => {
    return new Promise((resolve, reject) => {
      db.run(sql, params, function(err) {
        if (err) reject(err);
        else resolve(this);
      });
    });
  }
};

const addMissingColumns = async () => {
  try {
    console.log('🔄 檢查並添加遺失的欄位...');
    
    await dbAsync.run('BEGIN TRANSACTION');
    
    // 檢查現有表結構
    const tableInfo = await dbAsync.all(`PRAGMA table_info(products)`);
    console.log('📋 當前表結構:');
    tableInfo.forEach(col => {
      console.log(`   ${col.name}: ${col.type} ${col.notnull ? 'NOT NULL' : ''} ${col.dflt_value ? `DEFAULT ${col.dflt_value}` : ''}`);
    });
    
    const columns = tableInfo.map(col => col.name);
    const missingColumns = [];
    
    // 檢查遺失的欄位
    if (!columns.includes('is_discontinued')) {
      missingColumns.push('is_discontinued');
    }
    if (!columns.includes('coupon_excluded')) {
      missingColumns.push('coupon_excluded');
    }
    if (!columns.includes('shipping_excluded')) {
      missingColumns.push('shipping_excluded');
    }
    
    if (missingColumns.length === 0) {
      console.log('✅ 所有必要欄位都已存在');
      await dbAsync.run('COMMIT');
      return;
    }
    
    console.log(`📝 需要添加的欄位: ${missingColumns.join(', ')}`);
    
    // 添加遺失的欄位
    for (const column of missingColumns) {
      console.log(`🔧 添加欄位: ${column}`);
      await dbAsync.run(`
        ALTER TABLE products 
        ADD COLUMN ${column} BOOLEAN DEFAULT 0
      `);
      console.log(`✅ 成功添加 ${column} 欄位`);
    }
    
    await dbAsync.run('COMMIT');
    
    // 驗證結果
    const newTableInfo = await dbAsync.all(`PRAGMA table_info(products)`);
    console.log('\n📋 更新後的表結構:');
    newTableInfo.forEach(col => {
      console.log(`   ${col.name}: ${col.type} ${col.notnull ? 'NOT NULL' : ''} ${col.dflt_value ? `DEFAULT ${col.dflt_value}` : ''}`);
    });
    
    console.log('🎉 生產環境數據庫遷移完成！');
    
  } catch (error) {
    await dbAsync.run('ROLLBACK');
    console.error('❌ 遷移失敗:', error);
    throw error;
  } finally {
    db.close((err) => {
      if (err) {
        console.error('❌ 關閉數據庫連接失敗:', err);
      } else {
        console.log('✅ 數據庫連接已關閉');
      }
    });
  }
};

// 執行遷移
addMissingColumns()
  .then(() => {
    console.log('✅ Railway 遷移腳本執行完成');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Railway 遷移失敗:', error);
    process.exit(1);
  }); 