import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCartStore } from '@/lib/store';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const { itemCount } = useCartStore();
  const [logoClickCount, setLogoClickCount] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogoClick = () => {
    setLogoClickCount(prev => {
      const newCount = prev + 1;
      if (newCount >= 5) {
        navigate('/admin');
        setLogoClickCount(0);
        return 0;
      }
      
      // 3秒後重置計數
      setTimeout(() => {
        setLogoClickCount(0);
      }, 3000);
      
      return newCount;
    });
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const navigationItems = [
    { label: '首頁', path: '/' },
    { label: '商品', path: '/products' },
    { label: '配送說明', path: '/shipping' },
    { label: '退換貨政策', path: '/returns' },
  ];

  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
          @font-face {
            src: url("https://www.axis-praxis.org/fonts/webfonts/MetaVariableDemo-Set.woff2")
              format("woff2");
            font-family: "Meta";
            font-style: normal;
            font-weight: normal;
          }
          
          .deepvape-logo {
            transition: all 0.5s;
            -webkit-text-stroke: 2px #d6f4f4;
            font-variation-settings: "wght" 900, "ital" 1;
            font-size: 2.5rem;
            text-align: center;
            color: transparent;
            font-family: "Meta", sans-serif;
            text-shadow: 2px 2px 0px #07bccc,
              3px 3px 0px #e601c0,
              4px 4px 0px #e9019a,
              5px 5px 0px #f40468,
              8px 8px 5px #482896;
            cursor: pointer;
            text-decoration: none;
            user-select: none;
          }
          
          .deepvape-logo:hover {
            font-variation-settings: "wght" 100, "ital" 0;
            text-shadow: none;
            color: transparent;
          }
          
          @media (max-width: 768px) {
            .deepvape-logo {
              font-size: 1.8rem;
              -webkit-text-stroke: 1px #d6f4f4;
              text-shadow: 1px 1px 0px #07bccc,
                2px 2px 0px #e601c0,
                3px 3px 0px #e9019a,
                4px 4px 0px #f40468,
                6px 6px 3px #482896;
            }
          }
          
          .mobile-menu-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            z-index: 40;
          }
          
          .mobile-menu {
            position: fixed;
            top: 0;
            right: 0;
            height: 100vh;
            width: 280px;
            background: white;
            z-index: 50;
            transform: translateX(100%);
            transition: transform 0.3s ease-in-out;
          }
          
          .mobile-menu.open {
            transform: translateX(0);
          }
        `
      }} />
      
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-4">
            <div 
              className="deepvape-logo"
              onClick={handleLogoClick}
              title={logoClickCount > 0 ? `${logoClickCount}/5` : undefined}
            >
              DEEPVAPE
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {navigationItems.map((item) => (
              <Link 
                key={item.path}
                to={item.path} 
                className="text-sm font-medium hover:text-primary transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Right side actions */}
          <div className="flex items-center space-x-4">
            <Link to="/cart">
              <Button variant="ghost" size="sm" className="relative">
                <ShoppingCart className="h-4 w-4" />
                {itemCount > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
                  >
                    {itemCount}
                  </Badge>
                )}
                <span className="sr-only">購物車</span>
              </Button>
            </Link>

            {/* Mobile menu button */}
            <Button 
              variant="ghost" 
              size="sm" 
              className="md:hidden"
              onClick={toggleMobileMenu}
            >
              <Menu className="h-4 w-4" />
              <span className="sr-only">選單</span>
            </Button>
          </div>
        </div>

        {/* Mobile Navigation Overlay */}
        {isMobileMenuOpen && (
          <div className="mobile-menu-overlay" onClick={closeMobileMenu} />
        )}

        {/* Mobile Navigation Menu */}
        <div className={`mobile-menu ${isMobileMenuOpen ? 'open' : ''}`}>
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-semibold text-lg">選單</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={closeMobileMenu}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Navigation Items */}
            <nav className="flex-1 p-4">
              <div className="space-y-4">
                {navigationItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className="block py-2 px-3 text-base font-medium hover:bg-gray-100 rounded-md transition-colors"
                    onClick={closeMobileMenu}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </nav>
          </div>
        </div>

        {/* Desktop Mobile Navigation (fallback) */}
        <div className="md:hidden border-t">
          <nav className="container py-2 flex flex-wrap gap-4 text-sm">
            {navigationItems.map((item) => (
              <Link 
                key={item.path}
                to={item.path} 
                className="font-medium hover:text-primary transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
    </>
  );
};

export default Header;
