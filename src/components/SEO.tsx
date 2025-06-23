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
