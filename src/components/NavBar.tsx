'use client';

import clsx from 'clsx';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Image from 'next/image'; // ✅ استيراد مكوّن الصورة
import Cart from './Cart';


interface NavbarProps {
  name: string;
  logoUrl: string;
}

export default function Navbar({ name, logoUrl }: NavbarProps) {
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
        'fixed top-0 w-full z-50 px-2 py-2 shadow-md transition-all duration-300 font-Bukra',
        scrolling ? 'text-gray-600 backdrop-blur-md bg-[#511514] shadow-lg' : 'bg-[transparent]  shadow-none'
      )}
    >
      <nav>
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          {/* زر القائمة للشاشات الصغيرة */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden flex flex-col gap-1.5 p-2"
            aria-label="منتجاتنا"
          >
            <span className={clsx("block w-6 h-0.5 rounded-full transition-colors duration-300", scrolling ? 'bg-white' : 'bg-[#511514]')}></span>
            <span className={clsx("block w-6 h-0.5 rounded-full transition-colors duration-300", scrolling ? 'bg-white' : 'bg-[#511514]')}></span>
            <span className={clsx("block w-6 h-0.5 rounded-full transition-colors duration-300", scrolling ? 'bg-white' : 'bg-[#511514]')}></span>
          </button>

          {/* روابط التنقل */}
          <div
            className={clsx(
              'flex items-center gap-6 font-medium transition-opacity duration-300',
              isMenuOpen
                ? 'absolute top-full right-0 left-0 flex flex-col bg-[#511514] shadow-lg p-4 gap-4 border-t border-gray-700'
                : 'hidden lg:flex'
            )}
          >
            <Cart />
            {[
              { href: '/', label: 'الرئيسية' },
              { href: '/products', label: 'منتجاتنا' },
              { href: '/about', label: 'من نحن' },
              { href: '/contact', label: 'اتصل بنا' },
              { href: '/production', label: 'الأنتاج' }
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={clsx(
                  'relative transition-colors py-2 font-Bukra font-bold',
                  scrolling 
                    ? 'text-white hover:text-gray-300' 
                    : 'text-[#a0392a] hover:text-[#e95640]',
                  pathname === link.href && 
                    (scrolling 
                      ? 'text-gray-300 border-b-2 border-white' 
                      : 'text-[#e95640] border-b-2 border-[#e95640]'
                    )
                )}
              >
                {link.label}
              </Link>
            ))}
            
          </div>

          {/* شعار  */}
          <div
            className={clsx(
              'text-2xl font-bold flex items-center transition-all duration-300 ease-in-out gap-2',
              scrolling ? 'scale-95' : 'scale-100'
            )}
          >
            <span className={clsx("transition-colors duration-300 name-logo ", scrolling ? 'text-white' : 'text-[#511514]')}>{name}</span>
            <Image
              src={logoUrl}
              alt={name}
              width={40}   // ✅ لازم تحدد العرض
              height={40}  // ✅ لازم تحدد الطول
              className="mr-2 rounded-full object-contain"
            />
          </div>
        </div>
      </nav>
    </header>
  );
}
