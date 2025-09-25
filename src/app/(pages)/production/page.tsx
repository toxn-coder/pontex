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
    <div className="min-h-screen py-12">
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
