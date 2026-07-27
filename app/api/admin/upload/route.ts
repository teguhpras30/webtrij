import { NextResponse } from "next/server";
import { getAuthenticatedAdmin } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(req: Request) {
  const user = await getAuthenticatedAdmin();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "Tidak ada file yang diunggah" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Filter valid image types and size limit (Max 1MB)
    const MAX_FILE_SIZE = 1 * 1024 * 1024; // 1MB
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "Ukuran file gambar melebihi batas 1MB. Harap gunakan gambar bernilai <= 1MB." }, { status: 400 });
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml", "image/avif"];
    if (file.type && !allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "Format file tidak didukung. Harap unggah file gambar (JPG, PNG, WEBP, GIF)." }, { status: 400 });
    }

    // Create unique filename
    const ext = path.extname(file.name) || ".jpg";
    const sanitizedBaseName = path.basename(file.name, ext).replace(/[^a-zA-Z0-9_-]/g, "");
    const fileName = `${Date.now()}-${sanitizedBaseName || "image"}${ext}`;

    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });

    const filePath = path.join(uploadDir, fileName);
    await writeFile(filePath, buffer);

    const publicUrl = `/uploads/${fileName}`;

    return NextResponse.json({ url: publicUrl, fileName });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: error?.message || "Gagal mengunggah file gambar." }, { status: 500 });
  }
}
