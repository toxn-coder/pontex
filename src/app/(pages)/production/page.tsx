"use client";

import { useEffect, useState } from "react";
import { db } from "@/app/api/firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import ImageTextSection from "@/components/ImageTextSection";
import ProgressAnim from "@/components/ProgressAnim";

interface SectionData {
  id: string;
  imageUrl: string;
  title: string;
  description: string;
  order?: number;        // اختياري
  createdAt?: any;       // للترتيب الافتراضي
}

export default function Production() {
  const [sections, setSections] = useState<SectionData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSections = async () => {
      try {
        // جلب جميع الأقسام
        const q = query(collection(db, "production"));
        const querySnapshot = await getDocs(q);

        const data: SectionData[] = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          imageUrl: doc.data().imageUrl || "",
          title: doc.data().title || "",
          description: doc.data().description || "",
          order: doc.data().order ?? undefined,
          createdAt: doc.data().createdAt ?? null,
        }));

        // 1. فرز حسب `order` (الأرقام الصغيرة أولاً)
        // 2. إذا لم يكن `order` → نضعه في النهاية (أو حسب createdAt)
        const sorted = data.sort((a, b) => {
          // إذا كان كلاهما لديه order
          if (a.order !== undefined && b.order !== undefined) {
            return a.order - b.order;
          }
          // إذا كان واحد فقط لديه order
          if (a.order !== undefined) return -1; // a يأتي أولاً
          if (b.order !== undefined) return 1;  // b يأتي أولاً

          // كلاهما بدون order → نرتب حسب createdAt أو الترتيب الأصلي
          if (a.createdAt && b.createdAt) {
            return b.createdAt.toDate() - a.createdAt.toDate(); // الأحدث أولاً
          }
          return 0;
        });

        setSections(sorted);
      } catch (error) {
        console.error("Error fetching Firestore data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSections();
  }, []);

  if (loading) return <ProgressAnim />;

  return (
    <div className="min-h-screen pb-12">
      <video
        className="block inset-0 w-full h-[400px] object-cover"
        src="/background.mp4"
        autoPlay
        muted
        loop
        playsInline
      />
      <p className="mt-10 w-full font-Bukra font-bold text-4xl text-neutral-900 text-center">
        الإنتاج
      </p>
      <p className="font-Bukra text-neutral-800 mt-5 text-2xl px-10 text-center">
        نحن نستخدم أنظمة أتمتة عالية الجودة ومتكاملة تكنولوجيا في كل مرحلة.
        بصفتنا شركة تصنيع نسيج متكاملة، فإننا نجمع بين التكنولوجيا وخبرتنا ويتنازل عن جودة الإنتاج والتسليم السريع.
      </p>

      {sections.map((section, index) => (
        <ImageTextSection
          key={section.id} // نستخدم id بدل index للـ key (أفضل ممارسة)
          imageUrl={section.imageUrl}
          title={section.title}
          description={section.description}
          index={index}
        />
      ))}
    </div>
  );
}