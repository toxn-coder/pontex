import Cart from '@/components/Cart';
import Footer from '@/components/Footer';
// import InstallButton from '@/components/InstallButton';
import Navbar from '@/components/NavBar';
import type { Metadata } from 'next';
import { Toaster } from 'sonner';
import { CartProvider } from './CartContext';
import './globals.css';
import { loadInfoApp } from '@/components/infoApp';
import { headers } from 'next/headers';

export async function generateMetadata(): Promise<Metadata> {
  const appInfo = await loadInfoApp();

  return {
    title: `${appInfo.name} - افضل المنتجات والخدمات`,
    description: `${appInfo.name,'رواد في صناعة الأقمشة القطنية'}`,
    openGraph: {
      title: `${appInfo.name} - افضل المنتجات و الخدمات`,
      description: `${appInfo.name ,"رواد في صناعة الأقمشة القطنية"}`,
      url: '/',
      type: 'website',
      images: [
        {
          url: appInfo.logoUrl,
          width: 1200,
          height: 630,
          alt: `${appInfo.name}`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      site: '@your_twitter', // بدّلها بحسابك لو عندك
      title: `${appInfo.name} - افضل المنتجات والخدمات`,
      description: `${appInfo.name,'رواد في صناعة الأقمشة القطنية'}`,
      images: [appInfo.logoUrl],
    },
    icons: {
      icon: appInfo.logoUrl,
      apple: appInfo.logoUrl,
    },
    // manifest: '/manifest.json',
  };
}



export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const appInfo = await loadInfoApp();

  // ✅ headers مع fallback لو ناقص
  const headersList = await headers();
  const host = headersList.get('host') || 'example.com';
  const protocol = headersList.get('x-forwarded-proto') || 'https';
  const fullUrl = `${protocol}://${host}`;

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Store',
    name: appInfo.name,
    description: `${appInfo.name}`,
    url: fullUrl,
    logo: appInfo.logoUrl,
    image: appInfo.imageHero,
    telephone: '+201032334587',
  };

  return (
    <html lang="ar" dir="rtl">
      <head>
        <title>{`${appInfo.name} - لبيع جميع انواع الأقمشة`}</title>
        
        {/* ✅ meta tags الأساسية */}
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <meta name="theme-color" content="#000000" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content={appInfo.name} />
        <meta name="application-name" content={appInfo.name} />
        <meta name="description" content={`${appInfo.name}`} />

        {/* أيقونات */}
        <link rel="icon" href={appInfo.logoUrl} sizes="any" />
        <link rel="apple-touch-icon" href={appInfo.logoUrl} />
        {/* <link rel="manifest" href="/manifest.json" /> */}

        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body className="bg-[var(--foreground)] text-white font-cairo">
        <CartProvider>
          <Navbar name={appInfo.name} logoUrl={appInfo.logoUrl} aria-label="التنقل الرئيسي" />
          {/* <InstallButton /> */}
          <main>{children}</main>
          <Footer name={appInfo.name} logoUrl={appInfo.logoUrl} aria-label="تذييل الموقع" />
          <Cart />

          <Toaster richColors position="top-center" duration={3000} closeButton />
        </CartProvider>
      </body>
    </html>
  );
}
