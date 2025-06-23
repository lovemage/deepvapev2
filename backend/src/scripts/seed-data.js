// =================================================================================================
// 警告：此腳本會清空並重置整個資料庫！
// 執行前請務必確認您了解其後果。
// 如果您確實需要重置資料庫，請手動移除下方清理數據區塊的註解。
// =================================================================================================

const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');

const dbPath = path.join(__dirname, '../../database/vape_store.db');
const db = new sqlite3.Database(dbPath);

// 30種口味
const flavors = [
  '草莓', '芒果', '薄荷', '煙草', '香草', '藍莓', '蘋果', '西瓜', '葡萄', '櫻桃',
  '檸檬', '橘子', '桃子', '椰子', '咖啡', '巧克力', '蜂蜜', '奶油', '玫瑰', '薰衣草',
  '青檸', '柚子', '荔枝', '龍眼', '榴蓮', '百香果', '奇異果', '鳳梨', '葡萄柚', '覆盆子'
];

// 顏色選項
const colors = ['黑色', '白色', '銀色', '藍色', '紅色', '金色'];

db.serialize(async () => {
  // 清空現有數據
  console.log('🧹 清理現有數據... (已註解，如需執行請手動移除註解)');
  /*
  db.run('DELETE FROM cart_items');
  db.run('DELETE FROM product_variants');
  db.run('DELETE FROM products');
  db.run('DELETE FROM coupons');
  db.run('DELETE FROM announcements');
  db.run('DELETE FROM admins');
  */

  // 插入主機產品
  console.log('📱 創建主機產品...');
  const hostBrands = ['JUUL', 'IQOS', 'Vaporesso'];
  let productId = 1;

  for (const brand of hostBrands) {
    for (let i = 0; i < 3; i++) {
      const colorSet = colors.slice(i * 2, i * 2 + 3); // 每個品牌3種顏色
      const productName = `${brand} 主機`;
      const price = 1500 + Math.random() * 1000; // 1500-2500 價格區間
      
      db.run(`
        INSERT INTO products (id, name, category, brand, price, description, image_url, stock)
        VALUES (?, ?, 'host', ?, ?, ?, ?, ?)
      `, [
        productId,
        productName,
        brand,
        Math.round(price),
        `${brand} 品牌主機，高品質電子煙設備，支持多種煙彈。`,
        `/images/hosts/${brand.toLowerCase()}-${i + 1}.jpg`,
        50 + Math.floor(Math.random() * 50)
      ]);

      // 添加顏色變體
      colorSet.forEach((color, index) => {
        db.run(`
          INSERT INTO product_variants (product_id, variant_type, variant_value, stock, price_modifier)
          VALUES (?, 'color', ?, ?, ?)
        `, [productId, color, 20 + Math.floor(Math.random() * 30), index * 100]);
      });

      productId++;
    }
  }

  // 插入煙彈產品
  console.log('🚬 創建煙彈產品...');
  const cartridgeBrands = ['JUUL', 'IQOS', 'Vaporesso'];
  
  for (const brand of cartridgeBrands) {
    for (const flavor of flavors) {
      const productName = `${brand} ${flavor}煙彈`;
      const price = 300 + Math.random() * 200; // 300-500 價格區間
      
      db.run(`
        INSERT INTO products (id, name, category, brand, price, description, image_url, stock)
        VALUES (?, ?, 'cartridge', ?, ?, ?, ?, ?)
      `, [
        productId,
        productName,
        brand,
        Math.round(price),
        `${brand} ${flavor}口味煙彈，純正口感，適合${brand}主機使用。`,
        `/images/cartridges/${brand.toLowerCase()}-${flavor}.jpg`,
        30 + Math.floor(Math.random() * 70)
      ]);

      productId++;
    }
  }

  // 插入拋棄式電子煙產品
  console.log('💨 創建拋棄式電子煙產品...');
  const disposableBrands = ['Puff Bar', 'Hyde', 'Elf Bar'];
  
  for (const brand of disposableBrands) {
    for (const flavor of flavors) {
      const productName = `${brand} ${flavor}拋棄式電子煙`;
      const price = 200 + Math.random() * 150; // 200-350 價格區間
      
      db.run(`
        INSERT INTO products (id, name, category, brand, price, description, image_url, stock)
        VALUES (?, ?, 'disposable', ?, ?, ?, ?, ?)
      `, [
        productId,
        productName,
        brand,
        Math.round(price),
        `${brand} ${flavor}口味拋棄式電子煙，即開即用，攜帶方便。`,
        `/images/disposables/${brand.replace(' ', '').toLowerCase()}-${flavor}.jpg`,
        20 + Math.floor(Math.random() * 80)
      ]);

      productId++;
    }
  }

  // 插入優惠券
  console.log('🎫 創建優惠券...');
  const coupons = [
    { code: 'WELCOME10', type: 'percentage', value: 10, min_amount: 500, expires_at: '2025-12-31 23:59:59' },
    { code: 'SAVE50', type: 'fixed', value: 50, min_amount: 1000, expires_at: '2025-12-31 23:59:59' },
    { code: 'NEWUSER20', type: 'percentage', value: 20, min_amount: 800, expires_at: '2025-12-31 23:59:59' },
    { code: 'SUMMER15', type: 'percentage', value: 15, min_amount: 600, expires_at: '2025-08-31 23:59:59' }
  ];

  coupons.forEach(coupon => {
    db.run(`
      INSERT INTO coupons (code, type, value, min_amount, expires_at, is_active)
      VALUES (?, ?, ?, ?, ?, 1)
    `, [coupon.code, coupon.type, coupon.value, coupon.min_amount, coupon.expires_at]);
  });

  // 插入公告
  console.log('📢 創建網站公告...');
  const announcements = [
    {
      title: '歡迎來到電子煙專賣店',
      content: '我們提供各種品牌的高品質電子煙產品，歡迎選購！',
      type: 'info'
    },
    {
      title: '新用戶優惠',
      content: '新用戶註冊即可獲得20%折扣優惠券，使用代碼：NEWUSER20',
      type: 'promotion'
    },
    {
      title: '健康提醒',
      content: '請注意：電子煙產品含有尼古丁，未成年人禁止使用。',
      type: 'warning'
    }
  ];

  announcements.forEach(announcement => {
    db.run(`
      INSERT INTO announcements (title, content, type, is_active)
      VALUES (?, ?, ?, 1)
    `, [announcement.title, announcement.content, announcement.type]);
  });

  // 創建默認管理員用戶
  console.log('👤 創建管理員用戶...');
  const adminPassword = await bcrypt.hash('admin123', 10);
  db.run(`
    INSERT INTO admins (username, password_hash)
    VALUES ('admin', ?)
  `, [adminPassword]);

  console.log('✅ 示例數據創建完成！');
  console.log('📊 數據統計:');
  console.log(`   - 主機產品: ${hostBrands.length * 3} 個`);
  console.log(`   - 煙彈產品: ${cartridgeBrands.length * flavors.length} 個`);
  console.log(`   - 拋棄式電子煙: ${disposableBrands.length * flavors.length} 個`);
  console.log(`   - 優惠券: ${coupons.length} 個`);
  console.log(`   - 公告: ${announcements.length} 個`);
  console.log('   - 管理員用戶: admin/admin123');
});

db.close((err) => {
  if (err) {
    console.error('❌ 數據庫關閉失敗:', err.message);
  } else {
    console.log('✅ 數據庫連接已關閉');
  }
});
