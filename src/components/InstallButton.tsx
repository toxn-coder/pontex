'use client';

import { useEffect, useState } from 'react';

const InstallButton = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event);
      setShowButton(true); // إظهار الزر عندما يكون بالإمكان التثبيت
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt(); // فتح نافذة التثبيت
      deferredPrompt.userChoice.then((choiceResult: any) => {
        console.log(choiceResult.outcome);
        setDeferredPrompt(null); // إعادة تعيين بعد التثبيت
        setShowButton(false); // إخفاء الزر بعد التثبيت
      });
    }
  };

  return (
    showButton && (
      <button
        onClick={handleInstall}
        className="fixed bottom-5 z-50 left-1/2 -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-full shadow-lg hover:bg-green-600 transition-colors duration-200"
      >
        تثبيت التطبيق
      </button>
    )
  );
};

export default InstallButton;