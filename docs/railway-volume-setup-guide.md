# Railway Volume 數據持久化設置指南

## 📋 概述

本指南詳細說明如何在 Railway 平台上設置 Volume 來實現數據庫持久化，確保部署時不會丟失客戶數據、產品信息和系統設置。

## 🎯 解決的問題

- ❌ 每次部署時產品數據被重置
- ❌ 客戶修改的價格、庫存丟失
- ❌ 管理後台設置被還原
- ❌ 訂單數據無法保存

## ✅ 解決方案

通過 Railway Volume + 智能數據庫配置，實現完美的數據持久化。

---

## 🚀 第一步：Railway 控制台設置

### 1.1 創建 Volume

1. **登入 Railway 控制台**
   - 進入您的項目頁面
   - 選擇 Web 服務

2. **添加 Volume**
   - 點擊 `Variables` 標籤
   - 滾動到底部找到 `Volumes` 區域
   - 點擊 `+ New Volume`

3. **配置 Volume**
   ```
   Mount Path: /app/data
   Size: 1GB (可根據需求調整)
   ```

### 1.2 設置環境變量

在 `Variables` 標籤中添加以下環境變量：

```env
DATABASE_PATH=/app/data/vape_store.db
NODE_ENV=production
FRONTEND_URL=https://your-domain.com
JWT_SECRET=your-jwt-secret-key
```

---

## 🔧 第二步：代碼配置

### 2.1 數據庫路徑配置

在 `backend/src/database/db.js` 中配置智能路徑選擇：

```javascript
// 數據庫路徑配置 - Railway Volume 兼容
let dbPath;
if (process.env.NODE_ENV === 'production') {
  // Railway 生產環境：優先使用 Volume
  dbPath = process.env.DATABASE_PATH || '/app/data/vape_store.db';
  
  // 首次部署時從部署包複製初始數據
  const volumeDbPath = '/app/data/vape_store.db';
  const sourceDbPath = path.join(__dirname, '../../database/vape_store.db');
  
  if (!fs.existsSync(volumeDbPath) && fs.existsSync(sourceDbPath)) {
    console.log('📋 首次部署，複製初始數據庫到 Volume...');
    try {
      fs.copyFileSync(sourceDbPath, volumeDbPath);
      console.log('✅ 初始數據庫複製完成');
    } catch (error) {
      console.error('❌ 複製數據庫失敗:', error.message);
    }
  }
  
  dbPath = volumeDbPath;
} else {
  // 本地開發環境
  dbPath = path.join(__dirname, '../../database/vape_store.db');
}
```

### 2.2 .gitignore 配置

確保 `.gitignore` 正確配置：

```gitignore
# Database files (keep the schema but not the actual data in production)
backend/database/*.db
backend/database/*.db.bak
```

**注意**: 首次設置時需要臨時允許數據庫文件推送，設置完成後再恢復忽略。

---

## 📦 第三步：初始數據部署

### 3.1 一次性數據推送

1. **臨時允許數據庫文件**
   ```bash
   # 註釋掉 .gitignore 中的數據庫忽略規則
   # backend/database/*.db
   ```

2. **推送完整數據庫**
   ```bash
   git add -f backend/database/vape_store.db
   git commit -m "📦 推送初始產品數據庫到 Railway"
   git push origin main
   ```

3. **恢復 .gitignore 保護**
   ```bash
   # 取消註釋，恢復數據庫文件忽略
   backend/database/*.db
   backend/database/*.db.bak
   ```

### 3.2 服務器啟動檢查

在 `backend/src/server.js` 中添加數據檢查：

```javascript
// 檢查產品數據是否存在
const { dbAsync } = require('./database/db');
dbAsync.get('SELECT COUNT(*) as count FROM products')
  .then(row => {
    if (row.count === 0) {
      console.log('📦 檢測到空的產品表，需要恢復數據');
    } else {
      console.log(`✅ 產品數據已存在 (${row.count} 個產品)`);
    }
  })
  .catch(err => {
    console.error('❌ 檢查產品數據失敗:', err);
  });
```

---

## 🧪 第四步：測試驗證

### 4.1 數據持久化測試

1. **修改產品價格**
   - 進入管理後台
   - 修改任一產品價格
   - 保存修改

2. **觸發重新部署**
   - 推送任意代碼修改
   - 等待 Railway 重新部署

3. **驗證數據保留**
   - 檢查產品價格是否保留
   - 確認修改沒有被重置

### 4.2 預期部署日誌

成功配置後，部署日誌應顯示：

```
🗄️ 數據庫路徑: /app/data/vape_store.db
🌍 運行環境: production
📁 數據庫目錄: /app/data
📋 目錄是否存在: true
✅ 產品數據已存在 (13 個產品)
🚀 服務器運行在 http://localhost:8080
```

---

## ⚠️ 重要注意事項

### 數據安全
- ✅ Volume 中的數據會在部署間保留
- ✅ 代碼更新不會影響數據庫
- ✅ 客戶數據得到完整保護

### 開發流程
- ✅ 本地開發使用本地數據庫
- ✅ 生產環境使用 Volume 數據庫
- ✅ .gitignore 防止意外覆蓋

### 備份建議
- 📋 定期備份 Volume 中的數據庫
- 📋 重要修改前先備份
- 📋 考慮設置自動備份腳本

---

## 🔧 故障排除

### 常見問題

**Q: 部署後看不到產品數據？**
A: 檢查環境變量 `DATABASE_PATH` 是否正確設置為 `/app/data/vape_store.db`

**Q: 數據修改後重新部署又丟失了？**
A: 檢查 `.gitignore` 是否正確忽略數據庫文件，防止本地數據庫覆蓋 Volume

**Q: 首次部署沒有數據？**
A: 確保初始數據庫文件已正確推送，並且複製邏輯正常執行

### 調試命令

檢查 Volume 掛載：
```bash
# 在 Railway 控制台查看部署日誌
# 尋找 "數據庫路徑" 和 "目錄是否存在" 信息
```

---

## ✅ 成功標準

設置成功後，您的應用應該：

- ✅ 產品價格修改會永久保存
- ✅ 管理後台設置會永久保存
- ✅ 新增產品會永久保存
- ✅ 客戶訂單數據會永久保存
- ✅ 代碼更新不會影響任何數據

---

## 📞 技術支持

如果遇到問題，請檢查：
1. Railway Volume 是否正確創建和掛載
2. 環境變量是否正確設置
3. 部署日誌中的數據庫路徑信息
4. .gitignore 配置是否正確

**恭喜！您已成功設置 Railway Volume 數據持久化！** 🎉
