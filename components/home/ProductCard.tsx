"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { Lock, Ticket, AlertCircle } from "lucide-react";
import { createProductSlug } from "@/lib/slug";

interface ProductCardProps {
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

export default function ProductCard({ product }: ProductCardProps) {
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

    // Explicit product-level voucher discount in DB
    if (prod?.voucherDiscount && Number(prod.voucherDiscount) > 0) {
      const minP = Number(prod.minPurchase || prod.voucherMinPurchase || 0);
      if (minP > 0 && price < minP) return price;
      return Math.max(0, price - Number(prod.voucherDiscount));
    }
    if (prod?.discountPercent && Number(prod.discountPercent) > 0) {
      const minP = Number(prod.minPurchase || prod.voucherMinPurchase || 0);
      if (minP > 0 && price < minP) return price;
      return Math.max(0, Math.round(price * (1 - Number(prod.discountPercent) / 100)));
    }
    if (prod?.discountAmount && Number(prod.discountAmount) > 0) {
      const minP = Number(prod.minPurchase || prod.voucherMinPurchase || 0);
      if (minP > 0 && price < minP) return price;
      return Math.max(0, price - Number(prod.discountAmount));
    }

    // Dynamic shop / discount vouchers check from active public vouchers
    if (activeVouchers && activeVouchers.length > 0) {
      const shopDiscountVouchers = activeVouchers.filter((v: any) => {
        const code = String(v.code || "").toUpperCase();
        const scope = String(v.scope || "").toUpperCase();
        const isShipping =
          scope === "SHIPPING" ||
          code.includes("ONGKIR") ||
          code.includes("FREE") ||
          Boolean(v.isOngkirTemplate);
        
        const isEligibleScope =
          scope === "SHOP" ||
          (scope === "PRODUCT" &&
            Array.isArray(v.targetProductIds) &&
            v.targetProductIds.includes(prod.id));

        return !isShipping && isEligibleScope;
      });

      let maxDiscount = 0;
      for (const voc of shopDiscountVouchers) {
        const minP = Number(voc.minPurchase) || 0;
        if (price < minP) continue;

        let discount = 0;
        if (voc.discountType === "PERCENTAGE") {
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
    }

    // Default shop voucher fallback if price >= 100.000 (Min. Belanja Rp 100.000, Max potongan 20.000)
    const minShopPurchase = Number(prod.minPurchase || prod.voucherMinPurchase || 100000);
    if (price >= minShopPurchase) {
      const defaultDiscount = Math.min(20000, Math.round(price * 0.2));
      return Math.max(0, price - defaultDiscount);
    }

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
    <div className="group relative w-full sm:max-w-[299px] mx-auto overflow-hidden rounded-2xl sm:rounded-[30px] bg-white transition hover:-translate-y-1 border border-gray-100 font-sans flex flex-col justify-between">
      <Link href={`/products/${createProductSlug(product.id, product.name)}`} className="block">
        <div className="relative aspect-square w-full overflow-hidden bg-gray-50 flex items-center justify-center">
          {product.isBuyerOnly && (
            <div className="absolute top-2.5 left-2.5 z-10 bg-purple-600/90 backdrop-blur-xs text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full shadow-md flex items-center gap-1">
              <Lock className="w-3 h-3" />
              <span>Buyer Only</span>
            </div>
          )}
          {user && isOutOfStock && (
            <div className="absolute inset-0 bg-white/70 backdrop-blur-[2px] flex flex-col items-center justify-center z-20 transition-all duration-300 group-hover:bg-white/85 p-3">
              <img
                src="/soldout.png"
                alt="Sold Out"
                className="w-24 h-24 sm:w-28 sm:h-28 object-contain opacity-90 drop-shadow-md transition-transform duration-300 group-hover:scale-110"
              />
            </div>
          )}
          <img
            src={imgSrc}
            alt={product.name || "Product"}
            loading="lazy"
            decoding="async"
            className={`w-full h-full object-cover transition duration-500 group-hover:scale-105 ${user && isOutOfStock ? "grayscale-30" : ""}`}
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                "https://placehold.co/600x600?text=No+Image";
            }}
          />
        </div>

        {/* Product Name (2 Lines max) - No description */}
        <div className="p-3 sm:pt-4 sm:px-5">
          <h3 className="line-clamp-2 text-xs sm:text-[16px] font-semibold text-[#1D1D1F] leading-snug">
            {product.name}
          </h3>
        </div>
      </Link>

      <div className="p-3 sm:px-5 sm:pb-5 sm:pt-1">
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-gray-100">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-sm sm:text-base font-extrabold text-[#774EFC]">
              {formatIDR(finalVoucherPrice)}
            </span>
            {effectivePrice > finalVoucherPrice && (
              <>
                <span className="text-[10px] sm:text-xs text-gray-400 line-through font-semibold">
                  {formatIDR(effectivePrice)}
                </span>
                <span className="inline-flex items-center justify-center p-1 text-purple-600 bg-purple-50 border border-purple-200/90 rounded-md shadow-2xs" title="Harga setelah dipotong Voucher Toko / Produk">
                  <Ticket className="w-3.5 h-3.5 text-purple-600" />
                </span>
              </>
            )}
          </div>
          {formattedSold && (
            <span className="text-[10px] sm:text-xs text-[#888]">
              {formattedSold}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}