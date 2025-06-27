import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingBag, Tag, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useCartStore } from '@/lib/store';
import { cartAPI, couponsAPI, settingsAPI } from '@/lib/api';
import { formatPrice, getImageUrl, getCategoryName } from '@/lib/utils';

const Cart: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const {
    sessionId,
    items,
    totalAmount,
    itemCount,
    appliedCoupon,
    setItems,
    setTotalAmount,
    setItemCount,
    setAppliedCoupon,
    clearCoupon,
    clearCart
  } = useCartStore();

  const [loading, setLoading] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(1000);

  useEffect(() => {
    loadCart();
    loadSettings();
  }, [sessionId]);

  const loadSettings = async () => {
    try {
      const response = await settingsAPI.getPublicSettings();
      if (response.data.free_shipping_threshold) {
        setFreeShippingThreshold(parseInt(response.data.free_shipping_threshold));
      }
    } catch (error) {
      console.warn('載入系統設置失敗，使用默認設置:', error.message);
      // 使用默認值，不影響頁面功能
    }
  };

  const loadCart = async () => {
    if (!sessionId) return;

    try {
      setLoading(true);
      const response = await cartAPI.getCart(sessionId);
      console.log('購物車數據載入:', response.data);
      console.log('購物車商品:', response.data.items);
      response.data.items.forEach((item: any, index: number) => {
        console.log(`商品 ${index}:`, {
          id: item.id,
          name: item.name,
          idType: typeof item.id
        });
      });
      setItems(response.data.items);
      setTotalAmount(response.data.totalAmount);
      setItemCount(response.data.itemCount);
    } catch (error) {
      console.error('載入購物車失敗:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId: number, newQuantity: number) => {
    console.log('updateQuantity 被調用，itemId:', itemId, '類型:', typeof itemId, 'newQuantity:', newQuantity);

    if (newQuantity < 1) return;
    if (!itemId) {
      console.error('無效的商品ID:', itemId);
      toast({
        title: "錯誤",
        description: "無效的商品ID",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('正在更新商品數量，ID:', String(itemId), '新數量:', newQuantity);
      await cartAPI.updateCartItem(String(itemId), { quantity: newQuantity });
      await loadCart();

      toast({
        title: "數量已更新",
        description: "商品數量已成功更新",
      });
    } catch (error) {
      console.error('更新數量失敗:', error);
      toast({
        title: "更新失敗",
        description: "無法更新商品數量，請稍後再試",
        variant: "destructive",
      });
    }
  };

  const removeItem = async (itemId: number) => {
    console.log('removeItem 被調用，itemId:', itemId, '類型:', typeof itemId);

    if (!itemId) {
      console.error('無效的商品ID:', itemId);
      toast({
        title: "錯誤",
        description: "無效的商品ID",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('正在刪除商品，ID:', String(itemId));
      await cartAPI.removeCartItem(String(itemId));
      await loadCart();

      toast({
        title: "商品已移除",
        description: "商品已從購物車中移除",
      });
    } catch (error) {
      console.error('移除商品失敗:', error);
      toast({
        title: "移除失敗",
        description: "無法移除商品，請稍後再試",
        variant: "destructive",
      });
    }
  };

  const applyCoupon = async () => {
    if (!couponCode.trim()) {
      toast({
        title: "請輸入優惠碼",
        description: "請輸入有效的優惠碼",
        variant: "destructive",
      });
      return;
    }

    setCouponLoading(true);
    
    try {
      const response = await couponsAPI.validateCoupon({
        code: couponCode.trim(),
        amount: totalAmount
      });
      
      setAppliedCoupon(response.data);
      setCouponCode('');
      
      toast({
        title: "優惠碼已套用",
        description: `已套用優惠碼 ${response.data.coupon.code}`,
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || '優惠碼無效或已過期';
      toast({
        title: "優惠碼套用失敗",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setCouponLoading(false);
    }
  };

  const removeCoupon = () => {
    clearCoupon();
    toast({
      title: "優惠碼已移除",
      description: "已取消優惠碼套用",
    });
  };

  const clearCartItems = async () => {
    try {
      await cartAPI.clearCart(sessionId);
      clearCart();
      
      toast({
        title: "購物車已清空",
        description: "所有商品已從購物車中移除",
      });
    } catch (error) {
      console.error('清空購物車失敗:', error);
      toast({
        title: "清空失敗",
        description: "無法清空購物車，請稍後再試",
        variant: "destructive",
      });
    }
  };

  const calculateTotals = () => {
    const subtotal = totalAmount;
    // 根據免運費門檻計算運費
    const shipping = subtotal >= freeShippingThreshold ? 0 : 60; // 7-11取貨運費
    const discount = appliedCoupon?.discountAmount || 0;
    const finalTotal = subtotal + shipping - discount;
    
    return { subtotal, shipping, discount, finalTotal, freeShippingThreshold };
  };

  const { subtotal, shipping, discount, finalTotal, freeShippingThreshold: threshold } = calculateTotals();

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-40 bg-gray-200 rounded"></div>
          <div className="h-40 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-16">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="h-12 w-12 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">購物車是空的</h2>
          <p className="text-gray-600 mb-8">還沒有添加任何商品到購物車</p>
          <Button onClick={() => navigate('/products')} size="lg">
            開始購物
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="mb-2"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            返回
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">購物車</h1>
          <p className="text-gray-600">共 {itemCount} 個商品</p>
        </div>
        
        {items.length > 0 && (
          <Button
            variant="outline"
            onClick={clearCartItems}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            清空購物車
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <Card key={item.id} className="overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  {/* Product Image */}
                  <div className="flex-shrink-0">
                    <img
                      src={getImageUrl(item.image_url)}
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded-lg"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCAyMCAyMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjIwIiBoZWlnaHQ9IjIwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGZpbGwtcnVsZT0iZXZlbm9kZCIgY2xpcC1ydWxlPSJldmVub2RkIiBkPSJNNCAzQTIgMiAwIDAwMiA1VjE1QTIgMiAwIDAwNCAzSDRabTEyIDEySDBsNC04IDMgNiAyLTQgMyA2WiIgZmlsbD0iIzlDQTNBRiIvPgo8L3N2Zz4K';
                        target.onerror = null; // 防止無限循環
                      }}
                      loading="lazy"
                    />
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">
                          <Link
                            to={`/products/${item.product_id}`}
                            className="hover:text-purple-600 transition-colors"
                          >
                            {item.name}
                          </Link>
                        </h3>
                        <div className="flex items-center space-x-2 mb-2">
                          <Badge variant="secondary">
                            {getCategoryName(item.category)}
                          </Badge>
                          <span className="text-sm text-gray-500">{item.brand}</span>
                        </div>
                        {item.variant_value && (
                          <p className="text-sm text-gray-600">
                            {item.variant_type}: {item.variant_value}
                          </p>
                        )}
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(item.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Quantity and Price */}
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-12 text-center font-medium">
                          {item.quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      
                      <div className="text-right">
                        <div className="font-bold text-lg">
                          {formatPrice(item.total_price)}
                        </div>
                        <div className="text-sm text-gray-500">
                          單價: {formatPrice(item.price + (item.price_modifier || 0))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Order Summary */}
        <div className="space-y-6">
          {/* Coupon */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Tag className="h-5 w-5 mr-2" />
                優惠碼
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {appliedCoupon ? (
                <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div>
                    <div className="font-medium text-green-800">
                      {appliedCoupon.coupon.code}
                    </div>
                    <div className="text-sm text-green-600">
                      折扣 {formatPrice(appliedCoupon.discountAmount)}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={removeCoupon}
                    className="text-green-700 hover:text-green-800"
                  >
                    移除
                  </Button>
                </div>
              ) : (
                <div className="flex space-x-2">
                  <Input
                    placeholder="輸入優惠碼"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && applyCoupon()}
                  />
                  <Button
                    onClick={applyCoupon}
                    disabled={couponLoading}
                    className="whitespace-nowrap"
                  >
                    {couponLoading ? '驗證中...' : '套用'}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">訂單摘要</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span>小計</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              
              {discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>優惠折扣</span>
                  <span>-{formatPrice(discount)}</span>
                </div>
              )}
              
              <div className="space-y-1">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>運費</span>
                  <span>{shipping === 0 ? '免運費' : formatPrice(shipping)}</span>
                </div>
                {shipping > 0 && subtotal < threshold && (
                  <div className="text-xs text-orange-600">
                    再消費 {formatPrice(threshold - subtotal)} 即可享免運費
                  </div>
                )}
                {shipping === 0 && subtotal >= threshold && (
                  <div className="text-xs text-green-600">
                    🎉 恭喜！您已享有免運費優惠
                  </div>
                )}
              </div>
              
              <Separator />
              
              <div className="flex justify-between text-lg font-bold">
                <span>總計</span>
                <span className="text-purple-600">{formatPrice(finalTotal)}</span>
              </div>

              {/* Payment Options */}
              <div className="space-y-3 mt-6">
                <h4 className="font-medium text-gray-900">付款方式</h4>
                
                {/* 7-11 取貨付款 */}
                <div className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors">
                  <div className="flex items-center space-x-3">
                    <img 
                      src="/images/7-11_tklogo.jpg" 
                      alt="7-11取貨付款" 
                      className="w-12 h-8 object-contain"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                        if (nextElement) nextElement.style.display = 'block';
                      }}
                    />
                    <div 
                      className="w-12 h-8 bg-green-600 rounded flex items-center justify-center text-white text-xs font-bold hidden"
                    >
                      7-11
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">7-ELEVEN 取貨付款</div>
                      <div className="text-sm text-gray-600">到店取貨，現金付款</div>
                    </div>
                  </div>
                </div>

                {/* 其他付款方式 */}
                <div className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors opacity-60">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-8 bg-blue-600 rounded flex items-center justify-center text-white text-xs font-bold">
                      信用卡
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">信用卡付款</div>
                      <div className="text-sm text-gray-600">即將開放</div>
                    </div>
                  </div>
                </div>
              </div>

              <Button 
                className="w-full mt-6" 
                size="lg"
                onClick={() => navigate('/checkout')}
              >
                確認訂購 - 7-11取貨付款
              </Button>
              
              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate('/products')}
              >
                繼續購物
              </Button>
            </CardContent>
          </Card>

          {/* Security Info */}
          <div className="text-center text-sm text-gray-500">
            <p>🔒 安全購物 • 資料加密保護</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
