'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// تعريف واجهة لنوع القيم التي سيوفرها الـ Context
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
}

// إنشاء الـ Context مع قيمة افتراضية
const CartContext = createContext<CartContextType>({
  cartItems: [],
  totalPrice: 0,
  totalItems: 0,
  cartBadgeAnimation: false,
  addToCart: () => {},
  updateQuantity: () => {},
  removeItem: () => {},
});

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartBadgeAnimation, setCartBadgeAnimation] = useState(false);

  // تحميل البيانات من localStorage على العميل فقط
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedCart = localStorage.getItem('cartItems');
      if (savedCart) {
        setCartItems(JSON.parse(savedCart));
      }
    }
  }, []); // يتم تنفيذ هذا مرة واحدة عند تحميل المكون

  // حفظ cartItems في localStorage عند كل تغيير
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('cartItems', JSON.stringify(cartItems));
    }
  }, [cartItems]);

  // حساب إجمالي السعر والكمية
  const totalPrice = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // تأثير الشارة عند تغيير عناصر السلة
  useEffect(() => {
    if (cartItems.length > 0) {
      setCartBadgeAnimation(true);
      const timer = setTimeout(() => setCartBadgeAnimation(false), 500);
      return () => clearTimeout(timer);
    }
  }, [cartItems]);

  // إضافة عنصر إلى السلة
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
          image: meal.image || 'https://res.cloudinary.com/do88eynar/image/upload/v1745645765/iyucm5jdwndkigern2ng.webp',
        },
      ];
    });
  };

  // تغيير كمية منتج
  const updateQuantity = (id: number | string, change: number) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: Math.max(1, item.quantity + change) } : item
      )
    );
  };

  // حذف منتج من السلة
  const removeItem = (id: number | string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
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