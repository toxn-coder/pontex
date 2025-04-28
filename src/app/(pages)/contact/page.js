'use client';

import { useState, useEffect } from 'react';
import { Phone, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import { db } from '@/app/api/firebase';
import { doc, getDoc } from 'firebase/firestore';

export default function ContactUs() {
  const [contactInfo, setContactInfo] = useState({
    phones: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const address = ' كفر الشيخ - شارع ابراهيم مغازي تقسيم 2 , بجوار فوري';
  const googleMapsLink = 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d13663.633556506917!2d30.952876897115022!3d31.112278161688636!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14f7ab154467f3bf%3A0x23f2fc217b3adbf9!2z2LnYsdmI2LMg2KfZhNi02KfZhQ!5e0!3m2!1sar!2seg!4v1745721237455!5m2!1sar!2seg';

  // جلب معلومات الاتصال من Firestore
  useEffect(() => {
    const fetchContactInfo = async () => {
      try {
        const docRef = doc(db, 'settings', 'contactInfo');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setContactInfo(docSnap.data());
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
          <div className="flex justify-center items-center h-64">
            <svg className="animate-spin h-8 w-8 text-yellow-500" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </div>
        ) : error ? (
          <p className="text-center text-red-400 text-lg">{error}</p>
        ) : !contactInfo || (!contactInfo.phones.length && !contactInfo.address && !contactInfo.googleMapsLink) ? (
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
                {contactInfo.phones && contactInfo.phones.length > 0 && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-6 h-6 text-yellow-600" />
                    <div>
                      <p className="text-sm text-gray-600">رقم الهاتف</p>
                      <a
                        href={`tel:${contactInfo.phones[0]}`}
                        className="text-gray-800 font-medium hover:text-yellow-600 transition-colors"
                        dir="ltr"
                      >
                        {contactInfo.phones[0]}
                      </a>
                    </div>
                  </div>
                )}

                  <div className="flex items-center gap-3">
                    <MapPin className="w-6 h-6 text-yellow-600" />
                    <div>
                      <p className="text-sm text-gray-600">العنوان</p>
                      <p className="text-gray-800 font-medium">{address}</p>
                    </div>
                  </div>

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
                  allowFullScreen=""
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