import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/NavBar';
import Footer from '@/components/Footer';
import { Toaster } from 'sonner';
import { CartProvider } from './CartContext';

export const metadata: Metadata = {
  title: 'شاورما السوري - أفضل شاورما سورية أصلية في المدينة',
  description:
    'استمتع بأفضل شاورما سورية أصلية في شاورما السوري. تصفح قائمتنا، اطلب الآن، واستمتع بمذاق الشاورما الحقيقي!',
  keywords: 'شاورما, شاورما سورية, مطعم شاورما, أفضل شاورما, طعام سوري, مطاعم المدينة',
  authors: [{ name: 'شاورما السوري' }],
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
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
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
  ],
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'شاورما السوري',
    startupImage: [
      '/apple-touch-icon.png',
      '/apple-touch-icon-120x120.png',
      '/apple-touch-icon-152x152.png',
      '/apple-touch-icon-167x167.png',
      '/apple-touch-icon-180x180.png',
    ],
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: 'cover',
  },
  robots: {
    index: true,
    follow: true,
    maxSnippet: -1,
    maxImagePreview: 'large',
    maxVideoPreview: -1,
  },
};

export default function RootLayout({ children }) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    name: 'شاورما السوري',
    description: 'أفضل شاورما سورية أصلية في المدينة، تقدم مجموعة متنوعة من الشاورما والوجبات السورية.',
    url: 'https://shawarma-syrian.vercel.app',
    logo: 'https://shawarma-syrian.vercel.app/logo.png',
    image: 'https://shawarma-syrian.vercel.app/og-image.jpg',
    telephone: '+1234567890',
    address: {
      '@type': 'PostalAddress',
      streetAddress: '123 شارع الشاورما',
      addressLocality: 'المدينة',
      addressCountry: 'SY',
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

        <link
          rel="preconnect"
          href="https://fonts.googleapis.com"
          crossOrigin="anonymous"
        />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
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
      </head>
      <body className="bg-[var(--foreground)] text-white font-cairo">
        <CartProvider>
            <Navbar aria-label="التنقل الرئيسي" />
          <main>{children}</main>
          <footer>
            <Footer aria-label="تذييل الموقع" />
          </footer>
          <Toaster richColors position="top-center" duration={3000} closeButton />
        </CartProvider>
      </body>
    </html>
  );
}