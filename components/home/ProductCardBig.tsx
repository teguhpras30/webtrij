"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { Ticket, AlertCircle } from "lucide-react";
import { createProductSlug } from "@/lib/slug";

interface ProductCardBigProps {
  product: any;
}

function safeImageSrc(src?: string): string {
  if (!src || !src.trim()) return "https://placehold.co/600x600?text=No+Image";
  const clean = src.trim();
  if (clean.startsWith("http://") || clean.startsWith("https://") || clean.startsWith("/")) {
    return clean;
  }
  return `/${clean}`;
}

export default function ProductCardBig({ product }: ProductCardBigProps) {
  const { user } = useAuth();
  const { mode, getEffectiveUnitPrice } = useCart();

  const imgSrc = safeImageSrc(product?.image || product?.thumbnail);

  // Check if all stocks are 0
  const getTotalStock = (prod: any) => {
    if (prod?.variants && Array.isArray(prod.variants) && prod.variants.length > 0) {
      return prod.variants.reduce((sum: number, v: any) => sum + (Number(v.stock) || 0), 0);
    }
    return prod?.stock !== undefined && prod?.stock !== null ? Number(prod.stock) : 0;
  };

  const totalStock = getTotalStock(product);
  const isOutOfStock = totalStock <= 0;

  // Calculate the lowest (cheapest) variant price
  const getCheapestPrice = (prod: any) => {
    if (prod?.variants && Array.isArray(prod.variants) && prod.variants.length > 0) {
      const variantPrices = prod.variants
        .map((v: any) => Number(v.price))
        .filter((p: number) => !isNaN(p) && p > 0);
      if (variantPrices.length > 0) {
        return Math.min(...variantPrices);
      }
    }
    return prod?.retailPrice || 0;
  };

  const basePrice = getCheapestPrice(product);
  const effectivePrice = getEffectiveUnitPrice
    ? getEffectiveUnitPrice({ ...product, retailPrice: basePrice }, mode === 'b2b' ? (product.moq || 1) : 1, mode)
    : basePrice;

  const [activeVouchers, setActiveVouchers] = useState<any[]>([]);

  useEffect(() => {
    let isMounted = true;
    fetch("/api/public/vouchers")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (isMounted && Array.isArray(data)) {
          setActiveVouchers(data);
        }
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, []);

  // Subtract store/product voucher discount available to the user (verifying minPurchase condition)
  const getVoucherDiscountedPrice = (price: number, prod: any) => {
    if (!price || price <= 0) return price;

    // Hanya berikan diskon jika ADA voucher aktif yang valid dari database
    if (!activeVouchers || activeVouchers.length === 0) {
      return price;
    }

    const now = new Date();

    const shopDiscountVouchers = activeVouchers.filter((v: any) => {
      // 1. Voucher harus berstatus aktif
      if (!v.isActive) return false;

      // 2. Cek masa berlaku voucher (startDate dan endDate)
      if (v.startDate && new Date(v.startDate) > now) return false;
      if (v.endDate && new Date(v.endDate) < now) return false;

      // 3. Cek kuota pemakaian (usageLimit)
      if (v.usageLimit && Number(v.usageLimit) > 0 && Number(v.usedCount || 0) >= Number(v.usageLimit)) {
        return false;
      }

      // 4. Pisahkan voucher diskon produk/toko dari voucher ongkir
      const code = String(v.code || "").toUpperCase();
      const scope = String(v.scope || "").toUpperCase();
      const isShipping =
        scope === "SHIPPING" ||
        code.includes("ONGKIR") ||
        code.includes("FREE") ||
        Boolean(v.isOngkirTemplate);

      if (isShipping) return false;

      // 5. Cek cakupan produk (SHOP, ALL, atau khusus produk tertentu)
      const isEligibleScope =
        scope === "SHOP" ||
        scope === "ALL" ||
        !scope ||
        (scope === "PRODUCT" &&
          Array.isArray(v.targetProductIds) &&
          v.targetProductIds.map(Number).includes(Number(prod.id)));

      return isEligibleScope;
    });

    if (shopDiscountVouchers.length === 0) {
      return price;
    }

    let maxDiscount = 0;
    for (const voc of shopDiscountVouchers) {
      const minP = Number(voc.minPurchase) || 0;
      // Harus memenuhi syarat minimal pembelian
      if (price < minP) continue;

      let discount = 0;
      if (String(voc.discountType).toUpperCase() === "PERCENTAGE") {
        discount = (price * Number(voc.discountValue)) / 100;
        if (voc.maxDiscount && Number(voc.maxDiscount) > 0) {
          discount = Math.min(discount, Number(voc.maxDiscount));
        }
      } else {
        discount = Number(voc.discountValue) || 0;
      }

      if (discount > maxDiscount) {
        maxDiscount = discount;
      }
    }

    if (maxDiscount > 0) {
      return Math.max(0, Math.round(price - maxDiscount));
    }

    // Jika tidak ada voucher yang aktif / memenuhi syarat, kembalikan harga normal (tidak ada harga coret)
    return price;
  };

  const finalVoucherPrice = getVoucherDiscountedPrice(effectivePrice, product);

  const formatIDR = (val: number) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(val);
  };

  const formatSoldCount = (soldVal?: any) => {
    if (soldVal === undefined || soldVal === null) return null;
    const str = String(soldVal).trim();
    if (!str || str === "0" || str === "0 Terjual" || str === "0RB+ Terjual") return null;

    const num = parseInt(str.replace(/\D/g, ""), 10);
    if (isNaN(num) || num <= 0) return null;

    if (num >= 1000) {
      return `${(num / 1000).toFixed(1).replace(/\.0$/, "")}RB+ Terjual`;
    }
    return `${num} Terjual`;
  };

  const formattedSold = formatSoldCount(product.sold);

  return (
    <div className="relative w-full overflow-hidden rounded-[30px] bg-white transition duration-300 hover:-translate-y-1 border border-gray-100 font-sans">
      {/* Product Detail */}
      <Link href={`/products/${createProductSlug(product.id, product.name)}`} className="group block">
        <div className="relative aspect-square w-full overflow-hidden bg-gray-50 flex items-center justify-center">
          {user && isOutOfStock && (
            <div className="absolute inset-0 bg-white/70 backdrop-blur-[2px] flex flex-col items-center justify-center z-20 transition-all duration-300 group-hover:bg-white/85 p-4">
              <img
                src="/soldout.png"
                alt="Sold Out"
                className="w-28 h-28 sm:w-36 sm:h-36 object-contain opacity-90 drop-shadow-md transition-transform duration-300 group-hover:scale-110"
              />
            </div>
          )}
          <img
            src={imgSrc}
            alt={product.name || "Product"}
            loading="lazy"
            decoding="async"
            className={`w-full h-full object-contain transition duration-500 group-hover:scale-105 ${user && isOutOfStock ? "grayscale-30" : ""}`}
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                "https://placehold.co/600x600?text=No+Image";
            }}
          />
        </div>

        {/* Product Title (2 Lines max) - No description */}
        <div className="px-6 pt-5">
          <h3 className="line-clamp-2 text-[20px] font-semibold text-[#1D1D1F] leading-snug">
            {product.name}
          </h3>
        </div>
      </Link>

      {/* Footer */}
      <div className="p-6 pt-3">
        <div className="flex items-center justify-between gap-3 pt-3 border-t border-gray-100">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xl font-extrabold text-[#774EFC]">
              {formatIDR(finalVoucherPrice)}
            </span>
            {effectivePrice > finalVoucherPrice && (
              <>
                <span className="text-xs text-gray-400 line-through font-semibold">
                  {formatIDR(effectivePrice)}
                </span>
                <span className="inline-flex items-center justify-center p-1 text-purple-600 bg-purple-50 border border-purple-200 rounded-md shadow-2xs" title="Harga setelah dipotong Voucher Toko / Produk">
                  <Ticket className="w-4 h-4 text-purple-600" />
                </span>
              </>
            )}
          </div>
          {formattedSold && (
            <span className="text-xs text-[#888]">
              {formattedSold}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}