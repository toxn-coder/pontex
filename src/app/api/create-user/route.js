export const runtime = 'nodejs';
import { NextResponse } from 'next/server';
import { auth } from '../../../lib/firebase/firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';

const db = getFirestore();

export async function POST(request) {
  try {
    const { email, password, role } = await request.json();
    if (!email || !password || !role) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!['admin', 'supervisor'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    // إنشاء مستخدم جديد في Firebase Authentication
    const userRecord = await auth.createUser({
      email,
      password,
    });

    // إضافة بيانات المستخدم إلى Firestore
    await db.collection('users').doc(userRecord.uid).set({
      email,
      role,
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ message: 'User created', uid: userRecord.uid });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}