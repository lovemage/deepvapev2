import React, { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import AnnouncementBanner from '@/components/AnnouncementBanner';
import FloatingCartButton from '@/components/FloatingCartButton';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import './App.css';

// 使用 React.lazy 進行代碼分割
const Home = lazy(() => import('@/pages/Home'));
const Products = lazy(() => import('@/pages/Products'));
const ProductDetail = lazy(() => import('@/pages/ProductDetail'));
const Cart = lazy(() => import('@/pages/Cart'));
const Checkout = lazy(() => import('@/pages/Checkout'));
const Admin = lazy(() => import('@/pages/Admin'));
const Shipping = lazy(() => import('@/pages/Shipping'));
const Returns = lazy(() => import('@/pages/Returns'));
const Sitemap = lazy(() => import('@/pages/Sitemap'));
const FAQ = lazy(() => import('@/pages/FAQ'));
const Privacy = lazy(() => import('@/pages/Privacy'));
const Terms = lazy(() => import('@/pages/Terms'));

// 載入中組件
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[400px]">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
  </div>
);

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

function App() {
  const { toast } = useToast();

  useEffect(() => {
    // 監聽全局錯誤事件
    const handleError = (event: ErrorEvent) => {
      console.error("全局錯誤捕獲:", event.error);
      toast({
        title: "發生錯誤",
        description: "系統出現未知錯誤，請稍後再試。",
        variant: "destructive",
      });
    };
    window.addEventListener("error", handleError);
    return () => {
      window.removeEventListener("error", handleError);
    };
  }, [toast]);
  
  return (
    <Router>
      <ScrollToTop />
      <div className={cn(
        "min-h-screen bg-background font-sans antialiased",
        "flex flex-col"
      )}>
        <Header />
        <AnnouncementBanner />
        <main className="flex-grow">
          <ErrorBoundary>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/products" element={<Products />} />
                <Route path="/products/:id" element={<ProductDetail />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/shipping" element={<Shipping />} />
                <Route path="/returns" element={<Returns />} />
                <Route path="/sitemap" element={<Sitemap />} />
                <Route path="/faq" element={<FAQ />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/terms" element={<Terms />} />
              </Routes>
            </Suspense>
          </ErrorBoundary>
        </main>
        <Footer />
        <FloatingCartButton />
        <Toaster />
      </div>
    </Router>
  );
}

export default App;
