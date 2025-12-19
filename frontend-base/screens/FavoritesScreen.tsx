import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore, PRODUCTS } from '../context/StoreContext';

const FavoritesScreen: React.FC = () => {
  const navigate = useNavigate();
  const { favorites, toggleFavorite } = useStore();

  const favoriteProducts = PRODUCTS.filter(p => favorites.includes(p.id));

  return (
    <div className="flex flex-col min-h-screen w-full font-display pb-28 text-white">
      {/* Header */}
      <div className="flex items-center p-6 bg-background-dark sticky top-0 z-10">
        <h1 className="text-2xl font-bold">Your Favorites</h1>
      </div>

      {favoriteProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-grow opacity-60 px-10 text-center">
          <span className="material-symbols-outlined text-6xl mb-4 text-olive-light">favorite_border</span>
          <h3 className="text-lg font-bold">No favorites yet</h3>
          <p className="text-sm mt-2">Browse the marketplace and save items you love to heal the planet.</p>
          <button 
            onClick={() => navigate('/home')}
            className="mt-6 px-6 py-3 bg-white/10 rounded-xl text-sm font-bold hover:bg-white/20 transition-colors"
          >
            Explore
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 px-4">
          {favoriteProducts.map((item) => (
            <div key={item.id} className="flex flex-col gap-3 group relative">
              <div 
                className="w-full bg-center bg-no-repeat aspect-square bg-cover rounded-2xl transition-transform active:scale-95" 
                style={{backgroundImage: `url("${item.image}")`}}
                onClick={() => navigate('/details')}
              >
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded-2xl"></div>
              </div>
              
              <button 
                onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(item.id);
                }}
                className="absolute top-2 right-2 flex items-center justify-center size-8 rounded-full bg-white text-red-500 shadow-md z-10"
              >
                <span className="material-symbols-outlined text-lg" style={{fontVariationSettings: "'FILL' 1"}}>favorite</span>
              </button>

              <div>
                <p className="text-white text-sm font-bold leading-normal line-clamp-1">{item.title}</p>
                <p className="text-primary/80 text-xs font-medium leading-normal">{item.price}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FavoritesScreen;
