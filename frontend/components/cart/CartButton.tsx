'use client';

import { useCart } from '@/contexts/CartContext';

export function CartButton() {
  const { totalItems, setIsOpen } = useCart();

  return (
    <button
      onClick={() => setIsOpen(true)}
      className="relative flex items-center justify-center p-2 text-white/70 hover:text-white transition-colors"
      aria-label="Open cart"
    >
      <span className="material-symbols-outlined text-2xl">shopping_cart</span>
      {totalItems > 0 && (
        <span className="absolute -top-1 -right-1 bg-primary text-background-dark text-xs font-bold w-5 h-5 rounded-md flex items-center justify-center">
          {totalItems > 9 ? '9+' : totalItems}
        </span>
      )}
    </button>
  );
}
