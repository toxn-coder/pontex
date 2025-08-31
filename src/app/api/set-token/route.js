// src/app/api/set-token/route.js
export const runtime = 'nodejs';
import { NextResponse } from 'next/server';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

// التحقق من متغيرات البيئة
const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

if (!projectId || !clientEmail || !privateKey) {
  console.error('Missing Firebase credentials');
  throw new Error('Missing required Firebase credentials in environment variables');
}

// ✅ لازم تهيئ التطبيق أولاً
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId,
      clientEmail,
      privateKey,
    }),
  });
}

// بعد التهيئة نقدر نستدعي Firestore و Auth
const auth = getAuth();
const db = getFirestore();

export async function POST(request) {
  try {
    const { idToken } = await request.json();
    if (!idToken) {
      return NextResponse.json({ error: 'No token provided' }, { status: 400 });
    }

    // التحقق من التوكن
    const decodedToken = await auth.verifyIdToken(idToken);
    const uid = decodedToken.uid;

    // جلب دور المستخدم من Firestore
    const userDoc = await db.collection('users').doc(uid).get();
    if (!userDoc.exists) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userData = userDoc.data();
    const role = userData.role;

    // التحقق من أن الدور صحيح
    if (!['admin', 'supervisor'].includes(role)) {
      return NextResponse.json({ error: 'Unauthorized role' }, { status: 403 });
    }

    // إنشاء الرد مع إعدادات كوكيز محسنة لـ Vercel
    const response = NextResponse.json({ 
      message: 'Token verified', 
      uid,
      role 
    });

    // إعدادات الكوكيز المحسنة لـ Vercel
    const isProduction = process.env.NODE_ENV === 'production';
    
    response.cookies.set('token', idToken, {
      httpOnly: true,
      secure: isProduction, // true في الإنتاج، false في التطوير
      sameSite: isProduction ? 'none' : 'lax', // مهم لـ Vercel
      path: '/',
      maxAge: 60 * 60 * 24, // 24 ساعة
    });

    // منع التخزين المؤقت
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');

    return response;
  } catch (error) {
    console.error('Error in set-token:', error);
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }
}
