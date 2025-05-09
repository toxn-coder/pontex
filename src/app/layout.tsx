import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/NavBar';
import Footer from '@/components/Footer';
import { Toaster } from 'sonner';
import { CartProvider } from './CartContext';
import InstallButton from '@/components/InstallButton';
import Cart from '@/components/Cart';
import NotificationListener from '@/components/NotificationListener';


export const metadata: Metadata = {
  title: ' اسم مطعمك - أفضل شاورما القاهرة أصلية في المدينة',
  description:
    'استمتع بأفضل شاورما القاهرة أصلية في اسم مطعمك. تصفح قائمتنا، اطلب الآن، واستمتع بمذاق الشاورما الحقيقي!',
  keywords: 'شاورما, شاورما القاهرة, مطعم شاورما, أفضل شاورما, طعام سوري, مطاعم المدينة',
  authors: [{ name: 'اسم مطعمك' }],
  icons: {
    icon: '/ios/192.png',
    shortcut: '/ios/192.png',
    apple: '/ios/192.png',
  },
  openGraph: {
    title: 'اسم مطعمك - أفضل شاورما القاهرة أصلية',
    description:
      'استمتع بأفضل شاورما القاهرة أصلية في اسم مطعمك. تصفح قائمتنا، اطلب الآن، واستمتع بمذاق الشاورما الحقيقي!',
    url: 'https://waly-damascus.vercel.app',
    siteName: 'اسم مطعمك',
    images: [
      {
        url: 'https://waly-damascus.vercel.app/logo.png',
        width: 1200,
        height: 630,
        alt: 'شاورما القاهرة أصلية من اسم مطعمك',
      },
    ],
    locale: 'ar',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'اسم مطعمك - أفضل شاورما القاهرة أصلية',
    description:
      'استمتع بأفضل شاورما القاهرة أصلية في اسم مطعمك. تصفح قائمتنا، اطلب الآن، واستمتع بمذاق الشاورما الحقيقي!',
    images: ['https://waly-damascus.vercel.app/logo.png',],
    site: '@waly-semashk',
    creator: '@waly-semashk',
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'اسم مطعمك',
    startupImage: [
      '/android/android-launchericon-192-192.png',
    ],
  },
  robots: {
    index: true,
    follow: true,
    'max-snippet': -1,
    'max-image-preview': 'large',
    'max-video-preview': -1,
  },
};

// تصدير viewport منفصل يحتوي على themeColor وإعدادات العرض
export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#000',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    name: 'اسم مطعمك',
    description: 'أفضل شاورما القاهرة أصلية في المدينة، تقدم مجموعة متنوعة من الشاورما والوجبات السورية.',
    url: 'https://waly-damascus.vercel.app',
    logo: 'https://waly-damascus.vercel.app/logo.png',
    image: 'https://waly-damascus.vercel.app/logo.png',
    telephone: '+2010 60462862',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'شارع إبراهيم المغازي تقسيم 2 أمام بيتزا بان',
      addressLocality: 'القاهرة',
      addressRegion: 'القاهرة',
      postalCode: '33511',
      addressCountry: 'EG',

    },
    openingHours: 'Mo-Su 11:00-23:00',
    servesCuisine: 'القاهرة',
    priceRange: '$$',
    acceptsReservations: 'false',
    hasMenu: 'https://waly-damascus.vercel.app/menu',
  };

  return (
    <html lang="ar" dir="rtl">
      <head>
        <title>اسم مطعمك - أفضل شاورما القاهرة أصلية</title>
        <link rel='icon' href='/favicon.ico' sizes='any' />
        {/* روابط تحسين الأداء للخطوط */}
        <link rel="preconnect" href="https://fonts.googleapis.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="preload"
          href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;700&display=swap"
          as="style"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
        {/* Preconnect لتحسين الأداء */}
        <link rel="preconnect" href="https://firestore.googleapis.com" />
        <link rel="preconnect" href="https://waly-damascus.vercel.app" />

        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />

        {/* ميتا تاغز إضافية لدعم PWA */}
        <meta name="mobile-web-app-capable" content="yes"/>
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="google-site-verification" content="6V4hEDqMmgZ2uRlKRTKbR9Ogns6ombQN47K8ZrFzZRo" />
        <meta name="msvalidate.01" content="1CB91B8C37A0E19509B66CE4387DCB4D" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className="bg-[var(--foreground)] text-white font-cairo">
        <CartProvider>
          <Navbar aria-label="التنقل الرئيسي" />
          <InstallButton />
          <main>{children}</main>
          <Footer aria-label="تذييل الموقع" />
          <Cart />
          <NotificationListener />
          <Toaster richColors position="top-center" duration={3000} closeButton />
        </CartProvider>
      </body>
    </html>
  );
}