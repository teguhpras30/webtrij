import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const now = new Date();

    // Menutup otomatis voucher yang sudah melebih tanggal akhir
    await db.voucher.updateMany({
      where: {
        endDate: { lt: now },
        isActive: true,
      },
      data: {
        isActive: false,
      },
    });

    const activeVouchers = await db.voucher.findMany({
      where: {
        isActive: true,
        AND: [
          {
            OR: [
              { startDate: null },
              { startDate: { lte: now } },
            ],
          },
          {
            OR: [
              { endDate: null },
              { endDate: { gte: now } },
            ],
          },
        ],
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(activeVouchers);
  } catch (err: any) {
    console.error("GET Public Vouchers Error:", err);
    return NextResponse.json({ error: "Gagal mengambil data voucher toko." }, { status: 500 });
  }
}
