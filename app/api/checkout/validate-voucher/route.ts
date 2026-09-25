import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { code, subtotal } = body;

    const formattedCode = code ? String(code).trim().toUpperCase() : "";
    const parsedSubtotal = Number(subtotal) || 0;

    if (!formattedCode) {
      return NextResponse.json({ error: "Silakan masukkan kode voucher." }, { status: 400 });
    }

    const voucher = await db.voucher.findUnique({
      where: { code: formattedCode },
    });

    if (!voucher || !voucher.isActive) {
      return NextResponse.json({ error: "Kode voucher tidak valid atau sudah tidak aktif." }, { status: 400 });
    }

    const now = new Date();
    if (voucher.startDate && new Date(voucher.startDate) > now) {
      return NextResponse.json(
        { error: `Voucher ini baru dapat digunakan mulai tanggal ${new Date(voucher.startDate).toLocaleString("id-ID")}.` },
        { status: 400 }
      );
    }

    if (voucher.endDate && new Date(voucher.endDate) < now) {
      return NextResponse.json(
        { error: "Masa berlaku voucher ini sudah kadaluarsa (berakhir)." },
        { status: 400 }
      );
    }

    if (voucher.minPurchase > 0 && parsedSubtotal < voucher.minPurchase) {
      return NextResponse.json(
        {
          error: `Voucher ini membutuhkan minimal pembelian Rp ${voucher.minPurchase.toLocaleString("id-ID")}.`,
        },
        { status: 400 }
      );
    }

    if (voucher.usageLimit && voucher.usedCount >= voucher.usageLimit) {
      return NextResponse.json({ error: "Voucher ini telah mencapai batas pemakaian." }, { status: 400 });
    }

    let calculatedDiscount = 0;
    if (voucher.discountType === "PERCENTAGE") {
      calculatedDiscount = (parsedSubtotal * voucher.discountValue) / 100;
      if (voucher.maxDiscount && calculatedDiscount > voucher.maxDiscount) {
        calculatedDiscount = voucher.maxDiscount;
      }
    } else {
      calculatedDiscount = voucher.discountValue;
    }

    // Ensure discount does not exceed subtotal
    if (calculatedDiscount > parsedSubtotal) {
      calculatedDiscount = parsedSubtotal;
    }

    return NextResponse.json({
      valid: true,
      code: voucher.code,
      discountType: voucher.discountType,
      discountValue: voucher.discountValue,
      calculatedDiscount,
      minPurchase: voucher.minPurchase,
      message: `Voucher ${voucher.code} berhasil dipasang! Hemat Rp ${calculatedDiscount.toLocaleString("id-ID")}`,
    });
  } catch (err: any) {
    console.error("Validate Voucher Error:", err);
    return NextResponse.json({ error: "Terjadi kesalahan saat memverifikasi voucher." }, { status: 500 });
  }
}
