import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthenticatedUser } from "@/lib/auth";

export async function GET() {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ wishlistProductIds: [], products: [] });
  }

  try {
    const wishlists = await db.wishlist.findMany({
      where: { userId: user.id },
      include: {
        product: {
          include: {
            category: true,
            images: { orderBy: { sortOrder: "asc" } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const wishlistProductIds = wishlists.map((w) => w.productId);
    const products = wishlists.map((w) => ({
      id: w.product.id,
      name: w.product.name,
      slug: w.product.slug,
      category: w.product.category.name,
      description: w.product.description,
      sold: w.product.sold,
      image: w.product.thumbnail,
      images: w.product.images.map((img) => img.image),
      isPopular: w.product.isPopular,
      isDeal: w.product.isDeal,
    }));

    return NextResponse.json({ wishlistProductIds, products });
  } catch (error: any) {
    console.error("GET wishlist error:", error);
    return NextResponse.json({ error: "Gagal mengambil wishlist." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "Silakan masuk terlebih dahulu untuk menyimpan produk favorit." }, { status: 401 });
  }

  try {
    const { productId } = await req.json();
    const pid = Number(productId);

    if (!pid || isNaN(pid)) {
      return NextResponse.json({ error: "Product ID tidak valid." }, { status: 400 });
    }

    // Check if item already exists in wishlist
    const existing = await db.wishlist.findUnique({
      where: {
        userId_productId: {
          userId: user.id,
          productId: pid,
        },
      },
    });

    let added = false;

    if (existing) {
      // Remove from wishlist
      await db.wishlist.delete({
        where: { id: existing.id },
      });
      added = false;
    } else {
      // Add to wishlist
      await db.wishlist.create({
        data: {
          userId: user.id,
          productId: pid,
        },
      });
      added = true;
    }

    // Fetch updated list of product IDs
    const updatedWishlists = await db.wishlist.findMany({
      where: { userId: user.id },
      select: { productId: true },
    });

    return NextResponse.json({
      success: true,
      added,
      wishlistProductIds: updatedWishlists.map((w) => w.productId),
    });
  } catch (error: any) {
    console.error("POST wishlist error:", error);
    return NextResponse.json({ error: "Gagal mengubah status wishlist." }, { status: 500 });
  }
}
