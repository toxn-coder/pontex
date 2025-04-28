// firebase-admin.js

import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

// التحقق من متغيرات البيئة
const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

if (!projectId || !clientEmail || !privateKey) {
  console.error('Missing Firebase Admin credentials:', {
    projectId,
    clientEmail,
    privateKey: privateKey ? 'Defined' : 'Undefined',
  });
  throw new Error('Missing required Firebase Admin credentials in environment variables');
}

if (!getApps().length) {
  console.log('Initializing Firebase Admin...');
  initializeApp({
    credential: cert({
      projectId,
      clientEmail,
      privateKey,
    }),
  });
}

const auth = getAuth();
const adminDb = getFirestore();

export { auth, adminDb };
