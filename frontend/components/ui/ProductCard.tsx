'use client';

import Link from 'next/link';
import Image from 'next/image';
import { cn, formatPrice } from '@/lib/utils';
import type { Product } from '@/lib/api/products';
import { useTranslation } from '@/contexts/LanguageContext';

/**
 * Product Card component
 * 
 * Displays product information in a card format.
 * Matches the Eco-Luxury design from frontend-base/
 */

interface ProductCardProps {
  product: Product;
  className?: string;
}

export function ProductCard({ product, className }: ProductCardProps) {
  const { t } = useTranslation();
  const ratingValue = Number(product.rating);
  const ratingText = Number.isFinite(ratingValue) ? ratingValue.toFixed(1) : '0.0';
  const priceValue = Number(product.price);
  const compareAtPriceValue = product.compare_at_price != null ? Number(product.compare_at_price) : null;

  return (
    <Link
      href={`/products/${product.slug}`}
      className={cn(
        'group block glass-card p-4 hover:border-primary/30 transition-all duration-300',
        'hover:shadow-lg hover:shadow-primary/10',
        className
      )}
    >
      {/* Image */}
      <div className="relative aspect-square rounded-xl overflow-hidden mb-4 bg-dark-card">
        {product.primary_image ? (
          <Image
            src={product.primary_image}
            alt={product.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="material-symbols-outlined text-4xl text-white/20">
              image
            </span>
          </div>
        )}
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {product.is_new && (
            <span className="px-2 py-1 bg-primary text-background-dark text-xs font-semibold rounded-lg">
              {t.common.new}
            </span>
          )}
          {product.is_on_sale && (
            <span className="px-2 py-1 bg-red-500 text-white text-xs font-semibold rounded-lg">
              -{product.discount_percentage}%
            </span>
          )}
        </div>
        
        {/* Quick actions */}
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            className="p-2 bg-white/10 backdrop-blur-sm rounded-lg hover:bg-white/20 transition-colors"
            onClick={(e) => {
              e.preventDefault();
              // TODO: Add to wishlist
            }}
          >
            <span className="material-symbols-outlined text-white text-xl">
              favorite
            </span>
          </button>
        </div>
      </div>
      
      {/* Content */}
      <div className="space-y-2">
        {/* Category */}
        <p className="text-xs text-white/50 uppercase tracking-wide">
          {product.category_name}
        </p>
        
        {/* Title */}
        <h3 className="font-semibold text-white group-hover:text-primary transition-colors line-clamp-2">
          {product.title}
        </h3>
        
        {/* Rating */}
        {product.reviews_count > 0 && (
          <div className="flex items-center gap-1">
            <span className="material-symbols-outlined text-yellow-400 text-sm">
              star
            </span>
            <span className="text-sm text-white/70">
              {ratingText}
            </span>
            <span className="text-sm text-white/40">
              ({product.reviews_count})
            </span>
          </div>
        )}
        
        {/* Location (for trees/retreats) */}
        {product.location_name && (
          <div className="flex items-center gap-1 text-white/50 text-sm">
            <span className="material-symbols-outlined text-sm">location_on</span>
            <span className="truncate">{product.location_name}</span>
          </div>
        )}
        
        {/* Price */}
        <div className="flex items-center gap-2 pt-2">
          <span className="text-lg font-bold text-primary">
            {formatPrice(priceValue, product.currency)}
          </span>
          {product.compare_at_price && (
            <span className="text-sm text-white/40 line-through">
              {compareAtPriceValue != null
                ? formatPrice(compareAtPriceValue, product.currency)
                : null}
            </span>
          )}
        </div>
        
        {/* CO2 offset (for trees) */}
        {product.co2_offset_kg && (
          <div className="flex items-center gap-1 text-olive-light text-sm">
            <span className="material-symbols-outlined text-sm">eco</span>
            <span>{product.co2_offset_kg} kg CO₂/year</span>
          </div>
        )}
      </div>
    </Link>
  );
}
