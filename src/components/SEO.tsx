import React from 'react';
import { Helmet } from 'react-helmet-async';
import { siteConfig, getFullUrl, getFullImageUrl } from '@/lib/config';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'product' | 'article';
  structuredData?: object;
  noindex?: boolean;
  canonical?: string;
}

const SEO: React.FC<SEOProps> = ({
  title = siteConfig.title,
  description = siteConfig.description,
  keywords = siteConfig.keywords,
  image = siteConfig.defaultImage,
  url = '/',
  type = 'website',
  structuredData,
  noindex = false,
  canonical
}) => {
  const fullTitle = title.includes(siteConfig.name) ? title : `${title} | ${siteConfig.name} 電子煙商城`;
  const fullUrl = url.startsWith('http') ? url : getFullUrl(url);
  const fullImageUrl = getFullImageUrl(image);
  const canonicalUrl = canonical || fullUrl;

  return (
    <Helmet>
      {/* 基本 Meta 標籤 */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content={siteConfig.author} />

      {/* 索引控制 */}
      <meta name="robots" content={noindex ? 'noindex, nofollow' : 'index, follow'} />

      {/* Canonical URL */}
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph 標籤 */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:image" content={fullImageUrl} />
      <meta property="og:site_name" content={siteConfig.name} />
      <meta property="og:locale" content="zh_TW" />

      {/* Twitter Card 標籤 */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImageUrl} />
      
      {/* 結構化數據 */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
};

export default SEO;

// 預設的結構化數據模板
export const createProductStructuredData = (product: any) => ({
  "@context": "https://schema.org",
  "@type": "Product",
  "name": product.name,
  "description": product.description,
  "image": product.image_url,
  "brand": {
    "@type": "Brand",
    "name": product.brand
  },
  "offers": {
    "@type": "Offer",
    "price": product.price,
    "priceCurrency": "TWD",
    "availability": product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    "seller": {
      "@type": "Organization",
      "name": "DeepVape"
    }
  },
  "category": product.category,
  "sku": product.id.toString()
});

export const createBreadcrumbStructuredData = (breadcrumbs: Array<{name: string, url: string}>) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": breadcrumbs.map((item, index) => ({
    "@type": "ListItem",
    "position": index + 1,
    "name": item.name,
    "item": getFullUrl(item.url)
  }))
});

export const createOrganizationStructuredData = () => ({
  "@context": "https://schema.org",
  "@type": "Store",
  "name": siteConfig.name,
  "description": siteConfig.description,
  "url": siteConfig.domain,
  "logo": getFullImageUrl(siteConfig.logo),
  "address": {
    "@type": "PostalAddress",
    "addressCountry": "TW"
  },
  "contactPoint": {
    "@type": "ContactPoint",
    "contactType": "customer service",
    "availableLanguage": "Chinese",
    "email": siteConfig.contact.email
  },
  "paymentAccepted": "Cash",
  "currenciesAccepted": "TWD",
  "priceRange": "$$"
});

// 搜尋框結構化數據
export const createSearchBoxStructuredData = () => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  "url": siteConfig.domain,
  "potentialAction": {
    "@type": "SearchAction",
    "target": {
      "@type": "EntryPoint",
      "urlTemplate": `${siteConfig.domain}/products?search={search_term_string}`
    },
    "query-input": "required name=search_term_string"
  }
});

// FAQ 結構化數據
export const createFAQStructuredData = (faqs: Array<{question: string, answer: string}>) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": faqs.map(faq => ({
    "@type": "Question",
    "name": faq.question,
    "acceptedAnswer": {
      "@type": "Answer",
      "text": faq.answer
    }
  }))
});

// 評論結構化數據
export const createReviewStructuredData = (product: any, reviews: Array<any>) => ({
  "@context": "https://schema.org",
  "@type": "Product",
  "name": product.name,
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": calculateAverageRating(reviews),
    "reviewCount": reviews.length,
    "bestRating": "5",
    "worstRating": "1"
  },
  "review": reviews.map(review => ({
    "@type": "Review",
    "reviewRating": {
      "@type": "Rating",
      "ratingValue": review.rating,
      "bestRating": "5",
      "worstRating": "1"
    },
    "author": {
      "@type": "Person",
      "name": review.authorName
    },
    "datePublished": review.date,
    "reviewBody": review.comment
  }))
});

// 計算平均評分
const calculateAverageRating = (reviews: Array<any>) => {
  if (reviews.length === 0) return 0;
  const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
  return (sum / reviews.length).toFixed(1);
};

// 產品列表結構化數據
export const createProductListStructuredData = (products: Array<any>, category?: string) => ({
  "@context": "https://schema.org",
  "@type": "ItemList",
  "name": category ? `${category} 產品列表` : "所有產品",
  "itemListElement": products.map((product, index) => ({
    "@type": "ListItem",
    "position": index + 1,
    "item": {
      "@type": "Product",
      "name": product.name,
      "description": product.description,
      "image": getFullImageUrl(product.image_url),
      "brand": {
        "@type": "Brand",
        "name": product.brand
      },
      "offers": {
        "@type": "Offer",
        "price": product.price,
        "priceCurrency": "TWD",
        "availability": product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
      }
    }
  }))
});
