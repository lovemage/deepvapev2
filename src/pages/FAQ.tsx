import React from 'react';
import { ChevronDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import SEO, { createFAQStructuredData } from '@/components/SEO';

const faqs = [
  {
    question: "DeepVape 商城是否提供正品保證？",
    answer: "是的，我們承諾所有產品均為原廠正品。每件產品都有防偽標籤，您可以透過官方網站驗證真偽。如發現非正品，我們提供全額退款保證。"
  },
  {
    question: "配送需要多長時間？",
    answer: "一般情況下，訂單會在 1-2 個工作日內處理並發貨。台灣本島配送通常需要 2-3 個工作日，離島地區可能需要 3-5 個工作日。我們提供訂單追蹤服務，讓您隨時掌握包裹動態。"
  },
  {
    question: "可以使用哪些付款方式？",
    answer: "我們目前支援貨到付款（COD）。未來將陸續開放信用卡、LINE Pay、街口支付等多種付款方式，為您提供更便利的購物體驗。"
  },
  {
    question: "如何確保購買電子煙的合法性？",
    answer: "根據台灣現行法規，購買電子煙產品需年滿 18 歲。我們在網站上實施年齡驗證機制，並在配送時要求查驗身份證件，確保產品不會售予未成年人。"
  },
  {
    question: "產品有保固嗎？",
    answer: "是的，所有電子煙主機產品均享有原廠保固。保固期限依不同品牌而定，通常為 3-12 個月。煙彈和拋棄式產品屬於消耗品，不在保固範圍內。"
  },
  {
    question: "可以退換貨嗎？",
    answer: "未拆封的產品可在收貨後 7 天內申請退換貨。基於衛生考量，已拆封的煙彈和拋棄式產品恕不接受退換。如產品有瑕疵，請立即聯繫客服處理。"
  },
  {
    question: "如何選擇適合的電子煙產品？",
    answer: "選擇電子煙產品時，建議考慮：1) 使用習慣（新手或老手）2) 口味偏好 3) 尼古丁含量需求 4) 預算。如需協助，歡迎聯繫我們的客服團隊，我們將為您提供專業建議。"
  },
  {
    question: "電子煙對健康有什麼影響？",
    answer: "電子煙雖然相較傳統香煙減少了許多有害物質，但仍含有尼古丁等成分。我們建議非吸煙者不要使用電子煙產品，吸煙者可將電子煙作為戒煙的過渡選擇。孕婦和未成年人禁止使用。"
  }
];

const FAQ: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <SEO
        title="常見問題 - DeepVape 電子煙商城"
        description="DeepVape 電子煙商城常見問題解答，包含產品保證、配送、付款、退換貨等相關資訊。"
        keywords="電子煙常見問題,電子煙FAQ,DeepVape客服,電子煙購買指南"
        url="/faq"
        structuredData={createFAQStructuredData(faqs)}
      />

      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">常見問題</h1>
        
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>我們在這裡為您解答</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              以下是客戶最常詢問的問題。如果您找不到答案，歡迎隨時聯繫我們的客服團隊。
            </p>
          </CardContent>
        </Card>

        <Accordion type="single" collapsible className="space-y-4">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`} className="border rounded-lg">
              <AccordionTrigger className="px-6 py-4 hover:no-underline">
                <span className="text-left font-medium">{faq.question}</span>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-4">
                <p className="text-gray-600">{faq.answer}</p>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <Card className="mt-8 bg-purple-50 border-purple-200">
          <CardContent className="p-6 text-center">
            <h3 className="text-lg font-semibold mb-2">還有其他問題嗎？</h3>
            <p className="text-gray-600 mb-4">
              我們的客服團隊隨時為您服務
            </p>
            <div className="space-y-2">
              <p className="text-sm">
                <strong>客服信箱：</strong> angel857168@gmail.com
              </p>
              <p className="text-sm">
                <strong>服務時間：</strong> 週一至週五 9:00-18:00
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FAQ;