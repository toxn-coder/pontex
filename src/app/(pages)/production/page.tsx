"use client";

import { useEffect, useState } from "react";
import { db } from "@/app/api/firebase"; // مسار firebase config عندك
import { collection, getDocs } from "firebase/firestore";
import ImageTextSection from "@/components/ImageTextSection";
import ProgressAnim from "@/components/ProgressAnim";

interface SectionData {
  imageUrl: string;
  title: string;
  description: string;
}

export default function Production() {
  const [sections, setSections] = useState<SectionData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSections = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "production"));
        const data: SectionData[] = querySnapshot.docs.map((doc) => ({
          imageUrl: doc.data().imageUrl,
          title: doc.data().title,
          description: doc.data().description,
        }));
        setSections(data);
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
    <div className="min-h-screen pb-12 ">
            <video
        className="block inset-0 w-full h-[400px] object-cover"
        src="/background.mp4"
        autoPlay
        muted
        loop
        playsInline
      />
      <p className="mt-10 w-full font-Bukra font-bold text-4xl text-neutral-900 text-center">الإنتاج</p>
      <p className="font-Bukra text-neutral-800 mt-5 text-2xl px-10 text-center">نحن نستخدم أنظمة أتمتة عالية الجودة ومتكاملة تكنولوجيا في كل مرحلة.
        بصفتنا شركة تصنيع نسيج متكاملة، فإننا نجمع بين التكنولوجيا وخبرتنا و يتنازل عن جودة الإنتاج والتسليم السري
      </p>
      {sections.map((section, index) => (
        <ImageTextSection
          key={index}
          imageUrl={section.imageUrl}
          title={section.title}
          description={section.description}
          index={index}
        />
      ))}
    </div>
  );
}
