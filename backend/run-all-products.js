// 執行所有產品添加腳本的主腳本
const { exec } = require('child_process');
const path = require('path');

// 只能在Railway生產環境執行
if (!process.env.RAILWAY_DEPLOYMENT_ID) {
  console.log('❌ 此腳本只能在Railway生產環境執行');
  process.exit(1);
}

console.log('🚀 開始執行所有產品添加腳本...');

// 執行第一個腳本
console.log('\n📦 步驟1: 執行第一批產品添加...');
exec('node add-new-products.js', { cwd: __dirname }, (error, stdout, stderr) => {
  if (error) {
    console.error('❌ 第一批產品添加失敗:', error);
    return;
  }
  
  console.log(stdout);
  if (stderr) console.error(stderr);
  
  console.log('\n✅ 第一批產品添加完成');
  
  // 等待2秒後執行第二個腳本
  setTimeout(() => {
    console.log('\n📦 步驟2: 執行第二批產品添加...');
    exec('node add-more-products.js', { cwd: __dirname }, (error, stdout, stderr) => {
      if (error) {
        console.error('❌ 第二批產品添加失敗:', error);
        return;
      }
      
      console.log(stdout);
      if (stderr) console.error(stderr);
      
      console.log('\n🎉 所有產品添加完成！');
    });
  }, 2000);
}); 