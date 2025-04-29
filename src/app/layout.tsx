import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/NavBar';
import Footer from '@/components/Footer';
import { Toaster } from 'sonner';
import { CartProvider } from './CartContext';
import InstallButton from '@/components/InstallButton';

export const metadata: Metadata = {
  title: 'شاورما السوري - أفضل شاورما سورية أصلية في المدينة',
  description:
    'استمتع بأفضل شاورما سورية أصلية في شاورما السوري. تصفح قائمتنا، اطلب الآن، واستمتع بمذاق الشاورما الحقيقي!',
  keywords: 'شاورما, شاورما سورية, مطعم شاورما, أفضل شاورما, طعام سوري, مطاعم المدينة',
  authors: [{ name: 'شاورما السوري' }],
  icons: {
    icon: '/icons/android-icon-192x192.png',
    shortcut: '/icons/android-icon-192x192.png',
    apple: '/icons/android-icon-192x192.png',
  },
  openGraph: {
    title: 'شاورما السوري - أفضل شاورما سورية أصلية',
    description:
      'استمتع بأفضل شاورما سورية أصلية في شاورما السوري. تصفح قائمتنا، اطلب الآن، واستمتع بمذاق الشاورما الحقيقي!',
    url: 'https://shawarma-syrian.vercel.app',
    siteName: 'شاورما السوري',
    images: [
      {
        url: 'https://shawarma-syrian.vercel.app/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'شاورما سورية أصلية من شاورما السوري',
      },
    ],
    locale: 'ar',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'شاورما السوري - أفضل شاورما سورية أصلية',
    description:
      'استمتع بأفضل شاورما سورية أصلية في شاورما السوري. تصفح قائمتنا، اطلب الآن، واستمتع بمذاق الشاورما الحقيقي!',
    images: ['https://shawarma-syrian.vercel.app/og-image.jpg'],
    site: '@shawarma_syrian',
    creator: '@shawarma_syrian',
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'شاورما السوري',
    startupImage: [
      '/icons/android-icon-192x192.png',
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
  themeColor: '#f59e0b',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    name: 'شاورما السوري',
    description: 'أفضل شاورما سورية أصلية في المدينة، تقدم مجموعة متنوعة من الشاورما والوجبات السورية.',
    url: 'https://shawarma-syrian.vercel.app',
    logo: 'https://shawarma-syrian.vercel.app/logo.png',
    image: 'https://shawarma-syrian.vercel.app/og-image.jpg',
    telephone: '+2010 60462862',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'شارع ابراهيم مغازي - بجوار فوري',
      addressLocality: 'كفر الشيخ',
      addressRegion: 'كفر الشيخ',
      postalCode: '33511',
      addressCountry: 'EG',

    },
    openingHours: 'Mo-Su 11:00-23:00',
    servesCuisine: 'سورية',
    priceRange: '$$',
    acceptsReservations: 'false',
    hasMenu: 'https://shawarma-syrian.vercel.app/menu',
  };

  return (
    <html lang="ar" dir="rtl">
      <head>
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
        <link rel="preconnect" href="https://shawarma-syrian.vercel.app" />

        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />

        {/* ميتا تاغز إضافية لدعم PWA */}
        <meta name="mobile-web-app-capable" content="yes"/>
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className="bg-[var(--foreground)] text-white font-cairo">
        <CartProvider>
          <Navbar aria-label="التنقل الرئيسي" />
          <InstallButton />
          <main>{children}</main>
          <Footer aria-label="تذييل الموقع" />
          <Toaster richColors position="top-center" duration={3000} closeButton />
        </CartProvider>
      </body>
    </html>
  );
}