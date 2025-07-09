import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';

// 產品類型定義
export interface Product {
  id: number;
  name: string;
  category: 'host' | 'cartridge' | 'disposable' | 'oil';
  brand: string;
  price: number;
  description: string;
  image_url: string;
  stock: number;
  created_at: string;
  variants?: ProductVariant[];
}

export interface ProductVariant {
  id: number;
  product_id: number;
  variant_type: string;
  variant_value: string;
  stock: number;
  price_modifier: number;
}

// 購物車類型定義
export interface CartItem {
  id: number;
  session_id: string;
  product_id: number;
  variant_id?: number;
  quantity: number;
  name: string;
  price: number;
  image_url: string;
  brand: string;
  category: string;
  variant_type?: string;
  variant_value?: string;
  price_modifier?: number;
  total_price: number;
}

// 系統設置類型定義
export interface SystemSettings {
  show_product_reviews: boolean;
  show_product_preview: boolean;
}

// 系統設置類型定義
export interface SystemSettings {
  show_product_reviews: boolean;
  show_product_preview: boolean;
}

// 優惠券類型定義
export interface Coupon {
  id: number;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  min_amount: number;
  expires_at?: string;
  is_active: boolean;
}

// 公告類型定義
export interface Announcement {
  id: number;
  title: string;
  content: string;
  type: 'info' | 'warning' | 'promotion';
  is_active: boolean;
  created_at: string;
}

// 產品Store
interface ProductState {
  products: Product[];
  categories: { category: string; count: number }[];
  brands: { brand: string; count: number }[];
  selectedCategory: string;
  selectedBrand: string;
  searchQuery: string;
  currentPage: number;
  totalPages: number;
  loading: boolean;
  setProducts: (products: Product[]) => void;
  setCategories: (categories: { category: string; count: number }[]) => void;
  setBrands: (brands: { brand: string; count: number }[]) => void;
  setSelectedCategory: (category: string) => void;
  setSelectedBrand: (brand: string) => void;
  setSearchQuery: (query: string) => void;
  setCurrentPage: (page: number) => void;
  setTotalPages: (pages: number) => void;
  setLoading: (loading: boolean) => void;
}

export const useProductStore = create<ProductState>((set) => ({
  products: [],
  categories: [],
  brands: [],
  selectedCategory: '',
  selectedBrand: '',
  searchQuery: '',
  currentPage: 1,
  totalPages: 1,
  loading: false,
  setProducts: (products) => set({ products }),
  setCategories: (categories) => set({ categories }),
  setBrands: (brands) => set({ brands }),
  setSelectedCategory: (category) => set({ selectedCategory: category, currentPage: 1 }),
  setSelectedBrand: (brand) => set({ selectedBrand: brand, currentPage: 1 }),
  setSearchQuery: (query) => set({ searchQuery: query, currentPage: 1 }),
  setCurrentPage: (page) => set({ currentPage: page }),
  setTotalPages: (pages) => set({ totalPages: pages }),
  setLoading: (loading) => set({ loading }),
}));

// 購物車Store
interface CartState {
  sessionId: string;
  items: CartItem[];
  totalAmount: number;
  itemCount: number;
  appliedCoupon?: {
    coupon: Coupon;
    discountAmount: number;
    finalAmount: number;
  };
  setSessionId: (sessionId: string) => void;
  setItems: (items: CartItem[]) => void;
  setTotalAmount: (amount: number) => void;
  setItemCount: (count: number) => void;
  setAppliedCoupon: (coupon: any) => void;
  clearCoupon: () => void;
  addItem: (item: CartItem) => void;
  updateItem: (id: number, quantity: number) => void;
  removeItem: (id: number) => void;
  clearCart: () => Promise<void>;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      sessionId: '',
      items: [],
      totalAmount: 0,
      itemCount: 0,
      appliedCoupon: undefined,
      setSessionId: (sessionId) => set({ sessionId }),
      setItems: (items) => set({ items }),
      setTotalAmount: (amount) => set({ totalAmount: amount }),
      setItemCount: (count) => set({ itemCount: count }),
      setAppliedCoupon: (coupon) => set({ appliedCoupon: coupon }),
      clearCoupon: () => set({ appliedCoupon: undefined }),
      addItem: (item) => {
        const items = get().items;
        const existingIndex = items.findIndex(
          (i) => i.product_id === item.product_id && i.variant_id === item.variant_id
        );
        
        if (existingIndex >= 0) {
          const updatedItems = [...items];
          updatedItems[existingIndex].quantity += item.quantity;
          set({ items: updatedItems });
        } else {
          set({ items: [...items, item] });
        }
      },
      updateItem: (id, quantity) => {
        const items = get().items;
        const updatedItems = items.map((item) =>
          item.id === id ? { ...item, quantity } : item
        );
        set({ items: updatedItems });
      },
      removeItem: (id) => {
        const items = get().items;
        const updatedItems = items.filter((item) => item.id !== id);
        set({ items: updatedItems });
      },
      clearCart: async () => {
        const sessionId = get().sessionId;
        try {
          // 調用後端 API 清空購物車
          const { cartAPI } = await import('./api');
          await cartAPI.clearCart(sessionId);
          console.log('後端購物車已清空');
        } catch (error) {
          console.error('清空後端購物車失敗:', error);
        }
        // 清空本地狀態
        set({ items: [], totalAmount: 0, itemCount: 0, appliedCoupon: undefined });
      },
    }),
    {
      name: 'cart-storage',
      partialize: (state) => ({
        sessionId: state.sessionId,
        items: state.items,
        appliedCoupon: state.appliedCoupon,
      }),
    }
  )
);

// 公告Store
interface AnnouncementState {
  announcements: Announcement[];
  setAnnouncements: (announcements: Announcement[]) => void;
}

export const useAnnouncementStore = create<AnnouncementState>((set) => ({
  announcements: [],
  setAnnouncements: (announcements) => set({ announcements }),
}));

// 管理員Store
interface AdminState {
  isAuthenticated: boolean;
  admin?: { id: number; username: string };
  token?: string;
  setAuthenticated: (isAuthenticated: boolean) => void;
  setAdmin: (admin: { id: number; username: string }) => void;
  setToken: (token: string) => void;
  logout: () => void;
}

export const useAdminStore = create<AdminState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      admin: undefined,
      token: undefined,
      setAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
      setAdmin: (admin) => set({ admin }),
      setToken: (token) => set({ token }),
      logout: () => set({ isAuthenticated: false, admin: undefined, token: undefined }),
    }),
    {
      name: 'admin-storage',
      onRehydrateStorage: () => (state) => {
        // 檢查localStorage中的token
        const token = localStorage.getItem('admin_token');
        if (token && state) {
          state.token = token;
          state.isAuthenticated = true;
        }
      },
    }
  )
);

// 系統設置狀態管理
interface SettingsState {
  settings: SystemSettings;
  loading: boolean;
  loadSettings: () => Promise<void>;
  updateSettings: (newSettings: Partial<SystemSettings>) => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: {
    show_product_reviews: true,
    show_product_preview: true,
  },
  loading: false,

  loadSettings: async () => {
    try {
      set({ loading: true });

      // 直接調用後端 API 獲取設置
      const response = await fetch('/api/settings/public');

      if (response.ok) {
        const settingsData = await response.json();
        console.log('🔍 API 返回的原始數據:', settingsData); // 調試日誌
        console.log('🔍 show_product_reviews 值:', settingsData.show_product_reviews, '類型:', typeof settingsData.show_product_reviews);
        console.log('🔍 show_product_preview 值:', settingsData.show_product_preview, '類型:', typeof settingsData.show_product_preview);

        const settings: SystemSettings = {
          show_product_reviews: settingsData.show_product_reviews === 'true',
          show_product_preview: settingsData.show_product_preview === 'true',
        };

        console.log('✅ 解析後的設置:', settings); // 調試日誌
        set({ settings, loading: false });
      } else {
        throw new Error('API 調用失敗');
      }
    } catch (error) {
      console.error('載入設置失敗:', error);
      // 使用默認設置
      const defaultSettings = {
        show_product_reviews: true,
        show_product_preview: true,
      };
      console.log('使用默認設置:', defaultSettings); // 調試日誌
      set({
        settings: defaultSettings,
        loading: false
      });
    }
  },

  updateSettings: async (newSettings: Partial<SystemSettings>) => {
    try {
      const currentSettings = get().settings;
      const updatedSettings = { ...currentSettings, ...newSettings };

      // 立即更新本地狀態
      set({ settings: updatedSettings });

      // 轉換為後端格式
      const backendSettings: Record<string, string> = {};
      if (newSettings.show_product_reviews !== undefined) {
        backendSettings.show_product_reviews = newSettings.show_product_reviews.toString();
      }
      if (newSettings.show_product_preview !== undefined) {
        backendSettings.show_product_preview = newSettings.show_product_preview.toString();
      }

      // 使用動態導入避免循環依賴
      const { adminAPI } = await import('./api');
      await adminAPI.updateBatchSettings(backendSettings);

    } catch (error) {
      console.error('更新設置失敗:', error);
      // 回滾本地狀態
      const currentSettings = get().settings;
      set({ settings: currentSettings });
      throw error;
    }
  },
}));

// 初始化session ID
if (typeof window !== 'undefined') {
  const cartStore = useCartStore.getState();
  if (!cartStore.sessionId) {
    cartStore.setSessionId(uuidv4());
  }
}
