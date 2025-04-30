'use client';

import { useEffect, useState } from 'react';
import clsx from 'clsx';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const [scrolling, setScrolling] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setScrolling(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
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
              scrolling ? 'scale-95' : 'scale-100'
            )}
          >
            <span className="text-yellow-500">شاورما السوري</span>
            <span className="text-white mx-2">|</span>
            <span className="text-sm text-gray-300 hidden md:inline-block">أشهى المأكولات السورية</span>
          </div>
        </div>
      </nav>
    </header>
  );
}