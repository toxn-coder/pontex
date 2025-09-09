'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Facebook, Instagram, Twitter, MessageCircle, MapPin, Phone, Mail, Clock } from 'lucide-react';
import { db } from '@/app/api/firebase';
import { doc, getDoc ,collection, addDoc, serverTimestamp } from 'firebase/firestore';

interface ContactInfo {
  facebook: string;
  instagram: string;
  twitter: string;
  whatsapp: string;
  phones: string[];
  emails: string[];
  logo?: string;
  address: string;
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
    address: '',
  });
  const [isPWA, setIsPWA] = useState(false);

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
            address: typeof data.address === 'string' ? data.address : '',
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

  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();

  if (!email) {
    setMessage("الرجاء إدخال البريد الإلكتروني");
    return;
  }

  try {
    await addDoc(collection(db, "subscribers"), {
      email,
      createdAt: serverTimestamp(),
    });
    setMessage("✅ تم الاشتراك بنجاح");
    setEmail("");
  } catch (error: any) {
    setMessage("❌ حدث خطأ: " + error.message);
  }
};


  if (isPWA) return null;

  return (
    <footer className="bg-gradient-to-r from-[var(--clr-dark-red)] to-[var(--clr-primary)] text-white">
      <div className="bg-[var(--clr-primary)] py-3">
        <div className="container mx-auto px-4 flex justify-center md:justify-between items-center flex-wrap">
          <div className="text-center md:text-right mb-4 md:mb-0">
            <h3 className="text-xl font-bold">احصل على النتجات الفاخرة! اطلب الآن</h3>
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
  alt="شعار الموقع"
  width={50}
  height={50}
  style={{ width: '50px', height: 'auto' }}
  className="object-contain rounded"
/>

            </div>
            <p className="text-gray-200 mb-4">
              {name} - وجهتك الموثوقة للتسوق الإلكتروني. اكتشف تشكيلتنا الواسعة من المنتجات عالية الجودة بأسعار تنافسية. تسوق بثقة مع خدمة عملاء ممتازة وتوصيل سريع.
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
          <div className="text-center md:text-right">
            
            <h4 className="text-lg font-semibold mb-4">روابط سريعة</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="hover:underline">الرئيسية</Link>
              </li>
              <li>
                <Link href="/products" className="hover:underline">المنتجات</Link>
              </li>
              <li>
                <Link href="/about" className="hover:underline">من نحن</Link>
              </li>
              <li>
                <Link href="/contact" className="hover:underline">اتصل بنا</Link>
              </li>
            </ul>
          </div>
          <div className="text-center md:text-right">
            <h4 className="text-lg font-semibold mb-4">معلومات الاتصال</h4>
            <ul className="space-y-2">
              {contactInfo.phones.map((phone, index) => (
                <li key={index} className="flex items-center gap-2 justify-center md:justify-start">
                  <Phone size={16} />
                  <a href={`tel:${phone}`} className="hover:underline">{phone}</a>
                </li>
              ))}
              {contactInfo.emails.map((email, index) => (
                <li key={index} className="flex items-center gap-2 justify-center md:justify-start">
                  <Mail size={16} />
                  <a href={`mailto:${email}`} className="hover:underline">{email}</a>
                </li>
              ))}
              <li className="flex items-center gap-2 justify-center md:justify-start">
                <MapPin size={16} />
                <span>القاهرة، مصر {contactInfo.address}</span>
              </li>
              <li className="flex items-center gap-2 justify-center md:justify-start">
                <Clock size={16} />
                <span>السبت - الخميس: 9 صباحًا - 9 مساءً</span>
              </li>
            </ul>
          </div>
          <div className="text-center md:text-right">
            <h4 className="text-lg font-semibold mb-4">اشترك في النشرة الإخبارية</h4>
            <p className="text-gray-200 mb-4">كن أول من يعرف عن العروض والمنتجات الجديدة!</p>
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
              <input
                type="email"
                value={email}
                placeholder="أدخل بريدك الإلكتروني"
                className="w-full px-4 py-2 rounded-lg text-white focus:outline-none border-2 border-amber-500"
                required
                onChange={(e) => setEmail(e.target.value)}
              />
              <button
                type="submit"
                className="bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-500 transition"
              >
                اشترك
              </button>
            </form>
          </div>
        
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
