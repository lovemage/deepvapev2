import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import AnnouncementBanner from '@/components/AnnouncementBanner';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import Home from '@/pages/Home';
import Products from '@/pages/Products';
import ProductDetail from '@/pages/ProductDetail';
import Cart from '@/pages/Cart';
import Checkout from '@/pages/Checkout';
import Admin from '@/pages/Admin';
import Shipping from '@/pages/Shipping';
import Returns from '@/pages/Returns';
import Sitemap from '@/pages/Sitemap';
import './App.css';

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
            </Routes>
          </ErrorBoundary>
        </main>
        <Footer />
        <Toaster />
      </div>
    </Router>
  );
}

export default App;
