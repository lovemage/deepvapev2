const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

let dbPath;

// 透過 Railway 提供的環境變量來判斷是否在 Railway 環境中運行
if (process.env.RAILWAY_DEPLOYMENT_ID) {
  console.log('🚂 檢測到 Railway 生產環境...');
  // 在 Railway 環境中，總是使用環境變量指定的路徑，默認為 Volume 路徑
  dbPath = process.env.DATABASE_PATH || '/app/data/vape_store.db';
  
  const volumeDbPath = dbPath;
  const sourceDbPath = path.join(__dirname, '../../database/vape_store.db');
  const volumeDir = path.dirname(volumeDbPath);

  // 確保 Volume 目錄存在
  if (!fs.existsSync(volumeDir)) {
    try {
      fs.mkdirSync(volumeDir, { recursive: true });
      console.log(`📁 [Volume] 創建數據庫目錄: ${volumeDir}`);
    } catch (error) {
      console.error(`❌ [Volume] 創建數據庫目錄失敗: ${error.message}`);
    }
  }
  
  // 確保圖片目錄也存在於 Volume 中
  const volumeImagesDir = '/app/data/images';
  if (!fs.existsSync(volumeImagesDir)) {
    try {
      fs.mkdirSync(volumeImagesDir, { recursive: true });
      console.log(`📁 [Volume] 創建圖片目錄: ${volumeImagesDir}`);
      
      // 複製現有圖片到 Volume（如果存在）
      const sourceImagesDir = path.join(__dirname, '../../public/images');
      if (fs.existsSync(sourceImagesDir)) {
        const copyImages = (src, dest) => {
          const items = fs.readdirSync(src);
          items.forEach(item => {
            const srcPath = path.join(src, item);
            const destPath = path.join(dest, item);
            const stat = fs.statSync(srcPath);
            
            if (stat.isDirectory()) {
              if (!fs.existsSync(destPath)) {
                fs.mkdirSync(destPath, { recursive: true });
              }
              copyImages(srcPath, destPath);
            } else if (stat.isFile() && /\.(jpg|jpeg|png|gif|webp)$/i.test(item)) {
              if (!fs.existsSync(destPath)) {
                fs.copyFileSync(srcPath, destPath);
                console.log(`📷 複製圖片: ${item}`);
              }
            }
          });
        };
        
        console.log('📋 開始複製圖片到 Volume...');
        copyImages(sourceImagesDir, volumeImagesDir);
        console.log('✅ 圖片複製完成');
      }
    } catch (error) {
      console.error(`❌ [Volume] 創建或複製圖片失敗: ${error.message}`);
    }
  }
  
  // 如果設置了 FORCE_DB_OVERWRITE，則強制從 repo 複製
  if (process.env.FORCE_DB_OVERWRITE === 'true' && fs.existsSync(sourceDbPath)) {
    try {
      console.log(`⚠️ 偵測到 FORCE_DB_OVERWRITE，強制從 repo 覆蓋數據庫...`);
      fs.copyFileSync(sourceDbPath, volumeDbPath);
      console.log(`✅ 成功強制覆蓋數據庫: ${volumeDbPath}`);
    } catch (err) {
      console.error(`❌ 強制覆蓋數據庫失敗: ${err.message}`);
    }
  } 
  // 否則，如果 Volume 中的數據庫不存在，則從 repo 複製初始數據庫
  else if (!fs.existsSync(volumeDbPath) && fs.existsSync(sourceDbPath)) {
    try {
      console.log(`📋 首次部署或數據庫丟失，正在從 repo 複製初始數據庫到 Volume...`);
      fs.copyFileSync(sourceDbPath, volumeDbPath);
      console.log(`✅ 成功複製初始數據庫到 Volume: ${volumeDbPath}`);
    } catch (err) {
      console.error(`❌ 複製數據庫失敗: ${err.message}`);
    }
  } else if (fs.existsSync(volumeDbPath)) {
     console.log(`✅ Volume 中的數據庫已存在，跳過複製: ${volumeDbPath}`);
  }
} else {
  console.log('💻 檢測到本地開發環境...');
  dbPath = path.join(__dirname, '../../database/vape_store.db');
}

// 確保數據庫目錄存在 (主要針對本地環境)
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
