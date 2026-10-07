import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthenticatedAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthenticatedAdmin();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const voucherId = Number(id);

  if (!voucherId || isNaN(voucherId)) {
    return NextResponse.json({ error: "ID Voucher tidak valid." }, { status: 400 });
  }

  try {
    const body = await req.json();
    const {
      code,
      discountType,
      discountValue,
      minPurchase,
      maxDiscount,
      usageLimit,
      isActive,
      startDate,
      endDate,
      scope,
      targetProductIds,
    } = body;

    const formattedCode = code ? String(code).trim().toUpperCase() : undefined;

    if (formattedCode && !isNaN(voucherId)) {
      const existing = await db.voucher.findFirst({
        where: {
          code: formattedCode,
          id: {
            not: voucherId,
          },
        },
      });
      if (existing) {
        return NextResponse.json({ error: "Kode voucher tersebut sudah digunakan oleh voucher lain." }, { status: 400 });
      }
    }

    const updated = await db.voucher.update({
      where: { id: voucherId },
      data: {
        code: formattedCode,
        scope: scope ? (scope === "PRODUCT" ? "PRODUCT" : "SHOP") : undefined,
        targetProductIds: Array.isArray(targetProductIds) ? targetProductIds.map(Number) : undefined,
        discountType: discountType ? (discountType === "FIXED" ? "FIXED" : "PERCENTAGE") : undefined,
        discountValue: discountValue !== undefined ? Number(discountValue) : undefined,
        minPurchase: minPurchase !== undefined ? Number(minPurchase) : undefined,
        maxDiscount:
          discountType === "FIXED"
            ? null
            : maxDiscount !== undefined
            ? (maxDiscount ? Number(maxDiscount) : null)
            : undefined,
        usageLimit: usageLimit !== undefined ? (usageLimit ? Number(usageLimit) : null) : undefined,
        isActive: isActive !== undefined ? Boolean(isActive) : undefined,
        startDate: startDate !== undefined ? (startDate ? new Date(startDate) : null) : undefined,
        endDate: endDate !== undefined ? (endDate ? new Date(endDate) : null) : undefined,
      },
    });

    return NextResponse.json(updated);
  } catch (err: any) {
    console.error("PUT Voucher Error:", err);
    return NextResponse.json({ error: err?.message || "Gagal memperbarui voucher." }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthenticatedAdmin();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const voucherId = Number(id);

  try {
    const voucher = await db.voucher.findUnique({ where: { id: voucherId } });
    if (!voucher) {
      return NextResponse.json({ error: "Voucher tidak ditemukan." }, { status: 404 });
    }

    if (voucher.isActive) {
      return NextResponse.json(
        { error: "Voucher yang sedang aktif tidak dapat dihapus. Silakan nonaktifkan terlebih dahulu." },
        { status: 400 }
      );
    }

    await db.voucher.delete({
      where: { id: voucherId },
    });
    return NextResponse.json({ success: true, message: "Voucher berhasil dihapus." });
  } catch (err: any) {
    console.error("DELETE Voucher Error:", err);
    return NextResponse.json({ error: err?.message || "Gagal menghapus voucher." }, { status: 500 });
  }
}
