'use client';

import { useRef, useEffect, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay, EffectCoverflow } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-coverflow';
import { ChevronLeft, ChevronRight, ShoppingCart, Star } from 'lucide-react';
import { useCart } from '@/app/CartContext';
import Image from 'next/image';
import Link from 'next/link';

interface Meal {
  id: string;
  name: string;
  description: string;
  image: string;
  price: string;
  rating: string | number;
}

interface MealSliderProps {
  auto?: boolean;
  title: string;
  products: Meal[];
  sectionId?: string;
}

export default function MealSlider({ auto = false, title, products = [], sectionId }: MealSliderProps) {
  const prevRef = useRef<HTMLButtonElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);
  const mobilePrevRef = useRef<HTMLButtonElement>(null);
  const mobileNextRef = useRef<HTMLButtonElement>(null);
  const swiperRef = useRef<any>(null);
  const { addToCart } = useCart();
  const [isPrevDisabled, setIsPrevDisabled] = useState(true);
  const [isNextDisabled, setIsNextDisabled] = useState(false);

  useEffect(() => {
    if (
      swiperRef.current &&
      swiperRef.current.params &&
      swiperRef.current.params.navigation &&
      typeof swiperRef.current.params.navigation !== 'boolean'
    ) {
      swiperRef.current.params.navigation.prevEl = [prevRef.current, mobilePrevRef.current];
      swiperRef.current.params.navigation.nextEl = [nextRef.current, mobileNextRef.current];
      swiperRef.current.navigation.init();
      swiperRef.current.navigation.update();
    }
  }, []);

  const updateButtonStates = () => {
    if (swiperRef.current) {
      setIsPrevDisabled(swiperRef.current.isBeginning);
      setIsNextDisabled(swiperRef.current.isEnd);
    }
  };

  console.log("MealSlider props:", { title, sectionId, products });

  return (
    <div className="max-w-6xl mx-auto py-12 px-4 bg-[var(--clr-primary)] rounded-xl shadow-2xl my-10 relative overflow-hidden">
      <div className="relative z-10">
        <div className="flex justify-between items-center mb-10">
          <h2 className="text-3xl font-bold text-white text-center w-full">
            <span className="text-yellow-500">{title}</span>
          </h2>
          <div className="hidden sm:flex gap-2">
            <button
              ref={prevRef}
              className={`p-2 rounded-lg shadow-md transition text-white ${
                isPrevDisabled
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-yellow-600 hover:bg-yellow-500'
              }`}
              disabled={isPrevDisabled}
              aria-disabled={isPrevDisabled}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <button
              ref={nextRef}
              className={`p-2 rounded-lg shadow-md transition text-white ${
                isNextDisabled
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-yellow-600 hover:bg-yellow-500'
              }`}
              disabled={isNextDisabled}
              aria-disabled={isNextDisabled}
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
            updateButtonStates();
          }}
          onSlideChange={updateButtonStates}
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
          {products.map((meal) => {
            const name = meal.name || 'بدون اسم';
            const description = meal.description || 'لا يوجد وصف';
            const image = meal.image && meal.image.trim() !== '' ? meal.image : '/placeholder.svg';
            const price = meal.price || 'غير محدد';
            const rating = meal.rating || 4.0;

            const link = sectionId ? `/menu/${encodeURIComponent(sectionId)}/${meal.id}` : '#';
            console.log("Meal link:", { sectionId, mealId: meal.id, href: link });

            return (
              <SwiperSlide key={meal.id}>
                <Link href={link} className="block" aria-label={`عرض تفاصيل ${name}`}>
                  <div className="bg-[var(--background)] rounded-2xl overflow-hidden transition-all duration-300 group h-full flex flex-col border border-[var(--secondry)]">
                    <div className="relative overflow-hidden">
                      <Image
                        src={image}
                        alt={name}
                        width={400}
                        height={224}
                        className="w-full h-56 object-cover transform group-hover:scale-110 transition-transform duration-500"
                        priority={products.indexOf(meal) === 0}
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
                        <p className="text-yellow-500 font-bold text-lg">{price} جنيه</p>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            addToCart({
                              ...meal,
                              id: meal.id,
                              quantity: 1,
                              price: Number(meal.price) || 0,
                            });
                          }}
                          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-all duration-300 flex items-center gap-2 transform hover:scale-105"
                        >
                          <ShoppingCart className="w-4 h-4" />
                          <span>أضف للسلة</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </Link>
              </SwiperSlide>
            );
          })}
        </Swiper>

        <button
          ref={mobilePrevRef}
          className={`absolute top-1/2 -translate-y-1/2 left-2 p-3 rounded-full shadow-md transition text-white z-20 sm:hidden ${
            isPrevDisabled
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-yellow-600 hover:bg-yellow-500'
          }`}
          disabled={isPrevDisabled}
          aria-disabled={isPrevDisabled}
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          ref={mobileNextRef}
          className={`absolute top-1/2 -translate-y-1/2 right-2 p-3 rounded-full shadow-md transition text-white z-20 sm:hidden ${
            isNextDisabled
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-yellow-600 hover:bg-yellow-500'
          }`}
          disabled={isNextDisabled}
          aria-disabled={isNextDisabled}
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}