'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { getProducts, getCategories, Product, Category } from '@/lib/api/products';
import { FavoriteButton } from '@/components/products';
import { AddToCartButton } from '@/components/cart';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/contexts/LanguageContext';

// Helper to get category slug
function getCategorySlug(product: Product): string {
  return product.category?.slug || product.category_slug || 'products';
}

// Helper to get category name
function getCategoryName(product: Product): string {
  return product.category?.name || product.category_name || '';
}

// Helper to get primary image URL
function getProductImage(product: Product): string {
  if (product.primary_image) return product.primary_image;
  const primaryImage = product.gallery?.find(img => img.is_primary);
  if (primaryImage?.url) return primaryImage.url;
  if (product.gallery?.[0]?.url) return product.gallery[0].url;
  return '/images/placeholder-product.jpg';
}

// Category translation map
const categoryTranslationKeys: Record<string, string> = {
  '': 'all',
  'bosque-vivo': 'bosqueVivo',
  'guardianes-del-agua': 'guardianesDelAgua',
  'economia-del-corazon': 'economiaDelCorazon',
  'micro-retreats': 'microRetreats',
  'retreats': 'retreats',
  'remedies': 'remedies',
};

export default function DashboardPage() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [newProducts, setNewProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategory, setActiveCategory] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Get price label based on language
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

  // Load data
  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const [productsRes, catsRes] = await Promise.all([
          getProducts({ is_featured: true }),
          getCategories(),
        ]);
        
        setFeaturedProducts(productsRes.results?.slice(0, 4) || []);
        setCategories(catsRes || []);
        
        // Load new products
        const newRes = await getProducts({ ordering: '-created_at' });
        setNewProducts(newRes.results?.slice(0, 4) || []);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  // Filter products by category
  useEffect(() => {
    async function filterProducts() {
      if (!activeCategory) return;
      try {
        const res = await getProducts({ category: activeCategory });
        setNewProducts(res.results?.slice(0, 4) || []);
      } catch (error) {
        console.error('Failed to filter products:', error);
      }
    }
    if (activeCategory) {
      filterProducts();
    }
  }, [activeCategory]);

  const userName = user?.first_name || user?.email?.split('@')[0] || 'Nature Lover';

  return (
    <div className="flex flex-col font-display">
      {/* Top App Bar */}
      <div className="flex flex-col gap-2 p-4 pb-2">
        <div className="flex items-center h-12 justify-between">
          <div className="flex size-12 shrink-0 items-center">
            <Link
              href="/profile"
              className="bg-center bg-no-repeat aspect-square bg-cover rounded-xl size-10 cursor-pointer hover:opacity-90 transition-opacity bg-primary/20 flex items-center justify-center"
              style={user?.avatar ? {
                backgroundImage: `url("${user.avatar}")`,
              } : undefined}
            >
              {!user?.avatar && (
                <span className="material-symbols-outlined text-primary">person</span>
              )}
            </Link>
          </div>
          <div className="flex w-12 items-center justify-end">
            <Link 
              href="/settings"
              className="flex cursor-pointer items-center justify-center rounded-xl h-12 bg-transparent text-white gap-2 text-base font-bold min-w-0 p-0"
            >
              <span className="material-symbols-outlined text-3xl">settings</span>
            </Link>
          </div>
        </div>
        <p className="text-white tracking-light text-[28px] font-bold leading-tight">
          {t.dashboard.hello}, {userName}
        </p>
      </div>

      {/* Search Bar */}
      <div className="px-4 py-3">
        <Link href="/products" className="block">
          <div className="flex w-full flex-1 items-stretch rounded-xl h-14 bg-dark-card border border-white/5 hover:border-primary/30 transition-colors">
            <div className="text-primary flex items-center justify-center pl-4 pr-2">
              <span className="material-symbols-outlined">search</span>
            </div>
            <div className="flex w-full flex-1 items-center text-primary/60 px-2 text-base">
              {t.dashboard.searchPlaceholder}
            </div>
          </div>
        </Link>
      </div>

      {/* Category Chips */}
      <div className="flex gap-3 px-4 py-3 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveCategory('')}
          className={`flex h-10 shrink-0 items-center justify-center gap-x-2 rounded-xl px-4 transition-colors ${
            activeCategory === '' 
              ? 'bg-primary text-black' 
              : 'bg-dark-card text-white border border-white/5 hover:border-primary/30'
          }`}
        >
          <span className="material-symbols-outlined text-lg">apps</span>
          <p className="text-sm font-medium">{t.products.all}</p>
        </button>
        {categories.map((cat) => (
          <button
            key={cat.slug}
            onClick={() => setActiveCategory(cat.slug)}
            className={`flex h-10 shrink-0 items-center justify-center gap-x-2 rounded-xl px-4 transition-colors ${
              activeCategory === cat.slug 
                ? 'bg-primary text-black' 
                : 'bg-dark-card text-white border border-white/5 hover:border-primary/30'
            }`}
          >
            <span className="material-symbols-outlined text-lg">{cat.icon || 'category'}</span>
            <p className="text-sm font-medium">{getCategoryTranslation(cat.slug, cat.name)}</p>
          </button>
        ))}
      </div>

      {/* Featured Section */}
      <h2 className="text-white text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">
        {t.dashboard.featured}
      </h2>
      
      {isLoading ? (
        <div className="flex overflow-x-auto no-scrollbar px-4 pb-4">
          <div className="flex gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex flex-col gap-3 min-w-[260px] animate-pulse">
                <div className="w-full aspect-video bg-white/10 rounded-2xl" />
                <div className="h-4 bg-white/10 rounded w-3/4" />
                <div className="h-3 bg-white/10 rounded w-1/2" />
              </div>
            ))}
          </div>
        </div>
      ) : featuredProducts.length === 0 ? (
        <div className="px-4 pb-4 text-white/50 text-sm">
          {t.dashboard.noFeatured}
        </div>
      ) : (
        <div className="flex overflow-x-auto no-scrollbar px-4 pb-4">
          <div className="flex gap-4">
            {featuredProducts.map((product) => (
              <Link
                key={product.id}
                href={`/products/${getCategorySlug(product)}/${product.slug}`}
                className="flex flex-col gap-3 min-w-[260px] cursor-pointer group"
              >
                <div
                  className="w-full bg-center bg-no-repeat aspect-video bg-cover rounded-2xl relative bg-white/5"
                  style={{ backgroundImage: `url("${getProductImage(product)}")` }}
                >
                  <FavoriteButton
                    productId={product.id}
                    className="absolute top-2 right-2"
                  />
                </div>
                <div>
                  <p className="text-white text-base font-bold leading-normal group-hover:text-primary transition-colors">
                    {product.title}
                  </p>
                  <p className="text-primary/80 text-sm font-normal leading-normal">
                    {product.location_name || getCategoryName(product)}
                  </p>
                  <p className="text-white font-bold mt-1">
                    ${product.price}{getPriceLabel(product)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* New Products Section */}
      <h2 className="text-white text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-6">
        {activeCategory ? getCategoryTranslation(activeCategory, categories.find(c => c.slug === activeCategory)?.name || t.common.products) : t.dashboard.newAvailable}
      </h2>
      
      {isLoading ? (
        <div className="px-4 grid grid-cols-2 gap-4 pb-24">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex flex-col gap-3 animate-pulse">
              <div className="w-full aspect-square bg-white/10 rounded-2xl" />
              <div className="h-4 bg-white/10 rounded w-3/4" />
              <div className="h-3 bg-white/10 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : newProducts.length === 0 ? (
        <div className="px-4 pb-24 text-white/50 text-sm">
          {t.dashboard.noProducts}
        </div>
      ) : (
        <div className="px-4 grid grid-cols-2 gap-4 pb-24">
          {newProducts.map((product) => (
            <div key={product.id} className="flex flex-col gap-3 group">
              <Link href={`/products/${getCategorySlug(product)}/${product.slug}`}>
                <div className="relative w-full">
                  <div
                    className="w-full bg-center bg-no-repeat aspect-square bg-cover rounded-2xl transition-transform group-hover:scale-105 bg-white/5"
                    style={{ backgroundImage: `url("${getProductImage(product)}")` }}
                  />
                  <FavoriteButton
                    productId={product.id}
                    className="absolute top-2 right-2"
                  />
                  {!product.is_unlimited_stock && product.stock === 0 && (
                    <div className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center">
                      <span className="text-white font-bold">{t.products.outOfStock}</span>
                    </div>
                  )}
                </div>
                <div className="mt-2">
                  <p className="text-white text-base font-medium leading-normal line-clamp-1 group-hover:text-primary transition-colors">
                    {product.title}
                  </p>
                  <p className="text-white/50 text-xs">
                    {product.location_name || getCategoryName(product)}
                  </p>
                  <p className="text-primary font-bold mt-1">
                    ${product.price}{getPriceLabel(product)}
                  </p>
                </div>
              </Link>
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
                  isUnlimitedStock: product.is_unlimited_stock ?? true,
                }}
                variant="button"
                className="w-full"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
