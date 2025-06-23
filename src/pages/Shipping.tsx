import React from 'react';
import { ShoppingCart, CreditCard, Truck, AlertCircle } from 'lucide-react';
import SEO from '@/components/SEO';

const Shipping: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <SEO
        title="配送說明 - DeepVape 電子煙商城"
        description="了解 DeepVape 電子煙商城的配送流程，簡單三步驟完成購物。支援7-11、全家便利商店取貨，3-5個工作天快速配送。"
        keywords="配送說明,電子煙配送,便利商店取貨,7-11取貨,全家取貨,電子煙購物流程"
        url="/shipping"
      />
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">配送說明</h1>
            <p className="text-lg text-gray-600">
              簡單三步驟，輕鬆完成購物流程
            </p>
          </div>

          {/* Steps */}
          <div className="space-y-12">
            {/* Step 1 */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="flex items-center mb-6">
                <div className="bg-blue-500 text-white rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold mr-4">
                  1
                </div>
                <div className="flex items-center">
                  <ShoppingCart className="h-6 w-6 text-blue-500 mr-2" />
                  <h2 className="text-2xl font-bold text-gray-900">挑選商品</h2>
                </div>
              </div>
              <p className="text-gray-700 leading-relaxed">
                瀏覽我們的產品頁面，選擇您喜歡的電子煙主機或煙彈。每個產品都有詳細的規格說明和多種口味選擇。找到心儀的商品後，選擇數量和口味，點擊【加入購物車】按鈕即可。
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="flex items-center mb-6">
                <div className="bg-green-500 text-white rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold mr-4">
                  2
                </div>
                <div className="flex items-center">
                  <CreditCard className="h-6 w-6 text-green-500 mr-2" />
                  <h2 className="text-2xl font-bold text-gray-900">結帳與填寫資料</h2>
                </div>
              </div>
              <p className="text-gray-700 leading-relaxed">
                進入購物車頁面確認商品無誤後，填寫取件人姓名、聯絡電話等必要資訊。選擇取貨的便利商店（7-11或全家），並填寫正確的門市名稱和門市號碼。確認所有資訊正確後，點擊【建立訂單】。
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="flex items-center mb-6">
                <div className="bg-purple-500 text-white rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold mr-4">
                  3
                </div>
                <div className="flex items-center">
                  <Truck className="h-6 w-6 text-purple-500 mr-2" />
                  <h2 className="text-2xl font-bold text-gray-900">官方網站寄送超商</h2>
                </div>
              </div>
              <p className="text-gray-700 leading-relaxed">
                訂單確認後，我們會在3-5個工作天內將商品寄送到您指定的便利商店。您會收到取貨通知，請攜帶身分證件到門市取貨。取貨時請確認商品無誤再完成取貨程序。
              </p>
            </div>
          </div>

          {/* Important Notice */}
          <div className="mt-12 bg-amber-50 border border-amber-200 rounded-lg p-8">
            <div className="flex items-center mb-6">
              <AlertCircle className="h-6 w-6 text-amber-600 mr-2" />
              <h2 className="text-2xl font-bold text-amber-800">重要提醒</h2>
            </div>
            <ul className="space-y-3 text-amber-800">
              <li className="flex items-start">
                <span className="text-amber-600 mr-2">•</span>
                <span>請確保填寫的個人資料正確無誤，以免影響取貨</span>
              </li>
              <li className="flex items-start">
                <span className="text-amber-600 mr-2">•</span>
                <span>門市資訊請務必填寫完整，包含正確的門市名稱和號碼</span>
              </li>
              <li className="flex items-start">
                <span className="text-amber-600 mr-2">•</span>
                <span>商品寄達門市後請盡快取貨，避免超過保管期限</span>
              </li>
              <li className="flex items-start">
                <span className="text-amber-600 mr-2">•</span>
                <span>取貨時請攜帶身分證件以供核對身份</span>
              </li>
            </ul>
          </div>

          {/* Contact Section */}
          <div className="mt-12 bg-gray-900 text-white rounded-lg p-8 text-center">
            <h3 className="text-2xl font-bold mb-4">需要協助？</h3>
            <p className="text-gray-300 mb-6">
              如果您在購物過程中遇到任何問題，歡迎聯絡我們的客服團隊
            </p>
            <div className="flex justify-center items-center space-x-4">
              <div className="flex items-center">
                <div className="h-5 w-5 flex items-center justify-center mr-2">
                  <span className="text-green-400 font-bold text-sm">LINE</span>
                </div>
                <span>@deepvape</span>
              </div>
              <span className="text-gray-500">|</span>
              <span className="text-gray-300">週一至週日（全年無休）</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Shipping; 