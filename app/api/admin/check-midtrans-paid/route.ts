import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { OrderStatus } from '@/lib/generated/prisma/client';

export async function GET() {
  try {
    const orders = await db.order.findMany({
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                thumbnail: true,
                retailPrice: true,
                slug: true
              }
            }
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const serverKey = process.env.MIDTRANS_SERVER_KEY || '';
    const authHeader = Buffer.from(`${serverKey}:`).toString('base64');
    const isProduction = process.env.MIDTRANS_IS_PRODUCTION === 'true' || serverKey.startsWith('Mid-server-');
    const midtransApiBase = isProduction ? 'https://api.midtrans.com/v2' : 'https://api.sandbox.midtrans.com/v2';
    const biteshipApiKey = process.env.BITESHIP_API_KEY || '';

    const paidOrders: any[] = [];
    const allOrdersStatus: any[] = [];

    for (const order of orders) {
      let liveStatus = 'PENDING';
      let paymentType = 'N/A';
      let settlementTime = null;

      // 1. Sync Midtrans Payment Status
      try {
        const res = await fetch(`${midtransApiBase}/${order.orderNumber}/status`, {
          headers: {
            'Accept': 'application/json',
            'Authorization': `Basic ${authHeader}`
          },
          cache: 'no-store'
        });

        if (res.ok) {
          const data = await res.json();
          liveStatus = data.transaction_status || 'PENDING';
          paymentType = data.payment_type || 'N/A';
          settlementTime = data.settlement_time || data.transaction_time || null;

          if (liveStatus === 'settlement' || (liveStatus === 'capture' && data.fraud_status === 'accept')) {
            if (order.status === OrderStatus.PENDING) {
              await db.order.update({
                where: { id: order.id },
                data: { status: OrderStatus.PAID }
              });
              order.status = OrderStatus.PAID;
            }

            paidOrders.push({
              orderNumber: order.orderNumber,
              customerName: order.customerName,
              customerEmail: order.customerEmail,
              grandTotal: order.grandTotal,
              statusDB: order.status,
              midtransStatus: liveStatus,
              paymentType,
              settlementTime,
              items: order.items.map(i => ({
                productName: i.product?.name || 'Produk',
                quantity: i.quantity,
                unitPrice: i.unitPrice,
                totalPrice: i.totalPrice,
                thumbnail: i.product?.thumbnail
              }))
            });
          }
        }
      } catch (e) {
        console.warn(`Failed to check Midtrans status for ${order.orderNumber}:`, e);
      }

      // 2. Sync Biteship Shipping Status if Waybill exists
      if (order.waybillNumber && biteshipApiKey) {
        try {
          const biteshipRes = await fetch(`https://api.biteship.com/v1/trackings/${order.waybillNumber}`, {
            headers: {
              Authorization: biteshipApiKey,
              'Content-Type': 'application/json'
            },
            cache: 'no-store'
          });

          if (biteshipRes.ok) {
            const data = await biteshipRes.json();
            const biteshipStatus = (data.status || '').toLowerCase();

            let targetStatus: OrderStatus | null = null;
            if (biteshipStatus === 'delivered' || biteshipStatus === 'completed') {
              targetStatus = OrderStatus.COMPLETED;
            } else if (
              biteshipStatus === 'picked_up' ||
              biteshipStatus === 'in_transit' ||
              biteshipStatus === 'on_delivery' ||
              biteshipStatus === 'out_for_delivery' ||
              biteshipStatus === 'dropping_off'
            ) {
              targetStatus = OrderStatus.SHIPPED;
            } else if (biteshipStatus === 'allocated' || biteshipStatus === 'picking_up') {
              targetStatus = OrderStatus.READY_TO_SHIP;
            }

            if (targetStatus && order.status !== targetStatus) {
              await db.order.update({
                where: { id: order.id },
                data: { status: targetStatus }
              });
              order.status = targetStatus;
            }
          }
        } catch (err) {
          console.warn(`Failed to sync Biteship tracking for ${order.waybillNumber}:`, err);
        }
      }

      allOrdersStatus.push({
        orderNumber: order.orderNumber,
        customerName: order.customerName,
        grandTotal: order.grandTotal,
        statusDB: order.status,
        midtransStatus: liveStatus,
        paymentType
      });
    }

    return NextResponse.json({
      success: true,
      totalOrdersInDB: orders.length,
      totalPaidOrders: paidOrders.length,
      paidOrders,
      allOrdersSummary: allOrdersStatus
    });
  } catch (error: any) {
    console.error('Check Midtrans & Biteship Status API Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Gagal mensinkronkan status pesanan.' },
      { status: 500 }
    );
  }
}
