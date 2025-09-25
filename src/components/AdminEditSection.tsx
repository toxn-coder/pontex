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
import { Trash2, Save, Edit } from "lucide-react";

export default function AdminEditSection() {
  const [sections, setSections] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    imageUrl: "",
    title: "",
    description: "",
  });
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  // 📌 جلب الأقسام من Firestore
  const fetchSections = async () => {
    try {
      const snapshot = await getDocs(collection(db, "production"));
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setSections(data);
    } catch (err) {
      console.error("Error fetching sections:", err);
      toast.error("فشل في جلب الأقسام");
    }
  };

  useEffect(() => {
    fetchSections();
  }, []);

  // 📸 رفع صورة جديدة إلى Cloudinary
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
      {
        method: "POST",
        body: data,
      }
    );

    const result = await res.json();
    return result.secure_url as string;
  };

  // ✏️ تعديل البيانات
  const handleEdit = (section: any) => {
    setEditingId(section.id);
    setFormData({
      imageUrl: section.imageUrl,
      title: section.title,
      description: section.description,
    });
    setFile(null);
  };

  // ✅ حفظ التعديلات
  const handleSave = async () => {
    if (!editingId) return;
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
        updatedAt: new Date(),
      });

      toast.success("✅ تم تحديث القسم بنجاح");
      setEditingId(null);
      setFormData({ imageUrl: "", title: "", description: "" });
      setFile(null);
      fetchSections();
    } catch (err) {
      console.error("Error updating section:", err);
      toast.error("❌ فشل في تحديث القسم");
    } finally {
      setLoading(false);
    }
  };

  // 🗑️ حذف القسم
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
      <h2 className="text-2xl font-bold text-white mb-6">📝 تعديل لأنتاج</h2>

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
                    className="w-full"
                  />
                  {file ? (
                    <p className="text-green-400 mt-1 text-sm">
                      ✅ {file.name} تم اختياره
                    </p>
                  ) : (
                    <img
                      src={formData.imageUrl}
                      alt="preview"
                      className="mt-2 w-32 rounded-lg shadow"
                    />
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
                    className="w-full rounded-lg p-2 bg-gray-700 text-white"
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
                    className="w-full rounded-lg p-2 bg-gray-700 text-white"
                    rows={3}
                  />
                </div>

                {/* أزرار */}
                <div className="flex gap-3">
                  <button
                    onClick={handleSave}
                    disabled={loading}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
                  >
                    <Save className="w-5 h-5" />
                    {loading ? "جاري الحفظ..." : "حفظ"}
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg"
                  >
                    إلغاء
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    {section.title}
                  </h3>
                  <p className="text-gray-400 text-sm">{section.description}</p>
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
