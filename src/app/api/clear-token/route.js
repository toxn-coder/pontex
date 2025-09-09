import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const response = NextResponse.json({ success: true });

    const isProduction = process.env.NODE_ENV === 'production';

    // حذف الكوكي بنفس الإعدادات المستخدمة عند إنشائه
    response.cookies.set('token', '', {
      httpOnly: true,
      secure: isProduction ?? true, // افتراض HTTPS في الإنتاج إذا لم يكن NODE_ENV مُعرفًا
      sameSite: isProduction ? 'none' : 'lax',
      path: '/',
      maxAge: 0,
      expires: new Date(0),
    });

    console.log('Token cookie cleared successfully'); // تسجيل للتصحيح

    return response;
  } catch (error) {
    console.error('Error clearing token cookie:', error);
    return NextResponse.json({ success: false, error: 'Failed to clear token' }, { status: 500 });
  }
}

// معالجة الطلبات غير المدعومة (مثل GET)
export async function GET() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}