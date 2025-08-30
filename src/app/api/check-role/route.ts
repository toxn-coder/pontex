import { auth } from "@/app/api/firebase-admin"; 
import { getFirestore } from "firebase-admin/firestore";
import cloudinary from "cloudinary";
import { cookies } from "next/headers"; // ✅

const db = getFirestore();

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function DELETE(req: Request) {
  try {
    const cookieStore = await cookies(); // ✅ لازم await
    const token = cookieStore.get("token")?.value; 

    if (!token) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    const decoded = await auth.verifyIdToken(token);

    // 🔹 السماح فقط للأدمن
    if (decoded.role !== "admin") {
      return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403 });
    }

    const { docId, imagePublicId } = await req.json();

    // 1️⃣ حذف من Cloudinary
    if (imagePublicId) {
      await cloudinary.v2.uploader.destroy(imagePublicId);
    }

    // 2️⃣ حذف من Firestore
    await db.collection("users").doc(docId).delete();

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
