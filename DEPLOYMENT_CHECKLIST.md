# 🚀 DeepVape SEO 部署檢查清單

## 📋 部署前檢查

### 1. 文件確認
- [x] `public/sitemap.xml` 存在且包含正確的域名
- [x] `public/robots.txt` 指向正確的 sitemap URL
- [x] `.env` 文件包含正確的 `VITE_SITE_URL=https://deepvape.org`
- [x] `backend/.env` 文件包含正確的 `FRONTEND_URL=https://deepvape.org`

### 2. 構建配置
- [x] `package.json` 包含 `copy-sitemap` 腳本
- [x] `vite.config.ts` 配置了 `publicDir: 'public'`
- [x] 構建腳本會自動複製 sitemap.xml 到 dist 目錄

## 🔧 部署步驟

### 1. 本地構建測試
```bash
# 清理舊的構建文件
rm -rf dist/

# 重新構建
npm run build:frontend

# 驗證 sitemap.xml 是否在 dist 目錄中
ls -la dist/sitemap.xml
```

### 2. 部署到生產環境
```bash
# 根據您的部署平台執行相應命令
# Railway: git push 會自動觸發部署
# Vercel: vercel --prod
# 其他平台: 按照平台文檔執行
```

### 3. 部署後驗證
```bash
# 檢查 sitemap 是否可訪問
curl -I https://deepvape.org/sitemap.xml

# 檢查 robots.txt
curl https://deepvape.org/robots.txt

# 檢查主頁是否正常
curl -I https://deepvape.org/
```

## ✅ 部署後檢查清單

### 1. 文件可訪問性
- [ ] https://deepvape.org/sitemap.xml 返回 200 狀態碼
- [ ] https://deepvape.org/robots.txt 返回正確內容
- [ ] sitemap.xml 包含所有重要頁面
- [ ] robots.txt 指向正確的 sitemap URL

### 2. SEO 標籤驗證
- [ ] 主頁包含正確的 meta 標籤
- [ ] 產品頁面包含 Product Schema
- [ ] Open Graph 標籤正確顯示
- [ ] Twitter Card 標籤正確

### 3. Google Search Console
- [ ] 提交 sitemap.xml
- [ ] 請求重新索引主要頁面
- [ ] 監控索引狀態
- [ ] 檢查是否有爬蟲錯誤

## 🐛 常見問題排除

### 問題 1: sitemap.xml 返回 404
**解決方案:**
1. 確認 `dist/sitemap.xml` 文件存在
2. 重新運行 `npm run build:frontend`
3. 檢查部署是否包含了 dist 目錄的所有文件

### 問題 2: sitemap.xml 返回錯誤內容
**解決方案:**
1. 檢查後端路由是否與靜態文件衝突
2. 確認 `backend/src/server.js` 中 sitemap 路由配置正確
3. 檢查靜態文件服務配置

### 問題 3: robots.txt 內容不正確
**解決方案:**
1. 檢查是否有後端動態 robots.txt 覆蓋靜態文件
2. 確認 `public/robots.txt` 內容正確
3. 檢查環境變量配置

## 📞 支援

如果遇到部署問題，請檢查：
1. 構建日誌是否有錯誤
2. 服務器日誌是否有異常
3. 網絡請求是否正常

---
**最後更新：** 2024-12-22  
**狀態：** ✅ 已配置完成，等待部署
