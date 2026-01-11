'use client';

import Link from 'next/link';
import { useCart } from '@/contexts/CartContext';
import { useTranslation } from '@/contexts/LanguageContext';

export function CartDrawer() {
  const { items, removeItem, updateQuantity, totalItems, totalPrice, isOpen, setIsOpen } = useCart();
  const { t } = useTranslation();

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
        onClick={() => setIsOpen(false)}
      />
      
      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-background-dark border-l border-white/10 z-50 flex flex-col animate-slide-in-right">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="material-symbols-outlined">shopping_cart</span>
            {t.cart.title} ({totalItems})
          </h2>
          <button 
            onClick={() => setIsOpen(false)}
            className="text-white/60 hover:text-white p-2"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        
        {/* Items */}
        <div className="flex-grow overflow-y-auto p-4">
          {items.length === 0 ? (
            <div className="text-center py-12">
              <span className="material-symbols-outlined text-5xl text-white/30 mb-4 block">
                shopping_cart
              </span>
              <p className="text-white/60 mb-4">{t.cart.empty.title}</p>
              <button
                onClick={() => setIsOpen(false)}
                className="text-primary hover:underline"
              >
                {t.cart.continueShopping}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div 
                  key={item.id}
                  className="flex gap-3 p-3 rounded-xl bg-white/5 border border-white/10"
                >
                  {/* Image */}
                  <div 
                    className="w-20 h-20 rounded-lg bg-cover bg-center flex-shrink-0"
                    style={{ backgroundImage: `url("${item.image}")` }}
                  />
                  
                  {/* Details */}
                  <div className="flex-grow min-w-0">
                    <div className="flex justify-between items-start gap-2">
                      <div className="min-w-0">
                        <p className="text-xs text-white/50 uppercase">{item.category}</p>
                        <h3 className="font-medium text-white text-sm truncate">{item.title}</h3>
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-white/40 hover:text-red-400 flex-shrink-0"
                      >
                        <span className="material-symbols-outlined text-lg">delete</span>
                      </button>
                    </div>
                    
                    <div className="flex justify-between items-center mt-2">
                      {/* Quantity */}
                      <div className="flex items-center gap-1 bg-white/10 rounded-lg">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-7 h-7 flex items-center justify-center hover:bg-white/10 rounded-l-lg"
                        >
                          <span className="material-symbols-outlined text-sm">remove</span>
                        </button>
                        <span className="w-6 text-center text-sm font-medium text-white">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => {
                            const success = updateQuantity(item.id, item.quantity + 1);
                            if (!success) {
                              alert(`${t.cart.onlyAvailable} ${item.stock}`);
                            }
                          }}
                          disabled={!item.isUnlimitedStock && item.stock !== undefined && item.quantity >= item.stock}
                          className="w-7 h-7 flex items-center justify-center hover:bg-white/10 rounded-r-lg disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          <span className="material-symbols-outlined text-sm">add</span>
                        </button>
                      </div>
                      
                      {/* Price */}
                      <p className="font-bold text-primary text-sm">
                        ${item.price * item.quantity}{item.priceLabel}
                      </p>
                    </div>
                    
                    {/* Stock indicator */}
                    {!item.isUnlimitedStock && item.stock !== undefined && (
                      <p className={`text-xs mt-1 ${item.quantity >= item.stock ? 'text-orange-400' : 'text-white/40'}`}>
                        {item.quantity >= item.stock ? t.cart.maxQuantity : `${item.stock - item.quantity} ${t.cart.moreAvailable}`}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-white/10 p-4 space-y-4">
            <div className="flex justify-between text-lg">
              <span className="text-white/70">{t.cart.subtotal}</span>
              <span className="font-bold text-white">${totalPrice}</span>
            </div>
            
            <div className="space-y-2">
              <Link
                href="/checkout"
                onClick={() => setIsOpen(false)}
                className="w-full flex items-center justify-center gap-2 bg-primary text-background-dark font-bold py-3 rounded-xl hover:bg-primary/90 transition-all"
              >
                <span className="material-symbols-outlined">lock</span>
                {t.cart.checkout}
              </Link>
              <button
                onClick={() => setIsOpen(false)}
                className="w-full text-center text-white/60 hover:text-white py-2 text-sm"
              >
                {t.cart.continueShopping}
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
