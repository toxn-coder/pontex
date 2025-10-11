// src/hooks/useCategories.ts
"use client";

import { useEffect, useState } from "react";
import { db } from "@/app/api/firebase";
import { collection, getDocs } from "firebase/firestore";

interface Category {
  id: string;
  title: string;
  isVisible: boolean;
}

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const snapshot = await getDocs(collection(db, "Parts"));
        const cats: Category[] = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            title: data.name || doc.id,
            isVisible: data.isVisible ?? true, // لو مش موجود اعتبره true
          };
        });

        // فلترة فقط اللي ظاهر
        setCategories(cats.filter((cat) => cat.isVisible));
      } catch (err) {
        console.error("خطأ في جلب الأقسام:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return { categories, loading };
}
