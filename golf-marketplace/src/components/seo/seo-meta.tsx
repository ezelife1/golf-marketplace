import Head from 'next/head'

interface SEOMetaProps {
  title: string
  description: string
  keywords?: string
  canonicalUrl?: string
  imageUrl?: string
  type?: 'website' | 'product' | 'article' | 'profile'
  structuredData?: any
  noIndex?: boolean
}

interface ProductSEOProps {
  product: {
    id: string
    title: string
    description: string
    price: number
    currency: string
    brand: string
    condition: string
    imageUrl: string
    category: string
    seller: {
      name: string
      rating: number
      reviewCount: number
    }
    reviews?: {
      rating: number
      reviewCount: number
    }
  }
  canonicalUrl: string
}

interface CategorySEOProps {
  category: {
    name: string
    description: string
    productCount: number
    imageUrl?: string
  }
  canonicalUrl: string
}

export function SEOMeta({
  title,
  description,
  keywords,
  canonicalUrl,
  imageUrl,
  type = 'website',
  structuredData,
  noIndex = false
}: SEOMetaProps) {
  const siteName = "ClubUp - Premium Golf Equipment Marketplace"
  const siteUrl = "https://clubup.golf"
  const fullTitle = title.includes('ClubUp') ? title : `${title} | ClubUp`
  const fullImageUrl = imageUrl?.startsWith('http') ? imageUrl : `${siteUrl}${imageUrl}`

  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}

      {/* Robots */}
      {noIndex && <meta name="robots" content="noindex,nofollow" />}

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={siteName} />
      {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}
      {fullImageUrl && <meta property="og:image" content={fullImageUrl} />}
      {fullImageUrl && <meta property="og:image:alt" content={title} />}

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      {fullImageUrl && <meta name="twitter:image" content={fullImageUrl} />}

      {/* Additional SEO */}
      <meta name="author" content="ClubUp" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />

      {/* Structured Data */}
      {structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      )}
    </Head>
  )
}

export function ProductSEO({ product, canonicalUrl }: ProductSEOProps) {
  const title = `${product.title} - ${product.condition} - £${product.price}`
  const description = `Buy ${product.title} in ${product.condition} condition for £${product.price}. ${product.description.substring(0, 120)}...`
  const keywords = `${product.title}, ${product.brand}, ${product.category}, golf equipment, ${product.condition}, buy golf`

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.title,
    "description": product.description,
    "image": product.imageUrl,
    "brand": {
      "@type": "Brand",
      "name": product.brand
    },
    "category": product.category,
    "condition": product.condition,
    "offers": {
      "@type": "Offer",
      "url": canonicalUrl,
      "priceCurrency": product.currency,
      "price": product.price,
      "priceValidUntil": new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      "itemCondition": `https://schema.org/${product.condition.replace(' ', '')}Condition`,
      "availability": "https://schema.org/InStock",
      "seller": {
        "@type": "Organization",
        "name": product.seller.name
      }
    },
    ...(product.reviews && {
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": product.reviews.rating,
        "reviewCount": product.reviews.reviewCount,
        "bestRating": 5,
        "worstRating": 1
      }
    })
  }

  return (
    <SEOMeta
      title={title}
      description={description}
      keywords={keywords}
      canonicalUrl={canonicalUrl}
      imageUrl={product.imageUrl}
      type="product"
      structuredData={structuredData}
    />
  )
}

export function CategorySEO({ category, canonicalUrl }: CategorySEOProps) {
  const title = `${category.name} Golf Equipment - Premium Used & New`
  const description = `Shop ${category.name.toLowerCase()} from top golf brands. ${category.productCount} items available. ${category.description}`
  const keywords = `${category.name.toLowerCase()}, golf equipment, golf ${category.name.toLowerCase()}, buy golf gear`

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": title,
    "description": description,
    "url": canonicalUrl,
    "mainEntity": {
      "@type": "ItemList",
      "numberOfItems": category.productCount,
      "itemListElement": [] // Would be populated with actual products
    }
  }

  return (
    <SEOMeta
      title={title}
      description={description}
      keywords={keywords}
      canonicalUrl={canonicalUrl}
      imageUrl={category.imageUrl}
      type="website"
      structuredData={structuredData}
    />
  )
}

export function HomepageSEO() {
  const title = "ClubUp - Premium Golf Equipment Marketplace | Buy & Sell Golf Gear"
  const description = "The UK's premier marketplace for premium golf equipment. Buy and sell new and used golf clubs, bags, and accessories. Join 50,000+ golfers. Free trials available."
  const keywords = "golf equipment marketplace, buy golf clubs, sell golf gear, golf marketplace UK, premium golf equipment, golf clubs for sale"
  const canonicalUrl = "https://clubup.golf"

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "ClubUp",
    "description": description,
    "url": canonicalUrl,
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://clubup.golf/search?q={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    },
    "sameAs": [
      "https://facebook.com/clubupgolf",
      "https://twitter.com/clubupgolf",
      "https://instagram.com/clubupgolf"
    ]
  }

  return (
    <SEOMeta
      title={title}
      description={description}
      keywords={keywords}
      canonicalUrl={canonicalUrl}
      imageUrl="/images/clubup-og-image.jpg"
      type="website"
      structuredData={structuredData}
    />
  )
}

export function SearchSEO({ query, resultCount }: { query: string; resultCount: number }) {
  const title = `"${query}" Golf Equipment Search Results - ${resultCount} Items Found`
  const description = `Found ${resultCount} golf equipment items for "${query}". Compare prices and condition from verified sellers on ClubUp marketplace.`
  const canonicalUrl = `https://clubup.golf/search?q=${encodeURIComponent(query)}`

  return (
    <SEOMeta
      title={title}
      description={description}
      canonicalUrl={canonicalUrl}
      type="website"
      noIndex={resultCount === 0} // Don't index empty search results
    />
  )
}

// Breadcrumb structured data
export function BreadcrumbSEO({ items }: { items: Array<{ name: string; url: string }> }) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url
    }))
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  )
}
