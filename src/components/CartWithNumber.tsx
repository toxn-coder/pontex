'use client';

import { useState } from 'react';
import { ShoppingCart, X, Minus, Plus, ChevronLeft, Trash2 } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import clsx from 'clsx';
import { useCart } from '@/app/CartContext';

interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

interface CartDialogProps {
  cartItems: CartItem[];
  totalPrice: number;
  totalItems: number;
  cartBadgeAnimation: boolean;
  updateQuantity: (id: string, delta: number) => void;
  removeItem: (id: string) => void;
}

export default function Cart() {
  const [open, setOpen] = useState(false);
  const { cartItems, totalPrice, totalItems, cartBadgeAnimation, updateQuantity, removeItem } = useCart();

  // رقم الهاتف للمكالمة
  const phoneNumber = 'tel:+201021466987';

  return (
    <>
      {/* زر عائم للسلة */}
      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Trigger asChild>
          <button className="fixed bottom-6 right-6 bg-gradient-to-r from-yellow-600 to-yellow-500 text-white p-3 rounded-full shadow-lg hover:from-yellow-700 hover:to-yellow-600 transition-all duration-200 transform hover:scale-105 z-50 flex items-center justify-center">
            <ShoppingCart className="w-6 h-6" />
            {totalItems > 0 && (
              <span
                className={clsx(
                  'absolute -top-1 -left-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center',
                  cartBadgeAnimation && 'animate-ping'
                )}
              >
                {totalItems}
              </span>
            )}
          </button>
        </Dialog.Trigger>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-fade-in" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white text-gray-800 rounded-xl shadow-2xl max-w-md w-full z-50 overflow-hidden animate-slide-up">
            <div className="bg-gradient-to-r from-yellow-600 to-yellow-500 p-4">
              <div className="flex justify-between items-center">
                <Dialog.Title className="text-xl font-bold text-white flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5" />
                  سلة المشتريات
                </Dialog.Title>
                <Dialog.Close asChild>
                  <button className="text-white p-1 rounded-full hover:bg-yellow-600 transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </Dialog.Close>
              </div>
              <Dialog.Description className="text-gray-100 text-sm mt-1">
                قم بمراجعة طلبك
              </Dialog.Description>
            </div>

            <div className="p-4 max-h-[60vh] overflow-y-auto">
              {cartItems.length === 0 ? (
                <div className="text-center py-10">
                  <div className="flex justify-center mb-4">
                    <ShoppingCart className="w-16 h-16 text-gray-300" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-500">سلة المشتريات فارغة</h3>
                  <p className="text-gray-400 mt-2">أضف بعض العناصر اللذيذة إلى سلتك</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex gap-3 border-b border-gray-100 pb-4">
                      <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-grow">
                        <div className="flex justify-between">
                          <h4 className="font-medium">{item.name}</h4>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="text-gray-400 hover:text-red-500 p-1 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="text-yellow-600 font-medium mt-1">{item.price} جنيه</div>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center bg-gray-100 rounded-lg">
                            <button
                              onClick={() => updateQuantity(item.id, 1)}
                              className="p-1 text-gray-500 hover:text-yellow-600"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                            <span className="px-3 font-medium">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, -1)}
                              className="p-1 text-gray-500 hover:text-yellow-600"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="font-bold">{item.price * item.quantity} جنيه</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="border-t border-gray-200 bg-gray-50 p-4">
              <div className="flex justify-between items-center mb-4">
                <span className="text-gray-600">المجموع:</span>
                <span className="font-bold text-lg">{totalPrice} جنيه</span>
              </div>
              {cartItems.length > 0 && (
                <a
                  href={phoneNumber}
                  className="w-full block text-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors mb-2"
                >
                  اطلب الآن
                </a>
              )}
              <Dialog.Close asChild>
                <button className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition flex items-center justify-center gap-2">
                  متابعة التسوق
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </Dialog.Close>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}