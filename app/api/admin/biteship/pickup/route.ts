import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createBiteshipOrder } from "@/lib/biteship";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { orderId } = body;

    if (!orderId) {
      return NextResponse.json({ error: "Order ID diperlukan" }, { status: 400 });
    }

    const order = await db.order.findFirst({
      where: {
        OR: [
          { orderNumber: String(orderId) },
          { id: isNaN(Number(orderId)) ? -1 : Number(orderId) },
        ],
      },
      include: {
        items: { include: { product: true } },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Pesanan tidak ditemukan" }, { status: 404 });
    }

    const biteshipResult = await createBiteshipOrder({
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      customerEmail: order.customerEmail || undefined,
      shippingAddress: order.shippingAddress,
      courierCompany: order.courierCode || "jne",
      courierType: order.courierService || "reg",
      items: order.items.map((item: any) => ({
        name: item.product?.name || item.variantName || "Perabot TRI J",
        unitPrice: item.unitPrice,
        quantity: item.quantity,
        weightGram: item.product?.weightGram || 1000,
        variantName: item.variantName,
      })),
      grandTotal: order.grandTotal,
    });

    if (biteshipResult && (biteshipResult.id || biteshipResult.courier?.waybill_id)) {
      const waybill = biteshipResult.courier?.waybill_id || biteshipResult.id;
      await db.order.update({
        where: { id: order.id },
        data: {
          waybillNumber: String(waybill),
          status: "SHIPPED",
        },
      });

      return NextResponse.json({
        success: true,
        waybill,
        message: `Berhasil request pick-up kurir Biteship! ID/Resi: ${waybill}`,
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: "Gagal request pick-up ke server Biteship. Cek konfigurasi alamat toko atau API key Biteship.",
        },
        { status: 400 }
      );
    }
  } catch (err: any) {
    console.error("Admin Biteship Pickup Error:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
