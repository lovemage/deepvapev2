import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, XCircle, Clock, Shield, MessageCircle, Package, RefreshCw, CheckSquare } from 'lucide-react';
import SEO from '@/components/SEO';

const Returns: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <SEO
        title="退換貨政策 - DeepVape 電子煙商城"
        description="DeepVape 電子煙商城退換貨政策，7天內品質問題可退換貨，電子煙主機提供3個月保固服務。詳細退換貨流程說明。"
        keywords="退換貨政策,電子煙退貨,電子煙換貨,保固服務,退款流程,電子煙保固"
        url="/returns"
      />
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">退換貨政策</h1>
            <p className="text-xl opacity-90">保障您的購物權益，安心購買</p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          
          {/* 退貨政策 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="h-6 w-6 text-blue-600" />
                退貨政策
              </CardTitle>
              <CardDescription>為保障消費者權益，我們提供以下退貨服務：</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div className="font-medium">
                    商品收到後 <Badge variant="outline">7 天內</Badge>，如有品質問題可申請退貨
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <p>退貨商品需保持原包裝完整，未使用且無人為損壞</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <p>電子煙主機需附上所有配件及包裝盒</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <p>煙彈類產品一經拆封恕不接受退貨（品質問題除外）</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <p>退貨運費由消費者負擔，品質問題則由本公司承擔</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 換貨政策 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-6 w-6 text-purple-600" />
                換貨政策
              </CardTitle>
              <CardDescription>以下情況可申請換貨服務：</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <p>商品收到時有瑕疵或損壞</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <p>商品與訂單不符（顏色、規格錯誤）</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <p>電子煙主機功能異常或無法正常使用</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <p>煙彈漏液或口味與描述嚴重不符</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <p>其他經確認屬於品質問題的情況</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 不可退換情況 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <XCircle className="h-6 w-6 text-red-600" />
                不可退換情況
              </CardTitle>
              <CardDescription>以下情況恕不接受退換貨：</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div className="flex items-start gap-3">
                  <XCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <p>超過 7 天退換貨期限</p>
                </div>
                <div className="flex items-start gap-3">
                  <XCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <p>商品已使用且非品質問題</p>
                </div>
                <div className="flex items-start gap-3">
                  <XCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <p>包裝破損或配件不齊全</p>
                </div>
                <div className="flex items-start gap-3">
                  <XCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <p>人為損壞或不當使用造成的故障</p>
                </div>
                <div className="flex items-start gap-3">
                  <XCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <p>個人喜好問題（口味、外觀等主觀因素）</p>
                </div>
                <div className="flex items-start gap-3">
                  <XCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <p>煙彈已拆封且無品質問題</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 重要提醒 */}
          <Card className="border-orange-200 bg-orange-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-800">
                <Clock className="h-6 w-6" />
                重要提醒
              </CardTitle>
            </CardHeader>
            <CardContent className="text-orange-800">
              <div className="space-y-3">
                <p><strong>1.</strong> 申請退換貨前請先聯繫客服，我們會協助您判斷是否符合退換貨條件</p>
                <p><strong>2.</strong> 退換貨過程中請保留所有憑證和包裝材料</p>
                <p><strong>3.</strong> 為確保商品品質，建議在收到商品後立即檢查</p>
                <p><strong>4.</strong> 退款將在收到退貨商品並檢查無誤後 5-7 個工作天內處理</p>
                <p><strong>5.</strong> 本政策僅適用於直接向本公司購買的商品</p>
              </div>
            </CardContent>
          </Card>

          {/* 退換貨流程 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckSquare className="h-6 w-6 text-indigo-600" />
                退換貨流程
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-blue-600 font-bold text-lg">1</span>
                  </div>
                  <h3 className="font-semibold mb-2">聯繫客服</h3>
                  <p className="text-sm text-gray-600">透過 LINE、電話或 Email 聯繫客服，說明退換貨原因</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-purple-600 font-bold text-lg">2</span>
                  </div>
                  <h3 className="font-semibold mb-2">確認資格</h3>
                  <p className="text-sm text-gray-600">客服確認退換貨資格後，提供退貨地址及注意事項</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-green-600 font-bold text-lg">3</span>
                  </div>
                  <h3 className="font-semibold mb-2">寄回商品</h3>
                  <p className="text-sm text-gray-600">將商品完整包裝後寄回指定地址，建議使用掛號郵寄</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-orange-600 font-bold text-lg">4</span>
                  </div>
                  <h3 className="font-semibold mb-2">處理完成</h3>
                  <p className="text-sm text-gray-600">收到商品並檢查後，進行退款或寄送新商品</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 保固服務 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-6 w-6 text-green-600" />
                保固服務
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">電子煙主機提供 <Badge variant="secondary">3 個月</Badge> 保固服務</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <p>保固期間內非人為損壞可免費維修或更換</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <p>保固範圍包括：充電故障、按鍵失靈、LED 燈異常等</p>
                </div>
                <div className="flex items-start gap-3">
                  <XCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <p>不包括：外觀刮傷、進水、摔落損壞等人為因素</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <p>保固期間請保留購買憑證</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 聯繫我們 */}
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-800">
                <MessageCircle className="h-6 w-6" />
                需要協助？立即聯繫我們
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6 text-center">
                <div className="space-y-2">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                    <MessageCircle className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-blue-800">LINE</h3>
                  <p className="text-blue-700">@deepvape</p>
                </div>
                <div className="space-y-2">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                    <MessageCircle className="h-6 w-6 text-purple-600" />
                  </div>
                  <h3 className="font-semibold text-blue-800">Email</h3>
                  <p className="text-blue-700">service@deepvape.com</p>
                </div>
                <div className="space-y-2">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                    <Clock className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="font-semibold text-blue-800">客服時間</h3>
                  <p className="text-blue-700">週一至週五<br />10:00-18:00</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Returns; 