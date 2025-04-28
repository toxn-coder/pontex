"use client";
import { useEffect, useState } from "react";
import { db } from "@/app/api/firebase";
import { collection, getDocs } from "firebase/firestore";
import MealSlider from "@/components/MealSlider";

const Menu = () => {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const menuPartsRef = collection(db, "menuParts");
      const snapshot = await getDocs(menuPartsRef);

      const data = snapshot.docs.map((doc) => {
        const categoryData = doc.data();
        const meals = categoryData.products || []; // تأكد من وجود المنتجات في البيانات

        // نقوم بتحسين البيانات بحيث نمررها إلى MealSlider بشكل مناسب
        const formattedMeals = meals.map((meal) => ({
          name: meal.name || "بدون اسم",
          description: meal.description || "لا يوجد وصف",
          image: meal.image || "https://via.placeholder.com/150", // صورة افتراضية إذا كانت الصورة مفقودة
          price: meal.price || "غير محدد",
          rating: meal.rating || "بدون تقييم"
        }));

        return {
          title: doc.id,
          meals: formattedMeals, // إرسال البيانات المحسنة
        };
      });

      setCategories(data);
    };

    fetchData();
  }, []);

  return (
    <div>
      {categories.map((cat, i) => (
        <MealSlider
          key={cat.title}
          title={cat.title}
          products={cat.meals} // ✅ تم التعديل هنا
          auto={i === 0}
        />
      ))}
    </div>
  );
};

export default Menu;
