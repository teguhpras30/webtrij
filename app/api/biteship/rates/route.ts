import { NextResponse } from 'next/server';
import { calculateBiteshipShippingRates } from '@/lib/biteship';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { destinationArea, totalWeightGram, isB2B } = body;

    const result = await calculateBiteshipShippingRates({
      destinationArea: destinationArea || 'DKI Jakarta',
      totalWeightGram: totalWeightGram || 1000,
      isB2B: Boolean(isB2B)
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Biteship API error:', error);
    return NextResponse.json({ error: error.message || 'Gagal menghitung tarif Biteship' }, { status: 500 });
  }
}
