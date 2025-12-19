'use client';

import Link from 'next/link';

/**
 * Favorites Page
 * Matches the Eco-Luxury design from frontend-base/FavoritesScreen.tsx
 */

// Mock favorites - will be fetched from API/store
const favoriteProducts = [
  {
    id: 1,
    title: 'Forest Bathing Retreat',
    price: '$125.00',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuA57d8-crjcjBcF7YSMwpjlCwOgxjuIMr_-ft7LPHaYWNRZFBtgEyVb6ik914ymF0nlxS0sy3CpfzfuzEg6n1aIgHgZ73mAfGBEHFE5i6ILJCiFjSG582VjSgeNDxH2kRfEKNmuhxFJDH9pQ4jzrpUX3QdM6tdqCNMk-prHTFJ3M52-0YSf8X78H3lFF1fPMb2GeFHr-gQpLKK9qDfefwoYzzcKoXYY0qSipZsvnaY8HN_il1xJdV5q7wirCuBPxSOFwN0EIh4aPV4w',
  },
  {
    id: 2,
    title: 'Adopt a Ceiba Tree',
    price: '$59.00',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDc1vS64gPJ7mXS0GZZ4J9GV3_vtbWnbqLpusdOe_mhtvKZl9800EWClKpEZdAlyu3an5ggEVNg7N47tWtonYYZ8DmGfRsPJxg0ciMgo7upHpfxUxlArq869hYXzEpwQLC8Uzu2y87lPyuSkSXOHREny1z0SNoRC7BiCi8FS6cOWljPP1Fz_GAVL2S0UTtXUxcLoAZ7YDvoBokf-hWw6QOmnSzCmTLX4xmCnwJ_sCpwPySc0wos40KisRYa9s7E7kq3z9ZHt-09Nghy',
  },
];

export default function FavoritesPage() {
  const hasFavorites = favoriteProducts.length > 0;

  return (
    <div className="flex flex-col min-h-screen w-full font-display text-white">
      {/* Header */}
      <div className="flex items-center p-6 bg-background-dark sticky top-0 z-10">
        <h1 className="text-2xl font-bold">Your Favorites</h1>
      </div>

      {!hasFavorites ? (
        <div className="flex flex-col items-center justify-center flex-grow opacity-60 px-10 text-center">
          <span className="material-symbols-outlined text-6xl mb-4 text-olive-light">
            favorite_border
          </span>
          <h3 className="text-lg font-bold">No favorites yet</h3>
          <p className="text-sm mt-2">
            Browse the marketplace and save items you love to heal the planet.
          </p>
          <Link
            href="/"
            className="mt-6 px-6 py-3 bg-white/10 rounded-xl text-sm font-bold hover:bg-white/20 transition-colors"
          >
            Explore
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 px-4">
          {favoriteProducts.map((item) => (
            <div key={item.id} className="flex flex-col gap-3 group relative">
              <Link
                href={`/products/retreats/${item.title.toLowerCase().replace(/\s+/g, '-')}`}
                className="w-full bg-center bg-no-repeat aspect-square bg-cover rounded-2xl transition-transform active:scale-95 block"
                style={{ backgroundImage: `url("${item.image}")` }}
              >
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded-2xl" />
              </Link>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  // TODO: Toggle favorite
                }}
                className="absolute top-2 right-2 flex items-center justify-center size-8 rounded-full bg-white text-red-500 shadow-md z-10"
              >
                <span
                  className="material-symbols-outlined text-lg"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  favorite
                </span>
              </button>

              <div>
                <p className="text-white text-sm font-bold leading-normal line-clamp-1">
                  {item.title}
                </p>
                <p className="text-primary/80 text-xs font-medium leading-normal">
                  {item.price}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
