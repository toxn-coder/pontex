import { Coffee, Clock, ChefHat } from 'lucide-react';
const CardAbout = () => {
    return (
        <section id="about" className="py-16 container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-amber-900 mb-8 text-center">عن مطعمنا</h2>
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <p className="text-gray-700 mb-6 leading-relaxed">
              رواد في صناعة الأقمشة القطنية تصنيع محلي و مستورد
            </p>
            <p className="text-gray-700 mb-6 leading-relaxed">
              نحرص على استخدام أجود أنواع المكونات الطازجة واتباع الوصفات التقليدية التي توارثناها عبر الأجيال، مما يضمن لكم تجربة طعام لا تُنسى.
            </p>
            <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
              <div className="flex items-center">
                <ChefHat className="text-amber-600 ml-2" size={24} />
                <p className="text-gray-700">طهاة ذوي خبرة عالية</p>
              </div>
              <div className="flex items-center">
                <Coffee className="text-amber-600 ml-2" size={24} />
                <p className="text-gray-700">أجواء مريحة وهادئة</p>
              </div>
              <div className="flex items-center">
                <Clock className="text-amber-600 ml-2" size={24} />
                <p className="text-gray-700">خدمة سريعة ومميزة</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
}

export default CardAbout;
