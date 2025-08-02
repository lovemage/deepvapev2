import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Shield, Eye, Lock, Database, UserCheck, Globe, Mail, Phone } from 'lucide-react';
import SEO from '@/components/SEO';

const Privacy: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <SEO
        title="隱私政策 - DeepVape 電子煙商城"
        description="DeepVape 電子煙商城隱私政策，詳細說明個人資料收集、使用、保護措施及用戶權利。遵循澳門個人資料保護法。"
        keywords="隱私政策,個人資料保護,私隱條款,資料安全,用戶權利,澳門隱私法"
        url="/privacy"
      />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">隱私政策</h1>
            <p className="text-xl opacity-90">保護您的個人資料安全</p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          
          {/* 基本資訊 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-6 w-6 text-green-600" />
                公司基本資訊
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
                  <p className="font-medium mb-2">最後更新日期：</p>
                  <Badge variant="outline">2025年1月18日</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 資料收集範圍 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-6 w-6 text-blue-600" />
                我們收集的資料
              </CardTitle>
              <CardDescription>為提供優質服務，我們可能收集以下個人資料：</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6">
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <UserCheck className="h-4 w-4" />
                    基本身份資料
                  </h4>
                  <ul className="space-y-2 text-gray-700">
                    <li>• 姓名、身份證號碼（年齡驗證用途）</li>
                    <li>• 聯絡電話、電子郵件地址</li>
                    <li>• 收貨地址、帳單地址</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    交易及使用資料
                  </h4>
                  <ul className="space-y-2 text-gray-700">
                    <li>• 訂單記錄、付款資訊</li>
                    <li>• 網站瀏覽記錄、IP地址</li>
                    <li>• 設備資訊、瀏覽器類型</li>
                    <li>• Cookie及類似技術收集的資料</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    客戶服務資料
                  </h4>
                  <ul className="space-y-2 text-gray-700">
                    <li>• 客戶服務溝通記錄</li>
                    <li>• 投訴及查詢記錄</li>
                    <li>• 滿意度調查回覆</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 資料使用目的 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-6 w-6 text-purple-600" />
                資料使用目的
              </CardTitle>
              <CardDescription>您的個人資料將用於以下正當用途：</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-2">服務提供</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• 處理訂單及安排配送</li>
                    <li>• 年齡驗證（符合澳門電子煙相關法規）</li>
                    <li>• 客戶身份驗證及帳戶管理</li>
                  </ul>
                </div>
                
                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="font-semibold text-green-800 mb-2">客戶服務</h4>
                  <ul className="text-sm text-green-700 space-y-1">
                    <li>• 回應查詢及提供技術支援</li>
                    <li>• 處理退換貨及售後服務</li>
                    <li>• 發送訂單狀態更新通知</li>
                  </ul>
                </div>
                
                <div className="p-4 bg-purple-50 rounded-lg">
                  <h4 className="font-semibold text-purple-800 mb-2">商業營運</h4>
                  <ul className="text-sm text-purple-700 space-y-1">
                    <li>• 網站使用分析及改善</li>
                    <li>• 產品推薦及個人化服務</li>
                    <li>• 市場調查及業務發展</li>
                  </ul>
                </div>
                
                <div className="p-4 bg-red-50 rounded-lg">
                  <h4 className="font-semibold text-red-800 mb-2">法律合規</h4>
                  <ul className="text-sm text-red-700 space-y-1">
                    <li>• 遵守澳門相關法律法規</li>
                    <li>• 配合執法部門調查</li>
                    <li>• 防範欺詐及違法行為</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 資料保護措施 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-6 w-6 text-red-600" />
                資料保護措施
              </CardTitle>
              <CardDescription>我們採用多層次安全措施保護您的個人資料：</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">技術安全措施</p>
                    <p className="text-sm text-gray-600">SSL加密傳輸、防火墻保護、定期安全更新</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">存取控制</p>
                    <p className="text-sm text-gray-600">員工權限分級管理、最小權限原則</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">資料備份</p>
                    <p className="text-sm text-gray-600">定期資料備份、災難恢復計劃</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">員工培訓</p>
                    <p className="text-sm text-gray-600">定期進行資料保護及私隱培訓</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 第三方分享 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-6 w-6 text-orange-600" />
                第三方資料分享
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-gray-700">
                  我們僅在以下情況下與第三方分享您的個人資料：
                </p>
                
                <div className="border-l-4 border-blue-500 pl-4 space-y-2">
                  <p className="font-medium">服務提供夥伴</p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• 配送公司（僅分享配送所需資料）</li>
                    <li>• 付款處理服務商（遵循PCI DSS標準）</li>
                    <li>• 雲端服務提供商（具備適當安全保障）</li>
                  </ul>
                </div>
                
                <div className="border-l-4 border-red-500 pl-4 space-y-2">
                  <p className="font-medium">法律要求</p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• 應執法部門要求</li>
                    <li>• 遵守法院命令</li>
                    <li>• 配合政府監管調查</li>
                  </ul>
                </div>
                
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <strong>重要聲明：</strong>除上述情況外，我們不會出售、租借或以其他方式向第三方披露您的個人資料。
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 用戶權利 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="h-6 w-6 text-indigo-600" />
                您的權利
              </CardTitle>
              <CardDescription>根據澳門個人資料保護法，您享有以下權利：</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">查閱權</h4>
                  <p className="text-sm text-gray-600">有權查閱我們持有的您的個人資料</p>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">更正權</h4>
                  <p className="text-sm text-gray-600">有權要求更正不準確或不完整的個人資料</p>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">刪除權</h4>
                  <p className="text-sm text-gray-600">在符合法律規定的條件下，有權要求刪除個人資料</p>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">拒絕權</h4>
                  <p className="text-sm text-gray-600">有權拒絕某些類型的資料處理（如直接營銷）</p>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">可攜權</h4>
                  <p className="text-sm text-gray-600">有權要求以結構化、通用格式取得個人資料</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cookie政策 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-6 w-6 text-pink-600" />
                Cookie 使用政策
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-gray-700">
                  我們使用Cookie及類似技術來改善網站功能和用戶體驗：
                </p>
                
                <div className="grid gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full mt-2"></div>
                    <div>
                      <p className="font-medium">必要Cookie</p>
                      <p className="text-sm text-gray-600">維持網站基本功能，如購物車、登入狀態</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-3 h-3 bg-blue-500 rounded-full mt-2"></div>
                    <div>
                      <p className="font-medium">功能Cookie</p>
                      <p className="text-sm text-gray-600">記住您的偏好設定，如語言選擇</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-3 h-3 bg-purple-500 rounded-full mt-2"></div>
                    <div>
                      <p className="font-medium">分析Cookie</p>
                      <p className="text-sm text-gray-600">了解網站使用情況，優化用戶體驗</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-800">
                    您可以通過瀏覽器設定管理Cookie偏好，但請注意這可能影響網站功能。
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 聯絡資訊 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-6 w-6 text-green-600" />
                聯絡我們
              </CardTitle>
              <CardDescription>如對本隱私政策有任何疑問，請聯絡我們：</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium">電子郵件</p>
                    <p className="text-sm text-gray-600">service@deepvape.org</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium">客服電話</p>
                    <p className="text-sm text-gray-600">+853 28486958（澳門時間 09:00-21:00）</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Globe className="h-5 w-5 text-purple-600 mt-0.5" />
                  <div>
                    <p className="font-medium">總部地址</p>
                    <p className="text-sm text-gray-600">
                      深蒸汽科技有限公司<br/>
                      澳門特別行政區<br/>
                      氹仔島海洋花園大馬路<br/>
                      新濠天地商場
                    </p>
                  </div>
                </div>
              </div>
              
              <Separator className="my-6" />
              
              <div className="text-center text-sm text-gray-500">
                <p>本隱私政策受澳門特別行政區法律管轄</p>
                <p className="mt-2">最後更新：2025年1月18日</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Privacy;