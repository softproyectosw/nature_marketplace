import Link from 'next/link';
import type { Metadata } from 'next';
import { AddToCartButton } from '@/components/products';

/**
 * Product Detail Page - Individual product view
 * SSR for SEO optimization with dynamic metadata
 */

interface ProductPageProps {
  params: {
    category: string;
    slug: string;
  };
}

// Generate dynamic metadata for SEO
export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  // In production, fetch product from API
  const title = params.slug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

  return {
    title: `${title} | Nature Marketplace`,
    description: `Discover ${title} - an eco-luxury product from Nature Marketplace.`,
    openGraph: {
      title: `${title} | Nature Marketplace`,
      description: `Discover ${title} - healing for you and the planet.`,
    },
  };
}

// Mock product data - will be fetched from API
const mockProduct = {
  id: 1,
  title: 'Andean Mountain Wellness Retreat',
  description:
    'Escape the hustle and bustle of daily life and reconnect with your inner self at our exclusive Andean Mountain Wellness Retreat. Nestled in a pristine, secluded valley, our retreat offers a holistic approach to well-being, combining ancient traditions with modern comfort.',
  price: 1200,
  rating: 4.8,
  reviews: 125,
  images: [
    {
      title: 'Find Your Peace',
      subtitle: 'Unwind in our secluded cabins.',
      url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA57d8-crjcjBcF7YSMwpjlCwOgxjuIMr_-ft7LPHaYWNRZFBtgEyVb6ik914ymF0nlxS0sy3CpfzfuzEg6n1aIgHgZ73mAfGBEHFE5i6ILJCiFjSG582VjSgeNDxH2kRfEKNmuhxFJDH9pQ4jzrpUX3QdM6tdqCNMk-prHTFJ3M52-0YSf8X78H3lFF1fPMb2GeFHr-gQpLKK9qDfefwoYzzcKoXYY0qSipZsvnaY8HN_il1xJdV5q7wirCuBPxSOFwN0EIh4aPV4w',
    },
    {
      title: 'Connect with Nature',
      subtitle: 'Guided sessions in stunning landscapes.',
      url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBX4GrNj0sPqAN5xJxaK64uqZpTTEKtSygiiYRmXrZxt4JO1G2-xrHV9g9UNTrwj6087J-dT1TcDXjVvl_uGkXDHj3PTVYgO3CY80SS3Y9jwNPu0bu9BrI3ouI1PJJKYWdOZ25Jbhwev1RIldC_gsZoj8zZEHYsrOLOpaqJBVxN_S_irVlY3NdiYbDtH9TwvmsrbnX9ZVCbvg7r8PJpb1Z8puza8b7nV2J5tQ4s-I_BcPTbVrDW10_XQ8aRtshGzZI-yYRXQhGqYfsy',
    },
    {
      title: 'Nourish Your Body',
      subtitle: 'Locally sourced, organic cuisine.',
      url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDc1vS64gPJ7mXS0GZZ4J9GV3_vtbWnbqLpusdOe_mhtvKZl9800EWClKpEZdAlyu3an5ggEVNg7N47tWtonYYZ8DmGfRsPJxg0ciMgo7upHpfxUxlArq869hYXzEpwQLC8Uzu2y87lPyuSkSXOHREny1z0SNoRC7BiCi8FS6cOWljPP1Fz_GAVL2S0UTtXUxcLoAZ7YDvoBokf-hWw6QOmnSzCmTLX4xmCnwJ_sCpwPySc0wos40KisRYa9s7E7kq3z9ZHt-09Nghy',
    },
  ],
  highlights: [
    { icon: 'self_improvement', text: 'Daily Yoga' },
    { icon: 'spa', text: 'Meditation' },
    { icon: 'hiking', text: 'Nature Hikes' },
    { icon: 'restaurant', text: 'Organic Meals' },
  ],
};

export default function ProductDetailPage({ params }: ProductPageProps) {
  const product = mockProduct;

  return (
    <div className="relative flex min-h-screen w-full flex-col font-display pb-24 bg-background-dark">
      {/* Top App Bar */}
      <div className="sticky top-0 z-20 flex items-center bg-background-dark/95 p-4 pb-2 justify-between backdrop-blur-md">
        <Link
          href="/products"
          className="flex size-12 shrink-0 items-center justify-center rounded-full text-white"
        >
          <span className="material-symbols-outlined text-2xl">arrow_back</span>
        </Link>
        <h2 className="text-white text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center">
          {params.category.charAt(0).toUpperCase() + params.category.slice(1)}
        </h2>
        <div className="flex w-12 items-center justify-end">
          <button className="flex cursor-pointer items-center justify-center rounded-full h-12 bg-transparent text-white gap-2 text-base font-bold min-w-0 p-0">
            <span className="material-symbols-outlined text-2xl">
              favorite_border
            </span>
          </button>
        </div>
      </div>

      <main className="flex-grow">
        {/* Image Carousel */}
        <div className="flex overflow-x-auto no-scrollbar">
          <div className="flex items-stretch p-4 gap-3">
            {product.images.map((item, idx) => (
              <div
                key={idx}
                className="flex h-full flex-1 flex-col gap-4 rounded-lg min-w-[280px]"
              >
                <div
                  className="w-full bg-center bg-no-repeat aspect-[4/3] bg-cover rounded-xl flex flex-col"
                  style={{ backgroundImage: `url("${item.url}")` }}
                />
                <div>
                  <p className="text-white text-base font-bold leading-normal">
                    {item.title}
                  </p>
                  <p className="text-olive-light/60 text-sm font-normal leading-normal">
                    {item.subtitle}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Product Header */}
        <div className="px-4 pt-2">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-white tracking-light text-2xl font-bold leading-tight">
                {product.title}
              </h1>
              <p className="text-olive-light/60 text-sm font-normal leading-normal pt-1">
                Find your inner balance in the heart of nature.
              </p>
            </div>
            <div className="flex-shrink-0 pl-4 text-right">
              <p className="text-white text-2xl font-bold leading-tight">
                ${product.price}
              </p>
              <p className="text-olive-light/60 text-sm font-normal leading-normal">
                /person
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-3">
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4].map((i) => (
                <span
                  key={i}
                  className="material-symbols-outlined text-lg text-primary"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  star
                </span>
              ))}
              <span className="material-symbols-outlined text-lg text-primary">
                star_half
              </span>
            </div>
            <p className="text-white text-sm font-medium">
              {product.rating} ({product.reviews} reviews)
            </p>
          </div>
        </div>

        {/* Description */}
        <div className="px-4 pt-6 space-y-4">
          <div>
            <h3 className="text-lg font-bold text-white mb-2">Description</h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Highlights */}
          <div>
            <h3 className="text-lg font-bold text-white mb-3">Highlights</h3>
            <div className="grid grid-cols-2 gap-4">
              {product.highlights.map((item, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className="flex items-center justify-center size-10 rounded-full bg-primary/20 text-primary">
                    <span className="material-symbols-outlined">{item.icon}</span>
                  </div>
                  <span className="text-sm font-medium text-gray-200">
                    {item.text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Reviews Summary */}
        <div className="px-4 pt-8 mb-8">
          <h3 className="text-lg font-bold text-white mb-4">Reviews</h3>
          <div className="flex flex-wrap gap-x-8 gap-y-6 p-4 rounded-xl bg-slate-800">
            <div className="flex flex-col gap-2">
              <p className="text-white text-4xl font-black leading-tight tracking-[-0.033em]">
                {product.rating}
              </p>
              <div className="flex gap-0.5">
                {[1, 2, 3, 4].map((i) => (
                  <span
                    key={i}
                    className="material-symbols-outlined text-primary text-lg"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    star
                  </span>
                ))}
                <span className="material-symbols-outlined text-primary text-lg">
                  star_half
                </span>
              </div>
              <p className="text-white text-base font-normal leading-normal">
                {product.reviews} reviews
              </p>
            </div>
            <div className="grid min-w-[200px] max-w-[400px] flex-1 grid-cols-[20px_1fr_40px] items-center gap-y-3">
              {[
                { l: 5, p: '80%' },
                { l: 4, p: '12%' },
                { l: 3, p: '5%' },
                { l: 2, p: '2%' },
                { l: 1, p: '1%' },
              ].map((rate) => (
                <div key={rate.l} className="contents">
                  <p className="text-white text-sm font-normal leading-normal">
                    {rate.l}
                  </p>
                  <div className="flex h-2 flex-1 overflow-hidden rounded-full bg-slate-700">
                    <div
                      className="rounded-full bg-primary"
                      style={{ width: rate.p }}
                    />
                  </div>
                  <p className="text-olive-light/60 text-sm font-normal leading-normal text-right">
                    {rate.p}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Sticky CTA Bar */}
      <AddToCartButton 
        productId={product.id} 
        productTitle={product.title} 
        price={product.price} 
      />
    </div>
  );
}
