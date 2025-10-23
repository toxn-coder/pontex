"use client";

import { motion } from "framer-motion";
import { easeOut } from "framer-motion";
import Image from "next/image";

interface ImageTextSectionProps {
  imageUrl: string;
  title: string;
  description: string;
  index: number;
}

export default function ImageTextSection({
  imageUrl,
  title,
  description,
  index,
}: ImageTextSectionProps) {
  // ✅ العنصر الأول: الصورة يسار، الثاني: الصورة يمين
  const isImageLeft = index % 2 === 0;

  // إعداد حركة الصورة
  const imageVariants = {
    hidden: { opacity: 0, x: isImageLeft ? -100 : 100 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.7, ease: easeOut },
    },
  };

  // إعداد حركة النص
  const textVariants = {
    hidden: { opacity: 0, x: isImageLeft ? 100 : -100 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.7, ease: easeOut, delay: 0.2 },
    },
  };

  // ✅ شكل النص من الجهة المقابلة للصورة
  const textRoundedClass = isImageLeft ? "rounded-l-4xl" : "rounded-r-4xl";
  const imageFlexClass = isImageLeft ? "justify-start" : "justify-end";

  return (
    <motion.div
      className={`flex flex-col md:flex-row items-center gap-10 my-16 mx-6 md:mx-20 ${textRoundedClass} border-1 border-black
      ${isImageLeft ? "" : "md:flex-row-reverse"}`}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
    >
      {/* الصورة */}
      <motion.div
        variants={imageVariants}
        className={`w-full md:w-1/2 flex ${imageFlexClass}`}
      >
        <div className="relative w-full max-w-[480px] aspect-[4/3]">
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
      <motion.div
        variants={textVariants}
        className={`w-full md:w-1/2 space-y-4 text-center p-8`}
      >
        <h2 className="text-3xl md:text-4xl font-bold text-[#511514]">{title}</h2>
        <p className="text-lg md:text-xl text-gray-800 leading-relaxed">
          {description}
        </p>
      </motion.div>
    </motion.div>
  );
}
