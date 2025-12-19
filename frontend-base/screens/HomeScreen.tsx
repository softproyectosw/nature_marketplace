import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore, PRODUCTS } from '../context/StoreContext';

const HomeScreen: React.FC = () => {
  const navigate = useNavigate();
  const { toggleFavorite, isFavorite } = useStore();

  // Filter products for "Featured" (mock logic: just first 3)
  const featured = PRODUCTS.slice(0, 3);
  // Filter for "New Arrivals" (mock logic: next 4)
  const newArrivals = PRODUCTS.slice(2, 6);

  return (
    <div className="flex flex-col pb-24 font-display">
      {/* Top App Bar */}
      <div className="flex flex-col gap-2 p-4 pb-2">
        <div className="flex items-center h-12 justify-between">
          <div className="flex size-12 shrink-0 items-center">
            <div 
              className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 cursor-pointer hover:opacity-90 transition-opacity" 
              style={{backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuACuKLVH_fV5X9Ba3rRSCI596oYq9gIAJwfZwaCPJLLvQL38TK2lAk4eXqWihfG9oxG4RHjkiBsZkS8vPB0_DsMoBLSm1R75Z1z-jR1dOawiERZxvG33EqxE3JZpPxhZCoIwTirc1Y9f4xZjfrH8nEEYIOaszbaKxU8AOu-fD_qFXYquavFTeu6NBBQ7DPtJK92GpPJqW5Wqq16dSMhjUWGgcC5iIvA79Um_d-aBeiiih1ft8qT8Lvkf5I4nkzZT5espv4ybCSlTvRq")'}}
              onClick={() => navigate('/profile')}
            ></div>
          </div>
          <div className="flex w-12 items-center justify-end">
            <button className="flex cursor-pointer items-center justify-center rounded-full h-12 bg-transparent text-white gap-2 text-base font-bold min-w-0 p-0">
              <span className="material-symbols-outlined text-3xl">settings</span>
            </button>
          </div>
        </div>
        <p className="text-white tracking-light text-[28px] font-bold leading-tight">Hi, Sarah</p>
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
        <div className="flex h-10 shrink-0 items-center justify-center gap-x-2 rounded-xl bg-primary px-6">
          <p className="text-black text-sm font-bold">Retreats</p>
        </div>
        <div className="flex h-10 shrink-0 items-center justify-center gap-x-2 rounded-xl bg-dark-card px-6 border border-white/5">
          <p className="text-white text-sm font-medium">Tree Adoptions</p>
        </div>
        <div className="flex h-10 shrink-0 items-center justify-center gap-x-2 rounded-xl bg-dark-card px-6 border border-white/5">
          <p className="text-white text-sm font-medium">Medicines</p>
        </div>
        <div className="flex h-10 shrink-0 items-center justify-center gap-x-2 rounded-xl bg-dark-card px-6 border border-white/5">
          <p className="text-white text-sm font-medium">Workshops</p>
        </div>
      </div>

      {/* Featured Section */}
      <h2 className="text-white text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">Featured Products</h2>
      <div className="flex overflow-x-auto no-scrollbar px-4 pb-4">
        <div className="flex gap-4">
          {featured.map((item) => (
            <div key={item.id} className="flex flex-col gap-3 min-w-[260px] cursor-pointer group" onClick={() => navigate('/details')}>
              <div 
                className="w-full bg-center bg-no-repeat aspect-video bg-cover rounded-2xl relative" 
                style={{backgroundImage: `url("${item.image}")`}}
              >
                  <button 
                    onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(item.id);
                    }}
                    className="absolute top-2 right-2 flex items-center justify-center size-8 rounded-full bg-black/30 backdrop-blur-md hover:bg-black/50 transition-colors"
                  >
                    <span 
                        className={`material-symbols-outlined text-lg ${isFavorite(item.id) ? 'text-primary' : 'text-white'}`}
                        style={isFavorite(item.id) ? { fontVariationSettings: "'FILL' 1" } : {}}
                    >
                        favorite
                    </span>
                  </button>
              </div>
              <div>
                <p className="text-white text-base font-bold leading-normal group-hover:text-primary transition-colors">{item.title}</p>
                <p className="text-primary/80 text-sm font-normal leading-normal">{item.location}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* New Arrivals Section */}
      <h2 className="text-white text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-6">New Arrivals</h2>
      <div className="px-4 grid grid-cols-2 gap-4">
        {newArrivals.map((item) => (
          <div key={item.id} className="flex flex-col gap-3 cursor-pointer group" onClick={() => navigate('/details')}>
            <div className="relative w-full">
              <div 
                className="w-full bg-center bg-no-repeat aspect-square bg-cover rounded-2xl transition-transform group-hover:scale-105" 
                style={{backgroundImage: `url("${item.image}")`}}
              ></div>
              <button 
                onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(item.id);
                }}
                className="absolute top-2 right-2 flex items-center justify-center size-8 rounded-full bg-black/30 backdrop-blur-md hover:bg-black/50 transition-colors"
              >
                <span 
                    className={`material-symbols-outlined text-lg ${isFavorite(item.id) ? 'text-primary' : 'text-white'}`}
                    style={isFavorite(item.id) ? { fontVariationSettings: "'FILL' 1" } : {}}
                >
                    favorite
                </span>
              </button>
            </div>
            <div>
              <p className="text-white text-base font-medium leading-normal line-clamp-1 group-hover:text-primary transition-colors">{item.title}</p>
              <p className="text-primary/80 text-sm font-normal leading-normal">{item.price}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HomeScreen;