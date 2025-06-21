import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Phone, MessageCircle, Store, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useCartStore } from '@/lib/store';
import { formatPrice } from '@/lib/utils';
import { settingsAPI, ordersAPI } from '@/lib/api';

interface CustomerInfo {
  name: string;
  phone: string;
  lineId: string;
  storeNumber: string;
  storeName: string;
}

const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { items, totalAmount, appliedCoupon, clearCart } = useCartStore();
  
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    name: '',
    phone: '',
    lineId: '',
    storeNumber: '',
    storeName: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderCompleted, setOrderCompleted] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(1000);

  useEffect(() => {
    // 如果購物車為空，重定向到購物車頁面
    if (items.length === 0 && !orderCompleted) {
      navigate('/cart');
    }
    loadSettings();
  }, [items, navigate, orderCompleted]);

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

  const calculateTotals = () => {
    const subtotal = totalAmount;
    // 根據免運費門檻計算運費
    const shipping = subtotal >= freeShippingThreshold ? 0 : 60; // 7-11取貨運費
    const discount = appliedCoupon?.discountAmount || 0;
    const finalTotal = subtotal + shipping - discount;
    
    return { subtotal, shipping, discount, finalTotal };
  };

  const { subtotal, shipping, discount, finalTotal } = calculateTotals();

  const generateOrderId = () => {
    return `ORD${Date.now()}`;
  };

  const submitOrderWithNotification = async (orderData: any) => {
    try {
      const response = await ordersAPI.submitOrder(orderData);
      return response.data;
    } catch (error) {
      console.error('提交訂單失敗:', error);
      throw error;
    }
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 驗證必填欄位
    if (!customerInfo.name || !customerInfo.phone) {
      toast({
        title: "請填寫必要資訊",
        description: "收件人姓名和電話為必填欄位",
        variant: "destructive",
      });
      return;
    }

    if (!customerInfo.storeNumber && !customerInfo.storeName) {
      toast({
        title: "請填寫取貨門市",
        description: "請填寫取件店號或取件店名",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const newOrderId = generateOrderId();
      
      const orderData = {
        orderId: newOrderId,
        customerInfo,
        items,
        totals: { subtotal, shipping, discount, finalTotal },
        appliedCoupon,
        createdAt: new Date().toISOString()
      };

      // 提交訂單並發送Telegram通知
      const result = await submitOrderWithNotification(orderData);
      
      // 清空購物車
      clearCart();
      
      // 設置訂單完成狀態
      setOrderId(newOrderId);
      setOrderCompleted(true);
      
      if (result.telegramSent) {
        toast({
          title: "訂單提交成功！",
          description: "您的訂單已成功提交，我們會盡快處理",
        });
      } else {
        toast({
          title: "訂單提交成功！",
          description: "您的訂單已成功提交，通知系統暫時異常，但訂單已記錄",
        });
      }
    } catch (error) {
      console.error('提交訂單失敗:', error);
      toast({
        title: "訂單提交失敗",
        description: "請稍後再試或聯繫客服",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof CustomerInfo, value: string) => {
    setCustomerInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // 訂單完成頁面
  if (orderCompleted) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-4">訂單提交成功！</h1>
          <p className="text-gray-600 mb-2">您的訂單編號：</p>
          <p className="text-2xl font-bold text-purple-600 mb-6">{orderId}</p>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <h3 className="font-semibold text-blue-900 mb-2">接下來的流程：</h3>
            <ul className="text-blue-800 text-sm space-y-1 text-left">
              <li>1. 我們已收到您的訂單，會盡快為您準備商品</li>
              <li>2. 商品準備完成後會通知您取貨資訊</li>
              <li>3. 請攜帶身份證件到指定7-ELEVEN門市取貨付款</li>
              <li>4. 如有任何問題，請聯繫客服</li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={() => navigate('/')} size="lg">
              回到首頁
            </Button>
            <Button variant="outline" onClick={() => navigate('/products')} size="lg">
              繼續購物
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center mb-8">
        <Button
          variant="ghost"
          onClick={() => navigate('/cart')}
          className="mr-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          返回購物車
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">確認訂購</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 客戶資料表單 */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Store className="h-5 w-5 mr-2" />
                7-ELEVEN 取貨付款資訊
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitOrder} className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name" className="flex items-center">
                      <span className="text-red-500 mr-1">*</span>
                      收件人姓名
                    </Label>
                    <Input
                      id="name"
                      value={customerInfo.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="請輸入收件人姓名"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone" className="flex items-center">
                      <Phone className="h-4 w-4 mr-2" />
                      <span className="text-red-500 mr-1">*</span>
                      聯絡電話
                    </Label>
                    <Input
                      id="phone"
                      value={customerInfo.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="請輸入聯絡電話"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="lineId" className="flex items-center">
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Line ID
                    </Label>
                    <Input
                      id="lineId"
                      value={customerInfo.lineId}
                      onChange={(e) => handleInputChange('lineId', e.target.value)}
                      placeholder="請輸入Line ID（選填）"
                    />
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="font-medium flex items-center">
                      <MapPin className="h-4 w-4 mr-2" />
                      取貨門市資訊（二選一）
                    </h3>
                    
                    <div>
                      <Label htmlFor="storeNumber">取件店號</Label>
                      <Input
                        id="storeNumber"
                        value={customerInfo.storeNumber}
                        onChange={(e) => handleInputChange('storeNumber', e.target.value)}
                        placeholder="例如：7111874"
                      />
                    </div>

                    <div className="text-center text-gray-500">或</div>

                    <div>
                      <Label htmlFor="storeName">取件店名</Label>
                      <Input
                        id="storeName"
                        value={customerInfo.storeName}
                        onChange={(e) => handleInputChange('storeName', e.target.value)}
                        placeholder="例如：7-ELEVEN 波卡門市3店"
                      />
                    </div>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full" 
                  size="lg"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? '提交中...' : '確認訂購'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* 訂單摘要 */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>訂單摘要</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 商品列表 */}
              <div className="space-y-3">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-medium">{item.name}</h4>
                      <p className="text-sm text-gray-600">
                        {item.brand} • 數量: {item.quantity}
                      </p>
                      {item.variant_value && (
                        <p className="text-sm text-gray-600">
                          {item.variant_type}: {item.variant_value}
                        </p>
                      )}
                    </div>
                    <div className="font-medium">
                      {formatPrice(item.total_price)}
                    </div>
                  </div>
                ))}
              </div>

              <Separator />

              {/* 金額明細 */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>商品小計</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span>運費</span>
                  <span>{formatPrice(shipping)}</span>
                </div>
                
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>優惠折扣 ({appliedCoupon?.coupon.code})</span>
                    <span>-{formatPrice(discount)}</span>
                  </div>
                )}
                
                <Separator />
                
                <div className="flex justify-between text-lg font-bold">
                  <span>總計</span>
                  <span className="text-purple-600">{formatPrice(finalTotal)}</span>
                </div>
              </div>

              {/* 付款方式 */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
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
                  <div>
                    <div className="font-medium">7-ELEVEN 取貨付款</div>
                    <div className="text-sm text-gray-600">到店取貨，現金付款</div>
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

export default Checkout; 