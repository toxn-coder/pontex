'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { auth } from '@/app/api/firebase';
import { reauthenticateWithCredential, EmailAuthProvider, updatePassword } from 'firebase/auth';

export default function ChangePassword() {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const user = auth.currentUser;
    if (!user) {
      setError('لم يتم العثور على المستخدم. يرجى تسجيل الدخول مرة أخرى.');
      return;
    }

    try {
      // إعادة المصادقة باستخدام كلمة المرور القديمة
      const credential = EmailAuthProvider.credential(user.email, oldPassword);
      await reauthenticateWithCredential(user, credential);

      // تغيير كلمة المرور
      await updatePassword(user, newPassword);
      setSuccess('تم تغيير كلمة المرور بنجاح');
      setOldPassword('');
      setNewPassword('');
    } catch (err) {
      console.error('Error changing password:', err);
      if (err.code === 'auth/wrong-password') {
        setError('كلمة المرور القديمة غير صحيحة');
      } else if (err.code === 'auth/weak-password') {
        setError('كلمة المرور الجديدة ضعيفة جدًا، يجب أن تكون 6 أحرف على الأقل');
      } else {
        setError('فشل في تغيير كلمة المرور: ' + err.message);
      }
    }
  };

  return (
    <div className="bg-gray-800 rounded-2xl shadow-xl p-6">
      <h2 className="text-2xl font-bold text-white mb-4">تغيير كلمة المرور</h2>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label htmlFor="oldPassword" className="block text-gray-300 mb-1">
              كلمة المرور القديمة
            </label>
            <input
              type="password"
              id="oldPassword"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              required
            />
          </div>
          <div>
            <label htmlFor="newPassword" className="block text-gray-300 mb-1">
              كلمة المرور الجديدة
            </label>
            <input
              type="password"
              id="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              required
            />
          </div>
          <motion.button
            type="submit"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-amber-600 text-white px-6 py-2 rounded-lg hover:bg-amber-700 transition-colors"
          >
            تغيير كلمة المرور
          </motion.button>
        </form>
        {error && <p className="text-red-500 mt-2">{error}</p>}
        {success && <p className="text-green-500 mt-2">{success}</p>}
      </motion.div>
    </div>
  );
}