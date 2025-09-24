import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Utility to extract publicId from URL
function extractPublicId(url: string): string | null {
  try {
    const withoutQuery = url.split("?")[0];
    const uploadIndex = withoutQuery.indexOf("/upload/");
    if (uploadIndex === -1) return null;
    const publicPath = withoutQuery.substring(uploadIndex + "/upload/".length);
    const versionMatch = publicPath.match(/^v\d+\//);
    const cleanPath = versionMatch ? publicPath.replace(/^v\d+\//, "") : publicPath;
    const dotIndex = cleanPath.lastIndexOf(".");
    return dotIndex > -1 ? cleanPath.slice(0, dotIndex) : cleanPath;
  } catch (e) {
    console.error("extractPublicId error:", e);
    return null;
  }
}

export async function POST(req: Request) {
  try {
    const { publicId, url } = await req.json();

    // Validate environment variables
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      return NextResponse.json(
        { error: "Cloudinary configuration is missing" },
        { status: 500 }
      );
    }

    let finalPublicId = publicId;
    if (!finalPublicId && url) {
      finalPublicId = extractPublicId(url);
    }

    if (!finalPublicId) {
      return NextResponse.json(
        { error: "لم يتم العثور على publicId", details: { url, publicId } },
        { status: 400 }
      );
    }

    const res = await cloudinary.uploader.destroy(finalPublicId, {
      resource_type: "image",
      invalidate: true, // Invalidate CDN cache
    });

    if (res.result !== "ok") {
      return NextResponse.json(
        { error: "فشل الحذف من Cloudinary", details: res },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, result: res });
  } catch (error: any) {
    console.error("Cloudinary delete error:", error);
    return NextResponse.json(
      {
        error: "فشل الحذف",
        details: error.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}