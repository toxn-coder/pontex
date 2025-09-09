'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import Image from 'next/image';

interface Product {
  name: string;
  price: string;
  image: string;
  description: string;
  rating: number;
  oldProduct?: Product;
}

interface EditProductDialogProps {
  product: Product;
  onClose: () => void;
  onSave: (product: Product, oldProduct?: Product) => void;
}

export default function EditProductDialog({ product, onClose, onSave }: EditProductDialogProps) {
  const [form, setForm] = useState<Product>({ ...product });
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formDataImage = new FormData();
    formDataImage.append('file', file);
    formDataImage.append('upload_preset', 'shawarma');
    setUploading(true);

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
      setForm({ ...form, image: res.secure_url });
      setUploading(false);
    };

    xhr.onerror = () => {
      setUploading(false);
      console.error('فشل في رفع الصورة');
    };

    xhr.send(formDataImage);
  };

  const handleDeleteImage = () => setForm({ ...form, image: '' });

  return (
    <div className="fixed inset-0 backdrop-blur-xl flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="bg-gray-800 rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
      >
        <h3 className="text-lg font-semibold text-white mb-4">تعديل المنتج</h3>
        <div className="grid gap-4 ">
          <input
            name="name"
            placeholder="اسم المنتج"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white"
          />
          <input
            name="price"
            placeholder="السعر"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
            className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white"
          />
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white file:text-white file:bg-gray-600 file:border-none file:rounded-lg file:px-4 file:py-1"
          />
          {uploading && (
            <div className="w-full bg-gray-600 rounded-full h-2">
              <div className="bg-amber-500 h-2 rounded-full" style={{ width: `${progress}%` }} />
            </div>
          )}
          {form.image && (
            <div className="mt-2 relative">
              <Image
                src={form.image}
                alt="معاينة الصورة"
                width={384}
                height={192}
                className="w-full h-48 object-cover rounded-lg border border-gray-600"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleDeleteImage}
                className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full"
              >
                <X className="w-4 h-4" />
              </motion.button>
            </div>
          )}
          <textarea
            name="description"
            placeholder="الوصف"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white"
          />
          <select
            name="rating"
            value={form.rating}
            onChange={(e) => setForm({ ...form, rating: parseFloat(e.target.value) })}
            className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white"
          >
            {Array.from({ length: 9 }, (_, i) => (4.1 + i * 0.1).toFixed(1)).map((rate) => (
              <option key={rate} value={rate}>
                {rate} ⭐
              </option>
            ))}
          </select>
          <div className="flex justify-end gap-4 mt-4">
            <motion.button
              onClick={onClose}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg"
            >
              إلغاء
            </motion.button>
            <motion.button
              onClick={() => onSave(form, product.oldProduct)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-amber-600 text-white px-4 py-2 rounded-lg"
            >
              حفظ التعديلات
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
