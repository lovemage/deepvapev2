import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShoppingCart, Heart, ArrowLeft, Star, Truck, Shield, RotateCcw } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Product, ProductVariant } from '@/lib/store';
import { formatPrice, getCategoryName, getStockStatus, getImageUrl } from '@/lib/utils';
import { useCartStore } from '@/lib/store';
import { cartAPI, productsAPI } from '@/lib/api';
import SEO, { createProductStructuredData, createBreadcrumbStructuredData } from '@/components/SEO';

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { sessionId, setItems, setTotalAmount, setItemCount } = useCartStore();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        const response = await productsAPI.getProduct(id);
        setProduct(response.data);
        
        // 如果有變體，預設選擇第一個有庫存的變體
        if (response.data.variants && response.data.variants.length > 0) {
          const firstAvailableVariant = response.data.variants.find(v => v.stock > 0);
          setSelectedVariant(firstAvailableVariant || response.data.variants[0]);
        }
      } catch (error) {
        console.error('獲取產品詳情失敗:', error);
        toast({
          title: "載入失敗",
          description: "無法載入產品詳情",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [id, toast]);

  const addToCart = async () => {
    if (!product) return;

    const availableStock = selectedVariant ? selectedVariant.stock : product.stock;
    if (availableStock === 0) {
      toast({
        title: "商品缺貨",
        description: "此商品目前缺貨，無法加入購物車",
        variant: "destructive",
      });
      return;
    }

    if (quantity > availableStock) {
      toast({
        title: "庫存不足",
        description: `最多只能加入 ${availableStock} 個`,
        variant: "destructive",
      });
      return;
    }

    setIsAddingToCart(true);

    try {
      await cartAPI.addToCart({
        sessionId,
        productId: product.id,
        variantId: selectedVariant?.id,
        quantity,
      });

      // 重新獲取購物車數據
      const cartResponse = await cartAPI.getCart(sessionId);
      setItems(cartResponse.data.items);
      setTotalAmount(cartResponse.data.totalAmount);
      setItemCount(cartResponse.data.itemCount);

      toast({
        title: "已加入購物車",
        description: `${product.name} ${selectedVariant ? `(${selectedVariant.variant_value})` : ''} x${quantity} 已成功加入購物車`,
      });
    } catch (error) {
      console.error('加入購物車失敗:', error);
      toast({
        title: "加入購物車失敗",
        description: "請稍後再試",
        variant: "destructive",
      });
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const getCurrentPrice = () => {
    if (!product) return 0;
    const basePrice = product.price;
    const modifier = selectedVariant?.price_modifier || 0;
    return basePrice + modifier;
  };

  const getCurrentStock = () => {
    return selectedVariant ? selectedVariant.stock : product?.stock || 0;
  };

  const stockStatus = getStockStatus(getCurrentStock());

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-gray-200 rounded-lg h-96"></div>
            <div className="space-y-4">
              <div className="bg-gray-200 rounded h-8"></div>
              <div className="bg-gray-200 rounded h-6"></div>
              <div className="bg-gray-200 rounded h-4"></div>
              <div className="bg-gray-200 rounded h-12"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">產品不存在</h2>
          <Button onClick={() => navigate('/products')}>
            返回商品列表
          </Button>
        </div>
      </div>
    );
  }

  // 生成麵包屑導航
  const breadcrumbs = [
    { name: '首頁', url: '/' },
    { name: '商品列表', url: '/products' },
    { name: getCategoryName(product.category), url: `/products?category=${product.category}` },
    { name: product.name, url: `/products/${product.id}` }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <SEO
        title={`${product.name} - ${product.brand} ${getCategoryName(product.category)}`}
        description={product.description}
        keywords={`${product.name},${product.brand},${getCategoryName(product.category)},電子煙,${product.category === 'host' ? '電子煙主機' : product.category === 'cartridge' ? '煙彈' : '拋棄式電子煙'}`}
        image={getImageUrl(product.image_url)}
        url={`/products/${product.id}`}
        type="product"
        structuredData={{
          ...createProductStructuredData(product),
          breadcrumb: createBreadcrumbStructuredData(breadcrumbs)
        }}
      />
      {/* Breadcrumb */}
      <div className="flex items-center space-x-2 text-sm text-gray-500 mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          className="p-0 h-auto hover:bg-transparent hover:text-purple-600"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          返回
        </Button>
        <span>/</span>
        <span>{getCategoryName(product.category)}</span>
        <span>/</span>
        <span className="text-gray-900">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Product Image */}
        <div className="space-y-4">
          <Card className="overflow-hidden">
            <div className="relative bg-gray-100">
              <img
                src={imageError ? '/images/placeholder.jpg' : getImageUrl(product.image_url)}
                alt={product.name}
                className="w-full h-96 object-cover"
                onError={handleImageError}
              />
              {stockStatus.status === 'out-of-stock' && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <Badge variant="destructive" className="text-lg px-4 py-2">
                    缺貨
                  </Badge>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          {/* Header */}
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <Badge className="bg-purple-500 hover:bg-purple-600">
                {getCategoryName(product.category)}
              </Badge>
              <span className="text-sm text-gray-500 uppercase tracking-wide">
                {product.brand}
              </span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {product.name}
            </h1>
            
            {/* Rating */}
            <div className="flex items-center space-x-2 mb-4">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className="h-4 w-4 fill-yellow-400 text-yellow-400"
                  />
                ))}
              </div>
              <span className="text-sm text-gray-500">(4.8) 128 評價</span>
            </div>
          </div>

          {/* Price */}
          <div className="space-y-2">
            <div className="flex items-baseline space-x-3">
              <span className="text-3xl font-bold text-gray-900">
                {formatPrice(getCurrentPrice())}
              </span>
              {selectedVariant?.price_modifier && selectedVariant.price_modifier > 0 && (
                <span className="text-lg text-gray-500 line-through">
                  {formatPrice(product.price)}
                </span>
              )}
            </div>
            <div className={`text-sm ${stockStatus.color}`}>
              {stockStatus.text}
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">產品描述</h3>
            <p className="text-gray-600 leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Variants */}
          {product.variants && product.variants.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900">選擇 {product.variants[0].variant_type}</h3>
              <Select
                value={selectedVariant?.id.toString()}
                onValueChange={(value) => {
                  const variant = product.variants?.find(v => v.id.toString() === value);
                  setSelectedVariant(variant || null);
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={`選擇${product.variants[0].variant_type}`} />
                </SelectTrigger>
                <SelectContent>
                  {product.variants.map((variant) => (
                    <SelectItem 
                      key={variant.id} 
                      value={variant.id.toString()}
                      disabled={variant.stock === 0}
                    >
                      <div className="flex justify-between items-center w-full">
                        <span>{variant.variant_value}</span>
                        <div className="flex items-center space-x-2 ml-4">
                          {variant.price_modifier > 0 && (
                            <span className="text-sm text-green-600">
                              +{formatPrice(variant.price_modifier)}
                            </span>
                          )}
                          <span className="text-xs text-gray-500">
                            庫存: {variant.stock}
                          </span>
                          {variant.stock === 0 && (
                            <Badge variant="destructive" className="text-xs">
                              缺貨
                            </Badge>
                          )}
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Quantity */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900">數量</h3>
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
              >
                -
              </Button>
              <span className="w-12 text-center font-semibold">{quantity}</span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setQuantity(Math.min(getCurrentStock(), quantity + 1))}
                disabled={quantity >= getCurrentStock()}
              >
                +
              </Button>
              <span className="text-sm text-gray-500 ml-4">
                最多 {getCurrentStock()} 個
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <Button size="lg" className="w-full" onClick={addToCart} disabled={isAddingToCart || stockStatus.status === 'out-of-stock'}>
              <ShoppingCart className="h-5 w-5 mr-2" />
              {isAddingToCart ? '加入中...' : '加入購物車'}
            </Button>
          </div>

          {/* Service Guarantees */}
          <Card className="mt-6 border-dashed">
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-2">
                  <Truck className="h-5 w-5 text-purple-500" />
                  <div>
                    <div className="font-medium text-sm">免費配送</div>
                    <div className="text-xs text-gray-500">全台配送 安全無憂</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-purple-500" />
                  <div>
                    <div className="font-medium text-sm">品質保證</div>
                    <div className="text-xs text-gray-500">專業品質 正品保證</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <RotateCcw className="h-5 w-5 text-purple-500" />
                  <div>
                    <div className="font-medium text-sm">退換貨</div>
                    <div className="text-xs text-gray-500">退換服務 七日無理由</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail; 