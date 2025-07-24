const sqlite3 = require('sqlite3').verbose();
const path = require('path');

let dbPath;

if (process.env.RAILWAY_DEPLOYMENT_ID) {
  // Railway 生產環境
  dbPath = process.env.DATABASE_PATH || '/app/data/vape_store.db';
} else {
  // 本地環境
  dbPath = path.join(__dirname, '../../database/vape_store.db');
}

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ 數據庫連接失敗:', err.message);
    process.exit(1);
  } else {
    console.log('✅ 成功連接到數據庫');
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

const addCouponExcludedColumn = async () => {
  try {
    console.log('🔄 開始添加 coupon_excluded 字段到 products 表...');
    
    await dbAsync.run('BEGIN TRANSACTION');
    
    // 先檢查字段是否已經存在
    const tableInfo = await dbAsync.all(`PRAGMA table_info(products)`);
    const hasCouponExcludedField = tableInfo.some(col => col.name === 'coupon_excluded');
    
    if (hasCouponExcludedField) {
      console.log('✅ coupon_excluded 字段已存在，跳過遷移');
      await dbAsync.run('COMMIT');
      return;
    }
    
    // 添加 coupon_excluded 字段
    await dbAsync.run(`
      ALTER TABLE products 
      ADD COLUMN coupon_excluded BOOLEAN DEFAULT 0
    `);
    
    console.log('✅ 成功添加 coupon_excluded 字段');
    
    // 驗證字段是否添加成功
    const newTableInfo = await dbAsync.all(`PRAGMA table_info(products)`);
    const couponExcludedField = newTableInfo.find(col => col.name === 'coupon_excluded');
    
    if (couponExcludedField) {
      console.log('✅ 字段添加驗證成功');
      console.log(`   字段類型: ${couponExcludedField.type}`);
      console.log(`   默認值: ${couponExcludedField.dflt_value}`);
    } else {
      throw new Error('字段添加驗證失敗');
    }
    
    await dbAsync.run('COMMIT');
    console.log('🎉 coupon_excluded 字段遷移完成！');
    
  } catch (error) {
    await dbAsync.run('ROLLBACK');
    console.error('❌ 添加 coupon_excluded 字段失敗:', error);
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

// 如果直接運行此腳本，執行遷移
if (require.main === module) {
  addCouponExcludedColumn()
    .then(() => {
      console.log('✅ 遷移腳本執行完成');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ 遷移失敗:', error);
      process.exit(1);
    });
}

module.exports = addCouponExcludedColumn;
