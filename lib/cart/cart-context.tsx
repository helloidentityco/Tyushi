'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface CartItem {
  productId: string;
  name: string;
  slug: string;
  collectionName: string;
  categoryName: string;
  imageUrl: string;
  regularPrice: number;
  effectivePrice: number;
  quantity: number;
  isPremium?: boolean;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  isDrawerOpen: boolean;
  setIsDrawerOpen: (open: boolean) => void;
  totalCount: number;
  subtotal: number;
  discountTotal: number;
  totalAmount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('km_cart_items');
        if (stored) {
          return JSON.parse(stored);
        }
      } catch {}
    }
    return [];
  });
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Save cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('km_cart_items', JSON.stringify(items));
    } catch {}
  }, [items]);

  const addItem = (item: Omit<CartItem, 'quantity'>, quantityToAdd = 1) => {
    setItems((prev) => {
      const existingIndex = prev.findIndex((i) => i.productId === item.productId);
      if (existingIndex > -1) {
        const next = [...prev];
        next[existingIndex] = {
          ...next[existingIndex],
          quantity: next[existingIndex].quantity + quantityToAdd,
          effectivePrice: item.effectivePrice, // refresh price
          regularPrice: item.regularPrice,
        };
        return next;
      } else {
        return [...prev, { ...item, quantity: quantityToAdd }];
      }
    });
    setIsDrawerOpen(true);
  };

  const removeItem = (productId: string) => {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }
    setItems((prev) =>
      prev.map((i) => (i.productId === productId ? { ...i, quantity } : i))
    );
  };

  const clearCart = () => {
    setItems([]);
    try {
      localStorage.removeItem('km_cart_items');
    } catch {}
  };

  const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const subtotal = items.reduce(
    (sum, item) => sum + item.regularPrice * item.quantity,
    0
  );

  const totalAmount = items.reduce(
    (sum, item) => sum + item.effectivePrice * item.quantity,
    0
  );

  const discountTotal = Math.max(0, subtotal - totalAmount);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        isDrawerOpen,
        setIsDrawerOpen,
        totalCount,
        subtotal,
        discountTotal,
        totalAmount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
