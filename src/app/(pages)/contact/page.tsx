"use client";

import { useState, useEffect } from 'react';
import { Phone, MapPin, Facebook, Instagram, Twitter, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { db } from '@/app/api/firebase';
import { doc, getDoc, DocumentData } from 'firebase/firestore';
import Head from 'next/head';
import ProgressAnim from '@/components/ProgressAnim';

// واجهة لنوع البيانات المتوقع من Firestore
interface ContactInfo {
  phones: string[];
  facebook: string;
  instagram: string;
  twitter: string;
  whatsapp: string;
}

export default function ContactUs() {
  const [contactInfo, setContactInfo] = useState<ContactInfo>({
    phones: [],
    facebook: '',
    instagram: '',
    twitter: '',
    whatsapp: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const address = 'كفر الشيخ - شارع إبراهيم المغازي تقسيم 2 أمام - بيتزا بان';
  const googleMapsLink = 'https://www.google.com/maps/embed?pb=!1m17!1m12!1m3!1d3415.825274839317!2d30.949543684859268!3d31.114587981505714!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m2!1m1!2zMzHCsDA2JzUyLjUiTiAzMMKwNTYnNTAuNSJF!5e0!3m2!1sar!2seg!4v1746256990189!5m2!1sar!2seg';

  // جلب معلومات الاتصال من Firestore
  useEffect(() => {
    const fetchContactInfo = async () => {
      try {
        const docRef = doc(db, 'settings', 'contactInfo');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data: DocumentData = docSnap.data();
          // التحقق من البيانات وتوفير قيم افتراضية
          setContactInfo({
            phones: Array.isArray(data.phones) ? data.phones : [],
            facebook: typeof data.facebook === 'string' ? data.facebook : '',
            instagram: typeof data.instagram === 'string' ? data.instagram : '',
            twitter: typeof data.twitter === 'string' ? data.twitter : '',
            whatsapp: typeof data.whatsapp === 'string' ? data.whatsapp : '',
          });
        } else {
          setError('لا توجد معلومات اتصال متاحة.');
        }
      } catch (err) {
        console.error('Error fetching contact info:', err);
        setError('فشل جلب معلومات الاتصال. حاول مرة أخرى لاحقًا.');
      } finally {
        setLoading(false);
      }
    };
    fetchContactInfo();
  }, []);

  return (
    <div className="min-h-screen bg-[var(--clr-primary)] py-12 px-4">
      <Head>
        <title>اتصل بنا - مطعم والي دمشق</title>
        <meta name="description" content="تواصلوا معنا عبر الهاتف أو زورونا في موقعنا. نحن هنا لخدمتكم!" />
        <meta name="keywords" content="مطعم شاورما, كفر الشيخ, اتصل بنا, خدمة العملاء" />
        <meta name="robots" content="index, follow" />
        <meta property="og:title" content="اتصل بنا - مطعم والي دمشق" />
        <meta property="og:description" content="تواصلوا معنا عبر الهاتف أو زورونا في موقعنا. نحن هنا لخدمتكم!" />
        <meta property="og:image" content="/logo.png" />
        <meta property="og:url" content="https://waly-damascus.vercel.app" />
      </Head>

      <div className="max-w-6xl mx-auto">
        {/* رأس الصفحة */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white">
            <span className="text-yellow-500">اتصل بنا</span>
          </h1>
          <p className="text-gray-300 mt-4 text-lg max-w-2xl mx-auto">
            تواصلوا معنا عبر الهاتف أو زورونا في موقعنا. نحن هنا لخدمتكم!
          </p>
        </motion.div>

        {loading ? (
          <ProgressAnim />
        ) : error ? (
          <p className="text-center text-red-400 text-lg">{error}</p>
        ) : !contactInfo || (
          !contactInfo.phones.length &&
          !contactInfo.facebook &&
          !contactInfo.instagram &&
          !contactInfo.twitter &&
          !contactInfo.whatsapp
        ) ? (
          <p className="text-center text-gray-300 text-lg">لا توجد معلومات اتصال متاحة حاليًا.</p>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* معلومات التواصل */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white rounded-2xl shadow-xl p-8"
            >
              <h2 className="text-2xl font-bold text-gray-800 mb-6">معلومات التواصل</h2>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <MapPin className="w-6 h-6 text-yellow-600" />
                  <div>
                    <p className="text-sm text-gray-600">العنوان</p>
                    <p className="text-gray-800 font-medium">{address}</p>
                  </div>
                </div>
                {contactInfo.phones && contactInfo.phones.length > 0 && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-6 h-6 text-yellow-600" />
                    <div className="flex flex-col gap-2">
                      <p className="text-sm text-gray-600">رقم الهاتف</p>
                      {contactInfo.phones.map((phone, index) => (
                        <a
                          href={`tel:${phone}`}
                          key={index}
                          className="text-gray-800 font-medium hover:text-yellow-600 transition-colors"
                          dir="ltr"
                        >
                          {phone}
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* قسم وسائل التواصل الاجتماعي */}
                {(contactInfo.facebook || contactInfo.instagram || contactInfo.twitter || contactInfo.whatsapp) && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">وسائل التواصل الاجتماعي</h3>
                    <div className="space-y-4">
                      {contactInfo.facebook && (
                        <div className="flex items-center gap-3">
                          <Facebook className="w-6 h-6 text-yellow-600" />
                          <div>
                            <p className="text-sm text-gray-600">فيسبوك</p>
                            <a
                              href={contactInfo.facebook}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-gray-800 font-medium hover:text-yellow-600 transition-colors"
                            >
                              حسابنا على فيسبوك
                            </a>
                          </div>
                        </div>
                      )}
                      {contactInfo.instagram && (
                        <div className="flex items-center gap-3">
                          <Instagram className="w-6 h-6 text-yellow-600" />
                          <div>
                            <p className="text-sm text-gray-600">إنستغرام</p>
                            <a
                              href={contactInfo.instagram}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-gray-800 font-medium hover:text-yellow-600 transition-colors"
                            >
                              حسابنا على إنستغرام
                            </a>
                          </div>
                        </div>
                      )}
                      {contactInfo.twitter && (
                        <div className="flex items-center gap-3">
                          <Twitter className="w-6 h-6 text-yellow-600" />
                          <div>
                            <p className="text-sm text-gray-600">تويتر</p>
                            <a
                              href={contactInfo.twitter}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-gray-800 font-medium hover:text-yellow-600 transition-colors"
                            >
                              حسابنا على تويتر
                            </a>
                          </div>
                        </div>
                      )}
                      {contactInfo.whatsapp && (
                        <div className="flex items-center gap-3">
                          <MessageCircle className="w-6 h-6 text-yellow-600" />
                          <div>
                            <p className="text-sm text-gray-600">واتساب</p>
                            <a
                              href={contactInfo.whatsapp}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-gray-800 font-medium hover:text-yellow-600 transition-colors"
                            >
                              تواصلوا معنا على واتساب
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="bg-white rounded-2xl shadow-xl overflow-hidden"
            >
              <iframe
                src={googleMapsLink}
                width="100%"
                height="400"
                style={{ border: 0 }}
                allowFullScreen={true} // تعديل القيمة إلى true
                loading="lazy"
                title="خريطة الموقع"
              />
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}

