"use client";

import { useEffect, useState } from "react";
import { db } from "@/app/api/firebase";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Trash2, Save, Edit, Check } from "lucide-react";

// ✅ تعريف نوع البيانات بشكل صحيح
interface SectionData {
  id: string;
  imageUrl: string;
  title: string;
  description: string;
  order?: number;
  createdAt?: any;
  updatedAt?: any;
}

export default function AdminEditSection() {
  const [sections, setSections] = useState<SectionData[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    imageUrl: "",
    title: "",
    description: "",
  });
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  // ترتيب الأقسام
  const [selectedOrder, setSelectedOrder] = useState<number | null>(null);
  const [usedOrders, setUsedOrders] = useState<Set<number>>(new Set());
  const orderOptions = Array.from({ length: 10 }, (_, i) => i + 1); // 1‑10

  // جلب الأقسام + الأرقام المستخدمة
  const fetchSections = async () => {
    try {
      const snapshot = await getDocs(collection(db, "production"));

      // تحويل البيانات مع التحقق من الأنواع
      const data: SectionData[] = snapshot.docs.map((doc) => {
        const d = doc.data();
        return {
          id: doc.id,
          imageUrl: (d.imageUrl as string) || "",
          title: (d.title as string) || "",
          description: (d.description as string) || "",
          order: typeof d.order === "number" ? d.order : undefined,
          createdAt: d.createdAt || null,
          updatedAt: d.updatedAt || null,
        };
      });

      setSections(data);

      // جمع الأرقام المستخدمة
      const used = new Set<number>();
      data.forEach((sec) => {
        if (typeof sec.order === "number") used.add(sec.order);
      });
      setUsedOrders(used);
    } catch (err) {
      console.error("Error fetching sections:", err);
      toast.error("فشل في جلب الأقسام");
    }
  };

  useEffect(() => {
    fetchSections();
  }, []);

  // رفع صورة جديدة
  const uploadImageToCloudinary = async () => {
    if (!file) return formData.imageUrl;

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

  // بدء التعديل
  const handleEdit = (section: SectionData) => {
    setEditingId(section.id);
    setFormData({
      imageUrl: section.imageUrl || "",
      title: section.title || "",
      description: section.description || "",
    });
    setSelectedOrder(section.order || null);
    setFile(null);
  };

  // حفظ التعديلات
  const handleSave = async () => {
    if (!editingId) return;
    if (selectedOrder === null) {
      toast.error("يرجى اختيار رقم ترتيب");
      return;
    }

    setLoading(true);

    try {
      let imageUrl = formData.imageUrl;
      if (file) {
        imageUrl = await uploadImageToCloudinary();
      }

      const docRef = doc(db, "production", editingId);
      await updateDoc(docRef, {
        imageUrl,
        title: formData.title,
        description: formData.description,
        order: selectedOrder,
        updatedAt: new Date(),
      });

      toast.success("✅ تم تحديث القسم بنجاح");
      setEditingId(null);
      setFormData({ imageUrl: "", title: "", description: "" });
      setFile(null);
      setSelectedOrder(null);

      // تحديث محلي
      fetchSections();
    } catch (err) {
      console.error("Error updating section:", err);
      toast.error("❌ فشل في تحديث القسم");
    } finally {
      setLoading(false);
    }
  };

  // حذف القسم
  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من الحذف؟")) return;

    try {
      await deleteDoc(doc(db, "production", id));
      toast.success("🗑️ تم حذف القسم بنجاح");
      fetchSections();
    } catch (err) {
      console.error("Error deleting section:", err);
      toast.error("❌ فشل في حذف القسم");
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-gray-900 rounded-2xl p-6 shadow-xl">
      <h2 className="text-2xl font-bold text-white mb-6">📝 تعديل الأقسام</h2>

      <div className="space-y-6">
        {sections.map((section) => (
          <motion.div
            key={section.id}
            className="bg-gray-800 rounded-xl p-4 shadow-md"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {editingId === section.id ? (
              <div className="space-y-4">
                {/* صورة */}
                <div>
                  <label className="block text-gray-300 mb-1">📸 صورة القسم</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      e.target.files && setFile(e.target.files[0])
                    }
                    className="w-full text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-amber-600 file:text-white hover:file:bg-amber-700"
                  />
                  {file ? (
                    <p className="text-green-400 mt-1 text-sm">
                      ✅ {file.name} تم اختياره
                    </p>
                  ) : (
                    formData.imageUrl && (
                      <img
                        src={formData.imageUrl}
                        alt="preview"
                        className="mt-2 w-32 rounded-lg shadow"
                      />
                    )
                  )}
                </div>

                {/* العنوان */}
                <div>
                  <label className="block text-gray-300 mb-1">📌 العنوان</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    className="w-full rounded-lg p-2 bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    required
                  />
                </div>

                {/* الوصف */}
                <div>
                  <label className="block text-gray-300 mb-1">📝 الوصف</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="w-full rounded-lg p-2 bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    rows={3}
                    required
                  />
                </div>

                {/* اختيار الترتيب */}
                <div className="flex flex-col gap-2">
                  <label className="text-amber-500 font-medium flex items-center gap-2">
                    <span className="w-6 h-6 flex items-center justify-center">#</span>
                    ترتيب العرض (1‑10)
                  </label>
                  <div className="grid grid-cols-5 gap-2">
                    {orderOptions.map((num) => {
                      const isUsed = usedOrders.has(num);
                      const isSelected = selectedOrder === num;
                      const isCurrentSectionOrder = section.order === num;

                      return (
                        <button
                          key={num}
                          type="button"
                          disabled={isUsed && !isCurrentSectionOrder && !isSelected}
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
                      ⚠️ يرجى اختيار رقم ترتيب
                    </p>
                  )}
                </div>

                {/* أزرار الحفظ والإلغاء */}
                <div className="flex gap-3">
                  <button
                    onClick={handleSave}
                    disabled={loading || selectedOrder === null}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium transition-colors ${
                      loading || selectedOrder === null
                        ? "bg-gray-500 cursor-not-allowed"
                        : "bg-green-600 hover:bg-green-700"
                    }`}
                  >
                    <Save className="w-5 h-5" />
                    {loading ? "جاري الحفظ..." : "حفظ"}
                  </button>
                  <button
                    onClick={() => {
                      setEditingId(null);
                      setSelectedOrder(null);
                      setFile(null);
                    }}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg"
                  >
                    إلغاء
                  </button>
                </div>
              </div>
            ) : (
              /* عرض القسم العادي */
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {section.imageUrl && (
                    <img
                      src={section.imageUrl}
                      alt={section.title}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                  )}
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      {section.title}
                      {section.order && (
                        <span className="ml-2 text-xs bg-amber-600 text-white px-2 py-1 rounded-full">
                          #{section.order}
                        </span>
                      )}
                    </h3>
                    <p className="text-gray-400 text-sm">{section.description}</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => handleEdit(section)}
                    className="flex items-center gap-1 text-blue-400 hover:text-blue-500"
                  >
                    <Edit className="w-5 h-5" /> تعديل
                  </button>
                  <button
                    onClick={() => handleDelete(section.id)}
                    className="flex items-center gap-1 text-red-400 hover:text-red-500"
                  >
                    <Trash2 className="w-5 h-5" /> حذف
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}