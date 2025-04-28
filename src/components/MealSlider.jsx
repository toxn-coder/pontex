'use client';

import { useRef, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay, EffectCoverflow } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-coverflow';
import { ChevronLeft, ChevronRight, ShoppingCart, Star } from 'lucide-react';
import { useCart } from '@/app/CartContext';

export default function MealSlider({ auto = false, title, products = [] }) {
  const prevRef = useRef(null);
  const nextRef = useRef(null);
  const swiperRef = useRef(null);
  const { addToCart } = useCart();

  useEffect(() => {
    if (swiperRef.current && swiperRef.current.params && swiperRef.current.params.navigation) {
      swiperRef.current.params.navigation.prevEl = prevRef.current;
      swiperRef.current.params.navigation.nextEl = nextRef.current;
      swiperRef.current.navigation.init();
      swiperRef.current.navigation.update();
    }
  }, []);

  return (
    <div className="max-w-6xl mx-auto py-12 px-4 bg-[var(--clr-primary)] rounded-xl shadow-2xl my-10 relative overflow-hidden">
      <div className="relative z-10">
        <div className="flex justify-between items-center mb-10">
          <h2 className="text-3xl font-bold text-white text-center w-full">
            <span className="text-yellow-500 text-center w-full">{title}</span>
          </h2>
          <div className="flex gap-2">
            <button
              ref={prevRef}
              className="bg-yellow-600 p-2 rounded-lg shadow-md hover:bg-yellow-500 transition text-white"
            >
            <ChevronRight className="w-5 h-5" />
            </button>
            <button
              ref={nextRef}
              className="bg-yellow-600 p-2 rounded-lg shadow-md hover:bg-yellow-500 transition text-white"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          </div>
        </div>

        <Swiper
          modules={auto ? [Navigation, Autoplay, EffectCoverflow] : [Navigation, EffectCoverflow]}
          effect="coverflow"
          coverflowEffect={{
            rotate: 0,
            stretch: 0,
            depth: 100,
            modifier: 1,
            slideShadows: true,
          }}
          autoplay={auto ? { delay: 3000, disableOnInteraction: false } : false}
          onSwiper={(swiper) => {
            swiperRef.current = swiper;
          }}
          spaceBetween={30}
          slidesPerView={1}
          breakpoints={{
            640: { slidesPerView: 1.5 },
            768: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
            1280: { slidesPerView: 3.5 },
          }}
          className="py-10"
        >
          {products.map((meal, index) => {
            const name = meal.name || 'بدون اسم';
            const description = meal.description || 'لا يوجد وصف';
            const image = meal.image || 'https://res.cloudinary.com/do88eynar/image/upload/v1745645765/iyucm5jdwndkigern2ng.webp';
            const price = meal.price || 'غير محدد';
            const rating = meal.rating || 'بدون تقييم';

            return (
              <SwiperSlide key={index}>
                <div className="bg-[var(--background)] rounded-2xl overflow-hidden transition-all duration-300 group h-full flex flex-col border border-[var(--secondry)]">
                  <div className="relative overflow-hidden">
                    <img
                      src={image}
                      alt={name}
                      className="w-full h-56 object-cover transform group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute top-3 right-3 bg-yellow-600 text-white rounded-full px-2 py-1 text-xs font-bold flex items-center gap-1">
                      <Star className="w-3 h-3 fill-white" />
                      {rating}
                    </div>
                  </div>

                  <div className="p-5 flex flex-col flex-grow">
                    <h3 className="text-xl font-bold text-black mb-2">{name}</h3>
                    <p className="text-gray-400 text-sm mb-4 flex-grow">{description}</p>

                    <div className="flex justify-between items-center mt-auto">
                      <p className="text-yellow-500 font-bold text-lg">{price}</p>
                      <button
                        onClick={() => addToCart(meal)}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-all duration-300 flex items-center gap-2 transform hover:scale-105"
                      >
                        <ShoppingCart className="w-4 h-4" />
                        <span>أضف للسلة</span>
                      </button>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            );
          })}
        </Swiper>
      </div>
    </div>
  );
}