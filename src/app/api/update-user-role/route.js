import { db } from '@/app/api/firebase'; // تأكد من مسار الفايربيز
import { doc, updateDoc } from 'firebase/firestore';

export async function POST(req) {
  try {
    const { uid, newRole } = await req.json();

    if (!uid || !newRole) {
      return new Response(JSON.stringify({ error: 'مطلوب uid و newRole' }), { status: 400 });
    }

    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, { role: newRole });

    return new Response(JSON.stringify({ message: 'تم تحديث الدور بنجاح' }), { status: 200 });
  } catch (error) {
    console.error('خطأ في التحديث:', error);
    return new Response(JSON.stringify({ error: 'خطأ في السيرفر: ' + error.message }), { status: 500 });
  }
}
