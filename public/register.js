// public/register.js

// دالة للتحقق مما إذا كان التطبيق في وضع WebView
function isWebView() {
  const userAgent = navigator.userAgent || navigator.vendor || window.opera;

  // فحص WebView في Android (يحتوي عادةً على "wv" أو "WebView")
  const isAndroidWebView = /wv|Android.*(WebView)/i.test(userAgent);

  // فحص WebView في iOS (يحتوي عادةً على "Mobile Safari" ولكن ليس في وضع مستقل)
  const isIOSWebView =
    /iPhone|iPad|iPod/i.test(userAgent) &&
    !/Safari/i.test(userAgent) &&
    !window.navigator.standalone;

  return isAndroidWebView || isIOSWebView;
}

// تسجيل Service Worker فقط إذا لم يكن في وضع WebView
if ('serviceWorker' in navigator && !isWebView()) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        console.log('Service Worker registered with scope:', registration.scope);
      })
      .catch((err) => {
        console.log('Service Worker registration failed:', err);
      });
  });
} else {
  console.log('Service Worker registration skipped: Running in WebView mode');
}