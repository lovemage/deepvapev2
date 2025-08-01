# 綠界 API 設定指南

## 概述
本專案已整合綠界物流地圖 API 來實現 7-11 門市選擇功能。

## 必要參數

### 1. 商店代號 (MerchantID)
- 測試環境：`2000132`
- 正式環境：需要向綠界申請

### 2. 加密金鑰
- **HashKey**: `m8rtvx8U15iaMv2m`
- **HashIV**: `jovPWG9NuT0lArNc`

## 環境變數設定

### 前端 (.env)
```env
VITE_ECPAY_MERCHANT_ID=2000132
VITE_ECPAY_HASH_KEY=m8rtvx8U15iaMv2m
VITE_ECPAY_HASH_IV=jovPWG9NuT0lArNc
```

### 後端 (.env)
```env
ECPAY_MERCHANT_ID=2000132
ECPAY_HASH_KEY=m8rtvx8U15iaMv2m
ECPAY_HASH_IV=jovPWG9NuT0lArNc
FRONTEND_URL=http://localhost:5173
```

## 安全注意事項

1. **不要將加密金鑰提交到 Git**
   - 將 `.env` 文件添加到 `.gitignore`
   - 使用環境變數管理敏感資訊

2. **正式環境設定**
   - 向綠界申請正式商店代號
   - 更新所有相關的環境變數
   - 確保 HTTPS 連接

3. **回調 URL 設定**
   - 確保回調 URL 可以從外部訪問
   - 設定正確的 CORS 政策

## 測試流程

1. 設定環境變數
2. 啟動前端和後端服務器
3. 進入結帳頁面
4. 點擊「選擇 7-11 門市」按鈕
5. 在綠界地圖選擇門市
6. 確認門市資訊正確顯示

## 故障排除

### 常見問題
1. **回調失敗**：檢查回調 URL 設定
2. **簽名驗證失敗**：確認 HashKey 和 HashIV 正確
3. **門市資訊不顯示**：檢查前端環境變數設定

### 日誌檢查
- 後端日誌：查看 `/api/ecpay/callback` 的請求日誌
- 前端日誌：檢查瀏覽器控制台錯誤

## 正式環境部署

1. 申請綠界正式商店代號
2. 更新所有環境變數
3. 設定 HTTPS
4. 測試完整流程
5. 監控回調日誌 