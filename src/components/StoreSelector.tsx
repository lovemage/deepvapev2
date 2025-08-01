import React, { useState, useEffect } from 'react';
import { MapPin, Store, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface StoreSelectorProps {
  onStoreSelect: (store: any) => void;
  selectedStore?: any;
  required?: boolean;
}

const StoreSelector: React.FC<StoreSelectorProps> = ({ onStoreSelect, selectedStore, required = false }) => {
  const { toast } = useToast();
  
  // 檢查 URL 參數是否有門市資訊（從綠界回調返回）
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const storeId = urlParams.get('CVSStoreID');
    const storeName = urlParams.get('CVSStoreName');
    const storeAddress = urlParams.get('CVSAddress');
    const storeTel = urlParams.get('CVSTelephone');
    
    if (storeId && storeName && storeAddress) {
      const store = {
        storeNumber: storeId,
        storeName: decodeURIComponent(storeName),
        address: decodeURIComponent(storeAddress),
        telNo: storeTel ? decodeURIComponent(storeTel) : '',
      };
      
      onStoreSelect(store);
      
      // 清除 URL 參數
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
      
      toast({
        title: "門市選擇成功",
        description: `已選擇 ${store.storeName}`,
      });
    }
  }, [onStoreSelect, toast]);

  // 開啟綠界物流地圖
  const openECPayMap = () => {
    // 綠界物流地圖 API 參數
    const ecpayMapUrl = "https://logistics.ecpay.com.tw/Express/map";
    const merchantTradeNo = "DS" + Date.now(); // 唯一訂單編號
    
    // 設定回調 URL
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
    const serverReplyURL = `${apiUrl}/api/ecpay/callback`;
    
    const params = {
      MerchantID: "2000132", // 綠界測試商店代號
      LogisticsType: "CVS",
      LogisticsSubType: "UNIMARTC2C", // 7-11 C2C
      IsCollection: "N",
      ServerReplyURL: encodeURIComponent(serverReplyURL),
      ExtraData: "",
      Device: 0, // 0:PC, 1:Mobile
      MerchantTradeNo: merchantTradeNo,
    };

    // 建立查詢字串
    const queryString = Object.entries(params)
      .map(([key, value]) => `${key}=${value}`)
      .join('&');

    // 開啟新視窗或跳轉
    const mapUrl = `${ecpayMapUrl}?${queryString}`;
    
    // 儲存當前購物車狀態
    const cartData = localStorage.getItem('cart-storage');
    if (cartData) {
      sessionStorage.setItem('temp-cart-backup', cartData);
    }
    
    // 跳轉到綠界地圖
    window.location.href = mapUrl;
  };

  return (
    <>
      {/* 顯示選擇的門市或選擇按鈕 */}
      {selectedStore ? (
        <Card className="p-4 bg-green-50 border-green-200">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center mb-2">
                <Store className="h-5 w-5 text-green-600 mr-2" />
                <span className="font-medium text-green-900">已選擇門市</span>
              </div>
              <div className="space-y-1 text-sm">
                <p className="text-gray-700">
                  <span className="font-medium">門市名稱：</span>
                  {selectedStore.storeName}
                </p>
                <p className="text-gray-700">
                  <span className="font-medium">門市地址：</span>
                  {selectedStore.address}
                </p>
                <p className="text-gray-700">
                  <span className="font-medium">門市代號：</span>
                  {selectedStore.storeNumber}
                </p>
                {selectedStore.telNo && (
                  <p className="text-gray-700">
                    <span className="font-medium">電話：</span>
                    {selectedStore.telNo}
                  </p>
                )}
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={openECPayMap}
              className="ml-4"
            >
              重新選擇門市
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          <Button
            onClick={openECPayMap}
            variant="outline"
            className="w-full h-auto py-4 justify-center bg-green-600 hover:bg-green-700 text-white border-green-600"
          >
            <MapPin className="h-5 w-5 mr-2" />
            <span className="font-medium">選擇 7-11 門市</span>
            <ExternalLink className="h-4 w-4 ml-2" />
          </Button>
          
          <div className="text-xs text-gray-500 text-center">
            點擊上方按鈕將開啟 7-11 官方門市地圖進行選擇
          </div>
        </div>
      )}
    </>
  );
};

export default StoreSelector;