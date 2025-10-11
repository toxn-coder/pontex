"use client";

import { loadInfoApp } from "@/components/infoApp";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useState, useMemo } from "react";
import CardHero from "./CardHero";
import ProgressAnim from "./ProgressAnim";
import { InfoAppType } from "@/types/infoAppType";
import img from "../../public/placeholder.webp";
export default function HeroSection({ buttonText = "تسوق الآن" }) {
  const [infoApp, setInfoApp] = useState<InfoAppType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await loadInfoApp();
        setInfoApp(data);
      } catch (err) {
        setError("حدث خطأ أثناء جلب البيانات");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // تجهيز الكروت
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
    <div className="w-full h-screen relative overflow-hidden text-white ">
      {/* الخلفية */}
  {/* <div
    className="absolute inset-0 bg-no-repeat bg-cover bg-center"
    style={{ backgroundImage: "url('/placeholder.webp')" }}
  ></div> */}

    <video
    className="absolute inset-0 w-full h-full object-cover"
    src="/background.mp4" // ← غيّر اسم الملف حسب الفيديو عندك
    autoPlay
    muted
    loop
    playsInline
  />

      {/* المحتوى */}
      <div className="container mx-auto px-4 py-16 md:py-24 lg:py-32 relative z-10">
        <div className="flex flex-col  items-center">
          <div className="w-full  text-center lg:text-right mb-10 lg:mb-0">
            <div className="hidden  px-4 py-1 bg-[var(--secondry)] rounded-full text-sm font-bold mb-4">
              بيع جميع الأقمشة
            </div>

            <h1 className="hidden text-4xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight name-logo">
              {infoApp.name}
            </h1>

            <p className="text-xl md:text-6xl text-amber-100  mb-6 justify-center lg:justify-center flex font-Manal text-shadow-lg/30 text-shaddow-black">
              {infoApp.slogan}
            </p>

          </div>
        </div>

        {/* الكروت */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-10  mx-auto m-auto backdrop-blur-2xl  p-6 rounded-xl shadow-2xl bg-white/20 w-[760px] transform hover:-translate-y-1 transition-transform">
          {cards
            .filter((c) => c.show)
            .map((card, i) => (
              <CardHero
                index={i}
                key={`${card.title}-${i}`}
                title={card.title}
                description={card.description}
              />
            ))}
        </div>

            <div className="flex gap-4 justify-center mt-10 ">
              <Link href="/products">
                <button className="bg-white hover:bg-[#dfdfdf] hover:scale-110 text-[#a0392a] py-3 px-8 rounded-lg font-bold transition-all shadow-lg hover:shadow-xl flex items-center font-Bukra font-2xl">
                  {buttonText}
                </button>
              </Link>
            </div>


      </div>

      {/* التموج أسفل */}
      <div className="hidden absolute bottom-0 w-full">
        <svg
          className="w-full h-24 md:h-32"
          viewBox="0 0 1440 120"
          preserveAspectRatio="none"
        >
          <path
            d="M0,96L48,85.3C96,75,192,53,288,53.3C384,53,480,75,576,80C672,85,768,75,864,64C960,53,1056,43,1152,48C1248,53,1344,75,1392,85.3L1440,96L1440,120L0,120Z"
            fill="#fff"
            fillOpacity="1"
          />
          <path
            d="M0,96L48,85.3C96,75,192,53,288,53.3C384,53,480,75,576,80C672,85,768,75,864,64C960,53,1056,43,1152,48C1248,53,1344,75,1392,85.3L1440,96"
            fill="none"
            stroke="#a0392a"
            strokeWidth="5"
          />
        </svg>
      </div>
    </div>
  );
}
