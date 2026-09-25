'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, HelpCircle, Truck, ShoppingBag, CheckCircle2, ChevronDown, ChevronUp, Zap, Loader2, Sparkles } from 'lucide-react';
import { AVAILABLE_VOUCHERS, VoucherDefinition, validateAndApplyVoucher, mapDbVoucherToDefinition } from '@/lib/vouchers';

interface VoucherSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  subtotal: number;
  shippingCost: number;
  appliedShippingCode: string;
  appliedDiscountCode: string;
  onApplyDualVouchers: (shippingCode: string, discountCode: string) => void;
}

export const VoucherSelectorModal: React.FC<VoucherSelectorModalProps> = ({
  isOpen,
  onClose,
  subtotal,
  shippingCost,
  appliedShippingCode,
  appliedDiscountCode,
  onApplyDualVouchers,
}) => {
  // Single selection per category with optional radio buttons (Max 1 Shipping + Max 1 Discount)
  const [dbVouchers, setDbVouchers] = useState<VoucherDefinition[]>([]);
  const [loadingVouchers, setLoadingVouchers] = useState(false);
  const [selectedShipping, setSelectedShipping] = useState<string>(appliedShippingCode || '');
  const [selectedDiscount, setSelectedDiscount] = useState<string>(appliedDiscountCode || '');
  const [inputCode, setInputCode] = useState('');
  const [showAllShipping, setShowAllShipping] = useState(false);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  // Fetch real active vouchers from PostgreSQL DB (/api/public/vouchers)
  useEffect(() => {
    if (!isOpen) return;
    let isMounted = true;
    setLoadingVouchers(true);

    fetch('/api/public/vouchers')
      .then((res) => res.json())
      .then((data) => {
        if (!isMounted) return;
        if (Array.isArray(data) && data.length > 0) {
          const mapped = data.map(mapDbVoucherToDefinition);
          setDbVouchers(mapped);

          // Auto-select best eligible vouchers if selected code is invalid or empty
          const hasValidShipping = mapped.some(
            (v) => v.code === selectedShipping && v.type === 'shipping_discount' && (!v.minSpend || subtotal >= v.minSpend)
          );
          const eligibleShipping = mapped.find(
            (v) => v.type === 'shipping_discount' && (!v.minSpend || subtotal >= v.minSpend)
          );
          if (!hasValidShipping && eligibleShipping) {
            setSelectedShipping(eligibleShipping.code);
          }

          const calcAmt = (voc: VoucherDefinition) => {
            if (voc.discountType === 'percentage') {
              let c = (subtotal * voc.value) / 100;
              if (voc.maxDiscount && c > voc.maxDiscount) c = voc.maxDiscount;
              return Math.round(c);
            }
            return Math.min(subtotal, voc.value);
          };

          const hasValidDiscount = mapped.some(
            (v) => v.code === selectedDiscount && (!v.minSpend || subtotal >= v.minSpend)
          );
          const eligibleDiscount = [...mapped.filter(
            (v) => (v.type === 'product_discount' || v.type === 'cashback') && (!v.minSpend || subtotal >= v.minSpend)
          )].sort((a, b) => calcAmt(b) - calcAmt(a))[0];

          if (!hasValidDiscount && eligibleDiscount) {
            setSelectedDiscount(eligibleDiscount.code);
          }
        } else {
          setDbVouchers([]);
        }
      })
      .catch((err) => {
        console.error('Error fetching vouchers from DB:', err);
      })
      .finally(() => {
        if (isMounted) setLoadingVouchers(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, subtotal, selectedShipping, selectedDiscount]);

  if (!isOpen) return null;

  const activeVoucherList = dbVouchers;

  const formatIDR = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  };

  const isEligibleVoucher = (v: VoucherDefinition) => !v.minSpend || subtotal >= v.minSpend;

  const getDiscountAmount = (v: VoucherDefinition) => {
    if (v.minSpend && subtotal < v.minSpend) return 0;
    if (v.discountType === 'percentage') {
      let calc = (subtotal * v.value) / 100;
      if (v.maxDiscount && calc > v.maxDiscount) {
        calc = v.maxDiscount;
      }
      return Math.round(calc);
    }
    return Math.min(subtotal, v.value);
  };

  // SORT VOUCHERS: Eligible vouchers on TOP, sorted by highest discount amount (cheapest price)
  const shippingVouchers = [...activeVoucherList.filter((v) => v.type === 'shipping_discount')].sort((a, b) => {
    const aEligible = isEligibleVoucher(a) ? 1 : 0;
    const bEligible = isEligibleVoucher(b) ? 1 : 0;
    return bEligible - aEligible;
  });

  const discountVouchers = [...activeVoucherList.filter((v) => v.type === 'product_discount' || v.type === 'cashback')].sort((a, b) => {
    const aEligible = isEligibleVoucher(a) ? 1 : 0;
    const bEligible = isEligibleVoucher(b) ? 1 : 0;
    if (aEligible !== bEligible) return bEligible - aEligible;

    const discountA = getDiscountAmount(a);
    const discountB = getDiscountAmount(b);
    return discountB - discountA;
  });

  const bestDiscountVoucher = discountVouchers.find(
    (v) => isEligibleVoucher(v) && getDiscountAmount(v) > 0
  );

  const visibleShippingVouchers = showAllShipping ? shippingVouchers : shippingVouchers.slice(0, 2);

  // Auto-select top eligible vouchers if not selected
  useEffect(() => {
    if (!isOpen || activeVoucherList.length === 0) return;

    if (!selectedShipping) {
      const topShipping = activeVoucherList.find(
        (v) => v.type === 'shipping_discount' && isEligibleVoucher(v)
      );
      if (topShipping) setSelectedShipping(topShipping.code);
    }

    if (!selectedDiscount) {
      const topDiscount = [...activeVoucherList.filter(
        (v) => (v.type === 'product_discount' || v.type === 'cashback') && isEligibleVoucher(v)
      )].sort((a, b) => getDiscountAmount(b) - getDiscountAmount(a))[0];
      if (topDiscount) setSelectedDiscount(topDiscount.code);
    }
  }, [isOpen, activeVoucherList]);

  // Evaluate Active Dual Discounts
  const evalShipping = selectedShipping ? validateAndApplyVoucher(selectedShipping, subtotal, shippingCost, activeVoucherList) : null;
  const evalDiscount = selectedDiscount ? validateAndApplyVoucher(selectedDiscount, subtotal, shippingCost, activeVoucherList) : null;

  let selectedCount = 0;
  if (selectedShipping && (evalShipping?.valid ?? isEligibleVoucher(activeVoucherList.find(v => v.code === selectedShipping) || {} as any))) selectedCount++;
  if (selectedDiscount && (evalDiscount?.valid ?? isEligibleVoucher(activeVoucherList.find(v => v.code === selectedDiscount) || {} as any))) selectedCount++;

  // PERILAKU CENTANG TUNGGAL OPSIONAL: VOUCHER GRATIS ONGKIR
  const handleToggleShipping = (code: string) => {
    if (selectedShipping === code) {
      setSelectedShipping(''); // Opsional: Uncheck if clicked again
    } else {
      setSelectedShipping(code); // Select ONLY 1 shipping voucher
    }
  };

  // PERILAKU CENTANG TUNGGAL OPSIONAL: VOUCHER DISKON / CASHBACK
  const handleToggleDiscount = (code: string) => {
    if (selectedDiscount === code) {
      setSelectedDiscount(''); // Opsional: Uncheck if clicked again
    } else {
      setSelectedDiscount(code); // Select ONLY 1 discount voucher
    }
  };

  const handleApplyInputCode = () => {
    if (!inputCode.trim()) return;
    const res = validateAndApplyVoucher(inputCode, subtotal, shippingCost, activeVoucherList);
    if (!res.valid) {
      setErrorNotice(res.message);
      return;
    }
    setErrorNotice(null);
    if (res.appliedVoucher?.type === 'shipping_discount') {
      setSelectedShipping(res.appliedVoucher.code);
    } else {
      setSelectedDiscount(res.appliedVoucher?.code || '');
    }
    setInputCode('');
  };

  const handleConfirmOK = () => {
    onApplyDualVouchers(selectedShipping, selectedDiscount);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[999] bg-black/60 backdrop-blur-xs flex items-center justify-center p-0 sm:p-4 font-sans animate-in fade-in duration-200">
      <div className="w-full sm:max-w-md h-full sm:h-[650px] bg-gray-50 sm:rounded-3xl shadow-2xl flex flex-col justify-between overflow-hidden">
        {/* Header Shopee Style with Back Arrow */}
        <div className="bg-white border-b border-gray-200 px-4 py-3.5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors cursor-pointer text-gray-700"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h2 className="text-base font-bold text-gray-900">Pilih Voucher</h2>
          </div>
          <button className="text-gray-400 hover:text-gray-600 cursor-pointer" title="Bantuan Voucher">
            <HelpCircle className="w-5 h-5" />
          </button>
        </div>

        {/* Input Top Bar */}
        <div className="bg-white px-4 py-3 border-b border-gray-100 flex items-center gap-2 shrink-0">
          <div className="flex-1 bg-gray-100 rounded-xl px-3 py-2 flex items-center gap-2">
            <input
              type="text"
              placeholder="Masukkan Kode Voucher"
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value)}
              className="w-full bg-transparent text-xs font-semibold text-gray-900 focus:outline-none uppercase placeholder:capitalize placeholder:font-normal"
            />
          </div>
          <button
            onClick={handleApplyInputCode}
            disabled={!inputCode.trim()}
            className="px-4 py-2 bg-gray-200 text-gray-400 disabled:opacity-60 text-xs font-bold rounded-xl transition-all disabled:cursor-not-allowed hover:bg-[#774EFC] hover:text-white cursor-pointer"
          >
            Pakai
          </button>
        </div>

        {errorNotice && (
          <div className="bg-rose-50 px-4 py-2 text-rose-600 text-[11px] font-semibold border-b border-rose-100 flex items-center justify-between">
            <span>{errorNotice}</span>
            <button onClick={() => setErrorNotice(null)} className="underline cursor-pointer">Tutup</button>
          </div>
        )}

        {/* Main Scrollable Ticket Section */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          {/* SECTION 1: VOUCHER GRATIS ONGKIR (WARNA BIRU) */}
          {shippingVouchers.length > 0 && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-gray-900">
                  <Truck className="w-4 h-4 text-[#2563EB]" />
                  <span>Voucher Gratis Ongkir</span>
                </div>
                <span className="text-[10px] text-gray-400 font-semibold">Max 1 voucher</span>
              </div>

              <div className="space-y-2.5">
                {visibleShippingVouchers.map((v) => {
                  const isChecked = selectedShipping === v.code;
                  const isEligible = isEligibleVoucher(v);

                  return (
                    <div
                      key={v.code}
                      onClick={() => isEligible && handleToggleShipping(v.code)}
                      className={`relative rounded-2xl h-[94px] transition-all overflow-hidden flex items-stretch border ${isChecked ? 'border-[#2563EB]' : 'border-gray-200'
                        } ${isEligible
                          ? 'bg-white cursor-pointer'
                          : 'bg-gray-100/70 opacity-45 cursor-not-allowed grayscale'
                        } ${isChecked ? 'bg-blue-50/40' : ''}`}
                    >
                      {/* Left Badge Icon Ticket Area (Biru) */}
                      <div className={`w-24 text-white p-3 flex flex-col items-center justify-center text-center relative shrink-0 ${isEligible ? 'bg-gradient-to-br from-[#2563EB] to-blue-700' : 'bg-gray-400'
                        }`}>
                        <Truck className="w-6 h-6 mb-1 opacity-90" />
                        <span className="text-[10px] font-bold leading-tight uppercase tracking-wider">
                          Gratis Ongkir
                        </span>
                        {/* Half Circle Cutouts */}
                        <div className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-gray-50" />
                        <div className="absolute -bottom-2 -right-2 w-4 h-4 rounded-full bg-gray-50" />
                      </div>

                      {/* Right Details Area */}
                      <div className="flex-1 p-3 flex items-center justify-between min-w-0">
                        <div className="pr-2 min-w-0 flex flex-col justify-center">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-xs font-bold text-gray-900 line-clamp-1">{v.title}</span>
                          </div>
                          <p className="text-[10px] text-gray-500 mt-0.5 line-clamp-1">
                            {isEligible ? v.subtitle : `Syarat Belanja Belum Terpenuhi (Min. ${formatIDR(v.minSpend || 0)})`}
                          </p>

                          {v.tagOutline && isEligible && (
                            <span className="inline-block mt-1 px-2 py-0.5 text-[9px] font-semibold text-blue-700 bg-blue-50 border border-blue-100 rounded w-fit">
                              {v.tagOutline}
                            </span>
                          )}

                          <div className="text-[9px] text-gray-400 mt-1">Berlaku s.d {v.expiryDate}</div>
                        </div>

                        {/* Custom Radio Button Indicator (Blue for Shipping) */}
                        <div className="shrink-0 flex items-center">
                          <div
                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                              isChecked
                                ? 'border-[#2563EB] bg-white'
                                : isEligible
                                ? 'border-gray-300 bg-white'
                                : 'border-gray-200 bg-gray-100 opacity-50'
                            }`}
                          >
                            {isChecked && <div className="w-2.5 h-2.5 rounded-full bg-[#2563EB]" />}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {shippingVouchers.length > 2 && (
                <button
                  onClick={() => setShowAllShipping(!showAllShipping)}
                  className="w-full text-center text-xs font-bold text-[#2563EB] flex items-center justify-center gap-1 py-1 hover:underline cursor-pointer"
                >
                  <span>{showAllShipping ? 'Tampilkan Lebih Sedikit' : 'Tampilkan Lebih Banyak'}</span>
                  {showAllShipping ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
              )}
            </div>
          )}

          {/* SECTION 2: VOUCHER DISKON & CASHBACK (WARNA TOSCA) */}
          <div className="space-y-2.5 pt-2 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-gray-900">
                <ShoppingBag className="w-4 h-4 text-[#00A896]" />
                <span>Voucher Diskon / Cashback</span>
              </div>
              <span className="text-[10px] text-gray-400 font-semibold">Max 1 voucher</span>
            </div>

            <div className="space-y-2.5">
              {discountVouchers.map((v) => {
                const isChecked = selectedDiscount === v.code;
                const isEligible = isEligibleVoucher(v);
                const discountAmt = getDiscountAmount(v);
                const isBest = bestDiscountVoucher && bestDiscountVoucher.code === v.code && discountAmt > 0;

                return (
                  <div
                    key={v.code}
                    onClick={() => isEligible && handleToggleDiscount(v.code)}
                    className={`relative rounded-2xl h-[98px] transition-all overflow-hidden flex items-stretch border ${isBest
                      ? 'border-teal-300 ring-2 ring-teal-400/30'
                      : isChecked
                        ? 'border-[#00A896]'
                        : 'border-gray-200'
                      } ${isEligible
                        ? 'bg-white cursor-pointer'
                        : 'bg-gray-100/70 opacity-45 cursor-not-allowed grayscale'
                      } ${isChecked ? 'bg-teal-50/40' : ''}`}
                  >
                    {/* Left Badge Icon Ticket Area (Tosca) */}
                    <div className={`w-24 text-white p-3 flex flex-col items-center justify-center text-center relative shrink-0 ${isEligible
                      ? 'bg-gradient-to-br from-[#00A896] to-teal-700'
                      : 'bg-gray-400'
                      }`}>
                      <Zap className="w-6 h-6 mb-1 opacity-90" />
                      <span className="text-[10px] font-bold leading-tight uppercase tracking-wider">
                        {v.type === 'cashback' ? 'Cashback' : 'Diskon'}
                      </span>
                      {/* Half Circle Cutouts */}
                      <div className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-gray-50" />
                      <div className="absolute -bottom-2 -right-2 w-4 h-4 rounded-full bg-gray-50" />
                    </div>

                    {/* Right Details Area */}
                    <div className="flex-1 p-3 flex items-center justify-between min-w-0">
                      <div className="pr-2 min-w-0 flex flex-col justify-center space-y-0.5">
                        {/* Rekomendasi Paling Hemat Badge (Tosca) */}
                        {isBest && (
                          <span className="inline-flex items-center gap-1 text-[9px] font-bold text-[#00A896] bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200 w-fit">
                            <Sparkles className="w-2.5 h-2.5 text-[#00A896]" />
                            ⭐ Rekomendasi Paling Hemat
                          </span>
                        )}

                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-xs font-bold text-gray-900 line-clamp-1">{v.title}</span>
                          {isEligible && discountAmt > 0 && (
                            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                              Hemat {formatIDR(discountAmt)}
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-gray-500 line-clamp-1">
                          {isEligible ? v.subtitle : `Syarat Belanja Belum Terpenuhi (Min. ${formatIDR(v.minSpend || 0)})`}
                        </p>

                        <div className="text-[9px] text-gray-400">Berlaku s.d {v.expiryDate}</div>
                      </div>

                      {/* Custom Radio Button Indicator (Tosca for Discount) */}
                      <div className="shrink-0 flex items-center">
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                            isChecked
                              ? 'border-[#00A896] bg-white'
                              : isEligible
                              ? 'border-gray-300 bg-white'
                              : 'border-gray-200 bg-gray-100 opacity-50'
                          }`}
                        >
                          {isChecked && <div className="w-2.5 h-2.5 rounded-full bg-[#00A896]" />}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer Shopee Style Sticky Action Bar */}
        <div className="bg-white border-t border-gray-200 p-4 flex items-center justify-between shrink-0">
          <div className="text-xs">
            <span className="text-gray-500 font-medium">Voucher Dipilih:</span>
            <div className="font-bold text-[#774EFC] text-sm">
              {selectedCount} Voucher Dipilih
            </div>
          </div>

          <button
            onClick={handleConfirmOK}
            className="px-8 py-3 bg-[#774EFC] hover:bg-[#6332f6] text-white font-bold text-xs rounded-xl shadow-lg shadow-purple-500/25 transition-all cursor-pointer"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};
