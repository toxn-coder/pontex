import { NextResponse } from "next/server";

export function middleware(request) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/auth/dashboard")) {
    const idToken = request.cookies.get("token")?.value;

    // إذا مافي توكن → يوجّه لتسجيل الدخول
    if (!idToken) {
      return NextResponse.redirect(new URL("/auth", request.url));
    }

    // ✅ ما نتحقق من التوكن هنا (لأن firebase-admin ممنوع في Edge)
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/auth/dashboard", "/auth/dashboard/:path*"],
};
