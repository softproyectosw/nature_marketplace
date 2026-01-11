'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from '@/contexts/LanguageContext';

const FAVORITES_KEY = 'nature_favorites';
const ACCESS_TOKEN_KEY = 'nature_access_token';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Get favorites from localStorage
function getLocalFavorites(): number[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(FAVORITES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

// Save favorites to localStorage
function setLocalFavorites(ids: number[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(ids));
  // Dispatch event for other components to listen
  window.dispatchEvent(new CustomEvent('favoritesUpdated', { detail: ids }));
}

// Check if user is authenticated
function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;
  return !!localStorage.getItem(ACCESS_TOKEN_KEY);
}

// Get auth token
function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

interface FavoriteButtonProps {
  productId: number;
  className?: string;
}

export function FavoriteButton({ productId, className = '' }: FavoriteButtonProps) {
  const { t } = useTranslation();
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Check if product is in favorites on mount
  useEffect(() => {
    const favorites = getLocalFavorites();
    setIsFavorite(favorites.includes(productId));
    console.log('[FavoriteButton] Initial state for product', productId, ':', favorites.includes(productId));
  }, [productId]);

  // Listen for favorites updates from other components
  useEffect(() => {
    const handleUpdate = (e: CustomEvent<number[]>) => {
      setIsFavorite(e.detail.includes(productId));
    };
    window.addEventListener('favoritesUpdated', handleUpdate as EventListener);
    return () => window.removeEventListener('favoritesUpdated', handleUpdate as EventListener);
  }, [productId]);

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isLoading) return;
    
    const newState = !isFavorite;
    setIsFavorite(newState);
    setIsLoading(true);
    
    console.log('[FavoriteButton] Toggling favorite for product', productId, 'to', newState);

    try {
      // Always update localStorage first (works for both logged in and guest users)
      const currentFavorites = getLocalFavorites();
      let newFavorites: number[];
      
      if (newState) {
        // Add to favorites
        newFavorites = [...currentFavorites, productId];
      } else {
        // Remove from favorites
        newFavorites = currentFavorites.filter(id => id !== productId);
      }
      
      setLocalFavorites(newFavorites);
      console.log('[FavoriteButton] Updated localStorage favorites:', newFavorites);

      // If user is authenticated, also sync with backend
      if (isAuthenticated()) {
        const token = getToken();
        try {
          const response = await fetch(`${API_URL}/api/users/favorites/${productId}/`, {
            method: newState ? 'POST' : 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });
          
          console.log('[FavoriteButton] Backend response status:', response.status);
          if (response.ok || response.status === 201 || response.status === 204) {
            console.log('[FavoriteButton] Synced with backend successfully');
          } else {
            console.log('[FavoriteButton] Backend sync failed, but localStorage updated');
          }
        } catch (err) {
          console.log('[FavoriteButton] Backend sync error (localStorage still updated):', err);
        }
      }
    } catch (err) {
      console.error('[FavoriteButton] Error toggling favorite:', err);
      // Revert state on error
      setIsFavorite(!newState);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button 
      className={`flex items-center justify-center size-8 rounded-lg bg-black/30 backdrop-blur-sm hover:bg-black/50 transition-colors ${className} ${isLoading ? 'opacity-50' : ''}`}
      onClick={handleToggle}
      disabled={isLoading}
      aria-label={isFavorite ? t.favorites.removeFromFavorites : t.favorites.addToFavorites}
    >
      <span 
        className="material-symbols-outlined text-lg transition-all"
        style={isFavorite ? { fontVariationSettings: "'FILL' 1", color: '#ef4444' } : { color: 'white' }}
      >
        favorite
      </span>
    </button>
  );
}

// Export utility functions for use in other components
export { getLocalFavorites, setLocalFavorites, isAuthenticated };
