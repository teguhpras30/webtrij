'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { ShoppingCart, Zap, CheckCircle, Check, AlertCircle, Lock, UserCheck, Ticket } from 'lucide-react';
import CustomerAuthModal from '@/components/auth/CustomerAuthModal';

interface Variant {
  id?: number;
  groupName?: string;
  name: string;
  price: number;
  stock?: number;
  image?: string | null;
}

interface ProductDetailActionsProps {
  product: any;
  onVariantChange?: (variant: Variant | null) => void;
}

export default function ProductDetailActions({ product, onVariantChange }: ProductDetailActionsProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<'cart' | 'buy_now' | null>(null);

  const allVariants: Variant[] = product.variants || [];

  // Dynamically determine group names & Add-On metadata from database
  const rawGroupName = allVariants[0]?.groupName || "";
  let group1Name = "WARNA";
  let group2Name = "BUBBLE PACKAGE";
  let group2AddOns: { name: string; extraPrice: number }[] = [];

  if (rawGroupName.includes("::")) {
    const [headerPart, metaPart] = rawGroupName.split("::");
    if (headerPart.includes(" | ")) {
      const [g1, g2] = headerPart.split(" | ");
      if (g1 && g1.trim()) group1Name = g1.trim();
      if (g2 && g2.trim()) group2Name = g2.trim();
    } else if (headerPart.trim()) {
      group1Name = headerPart.trim();
    }

    if (metaPart && metaPart.trim()) {
      group2AddOns = metaPart.split("|").map((item) => {
        const [optName, extraStr] = item.split(":+");
        return {
          name: optName.trim(),
          extraPrice: extraStr ? Number(extraStr) || 0 : 0,
        };
      });
    }
  } else if (rawGroupName.includes(" | ")) {
    const [g1, g2] = rawGroupName.split(" | ");
    if (g1 && g1.trim()) group1Name = g1.trim();
    if (g2 && g2.trim()) group2Name = g2.trim();
  } else if (rawGroupName.trim()) {
    group1Name = rawGroupName.trim();
  }

  // Extract unique options for Group 1 (WARNA / PRODUK) and Group 2 (KEMASAN / ADD-ON)
  const parsedGroup1Options = Array.from(
    new Set(
      allVariants
        .map((v) => {
          if (v.name.includes(' - ')) return v.name.split(' - ')[0].trim();
          return v.name.trim();
        })
        .filter(Boolean)
    )
  ) as string[];

  const parsedGroup2Options = group2AddOns.length > 0
    ? group2AddOns.map((a) => a.name)
    : (Array.from(
        new Set(
          allVariants
            .map((v) => {
              if (v.name.includes(' - ')) return v.name.split(' - ')[1]?.trim();
              if (v.groupName === 'WARNA') return v.name.trim();
              return null;
            })
            .filter(Boolean)
        )
      ) as string[]);

  // Find cheapest variant to initialize default selection
  const cheapestVariant = allVariants.length > 0
    ? [...allVariants].sort((a, b) => Number(a.price) - Number(b.price))[0]
    : null;

  const minOrder = Number(product.moq || product.minOrder) || 1;

  // Initial variant selection starts as EMPTY (unselected by default) so page opens on THUMBNAIL
  const [selectedGroup1, setSelectedGroup1] = useState<string>('');
  const [selectedGroup2, setSelectedGroup2] = useState<string>('');
  const [qty, setQty] = useState(minOrder);
  const [variantError, setVariantError] = useState<string>('');

  useEffect(() => {
    setSelectedGroup1('');
    setSelectedGroup2('');
    setQty(minOrder);
    setVariantError('');
  }, [product, minOrder]);

  const hasMultipleGroup1 = parsedGroup1Options.length > 0;
  const hasMultipleGroup2 = parsedGroup2Options.length > 0;

  const isGroup1Selected = !hasMultipleGroup1 || Boolean(selectedGroup1);
  const isGroup2Selected = !hasMultipleGroup2 || Boolean(selectedGroup2);
  const isVariantFullySelected = isGroup1Selected && isGroup2Selected && (hasMultipleGroup1 || hasMultipleGroup2);

  const selectedAddOn = group2AddOns.find((a) => a.name.toUpperCase() === selectedGroup2.toUpperCase());
  const activeAddOnPrice = selectedAddOn ? selectedAddOn.extraPrice : 0;

  const activeVariant = (selectedGroup1 && allVariants.length > 0)
    ? allVariants.find((v) => {
        if (selectedGroup1 && selectedGroup2 && !group2AddOns.length) {
          const comboTarget = `${selectedGroup1} - ${selectedGroup2}`.toUpperCase();
          return (
            v.name.toUpperCase() === comboTarget ||
            (v.name.toUpperCase().includes(selectedGroup1.toUpperCase()) &&
              v.name.toUpperCase().includes(selectedGroup2.toUpperCase()))
          );
        }
        return (
          v.name.toUpperCase() === selectedGroup1.toUpperCase() ||
          v.name.toUpperCase().includes(selectedGroup1.toUpperCase())
        );
      }) || null
    : null;

  useEffect(() => {
    if (onVariantChange) {
      onVariantChange(activeVariant);
    }
  }, [activeVariant, onVariantChange]);

  // Interlinked Stock & Price
  const allPrices = allVariants.map((v) => Number(v.price) || 0).filter((p) => p > 0);
  const minPrice = allPrices.length > 0 ? Math.min(...allPrices) : Number(product.retailPrice) || 0;
  const maxPrice = allPrices.length > 0 ? Math.max(...allPrices) : Number(product.retailPrice) || 0;

  const basePrice = activeVariant ? Number(activeVariant.price) : minPrice;
  const activePrice = basePrice + activeAddOnPrice;
  const activeStock = activeVariant && activeVariant.stock !== undefined && activeVariant.stock !== null
    ? Number(activeVariant.stock)
    : (product.stock !== undefined && product.stock !== null ? Number(product.stock) : 0);

  const totalVariantStock = allVariants.reduce((sum, v) => sum + (Number(v.stock) || 0), 0);
  const displayStock = isVariantFullySelected
    ? activeStock
    : allVariants.length > 0
      ? totalVariantStock
      : Number(product.stock) || 0;

  const isOutOfStock = displayStock <= 0;
  const totalPrice = activePrice * qty;

  // Fetch active vouchers from DB
  const [dbVouchers, setDbVouchers] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/public/vouchers')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setDbVouchers(data);
      })
      .catch((err) => console.warn('Error fetching vouchers in detail actions:', err));
  }, []);

  // Check product/shop voucher eligibility based on total price (activePrice * qty) vs minPurchase
  const eligibleVoucher = dbVouchers.find((v) => {
    if (!v.isActive) return false;
    
    // Exclude shipping vouchers (ONGKIR vouchers apply only on checkout shipping costs)
    const codeUpper = String(v.code || "").toUpperCase();
    if (codeUpper.includes("ONGKIR") || codeUpper.includes("FREE")) return false;

    const isDiscountType = v.discountType === "PERCENTAGE" || v.discountType === "FIXED";
    const minP = Number(v.minPurchase || 100000);
    return isDiscountType && minP > 0 && totalPrice >= minP;
  });

  let hasVoucherDiscount = false;
  let discountedUnitPrice = activePrice;

  if (eligibleVoucher) {
    hasVoucherDiscount = true;
    if (eligibleVoucher.discountType === "PERCENTAGE") {
      const val = Number(eligibleVoucher.discountValue) || 10;
      const maxD = eligibleVoucher.maxDiscount ? Number(eligibleVoucher.maxDiscount) : Infinity;
      const totalDisc = Math.min((totalPrice * val) / 100, maxD);
      const discPerUnit = Math.round(totalDisc / qty);
      discountedUnitPrice = Math.max(0, activePrice - discPerUnit);
    } else if (eligibleVoucher.discountType === "FIXED") {
      const val = Number(eligibleVoucher.discountValue) || 0;
      const discPerUnit = Math.round(val / qty);
      discountedUnitPrice = Math.max(0, activePrice - discPerUnit);
    }
  }

  const formatIDR = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  };

  const handleDecreaseQty = () => {
    if (!isVariantFullySelected) return;
    if (qty > minOrder) setQty(qty - 1);
  };

  const handleIncreaseQty = () => {
    if (!isVariantFullySelected) return;
    if (qty < displayStock) setQty(qty + 1);
  };

  const handleAddToCart = (e?: React.MouseEvent, targetAction: 'cart' | 'buy_now' = 'cart') => {
    setVariantError('');

    if (hasMultipleGroup1 && !selectedGroup1) {
      setVariantError(`Silakan pilih ${group1Name || 'Variasi 1'} terlebih dahulu.`);
      return false;
    }

    if (hasMultipleGroup2 && !selectedGroup2) {
      setVariantError(`Silakan pilih ${group2Name || 'Variasi 2'} terlebih dahulu.`);
      return false;
    }

    if (isOutOfStock) return false;

    const combinedVariantName = [selectedGroup1, selectedGroup2].filter(Boolean).join(' - ');
    const activeImage = activeVariant?.image || product.image || product.thumbnail;

    if (!user) {
      setPendingAction(targetAction);
      setIsAuthModalOpen(true);
      return false;
    }

    addToCart(
      {
        id: product.id,
        name: product.name,
        slug: `prod-${product.id}`,
        thumbnail: activeImage || 'https://placehold.co/600x600',
        retailPrice: activePrice,
        moq: minOrder,
        weightGram: product.weightGram || 1000,
        wholesaleTiers: product.wholesaleTiers,
        variants: product.variants,
      },
      qty,
      combinedVariantName ? { id: activeVariant?.id, name: combinedVariantName, price: activePrice } : undefined,
      e
    );
    return true;
  };

  return (
    <div className="mt-6 space-y-6 p-6 rounded-2xl bg-white border border-gray-100 font-sans shadow-xs">
      {/* Dynamic Price & Interlinked Stock Status */}
      <div className="flex flex-col">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider">
            Harga Produk {[selectedGroup1, selectedGroup2].filter(Boolean).join(' • ')}
          </span>
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
            isOutOfStock 
              ? 'bg-red-50 text-red-600 border-red-200' 
              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
          }`}>
            {isOutOfStock
              ? 'Stok Habis'
              : isVariantFullySelected
              ? `Sisa Stok: ${activeStock} pcs`
              : `Total Stok: ${displayStock} pcs`}
          </span>
        </div>

        <div className="flex items-center gap-2.5 mt-1 flex-wrap">
          <span className="text-3xl font-extrabold text-[#774EFC] transition-all">
            {isVariantFullySelected
              ? formatIDR(hasVoucherDiscount ? discountedUnitPrice : activePrice)
              : minPrice !== maxPrice && minPrice > 0
              ? `${formatIDR(minPrice)} - ${formatIDR(maxPrice)}`
              : formatIDR(minPrice)}
          </span>

          {hasVoucherDiscount ? (
            <>
              <span className="text-sm text-gray-400 line-through font-semibold">
                {formatIDR(activePrice)}
              </span>
              <span className="text-xs text-gray-400 font-normal">/ unit</span>
              <span className="inline-flex items-center justify-center p-1.5 text-purple-600 bg-purple-50 border border-purple-200 rounded-lg shadow-2xs" title={`Voucher Toko ${eligibleVoucher?.code || ''} Aktif!`}>
                <Ticket className="w-4 h-4 text-purple-600" />
              </span>
            </>
          ) : (
            <span className="text-xs text-gray-400 font-normal">/ unit</span>
          )}
        </div>

        {qty > 1 && (
          <span className="text-xs text-slate-500 mt-1">
            Total ({qty} pcs): <strong className="text-slate-800 font-bold">{formatIDR(hasVoucherDiscount ? discountedUnitPrice * qty : totalPrice)}</strong>
            {hasVoucherDiscount && (
              <span className="ml-1 text-[11px] text-emerald-600 font-bold">
                (Hemat {formatIDR(totalPrice - (discountedUnitPrice * qty))})
              </span>
            )}
          </span>
        )}
      </div>

      {/* Group 1 Selector (e.g. READY: 4 SUSUN, 2 SUSUN) */}
      {parsedGroup1Options.length > 0 && (
        <div className="space-y-3 pt-3 border-t border-gray-100">
          <div className="flex items-center gap-4">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider w-24 shrink-0">
              {group1Name}
            </label>

            <div className="flex flex-wrap gap-3">
              {parsedGroup1Options.map((opt1) => {
                const isSelected = selectedGroup1 === opt1;
                const matchVar = allVariants.find(
                  (v) => v.name.toUpperCase().includes(opt1.toUpperCase()) && v.image && v.image.trim() !== ""
                );
                const optImg = matchVar?.image || product.thumbnail || product.image;
                const cleanImg = optImg
                  ? optImg.startsWith("http") || optImg.startsWith("/") ? optImg : `/${optImg}`
                  : null;

                return (
                  <button
                    key={opt1}
                    type="button"
                    onClick={() => {
                      setVariantError('');
                      setSelectedGroup1(opt1);
                    }}
                    className={`relative px-3 py-1.5 rounded-xs text-xs font-bold uppercase transition-all duration-150 flex items-center gap-2 border cursor-pointer ${
                      isSelected
                        ? 'border-[#774EFC] text-[#774EFC] bg-purple-50/30 shadow-2xs'
                        : 'border-gray-200 text-gray-700 bg-white hover:border-gray-400 hover:text-gray-900'
                    }`}
                  >
                    {cleanImg && (
                      <img
                        src={cleanImg}
                        alt={opt1}
                        className="w-5 h-5 object-cover rounded-xs border border-gray-200 shrink-0"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    )}
                    <span>{opt1}</span>
                    {isSelected && (
                      <div className="absolute -bottom-0 -right-0 bg-[#774EFC] text-white w-3.5 h-3.5 rounded-tl-md rounded-br-xs flex items-center justify-center">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Group 2 Selector (e.g. WARNA: HIJAU OLIVE, BIRU OLIVE, MERAH OLIVE, PUTIH, COKLAT) */}
      {parsedGroup2Options.length > 0 && (
        <div className="space-y-3 pt-3 border-t border-gray-100">
          <div className="flex items-start gap-4">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider w-24 shrink-0 pt-2">
              {group2Name}
            </label>

            <div className="flex flex-wrap gap-2.5 max-w-xl">
              {parsedGroup2Options.map((opt2) => {
                const isSelected = selectedGroup2 === opt2;
                const addOnObj = group2AddOns.find((a) => a.name.toUpperCase() === opt2.toUpperCase());
                const extraPrice = addOnObj ? addOnObj.extraPrice : 0;

                let comboOutOfStock = false;
                if (group2AddOns.length > 0) {
                  comboOutOfStock = selectedGroup1 ? activeStock <= 0 : isOutOfStock;
                } else {
                  const comboVariant = allVariants.find((v) => {
                    if (selectedGroup1) {
                      return (
                        v.name.toUpperCase().includes(selectedGroup1.toUpperCase()) &&
                        v.name.toUpperCase().includes(opt2.toUpperCase())
                      );
                    }
                    return v.name.toUpperCase().includes(opt2.toUpperCase());
                  });

                  const hasStockForOpt2 = allVariants.some(
                    (v) => v.name.toUpperCase().includes(opt2.toUpperCase()) && (Number(v.stock) || 0) > 0
                  );

                  const comboStock = comboVariant && comboVariant.stock !== undefined && comboVariant.stock !== null
                    ? Number(comboVariant.stock)
                    : (product.stock !== undefined && product.stock !== null ? Number(product.stock) : 0);

                  comboOutOfStock = selectedGroup1
                    ? comboStock <= 0
                    : !hasStockForOpt2 && allVariants.length > 0;
                }

                return (
                  <button
                    key={opt2}
                    type="button"
                    disabled={comboOutOfStock}
                    onClick={() => {
                      setVariantError('');
                      setSelectedGroup2(opt2);
                    }}
                    className={`relative px-3 py-1.5 rounded-xs text-xs font-bold uppercase transition-all duration-150 flex items-center gap-2 border ${
                      comboOutOfStock
                        ? 'border-gray-200 text-gray-300 bg-gray-50 cursor-not-allowed line-through'
                        : isSelected
                        ? 'border-[#774EFC] text-[#774EFC] bg-purple-50/30 shadow-2xs cursor-pointer'
                        : 'border-gray-200 text-gray-600 bg-white hover:border-gray-400 hover:text-gray-900 cursor-pointer'
                    }`}
                  >
                    <span>{opt2}</span>
                    {isSelected && !comboOutOfStock && (
                      <div className="absolute -bottom-0 -right-0 bg-[#774EFC] text-white w-3.5 h-3.5 rounded-tl-md rounded-br-xs flex items-center justify-center">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Quantity Selector & Minimum Purchase Badge */}
      <div className="space-y-2 pt-3 border-t border-gray-100">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-gray-700 block">Jumlah Pemesanan:</label>
            {!isVariantFullySelected && (hasMultipleGroup1 || hasMultipleGroup2) && (
              <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                Pilih variasi dahulu
              </span>
            )}
          </div>
          {minOrder > 1 && (
            <span className="text-[11px] font-extrabold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200 flex items-center gap-1">
              <AlertCircle className="w-3 h-3 text-amber-600 shrink-0" />
              <span>Min. Pembelian: {minOrder} item</span>
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <div className={`flex items-center border rounded-xl overflow-hidden transition-all ${
            !isVariantFullySelected ? 'bg-gray-100/90 border-gray-200 opacity-50 cursor-not-allowed' : 'bg-gray-50 border-gray-200'
          }`}>
            <button
              type="button"
              onClick={handleDecreaseQty}
              disabled={!isVariantFullySelected || qty <= minOrder || isOutOfStock}
              className="px-4 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              -
            </button>
            <span className="px-5 py-2.5 text-sm font-bold text-gray-900 min-w-[40px] text-center select-none">
              {qty}
            </span>
            <button
              type="button"
              onClick={handleIncreaseQty}
              disabled={!isVariantFullySelected || qty >= displayStock || isOutOfStock}
              className="px-4 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              +
            </button>
          </div>
        </div>
      </div>

      {/* Variant Selection Warning Alert Banner */}
      {variantError && (
        <div className="p-3.5 bg-red-50 border border-red-200 text-red-600 font-extrabold text-xs rounded-xl flex items-center gap-2 animate-in fade-in duration-200 shadow-xs">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          <span>{variantError}</span>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <button
          type="button"
          disabled={isOutOfStock}
          onClick={(e) => handleAddToCart(e, 'cart')}
          className="flex-1 py-3.5 px-5 rounded-[16px] border-2 border-[#774EFC] bg-purple-50/80 hover:bg-purple-100 text-[#774EFC] font-extrabold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ShoppingCart className="w-4 h-4 text-[#774EFC]" />
          <span>{isOutOfStock ? 'Stok Habis' : 'Tambah Ke Keranjang'}</span>
        </button>

        <button
          type="button"
          disabled={isOutOfStock}
          onClick={(e) => {
            const success = handleAddToCart(e, 'buy_now');
            if (success) {
              setTimeout(() => {
                router.push('/cart');
              }, 600);
            }
          }}
          className="flex-1 py-3.5 px-5 rounded-[16px] bg-[#774EFC] hover:bg-[#623ce8] text-white font-extrabold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md shadow-purple-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <CheckCircle className="w-4 h-4 text-white" />
          <span>Beli Sekarang</span>
        </button>
      </div>

      {isAuthModalOpen && (
        <CustomerAuthModal
          initialTab="quick-otp"
          onClose={() => {
            setIsAuthModalOpen(false);
            setPendingAction(null);
          }}
          onSuccess={() => {
            setIsAuthModalOpen(false);
            const combinedVariantName = [selectedGroup1, selectedGroup2].filter(Boolean).join(' - ');
            const activeImage = activeVariant?.image || product.image || product.thumbnail;

            addToCart(
              {
                id: product.id,
                name: product.name,
                slug: `prod-${product.id}`,
                thumbnail: activeImage || 'https://placehold.co/600x600',
                retailPrice: activePrice,
                moq: minOrder,
                weightGram: product.weightGram || 1000,
                wholesaleTiers: product.wholesaleTiers,
                variants: product.variants,
              },
              qty,
              combinedVariantName ? { id: activeVariant?.id, name: combinedVariantName, price: activePrice } : undefined
            );

            if (pendingAction === 'buy_now') {
              setTimeout(() => {
                router.push('/cart');
              }, 400);
            }
            setPendingAction(null);
          }}
        />
      )}
    </div>
  );
}
