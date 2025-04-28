export const runtime = 'nodejs';
import { NextResponse } from 'next/server';
import { auth } from '@/app/api/firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';

const db = getFirestore();

export async function POST(request) {
  try {
    const { idToken } = await request.json();
    if (!idToken) {
      return NextResponse.json({ error: 'No token provided' }, { status: 400 });
    }

    const decodedToken = await auth.verifyIdToken(idToken);
    const uid = decodedToken.uid;
    const userDoc = await db.collection('users').doc(uid).get();

    if (!userDoc.exists) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const role = userDoc.data().role;
    console.log('User UID:', uid, 'Role:', role); // أضف هذا السطر للتسجيل

    if (!['admin', 'supervisor'].includes(role)) {
      return NextResponse.json({ error: 'Unauthorized role' }, { status: 403 });
    }

    return NextResponse.json({ uid, role });
  } catch (error) {
    console.error('Token verification error:', error);
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }
}