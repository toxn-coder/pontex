export const runtime = 'nodejs';
import { NextResponse } from 'next/server';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

// التحقق من متغيرات البيئة
const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

console.log('Firebase credentials loaded:', {
  projectId,
  clientEmail,
  privateKey: privateKey ? 'Defined' : 'Undefined',
});

if (!projectId || !clientEmail || !privateKey) {
  console.error('Missing Firebase credentials:', {
    projectId,
    clientEmail,
    privateKey: privateKey ? 'Defined' : 'Undefined',
  });
  throw new Error('Missing required Firebase credentials in environment variables');
}

if (!getApps().length) {
  console.log('Initializing Firebase Admin...');
  try {
    initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });
  } catch (error) {
    console.error('Error initializing Firebase Admin:', error);
    throw error;
  }
}

const auth = getAuth();

export async function POST(request) {
  try {
    const { idToken } = await request.json();
    if (!idToken) {
      return NextResponse.json({ error: 'No token provided' }, { status: 400 });
    }

    const decodedToken = await auth.verifyIdToken(idToken);
    const uid = decodedToken.uid;

    const response = NextResponse.json({ message: 'Token verified', uid });
    response.cookies.set('token', idToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24, // 24 ساعة
    });

    return response;
  } catch (error) {
    console.error('Error in set-token:', error);
    return NextResponse.json({ error: 'Invalid token' }, { status: 400 });
  }
}