import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Menu, X, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCartStore } from '@/lib/store';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

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
    { label: '配送說明', path: '/shipping' },
    { label: '退換貨政策', path: '/returns' },
  ];

  const productCategories = [
    { label: '主機 (Vape)', category: 'host' },
    { label: '煙彈 (Pods)', category: 'cartridge' },
    { label: '拋棄式 (Disposable)', category: 'disposable' },
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
            display: flex;
            flex-direction: column;
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
            <Link to="/" className="deepvape-logo" onClick={handleLogoClick}>
              DEEPVAPE
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-sm font-medium hover:text-primary transition-colors">
              首頁
            </Link>
            <div className="relative group">
              <Link to="/products" className="text-sm font-medium hover:text-primary transition-colors flex items-center">
                商品 <ChevronDown className="ml-1 h-4 w-4" />
              </Link>
              <div className="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 invisible group-hover:visible">
                {productCategories.map((cat) => (
                  <Link
                    key={cat.category}
                    to={`/products?category=${cat.category}`}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    {cat.label}
                  </Link>
                ))}
              </div>
            </div>
            {navigationItems.slice(1).map((item) => (
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
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart className="h-5 w-5" />
                {itemCount > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center p-0 text-xs"
                    size="sm"
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
              size="icon" 
              className="md:hidden"
              onClick={toggleMobileMenu}
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">選單</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="mobile-menu-overlay" onClick={closeMobileMenu} />
      )}
      <div className={`mobile-menu ${isMobileMenuOpen ? 'open' : ''}`}>
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
        <nav className="flex-1 p-4 overflow-y-auto">
          <div className="space-y-2">
            <Link
              to="/"
              className="block py-2 px-3 text-base font-medium hover:bg-gray-100 rounded-md transition-colors"
              onClick={closeMobileMenu}
            >
              首頁
            </Link>
            
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="products" className="border-b-0">
                <AccordionTrigger className="py-2 px-3 text-base font-medium hover:bg-gray-100 rounded-md transition-colors">
                  <Link to="/products" onClick={(e) => { e.stopPropagation(); closeMobileMenu(); }}>商品</Link>
                </AccordionTrigger>
                <AccordionContent className="pl-4">
                  {productCategories.map((cat) => (
                    <Link
                      key={cat.category}
                      to={`/products?category=${cat.category}`}
                      className="block py-2 px-3 text-base font-medium hover:bg-gray-100 rounded-md transition-colors"
                      onClick={closeMobileMenu}
                    >
                      {cat.label}
                    </Link>
                  ))}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
            
            {navigationItems.slice(1).map((item) => (
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
    </>
  );
};

export default Header;
