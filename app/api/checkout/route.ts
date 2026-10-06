import { NextResponse } from 'next/server';
import { createMidtransSnapTransaction } from '@/lib/midtrans';
import { db } from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/auth';
import { ADMIN_FEE_IDR } from '@/lib/vouchers';
import { createBiteshipOrder } from '@/lib/biteship';

export async function POST(request: Request) {
  try {
    const authUser = await getAuthenticatedUser();
    const body = await request.json();
    const {
      items,
      customerName,
      customerPhone,
      customerEmail,
      companyName,
      taxNumber,
      shippingAddress,
      courier,
      isB2B,
      promoDiscount: clientPromoDiscount = 0,
      shippingDiscount: clientShippingDiscount = 0,
      promoCode = ''
    } = body;

    if (!items || !items.length || !customerName || !shippingAddress) {
      return NextResponse.json({ error: 'Data pesanan tidak lengkap.' }, { status: 400 });
    }

    // 1. Recalculate Subtotal & Item Prices Server-Side from PostgreSQL Database
    let serverSubtotal = 0;
    const validatedItems: any[] = [];

    for (const item of items) {
      const productId = typeof item.id === 'number' ? item.id : parseInt(String(item.id), 10);
      const qty = Math.max(1, Number(item.quantity) || 1);

      let unitPrice = Number(item.price) || 0;
      let variantName = item.name || item.variantName || '';

      if (!isNaN(productId) && productId > 0) {
        const dbProduct = await db.product.findUnique({
          where: { id: productId },
          include: { variants: true }
        });

        if (dbProduct) {
          const minOrder = Number(dbProduct.moq) || 1;
          if (qty < minOrder) {
            return NextResponse.json(
              { error: `Jumlah pemesanan produk "${dbProduct.name}" kurang dari minimal pembelian (${minOrder} item).` },
              { status: 400 }
            );
          }

          // Check matching variant and stock
          let matchedVar = null;
          if (variantName && Array.isArray(dbProduct.variants) && dbProduct.variants.length > 0) {
            matchedVar = dbProduct.variants.find(
              (v) => v.name.toLowerCase() === variantName.toLowerCase()
            );
            if (matchedVar && Number(matchedVar.price) > 0) {
              unitPrice = Number(matchedVar.price);
            } else if (Number(dbProduct.retailPrice) > 0) {
              unitPrice = Number(dbProduct.retailPrice);
            }
          } else if (Number((dbProduct as any).wholesalePrice) > 0) {
            unitPrice = Number((dbProduct as any).wholesalePrice);
          }

          // Strict Stock Safety Check
          const availableStock = matchedVar && matchedVar.stock !== undefined && matchedVar.stock !== null
            ? Number(matchedVar.stock)
            : Number(dbProduct.stock ?? 0);

          if (availableStock <= 0) {
            return NextResponse.json(
              { error: `Produk "${dbProduct.name}" ${matchedVar ? `(Varian: ${matchedVar.name})` : ''} sedang tidak tersedia (stok 0).` },
              { status: 400 }
            );
          }

          if (qty > availableStock) {
            return NextResponse.json(
              { error: `Jumlah pemesanan "${dbProduct.name}" (${qty} item) melebihi stok yang tersedia (${availableStock} pcs).` },
              { status: 400 }
            );
          }
        }
      }

      const itemTotal = unitPrice * qty;
      serverSubtotal += itemTotal;

      validatedItems.push({
        id: productId,
        name: String(item.name || item.title || 'Produk Perabotan').substring(0, 80),
        quantity: qty,
        price: unitPrice,
        variantName: variantName
      });
    }

    const subtotal = serverSubtotal > 0 ? serverSubtotal : items.reduce((sum: number, i: any) => sum + (Number(i.price) * Number(i.quantity)), 0);

    // 2. Validate Voucher & Discounts Server-Side
    let promoDiscount = Number(clientPromoDiscount) || 0;
    let shippingDiscount = Number(clientShippingDiscount) || 0;

    if (promoCode && promoCode.trim()) {
      const cleanCode = promoCode.trim().toUpperCase();
      const dbVoucher = await db.voucher.findFirst({
        where: {
          code: cleanCode,
          isActive: true
        }
      });

      if (dbVoucher) {
        const scope = String(dbVoucher.scope || '').toUpperCase();
        const discVal = Number(dbVoucher.discountValue) || 0;
        const isPercentage = String(dbVoucher.discountType || '').toUpperCase() === 'PERCENTAGE';

        if (scope === 'SHIPPING' || cleanCode.startsWith('ONGKIR')) {
          shippingDiscount = isPercentage ? Math.round(((courier?.price || 15000) * discVal) / 100) : discVal;
        } else {
          promoDiscount = isPercentage ? Math.round((subtotal * discVal) / 100) : discVal;
        }
      }
    }

    // Fetch live ADMIN_FEE setting from DB
    let requestedFee = body.adminFee;
    if (requestedFee === undefined || requestedFee === null) {
      const dbFeeSetting = await db.systemSetting.findUnique({ where: { key: 'ADMIN_FEE' } });
      requestedFee = dbFeeSetting ? Number(dbFeeSetting.value) : ADMIN_FEE_IDR;
    }
    const adminFee = Math.max(0, Number(requestedFee) || 0);

    const rawShippingCost = courier?.price || 0;
    const finalShippingCost = Math.max(0, rawShippingCost - shippingDiscount);
    const grandTotal = Math.max(0, subtotal - promoDiscount + finalShippingCost + adminFee);

    // 3. Collision-free unique Order Number
    const orderId = `ORD-TJ-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;

    // Build Midtrans transaction items
    const midtransItems: any[] = validatedItems.map((i: any) => ({
      id: String(i.id).substring(0, 50),
      price: Math.round(i.price),
      quantity: i.quantity,
      name: String(i.name).substring(0, 50)
    }));

    if (finalShippingCost > 0) {
      midtransItems.push({
        id: 'SHIPPING_FEE',
        price: Math.round(finalShippingCost),
        quantity: 1,
        name: `Ongkir (${courier?.service_name || 'Expedisi'})`.substring(0, 50)
      });
    }

    if (adminFee > 0) {
      midtransItems.push({
        id: 'ADMIN_FEE',
        price: Math.round(adminFee),
        quantity: 1,
        name: 'Biaya Admin Transaksi'.substring(0, 50)
      });
    }

    if (promoDiscount > 0) {
      midtransItems.push({
        id: 'PROMO_DISCOUNT',
        price: -Math.round(promoDiscount),
        quantity: 1,
        name: 'Diskon Voucher Promo'.substring(0, 50)
      });
    }

    // 4. Save Order to PostgreSQL DB First (Strict Transaction)
    const createdOrder = await db.order.create({
      data: {
        orderNumber: orderId,
        orderType: isB2B ? 'B2B_WHOLESALE' : 'B2C_RETAIL',
        status: 'PENDING',
        customerName,
        customerPhone: customerPhone || '',
        customerEmail: customerEmail || authUser?.email || (customerPhone ? `${customerPhone}@customer.tri-j.co.id` : 'customer@tri-j.co.id'),
        companyName,
        taxNumber,
        shippingAddress,
        courierCode: courier?.courier_code || 'biteship',
        courierName: courier?.courier_name || 'Regular Logistics',
        courierService: courier?.service_name || 'Standard',
        shippingCost: finalShippingCost,
        subtotal,
        promoDiscount,
        shippingDiscount,
        adminFee,
        promoCode: promoCode || null,
        grandTotal,
        paymentMethod: 'MIDTRANS',
        userId: authUser ? authUser.id : undefined,
        items: {
          create: validatedItems.map((i: any) => ({
            productId: i.id,
            quantity: i.quantity,
            unitPrice: i.price,
            totalPrice: i.price * i.quantity,
            weightGram: 1000,
            variantName: i.variantName
          }))
        }
      },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    });

    // Increment voucher usage count if valid voucher was applied
    if (promoCode && promoCode.trim()) {
      await db.voucher.updateMany({
        where: { code: promoCode.trim().toUpperCase() },
        data: { usedCount: { increment: 1 } }
      }).catch((e) => console.warn('Increment voucher count error:', e));
    }

    // Increment product sold count in database dynamically
    for (const item of validatedItems) {
      if (item.id && typeof item.id === 'number') {
        try {
          const prod = await db.product.findUnique({ where: { id: item.id } });
          if (prod) {
            const currentSoldNum = parseInt(String(prod.sold || "0").replace(/\D/g, ""), 10) || 0;
            const newSoldNum = currentSoldNum + Number(item.quantity || 1);
            await db.product.update({
              where: { id: item.id },
              data: { sold: String(newSoldNum) }
            });
          }
        } catch (e) {
          console.warn('Increment product sold count error:', e);
        }
      }
    }

    // 5. Generate Midtrans Payment Token
    const snapResult = await createMidtransSnapTransaction({
      orderId: orderId,
      grossAmount: grandTotal,
      customerDetails: {
        first_name: customerName,
        email: customerEmail || authUser?.email || (customerPhone ? `${customerPhone}@customer.tri-j.co.id` : 'customer@tri-j.co.id'),
        phone: customerPhone || '08961656039',
        company: companyName,
        address: shippingAddress
      },
      items: midtransItems,
      isB2B: isB2B
    });

    // Save snap token to created order
    await db.order.update({
      where: { id: createdOrder.id },
      data: { snapToken: snapResult.token }
    });

    // Push order to Biteship Dashboard API
    try {
      const biteshipRes = await createBiteshipOrder({
        orderNumber: orderId,
        customerName: customerName || 'Pelanggan TRI J',
        customerPhone: customerPhone || '08961656039',
        customerEmail: customerEmail || authUser?.email,
        shippingAddress: shippingAddress,
        courierCompany: courier?.courier_code || 'jne',
        courierType: courier?.service_code || 'reg',
        items: validatedItems,
        grandTotal: grandTotal,
      });

      if (biteshipRes && biteshipRes.courier) {
        const waybill = biteshipRes.courier.waybill_id || biteshipRes.courier.tracking_id;
        if (waybill) {
          await db.order.update({
            where: { id: createdOrder.id },
            data: { waybillNumber: waybill }
          });
          createdOrder.waybillNumber = waybill;
        }
      }
    } catch (bErr) {
      console.warn('Pushing to Biteship Dashboard warning:', bErr);
    }

    return NextResponse.json({
      success: true,
      orderId: orderId,
      subtotal: subtotal,
      promoDiscount: promoDiscount,
      shippingCost: rawShippingCost,
      shippingDiscount: shippingDiscount,
      adminFee: adminFee,
      grandTotal: grandTotal,
      snapToken: snapResult.token,
      redirectUrl: snapResult.redirect_url,
      isSandboxDummy: snapResult.isSandboxDummy,
      order: createdOrder
    });
  } catch (error: any) {
    console.error('Checkout API error:', error);
    return NextResponse.json({ error: error.message || 'Gagal memproses checkout' }, { status: 500 });
  }
}
