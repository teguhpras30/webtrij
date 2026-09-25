import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getAuthenticatedUser();
    if (!user || user.role?.trim().toUpperCase() !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const settingsList = await db.systemSetting.findMany();
    const settingsMap: Record<string, string> = {};
    settingsList.forEach((s) => {
      settingsMap[s.key] = s.value;
    });

    const adminFee = settingsMap['ADMIN_FEE'] ? Number(settingsMap['ADMIN_FEE']) : 2500;

    let warehouses = [
      {
        id: "wh-nganjuk-1",
        name: "Gudang Utama Kertosono (Nganjuk)",
        contactName: "TRI J Official Store",
        contactPhone: "08961656039",
        address: "Perumahan Graha Tanjung Jalan Merapi Rt 2 Rw 4 Blok C 8 Dsn Gondang Tanjung, KERTOSONO, KAB. NGANJUK, JAWA TIMUR",
        postalCode: 64315,
        isPrimary: true,
      },
      {
        id: "wh-cikarang-2",
        name: "Gudang Cabang Cikarang (Bekasi)",
        contactName: "TRI J Warehouse Cikarang",
        contactPhone: "08961656039",
        address: "Kawasan Industri Cikarang, Cikarang Pusat, Kab. Bekasi, Jawa Barat",
        postalCode: 17530,
        isPrimary: false,
      },
    ];

    if (settingsMap['WAREHOUSES_LIST']) {
      try {
        const parsed = JSON.parse(settingsMap['WAREHOUSES_LIST']);
        if (Array.isArray(parsed) && parsed.length > 0) {
          warehouses = parsed;
        }
      } catch (e) {}
    } else if (settingsMap['WAREHOUSE_ORIGIN']) {
      try {
        const singleObj = JSON.parse(settingsMap['WAREHOUSE_ORIGIN']);
        if (singleObj && singleObj.address) {
          warehouses[0] = {
            ...warehouses[0],
            contactName: singleObj.contactName || warehouses[0].contactName,
            contactPhone: singleObj.contactPhone || warehouses[0].contactPhone,
            address: singleObj.address,
            postalCode: Number(singleObj.postalCode) || 64315,
          };
        }
      } catch (e) {}
    }

    return NextResponse.json({
      adminFee,
      warehouses,
      settings: settingsMap
    });
  } catch (error: any) {
    console.error('Error fetching admin settings:', error);
    return NextResponse.json({ error: error.message || 'Gagal mengambil pengaturan' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getAuthenticatedUser();
    if (!user || user.role?.trim().toUpperCase() !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { adminFee, warehouses, livechatForwardWaNumbers } = body;

    if (adminFee !== undefined && adminFee !== null) {
      const feeVal = Math.max(0, Number(adminFee) || 0);
      await db.systemSetting.upsert({
        where: { key: 'ADMIN_FEE' },
        update: { value: String(feeVal) },
        create: { key: 'ADMIN_FEE', value: String(feeVal) }
      });
    }

    if (livechatForwardWaNumbers !== undefined) {
      await db.systemSetting.upsert({
        where: { key: 'LIVECHAT_FORWARD_WA_NUMBERS' },
        update: { value: String(livechatForwardWaNumbers || '').trim() },
        create: { key: 'LIVECHAT_FORWARD_WA_NUMBERS', value: String(livechatForwardWaNumbers || '').trim() }
      });
    }

    if (Array.isArray(warehouses) && warehouses.length > 0) {
      await db.systemSetting.upsert({
        where: { key: 'WAREHOUSES_LIST' },
        update: { value: JSON.stringify(warehouses) },
        create: { key: 'WAREHOUSES_LIST', value: JSON.stringify(warehouses) }
      });

      const primary = warehouses.find((w: any) => w.isPrimary) || warehouses[0];
      await db.systemSetting.upsert({
        where: { key: 'WAREHOUSE_ORIGIN' },
        update: { value: JSON.stringify(primary) },
        create: { key: 'WAREHOUSE_ORIGIN', value: JSON.stringify(primary) }
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Pengaturan Toko berhasil diperbarui'
    });
  } catch (error: any) {
    console.error('Error updating admin settings:', error);
    return NextResponse.json({ error: error.message || 'Gagal memperbarui pengaturan' }, { status: 500 });
  }
}
