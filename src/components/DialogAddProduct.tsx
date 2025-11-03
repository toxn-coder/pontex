'use client';

import { db } from '@/app/api/firebase';
import { arrayUnion, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { motion } from 'framer-motion';
import { Plus, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import { Product } from '@/types/product'; // استيراد الـ interface المشترك

interface DialogAddProductProps {
  sectionId: string;
}

export default function DialogAddProduct({ sectionId }: DialogAddProductProps) {
  const [open, setOpen] = useState(false);
  const [uploadingMain, setUploadingMain] = useState(false);
  const [uploadingAdditional, setUploadingAdditional] = useState(false);
  const [progressMain, setProgressMain] = useState(0);
  const [progressAdditional, setProgressAdditional] = useState(0);

  const [formData, setFormData] = useState<Omit<Product, 'id'>>({
    name: '',
    price: '',
    width: '',
    height: '',
    weight: '',
    image: '',
    additionalImages: [],
    description: '',
    rating: 4.9,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: name === 'rating' ? parseFloat(value) : value });
  };

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
        setFormData((prev) => ({ ...prev, image: url }));
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
        setFormData((prev) => ({
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

  const removeAdditionalImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      additionalImages: prev.additionalImages.filter((_, i) => i !== index),
    }));
    toast.info('تم حذف الصورة الإضافية');
  };

  const handleAddProduct = async () => {
    if (!formData.image) {
      toast.error('يجب إضافة صورة رئيسية للمنتج');
      return;
    }

    try {
      const productWithId: Product = {
        ...formData,
        id: uuidv4(),
      };

      const ref = doc(db, 'Parts', sectionId);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        await updateDoc(ref, {
          products: arrayUnion(productWithId),
        });
      } else {
        await setDoc(ref, {
          products: [productWithId],
        });
      }

      toast.success('تمت إضافة المنتج بنجاح');
      setFormData({
        name: '',
        price: '',
        width: '',
        height: '',
        weight: '',
        image: '',
        additionalImages: [],
        description: '',
        rating: 4.9,
      });
      setOpen(false);
      setProgressMain(0);
      setProgressAdditional(0);
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'حدث خطأ أثناء إضافة المنتج');
    }
  };

  return (
    <div className="bg-gray-800 rounded-2xl shadow-xl p-6">
      <h2 className="text-2xl font-bold text-white mb-4">إضافة منتج جديد</h2>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
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
              className="bg-gray-800 rounded-lg w-full max-w-md max-h-[90vh] flex flex-col"
            >
              <div className="p-6 border-b border-gray-700">
                <h3 className="text-lg font-semibold text-white">إضافة منتج جديد</h3>
                <p className="text-gray-300 text-sm">املأ بيانات المنتج ليتم إضافته إلى القسم.</p>
              </div>

              <div className="p-6 overflow-y-auto flex-1">
                <div className="grid gap-6">
                  <input name="name" placeholder="اسم المنتج" value={formData.name} onChange={handleChange} className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-amber-500 placeholder-gray-400" />
                  <input name="price" placeholder="السعر" value={0} onChange={handleChange} className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-amber-500 placeholder-gray-400" />
                  <input name="width" placeholder="العرض" value={formData.width} onChange={handleChange} className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-amber-500 placeholder-gray-400" />
                  <input name="height" placeholder="الطول" value={formData.height} onChange={handleChange} className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-amber-500 placeholder-gray-400" />
                  <input name="weight" placeholder="الوزن" value={formData.weight} onChange={handleChange} className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-amber-500 placeholder-gray-400" />

                  {/* الصورة الرئيسية */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-gray-300">الصورة الرئيسية (إلزامية)</label>
                    <input type="file" accept="image/*" onChange={handleMainImageUpload} className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white file:text-white file:bg-gray-600 file:border-none file:rounded-lg file:px-4 file:py-1" />
                    {uploadingMain && <div className="w-full bg-gray-600 rounded-full h-2"><div className="bg-amber-500 h-2 rounded-full transition-all" style={{ width: `${progressMain}%` }} /></div>}
                    {formData.image && (
                      <div className="relative">
                        <Image src={formData.image} alt="الصورة الرئيسية" width={384} height={192} className="object-cover rounded-lg border border-gray-600 w-full" />
                        <span className="absolute top-2 left-2 bg-amber-600 text-white text-xs px-2 py-1 rounded">رئيسية</span>
                      </div>
                    )}
                  </div>

                  {/* الصور الإضافية */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-gray-300">صور إضافية (اختيارية - متعددة)</label>
                    <input type="file" accept="image/*" multiple onChange={handleAdditionalImagesUpload} className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white file:text-white file:bg-gray-600 file:border-none file:rounded-lg file:px-4 file:py-1" />
                    {uploadingAdditional && <div className="w-full bg-gray-600 rounded-full h-2"><div className="bg-amber-500 h-2 rounded-full transition-all" style={{ width: `${progressAdditional}%` }} /></div>}
                    {formData.additionalImages.length > 0 && (
                      <div className="grid grid-cols-3 gap-3 mt-3">
                        {formData.additionalImages.map((url, index) => (
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

                  <textarea name="description" placeholder="الوصف" value={formData.description} onChange={handleChange} rows={4} className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-amber-500 placeholder-gray-400 resize-none" />
                  <select name="rating" value={formData.rating} onChange={handleChange} className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-amber-500">
                    {Array.from({ length: 10 }, (_, i) => (4.0 + i * 0.1).toFixed(1)).map((rate) => (
                      <option key={rate} value={rate}>{rate} ⭐</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="p-6 border-t border-gray-700 flex justify-end gap-4">
                <motion.button onClick={() => setOpen(false)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700">إلغاء</motion.button>
                <motion.button onClick={handleAddProduct} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 disabled:opacity-50" disabled={uploadingMain || uploadingAdditional}>
                  {uploadingMain || uploadingAdditional ? 'جاري الرفع...' : 'إضافة'}
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </motion.div>
    </div>
  );
}