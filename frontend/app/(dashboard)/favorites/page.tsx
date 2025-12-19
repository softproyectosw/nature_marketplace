'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Header } from '@/components/layout';
import { BottomNav } from '@/components/ui';
import { FavoriteButton, getLocalFavorites } from '@/components/products';
import { AddToCartButton } from '@/components/cart';
import { getProducts, Product } from '@/lib/api/products';
import { useTranslation } from '@/contexts/LanguageContext';

// Helper to get product image
function getProductImage(product: Product): string {
  if (product.primary_image) return product.primary_image;
  const primaryImage = product.gallery?.find(img => img.is_primary);
  if (primaryImage?.url) return primaryImage.url;
  if (product.gallery?.[0]?.url) return product.gallery[0].url;
  return '/images/placeholder-product.jpg';
}

// Helper to get category slug
function getCategorySlug(product: Product): string {
  return product.category?.slug || product.category_slug || 'products';
}

// Category translation map
const categoryTranslationKeys: Record<string, string> = {
  'trees': 'trees',
  'forests': 'forests',
  'lagoons': 'lagoons',
  'experiences': 'experiences',
  'retreats': 'retreats',
  'remedies': 'remedies',
};

export default function FavoritesPage() {
  const { t } = useTranslation();

  // Helper to get price label with translation
  const getPriceLabel = (product: Product): string => {
    return product.pricing_type === 'annual' ? t.products.perYear : '';
  };

  // Get translated category name
  const getCategoryTranslation = (slug: string, fallbackName: string): string => {
    const key = categoryTranslationKeys[slug];
    if (key && t.products[key as keyof typeof t.products]) {
      return t.products[key as keyof typeof t.products] as string;
    }
    return fallbackName;
  };
  const [favorites, setFavorites] = useState<Product[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  console.log('[FavoritesPage] Component rendered');

  // Load favorite products
  const loadFavorites = async () => {
    console.log('[FavoritesPage] loadFavorites running');
    const ids = getLocalFavorites();
    console.log('[FavoritesPage] Favorite IDs from localStorage:', ids);
    setFavoriteIds(ids);
    
    if (ids.length === 0) {
      console.log('[FavoritesPage] No favorites, setting loading false');
      setFavorites([]);
      setIsLoading(false);
      return;
    }

    try {
      // Fetch all products and filter by favorite IDs
      const data = await getProducts({});
      const allProducts = data.results || [];
      const favoriteProducts = allProducts.filter(p => ids.includes(p.id));
      console.log('[FavoritesPage] Filtered favorite products:', favoriteProducts.length);
      setFavorites(favoriteProducts);
    } catch (err) {
      console.error('[FavoritesPage] Error loading products:', err);
      setFavorites([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadFavorites();

    // Listen for favorites updates
    const handleUpdate = () => {
      console.log('[FavoritesPage] Favorites updated event received');
      loadFavorites();
    };
    window.addEventListener('favoritesUpdated', handleUpdate);
    return () => {
      window.removeEventListener('favoritesUpdated', handleUpdate);
    };
  }, []);

  const hasFavorites = favorites.length > 0;

  return (
    <div className="min-h-screen bg-background-dark pb-[100px]">
      {/* Header */}
      <Header />

      {/* Page Title with Back Button */}
      <div className="px-4 py-6">
        <div className="max-w-6xl mx-auto flex items-center gap-4">
          <Link
            href="/products"
            className="flex items-center justify-center w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            <span className="material-symbols-outlined text-white">arrow_back</span>
          </Link>
          <h1 className="text-2xl font-bold text-white">{t.favorites.title}</h1>
        </div>
      </div>

      {isLoading ? (
        <div className="px-4">
          <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="glass-card p-4 animate-pulse">
                <div className="aspect-square rounded-xl bg-white/10 mb-4" />
                <div className="h-4 bg-white/10 rounded mb-2 w-1/3" />
                <div className="h-5 bg-white/10 rounded mb-2" />
                <div className="h-4 bg-white/10 rounded w-2/3" />
              </div>
            ))}
          </div>
        </div>
      ) : !hasFavorites ? (
        <div className="flex flex-col items-center justify-center py-20 px-10 text-center">
          <span className="material-symbols-outlined text-6xl mb-4 text-white/30">
            favorite_border
          </span>
          <h3 className="text-xl font-bold text-white mb-2">{t.favorites.empty.title}</h3>
          <p className="text-white/60 mb-6 max-w-sm">
            {t.favorites.empty.subtitle}
          </p>
          <Link
            href="/products"
            className="px-6 py-3 bg-primary text-background-dark rounded-full font-bold hover:bg-primary/90 transition-colors"
          >
            {t.favorites.empty.cta}
          </Link>
        </div>
      ) : (
        <div className="px-4">
          <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {favorites.map((product) => (
              <div
                key={product.id}
                className="glass-card p-4 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 group relative"
              >
                {/* Favorite Button */}
                <FavoriteButton
                  productId={product.id}
                  className="absolute top-6 right-6 z-10"
                />

                <Link href={`/products/${getCategorySlug(product)}/${product.slug}`}>
                  {/* Image */}
                  <div
                    className="aspect-square rounded-xl bg-cover bg-center mb-4 group-hover:scale-[1.02] transition-transform bg-white/5"
                    style={{ backgroundImage: `url("${getProductImage(product)}")` }}
                  />

                  {/* Content */}
                  <div className="space-y-2">
                    <p className="text-xs text-white/50 uppercase tracking-wide">
                      {getCategoryTranslation(getCategorySlug(product), product.category?.name || product.category_name || '')}
                    </p>
                    <h3 className="font-semibold text-white group-hover:text-primary transition-colors">
                      {product.title}
                    </h3>

                    {/* Rating */}
                    <div className="flex items-center gap-1">
                      <span
                        className="material-symbols-outlined text-yellow-400 text-sm"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        star
                      </span>
                      <span className="text-sm text-white/70">{product.rating}</span>
                      <span className="text-sm text-white/40">({product.reviews_count})</span>
                    </div>

                    {/* Price */}
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-lg font-bold text-primary">
                        ${product.price}{getPriceLabel(product)}
                      </span>
                    </div>
                  </div>
                </Link>

                {/* Add to Cart Button */}
                <div className="mt-3">
                  <AddToCartButton
                    product={{
                      id: product.id,
                      title: product.title,
                      price: Number(product.price),
                      priceLabel: getPriceLabel(product),
                      image: getProductImage(product),
                      category: getCategorySlug(product),
                      slug: `${getCategorySlug(product)}/${product.slug}`,
                      stock: product.stock || 0,
                      isUnlimitedStock: product.is_unlimited_stock || true,
                    }}
                    variant="button"
                    className="w-full"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
