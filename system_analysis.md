# 電子煙線上商店系統分析

## 技術架構設計

### 前端技術棧
- React + TypeScript
- Tailwind CSS (響應式設計)
- React Router (路由管理)
- Zustand (狀態管理)
- Axios (API請求)

### 後端技術棧
- Node.js + Express
- SQLite (輕量化數據庫)
- JWT (身份驗證)
- Multer (文件上傳)

### 數據庫設計

#### 產品表 (products)
```sql
- id (主鍵)
- name (產品名稱)
- category (類別: host/cartridge/disposable)
- brand (品牌)
- price (價格)
- description (描述)
- image_url (圖片URL)
- stock (庫存)
- created_at
```

#### 產品變體表 (product_variants)
```sql
- id (主鍵)
- product_id (外鍵)
- variant_type (顏色/口味)
- variant_value (具體值)
- stock (庫存)
- price_modifier (價格調整)
```

#### 購物車表 (cart_items)
```sql
- id (主鍵)
- session_id (會話ID)
- product_id (外鍵)
- variant_id (外鍵，可空)
- quantity (數量)
- created_at
```

#### 優惠券表 (coupons)
```sql
- id (主鍵)
- code (優惠碼)
- type (折扣類型: percentage/fixed)
- value (折扣值)
- min_amount (最低消費)
- expires_at (過期時間)
- is_active (是否啟用)
```

#### 公告表 (announcements)
```sql
- id (主鍵)
- title (標題)
- content (內容)
- type (類型: info/warning/promotion)
- is_active (是否啟用)
- created_at
```

#### 管理員表 (admins)
```sql
- id (主鍵)
- username (用戶名)
- password_hash (密碼哈希)
- created_at
```

## 功能模組設計

### 1. 產品展示模組
- 分類瀏覽
- 產品卡片展示
- 變體選擇器
- 庫存狀態顯示

### 2. 購物車模組
- 加入購物車
- 數量調整
- 移除商品
- 總價計算

### 3. 優惠券模組
- 優惠碼輸入
- 折扣計算
- 有效性驗證

### 4. 管理後台模組
- 產品管理（增刪改查）
- 變體管理
- 優惠券管理
- 公告管理
- 庫存管理

### 5. 用戶界面模組
- 響應式導航
- 產品分類篩選
- 搜索功能
- 公告展示

## API端點設計

### 產品相關
- GET /api/products - 獲取產品列表
- GET /api/products/:id - 獲取單個產品
- POST /api/products - 創建產品（管理員）
- PUT /api/products/:id - 更新產品（管理員）
- DELETE /api/products/:id - 刪除產品（管理員）

### 購物車相關
- GET /api/cart - 獲取購物車
- POST /api/cart - 添加到購物車
- PUT /api/cart/:id - 更新購物車項目
- DELETE /api/cart/:id - 從購物車移除

### 優惠券相關
- POST /api/coupons/validate - 驗證優惠碼
- GET /api/coupons - 獲取優惠券列表（管理員）
- POST /api/coupons - 創建優惠券（管理員）

### 公告相關
- GET /api/announcements - 獲取公告
- POST /api/announcements - 創建公告（管理員）

### 管理員相關
- POST /api/admin/login - 管理員登錄
- GET /api/admin/dashboard - 管理員儀表板

## 示例產品數據結構

### 主機產品（3個品牌）
1. JUUL主機
2. IQOS主機  
3. Vaporesso主機

### 煙彈產品（3個品牌 × 30種口味）
1. JUUL煙彈 - 30種口味
2. IQOS煙彈 - 30種口味
3. Vaporesso煙彈 - 30種口味

### 拋棄式電子煙（3個品牌 × 30種口味）
1. Puff Bar - 30種口味
2. Hyde - 30種口味
3. Elf Bar - 30種口味

## 作者：MiniMax Agent
## 完成時間：2025-06-21
