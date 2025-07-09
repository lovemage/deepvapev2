// 完整添加所有新產品腳本
const sqlite3 = require('sqlite3').verbose();

// 只能在Railway生產環境執行
if (!process.env.RAILWAY_DEPLOYMENT_ID) {
  console.log('❌ 此腳本只能在Railway生產環境執行');
  process.exit(1);
}

const dbPath = '/app/data/vape_store.db';

console.log('🚀 開始批量添加所有新產品...');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ 數據庫連接失敗:', err);
    process.exit(1);
  }
  console.log('✅ 數據庫連接成功');
});

// 定義要添加的所有產品數據
const productsToAdd = [
  // O2優氧系列
  {
    name: 'O2優氧4%',
    brand: 'O2優氧',
    category: 'cartridge',
    price: 350,
    description: 'O2優氧4%煙彈，多種口味選擇',
    image_url: '',
    stock: 20,
    variants: [
      '玫瑰花果茶', '櫻花氣泡水', '檸檬薄荷', '蜂蜜茉莉茶', '高山鐵觀音',
      '清甜蘋果', '冰涼荔枝', '拉拉山水蜜桃', '經典藍莓', '沁涼柳橙',
      '酷涼薄荷', '涼爽西瓜', '綠豆冰沙', '可樂氣泡', '繽紛蘇打',
      '果漾百香', '葡萄柚', '老冰棍', '檸檬紅茶', '草莓綠茶',
      '午夜雞尾酒', '海鹽檸檬糖', '紅心芭樂', '哈啾葡萄', '愛文芒果',
      '夕張哈密瓜', '蜜桃烏龍', '青梅冰沙', '沙士泡泡冰', '紅牛能量飲',
      '覆盆莓果', '金鑽鳳梨', '香醇菸草(不涼)', '藍莓菸草(不涼)', 
      '奶油菸草(不涼)', '太妃糖菸草(不涼)'
    ]
  },
  {
    name: 'O2優氧4%主機',
    brand: 'O2優氧',
    category: 'host',
    price: 800,
    description: 'O2優氧4%主機，多色可選',
    image_url: '',
    stock: 20,
    variants: [
      '亮黑', '灰色', '銀白', '天空藍', '珍珠白', '軍綠'
    ]
  },
  // KAMA系列
  {
    name: 'KAMA3%',
    brand: 'KAMA',
    category: 'oil',
    price: 280,
    description: 'KAMA3%煙油，豐富口味選擇',
    image_url: '',
    stock: 20,
    variants: [
      '桃桃仙子', '青提蘆薈(白葡萄)', '淡雪草莓', '莓果派對', '波波葡萄',
      '西瓜冰棒', '金星蘋果', '旺情鳳梨', '夏日芒果', '熱帶百香',
      '芭黎戀人(芭樂)', '兒時沙士', '思樂冰沙', '清新薄荷', '蜂蜜青柚',
      '冰川泉水', '純純蜂蜜', '茉香翡翠', '咖啡菸草', '黑巧菸草'
    ]
  },
  {
    name: 'KAMA3%主機',
    brand: 'KAMA',
    category: 'host',
    price: 650,
    description: 'KAMA3%主機，多色可選包含特仕版',
    image_url: '',
    stock: 20,
    variants: [
      '黑', '白', '灰', '粉金漸層', '藍漸層',
      '午夜黑-特仕版', '紳士藍-特仕版', '深墨綠-特仕版', 
      '淺海藍-特仕版', '奶茶粉-特仕版', '象牙白-特仕版'
    ]
  },
  {
    name: 'KAMA3%(2顆裝)',
    brand: 'KAMA',
    category: 'cartridge',
    price: 450,
    description: 'KAMA3%煙彈2顆裝，豐富口味選擇',
    image_url: '',
    stock: 20,
    variants: [
      '桃桃仙子', '青提蘆薈(白葡萄)', '淡雪草莓', '莓果派對', '波波葡萄',
      '西瓜冰棒', '金星蘋果', '旺情鳳梨', '夏日芒果', '熱帶百香',
      '芭黎戀人(芭樂)', '兒時沙士', '思樂冰沙', '清新薄荷', '蜂蜜青柚',
      '冰川泉水', '純純蜂蜜', '茉香翡翠', '咖啡菸草', '黑巧菸草'
    ]
  },
  // TROY系列
  {
    name: 'TROY粉筆灰3%',
    brand: 'TROY',
    category: 'oil',
    price: 320,
    description: 'TROY粉筆灰3%煙油，超多口味選擇',
    image_url: '',
    stock: 20,
    variants: [
      '極冰葡萄', '極冰草莓', '極冰百香果', '百香果', '葡萄',
      '白葡萄', '草莓', '水蜜桃', '蘋果', '西瓜',
      '哈密瓜', '荔枝', '奇異果', '芭樂', '橘子',
      '鳳梨', '櫻桃', '莓果', '藍莓', '蜜桃冰茶',
      '鐵觀音', '龍井茉莉', '紅茶', '檸檬水', '可樂',
      '紅牛', '沙士', '薄荷', '冰棍', '冰泉',
      '寶礦力', '養樂多', '彩虹糖', '檸檬愛玉', '芒果鳳梨',
      '三重芒果', '旺仔牛奶', '梅子冰', '古巴雪茄', '土耳其菸草'
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
                  
                  db.close((err) => {
                    if (err) {
                      console.error('❌ 關閉數據庫失敗:', err);
                    } else {
                      console.log('✅ 數據庫連接已關閉');
                      console.log('🎊 產品上架完成！現在可以在網站上看到這些新產品了');
                    }
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