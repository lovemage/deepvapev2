import axios from 'axios';
import { 
  mockProducts, 
  mockCategories, 
  mockBrands, 
  mockCoupons, 
  mockAnnouncements,
  searchProducts,
  getProductById,
  validateCoupon
} from './mockData';

const API_BASE_URL = 'http://localhost:3001/api';

// 檢測是否在生產環境或無法連接到API
const isProduction = import.meta.env.PROD || window.location.hostname !== 'localhost';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// 請求攔截器
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 響應攔截器
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('admin_token');
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

// 產品相關API
export const productsAPI = {
  getProducts: async (params?: {
    category?: string;
    brand?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) => {
    if (isProduction) {
      // 使用mock數據
      const result = searchProducts(params || {});
      return { data: result };
    } else {
      try {
        return await api.get('/products', { params });
      } catch (error) {
        console.warn('API不可用，使用mock數據');
        const result = searchProducts(params || {});
        return { data: result };
      }
    }
  },
  
  getProduct: async (id: string) => {
    if (isProduction) {
      const product = getProductById(id);
      if (!product) throw new Error('產品不存在');
      return { data: product };
    } else {
      try {
        return await api.get(`/products/${id}`);
      } catch (error) {
        console.warn('API不可用，使用mock數據');
        const product = getProductById(id);
        if (!product) throw new Error('產品不存在');
        return { data: product };
      }
    }
  },
  
  createProduct: (data: any) => api.post('/products', data),
  
  updateProduct: (id: string, data: any) => api.put(`/products/${id}`, data),
  
  deleteProduct: (id: string) => api.delete(`/products/${id}`),
  
  getCategories: async () => {
    if (isProduction) {
      return { data: mockCategories };
    } else {
      try {
        return await api.get('/products/categories/list');
      } catch (error) {
        console.warn('API不可用，使用mock數據');
        return { data: mockCategories };
      }
    }
  },
  
  getBrands: async (category?: string) => {
    if (isProduction) {
      let brands = mockBrands;
      if (category) {
        // 根據分類過濾品牌
        if (category === 'host') {
          brands = mockBrands.filter(b => ['JUUL', 'IQOS', 'Vaporesso'].includes(b.brand));
        } else if (category === 'cartridge') {
          brands = mockBrands.filter(b => ['JUUL', 'IQOS', 'Vaporesso'].includes(b.brand));
        } else if (category === 'disposable') {
          brands = mockBrands.filter(b => ['Puff Bar', 'Hyde', 'Elf Bar'].includes(b.brand));
        }
      }
      return { data: brands };
    } else {
      try {
        return await api.get('/products/brands/list', { params: { category } });
      } catch (error) {
        console.warn('API不可用，使用mock數據');
        let brands = mockBrands;
        if (category) {
          if (category === 'host') {
            brands = mockBrands.filter(b => ['JUUL', 'IQOS', 'Vaporesso'].includes(b.brand));
          } else if (category === 'cartridge') {
            brands = mockBrands.filter(b => ['JUUL', 'IQOS', 'Vaporesso'].includes(b.brand));
          } else if (category === 'disposable') {
            brands = mockBrands.filter(b => ['Puff Bar', 'Hyde', 'Elf Bar'].includes(b.brand));
          }
        }
        return { data: brands };
      }
    }
  },
};

// 購物車相關API
export const cartAPI = {
  getCart: (sessionId: string) => api.get(`/cart/${sessionId}`),
  
  addToCart: (data: {
    sessionId: string;
    productId: number;
    variantId?: number;
    quantity?: number;
  }) => api.post('/cart', data),
  
  updateCartItem: (id: string, data: { quantity: number }) => 
    api.put(`/cart/${id}`, data),
  
  removeCartItem: (id: string) => api.delete(`/cart/${id}`),
  
  clearCart: (sessionId: string) => api.delete(`/cart/clear/${sessionId}`),
};

// 優惠券相關API
export const couponsAPI = {
  validateCoupon: (data: { code: string; amount: number }) => 
    api.post('/coupons/validate', data),
  
  getCoupons: () => api.get('/coupons'),
  
  createCoupon: (data: any) => api.post('/coupons', data),
  
  updateCouponStatus: (id: string, data: { is_active: boolean }) => 
    api.put(`/coupons/${id}/status`, data),
  
  deleteCoupon: (id: string) => api.delete(`/coupons/${id}`),
};

// 公告相關API
export const announcementsAPI = {
  getAnnouncements: () => api.get('/announcements'),
  
  getAnnouncementsAdmin: () => api.get('/announcements/admin'),
  
  createAnnouncement: (data: any) => api.post('/announcements', data),
  
  updateAnnouncement: (id: string, data: any) => 
    api.put(`/announcements/${id}`, data),
  
  updateAnnouncementStatus: (id: string, data: { is_active: boolean }) => 
    api.put(`/announcements/${id}/status`, data),
  
  deleteAnnouncement: (id: string) => api.delete(`/announcements/${id}`),
};

// 管理員相關API
export const adminAPI = {
  login: (data: { username: string; password: string }) => 
    api.post('/admin/login', data),
  
  verify: () => api.get('/admin/verify'),
  
  getDashboard: () => api.get('/admin/dashboard'),
  
  // 產品管理
  getProducts: (params?: any) => api.get('/admin/products', { params }),
  
  createProduct: (data: any) => api.post('/admin/products', data),
  
  updateProduct: (id: string, data: any) => 
    api.put(`/admin/products/${id}`, data),
  
  deleteProduct: (id: string) => api.delete(`/admin/products/${id}`),
  
  updateBatchStock: (data: { updates: Array<{ id: number; stock: number }> }) => 
    api.put('/admin/products/batch-stock', data),
  
  // 產品變體管理
  getProductVariants: (productId: string) => 
    api.get(`/admin/products/${productId}/variants`),
  
  createProductVariant: (productId: string, data: any) => 
    api.post(`/admin/products/${productId}/variants`, data),
  
  updateProductVariant: (variantId: string, data: any) => 
    api.put(`/admin/variants/${variantId}`, data),
  
  deleteProductVariant: (variantId: string) => 
    api.delete(`/admin/variants/${variantId}`),
  
  // 優惠券管理
  getCoupons: () => api.get('/admin/coupons'),
  
  createCoupon: (data: any) => api.post('/admin/coupons', data),
  
  updateCoupon: (id: string, data: any) => 
    api.put(`/admin/coupons/${id}`, data),
  
  deleteCoupon: (id: string) => api.delete(`/admin/coupons/${id}`),
  
  // 公告管理
  getAnnouncements: () => api.get('/admin/announcements'),
  
  createAnnouncement: (data: any) => api.post('/admin/announcements', data),
  
  updateAnnouncement: (id: string, data: any) => 
    api.put(`/admin/announcements/${id}`, data),
  
  deleteAnnouncement: (id: string) => api.delete(`/admin/announcements/${id}`),
  
  // 系統設置管理
  getSettings: () => api.get('/admin/settings'),
  
  updateSetting: (data: { key: string; value: string }) => 
    api.put('/admin/settings', data),
  
  updateBatchSettings: (data: Record<string, string>) => 
    api.put('/admin/settings/batch', data),
  
  // 管理員管理
  getAdmins: () => api.get('/admin/admins'),
  
  createAdmin: (data: { username: string; password: string }) => 
    api.post('/admin/admins', data),
  
  updateAdminPassword: (id: string, data: { newPassword: string }) => 
    api.put(`/admin/admins/${id}/password`, data),
  
  deleteAdmin: (id: string) => api.delete(`/admin/admins/${id}`),
  
  // Telegram Bot測試
  testTelegramBot: (data: { botToken: string; chatId: string; message: string }) => 
    api.post('/admin/test-telegram', data),
};

// 系統設置相關API (公開)
export const settingsAPI = {
  getPublicSettings: () => api.get('/settings/public'),
};

// 訂單相關API
export const ordersAPI = {
  submitOrder: (orderData: any) => api.post('/orders/submit', { orderData }),
};

export default api;
