# 本地搜尋門市路由完整指南

## 概述

本指南詳細說明如何實現本地搜尋門市功能，整合了 [GitHub上的台灣CVS地圖資料](https://github.com/Minato1123/taiwan-cvs-map.git)，提供完整的7-11門市搜尋服務。

## 功能特色

### 🎯 主要功能
- **多種搜尋模式**：門市名稱、地址、門市代號
- **完整門市資料**：7,193個7-11門市資訊
- **Google地圖導航**：一鍵開啟導航
- **服務項目顯示**：顯示門市提供的服務
- **響應式設計**：支援手機和桌面

### 🔧 技術架構
- **前端**：React + TypeScript + Tailwind CSS
- **後端**：Node.js + Express + SQLite
- **資料來源**：GitHub台灣CVS地圖專案
- **API設計**：RESTful API

## 資料庫設計

### 門市資料結構

```sql
-- 門市資料表結構（概念性）
CREATE TABLE stores (
  id TEXT PRIMARY KEY,           -- 門市代號
  name TEXT NOT NULL,            -- 門市名稱
  tel TEXT,                      -- 電話號碼
  address TEXT NOT NULL,         -- 完整地址
  lat REAL NOT NULL,             -- 緯度
  lng REAL NOT NULL,             -- 經度
  city TEXT NOT NULL,            -- 城市
  area TEXT NOT NULL,            -- 區域
  service TEXT                   -- 服務項目（JSON格式）
);
```

### 資料來源整合

我們從 [GitHub台灣CVS地圖專案](https://github.com/Minato1123/taiwan-cvs-map.git) 獲取完整的7-11門市資料：

```bash
# 克隆資料來源
git clone https://github.com/Minato1123/taiwan-cvs-map.git temp-cvs-data

# 資料位置
temp-cvs-data/src/assets/json/s_data.json  # 7-11門市資料
```

## API路由設計

### 1. 搜尋門市 API

**端點**: `GET /api/stores/search`

**參數**:
- `query` (string): 搜尋關鍵字
- `type` (string): 搜尋類型 (`name`, `address`, `number`)
- `limit` (number): 結果數量限制

**範例請求**:
```bash
curl "http://localhost:3001/api/stores/search?query=信義&type=address&limit=10"
```

**回應格式**:
```json
{
  "stores": [
    {
      "id": "280122",
      "name": "信義門市",
      "tel": "(02)27201234",
      "address": "台北市信義區信義路五段 7 號",
      "lat": 25.0330,
      "lng": 121.5654,
      "city": "台北市",
      "area": "信義區",
      "service": ["atm", "seat", "ibon-wifi", "ibon", "fresh-tea", "specialty-coffee", "city-oatmeal"]
    }
  ],
  "total": 1,
  "query": "信義",
  "type": "address"
}
```

### 2. 門市詳情 API

**端點**: `GET /api/stores/:storeId`

**範例請求**:
```bash
curl "http://localhost:3001/api/stores/280122"
```

**回應格式**:
```json
{
  "store": {
    "id": "280122",
    "name": "信義門市",
    "tel": "(02)27201234",
    "address": "台北市信義區信義路五段 7 號",
    "lat": 25.0330,
    "lng": 121.5654,
    "city": "台北市",
    "area": "信義區",
    "service": ["atm", "seat", "ibon-wifi", "ibon", "fresh-tea", "specialty-coffee", "city-oatmeal"]
  }
}
```

### 3. 門市列表 API

**端點**: `GET /api/stores`

**參數**:
- `page` (number): 頁碼
- `limit` (number): 每頁數量
- `city` (string): 城市篩選
- `area` (string): 區域篩選

**範例請求**:
```bash
curl "http://localhost:3001/api/stores?page=1&limit=20&city=台北市"
```

## 前端組件設計

### StoreSelector 組件

```typescript
interface StoreData {
  id: string;
  name: string;
  tel: string;
  address: string;
  lat: number;
  lng: number;
  city: string;
  area: string;
  service: string[];
}

interface StoreSelectorProps {
  onStoreSelect: (store: any) => void;
  selectedStore?: any;
  required?: boolean;
  onManualInput?: (field: string, value: string) => void;
}
```

### 搜尋功能實現

```typescript
const searchStores = async () => {
  if (!searchQuery.trim()) {
    setSearchResults([]);
    return;
  }

  setIsLoading(true);
  
  try {
    const apiBaseUrl = import.meta.env.PROD ? '/api' : 'http://localhost:3001/api';
    const response = await fetch(
      `${apiBaseUrl}/stores/search?query=${encodeURIComponent(searchQuery)}&type=${searchType}&limit=10`
    );
    
    if (!response.ok) {
      throw new Error('搜尋門市失敗');
    }
    
    const data = await response.json();
    setSearchResults(data.stores || []);
  } catch (error) {
    console.error('搜尋門市錯誤:', error);
    toast({
      title: "搜尋失敗",
      description: "無法搜尋門市，請稍後再試",
      variant: "destructive"
    });
    setSearchResults([]);
  } finally {
    setIsLoading(false);
  }
};
```

## Git 使用指南

### 1. 初始化專案

```bash
# 克隆主專案
git clone https://github.com/your-username/vape-store.git
cd vape-store

# 添加遠端倉庫
git remote add origin https://github.com/your-username/vape-store.git
```

### 2. 分支管理

```bash
# 創建功能分支
git checkout -b feature/store-search

# 開發完成後合併
git checkout main
git merge feature/store-search

# 刪除功能分支
git branch -d feature/store-search
```

### 3. 提交規範

```bash
# 添加檔案
git add .

# 提交更改
git commit -m "feat: 新增本地搜尋門市功能

- 整合GitHub台灣CVS地圖資料
- 新增7,193個7-11門市資料
- 實現多種搜尋模式
- 新增Google地圖導航功能"

# 推送到遠端
git push origin main
```

### 4. 版本標籤

```bash
# 創建版本標籤
git tag -a v1.2.0 -m "Release: 完善7-11門市選擇器功能"

# 推送標籤
git push origin v1.2.0
```

## 資料庫操作指南

### 1. 資料導入腳本

```javascript
// backend/src/scripts/import-711-stores.js
const fs = require('fs').promises;
const path = require('path');

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
    
    console.log(`成功導入 ${convertedStores.length} 個門市資料`);
  } catch (error) {
    console.error('導入門市資料時發生錯誤:', error);
  }
}

module.exports = { import711Stores };
```

### 2. 執行資料導入

```bash
# 進入後端目錄
cd backend

# 執行導入腳本
node src/scripts/import-711-stores.js
```

### 3. 資料庫備份

```bash
# 備份SQLite資料庫
cp src/database/vape_store.db src/database/vape_store_backup_$(date +%Y%m%d).db

# 備份門市資料
cp src/data/711-stores.json src/data/711-stores_backup_$(date +%Y%m%d).json
```

## 部署指南

### 1. 本地開發

```bash
# 啟動後端服務
cd backend
npm install
npm start

# 啟動前端服務
cd ..
npm install
npm run dev
```

### 2. 生產環境部署

```bash
# 構建前端
npm run build

# 部署到Railway
railway up
```

### 3. 環境變數配置

```bash
# .env 檔案
VITE_SITE_URL=https://deepvape.org
VITE_API_URL=https://your-api-domain.railway.app
```

## 測試指南

### 1. API測試

```bash
# 測試搜尋API
curl "http://localhost:3001/api/stores/search?query=信義&type=address&limit=5"

# 測試門市詳情API
curl "http://localhost:3001/api/stores/280122"

# 測試門市列表API
curl "http://localhost:3001/api/stores?page=1&limit=10&city=台北市"
```

### 2. 前端測試

```bash
# 運行測試
npm test

# 運行E2E測試
npm run test:e2e
```

## 效能優化

### 1. 搜尋優化

- 使用索引加速搜尋
- 實作模糊搜尋算法
- 限制搜尋結果數量

### 2. 快取策略

```javascript
// 實作快取機制
const cache = new Map();

const getCachedStores = (query) => {
  const cacheKey = `stores_${query}`;
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }
  
  const results = searchStores(query);
  cache.set(cacheKey, results);
  return results;
};
```

### 3. 分頁優化

```javascript
// 實作分頁
const getStoresWithPagination = (page = 1, limit = 20) => {
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  
  return storeData.slice(startIndex, endIndex);
};
```

## 監控和日誌

### 1. 錯誤監控

```javascript
// 添加錯誤監控
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API錯誤:', error);
    
    // 發送到監控服務
    if (process.env.NODE_ENV === 'production') {
      // 發送到監控服務
    }
    
    return Promise.reject(error);
  }
);
```

### 2. 效能監控

```javascript
// 添加效能監控
const measureApiPerformance = async (apiCall) => {
  const startTime = performance.now();
  try {
    const result = await apiCall();
    const endTime = performance.now();
    
    console.log(`API執行時間: ${endTime - startTime}ms`);
    return result;
  } catch (error) {
    console.error('API執行失敗:', error);
    throw error;
  }
};
```

## 常見問題解決

### 1. CORS錯誤

```javascript
// 後端CORS設置
const corsOptions = {
  origin: NODE_ENV === 'production' 
    ? [
        process.env.FRONTEND_URL || 'https://your-domain.railway.app',
        'https://deepvape.org',
        'https://www.deepvape.org'
      ]
    : ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
```

### 2. 資料同步問題

```bash
# 定期更新門市資料
# 創建cron job
0 2 * * * cd /path/to/project && node backend/src/scripts/import-711-stores.js
```

### 3. 記憶體優化

```javascript
// 使用串流處理大量資料
const fs = require('fs');
const readline = require('readline');

const processLargeFile = (filePath) => {
  const fileStream = fs.createReadStream(filePath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });
  
  rl.on('line', (line) => {
    // 處理每一行資料
    const store = JSON.parse(line);
    // 處理邏輯
  });
};
```

## 未來改進計劃

### 1. 功能增強
- [ ] 整合地圖顯示功能
- [ ] 支援多種超商（全家、萊爾富等）
- [ ] 實作門市營業時間顯示
- [ ] 添加門市評價系統

### 2. 技術優化
- [ ] 實作Redis快取
- [ ] 添加GraphQL API
- [ ] 實作微服務架構
- [ ] 添加WebSocket即時更新

### 3. 用戶體驗
- [ ] 添加門市收藏功能
- [ ] 實作個人化推薦
- [ ] 支援多語言
- [ ] 添加無障礙功能

## 相關資源

- [GitHub台灣CVS地圖專案](https://github.com/Minato1123/taiwan-cvs-map.git)
- [7-11官方門市查詢](https://emap.pcsc.com.tw/)
- [綠界物流API文檔](https://www.ecpay.com.tw/Service/api_doc)
- [Leaflet地圖庫](https://leafletjs.com/)

## 聯絡資訊

如有問題或建議，請聯繫開發團隊或提交Issue到GitHub專案。 