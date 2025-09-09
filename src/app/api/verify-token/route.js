// src/app/api/verify-token/route.js

import { NextResponse } from 'next/server';
import { auth } from '../../../lib/firebase/firebase-admin'; // 👈 تأكد أنك مستدعي firebase-admin من lib
import { getFirestore } from 'firebase-admin/firestore';

export const runtime = 'nodejs'; // 👈 ضروري عشان firebase-admin يشتغل

const db = getFirestore();

export async function POST(request) {
  try {
    const { idToken } = await request.json();

    if (!idToken) {
      return NextResponse.json({ error: 'No token provided' }, { status: 400 });
    }

    // 🟢 تحقق من التوكن
    const decodedToken = await auth.verifyIdToken(idToken);
    const uid = decodedToken.uid;

    // 🟢 اجلب بيانات المستخدم من Firestore
    const userDoc = await db.collection('users').doc(uid).get();
    if (!userDoc.exists) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const role = userDoc.data().role;

    // 🟢 جهز الكوكي
    const isProduction = process.env.NODE_ENV === 'production';
    const response = NextResponse.json({ uid, role });

    response.cookies.set('token', idToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      path: '/',
      maxAge: 60 * 60 * 24, // يوم كامل
    });

    response.headers.set(
      'Cache-Control',
      'no-cache, no-store, must-revalidate'
    );

    return response;
  } catch (error) {
    console.error('❌ Token verification error:', error);
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }
}
