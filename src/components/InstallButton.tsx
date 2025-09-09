'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

const InstallButton = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showButton, setShowButton] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // ✅ منع الزر في WebView مثل Messenger / Instagram
    const ua = navigator.userAgent || navigator.vendor;
    const isInApp = /FBAN|FBAV|Instagram|Messenger/i.test(ua);
    if (isInApp) return; // لا يظهر الزر

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event);
      setShowButton(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then(() => {
        setDeferredPrompt(null);
        setShowButton(false);
      });
    }
  };

  // ✅ إخفاء الزر في صفحات معينة
  if (pathname.startsWith('/auth') || pathname.startsWith('/dashboard')) {
    return null;
  }

  return (
    showButton && (
      <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50">
        <div className="relative w-fit h-fit">
          {/* حلقات أنيميشن */}
          <span className="absolute top-1/2 left-1/2 w-[70%] h-[70%] bg-green-400 opacity-50 rounded-full -translate-x-1/2 -translate-y-1/2 animate-ping z-0"></span>
          <span className="absolute top-1/2 left-1/2 w-[60%] h-[60%] bg-green-400 opacity-60 rounded-full -translate-x-1/2 -translate-y-1/2 animate-ping delay-200 z-0"></span>
          <span className="absolute top-1/2 left-1/2 w-[50%] h-[50%] bg-green-400 opacity-70 rounded-full -translate-x-1/2 -translate-y-1/2 animate-ping delay-400 z-0"></span>

          {/* الزر */}
          <button
            onClick={handleInstall}
            className="relative z-10 bg-green-500 text-white px-6 py-3 rounded-full shadow-xl hover:bg-green-600 transition-colors duration-200"
          >
            تثبيت التطبيق
          </button>
        </div>
      </div>
    )
  );
};

export default InstallButton;
