'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Facebook, Instagram, Twitter, MessageCircle, MapPin, Phone, Mail, Clock } from 'lucide-react';
import { db } from '@/app/api/firebase';
import { doc, getDoc } from 'firebase/firestore';

// واجهة لنوع البيانات المتوقع من Firestore
interface ContactInfo {
  facebook: string;
  instagram: string;
  twitter: string;
  whatsapp: string;
  phones: string[];
  emails: string[];
}

const Footer = () => {
  const [contactInfo, setContactInfo] = useState<ContactInfo>({
    facebook: '',
    instagram: '',
    twitter: '',
    whatsapp: '',
    phones: [],
    emails: [],
  });
  const [isPWA, setIsPWA] = useState(false); // حالة لتتبع وضع PWA

  // جلب البيانات من Firestore
  useEffect(() => {
    const fetchContactInfo = async () => {
      try {
        const docRef = doc(db, 'settings', 'contactInfo');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setContactInfo({
            facebook: typeof data.facebook === 'string' ? data.facebook : '',
            instagram: typeof data.instagram === 'string' ? data.instagram : '',
            twitter: typeof data.twitter === 'string' ? data.twitter : '',
            whatsapp: typeof data.whatsapp === 'string' ? data.whatsapp : '',
            phones: Array.isArray(data.phones) ? data.phones : [],
            emails: Array.isArray(data.emails) ? data.emails : [],
          });
        }
      } catch (error) {
        console.error('Error fetching contact info:', error);
      }
    };
    fetchContactInfo();
  }, []);

  // التحقق من وضع PWA
  useEffect(() => {
    // التحقق مما إذا كان التطبيق يعمل في وضع standalone (PWA مثبت)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    setIsPWA(isStandalone);

    // مراقبة التغييرات في وضع العرض (اختياري، في حالة تغيير الوضع أثناء التشغيل)
    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    const handleChange = (e: MediaQueryListEvent) => {
      setIsPWA(e.matches);
    };
    mediaQuery.addEventListener('change', handleChange);

    // تنظيف المستمع عند تفريغ المكون
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  // إذا كان التطبيق في وضع PWA، لا يتم عرض الـ footer
  if (isPWA) {
    return null;
  }

  return (
    <footer className="bg-gradient-to-r from-[var(--clr-dark-red)] to-[var(--clr-primary)] text-white">
      <div className="bg-[var(--clr-primary)] py-3">
        <div className="container mx-auto px-4 flex justify-center md:justify-between items-center flex-wrap">
          <div className="text-center md:text-right mb-4 md:mb-0">
            <h3 className="text-xl font-bold">احصل على أشهى الشاورما! اطلب الآن</h3>
          </div>
          <div className="flex gap-4">
            <Link href="/contact" className="bg-amber-600 text-white px-6 py-2 rounded-full inline-block hover:bg-amber-500 transition">
              تواصل معنا
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* شعار ووصف */}
          <div className="text-center md:text-right">
            <div className="flex justify-center md:justify-start mb-4">
              <div className="relative w-48 h-16">
              <Image
  src="/logo.png"
  alt="شعار مطعم الشاورما الأصيل"
  width={50}
  height={50}
  style={{ width: '50px', height: 'auto' }}
  className="object-contain rounded"
/>
              </div>
            </div>
            <p className="text-gray-200 mb-4">
              نقدم ألذ وأشهى أصناف الشاورما الأصلية بنكهات شرقية مميزة. نحرص على استخدام أفضل المكونات الطازجة لضمان تجربة طعام لا تُنسى.
            </p>
            <div className="flex gap-3 justify-center md:justify-start">
              {contactInfo.facebook && (
                <Link href={contactInfo.facebook} target="_blank" rel="noopener noreferrer" className="bg-white text-amber-800 p-2 rounded-full hover:bg-amber-100 transition">
                  <Facebook size={20} />
                </Link>
              )}
              {contactInfo.instagram && (
                <Link href={contactInfo.instagram} target="_blank" rel="noopener noreferrer" className="bg-white text-amber-800 p-2 rounded-full hover:bg-amber-100 transition">
                  <Instagram size={20} />
                </Link>
              )}
              {contactInfo.twitter && (
                <Link href={contactInfo.twitter} target="_blank" rel="noopener noreferrer" className="bg-white text-amber-800 p-2 rounded-full hover:bg-amber-100 transition">
                  <Twitter size={20} />
                </Link>
              )}
              {contactInfo.whatsapp && (
                <Link href={contactInfo.whatsapp} target="_blank" rel="noopener noreferrer" className="bg-white text-amber-800 p-2 rounded-full hover:bg-amber-100 transition">
                  <MessageCircle size={20} />
                </Link>
              )}
            </div>
          </div>

          {/* روابط سريعة */}
          <div className="text-center md:text-right">
            <h3 className="text-xl font-bold mb-4 border-b border-amber-600 pb-2">روابط سريعة</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-200 hover:text-white transition">
                  الرئيسية
                </Link>
              </li>
              <li>
                <Link href="/menu" className="text-gray-200 hover:text-white transition">
                  قائمة الطعام
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-200 hover:text-white transition">
                  من نحن
                </Link>
              </li>
              <li>
                <Link href="/branches" className="text-gray-200 hover:text-white transition">
                  فروعنا
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-200 hover:text-white transition">
                  اتصل بنا
                </Link>
              </li>
            </ul>
          </div>

          {/* ساعات العمل */}
          <div className="text-center md:text-right">
            <h3 className="text-xl font-bold mb-4 border-b border-amber-600 pb-2">ساعات العمل</h3>
            <ul className="space-y-2">
              <li className="flex items-center justify-center md:justify-start gap-2">
                <Clock className="text-amber-400" size={18} />
                <span>صباحاً 8:00 - 4:00 الفجر</span>
              </li>
            </ul>
            <div className="mt-6">
              <h4 className="font-bold mb-2">خدمة التوصيل</h4>
              <p>نوفر خدمة توصيل سريعة لكافة الطلبات</p>
              <p>تواصل معنا عبر الواتساب أو اتصل بنا</p>
            </div>
          </div>

          {/* معلومات الاتصال */}
          <div className="text-center md:text-right">
            <h3 className="text-xl font-bold mb-4 border-b border-amber-600 pb-2">تواصل معنا</h3>
            <ul className="space-y-4">
              <li className="flex items-center justify-center md:justify-start gap-2">
                <MapPin className="text-amber-400" size={18} />
                <span> كفر الشيخ -شارع إبراهيم المغازي تقسيم 2 أمام بيتزا بان</span>
              </li>
              {contactInfo.phones && contactInfo.phones.length > 0 && (
                <li className="flex items-center justify-center md:justify-start gap-2">
                  <Phone className="text-amber-400" size={18} />
                  <div>
                    {contactInfo.phones.map((phone, index) => (
                      <span key={index} className="block" dir="ltr">
                        <a href={`tel:${phone}`} className="text-gray-200 hover:text-white transition">
                          {phone}
                        </a>
                      </span>
                    ))}
                  </div>
                </li>
              )}
              {contactInfo.emails && contactInfo.emails.length > 0 && (
                <li className="flex items-center justify-center md:justify-start gap-2">
                  <Mail className="text-amber-400" size={18} />
                  <div>
                    {contactInfo.emails.map((email, index) => (
                      <span key={index} className="block">
                        {email}
                      </span>
                    ))}
                  </div>
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>

      <div className="bg-[var(--clr-dark-red)] py-4">
        <div className="container mx-auto px-4 text-center">
          <p>جميع الحقوق محفوظة © {new Date().getFullYear()} مطعم والي دمشق</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;