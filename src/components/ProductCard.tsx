import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, Star } from 'lucide-react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Product, useSettingsStore } from '@/lib/store';
import { formatPrice, getCategoryName, getStockStatus, getImageUrl } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
}

// 全局圖片狀態管理
interface ImageState {
  loaded: boolean;
  error: boolean;
}

const globalImageStates = new Map<string, ImageState>();

// SVG placeholder to avoid network requests
const PlaceholderSVG = () => (
  <svg 
    className="w-full h-48 bg-gray-200 text-gray-400" 
    fill="currentColor" 
    viewBox="0 0 20 20"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path 
      fillRule="evenodd" 
      d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" 
      clipRule="evenodd"
    />
  </svg>
);

const ProductCard: React.FC<ProductCardProps> = React.memo(({ product }) => {
  const navigate = useNavigate();
  const imageUrl = getImageUrl(product.image_url);
  const { settings } = useSettingsStore();

  // 從全局狀態獲取圖片狀態，如果不存在則初始化
  const getImageState = (): ImageState => {
    if (!globalImageStates.has(imageUrl)) {
      globalImageStates.set(imageUrl, { loaded: false, error: false });
    }
    return globalImageStates.get(imageUrl)!;
  };

  const [imageState, setImageState] = useState<ImageState>(getImageState);
  const stockStatus = getStockStatus(product.stock);

  const viewDetails = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/products/${product.id}`);
  };

  const updateImageState = useCallback((newState: Partial<ImageState>) => {
    const updatedState = { ...getImageState(), ...newState };
    globalImageStates.set(imageUrl, updatedState);
    setImageState(updatedState);
  }, [imageUrl]);

  const handleImageError = useCallback(() => {
    console.log('圖片載入失敗:', imageUrl);
    updateImageState({ error: true, loaded: true });
  }, [imageUrl, updateImageState]);

  const handleImageLoad = useCallback(() => {
    updateImageState({ loaded: true, error: false });
  }, [imageUrl, updateImageState]);

  // 監聽全局狀態變化
  useEffect(() => {
    const currentState = getImageState();
    setImageState(currentState);
  }, [imageUrl]);

  return (
    <Card 
      key={product.id} 
      className="group overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
    >
      <Link to={`/products/${product.id}`}>
        {/* Product Image */}
        <div className="relative overflow-hidden bg-gray-100">
          {imageState.error ? (
            <PlaceholderSVG />
          ) : (
            <>
              <img
                src={imageUrl}
                alt={product.name}
                className={`w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300 ${
                  imageState.loaded ? 'opacity-100' : 'opacity-0'
                }`}
                onError={handleImageError}
                onLoad={handleImageLoad}
                loading="lazy"
              />
              {!imageState.loaded && (
                <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
                  <div className="text-gray-400 text-sm">載入中...</div>
                </div>
              )}
            </>
          )}
          
          {/* Overlay Buttons */}
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center space-x-2">
            <Button
              size="icon"
              variant="secondary"
              className="h-8 w-8 rounded-full bg-white/90 hover:bg-white"
            >
              <Eye className="h-4 w-4" />
            </Button>
          </div>

          {/* Category Badge */}
          <Badge className="absolute top-2 left-2 bg-purple-500 hover:bg-purple-600">
            {getCategoryName(product.category)}
          </Badge>

          {/* Stock Status Badge */}
          {stockStatus.status === 'out-of-stock' && (
            <Badge variant="destructive" className="absolute top-2 right-2">
              缺貨
            </Badge>
          )}
          {stockStatus.status === 'low-stock' && (
            <Badge variant="outline" className="absolute top-2 right-2 bg-orange-500 text-white border-orange-500">
              庫存不足
            </Badge>
          )}
        </div>

        <CardContent className="p-4">
          {/* Brand */}
          <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
            {product.brand}
          </div>

          {/* Product Name */}
          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-purple-600 transition-colors">
            {product.name}
          </h3>

          {/* Description - 根據設置控制顯示 */}
          {settings.show_product_preview && (
            <p className="text-sm text-gray-600 line-clamp-2 mb-3">
              {product.description}
            </p>
          )}

          {/* Rating (Mock) - 根據設置控制顯示 */}
          {settings.show_product_reviews && (
            <div className="flex items-center space-x-1 mb-3">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className="h-3 w-3 fill-yellow-400 text-yellow-400"
                  />
                ))}
              </div>
              <span className="text-xs text-gray-500">(4.8)</span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-baseline space-x-2">
            <span className="text-xl font-bold text-gray-900">
              {formatPrice(product.price)}
            </span>
            {/* Mock original price for discount effect */}
            <span className="text-sm text-gray-500 line-through">
              {formatPrice(product.price * 1.2)}
            </span>
          </div>

          {/* Stock Info */}
          <div className="mt-2">
            <span className={`text-xs ${stockStatus.color}`}>
              {stockStatus.text}
            </span>
          </div>
        </CardContent>
      </Link>

      <CardFooter className="p-4 pt-0">
        <Button
          onClick={viewDetails}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0"
          size="sm"
        >
          <div className="flex items-center space-x-2">
            <Eye className="h-4 w-4" />
            <span>查看詳情</span>
          </div>
        </Button>
      </CardFooter>
    </Card>
  );
});

ProductCard.displayName = 'ProductCard';

export default ProductCard;
