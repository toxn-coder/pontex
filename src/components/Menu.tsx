"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";
import Head from "next/head";
import { db } from "@/app/api/firebase";
import { collection, getDocs } from "firebase/firestore";
import MealSlider from "@/components/MealSlider";
import ProgressAnim from "./ProgressAnim";

// تعريف واجهة لشكل المنتج (meal)
interface Meal {
  id: string;
  name: string;
  description: string;
  image: string;
  price: string;
  rating: string | number;
}

// تعريف واجهة لشكل القسم (category)
interface Category {
  id: string;
  title: string;
  meals: Meal[];
}

// مدة صلاحية التخزين المؤقت (1 ساعة بالمللي ثانية)
const CACHE_DURATION = 60 * 60 * 1000;

const fetcher = async () => {
  try {
    const menuPartsRef = collection(db, "menuParts");
    const snapshot = await getDocs(menuPartsRef);
    if (snapshot.empty) {
      console.log("لا توجد مستندات في menuParts.");
      return [];
    }

    const data: Category[] = snapshot.docs.map((doc) => {
      const categoryData = doc.data();
      const meals: Meal[] = categoryData.products || [];
      const formattedMeals: Meal[] = meals.map((meal: Meal) => ({
        id: meal.id || `temp-id-${Math.random().toString(36).substring(2)}`,
        name: meal.name || "بدون اسم",
        description: meal.description || "لا يوجد وصف",
        image: meal.image || "/placeholder.svg",
        price: meal.price || "غير محدد",
        rating: meal.rating || "بدون تقييم",
      }));
      return {
        id: doc.id, // استخدام معرف المستند مباشرة
        title: categoryData.name || doc.id,
        meals: formattedMeals,
      };
    });

    // فرز الأقسام بحيث يكون "الأكثر مبيعًا" في البداية
    const sortedData = data.sort((a, b) => {
      if (a.title === "الأكثر مبيعًا") return -1;
      if (b.title === "الأكثر مبيعًا") return 1;
      return a.title.localeCompare(b.title, "ar");
    });

    // تخزين البيانات في localStorage
    if (typeof window !== "undefined") {

      localStorage.setItem("menuData", JSON.stringify(sortedData));
      localStorage.setItem("menuDataTimestamp", new Date().getTime().toString());
    }

    return sortedData;
  } catch (err) {
    console.error("خطأ في جلب البيانات:", err);
    throw err;
  }
};

const Menu = () => {
  const [initialData, setInitialData] = useState<Category[] | undefined>(undefined);
  const [isCacheValid, setIsCacheValid] = useState(false);

  // تحميل البيانات من localStorage على جانب العميل فقط
  useEffect(() => {
    if (typeof window !== "undefined") {
      const cachedData = localStorage.getItem("menuData");
      const cachedTimestamp = localStorage.getItem("menuDataTimestamp");
      const currentTime = new Date().getTime();

      if (cachedData && cachedTimestamp && currentTime - parseInt(cachedTimestamp) < CACHE_DURATION) {

        setInitialData(JSON.parse(cachedData));
        setIsCacheValid(true);
      } else {
        console.log("البيانات المخزنة غير صالحة أو غير موجودة.");
      }
    }
  }, []);

  const { data: categories, error, isLoading } = useSWR("menuData", fetcher, {
    refreshInterval: 60 * 60 * 1000,
    revalidateOnFocus: false,
    revalidateOnMount: !isCacheValid,
    dedupingInterval: 60 * 1000,
    keepPreviousData: true,
    fallbackData: initialData,
  });

  return (
    <>
      <Head>
        <title>منيو مطعم والي دمشق - قائمة الطعام</title>
        <meta
          name="description"
          content="استمتع بقائمة طعام مطعم والي دمشق المليئة بالنكهات الشامية الأصيلة. اكتشف أطباق الشاورما، المقبلات، والوجبات الشهية."
        />
        <meta
          name="keywords"
          content="منيو والي دمشق, قائمة طعام, شاورما, مطعم شامي, أكل سوري, وجبات, مقبلات"
        />
        <meta
          property="og:title"
          content="منيو مطعم والي دمشق - النكهات الشامية الأصيلة"
        />
        <meta
          property="og:description"
          content="تصفح قائمة طعام والي دمشق واستمتع بأشهى الأطباق السورية من الشاورما إلى المقبلات والوجبات العائلية."
        />
        <meta property="og:image" content="/logo.png" />
        <meta
          property="og:url"
          content="https://waly-damascus.vercel.app/menu"
        />
        <meta property="og:type" content="website" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta charSet="UTF-8" />
      </Head>
      <div className="min-h-screen">
        {isLoading && !categories ? (
          <ProgressAnim />
        ) : error ? (
          <main className="text-center w-full min-h-screen text-red-500 flex justify-center items-center flex-col font-bold text-2xl">
            حدث خطأ أثناء جلب البيانات. حاول مرة أخرى لاحقًا.
            <button
              onClick={() => window.location.reload()}
              className="mt-4 bg-yellow-600 text-white px-4 py-2 rounded-lg"
            >
              إعادة المحاولة
            </button>
          </main>
        ) : !categories || categories.length === 0 ? (
          <main className="text-center w-full min-h-screen text-gray-500 flex justify-center items-center flex-col font-bold text-2xl">
            لا توجد بيانات متاحة حاليًا.
            <button
              onClick={() => window.location.reload()}
              className="mt-4 bg-yellow-600 text-white px-4 py-2 rounded-lg"
            >
              إعادة المحاولة
            </button>
          </main>
        ) : (
          <section aria-label="قائمة الطعام">
            {categories.map((cat) => (
              <MealSlider
                key={cat.id}
                title={cat.title}
                products={cat.meals}
                sectionId={cat.id}
                auto={cat.title === "الأكثر مبيعًا"}
              />
            ))}
          </section>
        )}
      </div>
    </>
  );
};

export default Menu;