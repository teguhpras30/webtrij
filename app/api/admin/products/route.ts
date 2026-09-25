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
      variants: {
        orderBy: { id: "asc" },
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
    const {
      name,
      categoryId,
      description,
      sold,
      thumbnail,
      images,
      isPopular,
      isDeal,
      isBuyerOnly,
      weightGram,
      lengthCm,
      widthCm,
      heightCm,
      retailPrice,
      stock,
      moq,
      variants,
    } = body;

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

    const parsedPrice = retailPrice ? Number(retailPrice) : 0;
    const parsedStock = stock !== undefined && stock !== null ? Number(stock) : 0;

    const product = await db.product.create({
      data: {
        name,
        slug: uniqueSlug,
        category: { connect: { id: parsedCatId } },
        description,
        sold: sold || "0 Terjual",
        retailPrice: parsedPrice,
        stock: parsedStock,
        moq: moq ? Math.max(1, Number(moq)) : 1,
        weightGram: weightGram ? Number(weightGram) : 1000,
        lengthCm: lengthCm ? Number(lengthCm) : 20,
        widthCm: widthCm ? Number(widthCm) : 20,
        heightCm: heightCm ? Number(heightCm) : 20,
        thumbnail,
        isPopular: Boolean(isPopular),
        isDeal: Boolean(isDeal),
        isBuyerOnly: Boolean(isBuyerOnly),
        images: {
          create: Array.isArray(images)
            ? images.filter((img: string) => img && img.trim()).map((img: string, idx: number) => ({
                image: img.trim(),
                sortOrder: idx + 1,
              }))
            : [],
        },
        variants: {
          create: Array.isArray(variants)
            ? variants
                .filter((v: any) => v && v.name && v.name.trim())
                .map((v: any) => ({
                  groupName: v.groupName ? String(v.groupName).trim() : "WARNA",
                  name: v.name.trim(),
                  price: Number(v.price) || parsedPrice || 0,
                  stock: v.stock !== undefined && v.stock !== null ? Number(v.stock) : 0,
                  sku: v.sku ? String(v.sku).trim() : null,
                  image: v.image ? String(v.image).trim() : null,
                }))
            : [],
        },
      },
      include: {
        category: true,
        images: true,
        variants: true,
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
