'use client';

import { useRef, useEffect, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import { ChevronLeft, ChevronRight, ShoppingCart, Heart } from 'lucide-react';
import { useCart } from '@/app/CartContext';
import Image from 'next/image';
import Link from 'next/link';
import type { Swiper as SwiperType } from 'swiper';

interface Meal {
  id: string;
  name: string;
  description: string;
  image: string;
  price: string | number;
  rating: string | number;
}

interface MealSliderProps {
  auto?: boolean;
  title: string;
  products: Meal[];
  sectionId?: string;
}

export default function MealSlider({ auto = false, products = [], sectionId }: MealSliderProps) {
  const swiperRef = useRef<SwiperType | null>(null);
  const { addToCart } = useCart();
  const [isPrevDisabled, setIsPrevDisabled] = useState(true);
  const [isNextDisabled, setIsNextDisabled] = useState(false);
  const [likedItems, setLikedItems] = useState<Set<string>>(new Set());

  const updateButtonStates = () => {
    if (swiperRef.current) {
      setIsPrevDisabled(swiperRef.current.isBeginning);
      setIsNextDisabled(swiperRef.current.isEnd);
    }
  };

  useEffect(() => {
    if (swiperRef.current) {
      updateButtonStates();
    }
  }, []);

  const toggleLike = (mealId: string) => {
    setLikedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(mealId)) {
        newSet.delete(mealId);
      } else {
        newSet.add(mealId);
      }
      return newSet;
    });
  };

  return (
    <div className="relative">
      {/* Navigation Buttons */}
      <div className="hidden md:block">
        <button
          onClick={() => swiperRef.current?.slidePrev()}
          disabled={isPrevDisabled}
          className={`absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-md ${
            isPrevDisabled
              ? 'bg-gray-200 cursor-not-allowed text-gray-400'
              : 'bg-white hover:bg-[#511514] hover:text-white text-gray-700 hover:scale-105'
          }`}
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={() => swiperRef.current?.slideNext()}
          disabled={isNextDisabled}
          className={`absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-md ${
            isNextDisabled
              ? 'bg-gray-200 cursor-not-allowed text-gray-400'
              : 'bg-white hover:bg-[#511514] hover:text-white text-gray-700 hover:scale-105'
          }`}
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Swiper */}
      <Swiper
        modules={auto ? [Navigation, Autoplay] : [Navigation]}
        autoplay={auto ? { delay: 3000, disableOnInteraction: false } : false}
        onSwiper={(swiper) => {
          swiperRef.current = swiper;
          updateButtonStates();
        }}
        onSlideChange={updateButtonStates}
        spaceBetween={14}
        slidesPerView={1.5}
        breakpoints={{
          480: { slidesPerView: 2, spaceBetween: 14 },
          640: { slidesPerView: 2.5, spaceBetween: 16 },
          768: { slidesPerView: 3, spaceBetween: 16 },
          1024: { slidesPerView: 4, spaceBetween: 18 },
          1280: { slidesPerView: 5, spaceBetween: 18 },
        }}
        className="!px-12 md:!px-12"
      >
        {products.map((meal, index) => {
          const name = meal.name || 'بدون اسم';
          const description = meal.description || 'لا يوجد وصف';
          const image = meal.image && meal.image.trim() !== '' ? meal.image : '/fiber.png';
          const price = Number(meal.price) || 0;
          const link = sectionId ? `/products/${encodeURIComponent(sectionId)}/${meal.id}` : '#';
          const isLiked = likedItems.has(meal.id);

          return (
            <SwiperSlide key={meal.id}>
              <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 h-full flex flex-col group border border-gray-100">
                <Link href={link} className="block relative">
                  {/* Image */}
                  <div className="relative aspect-square bg-gray-50 overflow-hidden">
                    <Image
                      src={image}
                      alt={name}
                      fill
                      sizes="(max-width: 480px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      priority={index === 0}
                      loading={index === 0 ? 'eager' : 'lazy'}
                    />

                    {/* Like Button */}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        toggleLike(meal.id);
                      }}
                      className="absolute top-2 left-2 w-8 h-8 bg-white/95 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm hover:scale-110 transition-transform"
                    >
                      <Heart className={`w-4 h-4 ${isLiked ? 'fill-[#511514] text-[#511514]' : 'text-gray-600'}`} />
                    </button>

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </Link>

                {/* Content */}
                <div className="p-3 flex flex-col flex-grow">
                  <Link href={link}>
                    <h3 className="font-bold text-gray-900 mb-1 line-clamp-1 group-hover:text-[#511514] transition text-sm">
                      {name}
                    </h3>
                    <p className="text-xs text-gray-500 mb-3 line-clamp-2 flex-grow leading-relaxed">
                      {description}
                    </p>
                  </Link>

                  <div className="flex  mt-auto pt-3 border-t border-gray-100">
            
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        addToCart({
                          ...meal,
                          id: meal.id,
                          quantity: 1,
                          price,
                        });
                      }}
                      className="bg-[#511514] hover:bg-[#3d0f0f] text-white p-2 rounded-lg transition-all shadow-sm hover:shadow-md hover:scale-105 active:scale-95"
                      title="أضف للسلة"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      
                    </button>
                    <span className="mr-3 font-bold text-gray-900 text-sm flex items-center">
                      اضف إلى السلة
                      </span>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          );
        })}
      </Swiper>

      {/* Mobile Navigation */}
      <div className="flex md:hidden justify-center gap-3 mt-4">
        <button
          onClick={() => swiperRef.current?.slideNext()}
          disabled={isNextDisabled}
          className={`w-9 h-9 rounded-full flex items-center justify-center transition-all shadow-md ${
            isNextDisabled
              ? 'bg-gray-200 cursor-not-allowed text-gray-400'
              : 'bg-white hover:bg-[#511514] hover:text-white text-gray-700'
          }`}
        >
          <ChevronRight className="w-4 h-4" />
        </button>
        <button
          onClick={() => swiperRef.current?.slidePrev()}
          disabled={isPrevDisabled}
          className={`w-9 h-9 rounded-full flex items-center justify-center transition-all shadow-md ${
            isPrevDisabled
              ? 'bg-gray-200 cursor-not-allowed text-gray-400'
              : 'bg-white hover:bg-[#511514] hover:text-white text-gray-700'
          }`}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}