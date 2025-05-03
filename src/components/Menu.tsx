"use client";

import { useEffect, useState } from "react";
import Head from "next/head";
import { db } from "@/app/api/firebase";
import { collection, getDocs } from "firebase/firestore";
import MealSlider from "@/components/MealSlider";
import ProgressAnim from "./ProgressAnim";

// تعريف واجهة لشكل المنتج (meal)
interface Meal {
  name: string;
  description: string;
  image: string;
  price: string;
  rating: string | number;
}

// تعريف واجهة لشكل القسم (category)
interface Category {
  title: string;
  meals: Meal[];
}

const Menu = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const menuPartsRef = collection(db, "menuParts");
        const snapshot = await getDocs(menuPartsRef);

        const data: Category[] = snapshot.docs.map((doc) => {
          const categoryData = doc.data();
          const meals: Meal[] = categoryData.products || [];

          const formattedMeals: Meal[] = meals.map((meal: Meal) => ({
            name: meal.name || "بدون اسم",
            description: meal.description || "لا يوجد وصف",
            image: meal.image || "/placeholder.svg",
            price: meal.price || "غير محدد",
            rating: meal.rating || "بدون تقييم",
          }));

          return {
            title: doc.id,
            meals: formattedMeals,
          };
        });

        // فرز الأقسام بحيث يكون "الأكثر مبيعًا" في البداية
        const sortedData = data.sort((a, b) => {
          if (a.title === "الأكثر مبيعًا") return -1;
          if (b.title === "الأكثر مبيعًا") return 1;
          return a.title.localeCompare(b.title, "ar");
        });

        setCategories(sortedData);
      } catch (error) {
        console.error("Error fetching menu data:", error);
        setError("حدث خطأ أثناء جلب البيانات. حاول مرة أخرى لاحقًا.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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
        <meta charSet="UTF-8" /> {/* تصحيح charset إلى charSet */}
      </Head>
      <div className="min-h-screen">
        {loading ? (
          <ProgressAnim />
        ) : error ? (
          <main className="text-center w-full min-h-screen text-red-500 flex justify-center items-center flex-col font-bold text-2xl">
            {error}
          </main>
        ) : categories.length === 0 ? (
          <main className="text-center w-full min-h-screen text-gray-500 flex justify-center items-center flex-col font-bold text-2xl">
            لا توجد بيانات متاحة حاليًا.
          </main>
        ) : (
          <section aria-label="قائمة الطعام">
            {categories.map((cat, i) => (
              <MealSlider
                key={cat.title}
                title={cat.title}
                products={cat.meals}
                auto={i === 0}
              />
            ))}
          </section>
        )}
      </div>
    </>
  );
};

export default Menu;