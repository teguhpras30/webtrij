import { db } from "@/lib/db";

/**
 * Server-Side Biteship Shipping Aggregator Service
 * Supporting JNE, SiCepat, GoSend, Grab, J&T, and Freight Cargo.
 */

export interface BiteshipRateRequest {
  destinationArea?: string;
  totalWeightGram: number;
  lengthCm?: number;
  widthCm?: number;
  heightCm?: number;
  isB2B?: boolean;
}

export interface BiteshipCourierOption {
  courier_code: string;
  courier_name: string;
  service_code: string;
  service_name: string;
  etd: string;
  price: number;
  description: string;
  icon: string;
}

function extractPostalCodeFromAddress(address: string, fallbackCode?: number): number {
  if (fallbackCode && fallbackCode > 10000) return fallbackCode;
  if (!address) return 60199;

  const match = address.match(/\b\d{5}\b/);
  if (match) {
    return parseInt(match[0], 10);
  }

  const addrLower = address.toLowerCase();
  if (addrLower.includes('benowo') || addrLower.includes('kandangan') || addrLower.includes('wisma tengger')) return 60199;
  if (addrLower.includes('tandes') || addrLower.includes('manukan')) return 60185;
  if (addrLower.includes('cikarang') || addrLower.includes('bekasi')) return 17530;
  if (addrLower.includes('tegalsari')) return 60261;

  return 60199;
}

export async function calculateBiteshipShippingRates(params: BiteshipRateRequest) {
  const apiKey = process.env.BITESHIP_API_KEY || '';
  const weightGram = Math.max(1000, params.totalWeightGram || 1000);
  const weightKg = Math.max(1, Math.ceil(weightGram / 1000));
  const itemLength = Math.max(1, params.lengthCm || 20);
  const itemWidth = Math.max(1, params.widthCm || 20);
  const itemHeight = Math.max(1, params.heightCm || 20);

  // Try calling real Biteship API endpoint if API key is present
  if (apiKey && (apiKey.startsWith('biteship_test.') || apiKey.startsWith('biteship_live.'))) {
    try {
      const response = await fetch('https://api.biteship.com/v1/rates/couriers', {
        method: 'POST',
        headers: {
          'Authorization': apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          origin_postal_code: 60185, // Surabaya Warehouse
          destination_postal_code: extractPostalCodeFromAddress(params.destinationArea || ''),
          couriers: 'jne,sicepat,jnt,gosend,grab,anteraja,pos,tiki,lion',
          items: [
            {
              name: 'Houseware Products',
              description: 'Perlengkapan Rumah Tangga',
              value: 150000,
              length: itemLength,
              width: itemWidth,
              height: itemHeight,
              weight: weightGram,
              quantity: 1
            }
          ]
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.pricing && Array.isArray(data.pricing) && data.pricing.length > 0) {
          const apiRates: BiteshipCourierOption[] = data.pricing.map((item: any) => {
            const courierCode = (item.courier_code || '').toLowerCase();
            const serviceCode = (item.courier_service_code || '').toLowerCase();
            const serviceName = (item.courier_service_name || '').toLowerCase();

            let icon = '🚚';
            if (serviceCode.includes('instant') || serviceCode.includes('sameday') || courierCode.includes('gosend') || courierCode.includes('grab')) {
              icon = '🛵';
            } else if (serviceCode.includes('cargo') || serviceCode.includes('gokil') || serviceCode.includes('jtr') || serviceName.includes('cargo') || serviceName.includes('kargo') || serviceName.includes('trucking')) {
              icon = '🚛';
            } else if (serviceCode.includes('halu') || serviceCode.includes('eco') || serviceCode.includes('oke') || serviceName.includes('hemat') || serviceName.includes('economy')) {
              icon = '💡';
            }

            const rawService = (item.courier_service_code || 'reg').toLowerCase();
            const uniqueServiceCode = rawService.includes(courierCode)
              ? rawService
              : `${courierCode}_${rawService}`;

            return {
              courier_code: item.courier_code || 'biteship',
              courier_name: item.courier_name || 'Kurir Logistik',
              service_code: uniqueServiceCode,
              service_name: `${item.courier_name} ${item.courier_service_name || ''}`.trim(),
              etd: item.shipment_duration_range ? `${item.shipment_duration_range} ${item.shipment_duration_unit || 'Hari'}` : '1-2 Hari',
              price: item.price || 12000,
              description: item.type ? `Layanan Pengiriman ${item.type}` : 'Pengiriman Terverifikasi Biteship',
              icon
            };
          });

          return {
            status: 'success',
            origin: 'Gudang Utama Surabaya, Jawa Timur',
            destination: params.destinationArea || 'Surabaya & Sekitarnya',
            weight_kg: weightKg,
            rates: apiRates,
            isRealApi: true
          };
        }
      } else {
        console.warn('Biteship API returned non-200 response, using optimized rate fallback');
      }
    } catch (err) {
      console.warn('Biteship API call error, falling back to simulated rates:', err);
    }
  }

  // Realistic fallback rate calculations including Hemat & Cargo options
  const rates: BiteshipCourierOption[] = [
    {
      courier_code: 'sicepat',
      courier_name: 'SiCepat Halu',
      service_code: 'sicepat_halu',
      service_name: 'SiCepat HALU (Hemat)',
      etd: '2 - 3 Hari Kerja',
      price: Math.max(9000, 8500 * weightKg),
      description: 'Tarif super hemat ekonomis ke seluruh Indonesia',
      icon: '💡'
    },
    {
      courier_code: 'jne',
      courier_name: 'JNE Express',
      service_code: 'jne_reg',
      service_name: 'JNE REG (Regular)',
      etd: '1 - 2 Hari Kerja',
      price: 12000 * weightKg,
      description: 'Layanan pengiriman reguler terpercaya',
      icon: '🚚'
    },
    {
      courier_code: 'sicepat',
      courier_name: 'SiCepat Cargo',
      service_code: 'sicepat_gokil',
      service_name: 'SiCepat GOKIL (Cargo Pack)',
      etd: '2 - 4 Hari Kerja',
      price: Math.max(35000, 6500 * weightKg),
      description: 'Tarif kargo hemat untuk pengiriman besar',
      icon: '🚛'
    },
    {
      courier_code: 'jne',
      courier_name: 'JNE Express',
      service_code: 'jne_jtr',
      service_name: 'JNE JTR (Cargo Trucking)',
      etd: '2 - 4 Hari Kerja',
      price: Math.max(30000, 6000 * weightKg),
      description: 'Layanan kargo hemat JNE khusus barang besar & berat',
      icon: '🚛'
    },
    {
      courier_code: 'jne',
      courier_name: 'JNE Express',
      service_code: 'jne_yes',
      service_name: 'JNE YES (Yakin Esok Sampai)',
      etd: '1 Hari (Besok Sampai)',
      price: 24000 * weightKg,
      description: 'Pengiriman prioritas esok hari',
      icon: '⚡'
    },
    {
      courier_code: 'sicepat',
      courier_name: 'SiCepat Ekspres',
      service_code: 'sicepat_reg',
      service_name: 'SiCepat REG',
      etd: '1 - 2 Hari Kerja',
      price: 11500 * weightKg,
      description: 'Cepat dan bersahabat ke seluruh Indonesia',
      icon: '⚡'
    }
  ];

  if (weightKg >= 5 || params.isB2B) {
    rates.push({
      courier_code: 'sicepat',
      courier_name: 'SiCepat Cargo',
      service_code: 'sicepat_gokil',
      service_name: 'SiCepat GOKIL (Cargo Pack)',
      etd: '2 - 4 Hari Kerja',
      price: Math.max(35000, 6500 * weightKg),
      description: 'Tarif kargo hemat untuk pengiriman besar',
      icon: '🚛'
    });
  }

  const destLower = (params.destinationArea || '').toLowerCase();
  const isInstantArea = destLower.includes('surabaya') || destLower.includes('jakarta') || destLower.includes('bogor') || destLower.includes('depok') || destLower.includes('tangerang') || destLower.includes('bekasi');

  if (isInstantArea && params.totalWeightGram <= 20000) {
    rates.push({
      courier_code: 'gosend',
      courier_name: 'GoSend Instant',
      service_code: 'gosend_instant',
      service_name: 'GoSend Instant Courier',
      etd: '1 - 3 Jam',
      price: 28000 + (weightKg > 5 ? (weightKg - 5) * 3000 : 0),
      description: 'Pengiriman kurir instan cepat sampai dalam hitungan jam',
      icon: '🛵'
    });
    rates.push({
      courier_code: 'grab',
      courier_name: 'GrabExpress Instant',
      service_code: 'grab_instant',
      service_name: 'GrabExpress Instant Bike',
      etd: '1 - 3 Jam',
      price: 29000 + (weightKg > 5 ? (weightKg - 5) * 3000 : 0),
      description: 'Pengiriman instan armada Grab Express',
      icon: '🛵'
    });
  }

  if (params.isB2B || weightKg >= 15) {
    rates.push({
      courier_code: 'biteship_cargo',
      courier_name: 'Biteship Heavy Fleet Cargo',
      service_code: 'biteship_trucking',
      service_name: 'Biteship Truk CDD / FTL Cargo',
      etd: '1 - 3 Hari Kerja',
      price: Math.max(150000, 4500 * weightKg),
      description: 'Truk kargo khusus proyek industri & Grosir B2B',
      icon: '🚛'
    });
  }

  return {
    status: 'success',
    origin: 'Gudang Utama Surabaya, Jawa Timur',
    destination: params.destinationArea || 'Surabaya & Sekitarnya',
    weight_kg: weightKg,
    rates: rates
  };
}

export async function createBiteshipOrder(params: {
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  shippingAddress: string;
  postalCode?: number;
  courierCompany?: string;
  courierType?: string;
  items: any[];
  grandTotal: number;
}) {
  const apiKey = process.env.BITESHIP_API_KEY || '';
  if (!apiKey) return null;

  try {
    // Sanitize courier company & service type for Biteship API
    const rawCompany = String(params.courierCompany || 'jne').toLowerCase();
    const rawType = String(params.courierType || 'reg').toLowerCase();

    let courierCompany = 'jne';
    if (rawCompany.includes('sicepat')) courierCompany = 'sicepat';
    else if (rawCompany.includes('jnt') || rawCompany.includes('j&t')) courierCompany = 'jnt';
    else if (rawCompany.includes('gosend')) courierCompany = 'gosend';
    else if (rawCompany.includes('grab')) courierCompany = 'grab';
    else if (rawCompany.includes('anteraja')) courierCompany = 'anteraja';
    else if (rawCompany.includes('tiki')) courierCompany = 'tiki';
    else if (rawCompany.includes('pos')) courierCompany = 'pos';
    else courierCompany = 'jne';

    let courierType = 'reg';
    if (rawType.includes('yes') || rawType.includes('express') || rawType.includes('instant') || rawType.includes('sameday')) {
      courierType = 'yes';
    } else if (rawType.includes('gokil') || rawType.includes('cargo') || rawType.includes('trucking')) {
      courierType = 'cargo';
    } else {
      courierType = 'reg';
    }

    // Fetch dynamic Warehouse Origin Address from DB or use default Gudang Utama
    let originContactName = "TRI J Official Store";
    let originContactPhone = "08961656039";
    let originAddress = "Manukan Wetan 60 Blok B No.19 Kec. Tandes, Surabaya, Jawa Timur 60185";
    let originPostalCode = 60185;

    try {
      const setting = await db.systemSetting.findUnique({ where: { key: "WAREHOUSE_ORIGIN" } });
      if (setting && setting.value) {
        const parsed = JSON.parse(setting.value);
        if (parsed.contactName) originContactName = parsed.contactName;
        if (parsed.contactPhone) originContactPhone = parsed.contactPhone;
        if (parsed.address) originAddress = parsed.address;
        if (parsed.postalCode) originPostalCode = Number(parsed.postalCode);
      }
    } catch (e) {}

    const destPostalCode = extractPostalCodeFromAddress(params.shippingAddress || '', params.postalCode);

    const payload = {
      origin_contact_name: originContactName,
      origin_contact_phone: originContactPhone,
      origin_address: originAddress,
      origin_postal_code: originPostalCode,

      destination_contact_name: params.customerName || "Pelanggan TRI J",
      destination_contact_phone: params.customerPhone || "08961656039",
      destination_address: params.shippingAddress || "Alamat Pembeli",
      destination_postal_code: destPostalCode,

      courier_company: courierCompany,
      courier_type: courierType,
      delivery_type: "now",

      items: (params.items || []).map((i: any) => {
        const baseName = String(i.name || i.product?.name || "Perabot TRI J");
        const variant = i.variantName || i.selectedVariant?.name || i.variant;
        const fullName = variant && !baseName.includes(variant) ? `${baseName} (Varian: ${variant})` : baseName;

        return {
          name: fullName.substring(0, 100),
          description: variant ? `Varian: ${variant}` : "Perabotan Rumah Tangga",
          value: Number(i.unitPrice || i.price || 100000),
          weight: Number(i.weightGram || 1000),
          quantity: Number(i.quantity || 1),
        };
      }),
    };

    const res = await fetch("https://api.biteship.com/v1/orders", {
      method: "POST",
      headers: {
        Authorization: apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      const data = await res.json();
      console.log(`✅ Order ${params.orderNumber} successfully pushed to Biteship Dashboard! ID: ${data.id}`);
      return data;
    } else {
      const errData = await res.json();
      console.warn(`⚠️ Biteship push warning for ${params.orderNumber}:`, errData);
      return null;
    }
  } catch (err) {
    console.error("Biteship push order error:", err);
    return null;
  }
}
