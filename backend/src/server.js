const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// 導入數據庫
const { testConnection } = require('./database/db');

// 導入路由
const productsRouter = require('./routes/products');
const cartRouter = require('./routes/cart');
const couponsRouter = require('./routes/coupons');
const announcementsRouter = require('./routes/announcements');
const adminRouter = require('./routes/admin');
const settingsRouter = require('./routes/settings');
const ordersRouter = require('./routes/orders');
const sitemapRouter = require('./routes/sitemap');

const app = express();
const PORT = process.env.PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || 'development';

// CORS 設置
const corsOptions = {
  origin: NODE_ENV === 'production' 
    ? [process.env.FRONTEND_URL || 'https://your-domain.railway.app']
    : ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 靜態文件服務
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use('/images', express.static(path.join(__dirname, '../../public/images')));

// 生產環境下服務前端靜態文件
if (NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../../dist')));
}

// API路由
app.use('/api/products', productsRouter);
app.use('/api/cart', cartRouter);
app.use('/api/coupons', couponsRouter);
app.use('/api/announcements', announcementsRouter);
app.use('/api/admin', adminRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/orders', ordersRouter);
app.use('/api', sitemapRouter);

// robots.txt 路由
app.get('/robots.txt', (req, res) => {
  const baseUrl = NODE_ENV === 'production' 
    ? (process.env.FRONTEND_URL || 'https://your-domain.railway.app')
    : 'http://localhost:5173';
    
  const robotsTxt = `User-agent: *
Allow: /

# 網站地圖
Sitemap: ${baseUrl}/sitemap.xml

# 禁止訪問管理員區域
Disallow: /admin

# 禁止訪問 API 端點
Disallow: /api/

# 允許訪問所有產品頁面
Allow: /products
Allow: /products/*

# 允許訪問重要頁面
Allow: /shipping
Allow: /returns
Allow: /sitemap`;

  res.set('Content-Type', 'text/plain');
  res.send(robotsTxt);
});

// 根路由 - API文檔
app.get('/api', (req, res) => {
  res.json({
    message: '🚬 DeepVape 電子煙線上商店 API',
    version: '1.0.0',
    environment: NODE_ENV,
    endpoints: {
      products: '/api/products',
      cart: '/api/cart',
      coupons: '/api/coupons',
      announcements: '/api/announcements',
      admin: '/api/admin',
      settings: '/api/settings',
      orders: '/api/orders',
      sitemap: '/sitemap.xml',
      'sitemap-data': '/api/sitemap-data'
    }
  });
});

// 生產環境下，所有非API路由都返回index.html（SPA路由支持）
if (NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    // 如果是API路由，返回404
    if (req.path.startsWith('/api/')) {
      return res.status(404).json({
        error: '找不到請求的API資源',
        path: req.originalUrl
      });
    }
    
    // 其他路由返回前端應用
    res.sendFile(path.join(__dirname, '../../dist/index.html'));
  });
} else {
  // 開發環境的根路由
  app.get('/', (req, res) => {
    res.json({
      message: '🚬 DeepVape 電子煙線上商店 API',
      version: '1.0.0',
      environment: NODE_ENV,
      endpoints: {
        products: '/api/products',
        cart: '/api/cart',
        coupons: '/api/coupons',
        announcements: '/api/announcements',
        admin: '/api/admin',
        settings: '/api/settings',
        orders: '/api/orders',
        sitemap: '/sitemap.xml',
        'sitemap-data': '/api/sitemap-data'
      }
    });
  });
}

// 錯誤處理中間件
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).json({
    error: '服務器內部錯誤',
    message: NODE_ENV === 'development' ? err.message : '請稍後再試'
  });
});

// 404處理（僅用於API路由）
app.use('/api/*', (req, res) => {
  res.status(404).json({
    error: '找不到請求的API資源',
    path: req.originalUrl
  });
});

// 啟動服務器
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 服務器運行在 http://localhost:${PORT}`);
  console.log(`📁 API文檔: http://localhost:${PORT}/api`);
  console.log(`🌍 環境: ${NODE_ENV}`);
  
  // 測試數據庫連接
  testConnection().catch(err => {
    console.error('數據庫連接測試失敗:', err);
  });
});

module.exports = app;
