'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { toast } from 'sonner';
import { Product } from '@/types/product';

interface EditProductDialogProps {
  product: Product;
  onClose: () => void;
  onSave: (updatedProduct: Product) => void; // إرجاع المنتج للأب للتحديث
}

export default function EditProductDialog({ product, onClose, onSave }: EditProductDialogProps) {
  const [form, setForm] = useState<Product>({ ...product });
  const [uploadingMain, setUploadingMain] = useState(false);
  const [uploadingAdditional, setUploadingAdditional] = useState(false);
  const [progressMain, setProgressMain] = useState(0);
  const [progressAdditional, setProgressAdditional] = useState(0);

  const uploadImage = async (
    file: File,
    onProgress: (percent: number) => void,
    onSuccess: (url: string) => void,
    onError: () => void
  ) => {
    const formDataImage = new FormData();
    formDataImage.append('file', file);
    formDataImage.append('upload_preset', 'shawarma');

    try {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', 'https://api.cloudinary.com/v1_1/do88eynar/image/upload');

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percent = Math.round((e.loaded * 100) / e.total);
          onProgress(percent);
        }
      });

      xhr.onload = () => {
        const res = JSON.parse(xhr.responseText);
        onSuccess(res.secure_url);
        toast.success('تم رفع الصورة بنجاح');
      };

      xhr.onerror = () => {
        onError();
        toast.error('فشل في رفع الصورة');
      };

      xhr.send(formDataImage);
    } catch {
      onError();
      toast.error('حدث خطأ غير متوقع');
    }
  };

  const handleMainImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingMain(true);
    setProgressMain(0);

    await uploadImage(
      file,
      setProgressMain,
      (url) => {
        setForm((prev) => ({ ...prev, image: url }));
        setUploadingMain(false);
      },
      () => setUploadingMain(false)
    );
  };

  const handleAdditionalImagesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingAdditional(true);
    setProgressAdditional(0);

    const uploadedUrls: string[] = [];
    let loaded = 0;
    const total = files.length;

    const updateProgress = () => {
      const percent = Math.round((loaded / total) * 100);
      setProgressAdditional(percent);
    };

    const onSuccess = (url: string) => {
      uploadedUrls.push(url);
      loaded++;
      updateProgress();
      if (loaded === total) {
        setForm((prev) => ({
          ...prev,
          additionalImages: [...prev.additionalImages, ...uploadedUrls],
        }));
        setUploadingAdditional(false);
        toast.success(`تم رفع ${uploadedUrls.length} صور إضافية بنجاح`);
      }
    };

    const onError = () => {
      loaded++;
      updateProgress();
      if (loaded === total) setUploadingAdditional(false);
    };

    for (let i = 0; i < files.length; i++) {
      await uploadImage(files[i], () => {}, onSuccess, onError);
    }
  };

  const removeMainImage = () => {
    setForm((prev) => ({ ...prev, image: '' }));
    toast.info('تم حذف الصورة الرئيسية');
  };

  const removeAdditionalImage = (index: number) => {
    setForm((prev) => ({
      ...prev,
      additionalImages: prev.additionalImages.filter((_, i) => i !== index),
    }));
    toast.info('تم حذف الصورة الإضافية');
  };

  const handleSave = () => {
    if (!form.image) {
      toast.error('يجب أن يكون للمنتج صورة رئيسية');
      return;
    }
    onSave(form); // إرجاع المنتج المعدل للأب
    onClose();
  };

  return (
    <div className="fixed inset-0 backdrop-blur-xl flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="bg-gray-800 rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-white">تعديل المنتج</h3>
          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </motion.button>
        </div>

        <div className="grid gap-6">
          {/* باقي الحقول كما هي... (اسم، سعر، صور، وصف، تقييم) */}
          <input name="name" placeholder="اسم المنتج" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-amber-500 placeholder-gray-400" />
          <input name="price" placeholder="السعر" value={0} onChange={(e) => setForm({ ...form, price: e.target.value })} className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-amber-500 placeholder-gray-400" />
          <input name="width" placeholder="العرض" value={form.width} onChange={(e) => setForm({ ...form, width: e.target.value })} className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-amber-500 placeholder-gray-400" />
          <input name="height" placeholder="الطول" value={form.height} onChange={(e) => setForm({ ...form, height: e.target.value })} className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-amber-500 placeholder-gray-400" />
          <input name="weight" placeholder="الوزن" value={form.weight} onChange={(e) => setForm({ ...form, weight: e.target.value })} className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-amber-500 placeholder-gray-400" />

          {/* الصورة الرئيسية */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-300">الصورة الرئيسية (إلزامية)</label>
            <input type="file" accept="image/*" onChange={handleMainImageUpload} className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white file:text-white file:bg-gray-600 file:border-none file:rounded-lg file:px-4 file:py-1" />
            {uploadingMain && <div className="w-full bg-gray-600 rounded-full h-2"><div className="bg-amber-500 h-2 rounded-full transition-all" style={{ width: `${progressMain}%` }} /></div>}
            {form.image && (
              <div className="relative group">
                <Image src={form.image} alt="الصورة الرئيسية" width={384} height={192} className="w-full h-48 object-cover rounded-lg border border-gray-600" />
                <span className="absolute top-2 left-2 bg-amber-600 text-white text-xs px-2 py-1 rounded">رئيسية</span>
                <button onClick={removeMainImage} className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* الصور الإضافية */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-300">صور إضافية (اختيارية - متعددة)</label>
            <input type="file" accept="image/*" multiple onChange={handleAdditionalImagesUpload} className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white file:text-white file:bg-gray-600 file:border-none file:rounded-lg file:px-4 file:py-1" />
            {uploadingAdditional && <div className="w-full bg-gray-600 rounded-full h-2"><div className="bg-amber-500 h-2 rounded-full transition-all" style={{ width: `${progressAdditional}%` }} /></div>}
            {form.additionalImages.length > 0 && (
              <div className="grid grid-cols-3 gap-3">
                {form.additionalImages.map((url, index) => (
                  <div key={index} className="relative group">
                    <Image src={url} alt={`إضافية ${index + 1}`} width={120} height={120} className="object-cover rounded-lg border border-gray-600 w-full h-32" />
                    <button onClick={() => removeAdditionalImage(index)} className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <textarea name="description" placeholder="الوصف" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={4} className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-amber-500 placeholder-gray-400 resize-none" />
          <select name="rating" value={form.rating} onChange={(e) => setForm({ ...form, rating: parseFloat(e.target.value) })} className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-amber-500">
            {Array.from({ length: 10 }, (_, i) => (4.0 + i * 0.1).toFixed(1)).map((rate) => (
              <option key={rate} value={rate}>{rate} ⭐</option>
            ))}
          </select>

          <div className="flex justify-end gap-4 mt-6">
            <motion.button onClick={onClose} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700">إلغاء</motion.button>
            <motion.button onClick={handleSave} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 disabled:opacity-50" disabled={uploadingMain || uploadingAdditional}>
              {uploadingMain || uploadingAdditional ? 'جاري الرفع...' : 'حفظ التعديلات'}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}