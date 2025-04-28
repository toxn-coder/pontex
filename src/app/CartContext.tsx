'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
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
  const addToCart = (meal) => {
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
  const updateQuantity = (id, change) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: Math.max(1, item.quantity + change) } : item
      )
    );
  };

  // حذف منتج من السلة
  const removeItem = (id) => {
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

export const useCart = () => useContext(CartContext);