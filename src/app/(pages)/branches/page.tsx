import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/app/api/firebase';
import Head from 'next/head';
import Link from 'next/link';
import ProgressAnim from '@/components/ProgressAnim';
import BranchFilter from '@/components/BranchFilter';

// واجهة الفروع
interface Branch {
  id: string;
  name: string;
  address: string;
  phone: string;
  workingHours: string;
  image: string; // صورة واحدة لكل فرع
}

export default async function BranchesPage() {
  // جلب بيانات الفروع من Firestore
  const branchesCollection = collection(db, 'branches');
  const branchesSnapshot = await getDocs(branchesCollection);
  if (!branchesSnapshot) {
    return <ProgressAnim />;
  }

  const branchesList: Branch[] = branchesSnapshot.docs.map((doc) => ({
    id: doc.id,
    name: doc.data().name || 'فرع بدون اسم',
    address: doc.data().address || 'عنوان غير محدد',
    phone: doc.data().phone || 'رقم غير متوفر',
    workingHours: doc.data().workingHours || 'ساعات عمل غير محددة',
    image: doc.data().image || '/placeholder.svg',
  }));

  return (
    <div className="min-h-screen bg-[var(--clr-primary)] py-8 px-4 sm:px-6" dir="rtl">
      <Head>
        <title>فروع مطعم والي دمشق</title>
        <meta
          name="description"
          content="تعرف على فروع مطعم والي دمشق، مواقعها، أرقام التواصل، وساعات العمل."
        />
        <meta name="keywords" content="فروع, مطعم والي دمشق, شاورما, أكل سوري" />
        <meta property="og:title" content="فروع مطعم والي دمشق" />
        <meta
          property="og:description"
          content="تعرف على فروع مطعم والي دمشق، مواقعها، أرقام التواصل، وساعات العمل."
        />
        <meta property="og:image" content="/logo.png" />
        <meta property="og:url" content="https://waly-damascus.vercel.app/branches" />
        <meta property="og:type" content="website" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta charSet="UTF-8" />
      </Head>

      <div className="max-w-6xl mx-auto">
        <Link
          href="/"
          className="text-yellow-500 hover:underline mb-6 block text-lg font-medium text-right"
          aria-label="العودة إلى الصفحة الرئيسية"
        >
          العودة إلى الصفحة الرئيسية
        </Link>

        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-8 text-center">
          فروع <span className="text-yellow-500">مطعم والي دمشق</span>
        </h1>

        {branchesList.length === 0 ? (
          <p className="text-gray-300 text-center text-lg" role="alert">
            لا توجد فروع متاحة حاليًا.
          </p>
        ) : (
          <BranchFilter branches={branchesList} />
        )}
      </div>
    </div>
  );
}