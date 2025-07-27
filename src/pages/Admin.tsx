import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Package,
  Boxes,
  Gift,
  MessageSquare,
  Upload,
  Copy,
  Loader2,
  LogOut,
  Users,
  Settings,
  Ticket,
  Eye,
  EyeOff,
  Siren,        
  Wrench,
  KeyRound,
  Trash2,
  FileText,
  Pencil,
  PlusCircle,
  ChevronRight,
  ArrowUp,
  ArrowDown,
  MoveVertical,
  Save
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from "@/hooks/use-toast";
import { adminAPI, getDashboardStats, uploadImage, getImages, deleteImage } from "@/lib/api";
import { useAdminStore, Product } from '@/lib/store';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

// --- Type Definitions ---
interface DashboardStats { totalProducts: number; totalCoupons: number; totalAnnouncements: number; activeProducts: number; }
interface CategoryStat { category: string; count: number; }
interface BrandStat { brand: string; count: number; }
interface LowStockProduct { name: string; stock: number; }
interface DashboardData { stats: DashboardStats; categoryStats: CategoryStat[]; brandStats: BrandStat[]; lowStockProducts: LowStockProduct[]; }
type ImageFile = { name: string; path: string; };
interface Variant { id: number; product_id: number; variant_type: string; variant_value: string; stock: number; price_modifier: number; }
interface Coupon { id: number; code: string; type: 'percentage' | 'fixed'; value: number; min_amount: number; expires_at: string; is_active: boolean; }
interface Announcement { id: number; title: string; content: string; type: 'info' | 'warning' | 'promotion'; is_active: boolean; }
interface AdminUser { id: number; username: string; created_at: string; }
interface Order { 
  id: number; 
  order_number: string; 
  customer_name: string; 
  customer_phone: string; 
  customer_line_id?: string;
  shipping_store_name?: string;
  shipping_store_number?: string;
  total_amount: number; 
  status: string; 
  products: string;
  created_at: string; 
}

const AdminPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAuthenticated, admin, setAuthenticated, logout } = useAdminStore();
  
  // --- State ---
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [images, setImages] = useState<ImageFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState<Partial<Product>>({});
  const [variants, setVariants] = useState<Variant[]>([]);
  const [editingVariant, setEditingVariant] = useState<Variant | null>(null);
  const [variantForm, setVariantForm] = useState<Partial<Variant>>({});
  const [selectedProductIdForVariant, setSelectedProductIdForVariant] = useState<number | null>(null);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [couponForm, setCouponForm] = useState<Partial<Coupon>>({type: 'percentage', is_active: true});
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [announcementForm, setAnnouncementForm] = useState<Partial<Announcement>>({type: 'info', is_active: true});
  const [settings, setSettings] = useState<any>({});
  const [settingsForm, setSettingsForm] = useState<any>({});
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [adminForm, setAdminForm] = useState({ username: '', password: '' });
  const [passwordChangeForm, setPasswordChangeForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrders, setSelectedOrders] = useState<number[]>([]);
  const [orderPagination, setOrderPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [productSortBy, setProductSortBy] = useState('created_at');
  const [productSortOrder, setProductSortOrder] = useState('desc');
  const [isReordering, setIsReordering] = useState(false);
  const [reorderProducts, setReorderProducts] = useState<Product[]>([]);

  // --- Data Fetching & Auth ---
  const fetchAllData = useCallback(async () => {
    setLoading(true);
    try {
      const [stats, imgs, prods, coups, ancs, adms, sets, ords] = await Promise.all([
        getDashboardStats(), getImages(), adminAPI.getProducts({ limit: 1000, sort: productSortBy, order: productSortOrder }),
        adminAPI.getCoupons(), adminAPI.getAnnouncements(), adminAPI.getAdmins(), adminAPI.getSettings(),
        adminAPI.getOrders({ page: orderPagination.page, limit: orderPagination.limit })
      ]);
      setDashboardData(stats);
      setImages(imgs.success ? imgs.images : []);
      setProducts(prods.data.products || []);
      setCoupons(coups.data || []);
      setAnnouncements(ancs.data || []);
      setAdmins(adms.data || []);
      setSettings(sets.data || {});
      setSettingsForm(Object.entries(sets.data).reduce((acc, [key, val]:[string, any]) => ({ ...acc, [key]: val.value }), {}));
      setOrders(ords.data.orders || []);
      setOrderPagination(ords.data.pagination || { page: 1, limit: 20, total: 0, totalPages: 0 });
    } catch (err: any) {
      setError(err.message || '載入資料時發生錯誤');
      if (err.response?.status === 401) { logout(); navigate('/admin'); }
    } finally { setLoading(false); }
  }, [isAuthenticated, logout, navigate, productSortBy, productSortOrder]);
  
  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      adminAPI.verify().then(() => setAuthenticated(true)).catch(() => logout());
    } else { setLoading(false); }
  }, []);

  useEffect(() => { if (isAuthenticated) fetchAllData(); }, [isAuthenticated, fetchAllData]);
  
  // --- Handlers ---
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true);
    try {
      console.log('嘗試登入:', { username, password });
      const res = await adminAPI.login({ username, password });
      console.log('登入響應:', res);
      localStorage.setItem('admin_token', res.data.token);
      setAuthenticated(true); navigate('/admin');
    } catch (error: any) {
      console.error('登入錯誤:', error);
      setLoginError(error.response?.data?.error || error.message || '用戶名或密碼錯誤');
    } finally { setLoading(false); }
  };
  const handleLogout = () => { logout(); localStorage.removeItem('admin_token'); navigate('/'); };
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    setUploading(true);
    try {
      const data = await uploadImage(file);
      toast({ title: "上傳成功", description: data.filePath });
      const imgs = await getImages(); setImages(imgs.success ? imgs.images : []);
    } catch (err: any) { toast({ title: '上傳失敗', description: err.message, variant: 'destructive' });
    } finally { setUploading(false); }
  };
  const handleCopyPath = (path: string) => { navigator.clipboard.writeText(path); toast({ title: "路徑已複製" }); };
  const handleDeleteImage = async (filename: string) => {
    if (!confirm(`確定要刪除圖片 "${filename}" 嗎？`)) return;
    try {
      await deleteImage(filename);
      toast({ title: "刪除成功", description: `圖片 ${filename} 已刪除` });
      const imgs = await getImages();
      setImages(imgs.success ? imgs.images : []);
    } catch (err: any) {
      toast({ title: '刪除失敗', description: err.message, variant: 'destructive' });
    }
  };
  const createOrUpdate = async (type: 'Product' | 'Coupon' | 'Announcement' | 'Variant', form: any, editingItem: any) => {
    const apiMap = {
      Product: { create: adminAPI.createProduct, update: adminAPI.updateProduct },
      Coupon: { create: adminAPI.createCoupon, update: adminAPI.updateCoupon },
      Announcement: { create: adminAPI.createAnnouncement, update: adminAPI.updateAnnouncement },
      Variant: { create: adminAPI.createProductVariant, update: adminAPI.updateProductVariant },
    };
    const id = type === 'Variant' ? editingItem?.id : editingItem?.id;
    const createArgs = type === 'Variant' ? [selectedProductIdForVariant, form] : [form];
    try {
      if (editingItem) await apiMap[type].update(id, form);
      else await apiMap[type].create.apply(null, createArgs);
      toast({ title: `${type} 已儲存` });
      if (type !== 'Variant') fetchAllData();
      else if (selectedProductIdForVariant) handleFetchVariants(selectedProductIdForVariant);
      return true;
    } catch (error: any) {
      toast({ title: '操作失敗', description: error.message, variant: 'destructive' });
      return false;
    }
  };
  const handleDelete = async (type: 'Product' | 'Coupon' | 'Announcement' | 'Variant' | 'Admin', id: number) => {
    if (!window.confirm(`確定要刪除此 ${type} 嗎？`)) return;
    const apiMap = { Product: adminAPI.deleteProduct, Coupon: adminAPI.deleteCoupon, Announcement: adminAPI.deleteAnnouncement, Variant: adminAPI.deleteProductVariant, Admin: adminAPI.deleteAdmin };
    try {
      await apiMap[type](id);
      toast({ title: `${type} 已刪除`, variant: "destructive" });
      if (type !== 'Variant') fetchAllData();
      else if (selectedProductIdForVariant) handleFetchVariants(selectedProductIdForVariant);
    } catch (error: any) {
      toast({ title: '刪除失敗', description: error.message, variant: 'destructive' });
    }
  };
  const handleFetchVariants = async (productId: number) => {
    setSelectedProductIdForVariant(productId);
    try {
      const res = await adminAPI.getProductVariants(productId);
      setVariants(res.data || []);
    } catch (error) { toast({ title: '載入變體失敗', variant: 'destructive' }); }
  };
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
        console.log('🚀 準備保存設置:', settingsForm);

        // 保存到後端
        await adminAPI.updateBatchSettings(settingsForm);
        console.log('✅ 後端保存成功');

        // 強制重新載入前端設置
        const { useSettingsStore } = await import('@/lib/store');
        const settingsStore = useSettingsStore.getState();
        await settingsStore.loadSettings();
        console.log('✅ 前端設置重新載入完成');

        toast({ title: "✅ 設置已儲存", description: "商品卡片顯示已更新" });
        fetchAllData();
    } catch(err: any) {
        console.error('❌ 保存設置失敗:', err);
        toast({ title: '儲存失敗', description: err.message, variant: 'destructive' });
    }
  };
  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
        await adminAPI.createAdmin(adminForm);
        toast({ title: "管理員已新增" });
        setAdminForm({ username: '', password: '' });
        fetchAllData();
    } catch(err: any) { toast({ title: '新增失敗', description: err.message, variant: 'destructive' }); }
  };

  const handleBatchDeleteOrders = async () => {
    if (selectedOrders.length === 0) {
      toast({ title: '請選擇要刪除的訂單', variant: 'destructive' });
      return;
    }
    
    try {
      await adminAPI.batchDeleteOrders(selectedOrders);
      toast({ title: `成功刪除 ${selectedOrders.length} 個訂單` });
      setSelectedOrders([]);
      fetchAllData();
    } catch (err: any) {
      toast({ title: '刪除失敗', description: err.message, variant: 'destructive' });
    }
  };

  const handleSelectAllOrders = (checked: boolean) => {
    if (checked) {
      setSelectedOrders(orders.map(order => order.id));
    } else {
      setSelectedOrders([]);
    }
  };

  const handleSelectOrder = (orderId: number, checked: boolean) => {
    if (checked) {
      setSelectedOrders(prev => [...prev, orderId]);
    } else {
      setSelectedOrders(prev => prev.filter(id => id !== orderId));
    }
  };

  const handleExportExcel = async () => {
    try {
      const response = await adminAPI.exportOrdersExcel();
      
      // 創建下載連結
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      const filename = `訂單數據_${new Date().toISOString().split('T')[0]}.xlsx`;
      link.setAttribute('download', filename);
      
      document.body.appendChild(link);
      link.click();
      
      // 清理
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast({ title: 'Excel文件下載成功！' });
    } catch (error: any) {
      console.error('導出Excel失敗:', error);
      toast({ 
        title: '導出失敗', 
        description: error.message || '導出Excel時發生錯誤', 
        variant: 'destructive' 
      });
    }
  };
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordChangeForm.newPassword !== passwordChangeForm.confirmPassword) {
      toast({ title: '錯誤', description: '新密碼與確認密碼不相符', variant: 'destructive' });
      return;
    }
    if (passwordChangeForm.newPassword.length < 6) {
      toast({ title: '錯誤', description: '新密碼長度不能少於6位', variant: 'destructive' });
      return;
    }

    try {
      const res = await adminAPI.changePassword({
        currentPassword: passwordChangeForm.currentPassword,
        newPassword: passwordChangeForm.newPassword,
      });
      toast({ title: '成功', description: res.data.message });
      setPasswordChangeForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err: any) {
      toast({
        title: '密碼更改失敗',
        description: err.response?.data?.message || err.message,
        variant: 'destructive',
      });
    }
  };

  const handleProductPin = async (productId: number, action: 'top' | 'bottom') => {
    try {
      await adminAPI.pinProduct(productId, action);
      toast({ title: action === 'top' ? '產品已置頂' : '產品已置底' });
      fetchAllData();
    } catch (error) {
      toast({ title: '操作失敗', variant: 'destructive' });
    }
  };

  const handleStartReorder = () => {
    setIsReordering(true);
    setReorderProducts([...products]);
  };

  const handleCancelReorder = () => {
    setIsReordering(false);
    setReorderProducts([]);
  };

  const handleSaveReorder = async () => {
    try {
      const productIds = reorderProducts.map(p => p.id);
      await adminAPI.batchReorderProducts(productIds);
      toast({ title: '產品順序已更新' });
      setIsReordering(false);
      setReorderProducts([]);
      fetchAllData();
    } catch (error) {
      toast({ title: '更新順序失敗', variant: 'destructive' });
    }
  };

  const moveProduct = (index: number, direction: 'up' | 'down') => {
    const newProducts = [...reorderProducts];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (newIndex >= 0 && newIndex < newProducts.length) {
      [newProducts[index], newProducts[newIndex]] = [newProducts[newIndex], newProducts[index]];
      setReorderProducts(newProducts);
    }
  };

  const handleProductSortChange = (field: string) => {
    if (field === productSortBy) {
      setProductSortOrder(productSortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setProductSortBy(field);
      setProductSortOrder('desc');
    }
    fetchAllData();
  };

  // --- Render ---
  if (loading && !isAuthenticated) return <div className="flex items-center justify-center min-h-screen"><Loader2 className="h-12 w-12 animate-spin" /></div>;
  if (!isAuthenticated) return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <Card className="w-full max-w-sm">
        <CardHeader><CardTitle className="text-2xl">管理員登入</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2"><Label htmlFor="username">用戶名</Label><Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} required /></div>
            <div className="space-y-2 relative">
              <Label htmlFor="password">密碼</Label><Input id="password" type={showPassword ? 'text' : 'password'} required value={password} onChange={(e) => setPassword(e.target.value)} />
              <Button variant="ghost" size="icon" type="button" className="absolute top-6 right-1 h-7 w-7" onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</Button>
            </div>
            {loginError && <p className="text-sm text-red-500">{loginError}</p>}
            <Button type="submit" className="w-full" disabled={loading}>{loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}登入</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );

  const renderDashboard = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card>
            <CardHeader><CardTitle>數據總覽</CardTitle></CardHeader>
            <CardContent>
              {dashboardData?.stats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  {[
                    {icon: Package, label: '總產品數', value: dashboardData.stats.totalProducts, color: 'text-primary'},
                    {icon: Boxes, label: '上架中產品', value: dashboardData.stats.activeProducts, color: 'text-green-500'},
                    {icon: Gift, label: '優惠券', value: dashboardData.stats.totalCoupons, color: 'text-blue-500'},
                    {icon: MessageSquare, label: '公告', value: dashboardData.stats.totalAnnouncements, color: 'text-yellow-500'},
                  ].map(item => <div key={item.label} className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg"><item.icon className={`mx-auto h-8 w-8 ${item.color}`} /><p className="mt-2 text-2xl font-bold">{item.value}</p><p className="text-sm text-muted-foreground">{item.label}</p></div>)}
                </div>
              )}
            </CardContent>
          </Card>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card><CardHeader><CardTitle>各分類產品數</CardTitle></CardHeader><CardContent><ul className="space-y-2">{dashboardData?.categoryStats?.map(cat => <li key={cat.category} className="flex justify-between items-center"><span className="capitalize">{cat.category}</span><Badge variant="secondary">{cat.count}</Badge></li>)}</ul></CardContent></Card>
            <Card><CardHeader><CardTitle>各品牌產品數</CardTitle></CardHeader><CardContent><ul className="space-y-2">{dashboardData?.brandStats?.map(b => <li key={b.brand} className="flex justify-between items-center"><span>{b.brand}</span><Badge variant="secondary">{b.count}</Badge></li>)}</ul></CardContent></Card>
          </div>

        </div>
        <div className="space-y-8">
          <Card>
            <CardHeader><CardTitle>圖片管理</CardTitle><CardDescription>上傳新圖片至 /public/images/</CardDescription></CardHeader>
            <CardContent>
                <div className="flex items-center gap-4">
                  <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" disabled={uploading}/>
                  <Button onClick={() => fileInputRef.current?.click()} disabled={uploading}>{uploading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />上傳中...</> : <><Upload className="mr-2 h-4 w-4" />選擇圖片</>}</Button>
                </div>
                <h3 className="font-medium my-4">現有圖片列表</h3>
                <ScrollArea className="h-96 w-full rounded-md border">
                  <div className="p-4 space-y-3">
                    {images.map(img => (
                      <div key={img.name} className="p-3 rounded-md border hover:bg-muted space-y-3">
                        {/* 上方：圖片預覽和信息 */}
                        <div className="flex items-center gap-3">
                          <div className="flex-shrink-0">
                            <img
                              src={img.path}
                              alt={img.name}
                              className="w-16 h-16 object-cover rounded-md border"
                              onError={(e) => {
                                e.currentTarget.src = '/images/placeholder.png';
                              }}
                            />
                          </div>

                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-mono truncate" title={img.name}>
                              {img.name}
                            </p>
                            <p className="text-xs text-muted-foreground truncate" title={img.path}>
                              {img.path}
                            </p>
                          </div>
                        </div>

                        {/* 下方：操作按鈕 */}
                        <div className="flex gap-2 pt-2 border-t border-gray-100">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCopyPath(img.path)}
                            className="flex-1"
                          >
                            <Copy className="mr-2 h-4 w-4" />
                            複製路徑
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteImage(img.name)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    {images.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        暫無圖片
                      </div>
                    )}
                  </div>
                </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
  );

  const renderManagementUI = (title: string, items: any[], form: React.ReactNode, table: React.ReactNode) => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div className="md:col-span-1"><Card><CardHeader><CardTitle>{title}</CardTitle></CardHeader><CardContent>{form}</CardContent></Card></div>
      <div className="md:col-span-2"><Card><CardHeader><CardTitle>列表</CardTitle></CardHeader><CardContent><ScrollArea className="h-[600px]">{table}</ScrollArea></CardContent></Card></div>
    </div>
  );

  const renderProductManagement = () => renderManagementUI('產品管理', products, 
    <form onSubmit={async e => {e.preventDefault(); if (await createOrUpdate('Product', productForm, editingProduct)) {setEditingProduct(null); setProductForm({});}}} className="space-y-4">
      <Input placeholder="名稱" value={productForm.name || ''} onChange={e => setProductForm({...productForm, name: e.target.value})} required/>
      <Input placeholder="品牌" value={productForm.brand || ''} onChange={e => setProductForm({...productForm, brand: e.target.value})} required/>
      <Select value={productForm.category || ''} onValueChange={(v: any) => setProductForm({...productForm, category: v})}><SelectTrigger><SelectValue placeholder="分類" /></SelectTrigger><SelectContent><SelectItem value="host">主機</SelectItem><SelectItem value="cartridge">煙彈</SelectItem><SelectItem value="disposable">拋棄式</SelectItem><SelectItem value="oil">煙油</SelectItem></SelectContent></Select>
      <Input type="number" placeholder="價格" value={productForm.price || ''} onChange={e => setProductForm({...productForm, price: Number(e.target.value)})} required/>
      <Input type="number" placeholder="庫存" value={productForm.stock || ''} onChange={e => setProductForm({...productForm, stock: Number(e.target.value)})} required/>
      <Input placeholder="圖片 URL" value={productForm.image_url || ''} onChange={e => setProductForm({...productForm, image_url: e.target.value})} />
      <Textarea placeholder="描述" value={productForm.description || ''} onChange={e => setProductForm({...productForm, description: e.target.value})} />

      {/* 停賣狀態 */}
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="is_discontinued"
          checked={productForm.is_discontinued || false}
          onChange={e => setProductForm({...productForm, is_discontinued: e.target.checked})}
          className="w-4 h-4 text-red-600 bg-gray-100 border-gray-300 rounded focus:ring-red-500"
        />
        <label htmlFor="is_discontinued" className="text-sm font-medium text-gray-700">
          停賣商品 (勾選後前端顯示補貨中，無法下單)
        </label>
      </div>

      {/* 優惠券排除 */}
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="coupon_excluded"
          checked={productForm.coupon_excluded || false}
          onChange={e => setProductForm({...productForm, coupon_excluded: e.target.checked})}
          className="w-4 h-4 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500"
        />
        <label htmlFor="coupon_excluded" className="text-sm font-medium text-gray-700">
          排除優惠券 (勾選後此商品無法使用優惠券)
        </label>
      </div>

      {/* 免運排除 */}
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="shipping_excluded"
          checked={productForm.shipping_excluded || false}
          onChange={e => setProductForm({...productForm, shipping_excluded: e.target.checked})}
          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
        />
        <label htmlFor="shipping_excluded" className="text-sm font-medium text-gray-700">
          排除免運 (勾選後此商品無法享受免運優惠)
        </label>
      </div>
      <Button type="submit" className="w-full">{editingProduct ? '更新' : '新增'}</Button>
      {editingProduct && <Button variant="outline" className="w-full" onClick={() => {setEditingProduct(null); setProductForm({});}}>取消</Button>}
    </form>,
    <div className="space-y-4">
      {/* 排序控制欄 */}
      <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">排序：</span>
          <Button size="sm" variant={productSortBy === 'created_at' ? 'default' : 'outline'} onClick={() => handleProductSortChange('created_at')}>
            創建時間 {productSortBy === 'created_at' && (productSortOrder === 'desc' ? '↓' : '↑')}
          </Button>
          <Button size="sm" variant={productSortBy === 'name' ? 'default' : 'outline'} onClick={() => handleProductSortChange('name')}>
            名稱 {productSortBy === 'name' && (productSortOrder === 'desc' ? '↓' : '↑')}
          </Button>
          <Button size="sm" variant={productSortBy === 'price' ? 'default' : 'outline'} onClick={() => handleProductSortChange('price')}>
            價格 {productSortBy === 'price' && (productSortOrder === 'desc' ? '↓' : '↑')}
          </Button>
          <Button size="sm" variant={productSortBy === 'stock' ? 'default' : 'outline'} onClick={() => handleProductSortChange('stock')}>
            庫存 {productSortBy === 'stock' && (productSortOrder === 'desc' ? '↓' : '↑')}
          </Button>
        </div>
        <div className="flex items-center gap-2">
          {!isReordering ? (
            <Button size="sm" variant="secondary" onClick={handleStartReorder}>
              <MoveVertical className="mr-1 h-4 w-4" />
              手動排序
            </Button>
          ) : (
            <>
              <Button size="sm" variant="default" onClick={handleSaveReorder}>
                <Save className="mr-1 h-4 w-4" />
                保存順序
              </Button>
              <Button size="sm" variant="outline" onClick={handleCancelReorder}>
                取消
              </Button>
            </>
          )}
        </div>
      </div>

      {/* 產品列表 */}
      {isReordering ? (
        <div className="space-y-2">
          {reorderProducts.map((p, index) => (
            <div key={p.id} className="flex items-center gap-2 p-3 bg-white border rounded-lg">
              <div className="flex flex-col gap-1">
                <Button size="sm" variant="ghost" onClick={() => moveProduct(index, 'up')} disabled={index === 0}>
                  <ArrowUp className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="ghost" onClick={() => moveProduct(index, 'down')} disabled={index === reorderProducts.length - 1}>
                  <ArrowDown className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex-1">
                <div className="font-medium">{p.name}</div>
                <div className="text-sm text-gray-500">{p.category} · {p.brand} · ¥{p.price}</div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>名稱</TableHead>
              <TableHead>分類</TableHead>
              <TableHead>品牌</TableHead>
              <TableHead>價格</TableHead>
              <TableHead>庫存</TableHead>
              <TableHead>狀態</TableHead>
              <TableHead>操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map(p => (
              <TableRow key={p.id}>
                <TableCell>{p.name}</TableCell>
                <TableCell>{p.category}</TableCell>
                <TableCell>{p.brand}</TableCell>
                <TableCell>¥{p.price}</TableCell>
                <TableCell>{p.stock}</TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    {p.is_discontinued ? (
                      <Badge variant="secondary" className="bg-gray-500 text-white">
                        補貨中
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-green-600 border-green-600">
                        正常
                      </Badge>
                    )}
                    {p.coupon_excluded && (
                      <Badge variant="outline" className="text-orange-600 border-orange-600 text-xs">
                        無優惠券
                      </Badge>
                    )}
                    {p.shipping_excluded && (
                      <Badge variant="outline" className="text-blue-600 border-blue-600 text-xs">
                        無免運
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell className="space-x-1">
                  <Button size="sm" variant="ghost" onClick={() => handleProductPin(p.id, 'top')} title="置頂">
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => handleProductPin(p.id, 'bottom')} title="置底">
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                  <Button size="sm" onClick={() => {setEditingProduct(p); setProductForm(p);}}>
                    <Pencil size={16}/>
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete('Product', p.id)}>
                    <Trash2 size={16}/>
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => {handleFetchVariants(p.id); setActiveTab('variants')}}>
                    <ChevronRight size={16}/>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );

  const renderVariantManagement = () => renderManagementUI('變體管理', variants, 
    <form onSubmit={async e => {e.preventDefault(); if (await createOrUpdate('Variant', variantForm, editingVariant)) {setEditingVariant(null); setVariantForm({});}}} className="space-y-4">
      <Select onValueChange={(v) => handleFetchVariants(Number(v))}><SelectTrigger><SelectValue placeholder="先選擇一個產品" /></SelectTrigger><SelectContent>{products.map(p => <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>)}</SelectContent></Select>
      {selectedProductIdForVariant && <>
          <Input placeholder="類型 (e.g., 口味)" value={variantForm.variant_type || ''} onChange={e => setVariantForm({...variantForm, variant_type: e.target.value})} required/>
          <Input placeholder="值 (e.g., 薄荷)" value={variantForm.variant_value || ''} onChange={e => setVariantForm({...variantForm, variant_value: e.target.value})} required/>
          <Input type="number" placeholder="庫存" value={variantForm.stock || ''} onChange={e => setVariantForm({...variantForm, stock: Number(e.target.value)})} required/>
          <Input type="number" placeholder="價格調整" value={variantForm.price_modifier || ''} onChange={e => setVariantForm({...variantForm, price_modifier: Number(e.target.value)})} />
          <Button type="submit" className="w-full">{editingVariant ? '更新' : '新增'}</Button>
          {editingVariant && <Button variant="outline" className="w-full" onClick={() => {setEditingVariant(null); setVariantForm({});}}>取消</Button>}
      </>}
    </form>,
    <Table><TableHeader><TableRow><TableHead>類型</TableHead><TableHead>值</TableHead><TableHead>庫存</TableHead><TableHead>操作</TableHead></TableRow></TableHeader><TableBody>{variants.map(v => <TableRow key={v.id}><TableCell>{v.variant_type}</TableCell><TableCell>{v.variant_value}</TableCell><TableCell>{v.stock}</TableCell><TableCell className="space-x-2"><Button size="sm" onClick={() => {setEditingVariant(v); setVariantForm(v);}}><Pencil size={16}/></Button><Button variant="destructive" size="sm" onClick={() => handleDelete('Variant', v.id)}><Trash2 size={16}/></Button></TableCell></TableRow>)}</TableBody></Table>
  );

  const renderCouponManagement = () => renderManagementUI('優惠券管理', coupons, 
    <form onSubmit={async e => {e.preventDefault(); if (await createOrUpdate('Coupon', couponForm, editingCoupon)) {setEditingCoupon(null); setCouponForm({type: 'percentage', is_active: true});}}} className="space-y-4">
      <Input placeholder="優惠碼" value={couponForm.code || ''} onChange={e => setCouponForm({...couponForm, code: e.target.value})} required/>
      <Select value={couponForm.type || ''} onValueChange={(v:any) => setCouponForm({...couponForm, type: v})}><SelectTrigger><SelectValue placeholder="類型" /></SelectTrigger><SelectContent><SelectItem value="percentage">百分比</SelectItem><SelectItem value="fixed">固定金額</SelectItem></SelectContent></Select>
      <Input type="number" placeholder="折扣值" value={couponForm.value || ''} onChange={e => setCouponForm({...couponForm, value: Number(e.target.value)})} required/>
      <Input type="number" placeholder="最低消費" value={couponForm.min_amount || ''} onChange={e => setCouponForm({...couponForm, min_amount: Number(e.target.value)})} />
      <Input type="date" placeholder="到期日" value={couponForm.expires_at || ''} onChange={e => setCouponForm({...couponForm, expires_at: e.target.value})} />
      <div className="flex items-center space-x-2"><Switch id="c-active" checked={couponForm.is_active} onCheckedChange={c => setTimeout(() => setCouponForm({...couponForm, is_active: c}), 0)} /><Label htmlFor="c-active">啟用</Label></div>
      <Button type="submit" className="w-full">{editingCoupon ? '更新' : '新增'}</Button>
      {editingCoupon && <Button variant="outline" className="w-full" onClick={() => {setEditingCoupon(null); setCouponForm({type: 'percentage', is_active: true});}}>取消</Button>}
    </form>,
    <Table><TableHeader><TableRow><TableHead>優惠碼</TableHead><TableHead>類型</TableHead><TableHead>值</TableHead><TableHead>狀態</TableHead><TableHead>操作</TableHead></TableRow></TableHeader><TableBody>{coupons.map(c => <TableRow key={c.id}><TableCell>{c.code}</TableCell><TableCell>{c.type}</TableCell><TableCell>{c.value}</TableCell><TableCell><Badge variant={c.is_active ? "default" : "outline"}>{c.is_active?'啟用':'停用'}</Badge></TableCell><TableCell className="space-x-2"><Button size="sm" onClick={() => {setEditingCoupon(c); setCouponForm(c);}}><Pencil size={16}/></Button><Button variant="destructive" size="sm" onClick={() => handleDelete('Coupon', c.id)}><Trash2 size={16}/></Button></TableCell></TableRow>)}</TableBody></Table>
  );

  const renderAnnouncementManagement = () => renderManagementUI('公告管理', announcements,
    <form onSubmit={async e => {e.preventDefault(); if (await createOrUpdate('Announcement', announcementForm, editingAnnouncement)) {setEditingAnnouncement(null); setAnnouncementForm({type: 'info', is_active: true});}}} className="space-y-4">
      <Input placeholder="標題" value={announcementForm.title || ''} onChange={e => setAnnouncementForm({...announcementForm, title: e.target.value})} required/>
      <Textarea placeholder="內容" value={announcementForm.content || ''} onChange={e => setAnnouncementForm({...announcementForm, content: e.target.value})} required/>
      <Select value={announcementForm.type || ''} onValueChange={(v:any) => setAnnouncementForm({...announcementForm, type: v})}><SelectTrigger><SelectValue placeholder="類型" /></SelectTrigger><SelectContent><SelectItem value="info">資訊</SelectItem><SelectItem value="warning">警告</SelectItem><SelectItem value="promotion">促銷</SelectItem></SelectContent></Select>
      <div className="flex items-center space-x-2"><Switch id="a-active" checked={announcementForm.is_active} onCheckedChange={c => setTimeout(() => setAnnouncementForm({...announcementForm, is_active: c}), 0)} /><Label htmlFor="a-active">啟用</Label></div>
      <Button type="submit" className="w-full">{editingAnnouncement ? '更新' : '新增'}</Button>
      {editingAnnouncement && <Button variant="outline" className="w-full" onClick={() => {setEditingAnnouncement(null); setAnnouncementForm({type: 'info', is_active: true});}}>取消</Button>}
    </form>,
    <Table><TableHeader><TableRow><TableHead>標題</TableHead><TableHead>類型</TableHead><TableHead>狀態</TableHead><TableHead>操作</TableHead></TableRow></TableHeader><TableBody>{announcements.map(a => <TableRow key={a.id}><TableCell>{a.title}</TableCell><TableCell>{a.type}</TableCell><TableCell><Badge variant={a.is_active ? "default" : "outline"}>{a.is_active?'啟用':'停用'}</Badge></TableCell><TableCell className="space-x-2"><Button size="sm" onClick={() => {setEditingAnnouncement(a); setAnnouncementForm(a);}}><Pencil size={16}/></Button><Button variant="destructive" size="sm" onClick={() => handleDelete('Announcement', a.id)}><Trash2 size={16}/></Button></TableCell></TableRow>)}</TableBody></Table>
  );

  const renderSettingsManagement = () => (
    <Card className="max-w-2xl mx-auto">
      <CardHeader><CardTitle>系統設置</CardTitle></CardHeader>
      <CardContent>
        <form onSubmit={handleSaveSettings} className="space-y-6">
          {/* 商品顯示控制 */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">商品卡片顯示控制</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">顯示商品評論</Label>
                  <p className="text-sm text-gray-500">控制商品卡片是否顯示星級評分</p>
                </div>
                <Switch
                  checked={settingsForm.show_product_reviews === 'true'}
                  onCheckedChange={(checked) =>
                    setTimeout(() => {
                      setSettingsForm({...settingsForm, show_product_reviews: checked.toString()})
                    }, 0)
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">顯示商品預覽</Label>
                  <p className="text-sm text-gray-500">控制商品卡片是否顯示描述文字</p>
                </div>
                <Switch
                  checked={settingsForm.show_product_preview === 'true'}
                  onCheckedChange={(checked) =>
                    setTimeout(() => {
                      setSettingsForm({...settingsForm, show_product_preview: checked.toString()})
                    }, 0)
                  }
                />
              </div>
            </div>
          </div>

          {/* 基本設置 */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">基本設置</h3>
            <div className="space-y-2"><Label>免運費門檻</Label><Input type="number" value={settingsForm.free_shipping_threshold || ''} onChange={e => setSettingsForm({...settingsForm, free_shipping_threshold: e.target.value})} /></div>
            <div className="space-y-2"><Label>首頁橫幅圖片 URL (舊版)</Label><Input value={settingsForm.hero_image_url || ''} onChange={e => setSettingsForm({...settingsForm, hero_image_url: e.target.value})} placeholder="單張圖片模式使用" /></div>
          </div>

          {/* 輪播圖片設置 */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">首頁輪播圖片設置</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">啟用輪播圖片</Label>
                  <p className="text-sm text-gray-500">啟用後將以輪播模式顯示多張圖片，2.5秒自動切換</p>
                </div>
                <Switch
                  checked={settingsForm.hero_carousel_enabled === 'true'}
                  onCheckedChange={(checked) =>
                    setTimeout(() => {
                      setSettingsForm({...settingsForm, hero_carousel_enabled: checked.toString()})
                    }, 0)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>輪播圖片 1 URL</Label>
                <Input 
                  value={settingsForm.hero_carousel_image_1 || ''} 
                  onChange={e => setSettingsForm({...settingsForm, hero_carousel_image_1: e.target.value})} 
                  placeholder="第一張輪播圖片URL"
                />
              </div>
              <div className="space-y-2">
                <Label>輪播圖片 2 URL</Label>
                <Input 
                  value={settingsForm.hero_carousel_image_2 || ''} 
                  onChange={e => setSettingsForm({...settingsForm, hero_carousel_image_2: e.target.value})} 
                  placeholder="第二張輪播圖片URL"
                />
              </div>
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>提示：</strong> 當啟用輪播圖片時，系統將使用上面兩張圖片進行輪播。圖片建議使用相同比例，確保在不同設備上都能完整顯示。
                </p>
              </div>
            </div>
          </div>

          {/* 彈窗設置 */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">首頁彈窗設置</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">啟用首頁彈窗</Label>
                  <p className="text-sm text-gray-500">首次進入網站時顯示年齡驗證和優惠碼彈窗</p>
                </div>
                <Switch
                  checked={settingsForm.popup_enabled === 'true'}
                  onCheckedChange={(checked) =>
                    setTimeout(() => {
                      setSettingsForm({...settingsForm, popup_enabled: checked.toString()})
                    }, 0)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>彈窗圖片 URL</Label>
                <Input 
                  value={settingsForm.popup_image_url || ''} 
                  onChange={e => setSettingsForm({...settingsForm, popup_image_url: e.target.value})} 
                  placeholder="彈窗圖片URL，例如：/images/popup.png"
                />
                <p className="text-xs text-gray-500">建議圖片尺寸: 400x600px 或相似比例</p>
              </div>
                             <div className="space-y-2">
                 <Label>優惠碼</Label>
                 <Input 
                   value={settingsForm.popup_coupon_code || ''} 
                   onChange={e => setSettingsForm({...settingsForm, popup_coupon_code: e.target.value})} 
                   placeholder="顯示在彈窗中的優惠碼"
                 />
               </div>
               <div className="space-y-2">
                 <Label>Line官方帳號連結</Label>
                 <Input 
                   value={settingsForm.popup_line_url || ''} 
                   onChange={e => setSettingsForm({...settingsForm, popup_line_url: e.target.value})} 
                   placeholder="Line官方帳號URL，例如：https://line.me/ti/p/YOUR_LINE_ID"
                 />
                 <p className="text-xs text-gray-500">用戶點擊「加入Line獲取優惠」時將跳轉到此連結</p>
               </div>
              {settingsForm.popup_image_url && (
                <div className="space-y-2">
                  <Label>預覽</Label>
                  <div className="border rounded-lg p-4 bg-gray-50">
                    <img
                      src={settingsForm.popup_image_url}
                      alt="彈窗圖片預覽"
                      className="max-w-full h-auto max-h-48 mx-auto rounded-md"
                      onError={(e) => {
                        e.currentTarget.src = '/images/placeholder.png';
                      }}
                    />
                  </div>
                </div>
              )}
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>提示：</strong> 彈窗圖片建議使用高質量的圖片，確保在手機和桌面設備上都能清晰顯示。圖片會自動適應彈窗大小。
                </p>
              </div>
            </div>
          </div>

          {/* Telegram 通知設置 */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Telegram 通知設置</h3>
            <div className="space-y-2"><Label>Telegram Bot Token</Label><Input value={settingsForm.telegram_bot_token || ''} onChange={e => setSettingsForm({...settingsForm, telegram_bot_token: e.target.value})} /></div>
            <div className="space-y-2"><Label>Telegram Chat ID</Label><Input value={settingsForm.telegram_chat_id || ''} onChange={e => setSettingsForm({...settingsForm, telegram_chat_id: e.target.value})} /></div>
          </div>

          <Button type="submit" className="w-full">儲存設置</Button>
        </form>
      </CardContent>
    </Card>
  );

  const renderAdminManagement = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <Card>
        <CardHeader><CardTitle>新增管理員</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleCreateAdmin} className="space-y-4">
              <Input placeholder="新管理員用戶名" value={adminForm.username} onChange={e => setAdminForm({...adminForm, username: e.target.value})} required/>
              <Input type="password" placeholder="新管理員密碼" value={adminForm.password} onChange={e => setAdminForm({...adminForm, password: e.target.value})} required/>
              <Button type="submit" className="w-full"><PlusCircle className="mr-2 h-4 w-4"/>新增</Button>
          </form>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader><CardTitle>修改我的密碼</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleChangePassword} className="space-y-4">
              <Input type="password" placeholder="目前密碼" value={passwordChangeForm.currentPassword} onChange={e => setPasswordChangeForm({...passwordChangeForm, currentPassword: e.target.value})} required/>
              <Input type="password" placeholder="新密碼" value={passwordChangeForm.newPassword} onChange={e => setPasswordChangeForm({...passwordChangeForm, newPassword: e.target.value})} required/>
              <Input type="password" placeholder="確認新密碼" value={passwordChangeForm.confirmPassword} onChange={e => setPasswordChangeForm({...passwordChangeForm, confirmPassword: e.target.value})} required/>
              <Button type="submit" className="w-full">更新密碼</Button>
          </form>
        </CardContent>
      </Card>

      <div className="md:col-span-2">
        <Card>
          <CardHeader><CardTitle>管理員列表</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader><TableRow><TableHead>用戶名</TableHead><TableHead>創建時間</TableHead><TableHead>操作</TableHead></TableRow></TableHeader>
              <TableBody>
                {admin && admins.map(a => (
                  <TableRow key={a.id}>
                    <TableCell>{a.username}</TableCell>
                    <TableCell>{new Date(a.created_at).toLocaleString()}</TableCell>
                    <TableCell>{a.id !== admin.id && <Button variant="destructive" size="sm" onClick={() => handleDelete('Admin', a.id)}><Trash2 size={16}/></Button>}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto p-4 md:p-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">管理後台</h1>
        <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">歡迎, {admin?.username}</span>
            <Button variant="outline" onClick={handleLogout}><LogOut className="mr-2 h-4 w-4" />登出</Button>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-8">
            <TabsTrigger value="dashboard"><Package className="mr-2 h-4 w-4"/>儀表板</TabsTrigger>
            <TabsTrigger value="products"><Boxes className="mr-2 h-4 w-4"/>產品</TabsTrigger>
            <TabsTrigger value="orders"><FileText className="mr-2 h-4 w-4"/>訂單</TabsTrigger>
            <TabsTrigger value="variants"><Wrench className="mr-2 h-4 w-4"/>變體</TabsTrigger>
            <TabsTrigger value="coupons"><Ticket className="mr-2 h-4 w-4"/>優惠券</TabsTrigger>
            <TabsTrigger value="announcements"><Siren className="mr-2 h-4 w-4"/>公告</TabsTrigger>
            <TabsTrigger value="settings"><Settings className="mr-2 h-4 w-4"/>設置</TabsTrigger>
            <TabsTrigger value="admins"><KeyRound className="mr-2 h-4 w-4"/>管理員</TabsTrigger>
        </TabsList>
        <TabsContent value="dashboard" className="mt-6">{renderDashboard()}</TabsContent>
        <TabsContent value="products" className="mt-6">{renderProductManagement()}</TabsContent>
        
        <TabsContent value="orders" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>訂單管理</CardTitle>
                <CardDescription>管理客戶訂單，查看詳情並進行批量操作</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={handleExportExcel}
                  className="text-green-600 border-green-600 hover:bg-green-50"
                >
                  <FileText className="mr-2 h-4 w-4" />
                  導出Excel
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={handleBatchDeleteOrders}
                  disabled={selectedOrders.length === 0}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  刪除選中 ({selectedOrders.length})
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                    <input
                      type="checkbox"
                      checked={selectedOrders.length === orders.length && orders.length > 0}
                      onChange={e => handleSelectAllOrders(e.target.checked)}
                      className="rounded"
                    />
                    <span className="font-medium text-sm">全選</span>
                  </div>
                  
                  {orders.map(order => (
                    <div key={order.id} className="p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={selectedOrders.includes(order.id)}
                          onChange={e => handleSelectOrder(order.id, e.target.checked)}
                          className="mt-1"
                        />
                        
                        <div className="flex-1 space-y-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-medium text-lg">{order.order_number}</h3>
                              <div className="flex items-center gap-4 text-sm text-gray-600">
                                <span>📅 {new Date(order.created_at).toLocaleString('zh-TW')}</span>
                                <span className={`px-2 py-1 rounded text-xs ${
                                  order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                  order.status === 'completed' ? 'bg-green-100 text-green-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {order.status === 'pending' ? '待處理' : 
                                   order.status === 'completed' ? '已完成' : order.status}
                                </span>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-bold text-green-600">NT$ {order.total_amount}</div>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <h4 className="font-medium text-gray-900 mb-1">客戶資料</h4>
                              <div className="space-y-1 text-gray-600">
                                <div>👤 {order.customer_name}</div>
                                <div>📞 {order.customer_phone}</div>
                                {order.customer_line_id && <div>💬 Line: {order.customer_line_id}</div>}
                                {order.shipping_store_name && (
                                  <div>🏪 {order.shipping_store_name} ({order.shipping_store_number})</div>
                                )}
                              </div>
                            </div>
                            
                            <div>
                              <h4 className="font-medium text-gray-900 mb-1">購買商品</h4>
                              <div className="text-gray-600">
                                {order.products || '無商品資料'}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {orders.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      暫無訂單
                    </div>
                  )}
                </div>
              </ScrollArea>
              
              {orderPagination.totalPages > 1 && (
                <div className="flex justify-center mt-4">
                  <div className="text-sm text-gray-600">
                    第 {orderPagination.page} 頁，共 {orderPagination.totalPages} 頁 
                    (總計 {orderPagination.total} 個訂單)
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="variants" className="mt-6">{renderVariantManagement()}</TabsContent>
        <TabsContent value="coupons" className="mt-6">{renderCouponManagement()}</TabsContent>
        <TabsContent value="announcements" className="mt-6">{renderAnnouncementManagement()}</TabsContent>
        <TabsContent value="settings" className="mt-6">{renderSettingsManagement()}</TabsContent>
        <TabsContent value="admins" className="mt-6">{renderAdminManagement()}</TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPage; 