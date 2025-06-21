import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
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

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <div className="min-h-screen bg-gray-50 flex flex-col">
          <AnnouncementBanner />
          <Header />
          <main className="flex-1">
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
          </main>
          <Footer />
          <Toaster />
        </div>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
