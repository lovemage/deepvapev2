const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// 檢查是否在Railway生產環境
if (!process.env.RAILWAY_ENVIRONMENT || process.env.RAILWAY_ENVIRONMENT !== 'production') {
  console.log('❌ 此腳本僅能在Railway生產環境執行');
  console.log('🔒 為了保護開發端數據，已阻止執行');
  process.exit(1);
}

// 使用Railway生產環境的數據庫路徑
const dbPath = process.env.DATABASE_PATH || '/app/data/vape_store.db';
console.log(`🚂 Railway環境檢測通過，連接到生產數據庫: ${dbPath}`);

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ 數據庫連接失敗:', err.message);
    process.exit(1);
  } else {
    console.log('✅ 成功連接到Railway生產數據庫');
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

// O2優氧4%煙油產品數據
const productData = {
  name: 'O2優氧4%',
  category: 'oil',
  brand: 'O2優氧',
  price: 350, // 假設價格，您可以調整
  description: 'O2優氧4%尼古丁煙油，提供36種豐富口味選擇，適合各種電子煙設備使用。',
  image_url: '/photo_2025-07-09 23.00.40.jpeg',
  stock: 20
};

// 36個口味變體
const flavors = [
  '玫瑰花果茶',
  '櫻花氣泡水',
  '檸檬薄荷',
  '蜂蜜茉莉茶',
  '高山鐵觀音',
  '清甜蘋果',
  '冰涼荔枝',
  '拉拉山水蜜桃',
  '經典藍莓',
  '沁涼柳橙',
  '酷涼薄荷',
  '涼爽西瓜',
  '綠豆冰沙',
  '可樂氣泡',
  '繽紛蘇打',
  '果漾百香',
  '葡萄柚',
  '老冰棍',
  '檸檬紅茶',
  '草莓綠茶',
  '午夜雞尾酒',
  '海鹽檸檬糖',
  '紅心芭樂',
  '哈啾葡萄',
  '愛文芒果',
  '夕張哈密瓜',
  '蜜桃烏龍',
  '青梅冰沙',
  '沙士泡泡冰',
  '紅牛能量飲',
  '覆盆莓果',
  '金鑽鳳梨',
  '香醇菸草(不涼）',
  '藍莓菸草（不涼）',
  '奶油菸草（不涼）',
  '太妃糖菸草（不涼）'
];

const addO2OilProduct = async () => {
  try {
    console.log('🔄 開始上架O2優氧4%煙油產品...');
    
    await dbAsync.run('BEGIN TRANSACTION');
    
    // 檢查產品是否已存在
    const existingProduct = await dbAsync.get(`
      SELECT id FROM products WHERE name = ? AND brand = ?
    `, [productData.name, productData.brand]);
    
    if (existingProduct) {
      console.log('⚠️ 產品已存在，將更新現有產品...');
      
      // 更新產品信息
      await dbAsync.run(`
        UPDATE products 
        SET category = ?, price = ?, description = ?, image_url = ?, stock = ?
        WHERE id = ?
      `, [productData.category, productData.price, productData.description, productData.image_url, productData.stock, existingProduct.id]);
      
      // 刪除現有變體
      await dbAsync.run(`
        DELETE FROM product_variants WHERE product_id = ?
      `, [existingProduct.id]);
      
      productId = existingProduct.id;
      console.log(`✅ 更新產品: ${productData.name} (ID: ${productId})`);
    } else {
      // 創建新產品
      const result = await dbAsync.run(`
        INSERT INTO products (name, category, brand, price, description, image_url, stock)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [productData.name, productData.category, productData.brand, productData.price, productData.description, productData.image_url, productData.stock]);
      
      productId = result.lastID;
      console.log(`✅ 創建產品: ${productData.name} (ID: ${productId})`);
    }
    
    // 添加口味變體
    console.log('🎨 開始添加口味變體...');
    let addedVariants = 0;
    
    for (const flavor of flavors) {
      await dbAsync.run(`
        INSERT INTO product_variants (product_id, variant_type, variant_value, stock, price_modifier)
        VALUES (?, ?, ?, ?, ?)
      `, [productId, 'flavor', flavor, 20, 0]);
      
      addedVariants++;
      console.log(`   ✅ 添加口味: ${flavor}`);
    }
    
    await dbAsync.run('COMMIT');
    
    console.log(`🎉 O2優氧4%煙油產品上架完成！`);
    console.log(`📊 統計:`);
    console.log(`   - 產品ID: ${productId}`);
    console.log(`   - 產品名稱: ${productData.name}`);
    console.log(`   - 品牌: ${productData.brand}`);
    console.log(`   - 價格: NT$${productData.price}`);
    console.log(`   - 庫存: ${productData.stock}`);
    console.log(`   - 口味變體: ${addedVariants}個`);
    
    // 顯示更新後的產品種類統計
    const categoryStats = await dbAsync.all(`
      SELECT category, COUNT(*) as count 
      FROM products 
      GROUP BY category
    `);
    
    console.log('📊 更新後的產品種類統計:');
    categoryStats.forEach(stat => {
      const categoryName = {
        'host': '主機',
        'cartridge': '煙彈',
        'disposable': '拋棄式',
        'oil': '煙油'
      }[stat.category] || stat.category;
      
      console.log(`   ${categoryName}: ${stat.count} 個產品`);
    });
    
  } catch (error) {
    await dbAsync.run('ROLLBACK');
    console.error('❌ 上架O2優氧4%煙油產品失敗:', error);
    throw error;
  }
};

// 執行上架
db.serialize(async () => {
  try {
    await addO2OilProduct();
  } catch (err) {
    console.error("上架失敗:", err);
  } finally {
    db.close((err) => {
      if (err) {
        console.error('❌ 關閉數據庫失敗:', err);
      } else {
        console.log('✅ 數據庫連接已關閉');
      }
    });
  }
}); 