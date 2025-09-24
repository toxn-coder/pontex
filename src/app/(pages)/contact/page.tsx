"use client";

import { db } from "@/app/api/firebase";
import ProgressAnim from "@/components/ProgressAnim";
import { doc, DocumentData, getDoc } from "firebase/firestore";
import { motion } from "framer-motion";
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
import { infoApp } from "@/components/infoApp";

// واجهة لنوع البيانات المتوقع من Firestore
interface ContactInfo {
  phones: string[];
  facebook: string;
  instagram: string;
  twitter: string;
  whatsapp: string;
  address: string;
  googleMapsLink: string;
  // openingHours: string; // ✅ هنا التعديل
}

// مدة صلاحية التخزين المؤقت (1 ساعة بالمللي ثانية)
const CACHE_DURATION = 60 * 60 * 1000;

const fetcher = async () => {
  const docRef = doc(db, "settings", "contactInfo");
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    const data: DocumentData = docSnap.data();
    const contactInfo: ContactInfo = {
      phones: Array.isArray(data.phones) ? data.phones : [],
      facebook: typeof data.facebook === "string" ? data.facebook : "",
      instagram: typeof data.instagram === "string" ? data.instagram : "",
      twitter: typeof data.twitter === "string" ? data.twitter : "",
      whatsapp: typeof data.whatsapp === "string" ? data.whatsapp : "",
      address: typeof data.address === "string" ? data.address : "",
      googleMapsLink:
        typeof data.googleMapsLink === "string" ? data.googleMapsLink : "",
    };
    // تخزين البيانات في localStorage
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
  const [initialData, setInitialData] = useState<ContactInfo | undefined>(
    undefined
  );
  const [isCacheValid, setIsCacheValid] = useState(false);
  const [url, setUrl] = useState("");

  // تحميل البيانات من localStorage على جانب العميل فقط
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
    refreshInterval: 60 * 60 * 1000, // تحديث كل ساعة
    revalidateOnFocus: false, // تعطيل إعادة التحقق عند التركيز
    revalidateOnMount: !isCacheValid, // عدم الجلب إذا كانت البيانات المخزنة صالحة
    dedupingInterval: 60 * 1000, // تجنب الجلب المتكرر لمدة 60 ثانية
    keepPreviousData: true, // الاحتفاظ بالبيانات السابقة أثناء الجلب
    fallbackData: initialData, // استخدام البيانات المخزنة كبيانات أولية
  });

  useEffect(() => {
    let url = location.origin;

    setUrl(url);
  }, []);

  const isValidGoogleMapsLink = (link: string) => {
    return (
      link.includes("maps.google.com") || link.includes("google.com/maps/embed")
    );
  };

  return (
    <div className="min-h-screen bg-[var(--clr-primary)] py-12 px-4">
      <Head>
        <title>اتصل بنا - مطعم اسم مطعمك</title>
        <meta
          name="description"
          content="تواصلوا معنا عبر الهاتف أو زورونا في موقعنا. نحن هنا لخدمتكم!"
        />
        <meta
          name="keywords"
          content=" محل أقمشة, القاهرة , اتصل بنا, خدمة العملاء pon tex بون تكس"
        />
        <meta name="robots" content="index, follow" />
        <meta property="og:title" content="اتصل بنا - " />
        <meta
          property="og:description"
          content="تواصلوا معنا عبر الهاتف أو زورونا في موقعنا. نحن هنا لخدمتكم!"
        />
        <meta property="og:image" content="/logo.png" />
        <meta property="og:url" content={url + "/contact"} />
        <meta property="og:type" content="website" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta charSet="UTF-8" />
      </Head>

      <div className="max-w-6xl mx-auto">
        {/* رأس الصفحة */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white">
            <span className="text-yellow-500">اتصل بنا</span>
          </h1>
          <p className="text-gray-300 mt-4 text-lg max-w-2xl mx-auto">
            تواصلوا معنا عبر الهاتف أو زورونا في موقعنا. نحن هنا لخدمتكم!
          </p>
        </motion.div>

        {isLoading && !contactInfo ? (
          <ProgressAnim />
        ) : error ? (
          <p className="text-center text-red-400 text-lg">
            لايوجد بيانات متاحة لعرضها
          </p>
        ) : !contactInfo ||
          (!contactInfo.phones.length &&
            !contactInfo.facebook &&
            !contactInfo.instagram &&
            !contactInfo.twitter &&
            !contactInfo.whatsapp) ? (
          <p className="text-center text-gray-300 text-lg">
            لا توجد معلومات اتصال متاحة حاليًا.
          </p>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* معلومات التواصل */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white rounded-2xl shadow-xl p-8"
            >
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                معلومات التواصل
              </h2>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <MapPin className="w-6 h-6 text-yellow-600" />
                  <div>
                    <p className="text-sm text-gray-600">العنوان</p>
                    <p className="text-gray-800 font-medium">
                      {contactInfo.address}
                    </p>
                  </div>
                </div>
                {contactInfo.phones && contactInfo.phones.length > 0 && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-6 h-6 text-yellow-600" />
                    <div className="flex flex-col gap-2">
                      <p className="text-sm text-gray-600">رقم الهاتف</p>
                      {contactInfo.phones.map((phone) => (
                        <a
                          href={`tel:${phone}`}
                          key={phone} // استخدام رقم الهاتف كمفتاح فريد
                          className="text-gray-800 font-medium hover:text-yellow-600 transition-colors"
                          dir="ltr"
                        >
                          {phone}
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* قسم وسائل التواصل الاجتماعي */}
                {(contactInfo.facebook ||
                  contactInfo.instagram ||
                  contactInfo.twitter ||
                  contactInfo.whatsapp) && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                      وسائل التواصل الاجتماعي
                    </h3>
                    <div className="space-y-4">
                      {contactInfo.facebook && (
                        <div className="flex items-center gap-3">
                          <Facebook className="w-6 h-6 text-yellow-600" />
                          <div>
                            <p className="text-sm text-gray-600">فيسبوك</p>
                            <a
                              href={contactInfo.facebook}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-gray-800 font-medium hover:text-yellow-600 transition-colors"
                            >
                              حسابنا على فيسبوك
                            </a>
                          </div>
                        </div>
                      )}
                      {contactInfo.instagram && (
                        <div className="flex items-center gap-3">
                          <Instagram className="w-6 h-6 text-yellow-600" />
                          <div>
                            <p className="text-sm text-gray-600">إنستغرام</p>
                            <a
                              href={contactInfo.instagram}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-gray-800 font-medium hover:text-yellow-600 transition-colors"
                            >
                              حسابنا على إنستغرام
                            </a>
                          </div>
                        </div>
                      )}
                      {contactInfo.twitter && (
                        <div className="flex items-center gap-3">
                          <Twitter className="w-6 h-6 text-yellow-600" />
                          <div>
                            <p className="text-sm text-gray-600">تويتر</p>
                            <a
                              href={contactInfo.twitter}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-gray-800 font-medium hover:text-yellow-600 transition-colors"
                            >
                              حسابنا على تويتر
                            </a>
                          </div>
                        </div>
                      )}
                      {contactInfo.whatsapp && (
                        <div className="flex items-center gap-3">
                          <MessageCircle className="w-6 h-6 text-yellow-600" />
                          <div>
                            <p className="text-sm text-gray-600">واتساب</p>
                            <a
                              href={contactInfo.whatsapp}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-gray-800 font-medium hover:text-yellow-600 transition-colors"
                            >
                              تواصلوا معنا على واتساب
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="bg-white rounded-2xl shadow-xl overflow-hidden"
            >
              {contactInfo.googleMapsLink &&
                isValidGoogleMapsLink(contactInfo.googleMapsLink) && (
                  <div>
                    <iframe
                      src={contactInfo.googleMapsLink}
                      width="100%"
                      height="600"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                      title="معاينة خريطة جوجل"
                      className="rounded-lg"
                    />
                  </div>
                )}
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
