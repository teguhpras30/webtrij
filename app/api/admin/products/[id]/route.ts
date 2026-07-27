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

  try {
    const body = await req.json();
    const { name, categoryId, description, sold, thumbnail, images, isPopular, isDeal } = body;

    const parsedCatId = Number(categoryId);

    // Delete existing images first if provided
    if (Array.isArray(images)) {
      await db.productImage.deleteMany({ where: { productId } });
    }

    const updated = await db.product.update({
      where: { id: productId },
      data: {
        name,
        categoryId: parsedCatId,
        description,
        sold,
        thumbnail,
        isPopular: Boolean(isPopular),
        isDeal: Boolean(isDeal),
        images: Array.isArray(images)
          ? {
              create: images.filter((img: string) => img && img.trim()).map((img: string, idx: number) => ({
                image: img.trim(),
                sortOrder: idx + 1,
              })),
            }
          : undefined,
      },
      include: {
        category: true,
        images: true,
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
