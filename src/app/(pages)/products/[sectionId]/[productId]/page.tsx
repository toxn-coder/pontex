'use client';

import { db } from "@/app/api/firebase";
import { useCart } from "@/app/CartContext";
import MealSlider from "@/components/MealSlider";
import ProgressAnim from "@/components/ProgressAnim";
import ShareButton from "@/components/ShareButton";
import { doc, getDoc } from "firebase/firestore";
import { ShoppingCart, ArrowRight, AlertCircle, Check, Heart, Truck, Ruler, Palette, Sparkles, Box, Aperture, ChevronLeft, ChevronRight, MoveVertical, MoveHorizontal, Scale } from "lucide-react";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import useSWR from "swr";
import Lightbox from 'yet-another-react-lightbox';
import Zoom from 'yet-another-react-lightbox/plugins/zoom';
import Fullscreen from 'yet-another-react-lightbox/plugins/fullscreen';
import 'yet-another-react-lightbox/styles.css';
import { Product } from '@/types/product';

interface Category {
  id: string;
  title: string;
  meals: Product[];
}

const fetcher = async ({ sectionId }: { sectionId: string }) => {
  try {
    const docRef = doc(db, "Parts", sectionId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      const meals: Product[] = (data.products || [])
        .filter((meal: any) => meal.id)
        .map((meal: any) => ({
          id: meal.id,
          name: meal.name || "بدون اسم",
          description: meal.description || "لا يوجد وصف",
          image: meal.image || "/placeholder.png",
          additionalImages: meal.additionalImages || [],
          price: meal.price || "غير محدد",
          width: meal.width || "العرض محدد",
          height: meal.height || "الطول محدد",
          weight: meal.weight || "الوزن محدد",
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
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // للسلايدر
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // لـ Image Zoom داخل الدائرة
  const imgContainerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const lensRef = useRef<HTMLDivElement>(null);
  const [showZoom, setShowZoom] = useState(false);
  const zoomLevel = 4; // 4x تكبير داخل الدائرة
  const lensSize = 120; // حجم الدائرة (px) - غير هنا لتغيير الحجم

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

  // تحديث حالة الأزرار عند التمرير
  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
    }
  };

  useEffect(() => {
    checkScroll();
    const ref = scrollRef.current;
    if (ref) {
      const handler = () => checkScroll();
      ref.addEventListener('scroll', handler);
      window.addEventListener('resize', handler);
      return () => {
       

 ref.removeEventListener('scroll', handler);
        window.removeEventListener('resize', handler);
      };
    }
  }, [product?.additionalImages.length]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = scrollRef.current.clientWidth * 0.8;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
      setTimeout(checkScroll, 300);
    }
  };

  // دالة Image Zoom داخل الدائرة مع سلاسة فائقة وتكبير من نقطة الماوس بالضبط (إصلاح كامل للـ offset)
  const initZoom = () => {
    const img = imgRef.current;
    const lens = lensRef.current;
    const container = imgContainerRef.current;
    if (!img || !lens || !container) return;

    lens.style.width = `${lensSize}px`;
    lens.style.height = `${lensSize}px`;
    lens.style.backgroundColor = 'transparent';

    let rafId: number = 0;
    let lastX = 0; // إحداثيات على الصورة الأصلية (natural)
    let lastY = 0;

    const updateZoom = () => {
      if (!img?.complete || img.naturalWidth === 0) return;
      const imgWidth = img.naturalWidth;
      const imgHeight = img.naturalHeight;
      lens.style.backgroundImage = `url(${img.src})`;
      lens.style.backgroundSize = `${imgWidth * zoomLevel}px ${imgHeight * zoomLevel}px`;
      lens.style.backgroundRepeat = 'no-repeat';
    };

    // تحديث فوري إذا محملة
    if (img.complete && img.naturalWidth > 0) {
      updateZoom();
    }

    const loadHandler = () => updateZoom();
    img.addEventListener('load', loadHandler);

    const animate = () => {
      if (!img) return;
      const rect = container.getBoundingClientRect(); // استخدم container بدل img لأن img fill
      const containerWidth = rect.width;
      const containerHeight = rect.height;

      // نسبة التحجيم: natural / displayed
      const ratioX = img.naturalWidth / containerWidth;
      const ratioY = img.naturalHeight / containerHeight;

      let lensX = lastX - lensSize / 2;
      let lensY = lastY - lensSize / 2;

      // حدود على natural dimensions
      lensX = Math.max(0, Math.min(lensX, img.naturalWidth - lensSize));
      lensY = Math.max(0, Math.min(lensY, img.naturalHeight - lensSize));

      // موضع الدائرة على الشاشة (displayed)
      lens.style.left = `${lensX / ratioX}px`;
      lens.style.top = `${lensY / ratioY}px`;

      // تكبير داخل الدائرة: مركز الماوس بالضبط
      lens.style.backgroundPosition = `-${lensX * zoomLevel}px -${lensY * zoomLevel}px`;

      rafId = requestAnimationFrame(animate);
    };

    const moveLens = (e: MouseEvent | TouchEvent) => {
      if (!img?.complete || img.naturalWidth === 0) return;
      e.preventDefault();
      const rect = container.getBoundingClientRect();
      let clientX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
      let clientY = 'touches' in e ? e.touches[0].clientY : (e as MouseEvent).clientY;

      // إحداثيات نسبي للـ container (displayed)
      let x = clientX - rect.left;
      let y = clientY - rect.top;

      // تحويل إلى natural coordinates
      const ratioX = img.naturalWidth / rect.width;
      const ratioY = img.naturalHeight / rect.height;
      lastX = x * ratioX;
      lastY = y * ratioY;
    };

    const handleEnter = () => {
      if (img?.complete && img.naturalWidth > 0) {
        updateZoom();
        setShowZoom(true);
        rafId = requestAnimationFrame(animate);
      }
    };

    const handleLeave = () => {
      setShowZoom(false);
      if (rafId) cancelAnimationFrame(rafId);
    };

    container.addEventListener('mouseenter', handleEnter);
    container.addEventListener('mousemove', moveLens as EventListener, { passive: false });
    container.addEventListener('touchstart', handleEnter, { passive: true });
    container.addEventListener('touchmove', moveLens as EventListener, { passive: false });
    container.addEventListener('mouseleave', handleLeave);
    container.addEventListener('touchend', handleLeave);

    return () => {
      img.removeEventListener('load', loadHandler);
      if (rafId) cancelAnimationFrame(rafId);
      container.removeEventListener('mouseenter', handleEnter);
      container.removeEventListener('mousemove', moveLens as EventListener);
      container.removeEventListener('touchstart', handleEnter);
      container.removeEventListener('touchmove', moveLens as EventListener);
      container.removeEventListener('mouseleave', handleLeave);
      container.removeEventListener('touchend', handleLeave);
    };
  };

  useEffect(() => {
    if (product?.image && imgRef.current) {
      const cleanup = initZoom();
      return cleanup;
    }
  }, [product?.image]);

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

  if (isLoading && !category) return <ProgressAnim />;
  if (error || !category) {
    return (
      <div className="min-h-screen bg-[#faf8f6] flex justify-center items-center px-4">
        <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-lg border border-[#511514]/10">
          <div className="w-14 h-14 bg-[#511514]/10 rounded-full flex items-center justify-center mx-auto mb-3">
            <AlertCircle className="w-7 h-7 text-[#511514]" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 text-center mb-2">حدث خطأ!</h3>
          <p className="text-gray-600 text-center text-sm mb-5">
            {error?.message || "حدث خطأ أثناء جلب البيانات"}
          </p>
          <div className="flex gap-3">
            <button onClick={() => mutate()} className="flex-1 bg-[#511514] hover:bg-[#3d0f0f] text-white px-5 py-2.5 rounded-lg font-semibold transition shadow-md">
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
          <Link href="/products" className="inline-flex items-center gap-2 text-gray-600 hover:text-[#511514] mb-6 transition group bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg shadow-sm">
            العودة إلى القائمة
          </Link>
        </div>
      </div>
    );
  }

  const allImages = [product.image, ...(product.additionalImages || [])].map(src => ({ src }));
  const otherProducts = category.meals.filter((meal) => meal.id !== productId);

  return (
    <div className="min-h-screen bg-[#faf8f6] py-4 px-4 sm:px-6 lg:px-8 pt-20">
      <Head>
        <title>{`${product.name} - ${category.title}`}</title>
        <meta name="description" content={product.description} />
        <meta property="og:type" content="product" />
        <meta property="og:title" content={`${product.name} - ${category.title}`} />
        <meta property="og:description" content={product.description} />
        <meta property="og:image" content={product.image || "/logo.png"} />
        <meta property="og:url" content={`https://pontex-woad.vercel.app/products/${encodeURIComponent(sectionId)}/${product.id}`} />
        <meta property="og:site_name" content="PonTex" />
        <meta property="og:locale" content="ar_AR" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${product.name} - ${category.title}`} />
        <meta property="twitter:description" content={product.description} />
        <meta name="twitter:image" content={product.image || "/logo.png"} />
        <link rel="canonical" href={`https://pontex-woad.vercel.app/products${encodeURIComponent(sectionId)}/${product.id}`} />
      </Head>

      <div className="max-w-6xl mx-auto">
        <Link href="/products" className="inline-flex items-center gap-2 text-gray-600 hover:text-[#511514] mb-6 transition group bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg shadow-sm">
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          <span className="text-sm font-medium">العودة إلى المنتجات</span>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10 mb-12">
          {/* Image Gallery */}
          <div className="order-2 lg:order-1">
            <div className="lg:sticky lg:top-4 space-y-4">
              {/* الصورة الرئيسية مع Zoom داخل الدائرة */}
              <div className="relative aspect-square rounded-2xl overflow-hidden bg-white shadow-lg group border border-gray-100 max-w-sm mx-auto">
                <div
                  ref={imgContainerRef}
                  className="relative w-full h-full cursor-crosshair"
                  onClick={(e) => {
                    e.stopPropagation();
                    setLightboxIndex(0);
                    setOpen(true);
                  }}
                >
                  <Image
                    ref={imgRef}
                    src={product.image || "/placeholder.svg"}
                    alt={product.name}
                    fill
                    className="object-cover pointer-events-none select-none"
                    priority
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    unoptimized
                  />

                  {/* الدائرة: تكبير داخلها */}
                  <div
                    ref={lensRef}
                    className={`absolute pointer-events-none rounded-full border-4 border-white shadow-2xl overflow-hidden transition-opacity duration-150 ${showZoom ? 'opacity-100' : 'opacity-0'}`}
                    style={{ 
                      display: showZoom ? 'block' : 'none',
                      transform: 'translateZ(0)',
                      willChange: 'left, top, background-position'
                    }}
                  />

                  {/* Like Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsLiked(!isLiked);
                    }}
                    className="absolute top-3 right-3 w-10 h-10 bg-white/95 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform z-10"
                  >
                    <Heart className={`w-5 h-5 ${isLiked ? 'fill-[#511514] text-[#511514]' : 'text-gray-600'}`} />
                  </button>

                  {/* Quality Badge */}
                  <div className="absolute top-3 left-3 bg-[#511514]/80 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-md flex items-center gap-1.5 z-10">
                    <Aperture className="w-3.5 h-3.5" />
                    جودة ممتازة
                  </div>
                </div>
              </div>

              {/* سلايدر الصور الإضافية */}
              {product.additionalImages && product.additionalImages.length > 0 && (
                <div className="relative bg-white rounded-2xl shadow-lg border border-gray-100 p-4">
                  <div className="overflow-x-auto scrollbar-hide" ref={scrollRef} onScroll={checkScroll}>
                    <div className="flex gap-4 py-2 min-w-max">
                      {product.additionalImages.map((img, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            setLightboxIndex(idx + 1);
                            setOpen(true);
                          }}
                          className="flex-shrink-0 w-28 h-28 rounded-xl overflow-hidden border-2 border-gray-200 hover:border-[#511514] transition-all hover:scale-105 shadow-md"
                        >
                          <Image
                            src={img}
                            alt={`صورة إضافية ${idx + 1}`}
                            width={112}
                            height={112}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => scroll('left')}
                    className={`absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/95 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg transition-all z-20 ${canScrollLeft ? 'opacity-100 hover:bg-white' : 'opacity-0 pointer-events-none'}`}
                    aria-label="تمرير يسار"
                  >
                    <ChevronLeft className="w-6 h-6 text-gray-700" />
                  </button>
                  <button
                    onClick={() => scroll('right')}
                    className={`absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/95 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg transition-all z-20 ${canScrollRight ? 'opacity-100 hover:bg-white' : 'opacity-0 pointer-events-none'}`}
                    aria-label="تمرير يمين"
                  >
                    <ChevronRight className="w-6 h-6 text-gray-700" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Product Info */}
          <div className="order-1 lg:order-2">
            <div className="lg:sticky lg:top-4 space-y-4">
              <div className="inline-flex items-center gap-2 bg-[#511514]/5 text-[#511514] px-4 py-2 rounded-full text-sm font-bold border border-[#511514]/10">
                <Box className="w-3.5 h-3.5" />
                {category.title}
              </div>

              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight">
                {product.name}
              </h1>

              <p className="text-gray-600 text-base leading-relaxed">
                {product.description}
              </p>
     <div className="mt-6">
  <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
    <Sparkles className="w-5 h-5 text-[var(--clr-primary)]" />
    مواصفات المنتج
  </h3>
  
  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
    {product.width && (
      <div className="group relative bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--clr-primary)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="relative p-5 flex flex-col items-center text-center">
          <div className="w-12 h-12 bg-[var(--clr-primary)]/10 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
            <MoveHorizontal className="w-6 h-6 text-[var(--clr-primary)]" />
          </div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">العرض</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{product.width}</p>
          <p className="text-xs text-gray-400 mt-1">سنتيمتر</p>
        </div>
      </div>
    )}
    
    {product.height && (
      <div className="group relative bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--clr-primary)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="relative p-5 flex flex-col items-center text-center">
          <div className="w-12 h-12 bg-[var(--clr-primary)]/10 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
            <MoveVertical className="w-6 h-6 text-[var(--clr-primary)]" />
          </div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">الطول</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{product.height}</p>
          <p className="text-xs text-gray-400 mt-1">سنتيمتر</p>
        </div>
      </div>
    )}
    
    {product.weight && (
      <div className="group relative bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--clr-primary)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="relative p-5 flex flex-col items-center text-center">
          <div className="w-12 h-12 bg-[var(--clr-primary)]/10 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
            <Scale className="w-6 h-6 text-[var(--clr-primary)]" />
          </div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">الوزن</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{product.weight}</p>
          <p className="text-xs text-gray-400 mt-1">جرام/م²</p>
        </div>
      </div>
    )}
  </div>
  
  {/* إذا ما كانش في مواصفات، أظهر رسالة ناعمة */}
  {!product.width && !product.height && !product.weight && (
    <div className="text-center py-8 text-gray-400">
      <p className="text-sm">لا توجد مواصفات إضافية متاحة لهذا المنتج</p>
    </div>
  )}
</div>

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
                      <span>تمت الإضافة</span>
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-5 h-5" />
                      <span>أضف إلى السلة</span>
                    </>
                  )}
                </button>
              </div>

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

              <ShareButton
                url={`https://pontex-woad.vercel.app/products/${encodeURIComponent(sectionId)}/${product.id}`}
                title={product.name}
              />
            </div>
          </div>
        </div>

        {/* Lightbox مع Zoom و Fullscreen */}
        <Lightbox
          open={open}
          close={() => setOpen(false)}
          index={lightboxIndex}
          slides={allImages}
          plugins={[Zoom, Fullscreen]}
          zoom={{
            maxZoomPixelRatio: 5,
            zoomInMultiplier: 2,
            doubleTapDelay: 300,
            doubleClickDelay: 500,
            doubleClickMaxStops: 2,
            keyboardMoveDistance: 50,
            wheelZoomDistanceFactor: 100,
            pinchZoomDistanceFactor: 100,
          }}
        />

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