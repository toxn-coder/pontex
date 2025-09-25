"use client";

import { motion } from "framer-motion";
import { easeOut } from "framer-motion"; // ✅ استدعاء easing جاهز
import Image from "next/image";

interface ImageTextSectionProps {
  imageUrl: string;
  title: string;
  description: string;
  index: number;
}

export default function ImageTextSection({ imageUrl, title, description, index }: ImageTextSectionProps) {
  const isImageRight = index % 2 === 0;

  // إعدادات الحركة للصورة
  const imageVariants = {
    hidden: { opacity: 0, x: isImageRight ? 100 : -100 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.6, ease: easeOut }, // ✅ هنا بدل string
    },
  };

  // إعدادات الحركة للنص
  const textVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: easeOut, delay: 0.2 }, // ✅ هنا كمان
    },
  };

  return (
    <motion.div
      className={`flex flex-col md:flex-row items-center gap-8 my-12 mx-12 rounded-2xl p-2.5 px-4 bg-[#000]/9 backdrop-blur-2xl ${
        isImageRight ? "md:flex-row" : "md:flex-row-reverse"
      }`}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
    >
      {/* الصورة */}
      <motion.div className="w-full md:w-1/2" variants={imageVariants}>
        <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-lg">
          <Image
            src={imageUrl}
            alt={title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
            unoptimized
          />
        </div>
      </motion.div>

      {/* النص */}
      <motion.div className="w-full md:w-1/2 space-y-4" variants={textVariants}>
        <h2 className="text-2xl md:text-3xl font-bold text-red-900">{title}</h2>
        <p className="text-red-950 text-base md:text-lg leading-relaxed">
          {description}
        </p>
      </motion.div>
    </motion.div>
  );
}
