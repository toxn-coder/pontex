'use client';
import { useEffect, useState } from 'react';
import { loadInfoApp } from '@/components/infoApp';
import { motion } from 'framer-motion';
import Head from 'next/head';
import Image from 'next/image';

export default function AboutUs() {
  const [infoApp, setInfoApp] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      const data = await loadInfoApp();
      setInfoApp(data);
    };
    fetchData();
  }, []);

  if (!infoApp) {
    return <div className="text-white p-12">...جاري التحميل</div>;
  }
  
  return (
    <>
      <Head>
        <title> حولنا {infoApp.name}</title>
        <meta name="description" content="متجر الكتروني لبيع المنتجات المميزة" />
        <meta name="keywords" content="متجر متجر الكنروني لبيع افضل المنتجات" />
        <meta property="og:title" content="متجر مميز بافضل المنتجات" />
        <meta property="og:description" content="متجر بيع المنتجات المميزة والافضل" />
        <meta property="og:image" content="logo.png" />
        <meta property="og:url" content="https://waly-damascus.com/about" />
      </Head>
      
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
              <span className="text-yellow-500">حول</span>
            </h1>
            <p className="text-gray-300 mt-4 text-lg max-w-2xl mx-auto">
              {infoApp.name} 
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* قسم القصة والرؤية */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="space-y-8"
            >
              {/* قصة المطعم */}
              <div className="bg-yellow-500 rounded-2xl shadow-xl p-8">
                <h2 className="text-2xl font-bold text-white mb-4">قصتنا</h2>
                <p className="text-gray-300 leading-relaxed">
                {infoApp.name} , {infoApp.ourStory}
                </p>
              </div>

              {/* الرؤية والقيم */}
              <div className="bg-yellow-500 rounded-2xl shadow-xl p-8">
                <h2 className="text-2xl font-bold text-white mb-4">رؤيتنا وقيمنا</h2>
                <p className="text-gray-300 leading-relaxed">
                   {infoApp.ourVision}
                </p>
              </div>
            </motion.div>

            {/* صورة مميزة */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="bg-white rounded-2xl shadow-xl overflow-hidden"
            >
              <Image
                src={infoApp.aboutImage}
                alt={infoApp.name}
                className="w-full h-[400px] lg:h-full object-cover shadow-lg"
                width={800} // تعيين عرض الصورة
                height={600} // تعيين ارتفاع الصورة
              />
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
}
