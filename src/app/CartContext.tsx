'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface CartItem {
  id: number | string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface CartContextType {
  cartItems: CartItem[];
  totalPrice: number;
  totalItems: number;
  cartBadgeAnimation: boolean;
  addToCart: (meal: CartItem) => void;
  updateQuantity: (id: number | string, change: number) => void;
  removeItem: (id: number | string) => void;
  clearCart: () => void; // ✅ تمت الإضافة هنا
}

const CartContext = createContext<CartContextType>({
  cartItems: [],
  totalPrice: 0,
  totalItems: 0,
  cartBadgeAnimation: false,
  addToCart: () => {},
  updateQuantity: () => {},
  removeItem: () => {},
  clearCart: () => {}, // ✅ القيمة الافتراضية
});

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartBadgeAnimation, setCartBadgeAnimation] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedCart = localStorage.getItem('cartItems');
      if (savedCart) setCartItems(JSON.parse(savedCart));
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('cartItems', JSON.stringify(cartItems));
    }
  }, [cartItems]);

  const totalPrice = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    if (cartItems.length > 0) {
      setCartBadgeAnimation(true);
      const timer = setTimeout(() => setCartBadgeAnimation(false), 500);
      return () => clearTimeout(timer);
    }
  }, [cartItems]);

  const addToCart = (meal: CartItem) => {
    setCartItems((prev) => {
      const existingItem = prev.find((item) => item.name === meal.name);
      if (existingItem) {
        return prev.map((item) =>
          item.name === meal.name ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [
        ...prev,
        {
          id: meal.id || Date.now(),
          name: meal.name || 'بدون اسم',
          price: meal.price || 0,
          quantity: 1,
          image:
            meal.image ||
            'https://res.cloudinary.com/do88eynar/image/upload/v1745645765/iyucm5jdwndkigern2ng.webp',
        },
      ];
    });
  };

  const updateQuantity = (id: number | string, change: number) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: Math.max(1, item.quantity + change) } : item
      )
    );
  };

  const removeItem = (id: number | string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  const clearCart = () => {
    setCartItems([]); // ✅ تمسح كل العناصر
    localStorage.removeItem('cartItems');
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        totalPrice,
        totalItems,
        cartBadgeAnimation,
        addToCart,
        updateQuantity,
        removeItem,
        clearCart, 
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
