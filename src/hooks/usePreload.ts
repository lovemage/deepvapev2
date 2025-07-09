import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// 預載入圖片
export const preloadImage = (src: string) => {
  const img = new Image();
  img.src = src;
};

// 預載入多個圖片
export const preloadImages = (images: string[]) => {
  images.forEach(src => preloadImage(src));
};

// 預載入組件
export const preloadComponent = (componentPath: string) => {
  import(componentPath).catch(() => {
    // 忽略錯誤，這只是預載入
  });
};

// 使用 Intersection Observer 實現懶加載
export const useLazyLoad = (
  ref: React.RefObject<HTMLElement>,
  callback: () => void,
  options?: IntersectionObserverInit
) => {
  useEffect(() => {
    if (!ref.current) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        callback();
        observer.disconnect();
      }
    }, options);

    observer.observe(ref.current);

    return () => observer.disconnect();
  }, [ref, callback, options]);
};

// 預載入頁面資源
export const usePagePreload = () => {
  const location = useLocation();

  useEffect(() => {
    // 根據當前頁面預載入可能需要的資源
    switch (location.pathname) {
      case '/':
        // 首頁：預載入產品列表頁資源
        preloadComponent('@/pages/Products');
        break;
      case '/products':
        // 產品列表：預載入產品詳情頁資源
        preloadComponent('@/pages/ProductDetail');
        break;
      default:
        break;
    }
  }, [location]);
};

// 預取數據
export const prefetchData = async (url: string) => {
  try {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = url;
    link.as = 'fetch';
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  } catch (error) {
    console.error('Prefetch failed:', error);
  }
};

// 使用 requestIdleCallback 優化性能
export const useIdleCallback = (callback: () => void, deps: any[] = []) => {
  useEffect(() => {
    if ('requestIdleCallback' in window) {
      const id = window.requestIdleCallback(callback);
      return () => window.cancelIdleCallback(id);
    } else {
      // 降級處理
      const timer = setTimeout(callback, 1);
      return () => clearTimeout(timer);
    }
  }, deps);
};