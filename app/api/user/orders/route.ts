import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { OrderStatus } from '@/lib/generated/prisma/client';

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const authUser = await getAuthenticatedUser();

    if (!authUser) {
      return NextResponse.json({ success: true, orders: [] });
    }

    // STRICT ISOLATION: Hanya ambil pesanan yang benar-benar milik pengguna yang sedang login ini
    const orConditions: any[] = [{ userId: authUser.id }];

    if (authUser.email && authUser.email.trim()) {
      orConditions.push({
        customerEmail: { equals: authUser.email.trim(), mode: "insensitive" }
      });
    }

    if (authUser.phone && authUser.phone.trim()) {
      orConditions.push({
        customerPhone: authUser.phone.trim()
      });
    }

    const orders = await db.order.findMany({
      where: {
        OR: orConditions
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

    // Auto sync PENDING orders milik user dengan Midtrans status
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
          console.warn(`Failed to sync Midtrans status for user order ${order.orderNumber}:`, e);
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
    const authUser = await getAuthenticatedUser();
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized: Silakan login terlebih dahulu' }, { status: 401 });
    }

    const body = await req.json();
    const { orderNumber, orderId, status } = body;
    const targetIdentifier = String(orderNumber || orderId || body.id || "").trim();

    if (!targetIdentifier) {
      return NextResponse.json({ error: 'Nomor Pesanan wajib diisi.' }, { status: 400 });
    }

    // Cari pesanan di database
    const existingOrder = await db.order.findFirst({
      where: {
        OR: [
          { orderNumber: targetIdentifier },
          { id: isNaN(Number(targetIdentifier)) ? -1 : Number(targetIdentifier) }
        ]
      }
    });

    if (!existingOrder) {
      return NextResponse.json({ error: 'Pesanan tidak ditemukan.' }, { status: 404 });
    }

    // Keamanan: Pastikan hanya pemilik pesanan (atau admin) yang bisa mengonfirmasi/mengubah
    const r = authUser.role ? String(authUser.role).toUpperCase() : "";
    const isAdmin = r === "ADMIN" || r === "SUPER_ADMIN" || r === "SUPERADMIN";
    const isOwner =
      existingOrder.userId === authUser.id ||
      (authUser.email && existingOrder.customerEmail?.toLowerCase() === authUser.email.toLowerCase()) ||
      (authUser.phone && existingOrder.customerPhone === authUser.phone);

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: 'Akses ditolak: Anda tidak memiliki akses ke pesanan ini.' }, { status: 403 });
    }

    const updatedOrder = await db.order.update({
      where: { id: existingOrder.id },
      data: {
        status: status || OrderStatus.COMPLETED
      }
    });

    return NextResponse.json({
      success: true,
      order: updatedOrder
    });
  } catch (error: any) {
    console.error('Update User Order Status Error:', error);
    return NextResponse.json({ error: error.message || 'Gagal memperbarui status pesanan' }, { status: 500 });
  }
}
