'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Trash2 } from 'lucide-react';

export default function UserManager() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('admin');
  const [users, setUsers] = useState([]);
  const [currentUserRole, setCurrentUserRole] = useState('');
  const [currentUserId, setCurrentUserId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [confirmEmail, setConfirmEmail] = useState('');

  // جلب بيانات المستخدم الحالي وقائمة المستخدمين
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
        setCurrentUserId(userData.userId || '');

        // جلب قائمة المستخدمين
        const usersResponse = await fetch('/api/get-users');
        const usersData = await usersResponse.json();
        if (usersData.error) {
          throw new Error(usersData.error);
        }
        setUsers(usersData);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('فشل في جلب البيانات');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // إذا لم يكن المستخدم مديرًا، لا يتم عرض المكون
  if (!loading && currentUserRole !== 'admin') {
    return null;
  }

  // إنشاء حساب جديد
  const handleCreateUser = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
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
      setSuccess('تم إنشاء الحساب بنجاح');
      setEmail('');
      setPassword('');
      // تحديث قائمة المستخدمين
      const usersResponse = await fetch('/api/get-users');
      const usersData = await usersResponse.json();
      setUsers(usersData);
    } catch (err) {
      setError(err.message);
    }
  };

  // فتح Dialog التأكيد لحذف المستخدم
  const openDeleteDialog = (user) => {
    setUserToDelete(user);
    setShowDeleteDialog(true);
    setConfirmEmail('');
    setError('');
  };

  // إغلاق Dialog التأكيد
  const closeDeleteDialog = () => {
    setShowDeleteDialog(false);
    setUserToDelete(null);
    setConfirmEmail('');
  };

  // حذف مستخدم بعد التأكيد
  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    // التحقق من البريد الإلكتروني
    if (confirmEmail !== userToDelete.email) {
      setError('البريد الإلكتروني غير صحيح');
      return;
    }

    try {
      const response = await fetch('/api/delete-user', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid: userToDelete.uid }),
      });
      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }
      setSuccess('تم حذف المستخدم بنجاح');
      setUsers(users.filter(user => user.uid !== userToDelete.uid));
      closeDeleteDialog();
    } catch (err) {
      setError(err.message);
    }
  };

  // تغيير صلاحية المستخدم
  const handleChangeRole = async (uid, newRole) => {
    try {
      const res = await fetch('/api/update-user-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid, newRole }),
      });
  
      const text = await res.text();
      const data = text ? JSON.parse(text) : {};
  
      if (!res.ok) {
        throw new Error(data.error || 'حدث خطأ ما');
      }
  
      console.log('تم تحديث الدور:', data.message);
    } catch (error) {
      console.error('خطأ أثناء التحديث:', error);
    }
  };
  
  


  return (
    <div className="bg-gray-800 rounded-2xl shadow-xl p-6">
      <h2 className="text-2xl font-bold text-white mb-4">إدارة المستخدمين</h2>

      {/* نموذج إنشاء حساب */}
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
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="admin">مدير</option>
              <option value="supervisor">مشرف</option>
            </select>
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
        {error && <p className="text-red-500 mt-2">{error}</p>}
        {success && <p className="text-green-500 mt-2">{success}</p>}
      </motion.div>

      {/* قائمة المستخدمين */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <h3 className="text-xl font-semibold text-white mb-4">قائمة المستخدمين</h3>
        {loading ? (
          <p className="text-gray-300">جارٍ تحميل المستخدمين...</p>
        ) : users.length === 0 ? (
          <p className="text-gray-300">لا يوجد مستخدمون</p>
        ) : (
          <div className="space-y-4">
            {users.map(user => (
              <motion.div
                key={user.uid}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="flex justify-between items-center bg-gray-700 p-4 rounded-lg"
              >
                <div className="flex items-center gap-2">
                  <div>
                    <p className="text-white">
                      البريد: {user.email}
                      {user.uid === currentUserId && (
                        <span className="text-green-500 font-semibold mr-2"> (أنت)</span>
                      )}
                    </p>
                    <div className="flex items-center gap-2">
  <label className="text-gray-300">الدور:</label>
  <select
    value={user.role}
    onChange={(e) => handleChangeRole(user.uid, e.target.value)}
    className="bg-gray-600 text-white rounded px-2 py-1 focus:outline-none"
    disabled={user.uid === currentUserId} // حتى لا يغير المدير صلاحيته بنفسه
  >
    <option value="admin">مدير</option>
    <option value="supervisor">مشرف</option>
  </select>
</div>

                  </div>
                </div>
                <motion.button
                  onClick={() => openDeleteDialog(user)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="text-red-500 hover:text-red-700"
                  disabled={user.uid === currentUserId}
                >
                  <Trash2 className="w-5 h-5" />
                </motion.button>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Dialog التأكيد للحذف */}
      {showDeleteDialog && (
        <div className="fixed inset-0 backdrop-blur-md bg-black/30 bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="bg-gray-800 rounded-lg p-6 w-full max-w-md"
          >
            <h3 className="text-lg font-semibold text-white mb-4">تأكيد الحذف</h3>
            <p className="text-gray-300 mb-4">
              هل أنت متأكد من حذف المستخدم{' '}
              <span className="text-yellow-500">{userToDelete?.email}</span>؟
            </p>
            <div className="mb-4">
              <label htmlFor="confirmEmail" className="block text-gray-300 mb-1">
                أدخل البريد الإلكتروني للمستخدم للتأكيد
              </label>
              <input
                type="email"
                id="confirmEmail"
                value={confirmEmail}
                onChange={(e) => setConfirmEmail(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="أدخل البريد الإلكتروني"
              />
            </div>
            {error && <p className="text-red-500 mb-4">{error}</p>}
            <div className="flex justify-end gap-4">
              <motion.button
                onClick={closeDeleteDialog}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
              >
                إلغاء
              </motion.button>
              <motion.button
                onClick={handleDeleteUser}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
              >
                حذف
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}