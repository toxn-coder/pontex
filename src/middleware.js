import { NextResponse } from 'next/server';

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  console.log(`Middleware triggered for path: ${pathname}`);

  if (pathname === '/auth/dashboard' || pathname.startsWith('/auth/dashboard/')) {
    console.log('Checking authentication for /auth/dashboard...');
    const idToken = request.cookies.get('token')?.value;

    if (!idToken) {
      console.log('No idToken found, redirecting to /auth');
      return NextResponse.redirect(new URL('/auth', request.url));
    }

    try {
      const url = request.nextUrl.clone();
      url.pathname = '/api/verify-token'; // بدون origin

      const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/verify-token`, {

        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      });

      if (!response.ok) {
        console.log('Token verification failed, redirecting to /auth');
        return NextResponse.redirect(new URL('/auth', request.url));
      }

      const { uid, role } = await response.json();
      console.log(`User UID: ${uid}, Role: ${role}`);

      if (!['admin', 'supervisor'].includes(role)) {
        console.log('Invalid role, redirecting to /auth');
        return NextResponse.redirect(new URL('/auth', request.url));
      }

      console.log('User authorized, proceeding...');
      const nextResponse = NextResponse.next();
      nextResponse.headers.set('x-user-id', uid);
      nextResponse.headers.set('x-user-role', role);
      return nextResponse;
    } catch (error) {
      console.error('Middleware error:', error);
      console.log('Error occurred, redirecting to /auth');
      return NextResponse.redirect(new URL('/auth', request.url));
    }
  }

  console.log('Allowing access to non-protected path');
  return NextResponse.next();
}

export const config = {
  matcher: ['/auth/dashboard', '/auth/dashboard/:path*'],
};
