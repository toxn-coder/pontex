export const runtime = 'nodejs';
import { NextResponse } from 'next/server';
import { auth } from '../../../lib/firebase/firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';

const db = getFirestore();

export async function GET(request) {
  try {
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    let decodedToken;
    try {
      decodedToken = await auth.verifyIdToken(token);
    } catch (err) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }

    const uid = decodedToken.uid;
    const userDoc = await db.collection('users').doc(uid).get();

    if (!userDoc.exists || userDoc.data().role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const usersSnapshot = await db.collection('users').get();
    const users = usersSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        uid: doc.id,
        email: data.email,
        role: data.role,
      };
    });

    // إزالة أي تكرار
    const uniqueUsers = users.filter(
      (user, index, self) => index === self.findIndex(u => u.uid === user.uid)
    );

    return NextResponse.json(uniqueUsers);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}
