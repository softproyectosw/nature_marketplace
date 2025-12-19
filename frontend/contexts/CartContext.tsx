'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface CartItem {
  id: number;
  title: string;
  price: number;
  priceLabel: string;
  quantity: number;
  image: string;
  category: string;
  slug: string;
  stock?: number; // Available stock (undefined = unlimited)
  isUnlimitedStock?: boolean;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'>, quantity?: number) => boolean;
  removeItem: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => boolean;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  getItemQuantity: (id: number) => number;
  canAddMore: (id: number, stock?: number, isUnlimited?: boolean) => boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('nature_cart');
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch {
        localStorage.removeItem('nature_cart');
      }
    }
    setIsHydrated(true);
  }, []);

  // Save cart to localStorage on change
  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem('nature_cart', JSON.stringify(items));
    }
  }, [items, isHydrated]);

  const getItemQuantity = (id: number): number => {
    const item = items.find((i) => i.id === id);
    return item?.quantity || 0;
  };

  const canAddMore = (id: number, stock?: number, isUnlimited?: boolean): boolean => {
    if (isUnlimited) return true;
    if (stock === undefined) return true;
    const currentQty = getItemQuantity(id);
    return currentQty < stock;
  };

  const addItem = (newItem: Omit<CartItem, 'quantity'>, quantity: number = 1): boolean => {
    const currentQty = getItemQuantity(newItem.id);
    const requestedTotal = currentQty + quantity;
    
    // Check stock limit
    if (!newItem.isUnlimitedStock && newItem.stock !== undefined) {
      if (requestedTotal > newItem.stock) {
        return false; // Cannot add more than stock
      }
    }
    
    setItems((currentItems) => {
      const existingItem = currentItems.find((item) => item.id === newItem.id);
      if (existingItem) {
        return currentItems.map((item) =>
          item.id === newItem.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...currentItems, { ...newItem, quantity }];
    });
    setIsOpen(true);
    return true;
  };

  const removeItem = (id: number) => {
    setItems((currentItems) => currentItems.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: number, quantity: number): boolean => {
    if (quantity <= 0) {
      removeItem(id);
      return true;
    }
    
    const item = items.find((i) => i.id === id);
    if (!item) return false;
    
    // Check stock limit
    if (!item.isUnlimitedStock && item.stock !== undefined) {
      if (quantity > item.stock) {
        return false; // Cannot exceed stock
      }
    }
    
    setItems((currentItems) =>
      currentItems.map((i) =>
        i.id === id ? { ...i, quantity } : i
      )
    );
    return true;
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
        isOpen,
        setIsOpen,
        getItemQuantity,
        canAddMore,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
