import { NextResponse } from 'next/server';
import { getAuthenticatedUser, getAuthenticatedAdmin } from '@/lib/auth';
import { db } from '@/lib/db';
import { OrderStatus } from '@/lib/generated/prisma/client';
import { createBiteshipOrder } from '@/lib/biteship';

export async function GET() {
  try {
    const authUser = await getAuthenticatedUser();

    if (!authUser) {
      return NextResponse.json({ success: true, orders: [] });
    }
    
    let orders: any[] = [];
    if (authUser.role && String(authUser.role).toUpperCase() === "ADMIN") {
      orders = await db.order.findMany({
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  thumbnail: true,
                  slug: true
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });
    } else {
      orders = await db.order.findMany({
        where: {
          OR: [
            { userId: authUser.id },
            { customerEmail: authUser.email }
          ]
        },
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  thumbnail: true,
                  slug: true
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });
    }

    // Auto sync PENDING orders with Midtrans status
    const serverKey = process.env.MIDTRANS_SERVER_KEY || '';
    const authHeader = Buffer.from(`${serverKey}:`).toString('base64');

    for (const order of orders) {
      if (order.status === OrderStatus.PENDING) {
        try {
          const statusRes = await fetch(`https://api.sandbox.midtrans.com/v2/${order.orderNumber}/status`, {
            headers: {
              'Accept': 'application/json',
              'Authorization': `Basic ${authHeader}`
            },
            cache: 'no-store'
          });

          if (statusRes.ok) {
            const statusData = await statusRes.json();
            const trxStatus = statusData.transaction_status;
            const fraudStatus = statusData.fraud_status;

            if (trxStatus === 'settlement' || (trxStatus === 'capture' && fraudStatus === 'accept')) {
              await db.order.update({
                where: { id: order.id },
                data: { status: OrderStatus.PAID }
              });
              order.status = OrderStatus.PAID;
            } else if (trxStatus === 'cancel' || trxStatus === 'deny') {
              await db.order.update({
                where: { id: order.id },
                data: { status: OrderStatus.CANCELLED }
              });
              order.status = OrderStatus.CANCELLED;
            } else if (trxStatus === 'expire') {
              await db.order.update({
                where: { id: order.id },
                data: { status: OrderStatus.EXPIRED }
              });
              order.status = OrderStatus.EXPIRED;
            }
          }
        } catch (e) {
          console.warn(`Failed to sync Midtrans status for order ${order.orderNumber}:`, e);
        }
      }
    }

    return NextResponse.json({
      success: true,
      orders
    });
  } catch (error: any) {
    console.error('Fetch User Orders Error:', error);
    return NextResponse.json({ error: error.message || 'Gagal memuat daftar pesanan' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const adminUser = await getAuthenticatedAdmin();
    if (!adminUser) {
      return NextResponse.json({ error: 'Unauthorized: Akses khusus Admin' }, { status: 401 });
    }

    const body = await req.json();
    const { orderId, status, waybillNumber } = body;

    const targetIdentifier = String(orderId || body.id || body.orderNumber || "").trim();

    if (!targetIdentifier) {
      return NextResponse.json({ error: 'Order ID / Nomor Pesanan wajib diisi.' }, { status: 400 });
    }

    const updateData: any = {};
    if (status) updateData.status = status;
    if (waybillNumber !== undefined) updateData.waybillNumber = waybillNumber;

    // Search by orderNumber or ID in Database
    const existingOrder = await db.order.findFirst({
      where: {
        OR: [
          { orderNumber: targetIdentifier },
          { id: isNaN(Number(targetIdentifier)) ? -1 : Number(targetIdentifier) }
        ]
      },
      include: {
        items: {
          include: { product: true }
        }
      }
    });

    if (!existingOrder) {
      // If sample or local order, push to Biteship API only if not already pushed
      const hasLocalWaybill = waybillNumber && waybillNumber.startsWith("WYB-");
      if ((status === 'READY_TO_SHIP' || status === 'SHIPPED' || status === 'PACKING') && !hasLocalWaybill) {
        try {
          const biteshipRes = await createBiteshipOrder({
            orderNumber: targetIdentifier,
            customerName: body.customerName || "Teguh Prasetyo",
            customerPhone: body.customerPhone || "08961656039",
            customerEmail: body.customerEmail || "teguhpras30@gmail.com",
            shippingAddress: body.shippingAddress || "Manukan Wetan 60 Blok B No.19 Kec. Tandes, Surabaya",
            courierCompany: body.courierCode || "jne",
            courierType: body.courierService || "reg",
            items: body.items || [{ name: "Lemari Bow Bow 4 Susun", unitPrice: 132000, quantity: 1, weightGram: 1000 }],
            grandTotal: body.grandTotal || 107100
          });

          if (biteshipRes && biteshipRes.courier) {
            updateData.waybillNumber = biteshipRes.courier.waybill_id || biteshipRes.courier.tracking_id;
          }
        } catch (bErr) {
          console.warn("Biteship push warning for local order:", bErr);
        }
      }

      return NextResponse.json({
        success: true,
        message: `Status pesanan ${targetIdentifier} diperbarui.`,
        order: { orderNumber: targetIdentifier, status, waybillNumber: updateData.waybillNumber || waybillNumber }
      });
    }

    // Anti-duplicate protection: Only push to Biteship if waybill is not yet generated
    const hasExistingWaybill = existingOrder.waybillNumber && (existingOrder.waybillNumber.startsWith("WYB-") || existingOrder.waybillNumber.length > 15);

    if ((status === 'READY_TO_SHIP' || status === 'SHIPPED' || status === 'PACKING') && !hasExistingWaybill) {
      try {
        const biteshipRes = await createBiteshipOrder({
          orderNumber: existingOrder.orderNumber,
          customerName: existingOrder.customerName || "Pelanggan TRI J",
          customerPhone: existingOrder.customerPhone || "08961656039",
          customerEmail: existingOrder.customerEmail || undefined,
          shippingAddress: existingOrder.shippingAddress,
          courierCompany: existingOrder.courierCode || "jne",
          courierType: existingOrder.courierService || "reg",
          items: existingOrder.items.map(i => ({
            name: i.variantName || i.product?.name || "Perabot TRI J",
            unitPrice: i.unitPrice,
            quantity: i.quantity,
            weightGram: i.weightGram || 1000
          })),
          grandTotal: existingOrder.grandTotal
        });

        if (biteshipRes && biteshipRes.courier) {
          const liveWaybill = biteshipRes.courier.waybill_id || biteshipRes.courier.tracking_id;
          if (liveWaybill) {
            updateData.waybillNumber = liveWaybill;
          }
        }
      } catch (bErr) {
        console.warn("Biteship push on status change warning:", bErr);
      }
    }

    const updatedOrder = await db.order.update({
      where: { id: existingOrder.id },
      data: updateData
    });

    return NextResponse.json({
      success: true,
      order: updatedOrder
    });
  } catch (error: any) {
    console.error('Update Order Status Error:', error);
    return NextResponse.json({ error: error.message || 'Gagal memperbarui status pesanan' }, { status: 500 });
  }
}
