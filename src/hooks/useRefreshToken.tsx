'use client';

import { useEffect } from 'react';
import { getAuth, onIdTokenChanged } from 'firebase/auth';
import { useRouter, usePathname } from 'next/navigation';

export function useRefreshToken() {
  const router = useRouter();
  const pathname = usePathname();

  // قائمة المسارات المحمية التي تتطلب تسجيل دخول
  const protectedRoutes = ['/auth/dashboard', '/auth/dashboard/'];

  useEffect(() => {
    const auth = getAuth();

    const unsubscribe = onIdTokenChanged(auth, async (user) => {
      // التحقق مما إذا كان المستخدم في مسار محمي
      const isProtectedRoute = protectedRoutes.some((route) =>
        pathname.startsWith(route)
      );

      if (user) {
        try {
          // الحصول على توكن جديد
          const token = await user.getIdToken(true);

          // إرسال التوكن إلى API لتحديث الكوكيز
          const response = await fetch('/api/set-token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idToken: token }),
          });

          if (!response.ok) {
            throw new Error('Failed to set token');
          }
        } catch (err) {
          console.error('Token refresh failed:', err);
          // إعادة التوجيه إلى /auth فقط إذا كان المستخدم في مسار محمي
          if (isProtectedRoute) {
            router.push('/auth');
          }
        }
      } else {
        // إعادة التوجيه إلى /auth فقط إذا كان المستخدم في مسار محمي
        if (isProtectedRoute) {
          router.push('/auth');
        }
      }
    });

    return () => unsubscribe();
  }, [router, pathname]);
}