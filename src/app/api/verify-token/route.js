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

    // إنشاء الرد مع الكوكي
    const response = NextResponse.json({ uid, role });
    response.cookies.set('token', idToken, {
      httpOnly: true,   // ما ينقراش من JavaScript
      secure: true,     // ضروري في HTTPS
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 24, // يوم كامل
    });

    return response;
  } catch (error) {
    console.error('Token verification error:', error);
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }
}
