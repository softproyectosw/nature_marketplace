'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FavoriteButton } from './FavoriteButton';
import { AddToCartButton } from '@/components/cart';
import { getProducts, getCategories, Product, Category } from '@/lib/api/products';

// Default categories (fallback if API fails)
const defaultCategories = [
  { name: 'Todos', slug: '', icon: 'apps' },
  { name: 'Árboles', slug: 'trees', icon: 'park' },
  { name: 'Bosques', slug: 'forests', icon: 'forest' },
  { name: 'Lagunas', slug: 'lagoons', icon: 'water' },
  { name: 'Experiencias', slug: 'experiences', icon: 'hiking' },
];

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

// Helper to get price label
function getPriceLabel(product: Product): string {
  return product.pricing_type === 'annual' ? '/año' : '';
}

export function ProductsGrid() {
  const [activeCategory, setActiveCategory] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState(defaultCategories);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load categories
  useEffect(() => {
    async function loadCategories() {
      try {
        const data = await getCategories();
        const cats = [
          { name: 'Todos', slug: '', icon: 'apps' },
          ...data.map(cat => ({
            name: cat.name,
            slug: cat.slug,
            icon: cat.icon || 'category',
          })),
        ];
        setCategories(cats);
      } catch (err) {
        console.error('Failed to load categories:', err);
        // Keep default categories
      }
    }
    loadCategories();
  }, []);

  // Load products
  useEffect(() => {
    async function loadProducts() {
      setIsLoading(true);
      setError(null);
      try {
        const params: { category?: string } = {};
        if (activeCategory) {
          params.category = activeCategory;
        }
        const data = await getProducts(params);
        setProducts(data.results || []);
      } catch (err) {
        console.error('Failed to load products:', err);
        setError('Error al cargar productos. Intenta de nuevo.');
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    }
    loadProducts();
  }, [activeCategory]);

  return (
    <>
      {/* Categories Filter */}
      <section className="px-4 pb-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
            {categories.map((cat) => (
              <button
                key={cat.slug}
                onClick={() => setActiveCategory(cat.slug)}
                className={`whitespace-nowrap flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  activeCategory === cat.slug
                    ? 'bg-primary text-background-dark'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                <span className="material-symbols-outlined text-sm">
                  {cat.icon}
                </span>
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="px-4">
        <div className="max-w-6xl mx-auto">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="glass-card p-4 animate-pulse">
                  <div className="aspect-square rounded-xl bg-white/10 mb-4" />
                  <div className="h-4 bg-white/10 rounded mb-2 w-1/3" />
                  <div className="h-5 bg-white/10 rounded mb-2" />
                  <div className="h-4 bg-white/10 rounded w-2/3" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <span className="material-symbols-outlined text-4xl text-red-400 mb-4 block">
                error
              </span>
              <p className="text-white/60">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 px-4 py-2 bg-primary text-background-dark rounded-full text-sm font-medium"
              >
                Reintentar
              </button>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <span className="material-symbols-outlined text-4xl text-white/40 mb-4 block">
                search_off
              </span>
              <p className="text-white/60">No hay productos en esta categoría</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
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
                        {getCategoryName(product)}
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
                        <span className="text-sm text-white/70">
                          {product.rating}
                        </span>
                        <span className="text-sm text-white/40">
                          ({product.reviews_count})
                        </span>
                      </div>

                      {/* Meta info */}
                      <div className="flex flex-wrap gap-2 text-xs text-white/50">
                        {product.location_name && (
                          <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-xs">
                              location_on
                            </span>
                            {product.location_name}
                          </span>
                        )}
                        {product.duration && (
                          <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-xs">
                              schedule
                            </span>
                            {product.duration}
                          </span>
                        )}
                        {product.area_size && (
                          <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-xs">
                              square_foot
                            </span>
                            {product.area_size}
                          </span>
                        )}
                      </div>

                      {/* Price and CO2 */}
                      <div className="flex items-center justify-between pt-2">
                        <span className="text-lg font-bold text-primary">
                          ${product.price}
                          {getPriceLabel(product)}
                        </span>
                        {product.co2_offset_kg && (
                          <span className="text-xs text-olive-light flex items-center gap-1">
                            <span className="material-symbols-outlined text-xs">
                              eco
                            </span>
                            {product.co2_offset_kg} kg CO₂/año
                          </span>
                        )}
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
                  
                  {/* Stock indicator */}
                  {!product.is_unlimited_stock && product.stock !== undefined && (
                    <p className={`text-xs text-center mt-1 ${
                      product.stock === 0 
                        ? 'text-red-400' 
                        : product.stock < 5 
                          ? 'text-orange-400' 
                          : 'text-white/40'
                    }`}>
                      {product.stock === 0 ? 'Agotado' : `${product.stock} disponibles`}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
