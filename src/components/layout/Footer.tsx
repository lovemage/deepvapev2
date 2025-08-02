import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                <span className="text-white font-bold text-sm">D</span>
              </div>
              <span className="text-xl font-bold text-white">DeepVape</span>
            </div>
            <p className="text-sm text-gray-400">
              DeepVape 專業的電子煙線上商城，提供各種品牌的高品質電子煙產品。
              我們致力於為港澳台地區顧客提供最好的購物體驗和優質的客戶服務。
            </p>
            <div className="flex space-x-4">
              <Facebook className="h-5 w-5 hover:text-blue-400 cursor-pointer transition-colors" />
              <Twitter className="h-5 w-5 hover:text-blue-300 cursor-pointer transition-colors" />
              <Instagram className="h-5 w-5 hover:text-pink-400 cursor-pointer transition-colors" />
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">快速連結</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-sm hover:text-white transition-colors">
                  首頁
                </Link>
              </li>
              <li>
                <Link to="/products" className="text-sm hover:text-white transition-colors">
                  所有商品
                </Link>
              </li>
              <li>
                <Link to="/products?category=host" className="text-sm hover:text-white transition-colors">
                  電子煙主機
                </Link>
              </li>
              <li>
                <Link to="/products?category=cartridge" className="text-sm hover:text-white transition-colors">
                  煙彈
                </Link>
              </li>
              <li>
                <Link to="/products?category=disposable" className="text-sm hover:text-white transition-colors">
                  拋棄式電子煙
                </Link>
              </li>
              <li>
                <Link to="/products?category=oil" className="text-sm hover:text-white transition-colors">
                  煙油
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">客戶服務</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/help" className="text-sm hover:text-white transition-colors">
                  幫助中心
                </Link>
              </li>
              <li>
                <Link to="/shipping" className="text-sm hover:text-white transition-colors">
                  配送說明
                </Link>
              </li>
              <li>
                <Link to="/returns" className="text-sm hover:text-white transition-colors">
                  退換貨政策
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-sm hover:text-white transition-colors">
                  隱私政策
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-sm hover:text-white transition-colors">
                  服務條款
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">聯絡資訊</h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="text-white font-medium">澳門總部</p>
                  <p className="text-gray-400">
                    澳門特別行政區<br/>
                    氹仔島海洋花園大馬路<br/>
                    新濠天地商場
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-4 w-4" />
                <span className="text-sm">+853 28486958</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="h-4 w-4 flex items-center justify-center">
                  <span className="text-green-400 font-bold text-xs">LINE</span>
                </div>
                <span className="text-sm">@deepvape</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="h-4 w-4" />
                <span className="text-sm">service@deepvape.org</span>
              </div>
            </div>
            
            {/* Service Area */}
            <div className="mt-6">
              <h4 className="text-sm font-semibold text-white mb-2">服務範圍</h4>
              <div className="flex flex-wrap gap-2">
                <span className="px-2 py-1 bg-blue-600 text-white text-xs rounded">香港</span>
                <span className="px-2 py-1 bg-green-600 text-white text-xs rounded">澳門</span>
                <span className="px-2 py-1 bg-red-600 text-white text-xs rounded">台灣</span>
              </div>
            </div>
            
            {/* Service Hours */}
            <div className="mt-6">
              <h4 className="text-sm font-semibold text-white mb-2">服務時間</h4>
              <p className="text-sm text-gray-400">
                週一至週日 09:00-21:00<br/>
                （澳門時間）
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-400">
              © 2025 DeepVape. 版權所有.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link to="/privacy" className="text-sm text-gray-400 hover:text-white transition-colors">
                隱私政策
              </Link>
              <Link to="/terms" className="text-sm text-gray-400 hover:text-white transition-colors">
                服務條款
              </Link>
              <Link to="/sitemap" className="text-sm text-gray-400 hover:text-white transition-colors">
                網站地圖
              </Link>
            </div>
          </div>
          
          {/* Age Verification Notice */}
          <div className="mt-6 p-4 bg-red-900/20 border border-red-800 rounded-lg">
            <p className="text-sm text-red-300 text-center">
              ⚠️ 重要提醒：本網站銷售的電子煙產品含有尼古丁，未滿18歲禁止購買和使用。請負責任地使用電子煙產品。
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
