import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || 'provinces';
  const id = searchParams.get('id');
  const query = searchParams.get('q') || searchParams.get('input') || searchParams.get('query');

  const apiKey = process.env.BITESHIP_API_KEY || 'biteship_test.eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoid2VidHJpaiIsInVzZXJJZCI6IjZhNzE0ZjljYTgzMWYwZTg1ZTNkMzAwNiIsImlhdCI6MTc4NjQzMDk5NH0.guow6te6PSCmjMC7-JpZzo4CUSvWJLiL2ihZNmSSoDI';

  // 1. If query is provided, search directly via Official Biteship Maps Area API
  if (query && query.trim().length >= 2) {
    try {
      const biteshipUrl = `https://api.biteship.com/v1/maps/areas?countries=ID&input=${encodeURIComponent(query.trim())}`;
      const resBiteship = await fetch(biteshipUrl, {
        headers: {
          'Authorization': apiKey,
          'Content-Type': 'application/json'
        },
        next: { revalidate: 3600 } // Cache location search results for 1 hour
      });

      if (resBiteship.ok) {
        const data = await resBiteship.json();
        if (data.areas && Array.isArray(data.areas)) {
          const formattedAreas = data.areas.map((a: any) => {
            // Extract 5-digit postal code from name string if postal_code field is absent
            let postalCode = a.postal_code;
            if (!postalCode && a.name) {
              const match = a.name.match(/\b\d{5}\b/);
              if (match) postalCode = parseInt(match[0], 10);
            }

            return {
              id: a.id,
              name: a.name,
              postalCode: postalCode || 60199,
              countryName: a.country_name || "Indonesia",
              province: a.administrative_division_level_1_name || "",
              city: a.administrative_division_level_2_name || "",
              district: a.administrative_division_level_3_name || ""
            };
          });

          return NextResponse.json({
            success: true,
            source: 'biteship',
            areas: formattedAreas
          });
        }
      }
    } catch (bErr) {
      console.warn('Biteship Maps API search fallback:', bErr);
    }
  }

  // 2. Fallback to emsifa Indonesian Administrative Region API
  try {
    let targetUrl = 'https://emsifa.github.io/api-wilayah-indonesia/api/provinces.json';

    if (type === 'regencies' && id) {
      targetUrl = `https://emsifa.github.io/api-wilayah-indonesia/api/regencies/${id}.json`;
    } else if (type === 'districts' && id) {
      targetUrl = `https://emsifa.github.io/api-wilayah-indonesia/api/districts/${id}.json`;
    } else if (type === 'villages' && id) {
      targetUrl = `https://emsifa.github.io/api-wilayah-indonesia/api/villages/${id}.json`;
    }

    const res = await fetch(targetUrl, {
      headers: { 'User-Agent': 'WebTRIJ-Ecommerce/1.0' },
      next: { revalidate: 86400 } // Cache for 24 hours
    });

    if (!res.ok) throw new Error(`API fetch error status ${res.status}`);

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err: any) {
    console.error('Wilayah API Route Error:', err);
    return NextResponse.json({ error: err.message || 'Gagal mengambil data wilayah' }, { status: 500 });
  }
}
