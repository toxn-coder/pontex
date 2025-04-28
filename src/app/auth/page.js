'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/app/api/firebase';
import { Mail, Lock, LogIn } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const idToken = await userCredential.user.getIdToken();
      // تخزين idToken في ملف تعريف الارتباط عبر طلب API
      await fetch('/api/set-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      });
      router.push('/auth/dashboard'); // إعادة توجيه إلى لوحة التحكم
    } catch (err) {
      console.error('Login error:', err);
      switch (err.code) {
        case 'auth/wrong-password':
        case 'auth/user-not-found':
          setError('البريد الإلكتروني أو كلمة المرور غير صحيحة.');
          break;
        case 'auth/too-many-requests':
          setError('تم حظر الحساب مؤقتًا بسبب محاولات تسجيل دخول كثيرة. حاول لاحقًا.');
          break;
        default:
          setError('حدث خطأ أثناء تسجيل الدخول. حاول مرة أخرى.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--clr-primary)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full bg-gray-800 rounded-2xl shadow-xl p-8"
      >
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white">
            <span className="text-yellow-500">تسجيل الدخول</span>
          </h2>
          <p className="text-gray-300 mt-2">ادخل بياناتك للوصول إلى لوحة التحكم</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label htmlFor="email" className="text-gray-300 mb-2 flex items-center gap-2">
              <Mail className="w-5 h-5" />
              البريد الإلكتروني
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-yellow-400 focus:border-yellow-400"
              placeholder="example@domain.com"
            />
          </div>
          <div>
            <label htmlFor="password" className="text-gray-300 mb-2 flex items-center gap-2">
              <Lock className="w-5 h-5" />
              كلمة المرور
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-yellow-400 focus:border-yellow-400"
              placeholder="••••••••"
            />
          </div>
          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-red-400 text-center"
            >
              {error}
            </motion.p>
          )}
          <motion.button
            type="submit"
            disabled={isLoading}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`w-full px-4 py-2 rounded-lg text-white font-medium transition-colors flex items-center justify-center gap-2 ${
              isLoading ? 'bg-gray-600 cursor-not-allowed' : 'bg-amber-600 hover:bg-amber-700'
            }`}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                جارٍ تسجيل الدخول...
              </>
            ) : (
              <>
                <LogIn className="w-5 h-5" />
                تسجيل الدخول
              </>
            )}
          </motion.button>
        </form>

      </motion.div>
    </div>
  );
}