const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// 使用與 db.js 相同的路徑邏輯
let dbPath;
if (process.env.NODE_ENV === 'production') {
  dbPath = process.env.DATABASE_PATH || '/app/data/vape_store.db';
} else {
  dbPath = path.join(__dirname, '../../database/vape_store.db');
}

console.log(`🔄 恢復產品數據到: ${dbPath}`);

const db = new sqlite3.Database(dbPath);

// 您的原始 13 個產品數據
const products = [
  {
    id: 2,
    name: 'SP2一代主機',
    category: 'host',
    brand: 'SP2',
    price: 650,
    description: 'SP2主機內部帶有燈珠 可配合透明底座煙彈發光。震動提示、充電指示、自帶燈珠。功率：7W~8W 電容：400mAH 規格：通用一代煙彈產品 充電規格：TYPE-C｜5V/1A。【取件起七天內非人為因素保固換新】',
    image_url: '/images/sp2_device_main_showcase.jpg',
    stock: 79
  },
  {
    id: 190,
    name: 'ilia五代主機',
    category: 'host',
    brand: 'ilia',
    price: 450,
    description: '科技特色：最新智能芯片，提供穩定且高效的煙霧輸出。精確調節功率和溫度，適應不同口感需求。支持多種煙彈和線圈類型，輕鬆更換。高品質煙油，純正口感，味蕾享受。極致輕薄的機身設計，時尚外觀。符合人體工學的握持設計，手感舒適。大容量電池，長效續航，全天使用。快速充電技術，縮短充電時間。多重保護機制，過熱、短路、過充保護。採用環保無毒材料製造，健康安全。',
    image_url: '/images/ilia5_d.jpg',
    stock: 150
  },
  {
    id: 191,
    name: 'ilia6500口拋棄式',
    category: 'disposable',
    brand: 'ilia',
    price: 320,
    description: 'ILIA 拋棄式四代以其超大容量和豐富口味選擇，成為市場上的熱門產品。\n\n6500口大容量設計，13ML煙油，650mAh電池，TYPE-C充電，為您帶來持久的使用體驗。',
    image_url: '/images/iliabar4.jpg.webp',
    stock: 480
  },
  {
    id: 192,
    name: 'Lana 8000口拋棄式',
    category: 'disposable',
    brand: 'Lana',
    price: 450,
    description: '產品特色：8000口超長續航，持久使用。多種口味選擇，滿足不同需求。緊湊設計，攜帶方便。無需充電，即開即用。食品級材料，安全可靠。',
    image_url: '/images/lana_a8000.webp',
    stock: 400
  },
  {
    id: 193,
    name: 'HTA黑桃主機',
    category: 'host',
    brand: 'HTA',
    price: 350,
    description: 'HTA 黑桃主機 - 一代二代通用、350mAH電池、CP值極高',
    image_url: '/images/hta_spade_device.webp',
    stock: 140
  },
  {
    id: 194,
    name: 'Ilia 一代主機',
    category: 'host',
    brand: 'ilia',
    price: 650,
    description: 'Ilia 一代主機 - 經典設計，穩定可靠，新手首選',
    image_url: '/images/ilia_gen1_main_device.jpg',
    stock: 180
  },
  {
    id: 195,
    name: 'Ilia布紋主機',
    category: 'host',
    brand: 'ilia',
    price: 650,
    description: 'ILIA 哩亞布紋主機採用獨特的布紋外觀設計，結合現代工藝與經典美學。8W-10W可調功率，400mAh大容量電池，為您帶來卓越的使用體驗。精緻的布紋質感，舒適的握感，是品味與性能的完美結合。',
    image_url: '/images/ilia_fabric_device_main.png',
    stock: 160
  },
  {
    id: 196,
    name: 'Ilia皮革主機',
    category: 'host',
    brand: 'ilia',
    price: 750,
    description: 'ILIA 哩啞電子菸皮革主機，專為新科技愛好者精心設計結合，為您帶來一無二的電子菸體驗。這款電子菸不僅外觀時尚，還具有多種功能，讓每一次電子菸都成為享受。',
    image_url: '/images/ilia_leather_details.jpg',
    stock: 120
  },
  {
    id: 197,
    name: 'Ilia Ultra5 菸彈',
    category: 'cartridge',
    brand: 'ilia',
    price: 320,
    description: 'ILIA Ultra5 煙彈採用膠囊型包裝設計，黑色油杯外觀時尚，提供23種豐富口味選擇。單盒三顆入，五代通用設計，為您帶來極致口感與無縫體驗。',
    image_url: '/images/ilia-pod5.jpg',
    stock: 460
  },
  {
    id: 198,
    name: 'Lana Pods (煙彈)',
    category: 'cartridge',
    brand: 'Lana',
    price: 280,
    description: 'LANA 煙彈採用頂級陶瓷芯霧化技術，精選天然香料調配，帶來純淨濃郁的口感體驗。2ML大容量設計，每包2顆裝，讓您享受持久且順滑的使用感受。',
    image_url: '/images/lana_ceramic_pods_main.webp',
    stock: 700
  },
  {
    id: 199,
    name: 'HTA Pods (黑桃煙蛋)',
    category: 'cartridge',
    brand: 'HTA',
    price: 280,
    description: 'HTA 黑桃煙彈採用頂級煙油配方，提供 15 種精選口味選擇。每顆煙彈都經過嚴格品質控制，確保最佳的口感體驗和穩定的霧化效果。適用於 HTA 一代和二代主機，為您帶來尊貴的電子菸體驗。',
    image_url: '/images/hta_spade_pods.webp',
    stock: 300
  },
  {
    id: 200,
    name: 'Ilia (發光煙彈)',
    category: 'cartridge',
    brand: 'ilia',
    price: 300,
    description: 'ILIA 發光煙彈採用獨特的透明外殼設計，內建炫彩發光系統，吸食時會發出絢麗光芒。29種豐富口味選擇，每盒3顆裝，2.5ml大容量。',
    image_url: '/images/ilia-pods.webp',
    stock: 580
  },
  {
    id: 201,
    name: 'SP2 (思博瑞煙彈)',
    category: 'cartridge',
    brand: 'SP2',
    price: 350,
    description: 'SP2 Pods - 2.0ML大容量設計，3%尼古丁含量，一盒三入裝，優質霧化體驗，食品級材質安全。',
    image_url: '/images/sp2_pods_main.webp',
    stock: 720
  }
];

db.serialize(() => {
  console.log('📦 開始恢復產品數據...');
  
  products.forEach(product => {
    db.run(`
      INSERT OR REPLACE INTO products (id, name, category, brand, price, description, image_url, stock, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `, [product.id, product.name, product.category, product.brand, product.price, product.description, product.image_url, product.stock],
    function(err) {
      if (err) {
        console.error(`❌ 恢復產品失敗 ${product.name}:`, err);
      } else {
        console.log(`✅ 恢復產品: ${product.name} (ID: ${product.id})`);
      }
    });
  });

  // 恢復系統設置
  console.log('⚙️ 恢復系統設置...');
  const settings = [
    ['show_product_reviews', 'true'],
    ['show_product_preview', 'true'],
    ['free_shipping_threshold', '1000'],
    ['hero_image_url', '/images/itay-kabalo-b3sel60dv8a-unsplash.jpg']
  ];

  settings.forEach(([key, value]) => {
    db.run(`
      INSERT OR REPLACE INTO system_settings (key, value, updated_at)
      VALUES (?, ?, datetime('now'))
    `, [key, value], function(err) {
      if (err) {
        console.error(`❌ 設置 ${key} 失敗:`, err);
      } else {
        console.log(`✅ 恢復設置: ${key} = ${value}`);
      }
    });
  });
});

// 關閉數據庫連接
setTimeout(() => {
  db.close((err) => {
    if (err) {
      console.error('❌ 關閉數據庫失敗:', err);
    } else {
      console.log('✅ 產品數據恢復完成！');
    }
  });
}, 2000);
