import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/app/api/firebase';
import DialogAddProduct from '@/components/DialogAddProduct';
import ProductList from '@/components/ProductList';

export default async function Page({ params }) {
  const decodedId = decodeURIComponent(params.id); // ✅ الحل هنا

  const docRef = doc(db, 'menuParts', decodedId);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    return <div className="p-4 text-red-500 text-center">لم يتم العثور على القسم المطلوب</div>;
  }

  const data = docSnap.data();

  return (
    <div className="p-4 bg-[var(--clr-primary)] ">
      <h2 className="text-2xl font-bold mb-4 text-center">{decodedId}</h2>
      <DialogAddProduct sectionId={decodedId} />
      <ProductList sectionId={decodedId} />
    </div>
  );
}
