// app/api/infoapp/route.js
import { NextResponse } from "next/server";
import { adminDb } from "../../../lib/firebase/firebase-admin";


export async function GET() {
  try {
    const docRef = adminDb.collection("infoApp").doc("main");
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    return NextResponse.json(docSnap.data());
  } catch (err) {
    console.error("Error fetching infoApp:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
