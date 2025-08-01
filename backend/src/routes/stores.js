const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs').promises;

// 讀取完整的7-11門市資料
let storeData = [];

async function loadStoreData() {
  try {
    const dataPath = path.join(__dirname, '../data/711-stores.json');
    const rawData = await fs.readFile(dataPath, 'utf8');
    storeData = JSON.parse(rawData);
    console.log(`已載入 ${storeData.length} 個7-11門市資料`);
  } catch (error) {
    console.error('載入門市資料失敗:', error);
    // 如果無法載入完整資料，使用備用資料
    storeData = [
      {
        id: "280121",
        name: "上弘門市",
        tel: "(02)25472928",
        address: "台北市松山區敦化北路 168 號 B2",
        lat: 25.056390968531797,
        lng: 121.548287390895,
        city: "台北市",
        area: "松山區",
        service: ["atm", "seat", "ibon-wifi", "power-rental", "ibon", "sweet-potato", "hot-pressed-toast", "frozen-delivery", "city-oatmeal", "steamed-bun-machine", "self-service-microwave"]
      },
      {
        id: "239721",
        name: "中崙門市",
        tel: "(02)25774806",
        address: "台北市松山區八德路三段 27 號",
        lat: 25.048396,
        lng: 121.552737,
        city: "台北市",
        area: "松山區",
        service: ["atm", "seat", "ibon-wifi", "power-rental", "cosmetic", "ibon", "fresh-tea", "sweet-potato", "specialty-coffee", "frozen-delivery", "dessert", "city-oatmeal", "whisky-coffee", "self-service-microwave"]
      }
    ];
  }
}

// 初始化載入資料
loadStoreData();

// 搜尋門市
router.get('/search', async (req, res) => {
  try {
    const { query, type = 'address', limit = 10 } = req.query;
    
    if (!query) {
      return res.json({ stores: [] });
    }

    const searchQuery = query.toLowerCase().trim();
    let results = [];

    switch (type) {
      case 'name':
        results = storeData.filter(store => 
          store.name.toLowerCase().includes(searchQuery)
        );
        break;
      case 'address':
        results = storeData.filter(store => 
          store.address.toLowerCase().includes(searchQuery) ||
          store.city.toLowerCase().includes(searchQuery) ||
          store.area.toLowerCase().includes(searchQuery)
        );
        break;
      case 'number':
        results = storeData.filter(store => 
          store.id.includes(searchQuery)
        );
        break;
      default:
        results = storeData.filter(store => 
          store.name.toLowerCase().includes(searchQuery) ||
          store.address.toLowerCase().includes(searchQuery) ||
          store.city.toLowerCase().includes(searchQuery) ||
          store.area.toLowerCase().includes(searchQuery) ||
          store.id.includes(searchQuery)
        );
    }

    // 限制結果數量
    results = results.slice(0, parseInt(limit));

    res.json({ 
      stores: results,
      total: results.length,
      query: searchQuery,
      type: type
    });
  } catch (error) {
    console.error('搜尋門市錯誤:', error);
    res.status(500).json({ error: '搜尋門市時發生錯誤' });
  }
});

// 根據門市代號獲取門市資訊
router.get('/:storeId', async (req, res) => {
  try {
    const { storeId } = req.params;
    
    const store = storeData.find(s => s.id === storeId);
    
    if (!store) {
      return res.status(404).json({ error: '找不到指定的門市' });
    }

    res.json({ store });
  } catch (error) {
    console.error('獲取門市資訊錯誤:', error);
    res.status(500).json({ error: '獲取門市資訊時發生錯誤' });
  }
});

// 獲取所有門市（分頁）
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 20, city, area } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    
    let filteredStores = storeData;
    
    // 根據城市和區域篩選
    if (city) {
      filteredStores = filteredStores.filter(store => 
        store.city.includes(city)
      );
    }
    
    if (area) {
      filteredStores = filteredStores.filter(store => 
        store.area.includes(area)
      );
    }
    
    // 分頁
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;
    const paginatedStores = filteredStores.slice(startIndex, endIndex);
    
    res.json({
      stores: paginatedStores,
      total: filteredStores.length,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(filteredStores.length / limitNum)
    });
  } catch (error) {
    console.error('獲取門市列表錯誤:', error);
    res.status(500).json({ error: '獲取門市列表時發生錯誤' });
  }
});

module.exports = router; 