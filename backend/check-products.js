// 檢查當前產品狀況腳本
const sqlite3 = require('sqlite3').verbose();

// 只能在Railway生產環境執行
if (!process.env.RAILWAY_DEPLOYMENT_ID) {
  console.log('❌ 此腳本只能在Railway生產環境執行');
  process.exit(1);
}

const dbPath = '/app/data/vape_store.db';

console.log('🔍 檢查當前產品狀況...');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ 數據庫連接失敗:', err);
    process.exit(1);
  }
  console.log('✅ 數據庫連接成功');
});

// 檢查產品統計
db.all(`
  SELECT 
    category,
    COUNT(*) as count,
    SUM(stock) as total_stock
  FROM products 
  GROUP BY category
`, (err, rows) => {
  if (err) {
    console.error('❌ 查詢失敗:', err);
    process.exit(1);
  }
  
  console.log('\n📊 產品分類統計:');
  rows.forEach(row => {
    console.log(`  ${row.category}: ${row.count}個產品, 總庫存: ${row.total_stock}`);
  });
  
  // 檢查所有產品列表
  db.all(`
    SELECT id, name, category, brand, stock, price
    FROM products 
    ORDER BY category, id
  `, (err, products) => {
    if (err) {
      console.error('❌ 查詢產品列表失敗:', err);
      process.exit(1);
    }
    
    console.log('\n📋 所有產品列表:');
    products.forEach(product => {
      console.log(`  [${product.id}] ${product.name} - ${product.category} - ${product.brand} - 庫存:${product.stock} - 價格:NT$${product.price}`);
    });
    
    console.log(`\n✅ 總共 ${products.length} 個產品`);
    
    db.close((err) => {
      if (err) {
        console.error('❌ 關閉數據庫失敗:', err);
      } else {
        console.log('✅ 數據庫連接已關閉');
      }
    });
  });
}); 