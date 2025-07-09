import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// 格式化價格
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'TWD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

// 格式化日期
export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

// 產品分類映射
export const categoryMap = {
  host: '主機',
  cartridge: '煙彈',
  disposable: '拋棄式'
}

// 獲取分類中文名稱
export function getCategoryName(category: string): string {
  return categoryMap[category as keyof typeof categoryMap] || category
}

// 公告類型映射
export const announcementTypeMap = {
  info: { name: '資訊', color: 'bg-blue-500' },
  warning: { name: '警告', color: 'bg-orange-500' },
  promotion: { name: '促銷', color: 'bg-green-500' }
}

// 獲取公告類型樣式
export function getAnnouncementStyle(type: string) {
  return announcementTypeMap[type as keyof typeof announcementTypeMap] || 
         { name: type, color: 'bg-gray-500' }
}

// 防抖函數
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func(...args), delay)
  }
}

// 節流函數
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let lastCall = 0
  return (...args: Parameters<T>) => {
    const now = Date.now()
    if (now - lastCall >= delay) {
      lastCall = now
      func(...args)
    }
  }
}

// 生成隨機ID
export function generateId(): string {
  return Math.random().toString(36).substr(2, 9)
}

// 圖片錯誤處理 - 使用內聯 SVG 作為默認 placeholder
export function getImageUrl(imagePath: string): string {
  // 如果沒有圖片路徑，返回內聯 SVG placeholder
  if (!imagePath) {
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwIDIwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cmVjdCB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIGZpbGw9IiNGM0Y0RjYiLz4KPHA+YXRoIGZpbGwtcnVsZT0iZXZlbm9kZCIgY2xpcC1ydWxlPSJldmVub2RkIiBkPSJNNCAzQTIgMiAwIDAwMiA1VjE1QTIgMiAwIDAwNCAzSDRabTEyIDEySDBsNC04IDMgNiAyLTQgMyA2WiIgZmlsbD0iIzlDQTNBRiIvPgo8L3N2Zz4K';
  }
  
  // 如果是完整URL，直接返回
  if (imagePath.startsWith('http')) return imagePath
  
  // 如果是相對路徑，添加基礎路徑
  return imagePath.startsWith('/') ? imagePath : `/${imagePath}`
}

// 庫存狀態
export function getStockStatus(stock: number): {
  status: 'in-stock' | 'low-stock' | 'out-of-stock'
  text: string
  color: string
} {
  if (stock === 0) {
    return {
      status: 'out-of-stock',
      text: '缺貨',
      color: 'text-red-500'
    }
  } else if (stock < 10) {
    return {
      status: 'low-stock',
      text: `庫存不足 (${stock}件)`,
      color: 'text-orange-500'
    }
  } else {
    return {
      status: 'in-stock',
      text: '有庫存',
      color: 'text-green-500'
    }
  }
}

// 計算折扣
export function calculateDiscount(
  originalPrice: number,
  discountType: 'percentage' | 'fixed',
  discountValue: number
): { discountAmount: number; finalPrice: number } {
  let discountAmount = 0
  
  if (discountType === 'percentage') {
    discountAmount = (originalPrice * discountValue) / 100
  } else {
    discountAmount = discountValue
  }
  
  const finalPrice = Math.max(0, originalPrice - discountAmount)
  
  return { discountAmount, finalPrice }
}

// 驗證email
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// 驗證手機號碼
export function validatePhone(phone: string): boolean {
  const phoneRegex = /^09\d{8}$/
  return phoneRegex.test(phone)
}

// 本地存儲工具
export const storage = {
  get: (key: string) => {
    if (typeof window === 'undefined') return null
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : null
    } catch {
      return null
    }
  },
  
  set: (key: string, value: any) => {
    if (typeof window === 'undefined') return
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // 忽略錯誤
    }
  },
  
  remove: (key: string) => {
    if (typeof window === 'undefined') return
    try {
      localStorage.removeItem(key)
    } catch {
      // 忽略錯誤
    }
  }
}

// 錯誤處理
export function handleApiError(error: any): string {
  if (error.response?.data?.error) {
    return error.response.data.error
  }
  
  if (error.message) {
    return error.message
  }
  
  return '發生未知錯誤，請稍後再試'
}

// 生成 SEO 友善的 URL slug
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s\u4e00-\u9fa5-]/g, '') // 保留中文字符
    .replace(/\s+/g, '-') // 空格替換為連字符
    .replace(/-+/g, '-') // 多個連字符替換為單個
    .replace(/^-+|-+$/g, ''); // 移除開頭和結尾的連字符
}

// 從產品生成 SEO 友善的 URL
export function generateProductUrl(product: { id: number; name: string }): string {
  const slug = generateSlug(product.name);
  return `/products/${slug}-${product.id}`;
}

// 從 URL 提取產品 ID
export function extractProductIdFromUrl(url: string): string | null {
  const match = url.match(/-(\d+)$/);
  return match ? match[1] : null;
}
