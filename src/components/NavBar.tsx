'use client';

import { useEffect, useState } from 'react';
import clsx from 'clsx';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { db } from '@/app/api/firebase';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { Bell } from 'lucide-react'; // أيقونة الجرس

interface Notification {
  title: string;
  body: string;
  url: string;
  createdAt: any;
}

export default function Navbar() {
  const [scrolling, setScrolling] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
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
            aria-label="فتح القائمة"
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
              { href: '/menu', label: 'قائمة الطعام' },
              { href: '/about', label: 'عن المطعم' },
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
              'text-2xl font-bold flex items-center transition-all duration-300 ease-in-out',
              scrolling ? 'scale-95' : 'scale-100'
            )}
          >
            <span className="text-yellow-500">اسم مطعمك</span>
            <span className="text-white mx-2">|</span>
            <span className="text-sm text-gray-300 hidden md:inline-block">أشهى المأكولات </span>
          </div>
        </div>
      </nav>
    </header>
  );
}
