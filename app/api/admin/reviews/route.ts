import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthenticatedAdmin } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const admin = await getAuthenticatedAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const reviews = await db.review.findMany({
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            thumbnail: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(reviews);
  } catch (error: any) {
    console.error("Error fetching admin reviews:", error);
    return NextResponse.json(
      { error: "Gagal memuat data penilaian produk: " + error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const admin = await getAuthenticatedAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { productId, name, rating, review, variantName, mediaUrls, sellerReply, isActive } = body;

    if (!productId || !name || !review) {
      return NextResponse.json(
        { error: "Product ID, Nama Pengulas, dan Isi Ulasan wajib diisi." },
        { status: 400 }
      );
    }

    const newReview = await db.review.create({
      data: {
        productId: Number(productId),
        name: String(name).trim(),
        rating: Math.min(5, Math.max(1, Number(rating) || 5)),
        review: String(review).trim(),
        variantName: variantName ? String(variantName).trim() : null,
        mediaUrls: Array.isArray(mediaUrls) ? mediaUrls : [],
        sellerReply: sellerReply ? String(sellerReply).trim() : null,
        isActive: isActive !== undefined ? Boolean(isActive) : true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Penilaian produk berhasil ditambahkan oleh Admin.",
      review: newReview,
    });
  } catch (error: any) {
    console.error("Error creating review by admin:", error);
    return NextResponse.json(
      { error: "Gagal menambah penilaian produk: " + error.message },
      { status: 500 }
    );
  }
}
