export interface VoucherDefinition {
  code: string;
  type: 'shipping_discount' | 'product_discount' | 'cashback';
  discountType: 'percentage' | 'fixed';
  value: number; // percentage value or fixed IDR
  maxDiscount?: number;
  minSpend?: number;
  title: string;
  subtitle: string;
  description: string;
  categoryLabel: string;
  expiryDate: string;
  isLimited?: boolean;
  progressPercent?: number;
  tagOutline?: string;
}

export const ADMIN_FEE_IDR = 2500;

export const AVAILABLE_VOUCHERS: VoucherDefinition[] = [];

export function mapDbVoucherToDefinition(dbV: any): VoucherDefinition {
  const code = String(dbV.code || '').trim().toUpperCase();
  const scope = String(dbV.scope || '').toUpperCase();
  const isShipping =
    scope === 'SHIPPING' ||
    code.includes('ONGKIR') ||
    code.includes('FREE') ||
    Boolean(dbV.isOngkirTemplate);
  const type = isShipping ? 'shipping_discount' : 'product_discount';
  const discountType = String(dbV.discountType || '').toUpperCase() === 'PERCENTAGE' ? 'percentage' : 'fixed';
  const value = Number(dbV.discountValue) || 0;
  const minSpend = Number(dbV.minPurchase) || 0;
  const maxDiscount = dbV.maxDiscount ? Number(dbV.maxDiscount) : undefined;
  
  const formattedValue = discountType === 'percentage' 
    ? `${value}%` 
    : `Rp ${value.toLocaleString('id-ID')}`;

  const title = isShipping 
    ? `Gratis Ongkir` 
    : `Diskon ${formattedValue}`;

  const subtitle = minSpend > 0 
    ? `Min. Blj Rp ${minSpend.toLocaleString('id-ID')}` 
    : `Min. Blj Rp 0`;

  const description = isShipping
    ? `Voucher ${code} - Gratis Ongkir (${minSpend > 0 ? `Min. Belanja Rp ${minSpend.toLocaleString('id-ID')}` : 'Tanpa Min. Belanja'})`
    : `Voucher ${code} - Potongan ${formattedValue} (${minSpend > 0 ? `Min. Belanja Rp ${minSpend.toLocaleString('id-ID')}` : 'Tanpa Min. Belanja'})`;
  const expiryDate = dbV.endDate ? new Date(dbV.endDate).toLocaleDateString('id-ID') : 'Tanpa Batas';
  const usageLimit = Number(dbV.usageLimit) || 0;
  const usedCount = Number(dbV.usedCount) || 0;

  return {
    code,
    type,
    discountType,
    value,
    minSpend,
    maxDiscount,
    title,
    subtitle,
    description,
    categoryLabel: isShipping ? 'Gratis Ongkir' : 'Diskon',
    expiryDate,
    isLimited: usageLimit > 0,
    progressPercent: usageLimit > 0 ? Math.round((usedCount / usageLimit) * 100) : 0,
    tagOutline: isShipping ? 'Semua Metode' : 'Voucher Toko',
  };
}

export function validateAndApplyVoucher(
  code: string,
  subtotal: number,
  shippingCost: number,
  customVouchers?: VoucherDefinition[]
): {
  valid: boolean;
  message: string;
  promoDiscount: number;
  shippingDiscount: number;
  appliedVoucher?: VoucherDefinition;
} {
  const normalizedCode = code.trim().toUpperCase();
  const voucherList = customVouchers && customVouchers.length > 0 ? customVouchers : AVAILABLE_VOUCHERS;
  const found = voucherList.find((v) => v.code === normalizedCode);

  if (!found) {
    return {
      valid: false,
      message: 'Kode voucher tidak valid atau sudah kedaluwarsa.',
      promoDiscount: 0,
      shippingDiscount: 0
    };
  }

  if (found.minSpend && subtotal < found.minSpend) {
    return {
      valid: false,
      message: `Minimal belanja untuk kode ${found.code} adalah Rp ${found.minSpend.toLocaleString('id-ID')}`,
      promoDiscount: 0,
      shippingDiscount: 0
    };
  }

  let promoDiscount = 0;
  let shippingDiscount = 0;

  if (found.type === 'product_discount' || found.type === 'cashback') {
    if (found.discountType === 'percentage') {
      let calc = (subtotal * found.value) / 100;
      if (found.maxDiscount && calc > found.maxDiscount) {
        calc = found.maxDiscount;
      }
      promoDiscount = Math.round(calc);
    } else {
      promoDiscount = Math.min(subtotal, found.value);
    }
  } else if (found.type === 'shipping_discount') {
    shippingDiscount = Math.min(shippingCost, found.value);
  }

  return {
    valid: true,
    message: `Voucher ${found.code} Berhasil Dipasang! (${found.description})`,
    promoDiscount,
    shippingDiscount,
    appliedVoucher: found
  };
}

export function validateDualVouchers(
  shippingCode: string,
  discountCode: string,
  subtotal: number,
  shippingCost: number,
  customVouchers?: VoucherDefinition[]
): {
  promoDiscount: number;
  shippingDiscount: number;
  shippingVoucher?: VoucherDefinition;
  discountVoucher?: VoucherDefinition;
} {
  let promoDiscount = 0;
  let shippingDiscount = 0;
  let shippingVoucher: VoucherDefinition | undefined = undefined;
  let discountVoucher: VoucherDefinition | undefined = undefined;

  if (shippingCode) {
    const res = validateAndApplyVoucher(shippingCode, subtotal, shippingCost, customVouchers);
    if (res.valid) {
      shippingDiscount = res.shippingDiscount;
      shippingVoucher = res.appliedVoucher;
    }
  }

  if (discountCode) {
    const res = validateAndApplyVoucher(discountCode, subtotal, shippingCost, customVouchers);
    if (res.valid) {
      promoDiscount = res.promoDiscount;
      discountVoucher = res.appliedVoucher;
    }
  }

  return {
    promoDiscount,
    shippingDiscount,
    shippingVoucher,
    discountVoucher
  };
}

export function findBestAutoVouchers(
  subtotal: number,
  shippingCost: number = 15000
): {
  bestShippingCode: string;
  bestDiscountCode: string;
  maxDiscountAmount: number;
  maxShippingAmount: number;
} {
  let bestDiscountVoucher: VoucherDefinition | undefined = undefined;
  let maxDiscountAmount = -1;

  let bestShippingVoucher: VoucherDefinition | undefined = undefined;
  let maxShippingAmount = -1;

  for (const v of AVAILABLE_VOUCHERS) {
    if (v.minSpend && subtotal < v.minSpend) continue;

    if (v.type === 'product_discount' || v.type === 'cashback') {
      let calc = 0;
      if (v.discountType === 'percentage') {
        calc = (subtotal * v.value) / 100;
        if (v.maxDiscount && calc > v.maxDiscount) calc = v.maxDiscount;
      } else {
        calc = Math.min(subtotal, v.value);
      }
      if (calc > maxDiscountAmount) {
        maxDiscountAmount = Math.round(calc);
        bestDiscountVoucher = v;
      }
    } else if (v.type === 'shipping_discount') {
      const calc = Math.min(shippingCost, v.value);
      if (calc > maxShippingAmount) {
        maxShippingAmount = calc;
        bestShippingVoucher = v;
      }
    }
  }

  return {
    bestShippingCode: bestShippingVoucher?.code || 'ONGKIRFREE',
    bestDiscountCode: bestDiscountVoucher?.code || 'EVERHOME10',
    maxDiscountAmount: Math.max(0, maxDiscountAmount),
    maxShippingAmount: Math.max(0, maxShippingAmount)
  };
}
