import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Zap, Shield, Truck, HeartHandshake, Star, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import ProductCard from '@/components/ProductCard';
import SEO, { createOrganizationStructuredData, createSearchBoxStructuredData } from '@/components/SEO';
import { useProductStore, useSettingsStore } from '@/lib/store';
import { productsAPI, settingsAPI } from '@/lib/api';
import { getCategoryName } from '@/lib/utils';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { setSelectedCategory } = useProductStore();
  const { loadSettings: loadDisplaySettings } = useSettingsStore();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAgeVerification, setShowAgeVerification] = useState(false);
  const [heroImageUrl, setHeroImageUrl] = useState('/images/itay-kabalo-b3sel60dv8a-unsplash.jpg');
  const [carouselImages, setCarouselImages] = useState<string[]>([]);
  const [carouselEnabled, setCarouselEnabled] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [popupImageUrl, setPopupImageUrl] = useState<string>('/dpprompt.png');
  const [popupEnabled, setPopupEnabled] = useState(true);
  const [popupCouponCode, setPopupCouponCode] = useState('DEEP2025');
  const featuredRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 檢查是否已經驗證過年齡，並且彈窗是否啟用
    const ageVerified = localStorage.getItem('ageVerified');
    if (!ageVerified && popupEnabled) {
      setShowAgeVerification(true);
    }
    loadFeaturedProducts();
    loadBrands();
    loadSettings();
  }, [popupEnabled]);

  // 輪播圖片自動切換
  useEffect(() => {
    if (carouselEnabled && carouselImages.length > 1) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % carouselImages.length);
      }, 2500); // 2.5秒切換一次

      return () => clearInterval(interval);
    }
  }, [carouselEnabled, carouselImages.length]);

  const loadSettings = async () => {
    try {
      const response = await settingsAPI.getPublicSettings();
      if (response.data.hero_image_url) {
        setHeroImageUrl(response.data.hero_image_url);
      }

      // 載入輪播設置
      if (response.data.hero_carousel_enabled === 'true') {
        const images = [
          response.data.hero_carousel_image_1,
          response.data.hero_carousel_image_2
        ].filter(Boolean);
        
        if (images.length > 0) {
          setCarouselImages(images);
          setCarouselEnabled(true);
        }
      }

      // 載入彈窗設置
      if (response.data.popup_image_url) {
        setPopupImageUrl(response.data.popup_image_url);
      }
      setPopupEnabled(response.data.popup_enabled === 'true');
      if (response.data.popup_coupon_code) {
        setPopupCouponCode(response.data.popup_coupon_code);
      }

      // 載入商品顯示設置
      await loadDisplaySettings();
    } catch (error) {
      console.warn('載入系統設置失敗，使用默認設置:', error.message);
      // 使用默認圖片，不影響頁面加載
    }
  };

  const loadBrands = async () => {
    try {
      const response = await productsAPI.getBrands();
      // 排序品牌，按產品數量降序
      const sortedBrands = response.data.sort((a, b) => b.count - a.count);
      setBrands(sortedBrands);
    } catch (error) {
      console.error('載入品牌失敗:', error);
    }
  };

  const loadFeaturedProducts = async () => {
    try {
      setLoading(true);
      // 獲取每個分類的推薦產品
      const categories = ['host', 'cartridge', 'disposable', 'oil'];
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

  const handleBrandClick = (brand: string) => {
    navigate(`/products?brand=${encodeURIComponent(brand)}`);
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
      <SEO
        title="DeepVape 電子煙商城 - 專業電子煙線上購物平台"
        description="DeepVape 是台灣專業的電子煙線上商城，提供各大品牌電子煙主機、煙彈、拋棄式電子煙。正品保證，快速配送，優質售後服務。"
        keywords="電子煙,電子煙主機,煙彈,拋棄式電子煙,IQOS,JUUL,Vaporesso,SP2,Ilia,HTA,Lana,台灣電子煙,電子煙商城"
        url="/"
        structuredData={{
          ...createOrganizationStructuredData(),
          ...createSearchBoxStructuredData()
        }}
      />
      {/* Hero Section */}
      <section 
        className="relative text-white overflow-hidden"
      >
        {/* 輪播圖片容器 */}
        <div className="relative">
          {carouselEnabled && carouselImages.length > 0 ? (
            // 輪播模式
            carouselImages.map((image, index) => (
              <img
                key={index}
                src={image}
                alt={`輪播圖片 ${index + 1}`}
                className={`w-full h-auto object-cover transition-opacity duration-1000 ${
                  index === currentImageIndex ? 'opacity-100' : 'opacity-0 absolute inset-0'
                }`}
              />
            ))
          ) : (
            // 單張圖片模式
            <img
              src={heroImageUrl}
              alt="首頁橫幅圖片"
              className="w-full h-auto object-cover"
            />
          )}
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

          {/* 品牌標籤 */}
          {brands.length > 0 && (
            <div className="mb-8">
              <div className="flex flex-wrap gap-2 justify-center">
                {brands.map((brand) => (
                  <Badge
                    key={brand.brand}
                    variant="secondary"
                    className="cursor-pointer bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 transition-all text-sm px-4 py-2 border-0"
                    onClick={() => handleBrandClick(brand.brand)}
                  >
                    {brand.brand}
                    <span className="ml-1 text-xs opacity-90">({brand.count})</span>
                  </Badge>
                ))}
              </div>
            </div>
          )}

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
        <DialogContent className="max-w-[90vw] sm:max-w-[400px] p-0 overflow-hidden bg-[#c8302e]">
          <DialogTitle className="sr-only">
            年齡驗證 - DEEPVAPE 優惠活動
          </DialogTitle>
          <DialogDescription className="sr-only">
            未滿18歲禁止進入，請確認您的年齡並獲取優惠碼
          </DialogDescription>
          <div className="relative">
            <img 
              src={popupImageUrl} 
              alt="DEEPVAPE NEW OPEN 優惠" 
              className="w-full h-auto"
            />
            <div className="p-4 sm:p-6 bg-white">
              <p className="text-gray-700 text-center mb-3 sm:mb-4 font-medium text-sm sm:text-base">
                未滿18歲禁止進入
              </p>
              <div className="bg-gray-100 rounded-lg p-3 sm:p-4 mb-3 sm:mb-4">
                <p className="text-xs sm:text-sm text-gray-600 mb-2 text-center">優惠碼</p>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={popupCouponCode}
                    readOnly
                    className="flex-1 px-2 sm:px-3 py-2 bg-white border border-gray-300 rounded-md text-center font-bold text-base sm:text-lg"
                  />
                  <Button
                    onClick={() => {
                      navigator.clipboard.writeText(popupCouponCode);
                      alert('優惠碼已複製！');
                    }}
                    className="bg-[#c8302e] hover:bg-[#a02825] text-white text-sm sm:text-base px-3 sm:px-4"
                    size="sm"
                  >
                    複製
                  </Button>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 justify-center">
                <Button
                  onClick={() => handleAgeConfirm(true)}
                  className="bg-[#c8302e] hover:bg-[#a02825] text-white px-4 sm:px-6 text-sm sm:text-base"
                  size="sm"
                >
                  我已滿18歲
                </Button>
                <Button
                  onClick={() => handleAgeConfirm(false)}
                  variant="outline"
                  className="border-[#c8302e] text-[#c8302e] hover:bg-[#c8302e] hover:text-white px-4 sm:px-6 text-sm sm:text-base"
                  size="sm"
                >
                  我未滿18歲
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Home;
