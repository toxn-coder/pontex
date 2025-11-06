'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import useSWR from 'swr';
import { db } from '@/app/api/firebase';
import {
  collection,
  getDocs,
  Timestamp,
} from 'firebase/firestore';
import ProgressAnim from './ProgressAnim';
import MealGrid from './MealGrid';

interface Meal {
  id: string;
  name: string;
  description: string;
  image: string;
  price: string;
  rating: string | number;
}

interface Category {
  id: string;
  title: string;
  isVisible: boolean;
  meals: Meal[];
  createdAt: Date; // للترتيب
}

const CACHE_DURATION = 60 * 60 * 1000; // ساعة واحدة

const fetcher = async (): Promise<Category[]> => {
  const menuPartsRef = collection(db, 'Parts');
  const snapshot = await getDocs(menuPartsRef);
  if (snapshot.empty) return [];

  const data: Category[] = snapshot.docs.map((doc) => {
    const categoryData = doc.data();

    // جلب تاريخ الإضافة (Timestamp → Date)
    const createdAt: Date =
      categoryData.createdAt instanceof Timestamp
        ? categoryData.createdAt.toDate()
        : new Date(0); // fallback قديم جدًا

    const meals: Meal[] = categoryData.products || [];
    const formattedMeals: Meal[] = meals.map((meal: any) => ({
      id: meal.id || `temp-id-${Math.random().toString(36).substring(2)}`,
      name: meal.name || 'بدون اسم',
      description: meal.description || 'لا يوجد وصف',
      image: meal.image || '/placeholder.png',
      price: meal.price || 'غير محدد',
      rating: meal.rating || 'بدون تقييم',
    }));

    return {
      id: doc.id,
      title: categoryData.name || doc.id,
      isVisible: categoryData.isVisible !== false,
      meals: formattedMeals,
      createdAt,
    };
  });

  // الترتيب المطلوب:
  // 1. "الأكثر مبيعًا" دائمًا أولًا
  // 2. باقي الأقسام حسب تاريخ الإضافة (الأحدث أولًا)
  return data.sort((a, b) => {
    if (a.title === 'الأكثر مبيعًا') return -1;
    if (b.title === 'الأكثر مبيعًا') return 1;
    return a.createdAt.getTime() - b.createdAt.getTime();
  });
};

export default function Menu() {
  const pathname = usePathname();
  const isHomePage = pathname === '/';

  const [initialData, setInitialData] = useState<Category[] | undefined>();
  const [isCacheValid, setIsCacheValid] = useState(false);

  // جلب البيانات من localStorage (إن وجدت)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const cachedData = localStorage.getItem('menuData');
    const cachedTimestamp = localStorage.getItem('menuDataTimestamp');
    const currentTime = new Date().getTime();

    if (
      cachedData &&
      cachedTimestamp &&
      currentTime - parseInt(cachedTimestamp) < CACHE_DURATION
    ) {
      setInitialData(JSON.parse(cachedData));
      setIsCacheValid(true);
    }
  }, []);

  const { data: categories, error, isLoading } = useSWR('menuData', fetcher, {
    refreshInterval: 60 * 60 * 1000,
    revalidateOnFocus: false,
    revalidateOnMount: !isCacheValid,
    dedupingInterval: 60 * 1000,
    keepPreviousData: true,
    fallbackData: initialData,
  });

  // حفظ البيانات في localStorage بعد كل جلب ناجح
  useEffect(() => {
    if (categories) {
      localStorage.setItem('menuData', JSON.stringify(categories));
      localStorage.setItem('menuDataTimestamp', new Date().getTime().toString());
    }
  }, [categories]);

  if (isLoading && !categories) return <ProgressAnim />;

  if (error)
    return (
      <main className="text-center w-full min-h-screen text-red-500 flex justify-center items-center flex-col font-bold text-2xl">
        حدث خطأ أثناء جلب البيانات. حاول مرة أخرى لاحقًا.
        <button
          onClick={() => window.location.reload()}
          className="mt-4 bg-yellow-600 text-white px-4 py-2 rounded-lg"
        >
          إعادة المحاولة
        </button>
      </main>
    );

  if (!categories || categories.length === 0)
    return (
      <main className="text-center w-full min-h-screen text-gray-500 flex justify-center items-center flex-col font-bold text-2xl">
        لا توجد بيانات متاحة حاليًا.
        <button
          onClick={() => window.location.reload()}
          className="mt-4 bg-yellow-600 text-white px-4 py-2 rounded-lg"
        >
          إعادة المحاولة
        </button>
      </main>
    );

  return (
    <section aria-label="قائمة المنتجات" className="min-h-screen mt-22">
      {categories
        .filter((cat) => cat.isVisible !== false)
        .map((cat) => (
          <MealGrid
            key={cat.id}
            title={cat.title}
            products={isHomePage ? cat.meals.slice(0, 3) : cat.meals}
            sectionId={cat.id}
            isVisible={cat.isVisible}
          />
        ))}
    </section>
  );
}