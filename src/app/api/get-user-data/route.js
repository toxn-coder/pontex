// src/app/api/get-user-data/route.js

export const runtime = 'nodejs';
import { NextResponse } from 'next/server';
import { auth } from '@/app/api/firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';

const db = getFirestore();

export async function GET(request) {
  try {
    // طرق متعددة للحصول على التوكن
    let token = request.cookies.get('token')?.value;
    
    // إذا لم نجد الكوكي، جرب الـ Authorization header
    if (!token) {
      const authHeader = request.headers.get('authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }

    if (!token) {
      console.log('No token found in cookies or headers');
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    console.log('Token found, verifying...');

    // التحقق من التوكن
    const decodedToken = await auth.verifyIdToken(token);
    const uid = decodedToken.uid;

    console.log('Token verified for user:', uid);

    // جلب بيانات المستخدم من Firestore
    const userDoc = await db.collection('users').doc(uid).get();
    if (!userDoc.exists) {
      console.log('User document not found for uid:', uid);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userData = userDoc.data();
    const role = userData.role;

    console.log('User role:', role);

    if (!['admin', 'supervisor'].includes(role)) {
      return NextResponse.json({ error: 'Unauthorized role' }, { status: 403 });
    }

    const response = NextResponse.json({ userId: uid, userRole: role });
    
    // إضافة headers للتأكد من عدم التخزين المؤقت
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    
    return response;
  } catch (error) {
    console.error('Error in get-user-data:', error);
    return NextResponse.json({ 
      error: 'Invalid token',
      details: error.message 
    }, { status: 401 });
  }
}

// ===================================================