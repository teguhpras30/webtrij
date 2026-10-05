/**
 * JNE Express Official Direct API Client
 * Supports:
 * 1. Tariff Calculation (pricedev)
 * 2. Generate Airwaybill / Cnote (generatecnote)
 * 3. Trace Tracking (list/v1/cnote/{AWB})
 */

export interface JnePriceItem {
  origin_name: string;
  destination_name: string;
  service_display: string; // e.g. "REG", "YES", "OKE", "JTR"
  service_code: string;    // e.g. "REG23", "YES23", "JTR18"
  goods_type: string;      // e.g. "Paket", "Document/Paket"
  currency: string;        // "IDR"
  price: string;           // e.g. "17000"
  etd_from: string;        // e.g. "1"
  etd_thru: string;        // e.g. "2"
  times: string;           // "D" (Days) or "H" (Hours)
}

export interface JneGenerateAwbParams {
  orderId: string;
  shipperName?: string;
  shipperAddr1?: string;
  shipperAddr2?: string;
  shipperCity?: string;
  shipperZip?: string;
  shipperPhone?: string;
  receiverName: string;
  receiverAddr1: string;
  receiverAddr2?: string;
  receiverCity: string;
  receiverZip?: string;
  receiverPhone: string;
  qty?: number;
  weightKg: number;
  goodsDesc?: string;
  goodsValue?: number;
  insuranceFlag?: "Y" | "N";
  originCode?: string;
  destCode: string;
  service?: string; // "REG", "YES", "JTR", "OKE"
  codFlag?: "YES" | "N";
  codAmount?: number;
}

const JNE_CONFIG = {
  username: process.env.JNE_USERNAME || "ORCHID",
  apiKey: process.env.JNE_API_KEY || "43224dedb229a64a7b0aca67615d8688",
  tariffUrl: process.env.JNE_TARIFF_URL || "https://apiv2.jne.co.id:10205/tracing/api/pricedev",
  generateUrl: process.env.JNE_GENERATE_URL || "https://apiv2.jne.co.id:10206/tracing/api/generatecnote",
  trackingUrl: process.env.JNE_TRACKING_URL || "https://apiv2.jne.co.id:10205/tracing/api/list/v1/cnote",
  defaultOrigin: process.env.JNE_DEFAULT_ORIGIN || "SUB10000",
  branch: process.env.JNE_BRANCH || "SUB",
  cust: process.env.JNE_CUST || "80540008",
};

/**
 * Intelligent mapping from Indonesian addresses or city/district names to JNE Destination Codes
 */
export function mapAddressToJneDestinationCode(addressOrCity: string): string {
  if (!addressOrCity) return "SUB10000";

  const raw = addressOrCity.toLowerCase();

  // East Java
  if (raw.includes("surabaya")) return "SUB10000";
  if (raw.includes("sidoarjo")) return "SDA10000";
  if (raw.includes("gresik")) return "GNS10000";
  if (raw.includes("malang") || raw.includes("batu")) return "MXG10000";
  if (raw.includes("mojokerto")) return "MJK10000";
  if (raw.includes("pasuruan")) return "PSI10000";
  if (raw.includes("kediri")) return "KDR10000";
  if (raw.includes("blitar")) return "BLI10000";
  if (raw.includes("madiun")) return "MNI10000";
  if (raw.includes("jember")) return "JBR10000";
  if (raw.includes("banyuwangi")) return "BWW10000";
  if (raw.includes("probolinggo")) return "PRO10000";
  if (raw.includes("tuban")) return "TBN10000";
  if (raw.includes("lamongan")) return "LMG10000";
  if (raw.includes("nganjuk")) return "NGK10000";
  if (raw.includes("ngawi")) return "NGW10000";
  if (raw.includes("tulungagung")) return "TLG10000";
  if (raw.includes("ponorogo")) return "PNO10000";
  if (raw.includes("lumajang")) return "LMJ10000";
  if (raw.includes("bojonegoro")) return "BJN10000";
  if (raw.includes("madura") || raw.includes("bangkalan") || raw.includes("sampang") || raw.includes("pamekasan") || raw.includes("sumenep")) return "BKL10000";

  // Jabodetabek & Banten
  if (raw.includes("jakarta") || raw.includes("dki")) return "CGK10000";
  if (raw.includes("bekasi") || raw.includes("cikarang")) return "BKS10000";
  if (raw.includes("bogor") || raw.includes("cibinong")) return "BOO10000";
  if (raw.includes("depok")) return "DPK10000";
  if (raw.includes("tangerang")) return "TGR10000";
  if (raw.includes("serang") || raw.includes("cilegon")) return "SRG10000";

  // West Java
  if (raw.includes("bandung") || raw.includes("cimahi")) return "BDO10000";
  if (raw.includes("cirebon")) return "CBN10000";
  if (raw.includes("tasikmalaya")) return "TSM10000";
  if (raw.includes("garut")) return "GRT10000";
  if (raw.includes("sukabumi")) return "SKB10000";
  if (raw.includes("karawang")) return "KRW10000";
  if (raw.includes("purwakarta")) return "PWK10000";
  if (raw.includes("subang")) return "SBG10000";
  if (raw.includes("indramayu")) return "IND10000";
  if (raw.includes("majalengka")) return "MJL10000";
  if (raw.includes("kuningan")) return "KNG10000";
  if (raw.includes("ciamis") || raw.includes("banjar")) return "CMS10000";

  // Central Java & DIY
  if (raw.includes("semarang")) return "SRG10000";
  if (raw.includes("solo") || raw.includes("surakarta")) return "SOC10000";
  if (raw.includes("yogyakarta") || raw.includes("jogja") || raw.includes("sleman") || raw.includes("bantul") || raw.includes("kulon")) return "JOG10000";
  if (raw.includes("magelang")) return "MGG10000";
  if (raw.includes("pekalongan")) return "PKL10000";
  if (raw.includes("tegal")) return "TGL10000";
  if (raw.includes("brebes")) return "BBS10000";
  if (raw.includes("kudus") || raw.includes("pati") || raw.includes("jepara")) return "KDS10000";
  if (raw.includes("purwokerto") || raw.includes("banyumas")) return "PWT10000";
  if (raw.includes("cilacap")) return "CXP10000";

  // Bali & Nusa Tenggara
  if (raw.includes("bali") || raw.includes("denpasar") || raw.includes("badung")) return "DPS10000";
  if (raw.includes("mataram") || raw.includes("lombok")) return "MTR10000";
  if (raw.includes("kupang")) return "KOE10000";

  // Sumatra
  if (raw.includes("medan") || raw.includes("sumatera utara")) return "MES10000";
  if (raw.includes("palembang") || raw.includes("sumatera selatan")) return "PLM10000";
  if (raw.includes("lampung")) return "TKG10000";
  if (raw.includes("padang") || raw.includes("sumatera barat")) return "PDG10000";
  if (raw.includes("pekanbaru") || raw.includes("riau")) return "PKU10000";
  if (raw.includes("batam")) return "BTH10000";
  if (raw.includes("jambi")) return "DJB10000";
  if (raw.includes("bengkulu")) return "BKS10000";
  if (raw.includes("aceh") || raw.includes("banda aceh")) return "BTJ10000";
  if (raw.includes("bangka") || raw.includes("pangkal pinang")) return "PGK10000";

  // Kalimantan
  if (raw.includes("balikpapan")) return "BPN10000";
  if (raw.includes("samarinda")) return "SRI10000";
  if (raw.includes("banjarmasin")) return "BDJ10000";
  if (raw.includes("pontianak")) return "PNK10000";
  if (raw.includes("palangkaraya")) return "PKY10000";
  if (raw.includes("tarakan")) return "TRK10000";

  // Sulawesi
  if (raw.includes("makassar") || raw.includes("ujung pandang")) return "UPG10000";
  if (raw.includes("manado")) return "MDC10000";
  if (raw.includes("palu")) return "PLW10000";
  if (raw.includes("kendari")) return "KDI10000";
  if (raw.includes("gorontalo")) return "GTO10000";

  // Maluku & Papua
  if (raw.includes("ambon")) return "AMQ10000";
  if (raw.includes("jayapura") || raw.includes("papua")) return "DJJ10000";

  // Default fallback to Surabaya or Jakarta
  return "SUB10000";
}

/**
 * 1. Fetch JNE Official Tariff Rates (Cek Ongkir)
 */
export async function getJneTariff(params: {
  originCode?: string;
  destinationCode: string;
  weightKg: number;
}): Promise<{ success: boolean; prices: JnePriceItem[]; error?: string }> {
  try {
    const fromCode = params.originCode || JNE_CONFIG.defaultOrigin;
    const thruCode = params.destinationCode || "CGK10000";
    const weight = Math.max(1, Math.ceil(params.weightKg || 1));

    const body = new URLSearchParams();
    body.append("username", JNE_CONFIG.username);
    body.append("api_key", JNE_CONFIG.apiKey);
    body.append("from", fromCode);
    body.append("thru", thruCode);
    body.append("weight", String(weight));

    const response = await fetch(JNE_CONFIG.tariffUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
        "User-Agent": "Tri-J-Ecommerce/1.0",
      },
      body: body.toString(),
    });

    if (!response.ok) {
      return { success: false, prices: [], error: `JNE Tariff HTTP ${response.status}` };
    }

    const data = await response.json();

    if (data && Array.isArray(data.price) && data.price.length > 0) {
      return { success: true, prices: data.price };
    }

    return {
      success: false,
      prices: [],
      error: data?.error || "Tarif JNE tidak ditemukan untuk rute ini.",
    };
  } catch (err: any) {
    console.error("JNE Tariff API Error:", err);
    return { success: false, prices: [], error: err.message || "Gagal menghubungi API JNE" };
  }
}

/**
 * 2. Generate Airwaybill / Cnote JNE
 */
export async function generateJneAirwaybill(params: JneGenerateAwbParams): Promise<{
  success: boolean;
  cnote?: string;
  error?: string;
  raw?: any;
}> {
  try {
    const body = new URLSearchParams();
    body.append("username", JNE_CONFIG.username);
    body.append("api_key", JNE_CONFIG.apiKey);
    body.append("OLSHOP_BRANCH", JNE_CONFIG.branch);
    body.append("OLSHOP_CUST", JNE_CONFIG.cust);
    body.append("OLSHOP_ORDERID", params.orderId.substring(0, 20));

    // Shipper (Tri-J Warehouse)
    body.append("OLSHOP_SHIPPER_NAME", (params.shipperName || "TRI J OFFICIAL STORE").substring(0, 30));
    body.append("OLSHOP_SHIPPER_ADDR1", (params.shipperAddr1 || "Manukan Wetan 60 Blok B No.19").substring(0, 30));
    body.append("OLSHOP_SHIPPER_ADDR2", (params.shipperAddr2 || "Kec. Tandes").substring(0, 30));
    body.append("OLSHOP_SHIPPER_CITY", (params.shipperCity || "SURABAYA").substring(0, 20));
    body.append("OLSHOP_SHIPPER_ZIP", (params.shipperZip || "60185").substring(0, 5));
    body.append("OLSHOP_SHIPPER_PHONE", (params.shipperPhone || "08961656039").replace(/\D/g, "").substring(0, 15));

    // Receiver (Customer)
    body.append("OLSHOP_RECEIVER_NAME", (params.receiverName || "Pelanggan").substring(0, 30));
    body.append("OLSHOP_RECEIVER_ADDR1", (params.receiverAddr1 || "Alamat Pengiriman").substring(0, 30));
    body.append("OLSHOP_RECEIVER_ADDR2", (params.receiverAddr2 || "-").substring(0, 30));
    body.append("OLSHOP_RECEIVER_CITY", (params.receiverCity || "JAKARTA").substring(0, 20));
    body.append("OLSHOP_RECEIVER_ZIP", (params.receiverZip || "10110").substring(0, 5));
    body.append("OLSHOP_RECEIVER_PHONE", (params.receiverPhone || "081234567890").replace(/\D/g, "").substring(0, 15));

    // Order Specifications
    body.append("OLSHOP_QTY", String(Math.max(1, params.qty || 1)));
    body.append("OLSHOP_WEIGHT", String(Math.max(1, Math.ceil(params.weightKg || 1))));
    body.append("OLSHOP_GOODSDESC", (params.goodsDesc || "Perabot Rumah Tangga TRI J").substring(0, 60));
    body.append("OLSHOP_GOODSVALUE", String(params.goodsValue || 150000));
    body.append("OLSHOP_GOODSTYPE", "2"); // Standard merchandise
    body.append("OLSHOP_INS_FLAG", params.insuranceFlag || "N");
    body.append("OLSHOP_ORIG", params.originCode || JNE_CONFIG.defaultOrigin);
    body.append("OLSHOP_DEST", params.destCode);
    body.append("OLSHOP_SERVICE", (params.service || "REG").toUpperCase());
    body.append("OLSHOP_COD_FLAG", params.codFlag || "N");
    body.append("OLSHOP_COD_AMOUNT", String(params.codAmount || 0));

    const response = await fetch(JNE_CONFIG.generateUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
        "User-Agent": "Tri-J-Ecommerce/1.0",
      },
      body: body.toString(),
    });

    const data = await response.json();

    if (data && data.detail && Array.isArray(data.detail) && data.detail[0]) {
      const detail = data.detail[0];
      if (detail.status === "sukses" || detail.status === "success") {
        return { success: true, cnote: detail.cnote_no, raw: data };
      } else {
        return { success: false, cnote: detail.cnote_no, error: detail.reason || "Gagal generate resi JNE", raw: data };
      }
    }

    return { success: false, error: data?.error || "Respon generate resi JNE tidak valid", raw: data };
  } catch (err: any) {
    console.error("JNE Generate AWB Error:", err);
    return { success: false, error: err.message || "Gagal menghubungi API Generate Cnote JNE" };
  }
}

/**
 * 3. Track Airwaybill / Cnote JNE
 */
export async function trackJneAirwaybill(awbNumber: string): Promise<{
  success: boolean;
  cnote?: any;
  history?: Array<{ date: string; desc: string; code: string }>;
  error?: string;
  raw?: any;
}> {
  try {
    const cleanAwb = encodeURIComponent(awbNumber.trim());
    const url = `${JNE_CONFIG.trackingUrl}/${cleanAwb}`;

    const body = new URLSearchParams();
    body.append("username", JNE_CONFIG.username);
    body.append("api_key", JNE_CONFIG.apiKey);

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
        "User-Agent": "Tri-J-Ecommerce/1.0",
      },
      body: body.toString(),
    });

    const data = await response.json();

    if (data && data.cnote) {
      return {
        success: true,
        cnote: data.cnote,
        history: data.history || [],
        raw: data,
      };
    }

    return {
      success: false,
      error: data?.error || "Data resi JNE tidak ditemukan",
      raw: data,
    };
  } catch (err: any) {
    console.error("JNE Tracking API Error:", err);
    return { success: false, error: err.message || "Gagal menghubungi server Tracking JNE" };
  }
}
