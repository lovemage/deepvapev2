const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { db, dbAsync } = require('../database/db');
const bcrypt = require('bcryptjs');

// `db` is already imported, so we don't create a new connection here.

const createTables = async () => {
  console.log('正在創建數據庫表...');
  try {
    await dbAsync.run('BEGIN TRANSACTION');

    // 產品表
    await dbAsync.run(`
      CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        category TEXT NOT NULL CHECK(category IN ('host', 'cartridge', 'disposable')),
        brand TEXT NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        description TEXT,
        image_url TEXT,
        stock INTEGER DEFAULT 0,
        is_discontinued BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 產品變體表
    await dbAsync.run(`
      CREATE TABLE IF NOT EXISTS product_variants (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_id INTEGER NOT NULL,
        variant_type TEXT NOT NULL,
        variant_value TEXT NOT NULL,
        stock INTEGER DEFAULT 0,
        price_modifier DECIMAL(10,2) DEFAULT 0,
        FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE
      )
    `);

    // 購物車表
    await dbAsync.run(`
      CREATE TABLE IF NOT EXISTS cart_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id TEXT NOT NULL,
        product_id INTEGER NOT NULL,
        variant_id INTEGER,
        quantity INTEGER NOT NULL DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE,
        FOREIGN KEY (variant_id) REFERENCES product_variants (id) ON DELETE CASCADE
      )
    `);

    // 優惠券表
    await dbAsync.run(`
      CREATE TABLE IF NOT EXISTS coupons (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        code TEXT UNIQUE NOT NULL,
        type TEXT NOT NULL CHECK(type IN ('percentage', 'fixed')),
        value DECIMAL(10,2) NOT NULL,
        min_amount DECIMAL(10,2) DEFAULT 0,
        expires_at DATETIME,
        is_active INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 公告表
    await dbAsync.run(`
      CREATE TABLE IF NOT EXISTS announcements (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        type TEXT NOT NULL CHECK(type IN ('info', 'warning', 'promotion')),
        is_active INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 管理員表
    await dbAsync.run(`
      CREATE TABLE IF NOT EXISTS admins (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 系統設置表
    await dbAsync.run(`
      CREATE TABLE IF NOT EXISTS system_settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        key TEXT UNIQUE NOT NULL,
        value TEXT NOT NULL,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 插入默認系統設置
    await dbAsync.run(`
      INSERT OR IGNORE INTO system_settings (key, value) VALUES
      ('free_shipping_threshold', '1000'),
      ('telegram_bot_token', ''),
      ('telegram_chat_id', ''),
      ('hero_image_url', '/images/itay-kabalo-b3sel60dv8a-unsplash.jpg'),
      ('show_product_reviews', 'true'),
      ('show_product_preview', 'true')
    `);

    // 訂單表
    await dbAsync.run(`
      CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_number TEXT,
        customer_name TEXT NOT NULL,
        customer_phone TEXT NOT NULL,
        customer_line_id TEXT,
        shipping_method TEXT,
        shipping_store_name TEXT,
        shipping_store_number TEXT,
        subtotal DECIMAL(10, 2) NOT NULL,
        shipping_fee DECIMAL(10, 2) NOT NULL,
        discount DECIMAL(10, 2) DEFAULT 0,
        total_amount DECIMAL(10, 2) NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        coupon_code TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 訂單項目表
    await dbAsync.run(`
      CREATE TABLE IF NOT EXISTS order_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id INTEGER NOT NULL,
        product_id INTEGER NOT NULL,
        variant_id INTEGER,
        quantity INTEGER NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        product_name TEXT NOT NULL,
        variant_value TEXT,
        FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE SET NULL,
        FOREIGN KEY (variant_id) REFERENCES product_variants (id) ON DELETE SET NULL
      )
    `);

    await dbAsync.run('COMMIT');
    console.log('✅ 數據庫表創建成功！');
  } catch (err) {
    await dbAsync.run('ROLLBACK');
    console.error('❌ 創建數據庫表失敗:', err);
    throw err; // 拋出錯誤以便上層捕獲
  }
};

const initializeDatabase = async () => {
  try {
    await createTables();
    
    // 檢查並創建默認管理員
    const adminRow = await dbAsync.get('SELECT COUNT(*) as count FROM admins');
    if (adminRow.count === 0) {
      console.log('👤 檢測到無管理員帳戶，正在創建默認管理員...');
      const hashedPassword = await bcrypt.hash(process.env.ADMIN_INITIAL_PASSWORD || 'admin123', 10);
      await dbAsync.run(
        'INSERT INTO admins (username, password_hash) VALUES (?, ?)',
        [process.env.ADMIN_USERNAME || 'admin', hashedPassword]
      );
      console.log('✅ 默認管理員已創建。');
    }
  } catch (err) {
    console.error('❌ 數據庫初始化檢查失敗:', err);
    throw err;
  }
};

module.exports = initializeDatabase;

if (require.main === module) {
  console.log('作為獨立腳本運行: init-database.js');
  db.serialize(async () => {
    await initializeDatabase();
    
    // 直接運行時，可以關閉連接
    db.close((err) => {
      if (err) {
        return console.error('關閉數據庫連接失敗:', err.message);
      }
      console.log('✅ 數據庫連接已關閉');
    });
  });
}
