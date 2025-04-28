'use client';

import { useEffect, useState } from 'react';
import { ShoppingCart, X, Minus, Plus, ChevronLeft, Trash2 } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import clsx from 'clsx';
import { useCart } from '@/app/CartContext';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const [scrolling, setScrolling] = useState(false);
  const [open, setOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { cartItems, totalPrice, totalItems, cartBadgeAnimation, updateQuantity, removeItem } = useCart();
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setScrolling(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <header
        className={clsx(
          'sticky top-0 w-full z-50 px-4 py-4 shadow-md transition-all duration-300',
          scrolling ? 'bg-[#1f1f1f]/90 backdrop-blur-md shadow-lg' : 'bg-[#1f1f1f]'
        )}
      >
        <nav>
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            {/* زر القائمة للشاشات الصغيرة */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden flex flex-col gap-1.5 p-2"
              aria-label="فتح القائمة"
            >
              <span
                className={clsx(
                  'block w-6 h-0.5 bg-white rounded-full transition-all duration-300',
                  isMenuOpen && 'transform rotate-45 translate-y-2'
                )}
              ></span>
              <span
                className={clsx(
                  'block w-6 h-0.5 bg-white rounded-full transition-all duration-300',
                  isMenuOpen && 'opacity-0'
                )}
              ></span>
              <span
                className={clsx(
                  'block w-6 h-0.5 bg-white rounded-full transition-all duration-300',
                  isMenuOpen && 'transform -rotate-45 -translate-y-2'
                )}
              ></span>
            </button>

            {/* روابط التنقل */}
            <div
              className={clsx(
                'flex items-center gap-6 font-medium transition-opacity duration-300',
                isMenuOpen
                  ? 'absolute top-full right-0 left-0 flex flex-col bg-[#1f1f1f] shadow-lg p-4 gap-4 border-t border-gray-700'
                  : 'hidden lg:flex'
              )}
            >
              <Link
                href="/"
                className={clsx(
                  'relative text-white hover:text-yellow-400 transition-colors py-2',
                  pathname === '/' && 'text-yellow-400',
                  pathname === '/' && 'border-b-2 border-yellow-400'
                )}
              >
                الرئيسية
              </Link>
              <Link
                href="/menu"
                className={clsx(
                  'relative text-white hover:text-yellow-400 transition-colors py-2',
                  pathname === '/menu' && 'text-yellow-400',
                  pathname === '/menu' && 'border-b-2 border-yellow-400'
                )}
              >
                قائمة الطعام
              </Link>
              <Link
                href="/about"
                className={clsx(
                  'relative text-white hover:text-yellow-400 transition-colors py-2',
                  pathname === '/about' && 'text-yellow-400',
                  pathname === '/about' && 'border-b-2 border-yellow-400'
                )}
              >
                عن المطعم
              </Link>
              <Link
                href="/contact"
                className={clsx(
                  'relative text-white hover:text-yellow-400 transition-colors py-2',
                  pathname === '/contact' && 'text-yellow-400',
                  pathname === '/contact' && 'border-b-2 border-yellow-400'
                )}
              >
                اتصل بنا
              </Link>
              <Link
                href="/branches"
                className={clsx(
                  'relative text-white hover:text-yellow-400 transition-colors py-2',
                  pathname === '/branches' && 'text-yellow-400',
                  pathname === '/branches' && 'border-b-2 border-yellow-400'
                )}
              >
                الفروع
              </Link>
            </div>

            {/* شعار المطعم */}
            <div
              className={clsx(
                'text-2xl font-bold flex items-center transition-all duration-300 ease-in-out',
                scrolling  

 ? 'scale-95' : 'scale-100'
              )}
            >
              <span className="text-yellow-500">شاورما السوري</span>
              <span className="text-white mx-2">|</span>
              <span className="text-sm text-gray-300 hidden md:inline-block">أشهى المأكولات السورية</span>
            </div>

            {/* أيقونة السلة في Navbar */}
            <div className={clsx('relative', scrolling && 'lg:hidden')}>
              <Dialog.Root open={open} onOpenChange={setOpen}>
                <Dialog.Trigger asChild>
                  <button className="p-2 hover:bg-gray-800 rounded-full transition-colors">
                    <ShoppingCart className="w-6 h-6 text-white hover:text-yellow-400 transition-colors" />
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
                <CartDialog
                  cartItems={cartItems}
                  totalPrice={totalPrice}
                  updateQuantity={updateQuantity}
                  removeItem={removeItem}
                />
              </Dialog.Root>
            </div>
          </div>
        </nav>
      </header>

      {/* زر عائم للسلة يظهر عند التمرير */}
      {scrolling && (
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
          <CartDialog
            cartItems={cartItems}
            totalPrice={totalPrice}
            updateQuantity={updateQuantity}
            removeItem={removeItem}
          />
        </Dialog.Root>
      )}
    </>
  );
}

function CartDialog({ cartItems, totalPrice, updateQuantity, removeItem }) {
  return (
    <Dialog.Portal>
      <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-fade-in" />
      <Dialog.Content
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white text-gray-800 rounded-xl shadow-2xl max-w-md w-full z-50 overflow-hidden animate-slide-up"
      >
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
          <Dialog.Close asChild>
            <button className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition flex items-center justify-center gap-2">
              متابعة التسوق
              <ChevronLeft className="w-4 h-4" />
            </button>
          </Dialog.Close>
        </div>
      </Dialog.Content>
    </Dialog.Portal>
  );
}