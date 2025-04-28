export const runtime = 'nodejs';
import { NextResponse } from 'next/server';
import { auth } from '@/app/api/firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';

const db = getFirestore();

export async function GET(request) {
  try {
    // جلب ملف تعريف الارتباط "token"
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    // التحقق من التوكن
    const decodedToken = await auth.verifyIdToken(token);
    const uid = decodedToken.uid;

    // جلب بيانات المستخدم من Firestore
    const userDoc = await db.collection('users').doc(uid).get();
    if (!userDoc.exists) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const role = userDoc.data().role;
    if (!['admin', 'supervisor'].includes(role)) {
      return NextResponse.json({ error: 'Unauthorized role' }, { status: 403 });
    }

    return NextResponse.json({ userId: uid, userRole: role });
  } catch (error) {
    console.error('Error in get-user-data:', error);
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }
}