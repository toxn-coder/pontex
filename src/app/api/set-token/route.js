// app/api/set-token/route.js
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { auth, adminDb } from "../../../lib/firebase/firebase-admin";

export async function POST(request) {
  try {
    const { idToken } = await request.json();
    if (!idToken) {
      return NextResponse.json({ error: "No token provided" }, { status: 400 });
    }

    // 🟢 التحقق من التوكن
    const decodedToken = await auth.verifyIdToken(idToken);
    const uid = decodedToken.uid;

    // 🟢 جلب الدور من Firestore
    const userDoc = await adminDb.doc(`users/${uid}`).get();
    if (!userDoc.exists) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userData = userDoc.data();
    const role = userData?.role || "none";

    // 🟢 التحقق من الدور
    if (!["admin", "supervisor"].includes(role)) {
      return NextResponse.json({ error: "Unauthorized role" }, { status: 403 });
    }

    // 🟢 إعداد الكوكيز
    const response = NextResponse.json({
      message: "Token verified",
      uid,
      role,
    });

    const isProduction = process.env.NODE_ENV === "production";

    response.cookies.set("token", idToken, {
      httpOnly: true,
      secure: isProduction, // 🟢 https فقط بالـ production
      sameSite: isProduction ? "none" : "lax",
      path: "/",
      maxAge: 60 * 60 * 24, // 24 ساعة
    });

    // 🟢 منع التخزين المؤقت
    response.headers.set(
      "Cache-Control",
      "no-cache, no-store, must-revalidate"
    );
    response.headers.set("Pragma", "no-cache");
    response.headers.set("Expires", "0");

    console.log("✅ Token set successfully for user:", uid, "role:", role);
    return response;
  } catch (error) {
    if (error.code === "auth/id-token-expired") {
      return NextResponse.json({ error: "Token expired" }, { status: 401 });
    }

    if (error.code === "auth/argument-error") {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    console.error("❌ Error in set-token:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// منع GET
export async function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
