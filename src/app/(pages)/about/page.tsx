'use client';
import { useEffect, useState } from 'react';
import { loadInfoApp } from '@/components/infoApp';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Head from 'next/head';

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

  // إعداد الأنميشن العامة
  const fadeFrom = (direction: 'left' | 'right') => ({
    hidden: { opacity: 0, x: direction === 'left' ? -100 : 100 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.7, ease: 'easeOut' },
    },
  });

  return (
    <>
      <Head>
        <title>من نحن {infoApp.name}</title>
        <meta
          name="description"
          content="متجر الكتروني لبيع الأقمشة المميزة"
        />
      </Head>

      <div className="min-h-screen py-12 px-4 text-center">
        <div className="max-w-6xl mx-auto relative">
          {/* رأس الصفحة */}
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              <span className="text-[#3a3a3a]">من نحن</span>
            </h1>

            <p className="text-black text-6xl mt-4 max-w-2xl mx-auto name-logo">
              {infoApp.name}
            </p>

            <motion.span
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{
                duration: 0.8,
                ease: 'easeInOut',
                delay: 0.5,
              }}
              className="block h-[1px] bg-[#3a3a3a] mx-auto mt-6 rounded-full"
            ></motion.span>
          </motion.div>

          {/* الفقرة الأولى */}
          <div className="w-full text-right mb-8">
            <p className="text-[#511514] text-3xl font-Bukra font-bold">قصتنا</p>
            <p className="text-2xl text-gray-950">
              تأسست شركة بونتكس عام ١٩٩٦ وهي شركة رائدة في صناعة الأقمشة القطنية.
              تشتهر بابتكاراتها في تطوير أقمشة عالية الجودة ومريحة، ولها بصمة واضحة
              في السوق بفضل تصاميمها المتنوعة التي تلبي مختلف الأذواق.
            </p>
          </div>

          {/* القسم الأول */}
          <motion.div
            className="mt-12 w-full flex flex-col md:flex-row items-center justify-between gap-8 will-change-transform"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.div
              variants={fadeFrom('right')}
              className="relative w-[400px] h-[400px] bg-white rounded-2xl shadow-lg overflow-hidden flex-shrink-0"
            >
              <Image
                src="/target.svg"
                alt="about us"
                fill
                className="object-contain p-6"
              />
            </motion.div>

            <motion.div
              variants={fadeFrom('left')}
              className="flex-1 text-right"
            >
              <p className="text-[#511514] text-3xl font-Bukra font-bold">رؤيتنا</p>
              <p className="text-2xl text-gray-950">
                أن نكون المرجع الأول في المنطقة للأقمشة القطنية المبتكرة، من خلال تقديم منتجات
                تجمع بين الجودة الفائقة، التصميم المتطور، والاستدامة بما يليق بكل من يلمسه.
              </p>
            </motion.div>
          </motion.div>

          {/* القسم الثاني */}
          <motion.div
            className="mt-20 w-full flex flex-col md:flex-row-reverse items-center justify-between gap-8 will-change-transform"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.div
              variants={fadeFrom('left')}
              className="relative w-[400px] h-[400px] bg-white rounded-2xl shadow-lg overflow-hidden flex-shrink-0"
            >
              <Image
                src="/see.svg"
                alt="about us"
                fill
                className="object-contain p-6"
              />
            </motion.div>

            <motion.div
              variants={fadeFrom('right')}
              className="flex-1 text-right"
            >
              <p className="text-[#511514] text-3xl font-Bukra font-bold">قيمنا</p>
              <p className="text-2xl text-gray-950 text-wrap">
                نسعى في بونتكس إلى بناء تجربة متكاملة لعملائنا، لا تقوم فقط على توفير القماش،
                بل على تقديم حلول منسوجات متطورة تحقق أعلى معايير الجودة والابتكار والاستدامة،
                ودعم المصممين والعلامات التجارية لتحقيق ميزة تنافسية حقيقية.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </>
  );
}
