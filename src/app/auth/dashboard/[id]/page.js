import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/app/api/firebase';
import DialogAddProduct from '@/components/DialogAddProduct';
import ProductList from '@/components/ProductList';
import BestSellersManager from '@/components/BestSellersManager';

export default async function Page({ params }) {
  const decodedId = decodeURIComponent(params.id);

  const docRef = doc(db, 'menuParts', decodedId);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    return <div className="p-4 text-red-500 text-center">لم يتم العثور على القسم المطلوب</div>;
  }

  const data = docSnap.data();

  // إذا كان القسم هو "الأكثر مبيعًا"، نعرض BestSellersManager فقط
  if (decodedId === 'الأكثر مبيعًا') {
    return (
      <div className="p-4 bg-[var(--clr-primary)]">
        <h2 className="text-2xl font-bold mb-4 text-center">{decodedId}</h2>
        <BestSellersManager />
      </div>
    );
  }

  // إذا لم يكن القسم "الأكثر مبيعًا"، نعرض المكونات الأخرى
  return (
    <div className="p-4 bg-[var(--clr-primary)]">
      <h2 className="text-2xl font-bold mb-4 text-center">{decodedId}</h2>
      <DialogAddProduct sectionId={decodedId} />
      <ProductList sectionId={decodedId} />
    </div>
  );
}