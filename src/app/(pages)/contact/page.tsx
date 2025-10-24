"use client";

import { db } from "@/app/api/firebase";
import ProgressAnim from "@/components/ProgressAnim";
import { doc, getDoc } from "firebase/firestore";
import { motion, easeInOut } from 'framer-motion';
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
                      {contactInfo.phones.map((phone,index) => (
                        <div key={index} className="mt-2">
                        <p className="text-sm text-black font-Bukra">{phone.description}</p>
                        <a
                          href={`tel:${phone.value}`}
                          key={phone.value}
                          className="block text-gray-800 font-medium hover:text-[#511514] transition-colors"
                          dir="ltr"
                        >
                          {phone.value}
                        </a>
                        </div>
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
    <div className="tooltip">
      <a
        href={contactInfo.facebook}
        target="_blank"
        rel="noopener noreferrer"
        className="text-gray-800 font-medium hover:text-yellow-600 transition-colors"
      >
        <Facebook className="w-10 h-10 text-neutral-800 border-1 border-neutral-800 p-2 rounded-full hover:bg-neutral-800 hover:text-white" />
      </a>
      <span className="tooltip-text">Facebook</span>
    </div>
  )}

  {contactInfo.instagram && (
    <div className="tooltip">
      <a
        href={contactInfo.instagram}
        target="_blank"
        rel="noopener noreferrer"
        className="text-gray-800 font-medium hover:text-yellow-600 transition-colors"
      >
        <Instagram className="w-10 h-10 text-neutral-800 border-1 border-neutral-800 p-2 rounded-full hover:bg-neutral-800 hover:text-white" />
      </a>
      <span className="tooltip-text">Instagram</span>
    </div>
  )}

  {contactInfo.twitter && (
    <div className="tooltip">
      <a
        href={contactInfo.twitter}
        target="_blank"
        rel="noopener noreferrer"
        className="text-gray-800 font-medium hover:text-yellow-600 transition-colors"
      >
        {/* <Twitter className="w-10 h-10 text-neutral-800 border-1 border-neutral-800 p-2 rounded-full hover:bg-neutral-800 hover:text-white" /> */}
        <svg className="w-10 h-10 text-neutral-800 border-1 border-neutral-800 p-2 rounded-full hover:bg-neutral-800 hover:text-white stroke-black hover:stroke-white" width="20px" height="20px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M16.8217 5.1344C16.0886 4.29394 15.6479 3.19805 15.6479 2H14.7293M16.8217 5.1344C17.4898 5.90063 18.3944 6.45788 19.4245 6.67608C19.7446 6.74574 20.0786 6.78293 20.4266 6.78293V10.2191C18.645 10.2191 16.9932 9.64801 15.6477 8.68211V15.6707C15.6477 19.1627 12.8082 22 9.32386 22C7.50043 22 5.85334 21.2198 4.69806 19.98C3.64486 18.847 2.99994 17.3331 2.99994 15.6707C2.99994 12.2298 5.75592 9.42509 9.17073 9.35079M16.8217 5.1344C16.8039 5.12276 16.7861 5.11101 16.7684 5.09914M6.9855 17.3517C6.64217 16.8781 6.43802 16.2977 6.43802 15.6661C6.43802 14.0734 7.73249 12.7778 9.32394 12.7778C9.62087 12.7778 9.9085 12.8288 10.1776 12.9124V9.40192C9.89921 9.36473 9.61622 9.34149 9.32394 9.34149C9.27287 9.34149 8.86177 9.36884 8.81073 9.36884M14.7244 2H12.2097L12.2051 15.7775C12.1494 17.3192 10.8781 18.5591 9.32386 18.5591C8.35878 18.5591 7.50971 18.0808 6.98079 17.3564"  strokeLinejoin="round"/>
</svg>
      </a>
      <span className="tooltip-text">TikTok</span>
    </div>
  )}

  {contactInfo.whatsapp && (
    <div className="tooltip">
      <a
        href={contactInfo.whatsapp}
        target="_blank"
        rel="noopener noreferrer"
        className="text-gray-800 font-medium hover:text-yellow-600 transition-colors"
      >
        <MessageCircle className="w-10 h-10 text-neutral-800 border-1 border-neutral-800 p-2 rounded-full hover:bg-neutral-800 hover:text-white" />
      </a>
      <span className="tooltip-text">WhatsApp</span>
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
