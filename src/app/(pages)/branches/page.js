'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { MapPin, Phone, Clock } from 'lucide-react';
import { db } from '@/app/api/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { motion } from 'framer-motion';
import Head from 'next/head';
import ProgressAnim from '@/components/ProgressAnim';

export default function Branches() {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);

  // جلب بيانات الفروع من Firestore
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const branchesCollection = collection(db, 'branches');
        const branchesSnapshot = await getDocs(branchesCollection);
        const branchesList = branchesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setBranches(branchesList);
      } catch (error) {
        console.error('Error fetching branches:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchBranches();
  }, []);

  return (
    <>
      <Head>
        <title>فروع مطعم والي دمشق | أفضل فروع الشاورما في كفر الشيخ</title>
        <meta name="description" content="اكتشف فروع مطعم والي دمشق في كفر الشيخ وتعرف على العناوين وأوقات العمل." />
        <meta name="keywords" content="فروع شاورما, شاورما سوري, كفر الشيخ, مطاعم كفر الشيخ, شاورما,والي دمشق ,مطعم والي دمشق , مطعم , كفر الشيخ , مطاعم" />
        <meta property="og:title" content="فروع مطعم والي دمشق" />
        <meta property="og:description" content="اعرف المزيد عن فروع مطعم والي دمشق في كفر الشيخ، مع العناوين وأرقام الهاتف وأوقات العمل." />
        <meta property="og:image" content="https://yourimageurl.com/branch-image.jpg" />
        <meta property="og:url" content="https://yourwebsite.com/branches" />
      </Head>
      
      <div className="w-full min-h-screen bg-[var(--clr-primary)] py-12 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-3xl sm:text-4xl font-bold text-[var(--secondry)]">
            فروع مطعم والي دمشق
          </h1>
          <p className="text-gray-200 mt-2 text-base sm:text-lg">
            تفضل بزيارة أحد فروعنا لتجربة أشهى أطباق الشاورما
          </p>
        </motion.div>

        {loading ? (
          <ProgressAnim />
        ) : branches.length === 0 ? (
          <p className="text-center text-gray-300 text-lg">لا توجد فروع متاحة حاليًا.</p>
        ) : (
          <div
            className={`max-w-7xl mx-auto ${
              branches.length < 3
                ? 'flex flex-wrap justify-center gap-8'
                : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8'
            }`}
          >
            {branches.map((branch) => (
              <motion.div
                key={branch.id}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-white rounded-2xl shadow-xl overflow-hidden w-full sm:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1.5rem)] max-w-md"
              >
                <div className="relative w-full h-48">
                  <Image
                    src={branch.image || '/logo.png'}
                    alt={`${branch.name} - فرع ${branch.name}`}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover"
                    priority={branch === branches[0]}
                  />
                </div>
                <div className="p-6">
                  <h2 className="text-xl font-bold text-[var(--clr-primary)] mb-4">{branch.name}</h2>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <MapPin className="text-amber-600" size={18} />
                      <span className="text-gray-700">{branch.address}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="text-amber-600" size={18} />
                      <a href={`tel:${branch.phone}`} className="text-gray-700 hover:text-amber-600 transition" dir="ltr">
                        {branch.phone}
                      </a>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="text-amber-600" size={18} />
                      <span className="text-gray-700">{branch.workingHours}</span>
                    </div>
                  </div>
                  {branch.googleMapsLink && (
                    <a
                      href={branch.googleMapsLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 inline-block bg-amber-600 text-white px-6 py-2 rounded-full hover:bg-amber-500 transition"
                    >
                      عرض على الخريطة
                    </a>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
