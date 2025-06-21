import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAdminStore } from '@/lib/store';
import { adminAPI } from '@/lib/api';
import { 
  Users, 
  Package, 
  Gift, 
  MessageSquare, 
  TrendingUp, 
  AlertTriangle,
  LogOut,
  Eye,
  EyeOff
} from 'lucide-react';

const Admin: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, admin, token, setAuthenticated, setAdmin, setToken, logout } = useAdminStore();
  
  // 登錄狀態
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // 儀表板數據
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [variants, setVariants] = useState<any[]>([]);
  
  // 表單狀態
  const [productForm, setProductForm] = useState({
    name: '', category: 'host', brand: '', price: '', description: '', image_url: '', stock: ''
  });
  const [couponForm, setCouponForm] = useState({
    code: '', type: 'percentage', value: '', min_amount: '', expires_at: ''
  });
  const [announcementForm, setAnnouncementForm] = useState({
    title: '', content: '', type: 'info'
  });
  const [variantForm, setVariantForm] = useState({
    variant_type: '', variant_value: '', stock: '', price_modifier: ''
  });
  
  // 編輯狀態
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [editingCoupon, setEditingCoupon] = useState<any>(null);
  const [editingAnnouncement, setEditingAnnouncement] = useState<any>(null);
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  
  // 系統設置狀態
  const [settings, setSettings] = useState<any>({});
  const [settingsForm, setSettingsForm] = useState({
    free_shipping_threshold: '',
    telegram_bot_token: '',
    telegram_chat_id: '',
    hero_image_url: ''
  });
  
  // 管理員管理狀態
  const [admins, setAdmins] = useState<any[]>([]);
  const [adminForm, setAdminForm] = useState({
    username: '',
    password: ''
  });
  const [passwordForm, setPasswordForm] = useState({
    adminId: '',
    newPassword: ''
  });
  
  // Telegram測試狀態
  const [telegramTestForm, setTelegramTestForm] = useState({
    message: '🧪 測試消息 - DeepVape 系統正常運行'
  });
  const [telegramTestResult, setTelegramTestResult] = useState<string>('');

  useEffect(() => {
    if (isAuthenticated && token) {
      loadDashboardData();
      loadProducts();
      loadCoupons();
      loadAnnouncements();
      loadSettings();
      loadAdmins();
    }
  }, [isAuthenticated, token]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setLoginError('');

    try {
      const response = await adminAPI.login(loginForm);
      const { token, admin } = response.data;
      
      setToken(token);
      setAdmin(admin);
      setAuthenticated(true);
      
      // 保存到localStorage
      localStorage.setItem('admin_token', token);
      
    } catch (error: any) {
      setLoginError(error.response?.data?.error || '登錄失敗');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    localStorage.removeItem('admin_token');
    navigate('/');
  };

  const loadDashboardData = async () => {
    try {
      const response = await adminAPI.getDashboard();
      setDashboardData(response.data);
    } catch (error) {
      console.error('載入儀表板數據失敗:', error);
    }
  };

  const loadProducts = async () => {
    try {
      const response = await adminAPI.getProducts({ limit: 10 });
      setProducts(response.data.products || []);
    } catch (error) {
      console.error('載入產品數據失敗:', error);
    }
  };

  const loadCoupons = async () => {
    try {
      const response = await adminAPI.getCoupons();
      setCoupons(response.data || []);
    } catch (error) {
      console.error('載入優惠券數據失敗:', error);
    }
  };

  const loadAnnouncements = async () => {
    try {
      const response = await adminAPI.getAnnouncements();
      setAnnouncements(response.data || []);
    } catch (error) {
      console.error('載入公告數據失敗:', error);
    }
  };

  const loadVariants = async (productId: string) => {
    try {
      const response = await adminAPI.getProductVariants(productId);
      setVariants(response.data || []);
    } catch (error) {
      console.error('載入產品變體失敗:', error);
    }
  };

  const loadSettings = async () => {
    try {
      const response = await adminAPI.getSettings();
      setSettings(response.data);
      
      // 更新表單數據
      const formData = {
        free_shipping_threshold: response.data.free_shipping_threshold?.value || '',
        telegram_bot_token: response.data.telegram_bot_token?.value || '',
        telegram_chat_id: response.data.telegram_chat_id?.value || '',
        hero_image_url: response.data.hero_image_url?.value || ''
      };
      setSettingsForm(formData);
    } catch (error) {
      console.error('載入系統設置失敗:', error);
    }
  };

  const loadAdmins = async () => {
    try {
      const response = await adminAPI.getAdmins();
      setAdmins(response.data || []);
    } catch (error) {
      console.error('載入管理員列表失敗:', error);
    }
  };

  // 產品管理函數
  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminAPI.createProduct(productForm);
      setProductForm({ name: '', category: 'host', brand: '', price: '', description: '', image_url: '', stock: '' });
      loadProducts();
      alert('產品創建成功！');
    } catch (error: any) {
      alert('創建失敗: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    try {
      await adminAPI.updateProduct(editingProduct.id, productForm);
      setEditingProduct(null);
      setProductForm({ name: '', category: 'host', brand: '', price: '', description: '', image_url: '', stock: '' });
      loadProducts();
      alert('產品更新成功！');
    } catch (error: any) {
      alert('更新失敗: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('確定要刪除此產品嗎？')) return;
    try {
      await adminAPI.deleteProduct(id);
      loadProducts();
      alert('產品刪除成功！');
    } catch (error: any) {
      alert('刪除失敗: ' + (error.response?.data?.error || error.message));
    }
  };

  // 優惠券管理函數
  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminAPI.createCoupon(couponForm);
      setCouponForm({ code: '', type: 'percentage', value: '', min_amount: '', expires_at: '' });
      loadCoupons();
      alert('優惠券創建成功！');
    } catch (error: any) {
      alert('創建失敗: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleUpdateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCoupon) return;
    try {
      await adminAPI.updateCoupon(editingCoupon.id, { ...couponForm, is_active: editingCoupon.is_active });
      setEditingCoupon(null);
      setCouponForm({ code: '', type: 'percentage', value: '', min_amount: '', expires_at: '' });
      loadCoupons();
      alert('優惠券更新成功！');
    } catch (error: any) {
      alert('更新失敗: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleDeleteCoupon = async (id: string) => {
    if (!confirm('確定要刪除此優惠券嗎？')) return;
    try {
      await adminAPI.deleteCoupon(id);
      loadCoupons();
      alert('優惠券刪除成功！');
    } catch (error: any) {
      alert('刪除失敗: ' + (error.response?.data?.error || error.message));
    }
  };

  // 公告管理函數
  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminAPI.createAnnouncement(announcementForm);
      setAnnouncementForm({ title: '', content: '', type: 'info' });
      loadAnnouncements();
      alert('公告創建成功！');
    } catch (error: any) {
      alert('創建失敗: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleUpdateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAnnouncement) return;
    try {
      await adminAPI.updateAnnouncement(editingAnnouncement.id, { ...announcementForm, is_active: editingAnnouncement.is_active });
      setEditingAnnouncement(null);
      setAnnouncementForm({ title: '', content: '', type: 'info' });
      loadAnnouncements();
      alert('公告更新成功！');
    } catch (error: any) {
      alert('更新失敗: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    if (!confirm('確定要刪除此公告嗎？')) return;
    try {
      await adminAPI.deleteAnnouncement(id);
      loadAnnouncements();
      alert('公告刪除成功！');
    } catch (error: any) {
      alert('刪除失敗: ' + (error.response?.data?.error || error.message));
    }
  };

  // 產品變體管理函數
  const handleCreateVariant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId) return;
    try {
      await adminAPI.createProductVariant(selectedProductId, variantForm);
      setVariantForm({ variant_type: '', variant_value: '', stock: '', price_modifier: '' });
      loadVariants(selectedProductId);
      alert('產品變體創建成功！');
    } catch (error: any) {
      alert('創建失敗: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleDeleteVariant = async (id: string) => {
    if (!confirm('確定要刪除此變體嗎？')) return;
    try {
      await adminAPI.deleteProductVariant(id);
      if (selectedProductId) {
        loadVariants(selectedProductId);
      }
      alert('產品變體刪除成功！');
    } catch (error: any) {
      alert('刪除失敗: ' + (error.response?.data?.error || error.message));
    }
  };

  // 系統設置管理函數
  const handleUpdateSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminAPI.updateBatchSettings(settingsForm);
      loadSettings();
      alert('系統設置更新成功！');
    } catch (error: any) {
      alert('更新失敗: ' + (error.response?.data?.error || error.message));
    }
  };

  // 管理員管理函數
  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminAPI.createAdmin(adminForm);
      setAdminForm({ username: '', password: '' });
      loadAdmins();
      alert('管理員創建成功！');
    } catch (error: any) {
      alert('創建失敗: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordForm.adminId || !passwordForm.newPassword) return;
    try {
      await adminAPI.updateAdminPassword(passwordForm.adminId, { 
        newPassword: passwordForm.newPassword 
      });
      setPasswordForm({ adminId: '', newPassword: '' });
      alert('密碼更新成功！');
    } catch (error: any) {
      alert('更新失敗: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleDeleteAdmin = async (id: string) => {
    if (!confirm('確定要刪除此管理員嗎？')) return;
    try {
      await adminAPI.deleteAdmin(id);
      loadAdmins();
      alert('管理員刪除成功！');
    } catch (error: any) {
      alert('刪除失敗: ' + (error.response?.data?.error || error.message));
    }
  };

  // Telegram Bot測試函數
  const handleTestTelegramBot = async (e: React.FormEvent) => {
    e.preventDefault();
    setTelegramTestResult('');
    
    if (!settingsForm.telegram_bot_token || !settingsForm.telegram_chat_id) {
      setTelegramTestResult('❌ 請先設置Bot Token和Chat ID');
      return;
    }

    try {
      const response = await adminAPI.testTelegramBot({
        botToken: settingsForm.telegram_bot_token,
        chatId: settingsForm.telegram_chat_id,
        message: telegramTestForm.message
      });
      
      if (response.data.success) {
        setTelegramTestResult(`✅ 測試成功！消息ID: ${response.data.messageId}`);
      } else {
        setTelegramTestResult(`❌ 測試失敗: ${response.data.error}`);
      }
    } catch (error: any) {
      setTelegramTestResult(`❌ 測試失敗: ${error.response?.data?.error || error.message}`);
    }
  };

  // 登錄頁面
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              管理員登錄
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              請使用管理員帳號登錄
            </p>
          </div>
          
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>登錄</CardTitle>
              <CardDescription>
                輸入您的管理員帳號和密碼
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loginError && (
                <Alert variant="destructive" className="mb-4">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{loginError}</AlertDescription>
                </Alert>
              )}
              
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <Label htmlFor="username">用戶名</Label>
                  <Input
                    id="username"
                    type="text"
                    value={loginForm.username}
                    onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                    required
                    placeholder="請輸入用戶名"
                  />
                </div>
                
                <div>
                  <Label htmlFor="password">密碼</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={loginForm.password}
                      onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                      required
                      placeholder="請輸入密碼"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? '登錄中...' : '登錄'}
                </Button>
              </form>
              
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>測試帳號:</strong><br />
                  用戶名: admin<br />
                  密碼: admin123
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // 管理員儀表板
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">管理員儀表板</h1>
              <p className="text-gray-600">歡迎回來，{admin?.username}</p>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" onClick={() => navigate('/')}>
                返回首頁
              </Button>
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                登出
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* 統計卡片 */}
        {dashboardData && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">總產品數</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardData.stats.totalProducts}</div>
                <p className="text-xs text-muted-foreground">
                  有庫存: {dashboardData.stats.activeProducts}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">優惠券</CardTitle>
                <Gift className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardData.stats.totalCoupons}</div>
                <p className="text-xs text-muted-foreground">活躍優惠券</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">公告</CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardData.stats.totalAnnouncements}</div>
                <p className="text-xs text-muted-foreground">總公告數</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">庫存警告</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardData.lowStockProducts.length}</div>
                <p className="text-xs text-muted-foreground">低庫存產品</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* 詳細信息 */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-8">
            <TabsTrigger value="overview">概覽</TabsTrigger>
            <TabsTrigger value="products">產品管理</TabsTrigger>
            <TabsTrigger value="variants">變體管理</TabsTrigger>
            <TabsTrigger value="coupons">優惠券</TabsTrigger>
            <TabsTrigger value="announcements">公告</TabsTrigger>
            <TabsTrigger value="categories">分類統計</TabsTrigger>
            <TabsTrigger value="settings">系統設置</TabsTrigger>
            <TabsTrigger value="admins">管理員</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {dashboardData && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 品牌統計 */}
                <Card>
                  <CardHeader>
                    <CardTitle>品牌統計</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {dashboardData.brandStats.map((brand: any) => (
                        <div key={brand.brand} className="flex items-center justify-between">
                          <span className="text-sm font-medium">{brand.brand}</span>
                          <Badge variant="secondary">{brand.count} 個產品</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* 低庫存警告 */}
                <Card>
                  <CardHeader>
                    <CardTitle>庫存警告</CardTitle>
                    <CardDescription>庫存少於10的產品</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {dashboardData.lowStockProducts.length === 0 ? (
                      <p className="text-sm text-muted-foreground">沒有低庫存產品</p>
                    ) : (
                      <div className="space-y-2">
                        {dashboardData.lowStockProducts.map((product: any, index: number) => (
                          <div key={index} className="flex items-center justify-between">
                            <span className="text-sm">{product.name}</span>
                            <Badge variant="destructive">庫存: {product.stock}</Badge>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          <TabsContent value="products" className="space-y-4">
            {/* 產品創建表單 */}
            <Card>
              <CardHeader>
                <CardTitle>{editingProduct ? '編輯產品' : '創建新產品'}</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={editingProduct ? handleUpdateProduct : handleCreateProduct} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">產品名稱</Label>
                      <Input
                        id="name"
                        value={productForm.name}
                        onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="category">分類</Label>
                      <select
                        id="category"
                        className="w-full p-2 border rounded-md"
                        value={productForm.category}
                        onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                      >
                        <option value="host">主機</option>
                        <option value="cartridge">煙彈</option>
                        <option value="disposable">拋棄式</option>
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="brand">品牌</Label>
                      <Input
                        id="brand"
                        value={productForm.brand}
                        onChange={(e) => setProductForm({ ...productForm, brand: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="price">價格</Label>
                      <Input
                        id="price"
                        type="number"
                        value={productForm.price}
                        onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="stock">庫存</Label>
                      <Input
                        id="stock"
                        type="number"
                        value={productForm.stock}
                        onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="image_url">圖片URL</Label>
                      <Input
                        id="image_url"
                        value={productForm.image_url}
                        onChange={(e) => setProductForm({ ...productForm, image_url: e.target.value })}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="description">描述</Label>
                    <textarea
                      id="description"
                      className="w-full p-2 border rounded-md"
                      rows={3}
                      value={productForm.description}
                      onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                    />
                  </div>
                  <div className="flex space-x-2">
                    <Button type="submit">
                      {editingProduct ? '更新產品' : '創建產品'}
                    </Button>
                    {editingProduct && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setEditingProduct(null);
                          setProductForm({ name: '', category: 'host', brand: '', price: '', description: '', image_url: '', stock: '' });
                        }}
                      >
                        取消編輯
                      </Button>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* 產品列表 */}
            <Card>
              <CardHeader>
                <CardTitle>產品列表</CardTitle>
                <CardDescription>管理現有產品</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {products.map((product) => (
                    <div key={product.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{product.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {product.brand} • {product.category} • NT${product.price}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={product.stock > 10 ? "default" : "destructive"}>
                          庫存: {product.stock}
                        </Badge>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingProduct(product);
                            setProductForm({
                              name: product.name,
                              category: product.category,
                              brand: product.brand,
                              price: product.price.toString(),
                              description: product.description || '',
                              image_url: product.image_url || '',
                              stock: product.stock.toString()
                            });
                          }}
                        >
                          編輯
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteProduct(product.id)}
                        >
                          刪除
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="variants" className="space-y-4">
            {/* 產品選擇 */}
            <Card>
              <CardHeader>
                <CardTitle>產品變體管理</CardTitle>
                <CardDescription>為產品添加顏色、口味等變體</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="productSelect">選擇產品</Label>
                    <select
                      id="productSelect"
                      className="w-full p-2 border rounded-md"
                      value={selectedProductId}
                      onChange={(e) => {
                        setSelectedProductId(e.target.value);
                        if (e.target.value) {
                          loadVariants(e.target.value);
                        }
                      }}
                    >
                      <option value="">選擇產品...</option>
                      {products.map((product) => (
                        <option key={product.id} value={product.id}>
                          {product.name} ({product.brand})
                        </option>
                      ))}
                    </select>
                  </div>

                  {selectedProductId && (
                    <>
                      {/* 變體創建表單 */}
                      <form onSubmit={handleCreateVariant} className="space-y-4 p-4 border rounded-lg">
                        <h4 className="font-medium">添加新變體</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="variant_type">變體類型</Label>
                            <Input
                              id="variant_type"
                              value={variantForm.variant_type}
                              onChange={(e) => setVariantForm({ ...variantForm, variant_type: e.target.value })}
                              placeholder="例如: 顏色, 口味"
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="variant_value">變體值</Label>
                            <Input
                              id="variant_value"
                              value={variantForm.variant_value}
                              onChange={(e) => setVariantForm({ ...variantForm, variant_value: e.target.value })}
                              placeholder="例如: 紅色, 草莓"
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="variant_stock">庫存</Label>
                            <Input
                              id="variant_stock"
                              type="number"
                              value={variantForm.stock}
                              onChange={(e) => setVariantForm({ ...variantForm, stock: e.target.value })}
                            />
                          </div>
                          <div>
                            <Label htmlFor="price_modifier">價格調整</Label>
                            <Input
                              id="price_modifier"
                              type="number"
                              value={variantForm.price_modifier}
                              onChange={(e) => setVariantForm({ ...variantForm, price_modifier: e.target.value })}
                              placeholder="正數增加價格，負數減少"
                            />
                          </div>
                        </div>
                        <Button type="submit">添加變體</Button>
                      </form>

                      {/* 變體列表 */}
                      <div className="space-y-2">
                        <h4 className="font-medium">現有變體</h4>
                        {variants.length === 0 ? (
                          <p className="text-sm text-muted-foreground">此產品暫無變體</p>
                        ) : (
                          variants.map((variant) => (
                            <div key={variant.id} className="flex items-center justify-between p-3 border rounded-lg">
                              <div>
                                <span className="font-medium">{variant.variant_type}: {variant.variant_value}</span>
                                <p className="text-sm text-muted-foreground">
                                  庫存: {variant.stock} | 價格調整: {variant.price_modifier > 0 ? '+' : ''}{variant.price_modifier}
                                </p>
                              </div>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDeleteVariant(variant.id)}
                              >
                                刪除
                              </Button>
                            </div>
                          ))
                        )}
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="coupons" className="space-y-4">
            {/* 優惠券創建表單 */}
            <Card>
              <CardHeader>
                <CardTitle>{editingCoupon ? '編輯優惠券' : '創建新優惠券'}</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={editingCoupon ? handleUpdateCoupon : handleCreateCoupon} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="coupon_code">優惠碼</Label>
                      <Input
                        id="coupon_code"
                        value={couponForm.code}
                        onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="coupon_type">折扣類型</Label>
                      <select
                        id="coupon_type"
                        className="w-full p-2 border rounded-md"
                        value={couponForm.type}
                        onChange={(e) => setCouponForm({ ...couponForm, type: e.target.value })}
                      >
                        <option value="percentage">百分比折扣</option>
                        <option value="fixed">固定金額折扣</option>
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="coupon_value">
                        {couponForm.type === 'percentage' ? '折扣百分比' : '折扣金額'}
                      </Label>
                      <Input
                        id="coupon_value"
                        type="number"
                        value={couponForm.value}
                        onChange={(e) => setCouponForm({ ...couponForm, value: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="min_amount">最低消費金額</Label>
                      <Input
                        id="min_amount"
                        type="number"
                        value={couponForm.min_amount}
                        onChange={(e) => setCouponForm({ ...couponForm, min_amount: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="expires_at">過期時間</Label>
                      <Input
                        id="expires_at"
                        type="datetime-local"
                        value={couponForm.expires_at}
                        onChange={(e) => setCouponForm({ ...couponForm, expires_at: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button type="submit">
                      {editingCoupon ? '更新優惠券' : '創建優惠券'}
                    </Button>
                    {editingCoupon && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setEditingCoupon(null);
                          setCouponForm({ code: '', type: 'percentage', value: '', min_amount: '', expires_at: '' });
                        }}
                      >
                        取消編輯
                      </Button>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* 優惠券列表 */}
            <Card>
              <CardHeader>
                <CardTitle>優惠券列表</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {coupons.map((coupon) => (
                    <div key={coupon.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{coupon.code}</h4>
                        <p className="text-sm text-muted-foreground">
                          {coupon.type === 'percentage' ? `${coupon.value}% 折扣` : `NT$${coupon.value} 折扣`}
                          {coupon.min_amount > 0 && ` | 最低消費: NT$${coupon.min_amount}`}
                          {coupon.expires_at && ` | 過期: ${new Date(coupon.expires_at).toLocaleDateString()}`}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={coupon.is_active ? "default" : "secondary"}>
                          {coupon.is_active ? '啟用' : '停用'}
                        </Badge>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingCoupon(coupon);
                            setCouponForm({
                              code: coupon.code,
                              type: coupon.type,
                              value: coupon.value.toString(),
                              min_amount: coupon.min_amount.toString(),
                              expires_at: coupon.expires_at ? new Date(coupon.expires_at).toISOString().slice(0, 16) : ''
                            });
                          }}
                        >
                          編輯
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteCoupon(coupon.id)}
                        >
                          刪除
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="announcements" className="space-y-4">
            {/* 公告創建表單 */}
            <Card>
              <CardHeader>
                <CardTitle>{editingAnnouncement ? '編輯公告' : '創建新公告'}</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={editingAnnouncement ? handleUpdateAnnouncement : handleCreateAnnouncement} className="space-y-4">
                  <div>
                    <Label htmlFor="announcement_title">標題</Label>
                    <Input
                      id="announcement_title"
                      value={announcementForm.title}
                      onChange={(e) => setAnnouncementForm({ ...announcementForm, title: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="announcement_type">類型</Label>
                    <select
                      id="announcement_type"
                      className="w-full p-2 border rounded-md"
                      value={announcementForm.type}
                      onChange={(e) => setAnnouncementForm({ ...announcementForm, type: e.target.value })}
                    >
                      <option value="info">信息</option>
                      <option value="warning">警告</option>
                      <option value="promotion">促銷</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="announcement_content">內容</Label>
                    <textarea
                      id="announcement_content"
                      className="w-full p-2 border rounded-md"
                      rows={4}
                      value={announcementForm.content}
                      onChange={(e) => setAnnouncementForm({ ...announcementForm, content: e.target.value })}
                      required
                    />
                  </div>
                  <div className="flex space-x-2">
                    <Button type="submit">
                      {editingAnnouncement ? '更新公告' : '創建公告'}
                    </Button>
                    {editingAnnouncement && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setEditingAnnouncement(null);
                          setAnnouncementForm({ title: '', content: '', type: 'info' });
                        }}
                      >
                        取消編輯
                      </Button>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* 公告列表 */}
            <Card>
              <CardHeader>
                <CardTitle>公告列表</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {announcements.map((announcement) => (
                    <div key={announcement.id} className="flex items-start justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium">{announcement.title}</h4>
                        <p className="text-sm text-muted-foreground mt-1">{announcement.content}</p>
                        <div className="flex items-center space-x-2 mt-2">
                          <Badge variant={
                            announcement.type === 'warning' ? 'destructive' :
                            announcement.type === 'promotion' ? 'default' : 'secondary'
                          }>
                            {announcement.type === 'info' ? '信息' :
                             announcement.type === 'warning' ? '警告' : '促銷'}
                          </Badge>
                          <Badge variant={announcement.is_active ? "default" : "secondary"}>
                            {announcement.is_active ? '啟用' : '停用'}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingAnnouncement(announcement);
                            setAnnouncementForm({
                              title: announcement.title,
                              content: announcement.content,
                              type: announcement.type
                            });
                          }}
                        >
                          編輯
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteAnnouncement(announcement.id)}
                        >
                          刪除
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="categories" className="space-y-4">
            {dashboardData && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 分類統計 */}
                <Card>
                  <CardHeader>
                    <CardTitle>產品分類統計</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {dashboardData.categoryStats.map((category: any) => (
                        <div key={category.category} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <span className="font-medium">
                              {category.category === 'host' ? '主機' :
                               category.category === 'cartridge' ? '煙彈' : '拋棄式'}
                            </span>
                            <p className="text-sm text-muted-foreground">
                              平均價格: NT${Math.round(category.avg_price)}
                            </p>
                          </div>
                          <div className="text-right">
                            <Badge variant="default">{category.count} 個產品</Badge>
                            <p className="text-sm text-muted-foreground mt-1">
                              總庫存: {category.total_stock}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* 品牌詳細統計 */}
                <Card>
                  <CardHeader>
                    <CardTitle>品牌詳細統計</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {dashboardData.brandStats.map((brand: any) => (
                        <div key={brand.brand} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <span className="font-medium">{brand.brand}</span>
                            <p className="text-sm text-muted-foreground">
                              平均價格: NT${Math.round(brand.avg_price)}
                            </p>
                          </div>
                          <div className="text-right">
                            <Badge variant="secondary">{brand.count} 個產品</Badge>
                            <p className="text-sm text-muted-foreground mt-1">
                              總庫存: {brand.total_stock}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* 價格分布 */}
                <Card>
                  <CardHeader>
                    <CardTitle>價格分布</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm">NT$0 - NT$500</span>
                        <Badge variant="outline">
                          {products.filter(p => p.price <= 500).length} 個
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">NT$501 - NT$1000</span>
                        <Badge variant="outline">
                          {products.filter(p => p.price > 500 && p.price <= 1000).length} 個
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">NT$1001 - NT$2000</span>
                        <Badge variant="outline">
                          {products.filter(p => p.price > 1000 && p.price <= 2000).length} 個
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">NT$2000+</span>
                        <Badge variant="outline">
                          {products.filter(p => p.price > 2000).length} 個
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* 庫存狀態 */}
                <Card>
                  <CardHeader>
                    <CardTitle>庫存狀態</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm">充足庫存 (&gt;50)</span>
                        <Badge variant="default">
                          {products.filter(p => p.stock > 50).length} 個
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">中等庫存 (11-50)</span>
                        <Badge variant="secondary">
                          {products.filter(p => p.stock > 10 && p.stock <= 50).length} 個
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">低庫存 (1-10)</span>
                        <Badge variant="destructive">
                          {products.filter(p => p.stock > 0 && p.stock <= 10).length} 個
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">缺貨 (0)</span>
                        <Badge variant="destructive">
                          {products.filter(p => p.stock === 0).length} 個
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>系統設置</CardTitle>
                <CardDescription>配置系統基本設置</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpdateSettings} className="space-y-6">
                  {/* 免運費設置 */}
                  <div className="space-y-2">
                    <Label htmlFor="free_shipping_threshold">免運費門檻 (NT$)</Label>
                    <Input
                      id="free_shipping_threshold"
                      type="number"
                      value={settingsForm.free_shipping_threshold}
                      onChange={(e) => setSettingsForm({ ...settingsForm, free_shipping_threshold: e.target.value })}
                      placeholder="例如: 1000"
                    />
                    <p className="text-sm text-muted-foreground">
                      訂單金額達到此金額時免運費
                    </p>
                  </div>

                  {/* Telegram Bot設置 */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Telegram Bot 設置</h3>
                    
                    <div className="space-y-2">
                      <Label htmlFor="telegram_bot_token">Bot Token</Label>
                      <Input
                        id="telegram_bot_token"
                        type="password"
                        value={settingsForm.telegram_bot_token}
                        onChange={(e) => setSettingsForm({ ...settingsForm, telegram_bot_token: e.target.value })}
                        placeholder="請輸入Telegram Bot Token"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="telegram_chat_id">Chat ID</Label>
                      <Input
                        id="telegram_chat_id"
                        value={settingsForm.telegram_chat_id}
                        onChange={(e) => setSettingsForm({ ...settingsForm, telegram_chat_id: e.target.value })}
                        placeholder="請輸入Telegram Chat ID"
                      />
                    </div>

                    {/* Telegram測試區域 */}
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-medium mb-2">測試 Telegram Bot</h4>
                      <div className="space-y-2">
                        <Input
                          value={telegramTestForm.message}
                          onChange={(e) => setTelegramTestForm({ ...telegramTestForm, message: e.target.value })}
                          placeholder="測試消息"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleTestTelegramBot}
                          className="w-full"
                        >
                          發送測試消息
                        </Button>
                        {telegramTestResult && (
                          <div className={`p-2 rounded text-sm ${
                            telegramTestResult.includes('✅') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
                          }`}>
                            {telegramTestResult}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Hero圖片設置 */}
                  <div className="space-y-2">
                    <Label htmlFor="hero_image_url">首頁Hero圖片URL</Label>
                    <Input
                      id="hero_image_url"
                      value={settingsForm.hero_image_url}
                      onChange={(e) => setSettingsForm({ ...settingsForm, hero_image_url: e.target.value })}
                      placeholder="例如: /images/hero.jpg"
                    />
                    <p className="text-sm text-muted-foreground">
                      首頁大圖的圖片路徑
                    </p>
                  </div>

                  <Button type="submit" className="w-full">
                    保存設置
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="admins" className="space-y-4">
            {/* 創建管理員 */}
            <Card>
              <CardHeader>
                <CardTitle>創建新管理員</CardTitle>
                <CardDescription>添加新的管理員帳號</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateAdmin} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="admin_username">用戶名</Label>
                      <Input
                        id="admin_username"
                        value={adminForm.username}
                        onChange={(e) => setAdminForm({ ...adminForm, username: e.target.value })}
                        required
                        placeholder="請輸入用戶名"
                      />
                    </div>
                    <div>
                      <Label htmlFor="admin_password">密碼</Label>
                      <Input
                        id="admin_password"
                        type="password"
                        value={adminForm.password}
                        onChange={(e) => setAdminForm({ ...adminForm, password: e.target.value })}
                        required
                        placeholder="請輸入密碼 (至少6位)"
                      />
                    </div>
                  </div>
                  <Button type="submit">創建管理員</Button>
                </form>
              </CardContent>
            </Card>

            {/* 管理員列表 */}
            <Card>
              <CardHeader>
                <CardTitle>管理員列表</CardTitle>
                <CardDescription>管理現有管理員</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {admins.map((adminUser) => (
                    <div key={adminUser.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{adminUser.username}</h4>
                        <p className="text-sm text-muted-foreground">
                          創建時間: {new Date(adminUser.created_at).toLocaleString()}
                        </p>
                        {adminUser.id === admin?.id && (
                          <Badge variant="default" className="mt-1">當前登錄</Badge>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setPasswordForm({ 
                              adminId: adminUser.id.toString(), 
                              newPassword: '' 
                            });
                          }}
                        >
                          更改密碼
                        </Button>
                        {adminUser.id !== admin?.id && (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteAdmin(adminUser.id)}
                          >
                            刪除
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* 更改密碼表單 */}
            {passwordForm.adminId && (
              <Card>
                <CardHeader>
                  <CardTitle>更改管理員密碼</CardTitle>
                  <CardDescription>
                    為管理員 {admins.find(a => a.id.toString() === passwordForm.adminId)?.username} 設置新密碼
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleUpdatePassword} className="space-y-4">
                    <div>
                      <Label htmlFor="new_password">新密碼</Label>
                      <Input
                        id="new_password"
                        type="password"
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                        required
                        placeholder="請輸入新密碼 (至少6位)"
                      />
                    </div>
                    <div className="flex space-x-2">
                      <Button type="submit">更新密碼</Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setPasswordForm({ adminId: '', newPassword: '' })}
                      >
                        取消
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin; 