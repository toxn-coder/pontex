"use client";

import { useState, useEffect } from "react";
import { db } from "@/app/api/firebase";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  Image as ImageIcon,
  Type,
  FileText,
  Save,
  Check,
} from "lucide-react";

export default function AdminAddSection() {
  const [formData, setFormData] = useState({
    imageUrl: "",
    title: "",
    description: "",
  });
  const [file, setFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  // ---------- ترتيب ----------
  const [selectedOrder, setSelectedOrder] = useState<number | null>(null);
  const [usedOrders, setUsedOrders] = useState<Set<number>>(new Set());
  const orderOptions = Array.from({ length: 10 }, (_, i) => i + 1); // 1‑10

  // جلب الأرقام المستخدمة عند تحميل الصفحة
  useEffect(() => {
    const fetchUsedOrders = async () => {
      try {
        const q = query(collection(db, "production"), where("order", ">=", 1));
        const snap = await getDocs(q);
        const used = new Set<number>();
        snap.forEach((doc) => {
          const data = doc.data();
          if (typeof data.order === "number") used.add(data.order);
        });
        setUsedOrders(used);
      } catch (err) {
        console.error("جلب ترتيب فشل:", err);
      }
    };
    fetchUsedOrders();
  }, []);

  // ---------- تحديث الحقول ----------
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setFile(e.target.files[0]);
  };

  // ---------- رفع الصورة ----------
  const uploadImageToCloudinary = async () => {
    if (!file) return "";
    const data = new FormData();
    data.append("file", file);
    data.append(
      "upload_preset",
      process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!
    );

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
      { method: "POST", body: data }
    );
    const result = await res.json();
    return result.secure_url as string;
  };

  // ---------- إرسال البيانات ----------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedOrder === null) {
      toast.error("يرجى اختيار رقم ترتيب");
      return;
    }

    setIsSaving(true);
    setStatus(null);

    try {
      let imageUrl = formData.imageUrl;
      if (file) imageUrl = await uploadImageToCloudinary();

      await addDoc(collection(db, "production"), {
        imageUrl,
        title: formData.title,
        description: formData.description,
        order: selectedOrder,
        createdAt: new Date(),
      });

      toast.success("تم إضافة القسم بنجاح");
      setStatus("success");

      // إعادة تعيين النموذج
      setFormData({ imageUrl: "", title: "", description: "" });
      setFile(null);
      setSelectedOrder(null);

      // تحديث الأرقام المستخدمة محلياً
      setUsedOrders((prev) => new Set(prev).add(selectedOrder));
    } catch (error) {
      console.error("Firestore error:", error);
      toast.error("حدث خطأ أثناء الحفظ");
      setStatus("error");
    } finally {
      setIsSaving(false);
      setTimeout(() => setStatus(null), 3000);
    }
  };

  return (
    <div className="bg-gray-800 rounded-2xl shadow-xl p-6 max-w-xl mx-auto my-10">
      <h2 className="text-2xl font-bold text-white mb-6 text-center">
        إضافة قسم إنتاج جديد
      </h2>

      <motion.form
        onSubmit={handleSubmit}
        className="space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* صورة */}
        <div className="flex items-center gap-3">
          <ImageIcon className="w-6 h-6 text-amber-500 flex-shrink-0" />
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="w-full text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-amber-600 file:text-white hover:file:bg-amber-700"
          />
        </div>
        {file && (
          <p className="text-green-400 text-sm ml-9">
            {file.name} تم اختياره
          </p>
        )}

        {/* العنوان */}
        <div className="flex items-center gap-3">
          <Type className="w-6 h-6 text-amber-500 flex-shrink-0" />
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="عنوان القسم"
            className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            required
          />
        </div>

        {/* الوصف */}
        <div className="flex items-center gap-3">
          <FileText className="w-6 h-6 text-amber-500 flex-shrink-0" />
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="أدخل وصف القسم..."
            className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            rows={4}
            required
          />
        </div>

        {/* اختيار الترتيب */}
        <div className="flex flex-col gap-2">
          <label className="text-amber-500 font-medium flex items-center gap-2">
            <span className="w-6 h-6 flex items-center justify-center">
              #
            </span>
            ترتيب العرض (1‑10)
          </label>
          <div className="grid grid-cols-5 gap-2">
            {orderOptions.map((num) => {
              const isUsed = usedOrders.has(num);
              const isSelected = selectedOrder === num;

              return (
                <button
                  key={num}
                  type="button"
                  disabled={isUsed && !isSelected} // لا يمكن اختيار رقم مستخدم إلا إذا كان هو المختار حالياً
                  onClick={() => setSelectedOrder(num)}
                  className={`
                    relative flex items-center justify-center
                    py-2 rounded-lg text-sm font-medium transition-all
                    ${
                      isSelected
                        ? "bg-amber-600 text-white ring-2 ring-amber-400"
                        : isUsed
                        ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                        : "bg-gray-700 text-white hover:bg-gray-600"
                    }
                  `}
                >
                  {num}
                  {isUsed && !isSelected && (
                    <Check className="absolute -top-1 -right-1 w-4 h-4 text-green-500" />
                  )}
                </button>
              );
            })}
          </div>
          {selectedOrder === null && (
            <p className="text-xs text-red-400 mt-1">
              يرجى اختيار رقم ترتيب
            </p>
          )}
        </div>

        {/* زر الحفظ */}
        <motion.button
          type="submit"
          disabled={isSaving || selectedOrder === null}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`
            w-full px-6 py-3 rounded-lg text-white font-medium transition-colors
            flex items-center justify-center gap-2
            ${
              isSaving || selectedOrder === null
                ? "bg-gray-500 cursor-not-allowed"
                : "bg-amber-600 hover:bg-amber-700"
            }
          `}
        >
          {isSaving ? (
            <>
              <svg
                className="animate-spin h-5 w-5 text-white"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              جارٍ الحفظ...
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              إضافة القسم
            </>
          )}
        </motion.button>

        {/* رسائل الحالة */}
        {status === "success" && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 text-green-500 text-center text-sm"
          >
            تم إضافة القسم بنجاح!
          </motion.p>
        )}
        {status === "error" && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 text-red-500 text-center text-sm"
          >
            حدث خطأ أثناء الحفظ. حاول مرة أخرى.
          </motion.p>
        )}
      </motion.form>
    </div>
  );
}