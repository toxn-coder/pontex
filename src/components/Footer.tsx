"use client";

import { db } from "@/app/api/firebase";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";
import {
  Clock,
  Facebook,
  Instagram,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { loadInfoApp } from "./infoApp";

interface ContactInfo {
  facebook: string;
  instagram: string;
  twitter: string;
  whatsapp: string;
  phones: string[];
  emails: string[];
  logo?: string;
  address: string;
}

interface LoadedInfoApp {
  name: string;
  logoUrl: string;
  openingHours: string;
}
interface FooterProps {
  name: string;
  logoUrl: string;
}

const Footer = ({ name, logoUrl }: FooterProps) => {
  const [contactInfo, setContactInfo] = useState<ContactInfo>({
    facebook: "",
    instagram: "",
    twitter: "",
    whatsapp: "",
    phones: [],
    emails: [],
    logo: "",
    address: "",
  });
  const [infoApp, setInfoApp] = useState<LoadedInfoApp>({
    name: "",
    logoUrl: "",
    openingHours: "",
  });
  const [isPWA, setIsPWA] = useState(false);

  useEffect(() => {
    const fetchInfoApp = async () => {
      const info = await loadInfoApp();
      setInfoApp(info);
    };
    fetchInfoApp();
  }, []);

  useEffect(() => {
    const fetchContactInfo = async () => {
      try {
        const docRef = doc(db, "settings", "contactInfo");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setContactInfo({
            facebook: typeof data.facebook === "string" ? data.facebook : "",
            instagram: typeof data.instagram === "string" ? data.instagram : "",
            twitter: typeof data.twitter === "string" ? data.twitter : "",
            whatsapp: typeof data.whatsapp === "string" ? data.whatsapp : "",
            phones: Array.isArray(data.phones) ? data.phones : [],
            emails: Array.isArray(data.emails) ? data.emails : [],
            address: typeof data.address === "string" ? data.address : "",
            logo: typeof data.logo === "string" ? data.logo : "",
          });
        }
      } catch (error) {
        console.error("Error fetching contact info:", error);
      }
    };
    fetchContactInfo();
  }, []);

  useEffect(() => {
    const fetchContactInfo = async () => {
      try {
        const docRef = doc(db, "settings", "contactInfo");
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();

          setContactInfo({
            facebook: typeof data.facebook === "string" ? data.facebook : "",
            instagram: typeof data.instagram === "string" ? data.instagram : "",
            twitter: typeof data.twitter === "string" ? data.twitter : "",
            whatsapp: typeof data.whatsapp === "string" ? data.whatsapp : "",
            phones: Array.isArray(data.phones)
              ? data.phones.map((p: any) => ({
                  description: p.description || "",
                  value: p.value || "",
                }))
              : [],
            emails: Array.isArray(data.emails)
              ? data.emails.map((p: any) => ({
                  description: p.description || "",
                  value: p.value || "",
                }))
              : [],
            address: typeof data.address === "string" ? data.address : "",
            logo: typeof data.logo === "string" ? data.logo : "",
          });
        }
      } catch (error) {
        console.error("Error fetching contact info:", error);
      }
    };

    fetchContactInfo();
  }, []);

  useEffect(() => {
    const isStandalone = window.matchMedia(
      "(display-mode: standalone)"
    ).matches;
    setIsPWA(isStandalone);
    const mediaQuery = window.matchMedia("(display-mode: standalone)");
    const handleChange = (e: MediaQueryListEvent) => setIsPWA(e.matches);
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

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

  if (isPWA) return null;

  return (
    <footer className="bg-gradient-to-r from-[var(--clr-dark-red)] to-[var(--clr-primary)] text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4  border-b border-white">
          {/* شعار ووصف */}
          <div className="text-center md:text-right border-x border-white p-4">
            <div className="flex justify-center md:justify-start mb-4">
              {/* <Image
  src={logoUrl? logoUrl : "/logo.png"}
  alt="شعار الموقع"
  width={50}
  height={50}
  style={{ width: '50px', height: 'auto' }}
  className="object-contain rounded"
/> */}
            </div>
            <p className="text-gray-200 mb-4 text-center font-Bukra">
              <span className="name-logo block text-center text-2xl">
                {name}
              </span>
              وجهتك الموثوقة للتسوق الإلكتروني. اكتشف تشكيلتنا الواسعة من
              الأقمشة عالية الجودة بأسعار تنافسية. تسوق بثقة مع خدمة عملاء
              ممتازة وتوصيل سريع
            </p>
            <div className="flex gap-3 justify-center md:justify-center">
  {contactInfo.facebook && (
    <Link
      href={contactInfo.facebook}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative border-1 border-white text-white p-2 rounded-full hover:bg-amber-100 hover:text-[var(--clr-primary)] transition"
    >
      <Facebook size={20} />
      <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-xs bg-black text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition">
        Facebook
      </span>
    </Link>
  )}

  {contactInfo.instagram && (
    <Link
      href={contactInfo.instagram}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative border-1 border-white text-white p-2 rounded-full hover:bg-amber-100 hover:text-[var(--clr-primary)] transition"
    >
      <Instagram size={20} />
      <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-xs bg-black text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition">
        Instagram
      </span>
    </Link>
  )}

  {contactInfo.twitter && (
    <Link
      href={contactInfo.twitter}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative border-1 border-white text-white p-2 rounded-full hover:bg-amber-100 hover:text-[var(--clr-primary)] transition stroke-white hover:stroke-[var(--clr-primary)]"
    >
      <svg
        width="20px"
        height="20px"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M16.8217 5.1344C16.0886 4.29394 15.6479 3.19805 15.6479 2H14.7293M16.8217 5.1344C17.4898 5.90063 18.3944 6.45788 19.4245 6.67608C19.7446 6.74574 20.0786 6.78293 20.4266 6.78293V10.2191C18.645 10.2191 16.9932 9.64801 15.6477 8.68211V15.6707C15.6477 19.1627 12.8082 22 9.32386 22C7.50043 22 5.85334 21.2198 4.69806 19.98C3.64486 18.847 2.99994 17.3331 2.99994 15.6707C2.99994 12.2298 5.75592 9.42509 9.17073 9.35079M16.8217 5.1344C16.8039 5.12276 16.7861 5.11101 16.7684 5.09914M6.9855 17.3517C6.64217 16.8781 6.43802 16.2977 6.43802 15.6661C6.43802 14.0734 7.73249 12.7778 9.32394 12.7778C9.62087 12.7778 9.9085 12.8288 10.1776 12.9124V9.40192C9.89921 9.36473 9.61622 9.34149 9.32394 9.34149C9.27287 9.34149 8.86177 9.36884 8.81073 9.36884M14.7244 2H12.2097L12.2051 15.7775C12.1494 17.3192 10.8781 18.5591 9.32386 18.5591C8.35878 18.5591 7.50971 18.0808 6.98079 17.3564"
          strokeLinejoin="round"
        />
      </svg>
      <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-xs bg-black text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition">
        TikTok
      </span>
    </Link>
  )}

  {contactInfo.whatsapp && (
    <Link
      href={contactInfo.whatsapp}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative border-1 border-white text-white p-2 rounded-full hover:bg-amber-100 hover:text-[var(--clr-primary)] transition"
    >
      <MessageCircle size={20} />
      <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-xs bg-black text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition">
        WhatsApp
      </span>
    </Link>
  )}
</div>

          </div>
          {/* باقي الأعمدة كما هي */}
          <div className="text-center md:text-right border-l border-white p-4">
            <h4 className="text-lg font-semibold mb-4 font-Bukra">
              روابط سريعة
            </h4>
            <ul className="space-y-2 ">
              <li>
                <Link href="/" className="hover:underline font-Bukra">
                  الرئيسية
                </Link>
              </li>
              <li>
                <Link href="/products" className="hover:underline font-Bukra">
                  المنتجات
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:underline font-Bukra">
                  من نحن
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:underline font-Bukra">
                  اتصل بنا
                </Link>
              </li>
              <li>
                <Link href="/production" className="hover:underline font-Bukra">
                  الإنتاج
                </Link>
              </li>
            </ul>
          </div>
          <div className="text-center md:text-right border-l border-white p-4">
            <h4 className="text-lg font-semibold mb-4 font-Bukra">
              معلومات الاتصال
            </h4>
            <ul className="space-y-2">
              {contactInfo.phones.map((phone, index) => (
                <li
                  key={index}
                  className="flex items-center gap-2 justify-center md:justify-start"
                >
                  <Phone size={16} />
                  <div className="flex flex-col">
                    {phone.description && (
                      <span className="text-sm text-gray-300 font-Bukra">
                        {phone.description}
                      </span>
                    )}
                    <a
                      href={`tel:${phone.value}`}
                      className="hover:underline font-Bukra"
                    >
                      {phone.value}
                    </a>
                  </div>
                </li>
              ))}

              {contactInfo.emails.map((email, index) => (
                <li
                  key={index}
                  className="flex items-center gap-2 justify-center md:justify-start"
                >
                  <Mail size={16} />
                  {email.description && (
                    <span className="text-sm text-gray-300 font-Bukra">
                      {email.description}
                    </span>
                  )}
                  <a
                    href={`mailto:${email.value}`}
                    className="hover:underline font-Bukra"
                  >
                    {email.value}
                  </a>
                </li>
              ))}

              <li className="flex items-center gap-2 justify-center md:justify-start">
                <MapPin size={16} />
                <span>{contactInfo.address}</span>
              </li>
              <li className="flex items-center gap-2 justify-center md:justify-start">
                <Clock size={16} />
                <span>{infoApp.openingHours}</span>
              </li>
            </ul>
          </div>
          <div className="text-center md:text-right border-l border-white p-4">
            <h4 className="text-lg font-semibold mb-4 font-Bukra">
              اشترك ببريدك ليصلك احدث الاسعار والعروض
            </h4>
            <p className="text-gray-200 mb-4 font-Bukra">
              كن أول من يعرف عن العروض والمنتجات الجديدة!
            </p>
            <form
              onSubmit={handleSubmit}
              className="flex flex-col sm:flex-row gap-2"
            >
              <input
                type="email"
                value={email}
                placeholder="أدخل بريدك الإلكتروني"
                className="w-full px-4 py-2 rounded-lg text-white focus:outline-none bg-white/30"
                required
                onChange={(e) => setEmail(e.target.value)}
              />
              <button
                type="submit"
                className="bg-[#e7dfd6] text-[#511514] px-4 py-2 rounded-lg hover:bg-[#852220b9] hover:text-white transition"
              >
                اشترك
              </button>
            </form>
            <Link
              href="/contact"
              className="bg-[#e7dfd6] text-[#511514] px-6 py-2 rounded-[5px] inline-block hover:bg-[#852220b9] hover:text-white transition mt-4 w-full text-center"
            >
              تواصل معنا
            </Link>
          </div>
        </div>
      </div>

      <div className="bg-[var(--clr-dark-red)] py-4">
        <div className="container mx-auto px-4 text-center">
          <p>
            جميع الحقوق محفوظة © {new Date().getFullYear()} {name}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
