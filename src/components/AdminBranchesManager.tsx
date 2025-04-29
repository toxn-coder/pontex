'use client';

import { useState, useEffect } from 'react';
import { db } from '@/app/api/firebase';
import { collection, doc, setDoc, deleteDoc, getDocs } from 'firebase/firestore';
import { Save, Edit, Trash2, Image as ImageIcon, X } from 'lucide-react';
import { motion } from 'framer-motion';
import Image from 'next/image'; // استيراد Image من next/image

// تعريف واجهة لنوع الفرع
interface Branch {
  id: string;
  name: string;
  image: string;
  address: string;
  phone: string;
  workingHours: string;
  googleMapsLink: string;
}

export default function AdminBranchesManager() {
  const [branches, setBranches] = useState<Branch[]>([]); // تحديد نوع branches
  const [newBranch, setNewBranch] = useState<Branch>({
    id: '',
    name: '',
    image: '',
    address: '',
    phone: '',
    workingHours: '',
    googleMapsLink: '',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState<'success' | 'error' | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [currentUserRole, setCurrentUserRole] = useState('');

  // جلب دور المستخدم الحالي وفروع المطعم
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

        // جلب الفروع
        const branchesCollection = collection(db, 'branches');
        const branchesSnapshot = await getDocs(branchesCollection);
        const branchesList = branchesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Branch[];
        setBranches(branchesList);
      } catch (error) {
        console.error('Error fetching data:', error);
        setStatus('error');
        setErrorMessage('فشل جلب البيانات. حاول مرة أخرى.');
      }
    };
    fetchData();
  }, []);

  // التعامل مع تغيير المدخلات
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewBranch({ ...newBranch, [e.target.name]: e.target.value });
  };

  // التعامل مع اختيار الصورة
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // التحقق من حجم الصورة (الحد الأقصى 5 ميغابايت)
      if (file.size > 5 * 1024 * 1024) {
        setStatus('error');
        setErrorMessage('حجم الصورة كبير جدًا. يجب أن يكون أقل من 5 ميغابايت.');
        setTimeout(() => setStatus(null), 3000);
        return;
      }
      // التحقق من نوع الصورة
      if (!file.type.startsWith('image/')) {
        setStatus('error');
        setErrorMessage('يرجى اختيار ملف صورة صالح (JPEG, PNG، إلخ).');
        setTimeout(() => setStatus(null), 3000);
        return;
      }
      setImageFile(file);
      setNewBranch({ ...newBranch, image: URL.createObjectURL(file) });
    }
  };

  // إزالة الصورة المختارة
  const handleRemoveImage = () => {
    setImageFile(null);
    setNewBranch({ ...newBranch, image: '' });
  };

  // رفع الصورة إلى Cloudinary
  const uploadImageToCloudinary = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'shawarma');
    formData.append('folder', 'restaurant_branches');

    try {
      const response = await fetch('https://api.cloudinary.com/v1_1/do88eynar/image/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      if (data.secure_url) {
        return data.secure_url;
      } else {
        console.error('Cloudinary error:', data);
        throw new Error(data.error?.message || 'فشل رفع الصورة');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  };

  // حفظ أو تحديث فرع
  const handleSaveBranch = async () => {
    if (!newBranch.name || !newBranch.address) {
      setStatus('error');
      setErrorMessage('اسم الفرع والعنوان مطلوبان.');
      setTimeout(() => setStatus(null), 3000);
      return;
    }

    setIsSaving(true);
    try {
      let imageUrl = newBranch.image;
      if (imageFile) {
        imageUrl = await uploadImageToCloudinary(imageFile);
      }

      const branchId = newBranch.id || `branch_${Date.now()}`;
      await setDoc(doc(db, 'branches', branchId), {
        name: newBranch.name,
        image: imageUrl || '',
        address: newBranch.address,
        phone: newBranch.phone,
        workingHours: newBranch.workingHours,
        googleMapsLink: newBranch.googleMapsLink,
      });

      // تحديث الحالة بدون تعارض في id
      setBranches((prev) => {
        // إنشاء كائن فرع جديد بدون تعارض في id
        const updatedBranch: Branch = {
          id: branchId,
          name: newBranch.name,
          image: imageUrl || '',
          address: newBranch.address,
          phone: newBranch.phone,
          workingHours: newBranch.workingHours,
          googleMapsLink: newBranch.googleMapsLink,
        };

        return newBranch.id
          ? prev.map((b) => (b.id === newBranch.id ? updatedBranch : b))
          : [...prev, updatedBranch];
      });

      setNewBranch({ id: '', name: '', image: '', address: '', phone: '', workingHours: '', googleMapsLink: '' });
      setImageFile(null);
      setStatus('success');
      setErrorMessage('تم حفظ الفرع بنجاح!');
    } catch (error: unknown) {
      console.error('Error saving branch:', error);
      setStatus('error');
      // تحديد نوع error كـ Error للوصول إلى message
      setErrorMessage(error instanceof Error ? error.message : 'حدث خطأ أثناء حفظ الفرع. حاول مرة أخرى.');
    } finally {
      setIsSaving(false);
      setTimeout(() => {
        setStatus(null);
        setErrorMessage('');
      }, 3000);
    }
  };

  // حذف فرع
  const handleDeleteBranch = async (branchId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الفرع؟')) return;

    try {
      await deleteDoc(doc(db, 'branches', branchId));
      setBranches((prev) => prev.filter((b) => b.id !== branchId));
      setStatus('success');
      setErrorMessage('تم حذف الفرع بنجاح!');
    } catch (error: unknown) {
      console.error('Error deleting branch:', error);
      setStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'فشل حذف الفرع. حاول مرة أخرى.');
    }
  };

  // تعديل فرع
  const handleEditBranch = (branch: Branch) => {
    setNewBranch(branch);
    setImageFile(null);
  };

  return (
    <div className="w-full py-12 px-4 sm:px-6 lg:px-8 min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-12"
      >
        <h1 className="text-3xl sm:text-4xl font-bold text-white">
          <span className="text-yellow-400">إدارة فروع المطعم</span>
        </h1>
        <p className="text-gray-300 mt-2 text-base sm:text-lg">
          أضف، عدّل، أو احذف فروع مطعم الشاورما الأصيل
        </p>
      </motion.div>

      <div className="bg-gray-800 rounded-2xl p-6 sm:p-8 shadow-xl max-w-7xl mx-auto">
        {/* نموذج إضافة/تعديل فرع (يظهر فقط للمدير) */}
        {currentUserRole === 'admin' && (
          <div className="mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">
              {newBranch.id ? 'تعديل فرع' : 'إضافة فرع جديد'}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                type="text"
                name="name"
                value={newBranch.name}
                onChange={handleInputChange}
                placeholder="اسم الفرع (مثال: فرع العليا)"
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-yellow-400 focus:border-yellow-400 text-sm sm:text-base"
              />
              <div className="flex flex-col">
                <label htmlFor="image" className="text-gray-300 mb-2 flex items-center gap-2">
                  <ImageIcon className="w-5 h-5" />
                  صورة الفرع
                </label>
                <input
                  type="file"
                  id="image"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm sm:text-base"
                />
                {newBranch.image && (
                  <div className="mt-2 flex items-center gap-2">
                    <Image
                      src={newBranch.image}
                      alt="معاينة الصورة"
                      width={128} // العرض بالبكسل (32 * 4 = 128px)
                      height={128} // الارتفاع بالبكسل (32 * 4 = 128px)
                      className="object-cover rounded-lg"
                    />
                    <button
                      onClick={handleRemoveImage}
                      className="p-1 text-red-400 hover:text-red-500"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>
              <input
                type="text"
                name="address"
                value={newBranch.address}
                onChange={handleInputChange}
                placeholder="العنوان (مثال: شارع الملك فهد، حي العليا)"
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-yellow-400 focus:border-yellow-400 text-sm sm:text-base"
              />
              <input
                type="text"
                name="phone"
                value={newBranch.phone}
                onChange={handleInputChange}
                placeholder="رقم الهاتف (مثال: +966501234567)"
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-yellow-400 focus:border-yellow-400 text-sm sm:text-base"
              />
              <input
                type="text"
                name="workingHours"
                value={newBranch.workingHours}
                onChange={handleInputChange}
                placeholder="ساعات العمل (مثال: السبت - الخميس: 10:00 ص - 12:00 م)"
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-yellow-400 focus:border-yellow-400 text-sm sm:text-base"
              />
              <input
                type="text"
                name="googleMapsLink"
                value={newBranch.googleMapsLink}
                onChange={handleInputChange}
                placeholder="رابط خريطة Google (اختياري)"
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-yellow-400 focus:border-yellow-400 text-sm sm:text-base"
              />
            </div>
            <motion.button
              onClick={handleSaveBranch}
              disabled={isSaving}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`mt-4 w-full sm:w-auto px-6 py-3 rounded-lg text-white font-medium transition-colors flex items-center justify-center gap-2 ${
                isSaving ? 'bg-gray-600 cursor-not-allowed' : 'bg-amber-600 hover:bg-amber-700'
              }`}
            >
              {isSaving ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  جارٍ الحفظ...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  حفظ الفرع
                </>
              )}
            </motion.button>
          </div>
        )}

        {/* قائمة الفروع */}
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">الفروع الحالية</h2>
          {branches.length === 0 ? (
            <p className="text-gray-300">لا توجد فروع مضافة بعد.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {branches.map((branch) => (
                <div
                  key={branch.id}
                  className="p-4 bg-gray-700 rounded-lg shadow flex justify-between items-center"
                >
                  <div className="flex items-center gap-4">
                    {branch.image && (
                      <Image
                        src={branch.image}
                        alt={branch.name}
                        width={64} // العرض بالبكسل (16 * 4 = 64px)
                        height={64} // الارتفاع بالبكسل (16 * 4 = 64px)
                        className="object-cover rounded-lg"
                      />
                    )}
                    <div>
                      <h3 className="text-lg font-bold text-white">{branch.name}</h3>
                      <p className="text-gray-300">{branch.address}</p>
                    </div>
                  </div>
                  {currentUserRole === 'admin' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditBranch(branch)}
                        className="p-2 text-yellow-400 hover:text-yellow-500"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteBranch(branch.id)}
                        className="p-2 text-red-400 hover:text-red-500"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* رسائل الحالة */}
        {status === 'success' && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 text-green-400 text-center text-sm sm:text-base"
          >
            {errorMessage}
          </motion.p>
        )}
        {status === 'error' && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 text-red-400 text-center text-sm sm:text-base"
          >
            {errorMessage}
          </motion.p>
        )}
      </div>
    </div>
  );
}