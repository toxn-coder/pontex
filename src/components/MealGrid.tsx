"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, Star } from "lucide-react";
import { useCart } from "@/app/CartContext";

interface Meal {
  id: string;
  name: string;
  description: string;
  image: string;
  price: string | number;
  rating: string | number;
}

interface MealGridProps {
  title: string;
  products: Meal[];
  sectionId?: string;
  isVisible?: boolean; // ✅ إضافة البروب الجديد
}

export default function MealGrid({ title, products = [], sectionId, isVisible = true }: MealGridProps) {
  const { addToCart } = useCart();

  // ✅ لو isVisible = false ما يظهرش القسم
  if (!isVisible) {
    return null;
  }

  return (
    <div className="max-w-6xl mx-auto py-12 px-4 bg-[var(--clr-primary)] rounded-xl shadow-2xl my-10">
      {/* عنوان القسم */}
      <div className="mb-10 text-center">
        <h2 className="text-3xl font-bold text-white">
          <span className="text-yellow-500">{title}</span>
        </h2>
      </div>

      {/* شبكة المنتجات */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {products.map((meal, index) => {
          const name = meal.name || "بدون اسم";
          const description = meal.description || "لا يوجد وصف";
          const image =
            meal.image && meal.image.trim() !== "" ? meal.image : "/placeholder.png";
          const price = Number(meal.price) || 0;
          const rating = Number(meal.rating) || 4.0;

          const link = sectionId
            ? `/products/${encodeURIComponent(sectionId)}/${meal.id}`
            : "#";

          return (
            <Link
              key={meal.id}
              href={link}
              className="block"
              aria-label={`عرض تفاصيل ${name}`}
            >
              <div className="bg-[var(--background)] rounded-2xl overflow-hidden transition-all duration-300 group h-full flex flex-col border border-[var(--secondry)]">
                {/* صورة المنتج */}
                <div className="relative w-full h-56 overflow-hidden flex justify-center items-center">
                  {image === "/placeholder.png" ? (
                    <Image
                      src={image}
                      alt={name}
                      width={126}
                      height={126}
                      className="object-contain opacity-70"
                      priority={index < 3}
                    />
                  ) : (
                    <Image
                      src={image}
                      alt={name}
                      fill
                      sizes="(max-width: 768px) 100vw, 400px"
                      className="object-cover transform group-hover:scale-110 transition-transform duration-500"
                      priority={index < 3}
                      loading={index < 3 ? "eager" : "lazy"}
                    />
                  )}

                  <div className="absolute top-3 right-3 bg-yellow-600 text-white rounded-full px-2 py-1 text-xs font-bold flex items-center gap-1">
                    <Star className="w-3 h-3 fill-white" />
                    {rating.toFixed(1)}
                  </div>
                </div>

                {/* تفاصيل المنتج */}
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
                          price,
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
          );
        })}
      </div>
    </div>
  );
}
