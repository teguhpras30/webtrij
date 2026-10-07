import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthenticatedAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const user = await getAuthenticatedAdmin();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Otomatis menonaktifkan voucher yang masa berlakunya sudah lewat (kadaluarsa)
    const now = new Date();
    await db.voucher.updateMany({
      where: {
        endDate: { lt: now },
        isActive: true,
      },
      data: {
        isActive: false,
      },
    });

    const vouchers = await db.voucher.findMany({
      orderBy: { createdAt: "desc" },
    });

    const vouchersWithUsage = await Promise.all(
      vouchers.map(async (v) => {
        const orders = await db.order.findMany({
          where: { promoCode: v.code },
          select: {
            id: true,
            orderNumber: true,
            customerName: true,
            customerEmail: true,
            customerPhone: true,
            promoDiscount: true,
            shippingDiscount: true,
            grandTotal: true,
            status: true,
            createdAt: true,
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

        return {
          ...v,
          actualUsedCount: orders.length,
          usedCount: Math.max(v.usedCount, orders.length),
          orderUsages: orders,
        };
      })
    );

    return NextResponse.json(vouchersWithUsage);
  } catch (err: any) {
    console.error("GET Vouchers Error:", err);
    return NextResponse.json({ error: "Gagal mengambil data voucher." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const user = await getAuthenticatedAdmin();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

    const formattedCode = code ? String(code).trim().toUpperCase() : "";

    if (!formattedCode) {
      return NextResponse.json({ error: "Kode voucher wajib diisi." }, { status: 400 });
    }

    if (!discountValue || Number(discountValue) <= 0) {
      return NextResponse.json({ error: "Nilai diskon harus lebih dari 0." }, { status: 400 });
    }

    // Check if voucher code already exists
    const existing = await db.voucher.findUnique({
      where: { code: formattedCode },
    });
    if (existing) {
      return NextResponse.json({ error: "Kode voucher tersebut sudah digunakan." }, { status: 400 });
    }

    const voucher = await db.voucher.create({
      data: {
        code: formattedCode,
        scope: scope === "PRODUCT" ? "PRODUCT" : "SHOP",
        targetProductIds: Array.isArray(targetProductIds) ? targetProductIds.map(Number) : [],
        discountType: discountType === "FIXED" ? "FIXED" : "PERCENTAGE",
        discountValue: Number(discountValue),
        minPurchase: minPurchase ? Number(minPurchase) : 0,
        maxDiscount: discountType === "PERCENTAGE" && maxDiscount ? Number(maxDiscount) : null,
        usageLimit: usageLimit ? Number(usageLimit) : null,
        isActive: isActive !== undefined ? Boolean(isActive) : true,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
      },
    });

    return NextResponse.json(voucher, { status: 201 });
  } catch (err: any) {
    console.error("POST Voucher Error:", err);
    return NextResponse.json({ error: err?.message || "Gagal membuat voucher." }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const user = await getAuthenticatedAdmin();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { ids } = body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "Tidak ada voucher yang dipilih." }, { status: 400 });
    }

    const activeVouchers = await db.voucher.findMany({
      where: {
        id: { in: ids.map(Number) },
        isActive: true,
      },
    });

    if (activeVouchers.length > 0) {
      return NextResponse.json(
        {
          error: `Terdapat ${activeVouchers.length} voucher aktif terpilih. Voucher aktif tidak dapat dihapus, silakan nonaktifkan terlebih dahulu.`,
        },
        { status: 400 }
      );
    }

    const deleted = await db.voucher.deleteMany({
      where: {
        id: { in: ids.map(Number) },
      },
    });

    return NextResponse.json({ success: true, count: deleted.count });
  } catch (err: any) {
    console.error("Batch Delete Vouchers Error:", err);
    return NextResponse.json({ error: err?.message || "Gagal menghapus voucher terpilih." }, { status: 500 });
  }
}
