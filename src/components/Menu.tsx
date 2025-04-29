"use client"; // إضافة التوجيه "use client"

import { useEffect, useState } from "react";
import { db } from "@/app/api/firebase";
import { collection, getDocs } from "firebase/firestore";
import MealSlider from "@/components/MealSlider";

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const menuPartsRef = collection(db, "menuParts");
        const snapshot = await getDocs(menuPartsRef);

        const data: Category[] = snapshot.docs.map((doc) => {
          const categoryData = doc.data();
          const meals: Meal[] = categoryData.products || []; // تحديد نوع meals

          // تحسين البيانات
          const formattedMeals: Meal[] = meals.map((meal: Meal) => ({
            name: meal.name || "بدون اسم",
            description: meal.description || "لا يوجد وصف",
            image: meal.image || "https://via.placeholder.com/150", // صورة افتراضية
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
          if (a.title === 'الأكثر مبيعًا') return -1;
          if (b.title === 'الأكثر مبيعًا') return 1;
          return a.title.localeCompare(b.title); // فرز باقي الأقسام أبجديًا
        });

        setCategories(sortedData);
      } catch (error) {
        console.error("Error fetching menu data:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      {categories.map((cat, i) => (
        <MealSlider
          key={cat.title}
          title={cat.title}
          products={cat.meals}
          auto={i === 0} // التمرير التلقائي للقسم الأول (الأكثر مبيعًا)
        />
      ))}
    </div>
  );
};

export default Menu;