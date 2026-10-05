import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { generateJneAirwaybill, mapAddressToJneDestinationCode } from "@/lib/jne";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { orderId } = body;

    if (!orderId) {
      return NextResponse.json({ error: "Order ID atau nomor pesanan diperlukan" }, { status: 400 });
    }

    const order = await db.order.findFirst({
      where: {
        OR: [
          { orderNumber: String(orderId) },
          { id: isNaN(Number(orderId)) ? -1 : Number(orderId) },
        ],
      },
      include: {
        items: {
          include: { product: true },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Pesanan tidak ditemukan" }, { status: 404 });
    }

    const destCode = mapAddressToJneDestinationCode(order.shippingAddress || "");
    const totalQty = order.items.reduce((acc, i) => acc + (i.quantity || 1), 0) || 1;
    const totalWeightKg = Math.max(
      1,
      Math.ceil(
        order.items.reduce((acc, i) => acc + ((i.product?.weightGram || 1000) * (i.quantity || 1)), 0) / 1000
      )
    );

    // Determine JNE Service
    let service = "REG";
    const svcStr = (order.courierService || order.courierName || "").toUpperCase();
    if (svcStr.includes("YES") || svcStr.includes("YAKIN")) service = "YES";
    else if (svcStr.includes("JTR") || svcStr.includes("TRUCKING") || svcStr.includes("KARGO")) service = "JTR";
    else if (svcStr.includes("OKE") || svcStr.includes("HEMAT")) service = "OKE";

    const res = await generateJneAirwaybill({
      orderId: order.orderNumber,
      receiverName: order.customerName,
      receiverAddr1: (order.shippingAddress || "Alamat Pembeli").substring(0, 30),
      receiverAddr2: order.shippingAddress && order.shippingAddress.length > 30 ? order.shippingAddress.substring(30, 60) : "-",
      receiverCity: "Kota Tujuan",
      receiverPhone: order.customerPhone || "081234567890",
      qty: totalQty,
      weightKg: totalWeightKg,
      goodsDesc: (order.items[0]?.product?.name || "Perabot Rumah Tangga TRI J").substring(0, 50),
      goodsValue: Math.round(order.grandTotal),
      destCode: destCode,
      service: service,
    });

    if (res.success && res.cnote) {
      // Update order in database with generated JNE cnote
      await db.order.update({
        where: { id: order.id },
        data: {
          waybillNumber: res.cnote,
          courierName: "JNE Express (Official Direct)",
          status: "SHIPPED",
        },
      });

      return NextResponse.json({
        success: true,
        cnote: res.cnote,
        message: `Berhasil generate resi JNE: ${res.cnote}`,
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: res.error || "Gagal generate resi JNE",
          cnote: res.cnote,
          raw: res.raw,
        },
        { status: 400 }
      );
    }
  } catch (err: any) {
    console.error("Admin JNE Generate AWB Error:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
