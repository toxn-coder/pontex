import { NextResponse } from "next/server";

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // حماية مسارات /auth/dashboard فقط
  if (pathname.startsWith("/auth/dashboard")) {
    const idToken = request.cookies.get("token")?.value;

    // ❌ لا يوجد توكن → توجيه لصفحة تسجيل الدخول
    if (!idToken) {
      return NextResponse.redirect(new URL("/auth", request.url));
    }

    // ✅ لا نتحقق بالتوكن هنا (لأننا على Edge runtime)
    // فقط نمرره، والتحقق يتم في الـ API عند الطلبات المحمية
    return NextResponse.next();
  }

  // السماح لبقية المسارات
  return NextResponse.next();
}

export const config = {
  matcher: ["/auth/dashboard", "/auth/dashboard/:path*"],
};
