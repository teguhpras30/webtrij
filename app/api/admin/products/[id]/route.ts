import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthenticatedAdmin } from "@/lib/auth";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthenticatedAdmin();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const productId = Number(id);

  if (!productId || isNaN(productId)) {
    return NextResponse.json({ error: "ID produk tidak valid." }, { status: 400 });
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
    const parsedPrice = retailPrice !== undefined ? Number(retailPrice) : undefined;
    const parsedStock = stock !== undefined ? Number(stock) : undefined;

    // Delete existing images first if provided
    if (Array.isArray(images)) {
      await db.productImage.deleteMany({ where: { productId } });
    }

    // Delete existing variants first if provided
    if (Array.isArray(variants)) {
      await db.productVariant.deleteMany({ where: { productId } });
    }

    const updated = await db.product.update({
      where: { id: productId },
      data: {
        name,
        category: { connect: { id: parsedCatId } },
        description,
        sold,
        retailPrice: parsedPrice,
        stock: parsedStock,
        moq: moq !== undefined ? Math.max(1, Number(moq)) : undefined,
        weightGram: weightGram ? Number(weightGram) : 1000,
        lengthCm: lengthCm ? Number(lengthCm) : 20,
        widthCm: widthCm ? Number(widthCm) : 20,
        heightCm: heightCm ? Number(heightCm) : 20,
        thumbnail,
        isPopular: Boolean(isPopular),
        isDeal: Boolean(isDeal),
        isBuyerOnly: Boolean(isBuyerOnly),
        images: Array.isArray(images)
          ? {
              create: images.filter((img: string) => img && img.trim()).map((img: string, idx: number) => ({
                image: img.trim(),
                sortOrder: idx + 1,
              })),
            }
          : undefined,
        variants: Array.isArray(variants)
          ? {
              create: variants
                .filter((v: any) => v && v.name && v.name.trim())
                .map((v: any) => ({
                  groupName: v.groupName ? String(v.groupName).trim() : "WARNA",
                  name: v.name.trim(),
                  price: Number(v.price) || parsedPrice || 0,
                  stock: v.stock !== undefined && v.stock !== null ? Number(v.stock) : 0,
                  sku: v.sku ? String(v.sku).trim() : null,
                  image: v.image ? String(v.image).trim() : null,
                })),
            }
          : undefined,
      },
      include: {
        category: true,
        images: true,
        variants: true,
      },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("Update product error:", error);
    return NextResponse.json(
      { error: error?.message || "Gagal memperbarui produk." },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthenticatedAdmin();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const productId = Number(id);

  try {
    // Delete all child relations first to prevent Foreign Key Violation errors
    await db.wishlist.deleteMany({ where: { productId } });
    await db.productImage.deleteMany({ where: { productId } });
    await db.productVariant.deleteMany({ where: { productId } });
    await db.wholesaleTier.deleteMany({ where: { productId } });
    await db.orderItem.deleteMany({ where: { productId } });

    await db.product.delete({
      where: { id: productId },
    });
    return NextResponse.json({ success: true, message: "Produk berhasil dihapus." });
  } catch (error: any) {
    console.error("Delete product error:", error);
    return NextResponse.json(
      { error: error?.message || "Gagal menghapus produk." },
      { status: 500 }
    );
  }
}
