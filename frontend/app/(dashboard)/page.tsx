'use client';

import Link from 'next/link';

/**
 * Dashboard Home Page
 * Matches the Eco-Luxury design from frontend-base/HomeScreen.tsx
 */

// Mock products data - will be fetched from API
const PRODUCTS = [
  {
    id: 1,
    title: 'Forest Bathing Retreat',
    location: 'Pacific Northwest',
    price: '$125.00',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA57d8-crjcjBcF7YSMwpjlCwOgxjuIMr_-ft7LPHaYWNRZFBtgEyVb6ik914ymF0nlxS0sy3CpfzfuzEg6n1aIgHgZ73mAfGBEHFE5i6ILJCiFjSG582VjSgeNDxH2kRfEKNmuhxFJDH9pQ4jzrpUX3QdM6tdqCNMk-prHTFJ3M52-0YSf8X78H3lFF1fPMb2GeFHr-gQpLKK9qDfefwoYzzcKoXYY0qSipZsvnaY8HN_il1xJdV5q7wirCuBPxSOFwN0EIh4aPV4w',
  },
  {
    id: 2,
    title: 'Mountain Wellness',
    location: 'Andes Mountains',
    price: '$1,200.00',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBX4GrNj0sPqAN5xJxaK64uqZpTTEKtSygiiYRmXrZxt4JO1G2-xrHV9g9UNTrwj6087J-dT1TcDXjVvl_uGkXDHj3PTVYgO3CY80SS3Y9jwNPu0bu9BrI3ouI1PJJKYWdOZ25Jbhwev1RIldC_gsZoj8zZEHYsrOLOpaqJBVxN_S_irVlY3NdiYbDtH9TwvmsrbnX9ZVCbvg7r8PJpb1Z8puza8b7nV2J5tQ4s-I_BcPTbVrDW10_XQ8aRtshGzZI-yYRXQhGqYfsy',
  },
  {
    id: 3,
    title: 'Adopt a Ceiba Tree',
    location: 'Amazon Rainforest',
    price: '$59.00',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDc1vS64gPJ7mXS0GZZ4J9GV3_vtbWnbqLpusdOe_mhtvKZl9800EWClKpEZdAlyu3an5ggEVNg7N47tWtonYYZ8DmGfRsPJxg0ciMgo7upHpfxUxlArq869hYXzEpwQLC8Uzu2y87lPyuSkSXOHREny1z0SNoRC7BiCi8FS6cOWljPP1Fz_GAVL2S0UTtXUxcLoAZ7YDvoBokf-hWw6QOmnSzCmTLX4xmCnwJ_sCpwPySc0wos40KisRYa9s7E7kq3z9ZHt-09Nghy',
  },
  {
    id: 4,
    title: 'Andean Oak Tree',
    location: 'Colombian Highlands',
    price: '$49.00',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB-6GUNZKUR7_k_ZGZ0RbbevuXmvn9LOA0ukszskzKq8Qu9DAcS9RnbeRMCxxsDilRqpucyAIDDsCW0VhAIoXYPZY2imaFkgPFz2r5wammp0aiUc_pV6nBF4EpzpYMnoTR9par3UGszUC9mdx5Nfeee2UrRzkdNKqzzvz-N_HZNKBu2me2QX3-WBzBTL9irFLpr6fbBD8cPxjRc2mAWYdNquWY53gmbKoXckcMcyXc7M3OrNBHvmm5DBw_tAB74cN4BB1tFvBUSvJG3',
  },
  {
    id: 5,
    title: 'Herbal Medicine Kit',
    location: 'Organic Farm',
    price: '$35.00',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCb7qaFmCmW_aGhTbq42JWuifGkh94nQpfJmiA9_F7aE8mZuTVw1S2ZtiDI9B-5jU0vLKt5IKaOtya60cBgZj2wKfJ3j4IsKyEeBlu1TPRyskyshIO7j0j_BxGAd7hYkVPPU7FTpDe-STzCv0orJsz-2tY9VRCRpR1lvmaocHMDNtF3VpyzQfbrLD7ATHv2_gmJKdZZR6lIv6ypEojiay4KM3doCIohLK-JXcU-pINVpOCYB--Fz29aHoLH9qeX1Teo5j7JmZcnb07j',
  },
  {
    id: 6,
    title: 'Yoga Workshop',
    location: 'Virtual',
    price: '$25.00',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuACuKLVH_fV5X9Ba3rRSCI596oYq9gIAJwfZwaCPJLLvQL38TK2lAk4eXqWihfG9oxG4RHjkiBsZkS8vPB0_DsMoBLSm1R75Z1z-jR1dOawiERZxvG33EqxE3JZpPxhZCoIwTirc1Y9f4xZjfrH8nEEYIOaszbaKxU8AOu-fD_qFXYquavFTeu6NBBQ7DPtJK92GpPJqW5Wqq16dSMhjUWGgcC5iIvA79Um_d-aBeiiih1ft8qT8Lvkf5I4nkzZT5espv4ybCSlTvRq',
  },
];

const featured = PRODUCTS.slice(0, 3);
const newArrivals = PRODUCTS.slice(2, 6);

export default function DashboardPage() {
  return (
    <div className="flex flex-col font-display">
      {/* Top App Bar */}
      <div className="flex flex-col gap-2 p-4 pb-2">
        <div className="flex items-center h-12 justify-between">
          <div className="flex size-12 shrink-0 items-center">
            <Link
              href="/profile"
              className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 cursor-pointer hover:opacity-90 transition-opacity"
              style={{
                backgroundImage:
                  'url("https://lh3.googleusercontent.com/aida-public/AB6AXuACuKLVH_fV5X9Ba3rRSCI596oYq9gIAJwfZwaCPJLLvQL38TK2lAk4eXqWihfG9oxG4RHjkiBsZkS8vPB0_DsMoBLSm1R75Z1z-jR1dOawiERZxvG33EqxE3JZpPxhZCoIwTirc1Y9f4xZjfrH8nEEYIOaszbaKxU8AOu-fD_qFXYquavFTeu6NBBQ7DPtJK92GpPJqW5Wqq16dSMhjUWGgcC5iIvA79Um_d-aBeiiih1ft8qT8Lvkf5I4nkzZT5espv4ybCSlTvRq")',
              }}
            />
          </div>
          <div className="flex w-12 items-center justify-end">
            <button className="flex cursor-pointer items-center justify-center rounded-full h-12 bg-transparent text-white gap-2 text-base font-bold min-w-0 p-0">
              <span className="material-symbols-outlined text-3xl">settings</span>
            </button>
          </div>
        </div>
        <p className="text-white tracking-light text-[28px] font-bold leading-tight">
          Hi, Nature Lover
        </p>
      </div>

      {/* Search Bar */}
      <div className="px-4 py-3">
        <div className="flex w-full flex-1 items-stretch rounded-xl h-14 bg-dark-card border border-white/5">
          <div className="text-primary flex items-center justify-center pl-4 pr-2">
            <span className="material-symbols-outlined">search</span>
          </div>
          <input
            className="flex w-full flex-1 bg-transparent border-none text-white focus:outline-none focus:ring-0 placeholder:text-primary/60 px-2 text-base font-normal h-full"
            placeholder="Search for retreats, trees..."
          />
        </div>
      </div>

      {/* Chips */}
      <div className="flex gap-3 px-4 py-3 overflow-x-auto no-scrollbar">
        <div className="flex h-10 shrink-0 items-center justify-center gap-x-2 rounded-xl bg-primary px-4">
          <span className="material-symbols-outlined text-black text-lg">apps</span>
          <p className="text-black text-sm font-bold">Todos</p>
        </div>
        <div className="flex h-10 shrink-0 items-center justify-center gap-x-2 rounded-xl bg-dark-card px-4 border border-white/5">
          <span className="material-symbols-outlined text-white/70 text-lg">park</span>
          <p className="text-white text-sm font-medium">Árboles</p>
        </div>
        <div className="flex h-10 shrink-0 items-center justify-center gap-x-2 rounded-xl bg-dark-card px-4 border border-white/5">
          <span className="material-symbols-outlined text-white/70 text-lg">forest</span>
          <p className="text-white text-sm font-medium">Bosques</p>
        </div>
        <div className="flex h-10 shrink-0 items-center justify-center gap-x-2 rounded-xl bg-dark-card px-4 border border-white/5">
          <span className="material-symbols-outlined text-white/70 text-lg">water</span>
          <p className="text-white text-sm font-medium">Lagunas</p>
        </div>
        <div className="flex h-10 shrink-0 items-center justify-center gap-x-2 rounded-xl bg-dark-card px-4 border border-white/5">
          <span className="material-symbols-outlined text-white/70 text-lg">hiking</span>
          <p className="text-white text-sm font-medium">Experiencias</p>
        </div>
      </div>

      {/* Featured Section */}
      <h2 className="text-white text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">
        Destacados para Apadrinar
      </h2>
      <div className="flex overflow-x-auto no-scrollbar px-4 pb-4">
        <div className="flex gap-4">
          {featured.map((item) => (
            <Link
              key={item.id}
              href={`/products/retreats/${item.title.toLowerCase().replace(/\s+/g, '-')}`}
              className="flex flex-col gap-3 min-w-[260px] cursor-pointer group"
            >
              <div
                className="w-full bg-center bg-no-repeat aspect-video bg-cover rounded-2xl relative"
                style={{ backgroundImage: `url("${item.image}")` }}
              >
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    // TODO: Toggle favorite
                  }}
                  className="absolute top-2 right-2 flex items-center justify-center size-8 rounded-full bg-black/30 backdrop-blur-md hover:bg-black/50 transition-colors"
                >
                  <span className="material-symbols-outlined text-lg text-white">
                    favorite
                  </span>
                </button>
              </div>
              <div>
                <p className="text-white text-base font-bold leading-normal group-hover:text-primary transition-colors">
                  {item.title}
                </p>
                <p className="text-primary/80 text-sm font-normal leading-normal">
                  {item.location}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* New Arrivals Section */}
      <h2 className="text-white text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-6">
        Nuevos Árboles Disponibles
      </h2>
      <div className="px-4 grid grid-cols-2 gap-4">
        {newArrivals.map((item) => (
          <Link
            key={item.id}
            href={`/products/trees/${item.title.toLowerCase().replace(/\s+/g, '-')}`}
            className="flex flex-col gap-3 cursor-pointer group"
          >
            <div className="relative w-full">
              <div
                className="w-full bg-center bg-no-repeat aspect-square bg-cover rounded-2xl transition-transform group-hover:scale-105"
                style={{ backgroundImage: `url("${item.image}")` }}
              />
              <button
                onClick={(e) => {
                  e.preventDefault();
                  // TODO: Toggle favorite
                }}
                className="absolute top-2 right-2 flex items-center justify-center size-8 rounded-full bg-black/30 backdrop-blur-md hover:bg-black/50 transition-colors"
              >
                <span className="material-symbols-outlined text-lg text-white">
                  favorite
                </span>
              </button>
            </div>
            <div>
              <p className="text-white text-base font-medium leading-normal line-clamp-1 group-hover:text-primary transition-colors">
                {item.title}
              </p>
              <p className="text-primary/80 text-sm font-normal leading-normal">
                {item.price}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
