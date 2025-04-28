'use client';

import { motion } from 'framer-motion';

export default function AboutUs() {
  return (
    <div className="min-h-screen bg-[var(--clr-primary)] py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* رأس الصفحة */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white">
            <span className="text-yellow-500">عن المطعم</span>
          </h1>
          <p className="text-gray-300 mt-4 text-lg max-w-2xl mx-auto">
            شاورما السوري: حيث تلتقي الأصالة بالنكهات الرائعة في قلب كفر الشيخ!
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* قسم القصة والرؤية */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-8"
          >
            {/* قصة المطعم */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">قصتنا</h2>
              <p className="text-gray-600 leading-relaxed">
                تأسس مطعم شاورما السوري في عام 2022 بهدف تقديم النكهات السورية الأصيلة إلى عشاق الطعام في
                  جمهورية مصر العربية. بدأنا كمطعم صغير في كفر الشيخ، ومع شغفنا بالجودة والضيافة، أصبحنا
                وجهة مفضلة لمحبي الشاورما والمأكولات السورية. كل طبق نقدمه يحكي قصة من التقاليد والحب
                للطهي.
              </p>
            </div>

            {/* الرؤية والقيم */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">رؤيتنا وقيمنا</h2>
              <p className="text-gray-600 leading-relaxed">
                نسعى لأن نكون الخيار الأول لعشاق المأكولات السورية من خلال تقديم أطباق عالية الجودة بمكونات
                طازجة ونكهات أصيلة. قيمنا ترتكز على الضيافة العربية، الاهتمام بالتفاصيل، والالتزام بتقديم
                تجربة طعام لا تُنسى لكل زائر.
              </p>
            </div>
          </motion.div>

          {/* صورة مميزة */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-white rounded-2xl shadow-xl overflow-hidden"
          >
            <img
              src="https://res.cloudinary.com/do88eynar/image/upload/v1745714479/ns9yrv6q59zkil1ccu7z.webp"
              alt="مطعم شاورما السوري"
              className="w-full h-[400px] lg:h-full object-cover shadow-lg "
            />
          </motion.div>
        </div>
      </div>
    </div>
  );
}