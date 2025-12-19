'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FavoriteButton } from './FavoriteButton';
import { AddToCartButton } from '@/components/cart';

// Categorías de apadrinamiento y experiencias
const categories = [
  { name: 'Todos', slug: '', icon: 'apps' },
  { name: 'Árboles', slug: 'trees', icon: 'park' },
  { name: 'Bosques', slug: 'forests', icon: 'forest' },
  { name: 'Lagunas', slug: 'lagoons', icon: 'water' },
  { name: 'Experiencias', slug: 'experiences', icon: 'hiking' },
];

type ItemType = 'tree' | 'forest' | 'lagoon' | 'experience';

interface Product {
  id: number;
  title: string;
  slug: string;
  category: string;
  type: ItemType;
  price: number;
  priceLabel: string;
  image: string;
  rating: number;
  reviews: number;
  co2?: number;
  area?: string;
  duration?: string;
  date?: string;
  location?: string;
  stock?: number;
  isUnlimitedStock?: boolean;
}

// Productos mock
const allProducts: Product[] = [
  {
    id: 1,
    title: 'Roble Andino',
    slug: 'roble-andino',
    category: 'trees',
    type: 'tree',
    price: 49,
    priceLabel: '/año',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA57d8-crjcjBcF7YSMwpjlCwOgxjuIMr_-ft7LPHaYWNRZFBtgEyVb6ik914ymF0nlxS0sy3CpfzfuzEg6n1aIgHgZ73mAfGBEHFE5i6ILJCiFjSG582VjSgeNDxH2kRfEKNmuhxFJDH9pQ4jzrpUX3QdM6tdqCNMk-prHTFJ3M52-0YSf8X78H3lFF1fPMb2GeFHr-gQpLKK9qDfefwoYzzcKoXYY0qSipZsvnaY8HN_il1xJdV5q7wirCuBPxSOFwN0EIh4aPV4w',
    rating: 4.9,
    reviews: 128,
    co2: 22,
    location: 'Boyacá, Colombia',
    isUnlimitedStock: true, // Apadrinamientos ilimitados
  },
  {
    id: 2,
    title: 'Árbol Ceiba Sagrada',
    slug: 'ceiba-sagrada',
    category: 'trees',
    type: 'tree',
    price: 79,
    priceLabel: '/año',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDc1vS64gPJ7mXS0GZZ4J9GV3_vtbWnbqLpusdOe_mhtvKZl9800EWClKpEZdAlyu3an5ggEVNg7N47tWtonYYZ8DmGfRsPJxg0ciMgo7upHpfxUxlArq869hYXzEpwQLC8Uzu2y87lPyuSkSXOHREny1z0SNoRC7BiCi8FS6cOWljPP1Fz_GAVL2S0UTtXUxcLoAZ7YDvoBokf-hWw6QOmnSzCmTLX4xmCnwJ_sCpwPySc0wos40KisRYa9s7E7kq3z9ZHt-09Nghy',
    rating: 4.8,
    reviews: 89,
    co2: 45,
    location: 'Amazonas, Colombia',
    stock: 5, // Solo 5 disponibles
    isUnlimitedStock: false,
  },
  {
    id: 3,
    title: 'Hectárea de Bosque Andino',
    slug: 'hectarea-bosque-andino',
    category: 'forests',
    type: 'forest',
    price: 299,
    priceLabel: '/año',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBX4GrNj0sPqAN5xJxaK64uqZpTTEKtSygiiYRmXrZxt4JO1G2-xrHV9g9UNTrwj6087J-dT1TcDXjVvl_uGkXDHj3PTVYgO3CY80SS3Y9jwNPu0bu9BrI3ouI1PJJKYWdOZ25Jbhwev1RIldC_gsZoj8zZEHYsrOLOpaqJBVxN_S_irVlY3NdiYbDtH9TwvmsrbnX9ZVCbvg7r8PJpb1Z8puza8b7nV2J5tQ4s-I_BcPTbVrDW10_XQ8aRtshGzZI-yYRXQhGqYfsy',
    rating: 4.9,
    reviews: 45,
    co2: 500,
    area: '1 hectárea',
    location: 'Sierra Nevada, Colombia',
    stock: 3, // Solo 3 hectáreas disponibles
    isUnlimitedStock: false,
  },
  {
    id: 4,
    title: '1/4 Hectárea Bosque Nublado',
    slug: 'cuarto-hectarea-bosque-nublado',
    category: 'forests',
    type: 'forest',
    price: 99,
    priceLabel: '/año',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB-6GUNZKUR7_k_ZGZ0RbbevuXmvn9LOA0ukszskzKq8Qu9DAcS9RnbeRMCxxsDilRqpucyAIDDsCW0VhAIoXYPZY2imaFkgPFz2r5wammp0aiUc_pV6nBF4EpzpYMnoTR9par3UGszUC9mdx5Nfeee2UrRzkdNKqzzvz-N_HZNKBu2me2QX3-WBzBTL9irFLpr6fbBD8cPxjRc2mAWYdNquWY53gmbKoXckcMcyXc7M3OrNBHvmm5DBw_tAB74cN4BB1tFvBUSvJG3',
    rating: 4.7,
    reviews: 67,
    co2: 125,
    area: '2,500 m²',
    location: 'Chingaza, Colombia',
    stock: 0, // Agotado
    isUnlimitedStock: false,
  },
  {
    id: 5,
    title: 'Laguna de Guatavita',
    slug: 'laguna-guatavita',
    category: 'lagoons',
    type: 'lagoon',
    price: 149,
    priceLabel: '/año',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCb7qaFmCmW_aGhTbq42JWuifGkh94nQpfJmiA9_F7aE8mZuTVw1S2ZtiDI9B-5jU0vLKt5IKaOtya60cBgZj2wKfJ3j4IsKyEeBlu1TPRyskyshIO7j0j_BxGAd7hYkVPPU7FTpDe-STzCv0orJsz-2tY9VRCRpR1lvmaocHMDNtF3VpyzQfbrLD7ATHv2_gmJKdZZR6lIv6ypEojiay4KM3doCIohLK-JXcU-pINVpOCYB--Fz29aHoLH9qeX1Teo5j7JmZcnb07j',
    rating: 4.9,
    reviews: 34,
    area: 'Contribución colectiva',
    location: 'Cundinamarca, Colombia',
  },
  {
    id: 6,
    title: 'Humedal La Conejera',
    slug: 'humedal-conejera',
    category: 'lagoons',
    type: 'lagoon',
    price: 79,
    priceLabel: '/año',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuACuKLVH_fV5X9Ba3rRSCI596oYq9gIAJwfZwaCPJLLvQL38TK2lAk4eXqWihfG9oxG4RHjkiBsZkS8vPB0_DsMoBLSm1R75Z1z-jR1dOawiERZxvG33EqxE3JZpPxhZCoIwTirc1Y9f4xZjfrH8nEEYIOaszbaKxU8AOu-fD_qFXYquavFTeu6NBBQ7DPtJK92GpPJqW5Wqq16dSMhjUWGgcC5iIvA79Um_d-aBeiiih1ft8qT8Lvkf5I4nkzZT5espv4ybCSlTvRq',
    rating: 4.6,
    reviews: 28,
    area: 'Contribución colectiva',
    location: 'Bogotá, Colombia',
  },
  {
    id: 7,
    title: 'Caminata con Propósito',
    slug: 'caminata-proposito',
    category: 'experiences',
    type: 'experience',
    price: 85,
    priceLabel: '',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA57d8-crjcjBcF7YSMwpjlCwOgxjuIMr_-ft7LPHaYWNRZFBtgEyVb6ik914ymF0nlxS0sy3CpfzfuzEg6n1aIgHgZ73mAfGBEHFE5i6ILJCiFjSG582VjSgeNDxH2kRfEKNmuhxFJDH9pQ4jzrpUX3QdM6tdqCNMk-prHTFJ3M52-0YSf8X78H3lFF1fPMb2GeFHr-gQpLKK9qDfefwoYzzcKoXYY0qSipZsvnaY8HN_il1xJdV5q7wirCuBPxSOFwN0EIh4aPV4w',
    rating: 4.9,
    reviews: 156,
    duration: '4 horas',
    location: 'Varios lugares',
  },
  {
    id: 8,
    title: 'Baño de Bosque Guiado',
    slug: 'bano-bosque-guiado',
    category: 'experiences',
    type: 'experience',
    price: 120,
    priceLabel: '',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBX4GrNj0sPqAN5xJxaK64uqZpTTEKtSygiiYRmXrZxt4JO1G2-xrHV9g9UNTrwj6087J-dT1TcDXjVvl_uGkXDHj3PTVYgO3CY80SS3Y9jwNPu0bu9BrI3ouI1PJJKYWdOZ25Jbhwev1RIldC_gsZoj8zZEHYsrOLOpaqJBVxN_S_irVlY3NdiYbDtH9TwvmsrbnX9ZVCbvg7r8PJpb1Z8puza8b7nV2J5tQ4s-I_BcPTbVrDW10_XQ8aRtshGzZI-yYRXQhGqYfsy',
    rating: 4.8,
    reviews: 89,
    duration: '3 horas',
    location: 'Chicaque, Colombia',
  },
  {
    id: 9,
    title: 'Retiro de Bienestar 3 Días',
    slug: 'retiro-bienestar-3-dias',
    category: 'experiences',
    type: 'experience',
    price: 850,
    priceLabel: '',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDc1vS64gPJ7mXS0GZZ4J9GV3_vtbWnbqLpusdOe_mhtvKZl9800EWClKpEZdAlyu3an5ggEVNg7N47tWtonYYZ8DmGfRsPJxg0ciMgo7upHpfxUxlArq869hYXzEpwQLC8Uzu2y87lPyuSkSXOHREny1z0SNoRC7BiCi8FS6cOWljPP1Fz_GAVL2S0UTtXUxcLoAZ7YDvoBokf-hWw6QOmnSzCmTLX4xmCnwJ_sCpwPySc0wos40KisRYa9s7E7kq3z9ZHt-09Nghy',
    rating: 5.0,
    reviews: 42,
    duration: '3 días',
    location: 'Villa de Leyva, Colombia',
  },
  {
    id: 10,
    title: 'Siembra Comunitaria',
    slug: 'siembra-comunitaria',
    category: 'experiences',
    type: 'experience',
    price: 45,
    priceLabel: '',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB-6GUNZKUR7_k_ZGZ0RbbevuXmvn9LOA0ukszskzKq8Qu9DAcS9RnbeRMCxxsDilRqpucyAIDDsCW0VhAIoXYPZY2imaFkgPFz2r5wammp0aiUc_pV6nBF4EpzpYMnoTR9par3UGszUC9mdx5Nfeee2UrRzkdNKqzzvz-N_HZNKBu2me2QX3-WBzBTL9irFLpr6fbBD8cPxjRc2mAWYdNquWY53gmbKoXckcMcyXc7M3OrNBHvmm5DBw_tAB74cN4BB1tFvBUSvJG3',
    rating: 4.7,
    reviews: 78,
    duration: '5 horas',
    location: 'Cerros Orientales, Bogotá',
  },
];

export function ProductsGrid() {
  const [activeCategory, setActiveCategory] = useState('');

  const filteredProducts = activeCategory
    ? allProducts.filter((p) => p.category === activeCategory)
    : allProducts;

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
          {filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <span className="material-symbols-outlined text-4xl text-white/40 mb-4 block">
                search_off
              </span>
              <p className="text-white/60">No hay productos en esta categoría</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="glass-card p-4 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 group relative"
                >
                  {/* Favorite Button */}
                  <FavoriteButton
                    productId={product.id}
                    className="absolute top-6 right-6 z-10"
                  />

                  <Link href={`/products/${product.category}/${product.slug}`}>
                    {/* Image */}
                    <div
                      className="aspect-square rounded-xl bg-cover bg-center mb-4 group-hover:scale-[1.02] transition-transform"
                      style={{ backgroundImage: `url("${product.image}")` }}
                    />

                    {/* Content */}
                    <div className="space-y-2">
                      <p className="text-xs text-white/50 uppercase tracking-wide">
                        {product.category}
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
                          ({product.reviews})
                        </span>
                      </div>

                      {/* Meta info */}
                      <div className="flex flex-wrap gap-2 text-xs text-white/50">
                        {product.location && (
                          <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-xs">
                              location_on
                            </span>
                            {product.location}
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
                        {product.area && (
                          <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-xs">
                              square_foot
                            </span>
                            {product.area}
                          </span>
                        )}
                      </div>

                      {/* Price and Add to Cart */}
                      <div className="flex items-center justify-between pt-2">
                        <span className="text-lg font-bold text-primary">
                          ${product.price}
                          {product.priceLabel}
                        </span>
                        {product.co2 && (
                          <span className="text-xs text-olive-light flex items-center gap-1">
                            <span className="material-symbols-outlined text-xs">
                              eco
                            </span>
                            {product.co2} kg CO₂/año
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
                        price: product.price,
                        priceLabel: product.priceLabel,
                        image: product.image,
                        category: product.category,
                        slug: `${product.category}/${product.slug}`,
                        stock: product.stock,
                        isUnlimitedStock: product.isUnlimitedStock,
                      }}
                      variant="button"
                      className="w-full"
                    />
                  </div>
                  
                  {/* Stock indicator */}
                  {!product.isUnlimitedStock && product.stock !== undefined && (
                    <p className={`text-xs text-center mt-1 ${product.stock === 0 ? 'text-red-400' : product.stock < 5 ? 'text-orange-400' : 'text-white/40'}`}>
                      {product.stock === 0 ? 'Out of Stock' : `${product.stock} available`}
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
