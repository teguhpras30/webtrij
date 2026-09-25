import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthenticatedAdmin } from "@/lib/auth";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getAuthenticatedAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const reviewId = Number(id);

    if (isNaN(reviewId)) {
      return NextResponse.json({ error: "ID Ulasan tidak valid" }, { status: 400 });
    }

    const body = await req.json();
    const { name, rating, review, variantName, mediaUrls, sellerReply, isActive } = body;

    const updatedReview = await db.review.update({
      where: { id: reviewId },
      data: {
        ...(name !== undefined && { name: String(name).trim() }),
        ...(rating !== undefined && { rating: Math.min(5, Math.max(1, Number(rating) || 5)) }),
        ...(review !== undefined && { review: String(review).trim() }),
        ...(variantName !== undefined && { variantName: variantName ? String(variantName).trim() : null }),
        ...(mediaUrls !== undefined && { mediaUrls: Array.isArray(mediaUrls) ? mediaUrls : [] }),
        ...(sellerReply !== undefined && { sellerReply: sellerReply ? String(sellerReply).trim() : null }),
        ...(isActive !== undefined && { isActive: Boolean(isActive) }),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Data penilaian produk berhasil diperbarui.",
      review: updatedReview,
    });
  } catch (error: any) {
    console.error("Error updating review by admin:", error);
    return NextResponse.json(
      { error: "Gagal memperbarui ulasan: " + error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getAuthenticatedAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const reviewId = Number(id);

    if (isNaN(reviewId)) {
      return NextResponse.json({ error: "ID Ulasan tidak valid" }, { status: 400 });
    }

    await db.review.delete({
      where: { id: reviewId },
    });

    return NextResponse.json({
      success: true,
      message: "Penilaian produk berhasil dihapus permanen.",
    });
  } catch (error: any) {
    console.error("Error deleting review by admin:", error);
    return NextResponse.json(
      { error: "Gagal menghapus ulasan: " + error.message },
      { status: 500 }
    );
  }
}
