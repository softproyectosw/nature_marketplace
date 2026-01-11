'use client';

import { useState } from 'react';
import { useCart, CartItem } from '@/contexts/CartContext';
import { useTranslation } from '@/contexts/LanguageContext';

interface AddToCartButtonProps {
  product: Omit<CartItem, 'quantity'>;
  variant?: 'icon' | 'button' | 'full';
  className?: string;
}

export function AddToCartButton({ product, variant = 'icon', className = '' }: AddToCartButtonProps) {
  const { addItem, getItemQuantity, canAddMore } = useCart();
  const { t } = useTranslation();
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentQty = getItemQuantity(product.id);
  const canAdd = canAddMore(product.id, product.stock, product.isUnlimitedStock);
  const isOutOfStock = !product.isUnlimitedStock && product.stock === 0;

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isOutOfStock) {
      setError(t.products.outOfStock);
      setTimeout(() => setError(null), 2000);
      return;
    }
    
    if (!canAdd) {
      setError(`${t.cart.max}: ${product.stock}`);
      setTimeout(() => setError(null), 2000);
      return;
    }
    
    setIsAdding(true);
    const success = addItem(product);
    
    if (!success) {
      setError(t.cart.stockLimitReached);
      setTimeout(() => setError(null), 2000);
    }
    
    setTimeout(() => {
      setIsAdding(false);
    }, 500);
  };

  const buttonDisabled = isAdding || isOutOfStock || !canAdd;
  const buttonText = isOutOfStock 
    ? t.products.outOfStock 
    : !canAdd 
      ? t.cart.max 
      : isAdding 
        ? t.products.addedToCart 
        : t.products.addToCart;

  if (variant === 'icon') {
    return (
      <button
        onClick={handleAdd}
        disabled={buttonDisabled}
        className={`flex items-center justify-center size-9 rounded-xl transition-all active:scale-95 disabled:cursor-not-allowed ${
          isOutOfStock || !canAdd 
            ? 'bg-white/20 text-white/40' 
            : 'bg-primary text-background-dark hover:bg-primary/90 disabled:opacity-70'
        } ${className}`}
        aria-label="Add to cart"
        title={error || undefined}
      >
        <span className="material-symbols-outlined text-lg">
          {isOutOfStock ? 'block' : isAdding ? 'check' : 'add_shopping_cart'}
        </span>
      </button>
    );
  }

  if (variant === 'button') {
    return (
      <div className="relative">
        <button
          onClick={handleAdd}
          disabled={buttonDisabled}
          className={`flex items-center justify-center gap-2 px-4 py-2 rounded-xl font-medium transition-all active:scale-95 disabled:cursor-not-allowed ${
            isOutOfStock || !canAdd 
              ? 'bg-white/20 text-white/60' 
              : 'bg-primary text-background-dark hover:bg-primary/90 disabled:opacity-70'
          } ${className}`}
        >
          <span className="material-symbols-outlined text-lg">
            {isOutOfStock ? 'block' : isAdding ? 'check' : 'add_shopping_cart'}
          </span>
          <span>{buttonText}</span>
          {currentQty > 0 && !isOutOfStock && (
            <span className="bg-background-dark/20 px-1.5 py-0.5 rounded text-xs">
              {currentQty}
            </span>
          )}
        </button>
        {error && (
          <p className="absolute -bottom-5 left-0 right-0 text-center text-xs text-red-400">
            {error}
          </p>
        )}
      </div>
    );
  }

  // Full variant
  return (
    <div className="relative">
      <button
        onClick={handleAdd}
        disabled={buttonDisabled}
        className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all active:scale-95 disabled:cursor-not-allowed ${
          isOutOfStock || !canAdd 
            ? 'bg-white/20 text-white/60' 
            : 'bg-primary text-background-dark hover:bg-primary/90 disabled:opacity-70'
        } ${className}`}
      >
        <span className="material-symbols-outlined">
          {isOutOfStock ? 'block' : isAdding ? 'check' : 'add_shopping_cart'}
        </span>
        <span>
          {isOutOfStock 
            ? t.products.outOfStock 
            : isAdding 
              ? t.products.addedToCart 
              : `${t.products.addToCart} - $${product.price}`}
        </span>
        {currentQty > 0 && !isOutOfStock && (
          <span className="bg-background-dark/20 px-2 py-0.5 rounded text-sm">
            ({currentQty} {t.cart.inCart})
          </span>
        )}
      </button>
      {error && (
        <p className="absolute -bottom-5 left-0 right-0 text-center text-xs text-red-400">
          {error}
        </p>
      )}
      {!product.isUnlimitedStock && product.stock !== undefined && product.stock > 0 && (
        <p className="text-center text-xs text-white/40 mt-2">
          {product.stock} {t.products.available}
        </p>
      )}
    </div>
  );
}
