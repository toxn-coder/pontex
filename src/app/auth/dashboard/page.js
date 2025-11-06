'use client';

import { auth } from '@/app/api/firebase';
import AboutEditor from '@/components/AboutEditor';
import AddPartForm from '@/components/AddPartForm';
import AdminBranchesManager from '@/components/AdminBranchesManager';
import ChangePassword from '@/components/ChangePassword';
import InfoAppEditor from '@/components/InfoAppEditor';
import PartsList from '@/components/PartList';
import QRCodeGenerator from '@/components/QRCodeGenerator';
import SocialLinksManager from '@/components/SocialLinksManager';
import UserManager from '@/components/UserManager';
import { signOut } from 'firebase/auth';
import { motion } from 'framer-motion';
import { LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import SubscribersList from '@/components/subscribersEmail'
import ClientWrapper from '@/components/ClientWrapper';
import AdminAddSection from '@/components/AdminAddSection';
import AdminEditSection from '@/components/AdminEditSection';
import BestSellersManager from '@/components/BestSellersManager';




export default function Dashboard() {
  

  const [userId, setUserId] = useState('');
  const [userRole, setUserRole] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [qrCodeValue, setQrCodeValue] = useState();
  const [qrUrl,setQrUrl] = useState('');
  const [url,setUrl] = useState('')
  const [inputQr,setInputQr] = useState(url)
  const router = useRouter();

  // useEffect(()=>{
    
  // },[])

useEffect(() => {
  let win = window.location.protocol + '//' + window.location.host + qrUrl;
  setUrl(win);

  if (inputQr) {
    setQrCodeValue(inputQr);
  } else {
    setQrCodeValue(win);
  }
}, [qrUrl, inputQr]);


  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch('/api/get-user-data');
        const data = await response.json();
        setUserId(data.userId || '');
        setUserRole(data.userRole || '');
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUserData();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      await fetch('/api/clear-token', { method: 'POST' });
      router.push('/auth');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

    useEffect(() => {
    if (!isLoading && (!userRole || userRole === "غير معروف")) {
      router.push("/auth"); // توجيه لصفحة تسجيل الدخول
    }
  }, [isLoading, userRole, router]);

  const pages = [
    { path: "", label: "الصفحة الرئيسية" },
    { path: "/products", label: "صفحة المنتجات" },
    { path: "/about", label: "صفحة من نحن" },
    { path: "/contact", label: "صفحة اتصل بنا" },
    { path: "/production", label: "صفحة الأنتاج" },
  ];

  return (
    <ClientWrapper>
    <div className="min-h-screen bg-[#fff] py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-6xl mx-auto mb-12 mt-12"
      >
        <div className="flex flex-col sm:flex-row justify-between items-center bg-gray-800 rounded-2xl shadow-xl p-6">
        <div className="text-center sm:text-right mb-4 sm:mb-0">
      <h1 className="text-3xl font-bold text-white">
        <span className="text-yellow-500">لوحة التحكم</span>
      </h1>
      {isLoading ? (
        <p className="text-gray-300">جارٍ تحميل بيانات المستخدم...</p>
      ) : (
        <p className="text-gray-300">
          مرحبًا، أنت مسجل الدخول كـ:{" "}
          <span className="text-yellow-500">
            {userRole === "admin"
              ? "مدير"
              : userRole === "supervisor"
              ? "مشرف"
              : "غير معروف"}
          </span>
          {userId && <span className="text-yellow-500"> ({userId})</span>}
        </p>
      )}
    </div>
          <motion.button
            onClick={handleLogout}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-amber-600 text-white px-6 py-2 rounded-lg flex items-center gap-2 hover:bg-amber-700 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            تسجيل الخروج
          </motion.button>
        </div>
      </motion.div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-gray-800 rounded-2xl shadow-xl p-6 md:col-span-2" // تغيير ليأخذ العرض الكامل
        >
          <AddPartForm />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="bg-gray-800 rounded-2xl shadow-xl p-6 md:col-span-2"
        >
          <PartsList />
        </motion.div>
       

        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-gray-800 rounded-2xl shadow-xl p-6 md:col-span-2"
        >
          <h2 className="text-2xl font-bold text-white mb-4">إدارة روابط التواصل</h2>
          <SocialLinksManager />
        </motion.div>




        {UserManager() ? (
  <motion.div
    initial={{ opacity: 0, x: -50 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.5, delay: 1.0 }}
    className="bg-gray-800 rounded-2xl shadow-xl p-6 md:col-span-2"
  >
    <UserManager />
  </motion.div>
) : (
  <motion.div
    initial={{ opacity: 0, x: -50 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.5, delay: 1.0 }}
    className="bg-gray-800 rounded-2xl shadow-xl p-6 md:col-span-2 flex items-center justify-center text-white text-lg"
  >
    لا يوجد صلاحيات إدارة المستخدمين
  </motion.div>
)}

        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 1.2 }}
          className="bg-gray-800 rounded-2xl shadow-xl p-6 md:col-span-2"
        >
          <ChangePassword />
        </motion.div>


        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 1.2 }}
          className="bg-gray-800 rounded-2xl shadow-xl p-6 md:col-span-2"
        >
          <InfoAppEditor/>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 1.2 }}
          className="bg-gray-800 rounded-2xl shadow-xl p-6 md:col-span-2"
        >
          <AboutEditor/>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 1.2 }}
          className="bg-gray-800 rounded-2xl shadow-xl p-6 md:col-span-2"
        >
          <h2 className="text-xl font-bold mb-4"> المشتركين في النشرة</h2>
          <SubscribersList/>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 1.2 }}
          className="bg-gray-800 rounded-2xl shadow-xl p-6 md:col-span-2"
        >
        <AdminAddSection/>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 1.2 }}
          className="bg-gray-800 rounded-2xl shadow-xl p-6 md:col-span-2"
        >
        <AdminEditSection/>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 1.2 }}
          className="bg-gray-800 rounded-2xl shadow-xl p-6 md:col-span-2"
        >
          <h2 className="text-2xl font-bold text-white mb-4">QR Code</h2>
          <QRCodeGenerator
  value={qrCodeValue} 
  size={250}
/>
<div className='mt-5'>
  <input onChange={(e)=>setInputQr(e.currentTarget.value.trim())} type='text'                 className="w-full px-4 py-2 rounded-lg text-white focus:outline-none border-2 border-amber-500"
 placeholder=' ادخل الرابط لتحويله الى رمز ضوئي '/>
</div>
 <div className="flex justify-center items-center gap-2 mt-5">
      {pages.map((page) => (
        <label key={page.path} className="cursor-pointer">
          <input
            type="checkbox"
            className="hidden"
            checked={qrUrl === page.path}
            onChange={() => setQrUrl(page.path)}
          />
          <span
            className={`px-4 py-2 rounded-lg transition ${
              qrUrl === page.path
                ? "bg-amber-700 text-white" // مظهر عند الاختيار
                : "bg-amber-600 text-white hover:bg-amber-500"
            }`}
          >
            {page.label}
          </span>
        </label>
      ))}
    </div>
        </motion.div>

      </div>
    </div>
    </ClientWrapper>
  );
}