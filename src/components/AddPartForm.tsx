'use client';

import { useState } from 'react';
import { db } from '@/app/api/firebase';
import { collection, doc, setDoc } from 'firebase/firestore';
import { Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

const AddPartForm = () => {
  const [partName, setPartName] = useState('');
  const [open, setOpen] = useState(false);

  const handleAddPart = async () => {
    if (!partName.trim()) {
      toast.error('يرجى إدخال اسم القسم');
      return;
    }

    try {
      await setDoc(doc(collection(db, 'menuParts'), partName), {
        name: partName,
        createdAt: new Date(),
      });
      toast.success('تمت الإضافة بنجاح');
      setPartName('');
      setOpen(false);
    } catch (error) {
      console.error('حدث خطأ أثناء الإضافة:', error);
      toast.error('فشلت العملية');
    }
  };

  return (
    <div className="bg-gray-800 rounded-2xl shadow-xl p-6">
      <h2 className="text-2xl font-bold text-white mb-4">إضافة الأقسام</h2>

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
          إضافة قسم
        </motion.button>

        {open && (
          <div className="fixed inset-0 backdrop-blur-md bg-black/30 bg-opacity-50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="bg-gray-800 rounded-lg p-6 w-full max-w-md"
            >
              <h3 className="text-lg font-semibold text-white mb-4">إضافة قسم جديد</h3>
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="اسم القسم"
                  value={partName}
                  onChange={(e) => setPartName(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div className="flex justify-end gap-4">
                <motion.button
                  onClick={() => setOpen(false)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
                >
                  إلغاء
                </motion.button>
                <motion.button
                  onClick={handleAddPart}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700"
                >
                  حفظ
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default AddPartForm;