"use client";

import { db } from "@/app/api/firebase";
import { useCart } from "@/app/CartContext";
import MealSlider from "@/components/MealSlider";
import ProgressAnim from "@/components/ProgressAnim";
import ShareButton from "@/components/ShareButton";
import { doc, getDoc } from "firebase/firestore";
import { ShoppingCart, ArrowRight, AlertCircle, Check, Heart, Truck, Ruler, Palette, Sparkles, Box, Aperture } from "lucide-react";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import useSWR from "swr";
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';

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

const fetcher = async ({ sectionId }: { sectionId: string }) => {
  try {
    const docRef = doc(db, "Parts", sectionId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      const meals: Meal[] = (data.products || [])
        .filter((meal: Meal) => meal.id)
        .map((meal: Meal) => ({
          id: meal.id,
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
  const sectionId = rawSectionId ? decodeURIComponent(rawSectionId as string) : "";
  const { addToCart } = useCart();
  const [initialData, setInitialData] = useState<Category | undefined>(undefined);
  const [isCacheValid, setIsCacheValid] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [isLiked, setIsLiked] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && sectionId) {
      const cachedData = localStorage.getItem(`category-${sectionId}`);
      const cachedTimestamp = localStorage.getItem(`category-${sectionId}-timestamp`);
      const currentTime = new Date().getTime();

      if (cachedData && cachedTimestamp && currentTime - parseInt(cachedTimestamp) < 60 * 60 * 1000) {
        setInitialData(JSON.parse(cachedData));
        setIsCacheValid(true);
      }
    }
  }, [sectionId]);

  const { data: category, error, isLoading, mutate } = useSWR(
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
          localStorage.setItem(`category-${sectionId}-timestamp`, new Date().getTime().toString());
        }
      },
    }
  );

  const product = category?.meals.find((meal) => meal.id === productId);

  const handleAddToCart = () => {
    if (product) {
      addToCart({
        ...product,
        id: product.id,
        quantity: quantity,
        price: Number(product.price) || 0,
      });
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 2000);
    }
  };

  if (isLoading && !category) {
    return <ProgressAnim />;
  }

  if (error || !category) {
    return (
      <div className="min-h-screen bg-[#faf8f6] flex justify-center items-center px-4 ">
        <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-lg border border-[#511514]/10">
          <div className="w-14 h-14 bg-[#511514]/10 rounded-full flex items-center justify-center mx-auto mb-3">
            <AlertCircle className="w-7 h-7 text-[#511514]" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 text-center mb-2">حدث خطأ!</h3>
          <p className="text-gray-600 text-center text-sm mb-5">
            {error?.message || "حدث خطأ أثناء جلب البيانات"}
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => mutate()}
              className="flex-1 bg-[#511514] hover:bg-[#3d0f0f] text-white px-5 py-2.5 rounded-lg font-semibold transition shadow-md"
            >
              إعادة المحاولة
            </button>
            <Link href="/products" className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 px-5 py-2.5 rounded-lg font-semibold transition text-center">
              العودة
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#faf8f6] flex justify-center items-center px-4 pt-20">
        <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-lg border border-[#511514]/10 text-center">
          <div className="w-14 h-14 bg-[#511514]/10 rounded-full flex items-center justify-center mx-auto mb-3">
            <AlertCircle className="w-7 h-7 text-[#511514]" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">المنتج غير موجود</h3>
          <p className="text-gray-600 text-sm mb-5">عذراً، لم نتمكن من العثور على هذا المنتج</p>
          <Link href="/products" className="inline-flex items-center gap-2 text-gray-600 hover:text-[#511514] mb-6 transition group bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg shadow-sm"
>
            العودة إلى القائمة
          </Link>
        </div>
      </div>
    );
  }

  const otherProducts = category.meals.filter((meal) => meal.id !== productId);

  return (
    <div className="min-h-screen bg-[#faf8f6] py-4 px-4 sm:px-6 lg:px-8 pt-20">
 <Head>
  <title>{`${product.name} - ${category.title}`}</title>
  <meta name="description" content={product.description} />

  {/* ✅ Open Graph (Facebook / WhatsApp / Telegram) */}
  <meta property="og:type" content="product" />
  <meta property="og:title" content={`${product.name} - ${category.title}`} />
  <meta property="og:description" content={product.description} />
  <meta property="og:image" content={product.image || "/logo.png"} />
  <meta property="og:url" content={`https://pontex-woad.vercel.app/products/${encodeURIComponent(sectionId)}/${product.id}`} />
  <meta property="og:site_name" content="PonTex" />
  <meta property="og:locale" content="ar_AR" />

  {/* ✅ Twitter Cards */}
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={`${product.name} - ${category.title}`} />
  <meta name="twitter:description" content={product.description} />
  <meta name="twitter:image" content={product.image || "/logo.png"} />

  {/* ✅ تحسين لمحركات البحث */}
  <link rel="canonical" href={`https://pontex-woad.vercel.app/products/${encodeURIComponent(sectionId)}/${product.id}`} />
</Head>


      <div className="max-w-6xl mx-auto">
        {/* Navigation */}
        <Link
          href="/products"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-[#511514] mb-6 transition group bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg shadow-sm"
        >
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          <span className="text-sm font-medium">العودة إلى المنتجات</span>
        </Link>

        {/* Product Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10 mb-12">
          {/* Image Gallery */}
          <div className="order-2 lg:order-1">
            <div className="lg:sticky lg:top-4">
              <div className="relative aspect-square rounded-2xl overflow-hidden bg-white shadow-lg group border border-gray-100 max-w-sm mx-auto">
                <Image
                  src={product.image || "/placeholder.svg"}
                  alt={product.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  onClick={() => setOpen(true)}
                />
                <Lightbox
        open={open}
        close={() => setOpen(false)}
        slides={[
          { src: product.image || '/placeholder.svg' },
          // { src: product.image || '/placeholder.svg' },
          // { src: product.image || '/placeholder.svg' },
        ]}
      />
                {/* Like Button */}
                <button
                  onClick={() => setIsLiked(!isLiked)}
                  className="absolute top-3 right-3 w-10 h-10 bg-white/95 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform"
                >
                  <Heart className={`w-5 h-5 ${isLiked ? 'fill-[#511514] text-[#511514]' : 'text-gray-600'}`} />
                </button>

                {/* Quality Badge */}
                <div className="absolute top-3 left-3 bg-[#511514]/80 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-md flex items-center gap-1.5">
                  {/* <Sparkles className="w-3.5 h-3.5" /> */}
                  <Aperture className="w-3.5 h-3.5" />
                  جودة ممتازة
                </div>
              </div>
            </div>
          </div>

          {/* Product Info */}
          <div className="order-1 lg:order-2">
            <div className="lg:sticky lg:top-4 space-y-4">
              {/* Category Badge */}
              <div className="inline-flex items-center gap-2 bg-[#511514]/5 text-[#511514] px-4 py-2 rounded-full text-sm font-bold border border-[#511514]/10">
                <Box className="w-3.5 h-3.5" />
                {category.title}
              </div>

              {/* Title */}
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight">
                {product.name}
              </h1>

              {/* Description */}
              <p className="text-gray-600 text-base leading-relaxed">
                {product.description}
              </p>



              {/* Action Buttons */}
              <div className="space-y-2.5">
                <button
                  onClick={handleAddToCart}
                  disabled={addedToCart}
                  className={`w-full py-3 rounded-xl font-bold text-base transition-all duration-300 flex items-center justify-center gap-2.5 shadow-md ${
                    addedToCart
                      ? 'bg-green-600 text-white scale-95'
                      : 'bg-[#511514] hover:bg-[#3d0f0f] text-white hover:shadow-lg hover:scale-[1.02] active:scale-95'
                  }`}
                >
                  {addedToCart ? (
                    <>
                      <Check className="w-5 h-5" />
                      <span>تمت الإضافة </span>
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-5 h-5" />
                      <span>أضف إلى السلة</span>
                    </>
                  )}
                </button>

                <ShareButton
                  url={`https://pontex-woad.vercel.app//products/${encodeURIComponent(sectionId)}/${product.id}`}
                  title={product.name}
                />
              </div>

              {/* Features */}
              <div className="grid grid-cols-3 gap-3 bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                <div className="text-center">
                  <Truck className="w-6 h-6 text-[#511514] mx-auto mb-1.5" />
                  <p className="text-xs font-bold text-gray-900">توصيل سريع</p>
                  <p className="text-xs text-gray-500 mt-0.5">لجميع البلدان</p>
                </div>
                <div className="text-center">
                  <Ruler className="w-6 h-6 text-[#511514] mx-auto mb-1.5" />
                  <p className="text-xs font-bold text-gray-900">كميات كبيرة</p>
                  <p className="text-xs text-gray-500 mt-0.5">حسب الطلب</p>
                </div>
                <div className="text-center">
                  <Palette className="w-6 h-6 text-[#511514] mx-auto mb-1.5" />
                  <p className="text-xs font-bold text-gray-900">ألوان متنوعة</p>
                  <p className="text-xs text-gray-500 mt-0.5">خيارات كثيرة</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {otherProducts.length > 0 && (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
                أقمشة مشابهة
              </h2>
              <p className="text-gray-600 text-sm">من قسم {category.title}</p>
            </div>
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