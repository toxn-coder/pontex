'use client';

import clsx from 'clsx';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import { X, Menu } from 'lucide-react';
import Cart from './Cart';

interface NavbarProps {
  name: string;
  logoUrl: string;
}

export default function Navbar({ name, logoUrl }: NavbarProps) {
  const [scrolling, setScrolling] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const pathname = usePathname();

  // معالجة التمرير
  useEffect(() => {
    const handleScroll = () => {
      setScrolling(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // إغلاق القائمة عند النقر خارجها
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isMenuOpen &&
        menuRef.current &&
        buttonRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMenuOpen]);

  // إغلاق القائمة عند الضغط على Escape
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isMenuOpen) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isMenuOpen]);

  // منع التمرير عند فتح القائمة
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  const navLinks = [
    { href: '/', label: 'الرئيسية' },
    { href: '/products', label: 'منتجاتنا' },
    { href: '/about', label: 'من نحن' },
    { href: '/contact', label: 'اتصل بنا' },
    { href: '/production', label: 'الإنتاج' }
  ];

  return (
    <>
      <header
        className={clsx(
          'fixed top-0 w-full z-50 px-4 sm:px-6 py-3 transition-all duration-300 font-Bukra',
          scrolling 
            ? 'bg-[#511514]/95 backdrop-blur-lg shadow-xl' 
            : 'bg-transparent'
        )}
      >
        <nav className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            {/* زر القائمة للشاشات الصغيرة */}
            <button
              ref={buttonRef}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={clsx(
                'lg:hidden w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95',
                scrolling 
                  ? 'bg-white/10 hover:bg-white/20' 
                  : 'bg-[#511514]/10 hover:bg-[#511514]/20'
              )}
              aria-label="قائمة التنقل"
              aria-expanded={isMenuOpen}
            >
              {isMenuOpen ? (
                <X className={clsx("w-5 h-5", scrolling ? 'text-white' : 'text-[#511514]')} />
              ) : (
                <Menu className={clsx("w-5 h-5", scrolling ? 'text-white' : 'text-[#511514]')} />
              )}
            </button>

            {/* روابط التنقل - Desktop */}
            <div className="hidden lg:flex items-center gap-1">
              <Cart />
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={clsx(
                    'relative px-4 py-2 rounded-lg font-bold text-sm transition-all duration-300 group font-Bukra',
                    pathname === link.href
                      ? scrolling
                        ? 'text-white bg-white/10'
                        : 'text-[#511514] bg-[#511514]/10'
                      : scrolling
                        ? 'text-white/80 hover:text-white hover:bg-white/10'
                        : 'text-[#511514]/80 hover:text-[#511514] hover:bg-[#511514]/10'
                  )}
                >
                  {link.label}
                  {pathname === link.href && (
                    <span className={clsx(
                      "absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-0.5 rounded-full",
                      scrolling ? 'bg-white' : 'bg-[#511514]'
                    )}></span>
                  )}
                </Link>
              ))}
            </div>

            {/* الشعار */}
            <Link
              href="/"
              className={clsx(
                'flex items-center gap-3 transition-all duration-300 hover:scale-105 active:scale-95 group',
                scrolling ? 'scale-95' : 'scale-100'
              )}
            >
              <span className={clsx(
                "text-xl sm:text-2xl font-bold name-logo transition-colors duration-300",
                scrolling ? 'text-white' : 'text-[#511514]'
              )}>
                {name}
              </span>
              <div className="relative">
                <div className={clsx(
                  "absolute inset-0 rounded-full blur-md opacity-0 group-hover:opacity-30 transition-opacity duration-300",
                  scrolling ? 'bg-white' : 'bg-[#511514]'
                )}></div>
                <Image
                  src={logoUrl}
                  alt={name}
                  width={44}
                  height={44}
                  className="relative rounded-full object-contain border-2 border-white/20 shadow-lg"
                  priority
                />
              </div>
            </Link>
          </div>
        </nav>
      </header>

      {/* Overlay للموبايل */}
      <div
        className={clsx(
          'fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300',
          isMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={() => setIsMenuOpen(false)}
      />

      {/* القائمة الجانبية للموبايل */}
      <div
        ref={menuRef}
        className={clsx(
          'fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-gradient-to-br from-[#511514] via-[#612018] to-[#511514] z-50 lg:hidden transition-transform duration-300 shadow-2xl',
          isMenuOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        <div className="flex flex-col h-full">
          {/* هيدر القائمة */}
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <div className="flex items-center gap-3">
              <Image
                src={logoUrl}
                alt={name}
                width={40}
                height={40}
                className="rounded-full border-2 border-white/20"
              />
              <span className="text-white text-xl font-bold">{name}</span>
            </div>
            <button
              onClick={() => setIsMenuOpen(false)}
              className="w-9 h-9 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
              aria-label="إغلاق القائمة"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* روابط التنقل */}
          <div className="flex-1 overflow-y-auto p-4 font-Bukra">
            <div className="space-y-2">
              {navLinks.map((link, index) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={clsx(
                    'flex items-center gap-3 px-4 py-3.5 rounded-xl font-bold text-base transition-all duration-300 group relative overflow-hidden font-Bukra',
                    pathname === link.href
                      ? 'bg-white/15 text-white shadow-lg'
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                  )}
                  style={{
                    animationDelay: `${index * 50}ms`,
                    animation: isMenuOpen ? 'slideInRight 0.3s ease-out forwards font-Bukra' : 'none'
                  }}
                >
                  {/* خط جانبي للصفحة النشطة */}
                  {pathname === link.href && (
                    <span className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-full"></span>
                  )}
                  
                  <span className="relative z-10">{link.label}</span>
                  
                  {/* تأثير hover */}
                  <span className="absolute inset-0 bg-white/5 scale-x-0 group-hover:scale-x-100 transition-transform origin-right duration-300"></span>
                </Link>
              ))}
            </div>
          </div>

          {/* السلة في القائمة الجانبية */}
          <div className="p-4 border-t border-white/10">
            <div onClick={() => setIsMenuOpen(false)}>
              <Cart />
            </div>
          </div>
        </div>
      </div>

      {/* Animation Styles */}
      <style jsx global>{`
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        /* تحسين Scrollbar */
        .overflow-y-auto::-webkit-scrollbar {
          width: 6px;
        }
        .overflow-y-auto::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .overflow-y-auto::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 10px;
        }
        .overflow-y-auto::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }
      `}</style>
    </>
  );
}