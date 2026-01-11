'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface AddToCartButtonProps {
  productId: number;
  productTitle: string;
  price: number;
}

export function AddToCartButton({ productId, productTitle, price }: AddToCartButtonProps) {
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [added, setAdded] = useState(false);

  const handleAddToCart = async () => {
    setIsAdding(true);
    
    // Simulate adding to cart (in production, use context/API)
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    // Store in localStorage for demo
    const cart = JSON.parse(localStorage.getItem('nature_cart') || '[]');
    const existingItem = cart.find((item: { id: number }) => item.id === productId);
    
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.push({
        id: productId,
        title: productTitle,
        price,
        quantity,
      });
    }
    
    localStorage.setItem('nature_cart', JSON.stringify(cart));
    
    setIsAdding(false);
    setAdded(true);
    
    // Navigate to cart after brief delay
    setTimeout(() => {
      router.push('/cart');
    }, 800);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 bg-background-dark/95 backdrop-blur-sm border-t border-slate-700 p-4 w-full pb-8">
      <div className="flex items-center gap-4 max-w-6xl mx-auto">
        {/* Quantity Selector */}
        <div className="flex items-center gap-2 rounded-xl bg-slate-800 p-2 h-14">
          <button 
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="flex items-center justify-center size-8 rounded text-white hover:bg-white/10 transition-colors"
          >
            <span className="material-symbols-outlined">remove</span>
          </button>
          <span className="text-lg font-bold text-white min-w-[2ch] text-center">
            {quantity}
          </span>
          <button 
            onClick={() => setQuantity(quantity + 1)}
            className="flex items-center justify-center size-8 rounded text-white hover:bg-white/10 transition-colors"
          >
            <span className="material-symbols-outlined">add</span>
          </button>
        </div>
        
        {/* Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          disabled={isAdding || added}
          className={`flex-grow h-14 rounded-xl text-base font-bold flex items-center justify-center gap-2 transition-all ${
            added 
              ? 'bg-green-500 text-white' 
              : 'bg-primary text-black hover:bg-primary/90'
          } disabled:opacity-70`}
        >
          {isAdding ? (
            <>
              <span className="material-symbols-outlined animate-spin">progress_activity</span>
              Adding...
            </>
          ) : added ? (
            <>
              <span className="material-symbols-outlined">check_circle</span>
              Added to Cart!
            </>
          ) : (
            <>
              <span className="material-symbols-outlined">shopping_cart</span>
              Add to Cart - ${price * quantity}
            </>
          )}
        </button>
      </div>
    </div>
  );
}
