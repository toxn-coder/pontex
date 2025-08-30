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
} from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

import { db, auth } from "@/app/api/firebase";
import { doc, getDoc, updateDoc, deleteField } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";

/* --- utility functions (مثل ما في نسختك) --- */
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

/* --- Component --- */
type InfoAppDoc = {
  name?: string;
  logoUrl?: string;
  imageHero?: string;
};

export default function InfoAppEditor() {
  const [user] = useAuthState(auth);
  const [role, setRole] = useState<string | null>(null);
  const [data, setData] = useState<InfoAppDoc | null>(null);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [imageHero, setImageHero] = useState("");

  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [progressLogo, setProgressLogo] = useState(0);
  const [uploadingHero, setUploadingHero] = useState(false);
  const [progressHero, setProgressHero] = useState(0);

  const infoDocRef = useMemo(() => doc(db, "infoApp", "main"), []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        if (!user?.uid) return;
        // role
        const userSnap = await getDoc(doc(db, "users", user.uid));
        if (userSnap.exists() && mounted) {
          setRole(userSnap.data()?.role ?? null);
        }
        // infoApp
        const snap = await getDoc(infoDocRef);
        if (snap.exists() && mounted) {
          const d = snap.data() as InfoAppDoc;
          setData(d);
          setName(d.name || "");
          setLogoUrl(d.logoUrl || "");
          setImageHero(d.imageHero || "");
        } else if (mounted) {
          setData({});
        }
      } catch (err) {
        console.error(err);
        toast.error("حدث خطأ أثناء التحميل");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
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

  const saveField = async (field: keyof InfoAppDoc, value: string) => {
    try {
      await updateDoc(infoDocRef, { [field]: value || deleteField() });
      setData((prev) => ({ ...(prev || {}), [field]: value || undefined }));
      toast.success("تم الحفظ");
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "فشل الحفظ");
    }
  };

  const deleteFieldWithCloudinary = async (field: "logoUrl" | "imageHero") => {
    const url = field === "logoUrl" ? logoUrl : imageHero;
    if (!url) {
      try {
        await updateDoc(infoDocRef, { [field]: deleteField() });
        setData((prev) => ({ ...(prev || {}), [field]: undefined }));
        if (field === "logoUrl") setLogoUrl(""); else setImageHero("");
        toast.success("تم الحذف من Firestore");
      } catch (err) {
        console.error(err);
        toast.error("فشل الحذف");
      }
      return;
    }

    const publicId = getPublicIdFromUrl(url);
    try {
      if (publicId) {
        const res = await fetch("/api/delete-cloudinary", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ publicId }),
        });
        if (!res.ok) throw new Error("فشل حذف من Cloudinary");
      }
      await updateDoc(infoDocRef, { [field]: deleteField() });
      setData((prev) => ({ ...(prev || {}), [field]: undefined }));
      if (field === "logoUrl") setLogoUrl(""); else setImageHero("");
      toast.success("تم الحذف بنجاح");
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "فشل الحذف");
    }
  };

  const handleUpload = async (file: File | null, target: "logoUrl" | "imageHero") => {
    if (!file) return;
    try {
      if (target === "logoUrl") {
        setUploadingLogo(true); setProgressLogo(0);
        const url = await uploadToCloudinary(file, setProgressLogo);
        setLogoUrl(url); await saveField("logoUrl", url);
      } else {
        setUploadingHero(true); setProgressHero(0);
        const url = await uploadToCloudinary(file, setProgressHero);
        setImageHero(url); await saveField("imageHero", url);
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "فشل الرفع");
    } finally {
      setUploadingLogo(false); setUploadingHero(false);
      setProgressLogo(0); setProgressHero(0);
    }
  };

  return (
    <div className="space-y-8">
     
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border bg-neutral-900 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white">إعدادات التطبيق</h2>
          <span className="text-xs text-neutral-400"></span>
        </div>
        <div className="grid md:grid-cols-[1fr_auto] gap-3 items-end">
          <div>
            <label className="block text-sm text-neutral-300 mb-1">اسم الموقع</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="اكتب اسم التطبيق" className="w-full bg-neutral-800 text-white border rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-amber-500" />
          </div>
          <button onClick={() => saveField("name", name)} className="inline-flex items-center gap-2 bg-amber-600 text-white px-4 py-2 rounded-xl">
            <Save className="w-4 h-4" /> حفظ الاسم
          </button>
        </div>
      </motion.div>

      {/* الشعار */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border bg-neutral-900 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">شعار الموقع Logo</h3>
          {logoUrl ? <span className="flex items-center gap-1 text-emerald-400 text-sm"><CheckCircle className="w-4 h-4" /> موجود</span> : <span className="text-neutral-400 text-sm">غير مرفوع</span>}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="relative w-40 h-40 rounded-xl overflow-hidden border bg-neutral-800 flex items-center justify-center">
              {logoUrl ? <Image src={logoUrl} alt="Logo preview" fill className="object-contain" sizes="160px" /> : <div className="text-neutral-500 text-sm">لا توجد صورة</div>}
            </div>

            <div className="flex items-center gap-3">
              <label className="inline-flex items-center gap-2 bg-neutral-800 text-white px-4 py-2 rounded-xl cursor-pointer">
                <UploadCloud className="w-4 h-4" />
                {uploadingLogo ? "جارٍ الرفع..." : "رفع صورة"}
                <input type="file" accept="image/*" className="hidden" onChange={(e) => handleUpload(e.target.files?.[0] || null, "logoUrl")} />
              </label>

              <button onClick={() => deleteFieldWithCloudinary("logoUrl")} className="inline-flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-xl">
                <Trash2 className="w-4 h-4" /> حذف
              </button>
            </div>

            {uploadingLogo && <div className="w-full h-2 bg-neutral-800 rounded-full"><div className="h-2 bg-amber-500" style={{ width: `${progressLogo}%` }} /></div>}

            <div className="grid md:grid-cols-[1fr_auto] gap-3 items-end">
              <input value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} placeholder="أو ضع رابط الصورة مباشرة" className="w-full bg-neutral-800 text-white border rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-amber-500" />
              <button onClick={() => saveField("logoUrl", logoUrl)} className="inline-flex items-center gap-2 bg-amber-600 text-white px-4 py-2 rounded-xl">
                <Pencil className="w-4 h-4" /> حفظ الرابط
              </button>
            </div>
          </div>

          <div className="text-sm text-neutral-400 space-y-2">
            <p>يفضل استخدام صور مربعة للشعار (512×512).</p>
            <p>إذا وضعت رابط Cloudinary يدويًا، سيحاول النظام استخراج publicId عند الحذف.</p>
          </div>
        </div>
      </motion.div>

      {/* Hero */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border bg-neutral-900 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">صورة الصفحة الرئيسية</h3>
          {imageHero ? <span className="flex items-center gap-1 text-emerald-400 text-sm"><CheckCircle className="w-4 h-4" /> موجود</span> : <span className="text-neutral-400 text-sm">غير مرفوع</span>}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="relative w-full max-w-xl aspect-[16/9] rounded-xl overflow-hidden border bg-neutral-800">
              {imageHero ? <Image src={imageHero} alt="Hero preview" fill className="object-cover" sizes="(max-width: 768px) 100vw, 512px" /> : <div className="absolute inset-0 flex items-center justify-center text-neutral-500 text-sm">لا توجد صورة</div>}
            </div>

            <div className="flex items-center gap-3">
              <label className="inline-flex items-center gap-2 bg-neutral-800 text-white px-4 py-2 rounded-xl cursor-pointer">
                <ImagePlus className="w-4 h-4" />
                {uploadingHero ? "جارٍ الرفع..." : "رفع صورة"}
                <input type="file" accept="image/*" className="hidden" onChange={(e) => handleUpload(e.target.files?.[0] || null, "imageHero")} />
              </label>

              <button onClick={() => deleteFieldWithCloudinary("imageHero")} className="inline-flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-xl">
                <Trash2 className="w-4 h-4" /> حذف
              </button>
            </div>

            {uploadingHero && <div className="w-full h-2 bg-neutral-800 rounded-full"><div className="h-2 bg-amber-500" style={{ width: `${progressHero}%` }} /></div>}

            <div className="grid md:grid-cols-[1fr_auto] gap-3 items-end">
              <input value={imageHero} onChange={(e) => setImageHero(e.target.value)} placeholder="أو ضع رابط الصورة مباشرة" className="w-full bg-neutral-800 text-white border rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-amber-500" />
              <button onClick={() => saveField("imageHero", imageHero)} className="inline-flex items-center gap-2 bg-amber-600 text-white px-4 py-2 rounded-xl">
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

      <div className="text-xs text-neutral-500">
        <span className="inline-flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin" /> أي تعديل يُحفَظ مباشرة في Firestore.</span>
      </div>
    </div>
  );
}
