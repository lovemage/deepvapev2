const fs = require('fs').promises;
const path = require('path');

// 讀取GitHub上的7-11門市資料
async function import711Stores() {
  try {
    console.log('開始導入7-11門市資料...');
    
    // 讀取GitHub上的資料
    const dataPath = path.join(__dirname, '../../../temp-cvs-data/src/assets/json/s_data.json');
    const rawData = await fs.readFile(dataPath, 'utf8');
    const stores = JSON.parse(rawData);
    
    console.log(`找到 ${stores.length} 個門市資料`);
    
    // 轉換資料格式
    const convertedStores = stores.map(store => ({
      id: store.id,
      name: store.name,
      tel: store.tel,
      address: store.address,
      lat: store.lat,
      lng: store.lng,
      city: store.city,
      area: store.area,
      service: store.service
    }));
    
    // 寫入到我們的系統
    const outputPath = path.join(__dirname, '../data/711-stores.json');
    await fs.writeFile(outputPath, JSON.stringify(convertedStores, null, 2));
    
    console.log(`成功導入 ${convertedStores.length} 個門市資料到 ${outputPath}`);
    
    // 顯示前幾個門市作為範例
    console.log('\n前5個門市範例:');
    convertedStores.slice(0, 5).forEach((store, index) => {
      console.log(`${index + 1}. ${store.name} (${store.id})`);
      console.log(`   地址: ${store.address}`);
      console.log(`   電話: ${store.tel}`);
      console.log(`   服務: ${store.service.slice(0, 3).join(', ')}...`);
      console.log('');
    });
    
  } catch (error) {
    console.error('導入門市資料時發生錯誤:', error);
  }
}

// 如果直接執行此腳本
if (require.main === module) {
  import711Stores();
}

module.exports = { import711Stores }; 