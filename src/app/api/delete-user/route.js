export const runtime = 'nodejs';
import { NextResponse } from 'next/server';
import { auth } from '@/app/api/firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';

const db = getFirestore();

export async function DELETE(request) {
  try {
    const { uid } = await request.json();
    if (!uid) {
      return NextResponse.json({ error: 'Missing UID' }, { status: 400 });
    }

    // حذف المستخدم من Firebase Authentication
    await auth.deleteUser(uid);

    // حذف بيانات المستخدم من Firestore
    await db.collection('users').doc(uid).delete();

    return NextResponse.json({ message: 'User deleted' });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}