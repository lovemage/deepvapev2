const express = require('express');
const { dbAsync } = require('../database/db');
const router = express.Router();

// 生成 XML sitemap
router.get('/sitemap.xml', async (req, res) => {
  try {
    const baseUrl = process.env.FRONTEND_URL || 'https://your-domain.railway.app';
    
    // 靜態頁面
    const staticPages = [
      { url: '/', priority: '1.0', changefreq: 'daily' },
      { url: '/products', priority: '0.9', changefreq: 'daily' },
      { url: '/products?category=host', priority: '0.8', changefreq: 'weekly' },
      { url: '/products?category=cartridge', priority: '0.8', changefreq: 'weekly' },
      { url: '/products?category=disposable', priority: '0.8', changefreq: 'weekly' },
      { url: '/shipping', priority: '0.6', changefreq: 'monthly' },
      { url: '/returns', priority: '0.6', changefreq: 'monthly' },
      { url: '/sitemap', priority: '0.5', changefreq: 'monthly' }
    ];

    // 獲取所有產品
    const products = await dbAsync.all(`
      SELECT id, name, updated_at, created_at 
      FROM products 
      WHERE stock > 0 
      ORDER BY created_at DESC
    `);

    // 獲取所有品牌
    const brands = await dbAsync.all(`
      SELECT DISTINCT brand 
      FROM products 
      WHERE stock > 0
    `);

    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

    // 添加靜態頁面
    staticPages.forEach(page => {
      sitemap += `
  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`;
    });

    // 添加產品頁面
    products.forEach(product => {
      const lastmod = product.updated_at || product.created_at;
      const formattedDate = new Date(lastmod).toISOString().split('T')[0];
      
      sitemap += `
  <url>
    <loc>${baseUrl}/products/${product.id}</loc>
    <lastmod>${formattedDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`;
    });

    // 添加品牌頁面
    brands.forEach(brand => {
      sitemap += `
  <url>
    <loc>${baseUrl}/products?brand=${encodeURIComponent(brand.brand)}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`;
    });

    sitemap += `
</urlset>`;

    res.set('Content-Type', 'application/xml');
    res.send(sitemap);

  } catch (error) {
    console.error('生成 sitemap 失敗:', error);
    res.status(500).json({ error: '生成 sitemap 失敗' });
  }
});

// 獲取 sitemap 數據（用於前端顯示）
router.get('/sitemap-data', async (req, res) => {
  try {
    // 靜態頁面
    const staticPages = [
      { 
        title: '首頁', 
        url: '/', 
        description: 'DeepVape 電子煙商城首頁',
        category: 'main'
      },
      { 
        title: '所有商品', 
        url: '/products', 
        description: '瀏覽所有電子煙產品',
        category: 'products'
      },
      { 
        title: '電子煙主機', 
        url: '/products?category=host', 
        description: '各品牌電子煙主機',
        category: 'products'
      },
      { 
        title: '煙彈', 
        url: '/products?category=cartridge', 
        description: '多種口味煙彈選擇',
        category: 'products'
      },
      { 
        title: '拋棄式電子煙', 
        url: '/products?category=disposable', 
        description: '即開即用拋棄式電子煙',
        category: 'products'
      },
      { 
        title: '配送說明', 
        url: '/shipping', 
        description: '配送方式和注意事項',
        category: 'info'
      },
      { 
        title: '退換貨政策', 
        url: '/returns', 
        description: '退換貨流程和政策',
        category: 'info'
      }
    ];

    // 獲取產品數據
    const products = await dbAsync.all(`
      SELECT id, name, category, brand, price
      FROM products 
      WHERE stock > 0 
      ORDER BY category, brand, name
    `);

    // 獲取品牌數據
    const brands = await dbAsync.all(`
      SELECT brand, COUNT(*) as product_count
      FROM products 
      WHERE stock > 0 
      GROUP BY brand
      ORDER BY brand
    `);

    // 統計數據
    const categoryStats = await dbAsync.all(`
      SELECT 
        category,
        COUNT(*) as count,
        AVG(price) as avg_price
      FROM products 
      WHERE stock > 0 
      GROUP BY category
    `);

    const sitemapData = {
      staticPages,
      products: products.map(product => ({
        title: product.name,
        url: `/products/${product.id}`,
        description: `${product.name} - NT$${product.price}`,
        category: 'product-detail',
        brand: product.brand,
        productCategory: product.category
      })),
      brands: brands.map(brand => ({
        title: `${brand.brand} 產品`,
        url: `/products?brand=${encodeURIComponent(brand.brand)}`,
        description: `${brand.brand} 品牌產品 (${brand.product_count} 個產品)`,
        category: 'brand',
        productCount: brand.product_count
      })),
      statistics: {
        totalProducts: products.length,
        totalBrands: brands.length,
        categoryStats: categoryStats.map(stat => ({
          category: stat.category,
          count: stat.count,
          avgPrice: Math.round(stat.avg_price)
        }))
      }
    };

    res.json(sitemapData);

  } catch (error) {
    console.error('獲取 sitemap 數據失敗:', error);
    res.status(500).json({ error: '獲取 sitemap 數據失敗' });
  }
});

module.exports = router; 