'use client';

import { useState } from 'react';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '@/app/api/firebase';
import { Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function DialogAddProduct({ sectionId }) {
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const [formData, setFormData] = useState({
    name: '',
    price: '',
    image: '',
    description: '',
    rating: 4.9,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: name === 'rating' ? parseFloat(value) : value });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formDataImage = new FormData();
    formDataImage.append('file', file);
    formDataImage.append('upload_preset', 'shawarma');
    setUploading(true);

    try {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', 'https://api.cloudinary.com/v1_1/do88eynar/image/upload');

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percent = Math.round((e.loaded * 100) / e.total);
          setProgress(percent);
        }
      });

      xhr.onload = () => {
        const res = JSON.parse(xhr.responseText);
        setFormData((prev) => ({ ...prev, image: res.secure_url }));
        setUploading(false);
        toast.success('تم رفع الصورة بنجاح');
      };

      xhr.onerror = () => {
        setUploading(false);
        toast.error('فشل في رفع الصورة');
      };

      xhr.send(formDataImage);
    } catch (error) {
      toast.error('حدث خطأ غير متوقع');
      setUploading(false);
    }
  };

  const handleAddProduct = async () => {
    if (!formData.image) {
      toast.error('❗ يرجى رفع صورة أولًا');
      return;
    }

    const ref = doc(db, 'menuParts', sectionId);
    await updateDoc(ref, {
      products: arrayUnion(formData),
    });

    toast.success('تمت إضافة المنتج بنجاح');
    setFormData({ name: '', price: '', image: '', description: '', rating: 4.8 });
    setOpen(false);
    setProgress(0);
  };

  return (
    <div className="bg-gray-800 rounded-2xl shadow-xl p-6">
      <h2 className="text-2xl font-bold text-white mb-4">إضافة منتج جديد</h2>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.button
          onClick={() => setOpen(true)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-full bg-amber-600 text-white px-6 py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-amber-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          إضافة منتج
        </motion.button>

        {open && (
          <div className="fixed inset-0 backdrop-blur-md bg-black/30 bg-opacity-50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="bg-gray-800 rounded-lg p-6 w-full max-w-md"
            >
              <h3 className="text-lg font-semibold text-white mb-2">إضافة منتج جديد</h3>
              <p className="text-gray-300 mb-4">املأ بيانات المنتج ليتم إضافته إلى القسم.</p>

              <div className="grid gap-4">
                <input
                  name="name"
                  placeholder="اسم المنتج"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-amber-500 placeholder-gray-400"
                />
                <input
                  name="price"
                  placeholder="السعر"
                  value={formData.price}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-amber-500 placeholder-gray-400"
                />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white file:text-white file:bg-gray-600 file:border-none file:rounded-lg file:px-4 file:py-1"
                />
                {uploading && (
                  <div className="w-full bg-gray-600 rounded-full h-2">
                    <div
                      className="bg-amber-500 h-2 rounded-full"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                )}

                {formData.image && (
                  <div className="mt-2">
                    <img
                      src={formData.image}
                      alt="معاينة الصورة"
                      className="w-full h-48 object-cover rounded-lg border border-gray-600"
                    />
                  </div>
                )}

                <textarea
                  name="description"
                  placeholder="الوصف"
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-amber-500 placeholder-gray-400"
                />
                <select
                  name="rating"
                  value={formData.rating}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  {Array.from({ length: 9 }, (_, i) => (4.1 + i * 0.1).toFixed(1)).map((rate) => (
                    <option key={rate} value={rate}>
                      {rate} ⭐
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-4 mt-6">
                <motion.button
                  onClick={() => setOpen(false)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
                >
                  إلغاء
                </motion.button>
                <motion.button
                  onClick={handleAddProduct}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700"
                >
                  إضافة
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </motion.div>
    </div>
  );
}