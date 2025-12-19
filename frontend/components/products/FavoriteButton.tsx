'use client';

import { useState } from 'react';

interface FavoriteButtonProps {
  productId: number;
  className?: string;
}

export function FavoriteButton({ productId, className = '' }: FavoriteButtonProps) {
  const [isFavorite, setIsFavorite] = useState(false);

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFavorite(!isFavorite);
    // TODO: Sync with backend/localStorage
    console.log(`Toggle favorite for product ${productId}`);
  };

  return (
    <button 
      className={`flex items-center justify-center size-8 rounded-full bg-black/30 backdrop-blur-sm hover:bg-black/50 transition-colors ${className}`}
      onClick={handleToggle}
      aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
    >
      <span 
        className="material-symbols-outlined text-lg"
        style={isFavorite ? { fontVariationSettings: "'FILL' 1", color: '#ef4444' } : { color: 'white' }}
      >
        favorite
      </span>
    </button>
  );
}
