"use client";
import { loadInfoApp } from "@/components/infoApp";
import { ArrowRight, Clock, MapPin, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useMemo } from "react";
import CardHero from "./CardHero";
import ProgressAnim from "./ProgressAnim";
import { InfoAppType } from "@/types/infoAppType";

export default function HeroSection({ buttonText = "تسوق الآن" }) {
  const [infoApp, setInfoApp] = useState<InfoAppType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log("HeroSection useEffect triggered");
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await loadInfoApp();
        setInfoApp(data);
        setLoading(false);
      } catch (err) {
        setError("حدث خطأ أثناء جلب البيانات");
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Memoize مصفوفة cards لتجنب إعادة إنشائها في كل تصيير
  const cards = useMemo(
    () =>
      infoApp
        ? [
            {
              title: infoApp.card1Title ?? "",
              description: infoApp.card1Desc ?? "",
              show: infoApp.card1Show ?? false,
            },
            {
              title: infoApp.card2Title ?? "",
              description: infoApp.card2Desc ?? "",
              show: infoApp.card2Show ?? false,
            },
            {
              title: infoApp.card3Title ?? "",
              description: infoApp.card3Desc ?? "",
              show: infoApp.card3Show ?? false,
            },
          ]
        : [],
    [
      infoApp?.card1Title,
      infoApp?.card1Desc,
      infoApp?.card1Show,
      infoApp?.card2Title,
      infoApp?.card2Desc,
      infoApp?.card2Show,
      infoApp?.card3Title,
      infoApp?.card3Desc,
      infoApp?.card3Show,
    ]
  );

  console.log("HeroSection rendered");

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <ProgressAnim />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64 text-red-500">
        <p>{error}</p>
      </div>
    );
  }

  if (!infoApp) return null;

  return (
    <div className="relative overflow-hidden bg-[var(--clr-primary)] text-white">
      <div className="absolute inset-0 opacity-10 bg-[url('/placeholder.svg')] bg-repeat"></div>

      <div className="container mx-auto px-4 py-16 md:py-24 lg:py-32 relative z-10">
        <div className="flex flex-col lg:flex-row items-center">
          <div className="w-full lg:w-1/2 text-center lg:text-right mb-10 lg:mb-0">
            <div className="inline-block px-4 py-1 bg-[var(--secondry)] rounded-full text-sm font-bold mb-4">
              بيع جميع المنتجات
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight">
              {infoApp.name}
            </h1>

            <p className="text-xl md:text-2xl mb-8 text-amber-100">
              {infoApp.slogan}
            </p>

            <div className="flex flex-wrap justify-center lg:justify-end gap-6 mb-8">
              <div className="flex items-center">
                <Star className="text-amber-400 ml-2" size={20} fill="#fbbf24" />
                <span className="font-bold text-lg">{infoApp.rating}</span>
                <span className="text-amber-200 mr-1">/5</span>
              </div>

              <div className="flex items-center">
                <MapPin className="text-amber-400 ml-2" size={20} />
                <span>{infoApp.address}</span>
              </div>

              <div className="flex items-center">
                <Clock className="text-amber-400 ml-2" size={20} />
                <span className="arabic">{infoApp.openingHours}</span>
              </div>
            </div>

            <div className="flex gap-4 justify-center lg:justify-end">
              <Link href="/products">
                <button className="bg-amber-500 hover:bg-amber-600 text-white py-3 px-8 rounded-lg font-bold transition-all shadow-lg hover:shadow-xl flex items-center">
                  {buttonText}
                  <ArrowRight className="mr-2" size={20} />
                </button>
              </Link>
            </div>
          </div>

          <div className="w-full lg:w-1/2 relative">
            <div className="relative w-full h-64 md:h-96 lg:h-auto aspect-square mx-auto lg:max-w-lg">
              <div className="absolute inset-0 bg-[#1A1A1A] rounded-full overflow-hidden border-8 border-dashed border-amber-600 shadow-2xl">
                <Image
                  src={infoApp.imageHero}
                  alt="طبق شهي من مطعمنا"
                  fill
                  style={{ objectFit: "cover" }}
                  priority
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-10 max-w-5xl mx-auto">
          {cards
            .filter((c) => c.show)
            .map((card, i) => (
              <CardHero
                key={card.title ?? i} // استخدام title كمفتاح إذا كان فريدًا، أو i كبديل
                title={card.title}
                description={card.description}
              />
            ))}
        </div>
      </div>

      {/* إضافة تأثير التموج في الأسفل */}
      <div className="absolute bottom-0 w-full">
        <svg
          className="w-full h-24 md:h-32"
          viewBox="0 0 1440 120"
          preserveAspectRatio="none"
        >
          <path
            d="M0,96L48,85.3C96,75,192,53,288,53.3C384,53,480,75,576,80C672,85,768,75,864,64C960,53,1056,43,1152,48C1248,53,1344,75,1392,85.3L1440,96L1440,120L0,120Z"
            fill="#1B1B1B"
            fillOpacity="1"
          />
          <path
            d="M0,96L48,85.3C96,75,192,53,288,53.3C384,53,480,75,576,80C672,85,768,75,864,64C960,53,1056,43,1152,48C1248,53,1344,75,1392,85.3L1440,96"
            fill="none"
            stroke="#E17100"
            strokeWidth="5"
          />
        </svg>
      </div>
    </div>
  );
}