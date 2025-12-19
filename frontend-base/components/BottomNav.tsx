import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const BottomNav: React.FC = () => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="fixed bottom-0 left-0 right-0 h-[88px] bg-white/90 dark:bg-background-dark/95 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 z-50">
      <div className="flex justify-around items-center h-full max-w-lg mx-auto px-4">
        <Link to="/home" className={`flex flex-col items-center gap-1 ${isActive('/home') ? 'text-primary' : 'text-slate-500 dark:text-slate-400'}`}>
          <span className="material-symbols-outlined">eco</span>
          <p className="text-xs font-bold">Discover</p>
        </Link>
        <Link to="/favorites" className={`flex flex-col items-center gap-1 ${isActive('/favorites') ? 'text-primary' : 'text-slate-500 dark:text-slate-400'}`}>
          <span className="material-symbols-outlined" style={isActive('/favorites') ? { fontVariationSettings: "'FILL' 1" } : {}}>favorite</span>
          <p className="text-xs font-medium">Favorites</p>
        </Link>
        <Link to="/cart" className={`flex flex-col items-center gap-1 ${isActive('/cart') ? 'text-primary' : 'text-slate-500 dark:text-slate-400'}`}>
          <span className="material-symbols-outlined">shopping_bag</span>
          <p className="text-xs font-medium">Cart</p>
        </Link>
        <Link to="/profile" className={`flex flex-col items-center gap-1 ${isActive('/profile') ? 'text-primary' : 'text-slate-500 dark:text-slate-400'}`}>
          <span className="material-symbols-outlined">person</span>
          <p className="text-xs font-medium">Profile</p>
        </Link>
      </div>
    </div>
  );
};

export default BottomNav;