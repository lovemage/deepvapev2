# DeepVape 電子煙商城部署指南

## Railway 部署（推薦）

### 1. 準備工作

1. 確保您的代碼已推送到 GitHub
2. 註冊 [Railway](https://railway.app) 帳號
3. 準備 Telegram Bot 設置

### 2. 部署步驟

#### 方法一：通過 Railway CLI
```bash
# 安裝 Railway CLI
npm install -g @railway/cli

# 登錄
railway login

# 初始化項目
railway init

# 部署
railway up
```

#### 方法二：通過 Railway 網站
1. 登錄 Railway 控制台
2. 點擊 "New Project"
3. 選擇 "Deploy from GitHub repo"
4. 選擇您的 vape-store 倉庫
5. Railway 會自動檢測並部署

### 3. 環境變量設置

在 Railway 控制台中設置以下環境變量：

```
NODE_ENV=production
PORT=3001
JWT_SECRET=your-secure-jwt-secret-key
TELEGRAM_BOT_TOKEN=7718317439:AAFFYFjqP6vu11y66tY8_5szGzuFXyvpB9A
TELEGRAM_CHAT_ID=-1002666651546
```

### 4. 域名配置

1. Railway 會自動分配一個域名（如：`your-app.railway.app`）
2. 在 `backend/src/server.js` 中更新 CORS 設置，將 `your-domain.railway.app` 替換為實際域名

### 5. 數據庫初始化

部署完成後，數據庫會自動初始化。如果需要重新初始化：

```bash
# 在 Railway 控制台的終端中執行
cd backend && node src/scripts/init-database.js
```

## Vercel 部署（僅前端）

如果您只想部署前端到 Vercel：

### 1. 安裝 Vercel CLI
```bash
npm install -g vercel
```

### 2. 部署前端
```bash
# 構建前端
npm run build:frontend

# 部署到 Vercel
vercel --prod
```

### 3. 配置 API 基礎 URL
在前端代碼中更新 API 基礎 URL 指向您的後端服務器。

## 生產環境檢查清單

- [ ] 環境變量已正確設置
- [ ] Telegram Bot 設置已驗證
- [ ] CORS 域名已更新
- [ ] 數據庫已初始化
- [ ] 靜態文件路徑正確
- [ ] SSL 證書已配置（Railway 自動提供）

## 故障排除

### 常見問題

1. **500 錯誤**：檢查環境變量和數據庫路徑
2. **CORS 錯誤**：確認域名設置正確
3. **圖片無法顯示**：檢查靜態文件路徑
4. **Telegram 通知失敗**：驗證 Bot Token 和 Chat ID

### 日誌查看

在 Railway 控制台中可以查看實時日誌：
- 點擊您的項目
- 選擇 "Deployments" 標籤
- 點擊最新的部署查看日誌

## 成本估算

### Railway
- 免費額度：每月 $5 使用額度
- 付費計劃：$5/月起
- 適合小到中型應用

### Vercel（僅前端）
- 免費額度：充足的個人使用
- 付費計劃：$20/月起
- 需要額外的後端服務

## 更新部署

### Railway
代碼推送到 GitHub 後會自動重新部署。

### 手動重新部署
```bash
railway up --detach
```

## 備份與恢復

### 數據庫備份
```bash
# 下載數據庫文件
railway run cp database/vape_store.db /tmp/backup.db
```

### 恢復數據庫
```bash
# 上傳備份文件並恢復
railway run cp /tmp/backup.db database/vape_store.db
``` 