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

export async function GET() {
  const user = await getAuthenticatedAdmin();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const products = await db.product.findMany({
    include: {
      category: true,
      images: {
        orderBy: { sortOrder: "asc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(products);
}

export async function POST(req: Request) {
  const user = await getAuthenticatedAdmin();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { name, categoryId, description, sold, thumbnail, images, isPopular, isDeal } = body;

    const parsedCatId = Number(categoryId);

    if (!name || !parsedCatId || isNaN(parsedCatId) || !description || !thumbnail) {
      return NextResponse.json(
        { error: "Nama, Kategori, Deskripsi, dan Gambar Utama (Thumbnail) wajib diisi dengan benar." },
        { status: 400 }
      );
    }

    // Verify category exists in DB
    const cat = await db.category.findUnique({ where: { id: parsedCatId } });
    if (!cat) {
      return NextResponse.json(
        { error: "Kategori yang dipilih tidak ditemukan di database." },
        { status: 400 }
      );
    }

    let baseSlug = slugify(name);
    if (!baseSlug) baseSlug = `product-${Date.now()}`;
    let uniqueSlug = baseSlug;

    // Check for existing slug
    const existing = await db.product.findUnique({ where: { slug: uniqueSlug } });
    if (existing) {
      uniqueSlug = `${baseSlug}-${Date.now()}`;
    }

    const product = await db.product.create({
      data: {
        name,
        slug: uniqueSlug,
        categoryId: parsedCatId,
        description,
        sold: sold || "0 Terjual",
        thumbnail,
        isPopular: Boolean(isPopular),
        isDeal: Boolean(isDeal),
        images: {
          create: Array.isArray(images)
            ? images.filter((img: string) => img && img.trim()).map((img: string, idx: number) => ({
                image: img.trim(),
                sortOrder: idx + 1,
              }))
            : [],
        },
      },
      include: {
        category: true,
        images: true,
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error: any) {
    console.error("Create product error:", error);
    return NextResponse.json(
      { error: error?.message || "Gagal menambahkan produk." },
      { status: 500 }
    );
  }
}
