const express = require('express');
const crypto = require('crypto');
const router = express.Router();

// 綠界加密參數
const HASH_KEY = process.env.ECPAY_HASH_KEY || "m8rtvx8U15iaMv2m";
const HASH_IV = process.env.ECPAY_HASH_IV || "jovPWG9NuT0lArNc";
const MERCHANT_ID = process.env.ECPAY_MERCHANT_ID || "2000132";

// 綠界 SHA256 加密函數
function createSHA256(data) {
  const queryString = Object.keys(data)
    .filter(key => key !== 'CheckMacValue')
    .sort()
    .map(key => `${key}=${data[key]}`)
    .join('&');
  
  const hashString = `HashKey=${HASH_KEY}&${queryString}&HashIV=${HASH_IV}`;
  return crypto.createHash('sha256').update(hashString).digest('hex').toUpperCase();
}

// 驗證綠界回調簽名
function verifyCallback(data) {
  const receivedCheckMac = data.CheckMacValue;
  const calculatedCheckMac = createSHA256(data);
  return receivedCheckMac === calculatedCheckMac;
}

// 處理綠界物流地圖回調
router.get('/callback', (req, res) => {
  console.log('收到綠界回調:', req.query);
  
  // 驗證回調簽名（如果綠界有提供 CheckMacValue）
  if (req.query.CheckMacValue) {
    const isValid = verifyCallback(req.query);
    if (!isValid) {
      console.error('綠界回調簽名驗證失敗');
      return res.status(400).send('簽名驗證失敗');
    }
  }
  
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