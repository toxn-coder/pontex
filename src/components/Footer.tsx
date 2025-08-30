'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Facebook, Instagram, Twitter, MessageCircle, MapPin, Phone, Mail, Clock } from 'lucide-react';
import { db } from '@/app/api/firebase';
import { doc, getDoc } from 'firebase/firestore';

interface ContactInfo {
  facebook: string;
  instagram: string;
  twitter: string;
  whatsapp: string;
  phones: string[];
  emails: string[];
  logo?: string;
}

interface FooterProps {
  name: string;
  logoUrl: string;
}

const Footer = ({ name, logoUrl }: FooterProps) => {
  const [contactInfo, setContactInfo] = useState<ContactInfo>({
    facebook: '',
    instagram: '',
    twitter: '',
    whatsapp: '',
    phones: [],
    emails: [],
    logo: '',
  });
  const [isPWA, setIsPWA] = useState(false);

  useEffect(() => {
    const fetchContactInfo = async () => {
      try {
        const docRef = doc(db, 'settings-ecommerce', 'contactInfo');
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

  useEffect(() => {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    setIsPWA(isStandalone);
    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    const handleChange = (e: MediaQueryListEvent) => setIsPWA(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  if (isPWA) return null;

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
              <Image
  src={logoUrl? logoUrl : "/logo.png"}
  alt="شعار مطعم الشاورما الأصيل"
  width={50}
  height={50}
  style={{ width: '50px', height: 'auto' }}
  className="object-contain rounded"
/>

            </div>
            <p className="text-gray-200 mb-4">
              {name} يقدم أشهى الأصناف بنكهات شرقية مميزة باستخدام أفضل المكونات الطازجة لضمان تجربة لا تُنسى.
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
          {/* باقي الأعمدة كما هي */}
        </div>
      </div>

      <div className="bg-[var(--clr-dark-red)] py-4">
        <div className="container mx-auto px-4 text-center">
          <p>جميع الحقوق محفوظة © {new Date().getFullYear()} {name}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
