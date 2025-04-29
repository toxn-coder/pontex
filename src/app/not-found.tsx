import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--clr-primary)] font-cairo">
      <div className="text-center bg-gray-700 rounded-2xl shadow-xl p-8 max-w-md mx-auto">
        <h2 className="text-3xl font-bold text-white mb-4">الصفحة غير موجودة</h2>
        <p className="text-lg text-gray-300 mb-6">لم نتمكن من العثور على المورد المطلوب.</p>
        <Link href="/">
          <button className="bg-amber-600 text-white px-6 py-3 rounded-full text-lg font-medium shadow hover:bg-amber-700 transition-colors duration-200">
            العودة إلى الصفحة الرئيسية
          </button>
        </Link>
      </div>
    </div>
  );
}