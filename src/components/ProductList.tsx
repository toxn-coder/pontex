'use client';

import { useEffect, useState } from 'react';
import { doc, getDoc, updateDoc, onSnapshot } from 'firebase/firestore';
import { db } from '@/app/api/firebase';
import { Pencil, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import EditProductDialog from './EditProductDialog';
import { Product } from '@/types/product';

interface ProductListProps {
  sectionId: string;
}

export default function ProductList({ sectionId }: ProductListProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentUserRole, setCurrentUserRole] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userResponse = await fetch('/api/get-user-data');
        const userData = await userResponse.json();
        if (userData.error) throw new Error(userData.error);
        setCurrentUserRole(userData.userRole || '');
      } catch (error) {
        console.error('فشل في جلب بيانات المستخدم:', error);
      }
    };

    fetchUserData();

    const unsubscribe = onSnapshot(
      doc(db, 'Parts', sectionId),
      (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          const fetchedProducts: Product[] = data.products || [];
          // التأكد من أن كل منتج له id فريد
          const uniqueProducts = fetchedProducts.map((p, index) => ({
            ...p,
            id: p.id || `fallback-${sectionId}-${index}`, // fallback إذا فقد id
          }));
          setProducts(uniqueProducts);
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

  const handleDelete = async (productToDelete: Product) => {
    const productId = productToDelete.id;
    if (!productId) {
      console.error('المنتج لا يحتوي على id');
      return;
    }

    setLoading(true);
    try {
      const ref = doc(db, 'Parts', sectionId);
      const snap = await getDoc(ref);
      if (!snap.exists()) return;

      const data = snap.data();
      const currentProducts: Product[] = data.products || [];

      const updatedProducts = currentProducts.filter(p => p.id !== productId);

      await updateDoc(ref, { products: updatedProducts });
      setProducts(updatedProducts); // تحديث محلي
    } catch (error) {
      console.error('فشل في حذف المنتج:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setEditDialogOpen(true);
  };

  const handleUpdate = async (updatedProduct: Product) => {
    const productId = updatedProduct.id;
    if (!productId) {
      console.error('المنتج المعدل لا يحتوي على id');
      return;
    }

    setLoading(true);
    try {
      const ref = doc(db, 'Parts', sectionId);
      const snap = await getDoc(ref);
      if (!snap.exists()) {
        console.error('القسم غير موجود');
        return;
      }

      const data = snap.data();
      const currentProducts: Product[] = data.products || [];

      const updatedProducts = currentProducts.map((p: Product) =>
        p.id === productId ? updatedProduct : p
      );

      await updateDoc(ref, { products: updatedProducts });

      setProducts(updatedProducts);
      setEditDialogOpen(false);
      setSelectedProduct(null);
    } catch (error) {
      console.error('فشل في تحديث المنتج:', error);
    } finally {
      setLoading(false);
    }
  };

  const getImageSrc = (image: string) => {
    return image && image.trim() !== '' ? image : '/placeholder.svg';
  };

  return (
    <div className="bg-gray-800 rounded-2xl shadow-xl p-6 mt-8" dir="rtl">
      <h2 className="text-2xl font-bold text-white mb-4">قائمة المنتجات</h2>

      {loading ? (
        <div className="text-white text-center py-12">جاري تحميل المنتجات...</div>
      ) : products.length === 0 ? (
        <p className="text-center text-gray-300 text-lg py-12">لا توجد منتجات مضافة بعد.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto max-h-[70vh] pr-2">
          <AnimatePresence>
            {products.map((product: Product) => (
              <motion.div
                key={product.id} // key فريد بناءً على id فقط
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
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
                {currentUserRole === 'admin' && (
                  <div className="flex justify-end gap-2 mt-4">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleEdit(product)}
                      className="bg-green-600 text-white px-3 py-2 rounded-full text-sm font-medium shadow hover:bg-green-700"
                    >
                      <Pencil className="w-4 h-4" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleDelete(product)}
                      className="bg-red-600 text-white px-3 py-2 rounded-full text-sm font-medium shadow hover:bg-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </motion.button>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {editDialogOpen && selectedProduct && (
        <EditProductDialog
          product={selectedProduct}
          onClose={() => {
            setEditDialogOpen(false);
            setSelectedProduct(null);
          }}
          onSave={handleUpdate}
        />
      )}
    </div>
  );
}