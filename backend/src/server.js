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
const storesRouter = require('./routes/stores');

const app = express();
const PORT = process.env.PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || 'development';

// CORS 設置
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

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 靜態文件服務 - Railway Volume 兼容
const imagesDir = process.env.RAILWAY_DEPLOYMENT_ID 
  ? '/app/data/images'  // Railway 生產環境：使用 Volume
  : path.join(__dirname, '../../public/images');  // 本地開發環境

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use('/images', express.static(imagesDir));

// 生產環境下服務前端靜態文件
if (NODE_ENV === 'production') {
  // 設置正確的 MIME 類型
  express.static.mime.define({
    'application/javascript': ['js'],
    'text/javascript': ['js'],
    'application/json': ['json'],
    'text/css': ['css'],
    'image/png': ['png'],
    'image/jpeg': ['jpg', 'jpeg'],
    'image/webp': ['webp'],
    'image/svg+xml': ['svg'],
    'font/woff2': ['woff2'],
    'font/woff': ['woff']
  });

  // 靜態文件中間件 - 處理構建後的文件
  app.use(express.static(path.join(__dirname, '../../dist'), {
    maxAge: '1d', // 設置緩存
    etag: true,
    setHeaders: (res, filePath) => {
      // 確保正確的 MIME 類型
      if (filePath.endsWith('.js')) {
        res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
      } else if (filePath.endsWith('.css')) {
        res.setHeader('Content-Type', 'text/css; charset=utf-8');
      } else if (filePath.endsWith('.woff2')) {
        res.setHeader('Content-Type', 'font/woff2');
      } else if (filePath.endsWith('.webp')) {
        res.setHeader('Content-Type', 'image/webp');
      }
      
      // 對於 assets 目錄下的文件設置較長的緩存
      if (filePath.includes('/assets/')) {
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      }
    }
  }));
}

// API路由
app.use('/api/products', productsRouter);
app.use('/api/cart', cartRouter);
app.use('/api/coupons', couponsRouter);
app.use('/api/announcements', announcementsRouter);
app.use('/api/admin', adminRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/stores', storesRouter);
app.use('/api', sitemapRouter);
app.use('/api/ecpay', require('./routes/ecpay-callback'));

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
    
    // 如果是靜態資源請求（assets, 圖片等），但文件不存在，返回404
    if (req.path.match(/\.(js|css|png|jpg|jpeg|gif|webp|svg|woff|woff2|ttf|eot|ico|json)$/)) {
      return res.status(404).send('File not found');
    }
    
    // 檢查是否是 assets 目錄下的請求
    if (req.path.startsWith('/assets/')) {
      return res.status(404).send('Asset not found');
    }
    
    // 其他路由返回前端應用
    const indexPath = path.join(__dirname, '../../dist/index.html');
    
    // 確保 index.html 存在
    if (!require('fs').existsSync(indexPath)) {
      return res.status(500).send('Application not properly deployed');
    }
    
    res.sendFile(indexPath);
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

// 添加進程錯誤處理
process.on('uncaughtException', (error) => {
  console.error('❌ 未捕獲的異常:', error);
  // 不要立即退出，記錄錯誤但繼續運行
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ 未處理的 Promise 拒絕:', reason);
  // 不要立即退出，記錄錯誤但繼續運行
});

// 優雅關閉處理
process.on('SIGTERM', () => {
  console.log('📡 收到 SIGTERM 信號，正在優雅關閉...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('📡 收到 SIGINT 信號，正在優雅關閉...');
  process.exit(0);
});

// 啟動服務器
const server = app.listen(PORT, '0.0.0.0', async () => {
  console.log(`🚀 服務器運行在 http://localhost:${PORT}`);
  console.log(`📁 API文檔: http://localhost:${PORT}/api`);
  console.log(`🌍 環境: ${NODE_ENV}`);

  // 初始化數據庫（確保表結構存在）
  try {
    console.log('🔧 初始化數據庫表結構...');
    const initDb = require('./scripts/init-database.js');
    await initDb();
    console.log('✅ 數據庫初始化完成');

      // 執行數據庫遷移
  console.log('🔄 執行數據庫遷移...');
  const migrateDiscontinued = require('./scripts/migrate-add-discontinued.js');
  const migrateCouponExcluded = require('./scripts/migrate-add-coupon-excluded.js');
  const migrateShippingExcluded = require('./scripts/migrate-add-shipping-excluded.js');
  const migrateProductImages = require('./scripts/migrate-add-product-images.js');

  await migrateDiscontinued();
  await migrateCouponExcluded();
  await migrateShippingExcluded();
  await migrateProductImages();
  console.log('✅ 數據庫遷移完成');
    
    // 檢查是否需要強制重設管理員
    if (process.env.FORCE_ADMIN_RESET === 'true') {
      console.log('🚨 檢測到強制管理員重設標記，執行重設...');
      const forceAdminReset = require('./scripts/force-admin-reset.js');
      await forceAdminReset();
    }

    // 檢查產品數據是否存在
    const { dbAsync } = require('./database/db');
    const row = await dbAsync.get('SELECT COUNT(*) as count FROM products');
    if (row.count === 0) {
      console.log('📦 檢測到空的產品表，如果是首次部署，請確保初始數據庫已正確複製到 Volume。');
    } else {
      console.log(`✅ 產品數據已存在 (${row.count} 個產品)`);
    }
  } catch (err) {
    console.error('❌ 數據庫初始化失敗:', err);
    console.log('⚠️ 服務器將繼續運行，但某些功能可能不可用');
    // 不要退出，讓服務器繼續運行
  }

  // 測試數據庫連接
  await testConnection();
});

module.exports = app;
