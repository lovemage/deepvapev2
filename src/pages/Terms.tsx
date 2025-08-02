import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { FileText, Scale, AlertTriangle, CreditCard, Truck, UserX, Shield, Gavel } from 'lucide-react';
import SEO from '@/components/SEO';

const Terms: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <SEO
        title="服務條款 - DeepVape 電子煙商城"
        description="DeepVape 電子煙商城服務條款，詳細說明使用條件、購買流程、責任限制及爭議解決。遵循澳門法律規範。"
        keywords="服務條款,使用條款,購買條件,電子煙法規,澳門法律,用戶協議"
        url="/terms"
      />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">服務條款</h1>
            <p className="text-xl opacity-90">使用本網站前請詳細閱讀</p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          
          {/* 基本資訊 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-6 w-6 text-blue-600" />
                服務提供者資訊
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="font-medium mb-2">公司名稱：</p>
                  <p className="text-gray-700">深蒸汽科技有限公司 (DeepVape Technology Ltd.)</p>
                </div>
                <div>
                  <p className="font-medium mb-2">註冊地址：</p>
                  <p className="text-gray-700">澳門特別行政區</p>
                </div>
                <div>
                  <p className="font-medium mb-2">商業登記編號：</p>
                  <p className="text-gray-700">[商業登記號碼]</p>
                </div>
                <div>
                  <p className="font-medium mb-2">生效日期：</p>
                  <Badge variant="outline">2025年1月18日</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 接受條款 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scale className="h-6 w-6 text-green-600" />
                接受條款
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-gray-700">
                  使用本網站及購買我們的產品，即表示您同意遵守以下服務條款。如果您不同意這些條款，請勿使用本網站。
                </p>
                
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-amber-800">重要提醒</p>
                      <p className="text-sm text-amber-700 mt-1">
                        我們保留隨時修改這些條款的權利。修改後的條款將在網站上公布並立即生效。
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 年齡限制 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserX className="h-6 w-6 text-red-600" />
                年齡限制及資格要求
              </CardTitle>
              <CardDescription>根據澳門相關法規，使用本網站有嚴格的年齡限制</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-red-800">嚴格年齡限制</p>
                      <ul className="text-sm text-red-700 mt-1 space-y-1">
                        <li>• 必須年滿18歲方可購買電子煙產品</li>
                        <li>• 購買時需提供有效身份證明文件</li>
                        <li>• 我們保留要求額外年齡驗證的權利</li>
                      </ul>
                    </div>
                  </div>
                </div>
                
                <div className="grid gap-4">
                  <div className="flex items-start gap-3">
                    <Shield className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">法律合規</p>
                      <p className="text-sm text-gray-600">
                        您確認遵守澳門特別行政區及您所在地區的所有相關法律法規
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Shield className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">個人使用</p>
                      <p className="text-sm text-gray-600">
                        購買的產品僅供個人使用，不得轉售或分發給未成年人
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 產品及服務 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-6 w-6 text-purple-600" />
                產品及服務
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold mb-3">產品描述</h4>
                  <ul className="space-y-2 text-gray-700">
                    <li>• 我們努力確保產品描述的準確性，但不保證完全無誤</li>
                    <li>• 產品圖片僅供參考，實際產品可能略有差異</li>
                    <li>• 所有產品規格以製造商提供的資訊為準</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-3">庫存及供應</h4>
                  <ul className="space-y-2 text-gray-700">
                    <li>• 所有產品的供應取決於庫存情況</li>
                    <li>• 我們保留因庫存不足而取消訂單的權利</li>
                    <li>• 缺貨時將及時通知並提供退款或替代方案</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-3">價格政策</h4>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <ul className="space-y-2 text-blue-700">
                      <li>• 所有價格以澳門幣（MOP）計算</li>
                      <li>• 價格包含適用的稅費</li>
                      <li>• 我們保留隨時調整價格的權利</li>
                      <li>• 下單時的價格為最終價格</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 訂購及付款 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-6 w-6 text-green-600" />
                訂購及付款條款
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold mb-3">訂單處理</h4>
                  <div className="grid gap-3">
                    <div className="p-3 border rounded-lg">
                      <p className="font-medium text-sm">1. 下單確認</p>
                      <p className="text-xs text-gray-600 mt-1">
                        下單後您將收到訂單確認郵件，但這不代表我們接受您的訂單
                      </p>
                    </div>
                    
                    <div className="p-3 border rounded-lg">
                      <p className="font-medium text-sm">2. 訂單審核</p>
                      <p className="text-xs text-gray-600 mt-1">
                        我們會進行年齡驗證和庫存檢查，審核通過後正式接受訂單
                      </p>
                    </div>
                    
                    <div className="p-3 border rounded-lg">
                      <p className="font-medium text-sm">3. 付款處理</p>
                      <p className="text-xs text-gray-600 mt-1">
                        接受訂單後進行付款處理，付款成功後開始配送
                      </p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-3">付款方式</h4>
                  <ul className="space-y-2 text-gray-700">
                    <li>• 支持信用卡、借記卡付款</li>
                    <li>• 支持銀行轉帳、電子錢包</li>
                    <li>• 所有付款資訊均採用加密傳輸</li>
                    <li>• 付款失敗的訂單將自動取消</li>
                  </ul>
                </div>
                
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="font-medium text-yellow-800 mb-2">訂單取消政策</p>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    <li>• 未付款訂單：可隨時取消</li>
                    <li>• 已付款但未發貨：可申請取消並全額退款</li>
                    <li>• 已發貨訂單：請參考退換貨政策</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 配送條款 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-6 w-6 text-orange-600" />
                配送條款
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-3">配送範圍</h4>
                  <p className="text-gray-700 mb-2">目前配送至以下地區：</p>
                  <div className="grid gap-3">
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                        <span className="font-medium text-green-800">香港特別行政區</span>
                      </div>
                      <p className="text-sm text-green-700">香港島、九龍、新界</p>
                    </div>
                    
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
                        <span className="font-medium text-blue-800">澳門特別行政區</span>
                      </div>
                      <p className="text-sm text-blue-700">澳門半島、氹仔島、路環島</p>
                    </div>
                    
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                        <span className="font-medium text-red-800">台灣地區</span>
                      </div>
                      <p className="text-sm text-red-700">台灣本島、離島地區</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-3">配送時間</h4>
                  <div className="grid gap-2">
                    <div className="flex justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm">澳門本地</span>
                      <span className="text-sm font-medium">24-48小時</span>
                    </div>
                    <div className="flex justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm">香港地區</span>
                      <span className="text-sm font-medium">2-4個工作日</span>
                    </div>
                    <div className="flex justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm">台灣地區</span>
                      <span className="text-sm font-medium">2-4個工作日</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="font-medium text-blue-800 mb-2">配送注意事項</p>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• 配送時需要成年人簽收</li>
                    <li>• 可能需要出示身份證明文件</li>
                    <li>• 無人簽收時會嘗試重新配送</li>
                    <li>• 特殊天氣可能影響配送時間</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 責任限制 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-6 w-6 text-indigo-600" />
                責任限制
              </CardTitle>
              <CardDescription>使用本服務時請注意以下責任限制條款</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-3">服務可用性</h4>
                  <ul className="space-y-2 text-gray-700">
                    <li>• 我們致力於維持網站正常運行，但不保證100%可用性</li>
                    <li>• 維護期間可能暫時中斷服務</li>
                    <li>• 因技術故障造成的損失，我們不承擔責任</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-3">產品責任</h4>
                  <ul className="space-y-2 text-gray-700">
                    <li>• 產品品質問題按製造商保固條款處理</li>
                    <li>• 我們不對產品使用造成的健康影響負責</li>
                    <li>• 用戶需自行評估產品適用性</li>
                  </ul>
                </div>
                
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-red-800">健康警告</p>
                      <p className="text-sm text-red-700 mt-1">
                        電子煙產品含有尼古丁，可能對健康造成影響。使用前請諮詢醫生建議，孕婦及哺乳期婦女不建議使用。
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 知識產權 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-6 w-6 text-purple-600" />
                知識產權
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-gray-700">
                  本網站的所有內容，包括但不限於文字、圖片、商標、標識等，均受知識產權法保護。
                </p>
                
                <div className="grid gap-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">使用許可</h4>
                    <p className="text-sm text-gray-600">
                      僅授予您個人、非商業用途的有限使用許可
                    </p>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">禁止行為</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• 複製、修改或分發網站內容</li>
                      <li>• 商業用途使用我們的商標</li>
                      <li>• 逆向工程或破解網站功能</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 爭議解決 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gavel className="h-6 w-6 text-red-600" />
                爭議解決
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-3">適用法律</h4>
                  <p className="text-gray-700">
                    本服務條款受澳門特別行政區法律管轄和解釋。
                  </p>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-3">爭議處理程序</h4>
                  <div className="space-y-3">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <p className="font-medium text-blue-800">第一步：友好協商</p>
                      <p className="text-sm text-blue-700 mt-1">
                        發生爭議時，雙方應首先通過友好協商解決
                      </p>
                    </div>
                    
                    <div className="p-3 bg-green-50 rounded-lg">
                      <p className="font-medium text-green-800">第二步：調解處理</p>
                      <p className="text-sm text-green-700 mt-1">
                        協商不成的，可申請相關消費者保護機構調解
                      </p>
                    </div>
                    
                    <div className="p-3 bg-purple-50 rounded-lg">
                      <p className="font-medium text-purple-800">第三步：法律途徑</p>
                      <p className="text-sm text-purple-700 mt-1">
                        調解不成的，可向澳門特別行政區法院提起訴訟
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="font-medium mb-2">聯絡資訊</p>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>總部地址：澳門特別行政區氹仔島海洋花園大馬路新濠天地商場</p>
                    <p>客服郵箱：service@deepvape.org</p>
                    <p>客服電話：+853 28486958</p>
                    <p>服務時間：週一至週日 09:00-21:00（澳門時間）</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 條款修改 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-6 w-6 text-orange-600" />
                條款修改
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-gray-700">
                  我們保留隨時修改本服務條款的權利。修改後的條款將在網站上公布。
                </p>
                
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="font-medium text-yellow-800 mb-2">重要提醒</p>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    <li>• 重大修改會提前30天通知</li>
                    <li>• 繼續使用服務即視為接受新條款</li>
                    <li>• 不同意修改的用戶可停止使用服務</li>
                  </ul>
                </div>
              </div>
              
              <Separator className="my-6" />
              
              <div className="text-center text-sm text-gray-500">
                <p>本服務條款受澳門特別行政區法律管轄</p>
                <p className="mt-2">生效日期：2025年1月18日</p>
                <p className="mt-1">版本：1.0</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Terms;