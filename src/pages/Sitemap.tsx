import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, Package, Store, Info, Home, Search } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import SEO from '@/components/SEO';

interface SitemapData {
  staticPages: Array<{
    title: string;
    url: string;
    description: string;
    category: string;
  }>;
  products: Array<{
    title: string;
    url: string;
    description: string;
    category: string;
    brand: string;
    productCategory: string;
  }>;
  brands: Array<{
    title: string;
    url: string;
    description: string;
    category: string;
    productCount: number;
  }>;
  statistics: {
    totalProducts: number;
    totalBrands: number;
    categoryStats: Array<{
      category: string;
      count: number;
      avgPrice: number;
    }>;
  };
}

const Sitemap: React.FC = () => {
  const [sitemapData, setSitemapData] = useState<SitemapData | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    loadSitemapData();
  }, []);

  const loadSitemapData = async () => {
    try {
      setLoading(true);
      // 優先從生產環境獲取真實數據
      const productionApiUrl = 'https://deepvape.org/api/sitemap-data';
      const fallbackApiUrl = '/api/sitemap-data';
      
      let response;
      try {
        // 嘗試從生產環境獲取數據
        response = await fetch(productionApiUrl);
        if (!response.ok) {
          throw new Error('Production API failed');
        }
      } catch (prodError) {
        console.log('使用本地API作為備選:', prodError.message);
        // 如果生產環境失敗，使用本地API
        response = await fetch(fallbackApiUrl);
        if (!response.ok) {
          throw new Error('Failed to load sitemap data from both sources');
        }
      }
      
      const data = await response.json();
      setSitemapData(data);
    } catch (error) {
      console.error('載入網站地圖數據失敗:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'main':
        return Home;
      case 'products':
      case 'product-detail':
        return Package;
      case 'brand':
        return Store;
      case 'info':
        return Info;
      default:
        return ExternalLink;
    }
  };

  const getCategoryName = (category: string) => {
    switch (category) {
      case 'host':
        return '主機';
      case 'cartridge':
        return '煙彈';
      case 'disposable':
        return '拋棄式';
      default:
        return category;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'main':
        return 'bg-blue-500';
      case 'products':
        return 'bg-green-500';
      case 'product-detail':
        return 'bg-purple-500';
      case 'brand':
        return 'bg-orange-500';
      case 'info':
        return 'bg-gray-500';
      default:
        return 'bg-gray-400';
    }
  };

  const filterItems = (items: any[], category: string) => {
    let filtered = items;
    
    if (category !== 'all') {
      filtered = filtered.filter(item => item.category === category);
    }
    
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return filtered;
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">載入網站地圖中...</p>
        </div>
      </div>
    );
  }

  if (!sitemapData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-red-600">載入網站地圖失敗，請稍後再試。</p>
        </div>
      </div>
    );
  }

  const allItems = [
    ...sitemapData.staticPages,
    ...sitemapData.products,
    ...sitemapData.brands
  ];

  const filteredItems = filterItems(allItems, selectedCategory);

  return (
    <div className="container mx-auto px-4 py-8">
      <SEO
        title="網站地圖 - DeepVape 電子煙商城"
        description="瀏覽 DeepVape 電子煙商城的完整網站地圖，快速找到所有產品頁面、品牌頁面和資訊頁面。包含產品分類統計和搜索功能。"
        keywords="網站地圖,sitemap,電子煙產品導航,品牌頁面,產品分類,網站導航"
        url="/sitemap"
      />
      {/* 頁面標題 */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">網站地圖</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          瀏覽 DeepVape 電子煙商城的所有頁面，快速找到您需要的產品和資訊
        </p>
      </div>

      {/* 統計資訊 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {sitemapData.statistics.totalProducts}
            </div>
            <div className="text-sm text-gray-600">總產品數</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {sitemapData.statistics.totalBrands}
            </div>
            <div className="text-sm text-gray-600">品牌數量</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {sitemapData.staticPages.length}
            </div>
            <div className="text-sm text-gray-600">主要頁面</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">
              {allItems.length}
            </div>
            <div className="text-sm text-gray-600">總頁面數</div>
          </CardContent>
        </Card>
      </div>

      {/* 搜索和篩選 */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            搜索和篩選
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="搜索頁面..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={selectedCategory === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory('all')}
              >
                全部
              </Button>
              <Button
                variant={selectedCategory === 'main' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory('main')}
              >
                主要頁面
              </Button>
              <Button
                variant={selectedCategory === 'products' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory('products')}
              >
                產品分類
              </Button>
              <Button
                variant={selectedCategory === 'brand' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory('brand')}
              >
                品牌頁面
              </Button>
              <Button
                variant={selectedCategory === 'product-detail' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory('product-detail')}
              >
                產品詳情
              </Button>
              <Button
                variant={selectedCategory === 'info' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory('info')}
              >
                資訊頁面
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 分類統計 */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>產品分類統計</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {sitemapData.statistics.categoryStats.map((stat) => (
              <div key={stat.category} className="p-4 border rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">{getCategoryName(stat.category)}</span>
                  <Badge variant="secondary">{stat.count} 個產品</Badge>
                </div>
                <div className="text-sm text-gray-600">
                  平均價格: NT${stat.avgPrice}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 頁面列表 */}
      <Card>
        <CardHeader>
          <CardTitle>
            所有頁面 
            <Badge variant="outline" className="ml-2">
              {filteredItems.length} 個結果
            </Badge>
          </CardTitle>
          <CardDescription>
            點擊任何連結直接前往該頁面
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredItems.map((item, index) => {
              const Icon = getCategoryIcon(item.category);
              return (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full ${getCategoryColor(item.category)} flex items-center justify-center`}>
                      <Icon className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <Link
                        to={item.url}
                        className="font-medium text-gray-900 hover:text-purple-600 transition-colors"
                      >
                        {item.title}
                      </Link>
                      <p className="text-sm text-gray-600 mt-1">
                        {item.description}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                                                 <Badge variant="outline">
                           {item.category}
                         </Badge>
                         {'brand' in item && (
                           <Badge variant="secondary">
                             {item.brand}
                           </Badge>
                         )}
                         {'productCount' in item && (
                           <Badge variant="default">
                             {item.productCount} 個產品
                           </Badge>
                         )}
                      </div>
                    </div>
                  </div>
                  <ExternalLink className="h-4 w-4 text-gray-400" />
                </div>
              );
            })}
          </div>

          {filteredItems.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-600">沒有找到符合條件的頁面</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* XML Sitemap 連結 */}
      <div className="mt-8 text-center">
        <Separator className="mb-4" />
        <p className="text-sm text-gray-600 mb-2">
          需要 XML 格式的網站地圖？
        </p>
        <Button variant="outline" asChild>
          <a href="/sitemap.xml" target="_blank" rel="noopener noreferrer">
            查看 XML Sitemap
            <ExternalLink className="ml-2 h-4 w-4" />
          </a>
        </Button>
      </div>
    </div>
  );
};

export default Sitemap; 