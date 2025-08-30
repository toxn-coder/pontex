'use client';

import { useEffect, useState } from 'react';
import { db } from '@/app/api/firebase';
import { collection, getDocs, doc, setDoc, getDoc } from 'firebase/firestore';
import { motion } from 'framer-motion';
import { PlusCircle, Trash2 } from 'lucide-react';

export default function BestSellersManager() {
  const [allProducts, setAllProducts] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [currentUserRole, setCurrentUserRole] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // جلب بيانات المستخدم الحالي وجميع المنتجات
  useEffect(() => {
    const fetchData = async () => {
      try {
        // جلب بيانات المستخدم الحالي
        const userResponse = await fetch('/api/get-user-data');
        const userData = await userResponse.json();
        if (userData.error) {
          throw new Error(userData.error);
        }
        setCurrentUserRole(userData.userRole || '');

        // جلب جميع الأقسام من menuParts
        const menuPartsCollection = collection(db, 'Parts');
        const menuPartsSnapshot = await getDocs(menuPartsCollection);
        const productsList = [];

        // استخراج المنتجات من كل قسم، باستثناء وثيقة "الأكثر مبيعًا"
        menuPartsSnapshot.forEach((doc) => {
          if (doc.id === 'الأكثر مبيعًا') return; // تجاهل وثيقة "الأكثر مبيعًا"

          const sectionData = doc.data();
          if (sectionData.products && Array.isArray(sectionData.products)) {
            productsList.push(
              ...sectionData.products.map((product) => ({
                ...product,
                sectionId: doc.id, // إضافة معرف القسم لتحديد مصدر المنتج
              }))
            );
          }
        });
        setAllProducts(productsList);

        // جلب المنتجات الأكثر مبيعًا من وثيقة "الأكثر مبيعًا" في menuParts
        const bestSellersDocRef = doc(db, 'Parts', 'الأكثر مبيعًا');
        const bestSellersDoc = await getDoc(bestSellersDocRef);
        if (bestSellersDoc.exists()) {
          const data = bestSellersDoc.data();
          setBestSellers(data.products || []);
        } else {
          // إذا لم تكن الوثيقة موجودة، ننشئها فارغة
          await setDoc(bestSellersDocRef, { products: [] });
          setBestSellers([]);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('فشل في جلب البيانات');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // إضافة منتج إلى الأكثر مبيعًا
  const handleAddToBestSellers = async (product) => {
    setError('');
    setSuccess('');
    try {
      // التحقق من أن المنتج ليس موجودًا بالفعل في الأكثر مبيعًا
      const isAlreadyBestSeller = bestSellers.some(
        (item) => item.name === product.name && item.sectionId === product.sectionId
      );
      if (isAlreadyBestSeller) {
        setError('هذا المنتج موجود بالفعل في قائمة الأكثر مبيعًا');
        return;
      }

      // إضافة المنتج إلى الأكثر مبيعًا
      const updatedBestSellers = [...bestSellers, product];
      const bestSellersDocRef = doc(db, 'Parts', 'الأكثر مبيعًا');
      await setDoc(bestSellersDocRef, { products: updatedBestSellers }, { merge: true });

      setBestSellers(updatedBestSellers);
      setSuccess('تم إضافة المنتج إلى الأكثر مبيعًا بنجاح');
    } catch (err) {
      console.error('Error adding to best sellers:', err);
      setError('فشل في إضافة المنتج إلى الأكثر مبيعًا');
    }
  };

  // إزالة منتج من الأكثر مبيعًا
  const handleRemoveFromBestSellers = async (productToRemove) => {
    setError('');
    setSuccess('');
    try {
      // تصفية المنتجات لإزالة المنتج المحدد
      const updatedBestSellers = bestSellers.filter(
        (item) => !(item.name === productToRemove.name && item.sectionId === productToRemove.sectionId)
      );
      const bestSellersDocRef = doc(db, 'Parts', 'الأكثر مبيعًا');
      await setDoc(bestSellersDocRef, { products: updatedBestSellers }, { merge: true });

      setBestSellers(updatedBestSellers);
      setSuccess('تم إزالة المنتج من الأكثر مبيعًا بنجاح');
    } catch (err) {
      console.error('Error removing from best sellers:', err);
      setError('فشل في إزالة المنتج من الأكثر مبيعًا');
    }
  };

  // إذا لم يكن المستخدم مديرًا، لا يتم عرض خيارات الإضافة أو الإزالة
  const canEdit = currentUserRole === 'admin';

  return (
    <div className="bg-gray-800 rounded-2xl shadow-xl p-6">
      <h2 className="text-2xl font-bold text-white mb-4">إدارة الأكثر مبيعًا</h2>

      {/* قسم المنتجات المتاحة */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <h3 className="text-xl font-semibold text-white mb-4">جميع المنتجات</h3>
        {loading ? (
          <p className="text-gray-300">جارٍ تحميل المنتجات...</p>
        ) : allProducts.length === 0 ? (
          <p className="text-gray-300">لا توجد منتجات متاحة</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {allProducts.map((product, idx) => (
              <motion.div
                key={`${product.sectionId}-${product.name}-${idx}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="bg-gray-700 p-4 rounded-lg flex justify-between items-center"
              >
                <div className="flex items-center gap-4">
                  {product.image && (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                  )}
                  <div>
                    <h4 className="text-white font-semibold">{product.name}</h4>
                    <p className="text-gray-300">{product.price} ريال</p>
                  </div>
                </div>
                {canEdit && (
                  <motion.button
                    onClick={() => handleAddToBestSellers(product)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="text-green-500 hover:text-green-700"
                  >
                    <PlusCircle className="w-6 h-6" />
                  </motion.button>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* قسم الأكثر مبيعًا */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <h3 className="text-xl font-semibold text-white mb-4">المنتجات الأكثر مبيعًا</h3>
        {bestSellers.length === 0 ? (
          <p className="text-gray-300">لا توجد منتجات في قائمة الأكثر مبيعًا</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {bestSellers.map((product, idx) => (
              <motion.div
                key={`${product.sectionId}-${product.name}-${idx}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="bg-gray-700 p-4 rounded-lg flex justify-between items-center"
              >
                <div className="flex items-center gap-4">
                  {product.image && (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                  )}
                  <div>
                    <h4 className="text-white font-semibold">{product.name}</h4>
                    <p className="text-gray-300">{product.price} ريال</p>
                  </div>
                </div>
                {canEdit && (
                  <motion.button
                    onClick={() => handleRemoveFromBestSellers(product)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-6 h-6" />
                  </motion.button>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* رسائل الخطأ والنجاح */}
      {error && <p className="text-red-500 mt-4">{error}</p>}
      {success && <p className="text-green-500 mt-4">{success}</p>}
    </div>
  );
}