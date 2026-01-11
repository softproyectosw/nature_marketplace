'use client';

import Link from 'next/link';
import { useState, useEffect, useCallback } from 'react';
import { AddToCartButton } from '@/components/cart';
import { FavoriteButton } from '@/components/products';
import { LanguageSelector } from '@/components/ui';
import { useTranslation } from '@/contexts/LanguageContext';
import type { Product } from '@/lib/api/products';

interface ProductDetailClientProps {
  product: Product;
  category: string;
}

// Helper to get primary image URL
function getProductImage(product: Product): string {
  const primaryImage = product.gallery?.find(img => img.is_primary);
  if (primaryImage?.url) return primaryImage.url;
  if (product.gallery?.[0]?.url) return product.gallery[0].url;
  return '/images/placeholder-product.jpg';
}


// Helper to get category slug
function getCategorySlug(product: Product, fallback: string): string {
  return product.category?.slug || product.category_slug || fallback;
}

// Generate star rating
function StarRating({ rating }: { rating: number | string }) {
  const numRating = typeof rating === 'string' ? parseFloat(rating) : rating;
  const fullStars = Math.floor(numRating);
  const hasHalf = numRating % 1 >= 0.5;
  
  return (
    <div className="flex gap-0.5">
      {[...Array(fullStars)].map((_, i) => (
        <span
          key={i}
          className="material-symbols-outlined text-lg text-primary"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          star
        </span>
      ))}
      {hasHalf && (
        <span className="material-symbols-outlined text-lg text-primary">
          star_half
        </span>
      )}
      {[...Array(5 - fullStars - (hasHalf ? 1 : 0))].map((_, i) => (
        <span
          key={`empty-${i}`}
          className="material-symbols-outlined text-lg text-white/30"
        >
          star
        </span>
      ))}
    </div>
  );
}

// Category translation map
const categoryTranslationKeys: Record<string, string> = {
  'bosque-vivo': 'bosqueVivo',
  'guardianes-del-agua': 'guardianesDelAgua',
  'economia-del-corazon': 'economiaDelCorazon',
  'micro-retreats': 'microRetreats',
  'retreats': 'retreats',
  'remedies': 'remedies',
};

export function ProductDetailClient({ product, category }: ProductDetailClientProps) {
  const [activeImage, setActiveImage] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const { t } = useTranslation();
  
  const images = (product.gallery && product.gallery.length > 0)
    ? product.gallery 
    : [{ id: 0, url: getProductImage(product), alt_text: product.title, is_primary: true }];

  // Auto-play carousel
  useEffect(() => {
    if (!isAutoPlaying || images.length <= 1) return;
    
    const interval = setInterval(() => {
      setActiveImage((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    }, 4000); // Change image every 4 seconds
    
    return () => clearInterval(interval);
  }, [isAutoPlaying, images.length]);

  // Get translated category name
  const getCategoryTranslation = (slug: string, fallbackName: string): string => {
    const key = categoryTranslationKeys[slug];
    if (key && t.products[key as keyof typeof t.products]) {
      return t.products[key as keyof typeof t.products] as string;
    }
    return fallbackName;
  };

  // Get price label based on language
  const getPriceLabelTranslated = (): string => {
    return product.pricing_type === 'annual' ? t.products.perYear : '';
  };

  // Generate highlights based on product type
  const highlights = [];
  if (product.location_name) {
    highlights.push({ icon: 'location_on', text: product.location_name });
  }
  if (product.duration) {
    highlights.push({ icon: 'schedule', text: product.duration });
  }
  if (product.co2_offset_kg) {
    highlights.push({ icon: 'eco', text: `${product.co2_offset_kg} kg CO₂${t.products.perYear}` });
  }
  if (product.area_size) {
    highlights.push({ icon: 'square_foot', text: product.area_size });
  }
  if (product.max_participants) {
    highlights.push({ icon: 'group', text: `${t.productDetail.maxParticipants} ${product.max_participants}` });
  }
  if (product.species) {
    highlights.push({ icon: 'park', text: product.species });
  }

  return (
    <div className="relative flex min-h-screen w-full flex-col font-display pb-24 bg-background-dark">
      {/* Top App Bar */}
      <div className="sticky top-0 z-20 flex items-center bg-background-dark/95 p-4 pb-2 justify-between backdrop-blur-md">
        <Link
          href="/products"
          className="flex size-10 shrink-0 items-center justify-center rounded-xl text-white hover:bg-white/10 transition-colors"
        >
          <span className="material-symbols-outlined text-2xl">arrow_back</span>
        </Link>
        <h2 className="text-white text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center">
          {getCategoryTranslation(product.category?.slug || category, product.category?.name || category)}
        </h2>
        <div className="flex items-center gap-1">
          <LanguageSelector />
          <FavoriteButton productId={product.id} className="size-10" />
        </div>
      </div>

      <main className="flex-grow">
        {/* Image Gallery */}
        <div className="px-4">
          {/* Main Image with Navigation */}
          <div className="relative max-w-2xl mx-auto">
            <div
              className="w-full aspect-[16/10] bg-cover bg-center rounded-xl"
              style={{ backgroundImage: `url("${images[activeImage]?.url || getProductImage(product)}")` }}
              onClick={() => setIsAutoPlaying(false)}
            />
            
            {/* Navigation Arrows */}
            {images.length > 1 && (
              <>
                <button
                  onClick={() => {
                    setIsAutoPlaying(false);
                    setActiveImage((prev) => (prev === 0 ? images.length - 1 : prev - 1));
                  }}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-black/50 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/70 transition-colors"
                >
                  <span className="material-symbols-outlined">chevron_left</span>
                </button>
                <button
                  onClick={() => {
                    setIsAutoPlaying(false);
                    setActiveImage((prev) => (prev === images.length - 1 ? 0 : prev + 1));
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-black/50 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/70 transition-colors"
                >
                  <span className="material-symbols-outlined">chevron_right</span>
                </button>
              </>
            )}
            
            {/* Dots Indicator */}
            {images.length > 1 && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
                {images.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setIsAutoPlaying(false);
                      setActiveImage(idx);
                    }}
                    className={`w-2 h-2 rounded-full transition-all ${
                      activeImage === idx ? 'bg-primary w-6' : 'bg-white/50 hover:bg-white/80'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
          
          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto no-scrollbar py-3 justify-center">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setIsAutoPlaying(false);
                    setActiveImage(idx);
                  }}
                  className={`flex-shrink-0 w-16 h-16 rounded-lg bg-cover bg-center border-2 transition-all ${
                    activeImage === idx ? 'border-primary' : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                  style={{ backgroundImage: `url("${img.url}")` }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Product Header */}
        <div className="px-4 pt-4">
          <div className="flex justify-between items-start gap-4">
            <div className="flex-1">
              <p className="text-xs text-white/50 uppercase tracking-wide mb-1">
                {getCategoryTranslation(product.category?.slug || category, product.category?.name || '')}
              </p>
              <h1 className="text-white text-2xl font-bold leading-tight">
                {product.title}
              </h1>
              <p className="text-white/60 text-sm mt-2">
                {product.short_description}
              </p>
            </div>
            <div className="flex-shrink-0 text-right">
              <p className="text-primary text-2xl font-bold">
                ${product.price}
              </p>
              <p className="text-white/50 text-sm">
                {getPriceLabelTranslated()}
              </p>
            </div>
          </div>
          
          {/* Rating */}
          <div className="flex items-center gap-2 mt-3">
            <StarRating rating={product.rating} />
            <p className="text-white text-sm font-medium">
              {product.rating} ({product.reviews_count} {t.productDetail.reviews})
            </p>
          </div>
          
          {/* Stock Status */}
          {!product.is_unlimited_stock && product.stock !== undefined && (
            <div className={`mt-3 inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-medium ${
              product.stock === 0 
                ? 'bg-red-500/20 text-red-400' 
                : product.stock < 5 
                  ? 'bg-orange-500/20 text-orange-400'
                  : 'bg-green-500/20 text-green-400'
            }`}>
              <span className="material-symbols-outlined text-sm">
                {product.stock === 0 ? 'block' : 'check_circle'}
              </span>
              {product.stock === 0 ? t.products.outOfStock : `${product.stock} ${t.products.available}`}
            </div>
          )}
        </div>

        {/* Highlights */}
        {highlights.length > 0 && (
          <div className="px-4 pt-6">
            <h3 className="text-lg font-bold text-white mb-3">{t.productDetail.characteristics}</h3>
            <div className="grid grid-cols-2 gap-3">
              {highlights.map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
                  <div className="flex items-center justify-center size-10 rounded-lg bg-primary/20 text-primary">
                    <span className="material-symbols-outlined">{item.icon}</span>
                  </div>
                  <span className="text-sm font-medium text-white/80">
                    {item.text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Description */}
        <div className="px-4 pt-6">
          <h3 className="text-lg font-bold text-white mb-2">{t.productDetail.description}</h3>
          <p className="text-white/70 text-sm leading-relaxed whitespace-pre-line">
            {product.description}
          </p>
        </div>

        {/* Includes (for experiences) */}
        {product.includes && product.includes.length > 0 && (
          <div className="px-4 pt-6">
            <h3 className="text-lg font-bold text-white mb-3">{t.productDetail.includes}</h3>
            <ul className="space-y-2">
              {product.includes.map((item, idx) => (
                <li key={idx} className="flex items-center gap-2 text-white/70 text-sm">
                  <span className="material-symbols-outlined text-primary text-sm">check</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Features */}
        {product.features && product.features.length > 0 && (
          <div className="px-4 pt-6">
            <h3 className="text-lg font-bold text-white mb-3">{t.productDetail.benefits}</h3>
            <div className="flex flex-wrap gap-2">
              {product.features.map((feature, idx) => (
                <span key={idx} className="px-3 py-1 rounded-lg bg-primary/10 text-primary text-sm">
                  {feature}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Reviews Summary */}
        <div className="px-4 pt-8 mb-8">
          <h3 className="text-lg font-bold text-white mb-4">{t.productDetail.reviews}</h3>
          <div className="flex flex-wrap gap-x-8 gap-y-6 p-4 rounded-xl bg-white/5">
            <div className="flex flex-col gap-2">
              <p className="text-white text-4xl font-black leading-tight">
                {product.rating}
              </p>
              <StarRating rating={product.rating} />
              <p className="text-white/60 text-sm">
                {product.reviews_count} {t.productDetail.reviews}
              </p>
            </div>
            <div className="grid min-w-[200px] max-w-[400px] flex-1 grid-cols-[20px_1fr_40px] items-center gap-y-3">
              {[
                { l: 5, p: 80 },
                { l: 4, p: 12 },
                { l: 3, p: 5 },
                { l: 2, p: 2 },
                { l: 1, p: 1 },
              ].map((rate) => (
                <div key={rate.l} className="contents">
                  <p className="text-white text-sm">{rate.l}</p>
                  <div className="flex h-2 flex-1 overflow-hidden rounded bg-white/10">
                    <div
                      className="rounded bg-primary"
                      style={{ width: `${rate.p}%` }}
                    />
                  </div>
                  <p className="text-white/50 text-sm text-right">{rate.p}%</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Sticky CTA Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background-dark/95 backdrop-blur-md border-t border-white/10">
        <AddToCartButton
          product={{
            id: product.id,
            title: product.title,
            price: Number(product.price),
            priceLabel: getPriceLabelTranslated(),
            image: getProductImage(product),
            category: getCategorySlug(product, category),
            slug: `${getCategorySlug(product, category)}/${product.slug}`,
            stock: product.stock || 0,
            isUnlimitedStock: product.is_unlimited_stock ?? true,
          }}
          variant="full"
        />
      </div>
    </div>
  );
}
