import { NextResponse } from "next/server";
import { getAuthenticatedAdmin } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import sharp from "sharp";

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

    const isVideo = file.type?.startsWith("video/");
    const isSvg = file.type === "image/svg+xml" || file.name.endsWith(".svg");
    const MAX_FILE_SIZE = isVideo ? 50 * 1024 * 1024 : 15 * 1024 * 1024; // 50MB video, 15MB image
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `Ukuran file ${isVideo ? "video" : "gambar"} melebihi batas (Max ${isVideo ? "50MB" : "15MB"}).` },
        { status: 400 }
      );
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
      "image/svg+xml",
      "image/avif",
      "video/mp4",
      "video/webm",
      "video/quicktime",
      "video/x-msvideo",
      "video/mkv",
    ];
    if (file.type && !allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Format file tidak didukung. Harap unggah gambar (JPG, PNG, WEBP) atau video (MP4, WEBM, MOV)." },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });

    const customName = formData.get("productName") || formData.get("title") || formData.get("name");
    
    function slugifyFileName(str: string): string {
      const ext = path.extname(str);
      const base = ext ? path.basename(str, ext) : str;

      const cleaned = base
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9\s_-]/g, "")
        .trim()
        .replace(/[\s_]+/g, "-")
        .replace(/-+/g, "-");

      return cleaned || "produk";
    }

    let baseSlug = "";
    if (typeof customName === "string" && customName.trim()) {
      baseSlug = slugifyFileName(customName);
    } else {
      baseSlug = slugifyFileName(file.name);
    }

    const uniqueSuffix = `${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 90 + 10)}`;
    const ext = path.extname(file.name) || ".jpg";

    let finalFileName = "";
    let finalBuffer: any = buffer;

    if (isVideo || isSvg || ext.toLowerCase() === ".gif") {
      // Save video / svg / animated gif as original format with SEO slug
      finalFileName = `${baseSlug}-${uniqueSuffix}${ext.toLowerCase()}`;
      finalBuffer = buffer;
    } else {
      // Automatically convert & compress images into high-performance .webp with SEO slug
      finalFileName = `${baseSlug}-${uniqueSuffix}.webp`;
      const webpBuffer = await sharp(buffer)
        .webp({ quality: 85, effort: 4 })
        .toBuffer();
      finalBuffer = webpBuffer;
    }

    const filePath = path.join(uploadDir, finalFileName);
    await writeFile(filePath, finalBuffer);

    const publicUrl = `/uploads/${finalFileName}`;

    return NextResponse.json({ url: publicUrl, fileName: finalFileName });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: error?.message || "Gagal mengunggah file gambar." }, { status: 500 });
  }
}
