'use client';

import Link from 'next/link';
import { useState } from 'react';
import { BottomNav } from '@/components/ui';
import { useTranslation } from '@/contexts/LanguageContext';

interface CartItem {
  id: number;
  title: string;
  price: number;
  priceLabel: string;
  quantity: number;
  image: string;
  category: string;
}

// Mock cart items - in production, use context/store
const initialCartItems: CartItem[] = [
  {
    id: 1,
    title: 'Roble Andino',
    price: 49,
    priceLabel: '/año',
    quantity: 1,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA57d8-crjcjBcF7YSMwpjlCwOgxjuIMr_-ft7LPHaYWNRZFBtgEyVb6ik914ymF0nlxS0sy3CpfzfuzEg6n1aIgHgZ73mAfGBEHFE5i6ILJCiFjSG582VjSgeNDxH2kRfEKNmuhxFJDH9pQ4jzrpUX3QdM6tdqCNMk-prHTFJ3M52-0YSf8X78H3lFF1fPMb2GeFHr-gQpLKK9qDfefwoYzzcKoXYY0qSipZsvnaY8HN_il1xJdV5q7wirCuBPxSOFwN0EIh4aPV4w',
    category: 'trees',
  },
];

export default function CartPage() {
  const { t } = useTranslation();
  const [cartItems, setCartItems] = useState<CartItem[]>(initialCartItems);

  const updateQuantity = (id: number, delta: number) => {
    setCartItems((items) =>
      items
        .map((item) =>
          item.id === id
            ? { ...item, quantity: Math.max(0, item.quantity + delta) }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeItem = (id: number) => {
    setCartItems((items) => items.filter((item) => item.id !== id));
  };

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const isEmpty = cartItems.length === 0;

  return (
    <div className="min-h-screen bg-background-dark text-white font-display pb-24">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-background-dark/95 backdrop-blur-md border-b border-white/10">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/products" className="flex items-center gap-2 text-white/70 hover:text-white">
              <span className="material-symbols-outlined">arrow_back</span>
              <span>{t.common.back}</span>
            </Link>
            <h1 className="text-lg font-bold">{t.cart.title}</h1>
            <div className="w-16" />
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        {isEmpty ? (
          <div className="text-center py-16">
            <span className="material-symbols-outlined text-6xl text-white/30 mb-4 block">
              shopping_cart
            </span>
            <h2 className="text-xl font-bold mb-2">{t.cart.empty.title}</h2>
            <p className="text-white/60 mb-6">
              {t.cart.empty.subtitle}
            </p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 bg-primary text-background-dark font-bold px-6 py-3 rounded-full hover:bg-primary/90 transition-all"
            >
              <span className="material-symbols-outlined">explore</span>
              {t.cart.empty.cta}
            </Link>
          </div>
        ) : (
          <>
            {/* Cart Items */}
            <div className="space-y-4 mb-8">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 p-4 rounded-xl bg-white/5 border border-white/10"
                >
                  {/* Image */}
                  <div
                    className="w-20 h-20 rounded-lg bg-cover bg-center flex-shrink-0"
                    style={{ backgroundImage: `url("${item.image}")` }}
                  />

                  {/* Details */}
                  <div className="flex-grow">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-xs text-white/50 uppercase">
                          {item.category}
                        </p>
                        <h3 className="font-semibold">{item.title}</h3>
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-white/40 hover:text-red-400 transition-colors"
                      >
                        <span className="material-symbols-outlined text-xl">
                          close
                        </span>
                      </button>
                    </div>

                    <div className="flex justify-between items-center mt-3">
                      {/* Quantity */}
                      <div className="flex items-center gap-2 bg-white/10 rounded-lg p-1">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="w-8 h-8 flex items-center justify-center rounded hover:bg-white/10"
                        >
                          <span className="material-symbols-outlined text-sm">
                            remove
                          </span>
                        </button>
                        <span className="w-8 text-center font-medium">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          className="w-8 h-8 flex items-center justify-center rounded hover:bg-white/10"
                        >
                          <span className="material-symbols-outlined text-sm">
                            add
                          </span>
                        </button>
                      </div>

                      {/* Price */}
                      <p className="font-bold text-primary">
                        ${item.price * item.quantity}
                        {item.priceLabel}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="border-t border-white/10 pt-6 space-y-4">
              <div className="flex justify-between text-lg">
                <span className="text-white/70">{t.cart.subtotal}</span>
                <span className="font-bold">${subtotal}</span>
              </div>
              <p className="text-sm text-white/50">
                {t.cart.taxes}
              </p>
            </div>

            {/* Checkout Button */}
            <div className="mt-8">
              <Link
                href="/checkout"
                className="w-full flex items-center justify-center gap-2 bg-primary text-background-dark font-bold py-4 rounded-full hover:bg-primary/90 transition-all"
              >
                <span className="material-symbols-outlined">lock</span>
                {t.cart.checkout}
              </Link>
              <p className="text-center text-xs text-white/40 mt-3">
                {t.cart.securePayment}
              </p>
            </div>
          </>
        )}
      </main>
      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
