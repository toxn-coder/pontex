'use client';

import { useEffect, useState } from 'react';
import { db } from '@/app/api/firebase';
import { collection, deleteDoc, doc, setDoc, getDoc, onSnapshot, updateDoc } from 'firebase/firestore';
import { Loader2, Trash2, Edit2, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

// تعريف واجهة Part
interface Part {
  id: string;
  name?: string;
  isVisible?: boolean;
}

const PartsList = () => {
  const [parts, setParts] = useState<Part[]>([]); // تحديد النوع صراحة
  const [loading, setLoading] = useState(true);
  const [showConfirm, setShowConfirm] = useState<string | null>(null);
  const [showEditDialog, setShowEditDialog] = useState<string | null>(null);
  const [newPartName, setNewPartName] = useState('');
  const [error, setError] = useState('');
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

    // مراقبة التغييرات في مجموعة Parts في الوقت الحقيقي
    const unsubscribe = onSnapshot(
      collection(db, 'Parts'),
      (snapshot) => {
        const partData: Part[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          name: doc.data().name,
          isVisible: doc.data().isVisible !== false, // قيمة افتراضية true
        }));

        // فرز الأقسام بحيث يكون "الأكثر مبيعًا" في البداية
        const sortedData = partData.sort((a, b) => {
          if (a.id === 'الأكثر مبيعًا') return -1;
          if (b.id === 'الأكثر مبيعًا') return 1;
          return (a.name || a.id).localeCompare(b.name || b.id);
        });

        setParts(sortedData);
        setLoading(false);
      },
      (error) => {
        console.error('فشل في جلب الأقسام:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const handleDelete = async (partId: string) => {
    try {
      await deleteDoc(doc(db, 'Parts', partId));
      setShowConfirm(null);
    } catch (error) {
      console.error('فشل في حذف القسم:', error);
    }
  };

  const handleToggleVisibility = async (partId: string, currentVisibility?: boolean) => {
    try {
      const partRef = doc(db, 'Parts', partId);
      await updateDoc(partRef, {
        isVisible: !currentVisibility,
      });
    } catch (error) {
      console.error('فشل في تبديل حالة الإظهار:', error);
    }
  };

  const openEditDialog = (part: Part) => {
    setShowEditDialog(part.id);
    setNewPartName(part.name || part.id);
    setError('');
  };

  const handleEdit = async () => {
    if (!newPartName || newPartName.trim() === '') {
      setError('الاسم لا يمكن أن يكون فارغًا');
      return;
    }

    if (newPartName === showEditDialog) {
      setShowEditDialog(null);
      return;
    }

    try {
      const oldDocRef = doc(db, 'Parts', showEditDialog!);
      const oldDocSnap = await getDoc(oldDocRef);
      if (!oldDocSnap.exists()) {
        throw new Error('القسم غير موجود');
      }

      const oldData = oldDocSnap.data();
      const updatedData = {
        ...oldData,
        name: newPartName,
      };

      const newDocRef = doc(db, 'Parts', newPartName);
      await setDoc(newDocRef, updatedData);
      await deleteDoc(oldDocRef);

      setShowEditDialog(null);
      setNewPartName('');
    } catch (error) {
      console.error('فشل في تعديل القسم:', error);
      setError('فشل في تعديل القسم. حاول مرة أخرى.');
    }
  };

  return (
    <div className="bg-gray-800 rounded-2xl shadow-xl p-6" dir="rtl">
      <h2 className="text-2xl font-bold text-white mb-4">قائمة الأقسام</h2>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="animate-spin w-10 h-10 text-amber-500" aria-label="جارٍ التحميل" />
        </div>
      ) : parts.length === 0 ? (
        <p className="text-center text-gray-300 text-lg py-12" role="alert">
          لا توجد أقسام مضافة بعد.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {parts.map((part, index) => (
              <motion.div
                key={part.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <div className="relative bg-gray-700 shadow-lg rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
                  <div className="p-6 text-center">
                    <p className="text-xl font-semibold text-white mb-4">{part.name || part.id}</p>
                    <div className="flex justify-center gap-3">
                      <Link href={`/auth/dashboard/${part.id}`}>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="bg-amber-600 text-white px-5 py-2 rounded-full text-sm font-medium shadow hover:bg-amber-700 transition-colors duration-200"
                          aria-label={`عرض قسم ${part.name || part.id}`}
                        >
                          عرض القسم
                        </motion.button>
                      </Link>
                    {currentUserRole === 'admin' && (
  <>
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => handleToggleVisibility(part.id, part.isVisible)}
      className={`${
        part.isVisible ? 'bg-yellow-600' : 'bg-gray-600'
      } text-white px-3 py-2 rounded-full text-sm font-medium shadow transition-colors duration-200`}
      aria-label={part.isVisible ? `إخفاء قسم ${part.name || part.id}` : `إظهار قسم ${part.name || part.id}`}
    >
      {part.isVisible ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
    </motion.button>

    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => openEditDialog(part)}
      className="bg-green-600 text-white px-3 py-2 rounded-full text-sm font-medium shadow hover:bg-green-700 transition-colors duration-200"
      aria-label={`تعديل قسم ${part.name || part.id}`}
    >
      <Edit2 className="w-5 h-5" />
    </motion.button>

    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => setShowConfirm(part.id)}
      className="bg-red-600 text-white px-3 py-2 rounded-full text-sm font-medium shadow hover:bg-red-700 transition-colors duration-200"
      aria-label={`حذف قسم ${part.name || part.id}`}
    >
      <Trash2 className="w-5 h-5" />
    </motion.button>
  </>
)}

                    </div>
                  </div>

                  {showConfirm === part.id && currentUserRole === 'admin' && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-2xl"
                    >
                      <div className="bg-gray-800 p-6 rounded-xl shadow-xl">
                        <p className="text-white font-medium mb-4">هل أنت متأكد من حذف قسم {part.name || part.id}؟</p>
                        <div className="flex justify-center gap-3">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleDelete(part.id)}
                            className="bg-red-600 text-white px-4 py-2 rounded-full text-sm shadow hover:bg-red-700 transition-colors"
                            aria-label={`تأكيد حذف قسم ${part.name || part.id}`}
                          >
                            نعم، احذف
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setShowConfirm(null)}
                            className="bg-gray-600 text-white px-4 py-2 rounded-full text-sm shadow hover:bg-gray-700 transition-colors"
                            aria-label="إلغاء الحذف"
                          >
                            إلغاء
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Dialog لتعديل اسم القسم */}
      {showEditDialog && currentUserRole === 'admin' && (
        <div className="fixed inset-0 backdrop-blur-md bg-black/30 bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="bg-gray-800 rounded-lg p-6 w-full max-w-md"
          >
            <h3 className="text-lg font-semibold text-white mb-4">تعديل اسم القسم</h3>
            <div className="mb-4">
              <label htmlFor="newPartName" className="block text-gray-300 mb-1">
                الاسم الجديد
              </label>
              <input
                type="text"
                id="newPartName"
                value={newPartName}
                onChange={(e) => setNewPartName(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="أدخل الاسم الجديد"
                aria-describedby={error ? 'edit-error' : undefined}
              />
            </div>
            {error && (
              <p id="edit-error" className="text-red-500 mb-4" role="alert">
                {error}
              </p>
            )}
            <div className="flex justify-end gap-4">
              <motion.button
                onClick={() => setShowEditDialog(null)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
                aria-label="إلغاء تعديل اسم القسم"
              >
                إلغاء
              </motion.button>
              <motion.button
                onClick={handleEdit}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700"
                aria-label="حفظ الاسم الجديد للقسم"
              >
                حفظ
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default PartsList;