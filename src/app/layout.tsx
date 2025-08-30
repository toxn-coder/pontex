import Cart from '@/components/Cart';
import Footer from '@/components/Footer';
import InstallButton from '@/components/InstallButton';
import Navbar from '@/components/NavBar';
import NotificationListener from '@/components/NotificationListener';
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
    description: `${appInfo.name}`,
    openGraph: {
      title: `${appInfo.name} - افضل المنتجات و الخدمات`,
      images: [
        {
          url: appInfo.logoUrl,
          width: 1200,
          height: 630,
          alt: `${appInfo.name}`,
        },
      ],
    },
    icons: {
      icon: appInfo.logoUrl,
    },
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const appInfo = await loadInfoApp();

  // ✅ هنا بنستخدم headers() جوة الـ async function
  const headersList = headers();
  const host = headersList.get('host');
  const protocol = headersList.get('x-forwarded-proto') || 'http';
  const fullUrl = `${protocol}://${host}`;

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    name: appInfo.name,
    description: `${appInfo.name}`,
    url: fullUrl,
    logo: appInfo.logoUrl,
    image: appInfo.imageHero,
    telephone: '+2010 60462862',
  };

  return (
    <html lang="ar" dir="rtl">
      <head>
        <title>{appInfo.name} - أفضل شاورما القاهرة أصلية</title>
        <link rel="icon" href={appInfo.logoUrl} sizes="any" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body className="bg-[var(--foreground)] text-white font-cairo">
        <CartProvider>
          <Navbar name={appInfo.name} logoUrl={appInfo.logoUrl} aria-label="التنقل الرئيسي" />
          <InstallButton />
          <main>{children}</main>
          <Footer name={appInfo.name} logoUrl={appInfo.logoUrl} aria-label="تذييل الموقع" />
          <Cart />
          <NotificationListener />
          <Toaster richColors position="top-center" duration={3000} closeButton />
        </CartProvider>
      </body>
    </html>
  );
}
