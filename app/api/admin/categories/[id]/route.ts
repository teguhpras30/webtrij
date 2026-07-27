import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthenticatedAdmin } from "@/lib/auth";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthenticatedAdmin();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const categoryId = Number(id);

  try {
    const { name } = await req.json();
    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Nama kategori wajib diisi." }, { status: 400 });
    }

    const cleanName = name.trim();
    const slug = slugify(cleanName);

    const updated = await db.category.update({
      where: { id: categoryId },
      data: { name: cleanName, slug },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Update category error:", error);
    return NextResponse.json({ error: "Gagal memperbarui kategori." }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthenticatedAdmin();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const categoryId = Number(id);

  try {
    // Check if category has associated products
    const productCount = await db.product.count({ where: { categoryId } });
    if (productCount > 0) {
      return NextResponse.json(
        { error: `Tidak bisa menghapus. Masih ada ${productCount} produk terhubung ke kategori ini.` },
        { status: 400 }
      );
    }

    await db.category.delete({ where: { id: categoryId } });
    return NextResponse.json({ success: true, message: "Kategori berhasil dihapus." });
  } catch (error) {
    console.error("Delete category error:", error);
    return NextResponse.json({ error: "Gagal menghapus kategori." }, { status: 500 });
  }
}
