'use client';

import { useEffect, useState } from 'react';
import { doc, updateDoc, arrayRemove, arrayUnion, onSnapshot } from 'firebase/firestore';
import { db } from '@/app/api/firebase';
import { Pencil, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

interface Product {
  name: string;
  price: string;
  image: string;
  description: string;
  rating: number;
}

interface ProductListProps {
  sectionId: string;
}

export default function ProductList({ sectionId }: ProductListProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product & { oldProduct?: Product } | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentUserRole, setCurrentUserRole] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userResponse = await fetch('/api/get-user-data');
        const userData = await userResponse.json();
        if (userData.error) {
          throw new Error(userData.error);
        }
        setCurrentUserRole(userData.userRole || '');
      } catch (error) {
        console.error('فشل في جلب بيانات المستخدم:', error);
      }
    };

    fetchUserData();

    const unsubscribe = onSnapshot(
      doc(db, 'menuParts', sectionId),
      (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          setProducts(data.products || []);
          setLoading(false);
        }
      },
      (error) => {
        console.error('فشل في جلب المنتجات:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [sectionId]);

  const handleDelete = async (product: Product) => {
    setLoading(true);
    try {
      const ref = doc(db, 'menuParts', sectionId);
      await updateDoc(ref, {
        products: arrayRemove(product),
      });
    } catch (error) {
      console.error('فشل في حذف المنتج:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product: Product) => {
    setSelectedProduct({ ...product, oldProduct: product });
    setEditDialogOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
        if (selectedProduct) {
          setSelectedProduct({ ...selectedProduct, image: res.secure_url });
        }
        setUploading(false);
      };

      xhr.onerror = () => {
        setUploading(false);
        console.error('فشل في رفع الصورة');
      };

      xhr.send(formDataImage);
    } catch (error) {
      console.error('حدث خطأ أثناء رفع الصورة:', error);
      setUploading(false);
    }
  };

  const handleUpdate = async () => {
    if (!selectedProduct) return;
    setLoading(true);

    try {
      const ref = doc(db, 'menuParts', sectionId);

      await updateDoc(ref, {
        products: arrayRemove(selectedProduct.oldProduct),
      });

      await updateDoc(ref, {
        products: arrayUnion({
          name: selectedProduct.name,
          price: selectedProduct.price,
          image: selectedProduct.image,
          description: selectedProduct.description,
          rating: selectedProduct.rating,
        }),
      });

      setEditDialogOpen(false);
      setSelectedProduct(null);
    } catch (error) {
      console.error('فشل في تحديث المنتج:', error);
    } finally {
      setLoading(false);
    }
  };

  // دالة لاختيار الصورة مع صورة افتراضية
  const getImageSrc = (image: string) => {
    return image && image.trim() !== '' ? image : '/placeholder.svg';
  };

  return (
    <div className="bg-gray-800 rounded-2xl shadow-xl p-6 mt-8">
      <h2 className="text-2xl font-bold text-white mb-4">قائمة المنتجات</h2>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {loading ? (
          <div className="text-white text-center py-12">جاري تحميل المنتجات...</div>
        ) : products.length === 0 ? (
          <p className="text-center text-gray-300 text-lg py-12">لا توجد منتجات مضافة بعد.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {products.map((product: Product, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: idx * 0.1 }}
                  className="bg-gray-700 rounded-lg shadow p-4 flex flex-col justify-between"
                >
                  <Image
                    src={getImageSrc(product.image)}
                    alt={product.name}
                    width={384}
                    height={192}
                    className="h-48 w-full object-cover rounded-md mb-4"
                  />
                  <h3 className="text-xl font-bold text-white">{product.name}</h3>
                  <p className="text-sm text-gray-300 mb-2">{product.description}</p>
                  <p className="text-sm text-gray-300">⭐ {product.rating} | {product.price} جنيه</p>
                  <div className="flex justify-end gap-2 mt-4">
                    {currentUserRole === 'admin' && (
                      <>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleEdit(product)}
                          className="bg-green-600 text-white px-3 py-2 rounded-full text-sm font-medium shadow hover:bg-green-700 transition-colors"
                        >
                          <Pencil className="w-4 h-4" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleDelete(product)}
                          className="bg-red-600 text-white px-3 py-2 rounded-full text-sm font-medium shadow hover:bg-red-700 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </motion.button>
                      </>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Dialog تعديل المنتج */}
        {editDialogOpen && currentUserRole === 'admin' && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="bg-gray-800 rounded-lg p-6 w-full max-w-md"
            >
              <h3 className="text-lg font-semibold text-white mb-4">تعديل المنتج</h3>
              {selectedProduct && (
                <div className="grid gap-4">
                  <input
                    name="name"
                    placeholder="اسم المنتج"
                    value={selectedProduct.name}
                    onChange={(e) =>
                      setSelectedProduct({ ...selectedProduct, name: e.target.value })
                    }
                    className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-amber-500 placeholder-gray-400"
                  />
                  <input
                    name="price"
                    placeholder="السعر"
                    value={selectedProduct.price}
                    onChange={(e) =>
                      setSelectedProduct({ ...selectedProduct, price: e.target.value })
                    }
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
                  {selectedProduct.image && (
                    <div className="mt-2">
                      <Image
                        src={getImageSrc(selectedProduct.image)}
                        alt="معاينة الصورة"
                        width={384}
                        height={192}
                        className="w-full h-48 object-cover rounded-lg border border-gray-600"
                      />
                    </div>
                  )}
                  <textarea
                    name="description"
                    placeholder="الوصف"
                    value={selectedProduct.description}
                    onChange={(e) =>
                      setSelectedProduct({ ...selectedProduct, description: e.target.value })
                    }
                    className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-amber-500 placeholder-gray-400"
                  />
                  <select
                    name="rating"
                    value={selectedProduct.rating}
                    onChange={(e) =>
                      setSelectedProduct({
                        ...selectedProduct,
                        rating: parseFloat(e.target.value),
                      })
                    }
                    className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    {Array.from({ length: 9 }, (_, i) => (4.1 + i * 0.1).toFixed(1)).map((rate) => (
                      <option key={rate} value={rate}>
                        {rate} ⭐
                      </option>
                    ))}
                  </select>
                  <div className="flex justify-end gap-4 mt-4">
                    <motion.button
                      onClick={() => setEditDialogOpen(false)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
                    >
                      إلغاء
                    </motion.button>
                    <motion.button
                      onClick={handleUpdate}
                      disabled={loading}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition-colors ${
                        loading ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      {loading ? 'جاري الحفظ...' : 'حفظ التعديلات'}
                    </motion.button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </motion.div>
    </div>
  );
}