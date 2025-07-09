// 添加THE2、TOLETX、TOLET1品牌產品腳本
const sqlite3 = require('sqlite3').verbose();

// 只能在Railway生產環境執行
if (!process.env.RAILWAY_DEPLOYMENT_ID) {
  console.log('❌ 此腳本只能在Railway生產環境執行');
  process.exit(1);
}

const dbPath = '/app/data/vape_store.db';

console.log('🚀 開始添加THE2、TOLETX、TOLET1品牌產品...');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ 數據庫連接失敗:', err);
    process.exit(1);
  }
  console.log('✅ 數據庫連接成功');
});

// 定義要添加的產品數據
const productsToAdd = [
  {
    name: 'THE2樂兔3%(特洛伊改版新包裝)',
    brand: 'THE2',
    category: 'cartridge',
    price: 380,
    description: 'THE2樂兔3%煙彈，特洛伊改版新包裝，豐富口味選擇',
    image_url: '',
    stock: 20,
    variants: [
      '冰凍荔枝', '冰凍葡萄', '冰凍百香', '冰凍檸檬', '冰凍草莓',
      '冰凍奇異果', '冰凍泉水', '熱戀草莓', '葡萄果粒', '熱情百香',
      '醇香蜜瓜', '青青梅子', '紅心芭樂', '旺來鳳梨', '西瓜冰沙',
      '元氣蜜桃', '多汁蘋果', '黑松沙士', '跳跳可樂', '芬達橘子',
      '養樂多', '能量紅牛', '運動飲料', '蘇打冰棒', '冰鐵觀音',
      '蜜桃茶', '清爽薄荷', '古巴雪茄', '土耳其菸草'
    ]
  },
  {
    name: 'TOLETX3.5%',
    brand: 'TOLETX',
    category: 'cartridge',
    price: 420,
    description: 'TOLETX3.5%煙彈，高濃度口感，多種口味',
    image_url: '',
    stock: 20,
    variants: [
      '櫻花葡萄', '白玉山竹冰', '青提冰', '荔枝冰', '草莓冰',
      '西瓜冰', '水蜜桃冰', '芭樂冰', '香醇密瓜', '愛文芒果',
      '沙士冰', '可樂冰', '綠豆冰', '薄荷冰', '茉莉鐵觀音',
      '冰爽雪碧', '海鹽檸檬', '極冰礦泉水', '青蘋果', '藍莓果冰',
      '百香果冰', '鳳梨冰', '奇異果', '黑冰爆珠', '凍檸茶',
      '蘇打冰棒', '柳橙冰', '古巴雪茄(不涼)', '經典菸草(不涼)'
    ]
  },
  {
    name: 'TOLETX主機',
    brand: 'TOLETX',
    category: 'host',
    price: 750,
    description: 'TOLETX主機，精緻外觀設計，多色可選',
    image_url: '',
    stock: 20,
    variants: [
      '黑色', '白色', '流光銀', '流光藍'
    ]
  },
  {
    name: 'TOLET1拋棄式',
    brand: 'TOLET1',
    category: 'disposable',
    price: 180,
    description: 'TOLET1拋棄式電子煙，即開即用，多種口味',
    image_url: '',
    stock: 20,
    variants: [
      '葡萄', '芒果', '經典菸草', '柚子', '哈密瓜',
      '芭樂', '鐵觀音', '百香果', '檸檬海鹽', '薄荷',
      '莓果', '百香奇異果芭樂', '紅茶', '蘋果'
    ]
  },
  {
    name: 'TOLETX騎士鹽3.5%',
    brand: 'TOLETX',
    category: 'oil',
    price: 350,
    description: 'TOLETX騎士鹽3.5%煙油，高品質鹽類煙油',
    image_url: '',
    stock: 20,
    variants: [
      '櫻花葡萄', '白玉山竹冰', '青提冰', '荔枝冰', '草莓冰',
      '西瓜冰', '水蜜桃冰', '芭樂冰', '香醇密瓜', '愛文芒果',
      '沙士冰', '可樂冰', '綠豆冰', '薄荷冰', '茉莉鐵觀音',
      '冰爽雪碧', '海鹽檸檬', '極冰礦泉水', '青蘋果', '藍莓果冰',
      '百香果冰', '鳳梨冰', '奇異果', '黑冰爆珠', '凍檸茶',
      '蘇打冰棒', '柳橙冰', '古巴雪茄(不涼)'
    ]
  }
];

// 開始事務
db.serialize(() => {
  db.run('BEGIN TRANSACTION');
  
  let completedProducts = 0;
  const totalProducts = productsToAdd.length;
  
  productsToAdd.forEach((productData, index) => {
    console.log(`\n📦 正在添加產品 ${index + 1}/${totalProducts}: ${productData.name}`);
    
    // 插入產品
    db.run(`
      INSERT INTO products (name, category, brand, price, description, image_url, stock)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      productData.name,
      productData.category,
      productData.brand,
      productData.price,
      productData.description,
      productData.image_url,
      productData.stock
    ], function(err) {
      if (err) {
        console.error(`❌ 添加產品失敗: ${productData.name}`, err);
        db.run('ROLLBACK');
        process.exit(1);
      }
      
      const productId = this.lastID;
      console.log(`✅ 產品已創建，ID: ${productId}`);
      
      // 添加變體
      let completedVariants = 0;
      const totalVariants = productData.variants.length;
      
      productData.variants.forEach((variantValue, variantIndex) => {
        const variantType = productData.category === 'host' ? '顏色' : '口味';
        
        db.run(`
          INSERT INTO product_variants (product_id, variant_type, variant_value, stock, price_modifier)
          VALUES (?, ?, ?, ?, ?)
        `, [productId, variantType, variantValue, productData.stock, 0], function(err) {
          if (err) {
            console.error(`❌ 添加變體失敗: ${variantValue}`, err);
            db.run('ROLLBACK');
            process.exit(1);
          }
          
          completedVariants++;
          if (completedVariants === totalVariants) {
            console.log(`✅ ${productData.name} 的 ${totalVariants} 個變體已全部添加`);
            
            completedProducts++;
            if (completedProducts === totalProducts) {
              // 所有產品都已完成
              db.run('COMMIT', (err) => {
                if (err) {
                  console.error('❌ 提交事務失敗:', err);
                  process.exit(1);
                }
                
                console.log('\n🎉 所有產品添加完成！');
                console.log(`✅ 成功添加 ${totalProducts} 個產品`);
                
                // 顯示最終統計
                db.all(`
                  SELECT 
                    category,
                    COUNT(*) as count,
                    SUM(stock) as total_stock
                  FROM products 
                  GROUP BY category
                `, (err, rows) => {
                  if (err) {
                    console.error('❌ 查詢統計失敗:', err);
                  } else {
                    console.log('\n📊 更新後的產品統計:');
                    rows.forEach(row => {
                      const categoryName = {
                        'host': '主機',
                        'cartridge': '煙彈', 
                        'disposable': '拋棄式',
                        'oil': '煙油'
                      }[row.category] || row.category;
                      console.log(`  ${categoryName}: ${row.count}個產品, 總庫存: ${row.total_stock}`);
                    });
                  }
                  
                  // 顯示品牌統計
                  db.all(`
                    SELECT brand, COUNT(*) as count
                    FROM products 
                    GROUP BY brand
                    ORDER BY brand
                  `, (err, brands) => {
                    if (err) {
                      console.error('❌ 查詢品牌統計失敗:', err);
                    } else {
                      console.log('\n🏷️ 品牌統計:');
                      brands.forEach(brand => {
                        console.log(`  ${brand.brand}: ${brand.count}個產品`);
                      });
                    }
                    
                    db.close((err) => {
                      if (err) {
                        console.error('❌ 關閉數據庫失敗:', err);
                      } else {
                        console.log('✅ 數據庫連接已關閉');
                        console.log('🎊 新品牌產品上架完成！');
                      }
                    });
                  });
                });
              });
            }
          }
        });
      });
    });
  });
}); 