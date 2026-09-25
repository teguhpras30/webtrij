import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthenticatedUser } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const authUser = await getAuthenticatedUser();
    const body = await req.json();
    const { productId, orderId, rating, review, variantName, mediaUrls } = body;

    if (!productId || !review) {
      return NextResponse.json(
        { error: "Product ID dan teks ulasan wajib diisi." },
        { status: 400 }
      );
    }

    const reviewerName = authUser?.name || authUser?.username || body.name || "Pelanggan Setia";
    const reviewerAvatar = authUser?.avatar || null;
    const ratingVal = Math.min(5, Math.max(1, Number(rating) || 5));

    const newReview = await db.review.create({
      data: {
        productId: Number(productId),
        userId: authUser?.id ? Number(authUser.id) : null,
        orderId: orderId ? Number(orderId) : null,
        name: reviewerName,
        rating: ratingVal,
        review: String(review).trim(),
        variantName: variantName ? String(variantName) : null,
        avatar: reviewerAvatar,
        mediaUrls: Array.isArray(mediaUrls) ? mediaUrls : [],
      },
    });

    // Also sync to Testimonial model for site-wide testimonials list
    try {
      await db.testimonial.create({
        data: {
          name: reviewerName,
          review: String(review).trim(),
          avatar: reviewerAvatar,
          type: "MEMBER",
          isActive: true,
        },
      });
    } catch (e) {
      console.warn("Failed to mirror review to testimonial table", e);
    }

    return NextResponse.json({
      success: true,
      message: "Terima kasih! Penilaian produk Anda berhasil disimpan.",
      review: newReview,
    });
  } catch (error: any) {
    console.error("Error submitting review:", error);
    return NextResponse.json(
      { error: "Gagal menyimpan penilaian produk: " + error.message },
      { status: 500 }
    );
  }
}
