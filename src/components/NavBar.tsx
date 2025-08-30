'use client';

import { db } from '@/app/api/firebase';
import clsx from 'clsx';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

interface Notification {
  title: string;
  body: string;
  url: string;
  createdAt: any;
}

interface NavbarProps {
  name: string;
  logoUrl: string;
}

export default function Navbar({ name, logoUrl }: NavbarProps) {
  const [scrolling, setScrolling] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [, setNotifications] = useState<Notification[]>([]);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setScrolling(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const q = query(collection(db, 'notifications'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => doc.data() as Notification);
      setNotifications(data);
    });
    return () => unsubscribe();
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
            aria-label="منتجاتنا"
          >
            <span className="block w-6 h-0.5 bg-white rounded-full"></span>
            <span className="block w-6 h-0.5 bg-white rounded-full"></span>
            <span className="block w-6 h-0.5 bg-white rounded-full"></span>
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
            {[
              { href: '/', label: 'الرئيسية' },
              { href: '/products', label: 'تسوق' },
              { href: '/about', label: 'حول' },
              { href: '/contact', label: 'اتصل بنا' },
              { href: '/branches', label: 'الفروع' }
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={clsx(
                  'relative text-white hover:text-yellow-400 transition-colors py-2',
                  pathname === link.href && 'text-yellow-400 border-b-2 border-yellow-400'
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* شعار المطعم */}
          <div
            className={clsx(
              'text-2xl font-bold flex items-center transition-all duration-300 ease-in-out gap-2',
              scrolling ? 'scale-95' : 'scale-100'
            )}
          >
            <img src={logoUrl} alt={name} className="w-10 h-10 mr-2 rounded object-contain" />
            <span className="text-yellow-500">{name}</span>
          </div>
        </div>
      </nav>
    </header>
  );
}
