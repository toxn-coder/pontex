"use client";

import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Save, Trash2, UploadCloud } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

import { db, auth } from "@/app/api/firebase";
import { doc, getDoc, updateDoc, deleteField } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";

type AboutFields = {
  ourStory?: string;
  ourVision?: string;
  aboutImage?: string;
};

export default function AboutEditor() {
  const [user] = useAuthState(auth);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [ourStory, setOurStory] = useState("");
  const [ourVision, setOurVision] = useState("");
  const [aboutImage, setAboutImage] = useState("");

  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const infoDocRef = useMemo(() => doc(db, "infoApp", "main"), []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        if (!user?.uid) return;
        const userSnap = await getDoc(doc(db, "users", user.uid));
        if (userSnap.exists() && mounted) {
          setRole(userSnap.data()?.role ?? null);
        }
        const snap = await getDoc(infoDocRef);
        if (snap.exists() && mounted) {
          const d = snap.data() as AboutFields;
          setOurStory(d.ourStory || "");
          setOurVision(d.ourVision || "");
          setAboutImage(d.aboutImage || "");
        }
      } catch (err) {
        console.error(err);
        toast.error("فشل تحميل البيانات");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [user?.uid, infoDocRef]);

  const saveField = async (field: keyof AboutFields, value: string) => {
    try {
      await updateDoc(infoDocRef, { [field]: value || deleteField() });
      toast.success("تم الحفظ");
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "فشل الحفظ");
    }
  };

  const handleUpload = async (file: File | null) => {
    if (!file) return;
    setUploading(true);
    setProgress(0);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!);

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!res.ok) throw new Error("فشل رفع الصورة");

      const data = await res.json();
      setAboutImage(data.secure_url);
      await saveField("aboutImage", data.secure_url);
      toast.success("تم رفع الصورة بنجاح");
    } catch (err: any) {
      console.error(err);
      toast.error("فشل رفع الصورة");
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  if (!user) return <div className="p-6 bg-neutral-900 text-white">الرجاء تسجيل الدخول</div>;
  if (loading) return <div className="p-6 bg-neutral-900 text-white">جارٍ التحميل...</div>;
  if (role !== "admin")
    return <div className="p-6 bg-red-900/30 text-red-200">لا تملك صلاحيات الوصول</div>;

  return (
    <div className="space-y-6">
      {/* قصتنا */}
      <motion.div className="p-6 rounded-2xl border bg-neutral-900">
        <h2 className="text-lg font-bold text-white mb-3">قصتنا</h2>
        <textarea
          value={ourStory}
          onChange={(e) => setOurStory(e.target.value)}
          placeholder="أدخل قصتنا..."
          className="w-full bg-neutral-800 text-white rounded-xl p-3 h-32"
        />
        <button
          onClick={() => saveField("ourStory", ourStory)}
          className="mt-3 inline-flex items-center gap-2 bg-amber-600 text-white px-4 py-2 rounded-xl"
        >
          <Save className="w-4 h-4" /> حفظ
        </button>
      </motion.div>

      {/* رؤيتنا */}
      <motion.div className="p-6 rounded-2xl border bg-neutral-900">
        <h2 className="text-lg font-bold text-white mb-3">رؤيتنا</h2>
        <textarea
          value={ourVision}
          onChange={(e) => setOurVision(e.target.value)}
          placeholder="أدخل رؤيتنا..."
          className="w-full bg-neutral-800 text-white rounded-xl p-3 h-32"
        />
        <button
          onClick={() => saveField("ourVision", ourVision)}
          className="mt-3 inline-flex items-center gap-2 bg-amber-600 text-white px-4 py-2 rounded-xl"
        >
          <Save className="w-4 h-4" /> حفظ
        </button>
      </motion.div>

      {/* الصورة
      <motion.div className="p-6 rounded-2xl border bg-neutral-900 space-y-3">
        <h2 className="text-lg font-bold text-white">صورة عنّا</h2>
        <div className="relative w-full max-w-lg aspect-[16/9] bg-neutral-800 rounded-xl overflow-hidden">
          {aboutImage ? (
            <Image src={aboutImage} alt="about" fill className="object-cover" />
          ) : (
            <div className="flex items-center justify-center h-full text-neutral-500">
              لا توجد صورة
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <label className="inline-flex items-center gap-2 bg-neutral-800 hover:bg-neutral-700 text-white px-4 py-2 rounded-xl cursor-pointer transition">
            <UploadCloud className="w-4 h-4" />
            {uploading ? "جارٍ الرفع..." : "رفع صورة"}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleUpload(e.target.files?.[0] || null)}
            />
          </label>
          <button
            onClick={() => saveField("aboutImage", "")}
            className="inline-flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-xl"
          >
            <Trash2 className="w-4 h-4" /> حذف
          </button>
        </div>

        {uploading && (
          <div className="w-full h-2 bg-neutral-800 rounded-full overflow-hidden">
            <div className="h-2 bg-amber-500 animate-pulse" style={{ width: `${progress}%` }} />
          </div>
        )}

        <input
          value={aboutImage}
          onChange={(e) => setAboutImage(e.target.value)}
          placeholder="أو ضع رابط الصورة مباشرة"
          className="w-full bg-neutral-800 text-white rounded-xl p-3"
        />
        <button
          onClick={() => saveField("aboutImage", aboutImage)}
          className="mt-3 inline-flex items-center gap-2 bg-amber-600 text-white px-4 py-2 rounded-xl"
        >
          <Save className="w-4 h-4" /> حفظ الرابط
        </button>
      </motion.div> */}
    </div>
  );
}
