/** @type {import('next').NextConfig} */
const withPWA = require('next-pwa')({
  dest: 'public', // مكان تخزين ملفات Service Worker
  disable: process.env.NODE_ENV === 'development', // تعطيل PWA في وضع التطوير
  register: true, // تسجيل Service Worker تلقائيًا
  skipWaiting: true, // تخطي مرحلة الانتظار لتفعيل Service Worker
});
const nextConfig = {
  eslint: {
    // تعطيل قواعد ESLint أثناء البناء
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

module.exports = nextConfig;