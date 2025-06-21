import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Zap, Shield, Truck, HeartHandshake, Star, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import ProductCard from '@/components/ProductCard';
import { useProductStore } from '@/lib/store';
import { productsAPI, settingsAPI } from '@/lib/api';
import { getCategoryName } from '@/lib/utils';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { setSelectedCategory } = useProductStore();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAgeVerification, setShowAgeVerification] = useState(false);
  const [heroImageUrl, setHeroImageUrl] = useState('/images/itay-kabalo-b3sel60dv8a-unsplash.jpg');
  const featuredRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 檢查是否已經驗證過年齡
    const ageVerified = localStorage.getItem('ageVerified');
    if (!ageVerified) {
      setShowAgeVerification(true);
    }
    loadFeaturedProducts();
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await settingsAPI.getPublicSettings();
      if (response.data.hero_image_url) {
        setHeroImageUrl(response.data.hero_image_url);
      }
    } catch (error) {
      console.warn('載入系統設置失敗，使用默認設置:', error.message);
      // 使用默認圖片，不影響頁面加載
    }
  };

  const loadFeaturedProducts = async () => {
    try {
      setLoading(true);
      // 獲取每個分類的推薦產品
      const categories = ['host', 'cartridge', 'disposable'];
      const promises = categories.map(category =>
        productsAPI.getProducts({ category, limit: 4 })
      );
      
      const results = await Promise.all(promises);
      const allProducts = results.flatMap(result => result.data.products);
      setFeaturedProducts(allProducts);
    } catch (error) {
      console.error('載入推薦產品失敗:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAgeConfirm = (isAdult: boolean) => {
    if (isAdult) {
      localStorage.setItem('ageVerified', 'true');
      setShowAgeVerification(false);
    } else {
      // 如果未滿18歲，重定向到其他頁面或顯示警告
      alert('很抱歉，本網站僅供18歲以上人士使用');
      window.location.href = 'https://www.google.com';
    }
  };

  const scrollToFeatured = () => {
    featuredRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const features = [
    {
      icon: Zap,
      title: '極速配送',
      description: '24小時內快速配送，讓您儘快享受'
    },
    {
      icon: Shield,
      title: '品質保證',
      description: '正品保證，所有產品均通過品質檢測'
    },
    {
      icon: Truck,
      title: '免費配送',
      description: '滿額免運費，全台配送服務'
    },
    {
      icon: HeartHandshake,
      title: '售後服務',
      description: '專業客服團隊，提供完善售後服務'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section 
        className="relative text-white"
        style={{
          backgroundImage: `url(${heroImageUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="relative container mx-auto px-4 py-24">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-white drop-shadow-lg">
              DeepVape 專業電子煙商城
            </h1>
            <p className="text-lg md:text-xl mb-8 text-gray-100 drop-shadow-md">
              精選各大品牌電子煙產品，提供最優質的購物體驗
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-white text-gray-900 hover:bg-gray-100 shadow-lg"
                onClick={() => navigate('/products')}
              >
                立即購買
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="bg-white text-gray-900 hover:bg-gray-100 shadow-lg"
                onClick={scrollToFeatured}
              >
                了解更多
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section ref={featuredRef} className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">推薦商品</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              精選熱門商品，為您推薦最受歡迎的電子煙產品
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {[...Array(8)].map((_, index) => (
                <div key={index} className="animate-pulse">
                  <div className="bg-gray-200 h-48 rounded-t-lg"></div>
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {featuredProducts.slice(0, 8).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Button onClick={() => navigate('/products')} size="lg">
              查看所有商品
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">為什麼選擇我們</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              我們致力於提供最優質的產品和服務
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-sm">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">客戶評價</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              看看我們的客戶怎麼說
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: '張先生',
                rating: 5,
                comment: '產品品質很好，配送速度也很快，客服態度也很棒！',
                product: 'SP2 主機'
              },
              {
                name: '李小姐',
                rating: 5,
                comment: '口味很正宗，包裝也很精美，會繼續支持！',
                product: 'Ilia 煙彈'
              },
              {
                name: '王同學',
                rating: 5,
                comment: '價格實惠，品質可靠，推薦給朋友們！',
                product: 'Lana 拋棄式'
              }
            ].map((testimonial, index) => (
              <Card key={index} className="border-0 shadow-lg">
                <CardContent className="p-6 text-center">
                  <div className="flex justify-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-600 mb-4 italic">
                    "{testimonial.comment}"
                  </p>
                  <div className="border-t pt-4">
                    <p className="font-semibold text-gray-900">{testimonial.name}</p>
                    <p className="text-sm text-gray-500">購買商品：{testimonial.product}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Age Verification Modal */}
      <Dialog open={showAgeVerification} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">年齡驗證</DialogTitle>
          </DialogHeader>
          <div className="text-center py-6">
            <div className="w-16 h-16 mx-auto mb-4">
              <img 
                src="/images/age_verification_icon.png" 
                alt="年齡驗證" 
                className="w-full h-full object-contain"
              />
            </div>
            <p className="text-gray-600 mb-6">
              本網站銷售的商品僅供18歲以上人士使用
            </p>
            <div className="flex gap-4 justify-center">
              <Button 
                onClick={() => handleAgeConfirm(true)}
                className="bg-green-600 hover:bg-green-700"
              >
                我已滿18歲
              </Button>
              <Button 
                onClick={() => handleAgeConfirm(false)}
                variant="outline"
              >
                我未滿18歲
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Home;
