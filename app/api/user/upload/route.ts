import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "Tidak ada file yang diunggah" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const isVideo = file.type?.startsWith("video/");
    const MAX_FILE_SIZE = isVideo ? 50 * 1024 * 1024 : 10 * 1024 * 1024; // 50MB for video, 10MB for photo
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `Ukuran file ${isVideo ? 'video' : 'foto'} melebihi batas (Maksimal ${isVideo ? '50MB' : '10MB'}).` },
        { status: 400 }
      );
    }

    const allowedTypes = [
      "image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml", "image/heic",
      "video/mp4", "video/webm", "video/quicktime", "video/x-msvideo", "video/mkv", "video/3gpp"
    ];
    if (file.type && !allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Format file tidak didukung. Harap unggah foto (JPG, PNG, WEBP) atau video (MP4, WEBM, MOV)." },
        { status: 400 }
      );
    }

    // Create unique filename
    const ext = path.extname(file.name) || (isVideo ? ".mp4" : ".jpg");
    const sanitizedBaseName = path.basename(file.name, ext).replace(/[^a-zA-Z0-9_-]/g, "");
    const fileName = `review-${Date.now()}-${sanitizedBaseName || "media"}${ext}`;

    const uploadDir = path.join(process.cwd(), "public", "uploads", "reviews");
    await mkdir(uploadDir, { recursive: true });

    const filePath = path.join(uploadDir, fileName);
    await writeFile(filePath, buffer);

    const publicUrl = `/uploads/reviews/${fileName}`;

    return NextResponse.json({
      url: publicUrl,
      fileName,
      type: isVideo ? "video" : "image",
    });
  } catch (error: any) {
    console.error("User upload error:", error);
    return NextResponse.json(
      { error: error?.message || "Gagal mengunggah file media." },
      { status: 500 }
    );
  }
}
