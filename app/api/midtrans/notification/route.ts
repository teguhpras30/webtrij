import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { db } from '@/lib/db';
import { OrderStatus } from '@/lib/generated/prisma/client';

export async function POST(request: Request) {
  try {
    const notification = await request.json();
    console.log('Midtrans Payment Notification Webhook Received:', notification);

    const {
      order_id,
      status_code,
      gross_amount,
      signature_key,
      transaction_status,
      fraud_status,
    } = notification;

    if (!order_id) {
      return NextResponse.json({ error: 'Order ID missing' }, { status: 400 });
    }

    const serverKey = process.env.MIDTRANS_SERVER_KEY || '';

    // Verifikasi Signature Key SHA-512 dari Midtrans untuk mencegah manipulasi webhook
    if (signature_key && status_code && gross_amount) {
      const payloadToHash = `${order_id}${status_code}${gross_amount}${serverKey}`;
      const expectedSignature = crypto.createHash('sha512').update(payloadToHash).digest('hex');

      if (signature_key !== expectedSignature) {
        console.warn(`⚠️ Invalid Midtrans signature key for order ${order_id}!`);
        return NextResponse.json({ error: 'Invalid Midtrans signature key' }, { status: 403 });
      }
    }

    let orderStatus: OrderStatus = OrderStatus.PENDING;

    if (transaction_status === 'capture') {
      if (fraud_status === 'challenge') {
        orderStatus = OrderStatus.PENDING;
      } else if (fraud_status === 'accept') {
        orderStatus = OrderStatus.PAID;
      }
    } else if (transaction_status === 'settlement') {
      orderStatus = OrderStatus.PAID;
    } else if (transaction_status === 'cancel' || transaction_status === 'deny') {
      orderStatus = OrderStatus.CANCELLED;
    } else if (transaction_status === 'expire') {
      orderStatus = OrderStatus.EXPIRED;
    } else if (transaction_status === 'pending') {
      orderStatus = OrderStatus.PENDING;
    }

    // Update status pesanan di Prisma DB & kurangi stok produk secara atomik saat Lunas (PAID)
    try {
      await db.$transaction(async (tx) => {
        const existingOrders = await tx.order.findMany({
          where: { orderNumber: order_id },
          include: { items: true },
        });

        for (const order of existingOrders) {
          const wasPaidBefore = order.status === OrderStatus.PAID;
          await tx.order.update({
            where: { id: order.id },
            data: { status: orderStatus },
          });

          // Kurangi stok produk & varian hanya jika status berubah dari non-PAID menjadi PAID
          if (orderStatus === OrderStatus.PAID && !wasPaidBefore) {
            for (const item of order.items) {
              const qty = Math.max(1, item.quantity);

              // Decrement stok produk utama
              await tx.product.update({
                where: { id: item.productId },
                data: { stock: { decrement: qty } },
              }).catch((e) => console.warn(`Decrement product stock warning for product ${item.productId}:`, e));

              // Decrement stok varian produk jika ada
              if (item.variantName) {
                const primaryVariantName = item.variantName.includes(" - ")
                  ? item.variantName.split(" - ")[0].trim()
                  : item.variantName;

                await tx.productVariant.updateMany({
                  where: {
                    productId: item.productId,
                    name: { in: [item.variantName, primaryVariantName] },
                  },
                  data: { stock: { decrement: qty } },
                }).catch((e) => console.warn(`Decrement variant stock warning for product ${item.productId} variant ${item.variantName}:`, e));
              }
            }
          }
        }
      });
      console.log(`✅ Order ${order_id} status updated to ${orderStatus} (Stock processed)`);
    } catch (dbErr) {
      console.warn('DB Order Status Update Warning:', dbErr);
    }

    return NextResponse.json({ success: true, orderStatus });
  } catch (error: any) {
    console.error('Midtrans Notification Webhook Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
