// components/HeroSection.jsx
import Image from 'next/image';
import { ArrowRight, Clock, Star, MapPin } from 'lucide-react';
import Link from 'next/link';

const HeroSection = ({ 
  restaurantName = "مطعم شاورما السوري", 
  slogan = "المذاق الأصيل للمأكولات السورية",
  rating = "4.8",
  address = "شارع ابراهيم مغازي / كفر الشيخ",
  openingHours = "صباحاً 8:00 - 4:00 الفجر",
  buttonText = "عرض القائمة"
}) => {
  return (
    <div className="relative overflow-hidden bg-[var(--clr-primary)] text-white">
      {/* Overlay Pattern */}
      <div className="absolute inset-0 opacity-10 bg-[url('/placeholder.svg')] bg-repeat"></div>
      
      {/* Content Container */}
      <div className="container mx-auto px-4 py-16 md:py-24 lg:py-32 relative z-10">
        <div className="flex flex-col lg:flex-row items-center">
          {/* Text Content */}
          <div className="w-full lg:w-1/2 text-center lg:text-right mb-10 lg:mb-0">
            <div className="inline-block px-4 py-1 bg-[var(--secondry)] rounded-full text-sm font-bold mb-4">
              المطعم الأفضل في المدينة
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight">
              {restaurantName}
            </h1>
            
            <p className="text-xl md:text-2xl mb-8 text-amber-100">
              {slogan}
            </p>
            
            <div className="flex flex-wrap justify-center lg:justify-end gap-6 mb-8">
              <div className="flex items-center">
                <Star className="text-amber-400 ml-2" size={20} fill="#fbbf24" />
                <span className="font-bold text-lg">{rating}</span>
                <span className="text-amber-200 mr-1">/5</span>
              </div>
              
              <div className="flex items-center">
                <MapPin className="text-amber-400 ml-2" size={20} />
                <span>{address}</span>
              </div>
              
              <div className="flex items-center">
                <Clock className="text-amber-400 ml-2" size={20} />
                <span className='arbic'>{openingHours}</span>
              </div>
            </div>
            
            <div className="flex gap-4 justify-center lg:justify-end">
              <Link href="/menu" >
              <button className="bg-amber-500 hover:bg-amber-600 text-white py-3 px-8 rounded-lg font-bold transition-all shadow-lg hover:shadow-xl flex items-center">
                {buttonText}
                <ArrowRight className="mr-2" size={20} />
              </button>
              </Link>
            </div>
          </div>
          
          {/* Image/Decoration Side */}
          <div className="w-full lg:w-1/2 relative">
            <div className="relative w-full h-64 md:h-96 lg:h-auto aspect-square mx-auto lg:max-w-lg">
              {/* Main circular image */}
              <div className="absolute inset-0 bg-amber-600 rounded-full overflow-hidden border-8 border-amber-800/30 shadow-2xl">
                {/* Main Image */}
                <Image 
                  src="https://res.cloudinary.com/do88eynar/image/upload/v1745714086/c5x9swyg3xwtbfvhd9wl.webp" 
                  alt="طبق شهي من مطعمنا" 
                  fill
                  style={{ objectFit: 'cover' }}
                  priority
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* Floating Info Cards */}
        <div className="hidden lg:flex justify-between mt-8 max-w-4xl mx-auto">
          <div className="bg-[var(--secondry)] backdrop-blur-sm p-6 rounded-xl shadow-lg w-64 transform hover:-translate-y-1 transition-transform">
            <h3 className="font-bold text-lg mb-2">مكونات طازجة</h3>
            <p className="text-amber-100">نستخدم فقط أجود المكونات الطازجة من المزارع المحلية</p>
          </div>
          
          <div className="bg-[var(--secondry)] backdrop-blur-sm p-6 rounded-xl shadow-lg w-64 transform hover:-translate-y-1 transition-transform">
            <h3 className="font-bold text-lg mb-2">وصفات أصيلة</h3>
            <p className="text-amber-100">وصفات تقليدية متوارثة عبر الأجيال نقدمها بلمسة عصرية</p>
          </div>
          
          <div className="bg-[var(--secondry)] backdrop-blur-sm p-6 rounded-xl shadow-lg w-64 transform hover:-translate-y-1 transition-transform">
            <h3 className="font-bold text-lg mb-2">تجربة فريدة</h3>
            <p className="text-amber-100">أجواء مميزة وخدمة استثنائية تجعل زيارتك لا تُنسى</p>
          </div>
        </div>
      </div>
      
      {/* Bottom Wave Shape */}
      <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-0 rotate-180">
        <svg
          className="relative block w-full h-12 md:h-16"
          data-name="Layer 1"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
        >
          <path
            d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"
            className="fill-[#1B1B1B]"
          ></path>
        </svg>
      </div>
    </div>
  );
};

export default HeroSection;