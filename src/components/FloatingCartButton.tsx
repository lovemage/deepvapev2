import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/lib/store';

interface FloatingCartButtonProps {
  className?: string;
}

const FloatingCartButton: React.FC<FloatingCartButtonProps> = ({ className = '' }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { itemCount } = useCartStore();

  // 判斷是否應該顯示懸浮按鈕
  const shouldShow = () => {
    const currentPath = location.pathname;
    // 在購物車頁面和結帳頁面不顯示
    return !currentPath.includes('/cart') && !currentPath.includes('/checkout');
  };

  // 如果不應該顯示，返回 null
  if (!shouldShow()) {
    return null;
  }

  const handleCartClick = () => {
    navigate('/cart');
  };

  const handleLineClick = () => {
    // 開啟 Line 聯絡方式
    window.open('https://line.me/ti/p/euNh8K-s3e', '_blank');
  };

  return (
    <div className={`fixed bottom-6 right-6 z-50 flex flex-col space-y-3 ${className}`}>
      {/* Line 聯絡按鈕 */}
      <Button
        onClick={handleLineClick}
        size="lg"
        className="relative h-16 w-16 rounded-full
                   bg-green-500/20 backdrop-blur-md border border-green-400/30
                   hover:bg-green-500/30 hover:border-green-400/40
                   shadow-xl hover:shadow-2xl
                   transition-all duration-500 ease-out
                   transform hover:scale-110 active:scale-95
                   before:absolute before:inset-0 before:rounded-full
                   before:bg-gradient-to-br before:from-green-400/40 before:to-transparent
                   before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300"
        aria-label="Line 聯絡客服"
      >
        <div className="relative z-10 flex flex-col items-center justify-center">
          <MessageCircle className="h-5 w-5 text-green-600 mb-1 drop-shadow-sm transition-colors duration-300" />
          <span className="text-[10px] font-bold text-green-600 leading-none">LINE</span>
        </div>

        {/* 液態波紋效果 */}
        <div className="absolute inset-0 rounded-full overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-green-400/10 to-transparent
                          rounded-full transform rotate-45 scale-150
                          transition-transform duration-700 ease-out
                          hover:scale-200 hover:rotate-90"></div>
        </div>
      </Button>

      {/* 購物車按鈕 */}
      <Button
        onClick={handleCartClick}
        size="lg"
        className="relative h-16 w-16 rounded-full
                   bg-white/20 backdrop-blur-md border border-white/30
                   hover:bg-white/30 hover:border-white/40
                   shadow-xl hover:shadow-2xl
                   transition-all duration-500 ease-out
                   transform hover:scale-110 active:scale-95
                   before:absolute before:inset-0 before:rounded-full
                   before:bg-gradient-to-br before:from-white/40 before:to-transparent
                   before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300"
        aria-label={`購物車 - ${itemCount} 件商品`}
      >
        <ShoppingCart className="h-7 w-7 text-gray-700 relative z-10
                                 drop-shadow-sm transition-colors duration-300
                                 group-hover:text-gray-800" />

        {/* 數量徽章 */}
        {itemCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-gradient-to-br from-red-400 to-red-600
                           text-white text-xs font-bold rounded-full h-6 w-6
                           flex items-center justify-center
                           shadow-lg border-2 border-white/50
                           animate-bounce">
            {itemCount > 99 ? '99+' : itemCount}
          </span>
        )}

        {/* 液態波紋效果 */}
        <div className="absolute inset-0 rounded-full overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent
                          rounded-full transform rotate-45 scale-150
                          transition-transform duration-700 ease-out
                          hover:scale-200 hover:rotate-90"></div>
        </div>
      </Button>
    </div>
  );
};

export default FloatingCartButton;
