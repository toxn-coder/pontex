'use client';

import { useState } from 'react';
import { ShoppingCart, X, Minus, Plus, ChevronLeft, Trash2 } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import clsx from 'clsx';
import { useCart } from '@/app/CartContext';

export default function Cart() {
  const [open, setOpen] = useState(false);
  const {
    cartItems,
    totalItems,
    cartBadgeAnimation,
    updateQuantity,
    removeItem,
    clearCart, // ✅ تمت إضافته هنا
  } = useCart();

  // رسالة واتساب
  const createWhatsAppMessage = () => {
    const itemsList = cartItems
      .map((item) => `${item.name} (الكمية: ${item.quantity})`)
      .join('\n\n');
    const message = `طلب جديد:\n\n${itemsList}\n\nيرجى تأكيد الطلب أو تحديد طريقة التوصيل.\n`;
    return encodeURIComponent(message);
  };

  const whatsappLink = `https://wa.me/201032334587?text=${createWhatsAppMessage()}`;

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      {/* زر السلة داخل الـNavbar */}
      <Dialog.Trigger asChild>
        <button className="relative flex items-center justify-center group">
  {/* خلفية شفافة وفلتر لتوضيح الأيقونة */}
  <div
    className={clsx(
      "w-[34px] h-[34px] rounded-full flex items-center justify-center transition-all duration-300 shadow-md",
      "bg-white backdrop-blur-sm group-hover:bg-gray-100",
      "dark:bg-white dark:backdrop-blur-lg"
    )}
  >
    {/* الأيقونة */}
    <div
      className="w-[20px] h-[20px] bg-[#511514] dark:bg-bg-[#511514] transition-all duration-200 group-hover:scale-110"
      style={{
        maskImage: "url('/cart.svg')",
        WebkitMaskImage: "url('/cart.svg')",
        maskRepeat: "no-repeat",
        WebkitMaskRepeat: "no-repeat",
        maskSize: "contain",
        WebkitMaskSize: "contain",
        maskPosition: "center",
        WebkitMaskPosition: "center",
      }}
    ></div>
    </div>

          {/* شارة عدد العناصر */}
          {totalItems > 0 && (
            <span
              className={clsx(
                'absolute -top-2 left-7 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center z-50',
                cartBadgeAnimation && 'animate-ping'
              )}
            >
              {totalItems}
            </span>
          )}
        </button>
      </Dialog.Trigger>

      {/* محتوى السلة */}
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[999] animate-fade-in" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white text-gray-800 rounded-xl shadow-2xl max-w-md w-full z-[1000] overflow-hidden animate-slide-up">
          {/* الرأس */}
          <div className="bg-gradient-to-r from-[#511514] to-[#a0392a] p-4">
            <div className="flex justify-between items-center">
              <Dialog.Title className="text-xl font-bold text-white flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" />
                سلة المشتريات
              </Dialog.Title>
              <Dialog.Close asChild>
                <button className="text-white p-1 rounded-full hover:bg-[#a0392a] transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </Dialog.Close>
            </div>
            <Dialog.Description className="text-gray-100 text-sm mt-1">
              قم بمراجعة طلبك
            </Dialog.Description>
          </div>

          {/* العناصر */}
          <div className="p-4 max-h-[60vh] overflow-y-auto">
            {cartItems.length === 0 ? (
              <div className="text-center py-10">
                <div className="flex justify-center mb-4">
                  <ShoppingCart className="w-16 h-16 text-gray-300" />
                </div>
                <h3 className="text-lg font-medium text-gray-500">
                  سلة المشتريات فارغة
                </h3>
                <p className="text-gray-400 mt-2">
                  أضف بعض العناصر اللذيذة إلى سلتك
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-3 border-b border-gray-100 pb-4"
                  >
                    <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden shadow-md">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-grow">
                      <div className="flex justify-between">
                        <h4 className="font-medium">{item.name}</h4>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-gray-400 hover:text-red-500 p-1 transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
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
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* المجموع + الأزرار */}
          <div className="border-t border-gray-200 bg-gray-50 p-4">
            {cartItems.length > 0 && (
              <>
                {/* زر الطلب عبر واتساب */}
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full block text-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors mb-2"
                >
                  اطلب الآن عبر WhatsApp
                </a>

                {/* زر إفراغ السلة */}
                <button
                  onClick={clearCart}
                  className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition mb-2 flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  إفراغ السلة
                </button>
              </>
            )}

            {/* متابعة التسوق */}
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
  );
}
