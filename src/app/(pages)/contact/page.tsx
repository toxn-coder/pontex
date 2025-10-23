"use client";

import { db } from "@/app/api/firebase";
import ProgressAnim from "@/components/ProgressAnim";
import { doc, getDoc } from "firebase/firestore";
import { motion, easeOut, easeInOut } from 'framer-motion';
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import {
  Facebook,
  Instagram,
  MapPin,
  MessageCircle,
  Phone,
  Twitter,
} from "lucide-react";
import Head from "next/head";
import { useEffect, useState } from "react";
import useSWR from "swr";
import Image from "next/image";

interface ContactInfo {
  phones: string[];
  facebook: string;
  instagram: string;
  twitter: string;
  whatsapp: string;
  address: string;
  googleMapsLink: string;
}

const CACHE_DURATION = 60 * 60 * 1000;

const fetcher = async () => {
  const docRef = doc(db, "settings", "contactInfo");
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    const data = docSnap.data();
    const contactInfo: ContactInfo = {
      phones: Array.isArray(data.phones) ? data.phones : [],
      facebook: data.facebook || "",
      instagram: data.instagram || "",
      twitter: data.twitter || "",
      whatsapp: data.whatsapp || "",
      address: data.address || "",
      googleMapsLink: data.googleMapsLink || "",
    };
    if (typeof window !== "undefined") {
      localStorage.setItem("contactInfoData", JSON.stringify(contactInfo));
      localStorage.setItem(
        "contactInfoDataTimestamp",
        new Date().getTime().toString()
      );
    }
    return contactInfo;
  } else {
    throw new Error("لا توجد معلومات اتصال متاحة.");
  }
};



export default function ContactUs() {
  const [initialData, setInitialData] = useState<ContactInfo | undefined>();
  const [isCacheValid, setIsCacheValid] = useState(false);
  const [url, setUrl] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");


  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!email) {
      setMessage("الرجاء إدخال البريد الإلكتروني");
      return;
    }

    try {
      await addDoc(collection(db, "subscribers"), {
        email,
        createdAt: serverTimestamp(),
      });
      setMessage("✅ تم الاشتراك بنجاح");
      setEmail("");
    } catch (error: any) {
      setMessage("❌ حدث خطأ: " + error.message);
    }
  };

  useEffect(() => {
    const cachedData = localStorage.getItem("contactInfoData");
    const cachedTimestamp = localStorage.getItem("contactInfoDataTimestamp");
    const currentTime = new Date().getTime();

    if (
      cachedData &&
      cachedTimestamp &&
      currentTime - parseInt(cachedTimestamp) < CACHE_DURATION
    ) {
      setInitialData(JSON.parse(cachedData));
      setIsCacheValid(true);
    }
  }, []);

  const {
    data: contactInfo,
    error,
    isLoading,
  } = useSWR("contactInfoData", fetcher, {
    refreshInterval: 60 * 60 * 1000,
    revalidateOnFocus: false,
    revalidateOnMount: !isCacheValid,
    dedupingInterval: 60 * 1000,
    keepPreviousData: true,
    fallbackData: initialData,
  });

  useEffect(() => {
    setUrl(location.origin);
  }, []);

  const isValidGoogleMapsLink = (link: string) =>
    link.includes("maps.google.com") || link.includes("google.com/maps/embed");

  return (
    <div className="min-h-screen relative">
      <Head>
        <title>اتصل بنا - بون تكس</title>
        <meta name="description" content="تواصل معنا عبر الهاتف أو زورونا." />
      </Head>

      {/* ====== صورة الغلاف ====== */}
      <div className="relative w-full h-[400px] sm:h-[500px]">
        <Image
          src="/contact.jpg"
          alt="صورة تواصل معنا"
          fill
          className="object-cover w-full h-full"
          priority
        />
        {/* عنصر معلومات التواصل العائم */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="absolute bottom-[-550px] left-1/2 -translate-x-1/2 w-[90%] md:w-[70%] bg-white rounded-2xl shadow-2xl  z-10 overflow-hidden"
        >
          
          {isLoading && !contactInfo ? (
            <ProgressAnim />
          ) : error ? (
            <p className="text-center text-red-400 text-lg">
              لا توجد بيانات متاحة لعرضها
            </p>
          ) : contactInfo ? (
            <>
            <div className="p-8">
              <h2 className="text-4xl font-bold text-gray-800 mt-6 mb-6 text-right font-Bukra">
                اتصل بنا
              </h2>
              <h3 className="text-lg text-gray-600 mb-8 text-right font-Bukra">
                تواصلوا معنا عبر الهاتف أو زورونا في موقعنا. نحن هنا لخدمتكم!

              </h3>
              <div className="space-y-5 text-right">
                {/* العنوان */}
                <div className="flex items-center gap-3">
                  <MapPin className="w-12 h-12 text-white border-1 border-neutral-800 p-2 rounded-full bg-neutral-900 " />
                  <div>
                    <p className="text-sm text-gray-600">العنوان</p>
                    <p className="text-gray-800 font-medium">
                      {contactInfo.address}
                    </p>
                  </div>
                </div>

                {/* الهواتف */}
                {contactInfo.phones?.length > 0 && (
                  <div className="flex items-start gap-3">
                    <Phone className="w-12 h-12 text-white border-1 border-neutral-800 p-2 rounded-full bg-neutral-900" />
                    <div>
                      <p className="text-sm text-gray-600">أرقام الهاتف</p>
                      {contactInfo.phones.map((phone) => (
                        <a
                          href={`tel:${phone}`}
                          key={phone}
                          className="block text-gray-800 font-medium hover:text-yellow-600 transition-colors"
                          dir="ltr"
                        >
                          {phone}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
                <motion.span
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{
                    duration: 0.8,
                    ease: easeInOut,
                    delay: 0.5,
                  }}
                  className="block h-[1px] bg-[#3a3a3a] mx-auto mt-6 rounded-full"
                ></motion.span>

                {/* وسائل التواصل */}
                <p className="text-2xl font-Bukra text-black font-bold">وسائل التواصل الأجتماعي</p>
                <div className="flex flex-row gap-3">
                  {contactInfo.facebook && (
                    <div className="flex items-center gap-3">
                      <a
                        href={contactInfo.facebook}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-800 font-medium hover:text-yellow-600 transition-colors"
                      >
                        <Facebook className="w-10 h-10 text-neutral-800 border-1 border-neutral-800 p-2 rounded-full hover:bg-neutral-800 hover:text-white" />

                      </a>
                    </div>
                  )}
                  {contactInfo.instagram && (
                    <div className="flex items-center gap-3">
                      <a
                        href={contactInfo.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-800 font-medium hover:text-yellow-600 transition-colors"
                      >

                        <Instagram className="w-10 h-10 text-neutral-800 border-1 border-neutral-800 p-2 rounded-full hover:bg-neutral-800 hover:text-white" />
                      </a>
                    </div>
                  )}
                  {contactInfo.twitter && (
                    <div className="flex items-center gap-3">
                      <a
                        href={contactInfo.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-800 font-medium hover:text-yellow-600 transition-colors"
                      >

                        <Twitter className="w-10 h-10 text-neutral-800 border-1 border-neutral-800 p-2 rounded-full hover:bg-neutral-800 hover:text-white" />
                      </a>
                    </div>
                  )}
                  {contactInfo.whatsapp && (
                    <div className="flex items-center gap-3">
                      <a
                        href={contactInfo.whatsapp}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-800 font-medium hover:text-yellow-600 transition-colors"
                      >
                        <MessageCircle className="w-10 h-10 text-neutral-800 border-1 border-neutral-800 p-2 rounded-full hover:bg-neutral-800 hover:text-white" />

                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
                <form onSubmit={handleSubmit} className="bg-gray-200 h-40 p-6">
                  <p className="text-black font-Bukra text-xl font-bold w-full text-center">اشترك في النشرة الإخبارية كن أول من يعرف عن العروض والمنتجات الجديدة! </p>
                  <div className="mt-4 flex gap-4 justify-center">
                  <input
                    type="email"
                    value={email}
                    placeholder="أدخل بريدك الإلكتروني"
                    className="w-fit px-4 py-2 rounded-lg text-black focus:outline-none border-1 border-black placeholder-black font-Bukra"
                    required
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <button
                    type="submit"
                    className="bg-black text-white px-4 py-2 rounded-lg hover:bg-[#c4c3c3] hover:text-black transition"
                  >
                    اشترك
                  </button>
                  </div>
                </form>
            </>
          ) : null}
        </motion.div>
      </div>
      <div className="w-full h-110">
        .
      </div>

      {/* ====== الخريطة أسفل الصفحة ====== */}
      {contactInfo?.googleMapsLink &&
        isValidGoogleMapsLink(contactInfo.googleMapsLink) && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-48 w-full"
          >
            <iframe
              src={contactInfo.googleMapsLink}
              width="100%"
              height="400"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              title="خريطة جوجل"
              className="w-full h-[400px]"
            />
          </motion.div>
        )}
    </div>
  );
}
