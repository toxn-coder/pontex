'use client';

import { useEffect, useState } from 'react';
import CreateUserForm from './CreateUserForm';
import UserList from './UserList';

export default function UserManager() {
  const [users, setUsers] = useState([]);
  const [currentUserRole, setCurrentUserRole] = useState('');
  const [currentUserId, setCurrentUserId] = useState('');
  const [loading, setLoading] = useState(true);

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

  // تحديث قائمة المستخدمين بعد إنشاء حساب جديد أو الحذف
  const refreshUsers = async () => {
    try {
      const usersResponse = await fetch('/api/get-users');
      const usersData = await usersResponse.json();
      if (usersData.error) {
        throw new Error(usersData.error);
      }
      setUsers(usersData);
    } catch (err) {
      console.error('Error refreshing users:', err);
    }
  };

  return (
    <div className="bg-gray-800 rounded-2xl shadow-xl p-6">
      <h2 className="text-2xl font-bold text-white mb-4">إدارة المستخدمين</h2>

      {/* مكون إنشاء حساب جديد */}
      <CreateUserForm refreshUsers={refreshUsers} />

      {/* مكون قائمة المستخدمين */}
      <UserList
        users={users}
        currentUserId={currentUserId}
        loading={loading}
        refreshUsers={refreshUsers}
      />
    </div>
  );
}