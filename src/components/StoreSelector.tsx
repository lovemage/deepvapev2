import React, { useState, useEffect, useMemo } from 'react';
import { MapPin, Store, ExternalLink, Search, X, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

// 7-11門市資料類型
interface StoreData {
  id: string;
  name: string;
  tel: string;
  address: string;
  lat: number;
  lng: number;
  city: string;
  area: string;
  service: string[];
}

interface StoreSelectorProps {
  onStoreSelect: (store: any) => void;
  selectedStore?: any;
  required?: boolean;
  onManualInput?: (field: string, value: string) => void;
}

const StoreSelector: React.FC<StoreSelectorProps> = ({ onStoreSelect, selectedStore, required = false, onManualInput }) => {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<'name' | 'address' | 'number'>('address');
  const [searchResults, setSearchResults] = useState<StoreData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
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

  // 搜尋門市
  const searchStores = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setIsLoading(true);
    
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const response = await fetch(
        `${apiUrl}/api/stores/search?query=${encodeURIComponent(searchQuery)}&type=${searchType}&limit=10`
      );
      
      if (!response.ok) {
        throw new Error('搜尋門市失敗');
      }
      
      const data = await response.json();
      setSearchResults(data.stores || []);
    } catch (error) {
      console.error('搜尋門市錯誤:', error);
      toast({
        title: "搜尋失敗",
        description: "無法搜尋門市，請稍後再試",
        variant: "destructive"
      });
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  // 選擇門市
  const selectStore = (store: StoreData) => {
    const selectedStoreData = {
      storeNumber: store.id,
      storeName: store.name,
      address: store.address,
      telNo: store.tel,
      lat: store.lat,
      lng: store.lng,
      city: store.city,
      area: store.area,
      services: store.service
    };
    
    onStoreSelect(selectedStoreData);
    setIsDialogOpen(false);
    setSearchQuery('');
    setSearchResults([]);
    
    toast({
      title: "門市選擇成功",
      description: `已選擇 ${store.name}`,
    });
  };

  // 開啟綠界物流地圖
  const openECPayMap = () => {
    // 綠界物流地圖 API 參數
    const ecpayMapUrl = "https://logistics.ecpay.com.tw/Express/map";
    const merchantTradeNo = "DS" + Date.now(); // 唯一訂單編號
    
    // 設定回調 URL
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
    const serverReplyURL = `${apiUrl}/api/ecpay/callback`;
    
    const params = {
      MerchantID: import.meta.env.VITE_ECPAY_MERCHANT_ID || "2000132", // 綠界商店代號
      LogisticsType: "CVS",
      LogisticsSubType: "UNIMARTC2C", // 7-11 C2C
      IsCollection: "N",
      ServerReplyURL: encodeURIComponent(serverReplyURL),
      ExtraData: "",
      Device: 0, // 0:PC, 1:Mobile
      MerchantTradeNo: merchantTradeNo,
      // 綠界加密參數
      HashKey: import.meta.env.VITE_ECPAY_HASH_KEY || "m8rtvx8U15iaMv2m",
      HashIV: import.meta.env.VITE_ECPAY_HASH_IV || "jovPWG9NuT0lArNc",
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

  // 開啟Google地圖導航
  const openGoogleMaps = (lat: number, lng: number, address: string) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&destination_place_id=${encodeURIComponent(address)}`;
    window.open(url, '_blank');
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
                {selectedStore.lat && selectedStore.lng && (
                  <div className="mt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openGoogleMaps(selectedStore.lat, selectedStore.lng, selectedStore.address)}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      <Navigation className="h-3 w-3 mr-1" />
                      開啟導航
                    </Button>
                  </div>
                )}
              </div>
            </div>
            <div className="flex flex-col gap-2 ml-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsDialogOpen(true)}
              >
                重新選擇門市
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={openECPayMap}
              >
                綠界地圖選擇
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-green-600 hover:bg-green-700 text-white border-green-600"
                  >
                    <MapPin className="h-4 w-4 mr-2" />
                    <span className="text-sm">本地搜尋門市</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>搜尋 7-11 門市</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    {/* 搜尋類型選擇 */}
                    <div className="flex gap-2">
                      <Button
                        variant={searchType === 'name' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSearchType('name')}
                      >
                        門市名稱
                      </Button>
                      <Button
                        variant={searchType === 'address' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSearchType('address')}
                      >
                        地址搜尋
                      </Button>
                      <Button
                        variant={searchType === 'number' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSearchType('number')}
                      >
                        門市代號
                      </Button>
                    </div>
                    
                    {/* 搜尋輸入 */}
                    <div className="flex gap-2">
                      <Input
                        placeholder={`請輸入${searchType === 'name' ? '門市名稱' : searchType === 'address' ? '地址' : '門市代號'}`}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && searchStores()}
                      />
                      <Button onClick={searchStores} disabled={isLoading}>
                        <Search className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    {/* 搜尋結果 */}
                    <div className="max-h-96 overflow-y-auto">
                      {isLoading ? (
                        <div className="text-center py-4">搜尋中...</div>
                      ) : searchResults.length > 0 ? (
                        <div className="space-y-2">
                          {searchResults.map((store) => (
                            <Card key={store.id} className="p-3 hover:bg-gray-50 cursor-pointer">
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <h4 className="font-medium text-sm">{store.name}</h4>
                                  <p className="text-xs text-gray-600 mt-1">{store.address}</p>
                                  <p className="text-xs text-gray-500 mt-1">
                                    門市代號: {store.id} | 電話: {store.tel}
                                  </p>
                                  <div className="flex flex-wrap gap-1 mt-2">
                                    {store.service.slice(0, 5).map((service, index) => (
                                      <span key={index} className="text-xs bg-blue-100 text-blue-800 px-1 py-0.5 rounded">
                                        {service}
                                      </span>
                                    ))}
                                    {store.service.length > 5 && (
                                      <span className="text-xs text-gray-500">+{store.service.length - 5} 更多服務</span>
                                    )}
                                  </div>
                                </div>
                                <div className="flex gap-1 ml-2">
                                  <Button
                                    size="sm"
                                    onClick={() => selectStore(store)}
                                  >
                                    選擇
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => openGoogleMaps(store.lat, store.lng, store.address)}
                                  >
                                    <Navigation className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            </Card>
                          ))}
                        </div>
                      ) : searchQuery && !isLoading ? (
                        <div className="text-center py-4 text-gray-500">沒有找到符合的門市</div>
                      ) : null}
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              
              <Button
                onClick={openECPayMap}
                variant="outline"
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white border-blue-600"
              >
                <MapPin className="h-4 w-4 mr-2" />
                <span className="text-sm">綠界地圖選擇</span>
                <ExternalLink className="h-3 w-3 ml-1" />
              </Button>
              
              <Button
                onClick={() => window.open('https://emap.pcsc.com.tw/#', '_blank')}
                variant="outline"
                size="sm"
                className="bg-orange-600 hover:bg-orange-700 text-white border-orange-600"
              >
                <Store className="h-4 w-4 mr-2" />
                <span className="text-sm">7-11 官方查詢</span>
                <ExternalLink className="h-3 w-3 ml-1" />
              </Button>
            </div>
            
            <div className="text-xs text-gray-500">
              或手動填寫下方資訊
            </div>
          </div>
          
          <div className="text-xs text-gray-500 text-center">
            <p>綠色按鈕：本地搜尋門市 (推薦)</p>
            <p>藍色按鈕：開啟綠界物流地圖進行門市選擇</p>
            <p>橙色按鈕：開啟 7-11 官方門市查詢系統</p>
          </div>
        </div>
      )}
    </>
  );
};

export default StoreSelector;