"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ShieldAlert,
  ImagePlus,
  UploadCloud,
  Trash2,
  Save,
  Loader2,
  CheckCircle,
  Pencil,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

import { db, auth } from "@/app/api/firebase";
import { doc, getDoc, updateDoc, deleteField } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { loadInfoApp, refreshInfoApp } from "@/components/infoApp";
import { InfoAppType } from "@/types/infoAppType";

// تحديث نوع InfoAppDoc ليشمل جميع الحقول من InfoAppType
type InfoAppDoc = InfoAppType;

const CLD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const CLD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

function getPublicIdFromUrl(url: string): string | null {
  try {
    if (!url || !url.includes("res.cloudinary.com")) return null;
    const afterUpload = url.split("/upload/")[1];
    if (!afterUpload) return null;
    const noVersion = afterUpload.replace(/^v\d+\//, "");
    const clean = noVersion.split("?")[0];
    const dotIndex = clean.lastIndexOf(".");
    const withoutExt = dotIndex > -1 ? clean.slice(0, dotIndex) : clean;
    return decodeURIComponent(withoutExt);
  } catch {
    return null;
  }
}

async function uploadToCloudinary(file: File, onProgress?: (p: number) => void): Promise<string> {
  if (!CLD_NAME || !CLD_PRESET) {
    throw new Error("Cloudinary env vars missing (NEXT_PUBLIC_CLOUDINARY_...)");
  }
  const form = new FormData();
  form.append("file", file);
  form.append("upload_preset", CLD_PRESET);
  const url = `https://api.cloudinary.com/v1_1/${CLD_NAME}/image/upload`;

  return await new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", url);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded * 100) / e.total));
      }
    };
    xhr.onload = () => {
      try {
        const res = JSON.parse(xhr.responseText);
        if (res.secure_url) resolve(res.secure_url);
        else reject(new Error("Unexpected Cloudinary response"));
      } catch (err) {
        reject(err);
      }
    };
    xhr.onerror = () => reject(new Error("Upload failed"));
    xhr.send(form);
  });
}

export default function InfoAppEditor() {
  const [user] = useAuthState(auth);
  const [role, setRole] = useState<string | null>(null);
  const [data, setData] = useState<InfoAppDoc | null>(null);
  const [loading, setLoading] = useState(true);

  // حالات لجميع الحقول
  const [name, setName] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [imageHero, setImageHero] = useState("");
  const [ourStory, setOurStory] = useState("");
  const [ourVision, setOurVision] = useState("");
  const [aboutImage, setAboutImage] = useState("");
  const [slogan, setSlogan] = useState("");
  const [rating, setRating] = useState("");
  const [address, setAddress] = useState("");
  const [openingHours, setOpeningHours] = useState("");
  const [card1Title, setCard1Title] = useState("");
  const [card1Desc, setCard1Desc] = useState("");
  const [card1Show, setCard1Show] = useState(true);
  const [card2Title, setCard2Title] = useState("");
  const [card2Desc, setCard2Desc] = useState("");
  const [card2Show, setCard2Show] = useState(true);
  const [card3Title, setCard3Title] = useState("");
  const [card3Desc, setCard3Desc] = useState("");
  const [card3Show, setCard3Show] = useState(true);

  // حالات الرفع
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [progressLogo, setProgressLogo] = useState(0);
  const [uploadingHero, setUploadingHero] = useState(false);
  const [progressHero, setProgressHero] = useState(0);
  const [uploadingAbout, setUploadingAbout] = useState(false);
  const [progressAbout, setProgressAbout] = useState(0);

  const infoDocRef = useMemo(() => doc(db, "infoApp", "main"), []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        if (!user?.uid) return;
        // تحقق من الدور
        const userSnap = await getDoc(doc(db, "users", user.uid));
        if (userSnap.exists() && mounted) {
          setRole(userSnap.data()?.role ?? null);
        }
        // تحميل بيانات infoApp
        const data = await loadInfoApp();
        if (mounted) {
          setData(data);
          setName(data.name?.toString() || "");
          setLogoUrl(data.logoUrl?.toString() || "");
          setImageHero(data.imageHero?.toString() || "");
          setOurStory(data.ourStory?.toString() || "");
          setOurVision(data.ourVision?.toString() || "");
          setAboutImage(data.aboutImage?.toString() || "");
          setSlogan(data.slogan?.toString() || "");
          setRating(data.rating?.toString() || "");
          setAddress(data.address?.toString() || "");
          setOpeningHours(data.openingHours?.toString() || "");
          setCard1Title(data.card1Title?.toString() || "");
          setCard1Desc(data.card1Desc?.toString() || "");
          setCard1Show(data.card1Show ?? true);
          setCard2Title(data.card2Title?.toString() || "");
          setCard2Desc(data.card2Desc?.toString() || "");
          setCard2Show(data.card2Show ?? true);
          setCard3Title(data.card3Title?.toString() || "");
          setCard3Desc(data.card3Desc?.toString() || "");
          setCard3Show(data.card3Show ?? true);
        }
      } catch (err) {
        console.error(err);
        toast.error("حدث خطأ أثناء التحميل");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [user?.uid, infoDocRef]);

  if (!user) {
    return (
      <div className="p-6 rounded-2xl border bg-neutral-900 text-neutral-200">
        الرجاء تسجيل الدخول لعرض المحرر.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="grid gap-4">
        <div className="animate-pulse h-12 rounded-xl bg-neutral-800" />
        <div className="animate-pulse h-40 rounded-xl bg-neutral-800" />
      </div>
    );
  }

  if (role !== "admin") {
    return (
      <div className="p-6 rounded-2xl border border-red-700/40 bg-red-900/10 text-red-200 flex items-center gap-3">
        <ShieldAlert className="w-5 h-5" />
        ليس لديك صلاحية الوصول إلى محرر الإعدادات.
      </div>
    );
  }

  const saveField = async (field: keyof InfoAppDoc, value: string | boolean) => {
    try {
      // تحديث Firestore
      await updateDoc(infoDocRef, { [field]: value || deleteField() });

      // تحديث الحالة المحلية
      setData((prev) => {
        if (!prev) {
          // إذا كان prev يساوي null، أنشئ كائنًا جديدًا مع قيم افتراضية
          const defaultInfoApp: InfoAppType = {
            name: "",
            logoUrl: "",
            imageHero: "",
            ourStory: "",
            ourVision: "",
            aboutImage: "",
            slogan: "",
            rating: "",
            address: "",
            openingHours: "",
            card1Title: "",
            card1Desc: "",
            card1Show: true,
            card2Title: "",
            card2Desc: "",
            card2Show: true,
            card3Title: "",
            card3Desc: "",
            card3Show: true,
          };
          return { ...defaultInfoApp, [field]: value };
        }
        // إذا كان prev موجودًا، قم بتحديث الحقل المحدد فقط
        return { ...prev, [field]: value };
      });

      toast.success("تم الحفظ");
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "فشل الحفظ");
    }
  };

const deleteFieldWithCloudinary = async (field: "logoUrl" | "imageHero" | "aboutImage") => {
  const url = field === "logoUrl" ? logoUrl : field === "imageHero" ? imageHero : aboutImage;
  try {
    let cloudinarySuccess = true;
    if (url) {
      const publicId = getPublicIdFromUrl(url);
      if (publicId) {
        const res = await fetch("/api/delete-cloudinary", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ publicId, url }), // Include URL for server-side extraction
        });
        if (!res.ok) {
          const errorData = await res.json();
          console.error("Cloudinary delete error:", errorData);
          cloudinarySuccess = false;
          toast.warning(`فشل حذف الصورة من Cloudinary: ${errorData.error || "خطأ غير معروف"}`);
        }
      } else {
        console.warn("No valid publicId extracted from URL:", url);
        cloudinarySuccess = false;
      }
    }

    // Always delete from Firestore, even if Cloudinary deletion fails
    await updateDoc(infoDocRef, { [field]: deleteField() });
    setData((prev) => {
      if (!prev) {
        const defaultInfoApp: InfoAppType = {
          name: "",
          logoUrl: "",
          imageHero: "",
          ourStory: "",
          ourVision: "",
          aboutImage: "",
          slogan: "",
          rating: "",
          address: "",
          openingHours: "",
          card1Title: "",
          card1Desc: "",
          card1Show: true,
          card2Title: "",
          card2Desc: "",
          card2Show: true,
          card3Title: "",
          card3Desc: "",
          card3Show: true,
        };
        return { ...defaultInfoApp, [field]: "" };
      }
      return { ...prev, [field]: "" };
    });

    if (field === "logoUrl") setLogoUrl("");
    else if (field === "imageHero") setImageHero("");
    else setAboutImage("");

    if (url) {
      if (cloudinarySuccess) {
        toast.success("تم الحذف من Cloudinary و Firestore بنجاح");
      } else {
        toast.warning("تم الحذف من Firestore، لكن فشل الحذف من Cloudinary");
      }
    } else {
      toast.success("تم الحذف من Firestore");
    }
  } catch (err: any) {
    console.error("Delete error:", err);
    toast.error(err?.message || "فشل الحذف");
  }
};

  const handleUpload = async (file: File | null, target: "logoUrl" | "imageHero" | "aboutImage") => {
    if (!file) return;
    try {
      if (target === "logoUrl") {
        setUploadingLogo(true);
        setProgressLogo(0);
        const url = await uploadToCloudinary(file, setProgressLogo);
        setLogoUrl(url);
        await saveField("logoUrl", url);
      } else if (target === "imageHero") {
        setUploadingHero(true);
        setProgressHero(0);
        const url = await uploadToCloudinary(file, setProgressHero);
        setImageHero(url);
        await saveField("imageHero", url);
      } else {
        setUploadingAbout(true);
        setProgressAbout(0);
        const url = await uploadToCloudinary(file, setProgressAbout);
        setAboutImage(url);
        await saveField("aboutImage", url);
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "فشل الرفع");
    } finally {
      setUploadingLogo(false);
      setUploadingHero(false);
      setUploadingAbout(false);
      setProgressLogo(0);
      setProgressHero(0);
      setProgressAbout(0);
    }
  };

  return (
    <div className="space-y-8">
      {/* إعدادات التطبيق */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border bg-neutral-900 p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white">إعدادات التطبيق</h2>
          <span className="text-xs text-neutral-400"></span>
        </div>
        <div className="grid gap-4">
          <div className="grid md:grid-cols-[1fr_auto] gap-3 items-end">
            <div>
              <label className="block text-sm text-neutral-300 mb-1">اسم الموقع</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="اكتب اسم التطبيق"
                className="w-full bg-neutral-800 text-white border rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <button
              onClick={() => saveField("name", name)}
              className="inline-flex items-center gap-2 bg-amber-600 text-white px-4 py-2 rounded-xl"
            >
              <Save className="w-4 h-4" /> حفظ الاسم
            </button>
          </div>

          <div className="grid md:grid-cols-[1fr_auto] gap-3 items-end">
            <div>
              <label className="block text-sm text-neutral-300 mb-1">الشعار (Slogan)</label>
              <input
                value={slogan}
                onChange={(e) => setSlogan(e.target.value)}
                placeholder="اكتب الشعار"
                className="w-full bg-neutral-800 text-white border rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <button
              onClick={() => saveField("slogan", slogan)}
              className="inline-flex items-center gap-2 bg-amber-600 text-white px-4 py-2 rounded-xl"
            >
              <Save className="w-4 h-4" /> حفظ الشعار
            </button>
          </div>

          <div className="grid md:grid-cols-[1fr_auto] gap-3 items-end">
            <div>
              <label className="block text-sm text-neutral-300 mb-1">التقييم</label>
              <input
                value={rating}
                onChange={(e) => setRating(e.target.value)}
                placeholder="اكتب التقييم (مثل 4.8)"
                className="w-full bg-neutral-800 text-white border rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <button
              onClick={() => saveField("rating", rating)}
              className="inline-flex items-center gap-2 bg-amber-600 text-white px-4 py-2 rounded-xl"
            >
              <Save className="w-4 h-4" /> حفظ التقييم
            </button>
          </div>

          <div className="grid md:grid-cols-[1fr_auto] gap-3 items-end">
            <div>
              <label className="block text-sm text-neutral-300 mb-1">العنوان</label>
              <input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="اكتب العنوان"
                className="w-full bg-neutral-800 text-white border rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <button
              onClick={() => saveField("address", address)}
              className="inline-flex items-center gap-2 bg-amber-600 text-white px-4 py-2 rounded-xl"
            >
              <Save className="w-4 h-4" /> حفظ العنوان
            </button>
          </div>

          <div className="grid md:grid-cols-[1fr_auto] gap-3 items-end">
            <div>
              <label className="block text-sm text-neutral-300 mb-1">ساعات العمل</label>
              <input
                value={openingHours}
                onChange={(e) => setOpeningHours(e.target.value)}
                placeholder="اكتب ساعات العمل"
                className="w-full bg-neutral-800 text-white border rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <button
              onClick={() => saveField("openingHours", openingHours)}
              className="inline-flex items-center gap-2 bg-amber-600 text-white px-4 py-2 rounded-xl"
            >
              <Save className="w-4 h-4" /> حفظ ساعات العمل
            </button>
          </div>
        </div>
      </motion.div>

     

      

      {/* الشعار */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border bg-neutral-900 p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">شعار الموقع (Logo)</h3>
          {logoUrl ? (
            <span className="flex items-center gap-1 text-emerald-400 text-sm">
              <CheckCircle className="w-4 h-4" /> موجود
            </span>
          ) : (
            <span className="text-neutral-400 text-sm">غير مرفوع</span>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="relative w-40 h-40 rounded-xl overflow-hidden border bg-neutral-800 flex items-center justify-center">
              {logoUrl ? (
                <Image
                  src={logoUrl}
                  alt="Logo preview"
                  fill
                  className="object-contain"
                  sizes="160px"
                />
              ) : (
                <div className="text-neutral-500 text-sm">لا توجد صورة</div>
              )}
            </div>

            <div className="flex items-center gap-3">
              <label className="inline-flex items-center gap-2 bg-neutral-800 text-white px-4 py-2 rounded-xl cursor-pointer">
                <UploadCloud className="w-4 h-4" />
                {uploadingLogo ? "جارٍ الرفع..." : "رفع صورة"}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleUpload(e.target.files?.[0] || null, "logoUrl")}
                />
              </label>

              <button
                onClick={() => deleteFieldWithCloudinary("logoUrl")}
                className="inline-flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-xl"
              >
                <Trash2 className="w-4 h-4" /> حذف
              </button>
            </div>

            {uploadingLogo && (
              <div className="w-full h-2 bg-neutral-800 rounded-full">
                <div className="h-2 bg-amber-500" style={{ width: `${progressLogo}%` }} />
              </div>
            )}

            <div className="grid md:grid-cols-[1fr_auto] gap-3 items-end">
              <input
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                placeholder="أو ضع رابط الصورة مباشرة"
                className="w-full bg-neutral-800 text-white border rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-amber-500"
              />
              <button
                onClick={() => saveField("logoUrl", logoUrl)}
                className="inline-flex items-center gap-2 bg-amber-600 text-white px-4 py-2 rounded-xl"
              >
                <Pencil className="w-4 h-4" /> حفظ الرابط
              </button>
            </div>
          </div>

          <div className="text-sm text-neutral-400 space-y-2">
            <p>يفضل استخدام صور شفافة للشعار (512×512).</p>
            <p>إذا وضعت رابط Cloudinary يدويًا، سيحاول النظام استخراج publicId عند الحذف.</p>
          </div>
        </div>
      </motion.div>

      {/* صورة الصفحة الرئيسية */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border bg-neutral-900 p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">صورة الصفحة الرئيسية</h3>
          {imageHero ? (
            <span className="flex items-center gap-1 text-emerald-400 text-sm">
              <CheckCircle className="w-4 h-4" /> موجود
            </span>
          ) : (
            <span className="text-neutral-400 text-sm">غير مرفوع</span>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="relative w-full max-w-xl aspect-[16/9] rounded-xl overflow-hidden border bg-neutral-800">
              {imageHero ? (
                <Image
                  src={imageHero}
                  alt="Hero preview"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 512px"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-neutral-500 text-sm">
                  لا توجد صورة
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              <label className="inline-flex items-center gap-2 bg-neutral-800 text-white px-4 py-2 rounded-xl cursor-pointer">
                <ImagePlus className="w-4 h-4" />
                {uploadingHero ? "جارٍ الرفع..." : "رفع صورة"}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleUpload(e.target.files?.[0] || null, "imageHero")}
                />
              </label>

              <button
                onClick={() => deleteFieldWithCloudinary("imageHero")}
                className="inline-flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-xl"
              >
                <Trash2 className="w-4 h-4" /> حذف
              </button>
            </div>

            {uploadingHero && (
              <div className="w-full h-2 bg-neutral-800 rounded-full">
                <div className="h-2 bg-amber-500" style={{ width: `${progressHero}%` }} />
              </div>
            )}

            <div className="grid md:grid-cols-[1fr_auto] gap-3 items-end">
              <input
                value={imageHero}
                onChange={(e) => setImageHero(e.target.value)}
                placeholder="أو ضع رابط الصورة مباشرة"
                className="w-full bg-neutral-800 text-white border rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-amber-500"
              />
              <button
                onClick={() => saveField("imageHero", imageHero)}
                className="inline-flex items-center gap-2 bg-amber-600 text-white px-4 py-2 rounded-xl"
              >
                <Pencil className="w-4 h-4" /> حفظ الرابط
              </button>
            </div>
          </div>

          <div className="text-sm text-neutral-400 space-y-2">
            <p>المقاس المثالي: 1280×720 أو 1920×1080.</p>
            <p>تأكد من تباين النص فوق الصورة.</p>
          </div>
        </div>
      </motion.div>

      {/* الكروت */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border bg-neutral-900 p-6"
      >
        <h2 className="text-xl font-semibold text-white mb-4">إعدادات الكروت</h2>
        {/* الكرت الأول */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">الكرت الأول</h3>
            <button
              onClick={() => {
                setCard1Show(!card1Show);
                saveField("card1Show", !card1Show);
              }}
              className="inline-flex items-center gap-2 text-sm"
            >
              {card1Show ? (
                <ToggleRight className="w-5 h-5 text-emerald-400" />
              ) : (
                <ToggleLeft className="w-5 h-5 text-neutral-400" />
              )}
              {card1Show ? "إظهار" : "إخفاء"}
            </button>
          </div>
          <div className="grid gap-4">
            <div className="grid md:grid-cols-[1fr_auto] gap-3 items-end">
              <div>
                <label className="block text-sm text-neutral-300 mb-1">عنوان الكرت</label>
                <input
                  value={card1Title}
                  onChange={(e) => setCard1Title(e.target.value)}
                  placeholder="عنوان الكرت الأول"
                  className="w-full bg-neutral-800 text-white border rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <button
                onClick={() => saveField("card1Title", card1Title)}
                className="inline-flex items-center gap-2 bg-amber-600 text-white px-4 py-2 rounded-xl"
              >
                <Save className="w-4 h-4" /> حفظ العنوان
              </button>
            </div>
            <div className="grid md:grid-cols-[1fr_auto] gap-3 items-end">
              <div>
                <label className="block text-sm text-neutral-300 mb-1">وصف الكرت</label>
                <textarea
                  value={card1Desc}
                  onChange={(e) => setCard1Desc(e.target.value)}
                  placeholder="وصف الكرت الأول"
                  className="w-full bg-neutral-800 text-white border rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-amber-500 h-24"
                />
              </div>
              <button
                onClick={() => saveField("card1Desc", card1Desc)}
                className="inline-flex items-center gap-2 bg-amber-600 text-white px-4 py-2 rounded-xl"
              >
                <Save className="w-4 h-4" /> حفظ الوصف
              </button>
            </div>
          </div>
        </div>

        {/* الكرت الثاني */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">الكرت الثاني</h3>
            <button
              onClick={() => {
                setCard2Show(!card2Show);
                saveField("card2Show", !card2Show);
              }}
              className="inline-flex items-center gap-2 text-sm"
            >
              {card2Show ? (
                <ToggleRight className="w-5 h-5 text-emerald-400" />
              ) : (
                <ToggleLeft className="w-5 h-5 text-neutral-400" />
              )}
              {card2Show ? "إظهار" : "إخفاء"}
            </button>
          </div>
          <div className="grid gap-4">
            <div className="grid md:grid-cols-[1fr_auto] gap-3 items-end">
              <div>
                <label className="block text-sm text-neutral-300 mb-1">عنوان الكرت</label>
                <input
                  value={card2Title}
                  onChange={(e) => setCard2Title(e.target.value)}
                  placeholder="عنوان الكرت الثاني"
                  className="w-full bg-neutral-800 text-white border rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <button
                onClick={() => saveField("card2Title", card2Title)}
                className="inline-flex items-center gap-2 bg-amber-600 text-white px-4 py-2 rounded-xl"
              >
                <Save className="w-4 h-4" /> حفظ العنوان
              </button>
            </div>
            <div className="grid md:grid-cols-[1fr_auto] gap-3 items-end">
              <div>
                <label className="block text-sm text-neutral-300 mb-1">وصف الكرت</label>
                <textarea
                  value={card2Desc}
                  onChange={(e) => setCard2Desc(e.target.value)}
                  placeholder="وصف الكرت الثاني"
                  className="w-full bg-neutral-800 text-white border rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-amber-500 h-24"
                />
              </div>
              <button
                onClick={() => saveField("card2Desc", card2Desc)}
                className="inline-flex items-center gap-2 bg-amber-600 text-white px-4 py-2 rounded-xl"
              >
                <Save className="w-4 h-4" /> حفظ الوصف
              </button>
            </div>
          </div>
        </div>

        {/* الكرت الثالث */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">الكرت الثالث</h3>
            <button
              onClick={() => {
                setCard3Show(!card3Show);
                saveField("card3Show", !card3Show);
              }}
              className="inline-flex items-center gap-2 text-sm"
            >
              {card3Show ? (
                <ToggleRight className="w-5 h-5 text-emerald-400" />
              ) : (
                <ToggleLeft className="w-5 h-5 text-neutral-400" />
              )}
              {card3Show ? "إظهار" : "إخفاء"}
            </button>
          </div>
          <div className="grid gap-4">
            <div className="grid md:grid-cols-[1fr_auto] gap-3 items-end">
              <div>
                <label className="block text-sm text-neutral-300 mb-1">عنوان الكرت</label>
                <input
                  value={card3Title}
                  onChange={(e) => setCard3Title(e.target.value)}
                  placeholder="عنوان الكرت الثالث"
                  className="w-full bg-neutral-800 text-white border rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <button
                onClick={() => saveField("card3Title", card3Title)}
                className="inline-flex items-center gap-2 bg-amber-600 text-white px-4 py-2 rounded-xl"
              >
                <Save className="w-4 h-4" /> حفظ العنوان
              </button>
            </div>
            <div className="grid md:grid-cols-[1fr_auto] gap-3 items-end">
              <div>
                <label className="block text-sm text-neutral-300 mb-1">وصف الكرت</label>
                <textarea
                  value={card3Desc}
                  onChange={(e) => setCard3Desc(e.target.value)}
                  placeholder="وصف الكرت الثالث"
                  className="w-full bg-neutral-800 text-white border rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-amber-500 h-24"
                />
              </div>
              <button
                onClick={() => saveField("card3Desc", card3Desc)}
                className="inline-flex items-center gap-2 bg-amber-600 text-white px-4 py-2 rounded-xl"
              >
                <Save className="w-4 h-4" /> حفظ الوصف
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="text-xs text-neutral-500">
        <span className="inline-flex items-center gap-1">
          <Loader2 className="w-3 h-3 animate-spin" /> أي تعديل يُحفَظ مباشرة في Firestore.
        </span>
      </div>
    </div>
  );
}