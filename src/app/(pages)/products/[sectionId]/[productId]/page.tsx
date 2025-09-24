"use client";

import { db } from "@/app/api/firebase";
import { useCart } from "@/app/CartContext";
import MealSlider from "@/components/MealSlider";
import ProgressAnim from "@/components/ProgressAnim";
import ShareButton from "@/components/ShareButton";
import { doc, getDoc } from "firebase/firestore";
import { ShoppingCart, Star } from "lucide-react";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import useSWR from "swr";

// واجهات البيانات
interface Meal {
  id: string;
  name: string;
  description: string;
  image: string;
  price: string;
  rating: string | number;
}

interface Category {
  id: string;
  title: string;
  meals: Meal[];
}

// دالة جلب البيانات
const fetcher = async ({ sectionId }: { sectionId: string }) => {
  try {
    const docRef = doc(db, "Parts", sectionId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      const meals: Meal[] = (data.products || [])
        .filter((meal: Meal) => meal.id) // نتأكد أنو عندو id
        .map((meal: Meal) => ({
          id: meal.id, // بدون temp-id
          name: meal.name || "بدون اسم",
          description: meal.description || "لا يوجد وصف",
          image: meal.image || "/placeholder.png",
          price: meal.price || "غير محدد",
          rating: meal.rating || "بدون تقييم",
        }));
      return {
        id: docSnap.id,
        title: data.name || docSnap.id,
        meals,
      };
    }
    throw new Error(`القسم بمعرف ${sectionId} غير موجود.`);
  } catch (err) {
    console.error("خطأ في جلب البيانات:", err);
    throw err;
  }
};

export default function ProductPage() {
  const { sectionId: rawSectionId, productId } = useParams();
  const sectionId = rawSectionId
    ? decodeURIComponent(rawSectionId as string)
    : "";
  const { addToCart } = useCart();
  const [initialData, setInitialData] = useState<Category | undefined>(
    undefined
  );
  const [isCacheValid, setIsCacheValid] = useState(false);

  // تحميل البيانات من localStorage
  useEffect(() => {
    if (typeof window !== "undefined" && sectionId) {
      const cachedData = localStorage.getItem(`category-${sectionId}`);
      const cachedTimestamp = localStorage.getItem(
        `category-${sectionId}-timestamp`
      );
      const currentTime = new Date().getTime();

      if (
        cachedData &&
        cachedTimestamp &&
        currentTime - parseInt(cachedTimestamp) < 60 * 60 * 1000
      ) {
        setInitialData(JSON.parse(cachedData));
        setIsCacheValid(true);
      }
    }
  }, [sectionId]);

  const {
    data: category,
    error,
    isLoading,
    mutate,
  } = useSWR(
    sectionId ? { key: `category-${sectionId}`, sectionId } : null,
    fetcher,
    {
      refreshInterval: 60 * 60 * 1000,
      revalidateOnFocus: false,
      revalidateOnMount: !isCacheValid,
      dedupingInterval: 60 * 1000,
      keepPreviousData: true,
      fallbackData: initialData,
      onSuccess: (data) => {
        if (typeof window !== "undefined") {
          localStorage.setItem(`category-${sectionId}`, JSON.stringify(data));
          localStorage.setItem(
            `category-${sectionId}-timestamp`,
            new Date().getTime().toString()
          );
        }
      },
    }
  );

  const product = category?.meals.find((meal) => meal.id === productId);

  if (isLoading && !category) {
    return <ProgressAnim />;
  }

  if (error || !category) {
    return (
      <div className="min-h-screen bg-[var(--clr-primary)] flex justify-center items-center flex-col gap-4">
        <p className="text-red-400 text-lg">
          {error?.message ||
            "حدث خطأ أثناء جلب البيانات. حاول مرة أخرى لاحقًا."}
        </p>
        <button
          onClick={() => mutate()}
          className="bg-yellow-600 text-white px-4 py-2 rounded-lg"
        >
          إعادة المحاولة
        </button>
        <Link href="/products" className="text-yellow-500 hover:underline mt-2">
          العودة إلى القائمة
        </Link>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[var(--clr-primary)] flex justify-center items-center flex-col gap-4">
        <p className="text-gray-300 text-lg">المنتج غير موجود.</p>
        <Link href="/products" className="text-yellow-500 hover:underline">
          العودة إلى القائمة
        </Link>
      </div>
    );
  }

  const otherProducts = category.meals.filter((meal) => meal.id !== productId);

  return (
    <div className="min-h-screen bg-[var(--clr-primary)] py-8 px-4 sm:px-6">
      <Head>
        <title>{`${product.name} - ${category.title} - سوق الكتروني`}</title>
        <meta
          name="description"
          content={`${product.description} - استمتع بتسوق في متجرنا ${category.title} `}
        />
        <meta
          name="keywords"
          content={`شاورما, ${product.name}, ${category.title}, متجر الكتروني`}
        />
        <meta
          property="og:title"
          content={`${product.name} - ${category.title}`}
        />
        <meta
          property="og:description"
          content={`${product.description} - تسوق منتجات فاخرة ${category.title} `}
        />
        <meta property="og:image" content={product.image || "/logo.png"} />
        <meta
          property="og:url"
          content={`https://waly-damascus.vercel.app/products/${encodeURIComponent(
            sectionId
          )}/${productId}`}
        />
        <meta property="og:type" content="website" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta charSet="UTF-8" />
      </Head>

      <div className="max-w-6xl mx-auto">
        {/* زر العودة */}
        <Link
          href="/products"
          className="text-yellow-500 hover:underline mb-4 block text-lg font-medium"
        >
          العودة إلى القائمة
        </Link>

        {/* تفاصيل المنتج */}
        <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8 mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 lg:gap-10">
            <div className="relative w-full aspect-[4/3]">
              <Image
                src={product.image || "/placeholder.svg"}
                alt={product.name}
                fill
                className="object-cover rounded-lg"
                priority
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 40vw"
              />
              <div className="absolute top-3 right-3 bg-yellow-600 text-white rounded-full px-3 py-1 text-sm font-bold flex items-center gap-1">
                <Star className="w-4 h-4 fill-white" />
                {product.rating || 4.0}
              </div>
            </div>
            <div className="flex flex-col justify-between gap-6">
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-3 sm:mb-4 lg:mb-5">
                  {product.name}
                </h1>
                <p className="text-gray-600 text-sm sm:text-base lg:text-lg mb-4 sm:mb-5 lg:mb-6">
                  {product.description || "لا يوجد وصف"}
                </p>
                <p className="text-yellow-500 font-bold text-xl sm:text-2xl lg:text-3xl mb-4 sm:mb-5 lg:mb-6">
                  {product.price || "غير محدد"} جنيه
                </p>
              </div>
              <ShareButton
                url={`https://test-ecommerce-toxn.vercel.app/products/${encodeURIComponent(
                  sectionId
                )}/${product.id}`}
                title={product.name}
              />

              <button
                onClick={() =>
                  addToCart({
                    ...product,
                    id: product.id,
                    quantity: 1,
                    price: Number(product.price) || 0,
                  })
                }
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 sm:px-8 sm:py-4 rounded-lg transition-all duration-300 flex items-center justify-center gap-3 w-full sm:w-auto text-base sm:text-lg lg:text-xl shadow-md hover:shadow-lg"
              >
                <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6" />
                <span>أضف للسلة</span>
              </button>
            </div>
          </div>
        </div>

        {/* باقي المنتجات في القسم */}
        {otherProducts.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-white mb-6">
              المزيد من{" "}
              <span className="text-yellow-500">{category.title}</span>
            </h2>
            <MealSlider
              title={category.title}
              products={otherProducts}
              sectionId={sectionId}
              auto={false}
            />
          </div>
        )}
      </div>
    </div>
  );
}
