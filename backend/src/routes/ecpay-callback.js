const express = require('express');
const router = express.Router();

// 處理綠界物流地圖回調
router.get('/callback', (req, res) => {
  console.log('收到綠界回調:', req.query);
  
  // 從綠界接收的參數
  const {
    CVSStoreID,
    CVSStoreName,
    CVSAddress,
    CVSTelephone,
    CVSOutSide,
    ExtraData
  } = req.query;
  
  // 構建重定向 URL，將門市資訊傳回前端
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const redirectUrl = new URL('/checkout', frontendUrl);
  
  // 添加門市資訊到 URL 參數
  if (CVSStoreID) redirectUrl.searchParams.append('CVSStoreID', CVSStoreID);
  if (CVSStoreName) redirectUrl.searchParams.append('CVSStoreName', CVSStoreName);
  if (CVSAddress) redirectUrl.searchParams.append('CVSAddress', CVSAddress);
  if (CVSTelephone) redirectUrl.searchParams.append('CVSTelephone', CVSTelephone);
  
  // 標記是從地圖回來的
  redirectUrl.searchParams.append('from_map', '1');
  
  // 重定向回前端結帳頁面
  res.redirect(redirectUrl.toString());
});

// 處理綠界物流地圖 POST 回調（某些情況下可能使用 POST）
router.post('/callback', (req, res) => {
  console.log('收到綠界 POST 回調:', req.body);
  
  const {
    CVSStoreID,
    CVSStoreName,
    CVSAddress,
    CVSTelephone
  } = req.body;
  
  // 構建重定向 URL
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const redirectUrl = new URL('/checkout', frontendUrl);
  
  if (CVSStoreID) redirectUrl.searchParams.append('CVSStoreID', CVSStoreID);
  if (CVSStoreName) redirectUrl.searchParams.append('CVSStoreName', CVSStoreName);
  if (CVSAddress) redirectUrl.searchParams.append('CVSAddress', CVSAddress);
  if (CVSTelephone) redirectUrl.searchParams.append('CVSTelephone', CVSTelephone);
  redirectUrl.searchParams.append('from_map', '1');
  
  res.redirect(redirectUrl.toString());
});

module.exports = router;