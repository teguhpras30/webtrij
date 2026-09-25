import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const adminFeeSetting = await db.systemSetting.findUnique({
      where: { key: 'ADMIN_FEE' }
    });

    const adminFee = adminFeeSetting ? Number(adminFeeSetting.value) : 2500;

    return NextResponse.json({
      adminFee
    });
  } catch (error: any) {
    console.error('Error fetching public settings:', error);
    return NextResponse.json({ adminFee: 2500 });
  }
}
