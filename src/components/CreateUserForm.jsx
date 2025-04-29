'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

export default function CreateUserForm({ refreshUsers }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('admin');
  const [selectedRole, setSelectedRole] = useState('');
  const [localError, setLocalError] = useState('');
  const [localSuccess, setLocalSuccess] = useState('');

  // إنشاء حساب جديد
  const handleCreateUser = async (e) => {
    e.preventDefault();
    setLocalError('');
    setLocalSuccess('');
    try {
      const response = await fetch('/api/create-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role }),
      });
      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }
      setLocalSuccess('تم إنشاء الحساب بنجاح');
      setEmail('');
      setPassword('');
      setSelectedRole('');
      await refreshUsers();
    } catch (err) {
      setLocalError(err.message);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-8"
    >
      <h3 className="text-xl font-semibold text-white mb-4">إنشاء حساب جديد</h3>
      <form onSubmit={handleCreateUser} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-gray-300 mb-1">البريد الإلكتروني</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            required
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-gray-300 mb-1">كلمة المرور</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            required
          />
        </div>
        <div>
          <label htmlFor="role" className="block text-gray-300 mb-1">الدور</label>
          <select
            id="role"
            value={role}
            onChange={(e) => {
              setRole(e.target.value);
              setSelectedRole(e.target.value === 'admin' ? 'مدير' : 'مشرف');
            }}
            className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="admin">مدير</option>
            <option value="supervisor">مشرف</option>
          </select>
          {selectedRole && (
            <p className="text-green-500 mt-1">لقد اخترت دور: {selectedRole}</p>
          )}
        </div>
        <motion.button
          type="submit"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-amber-600 text-white px-6 py-2 rounded-lg hover:bg-amber-700 transition-colors"
        >
          إنشاء الحساب
        </motion.button>
      </form>
      {localError && <p className="text-red-500 mt-2">{localError}</p>}
      {localSuccess && <p className="text-green-500 mt-2">{localSuccess}</p>}
    </motion.div>
  );
}