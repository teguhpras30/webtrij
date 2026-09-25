'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useCart } from '@/context/CartContext';
import { ShoppingCart, Trash2, ArrowLeft, ArrowRight, Ticket, ChevronRight, Truck, Sparkles } from 'lucide-react';
import { validateAndApplyVoucher, mapDbVoucherToDefinition } from '@/lib/vouchers';
import { VoucherSelectorModal } from '@/components/voucher/VoucherSelectorModal';

export default function ShoppingCartPage() {
  const router = useRouter();
  const {
    cart,
    selectedCartItemIds,
    setSelectedCartItemIds,
    removeFromCart,
    updateQuantity,
    clearCart
  } = useCart();

  const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false);
  const [dbVouchers, setDbVouchers] = useState<any[]>([]);
  const [appliedDiscountCode, setAppliedDiscountCode] = useState<string>('');

  // Fetch active public vouchers from PostgreSQL DB
  useEffect(() => {
    fetch('/api/public/vouchers')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const mapped = data.map(mapDbVoucherToDefinition);
          setDbVouchers(mapped);
        } else {
          setDbVouchers([]);
        }
      })
      .catch((err) => console.error('Error fetching public vouchers in cart page:', err));
  }, []);

  // Multi-Selection Mode: Initialize with all items checked if empty
  useEffect(() => {
    if (cart.length > 0 && selectedCartItemIds.length === 0) {
      setSelectedCartItemIds(cart.map(i => i.cartItemId));
    }
  }, [cart, selectedCartItemIds.length, setSelectedCartItemIds]);

  const formatIDR = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  };

  const isAllSelected = cart.length > 0 && selectedCartItemIds.length === cart.length;

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedCartItemIds([]);
    } else {
      setSelectedCartItemIds(cart.map(item => item.cartItemId));
    }
  };

  // Multi-Selection Checkbox Toggle Handler (Allows checking multiple products simultaneously)
  const toggleSelectItem = (cartItemId: string) => {
    if (selectedCartItemIds.includes(cartItemId)) {
      setSelectedCartItemIds(selectedCartItemIds.filter(id => id !== cartItemId));
    } else {
      setSelectedCartItemIds([...selectedCartItemIds, cartItemId]);
    }
  };

  // Checked Items Calculations
  const checkedItems = cart.filter(item => selectedCartItemIds.includes(item.cartItemId));
  const rawSelectedTotal = checkedItems.reduce((acc, item) => acc + (item.effectiveUnitPrice * item.quantity), 0);
  const checkedTotalCount = checkedItems.reduce((acc, item) => acc + item.quantity, 0);

  // Dynamically calculate best recommended discount voucher from DB or applied code
  const discountVouchers = dbVouchers.filter((v) => v.type === 'product_discount' || v.type === 'cashback');
  
  const getVoucherDiscountAmount = (v: any, total: number) => {
    if (v.minSpend && total < v.minSpend) return 0;
    if (v.discountType === 'percentage') {
      let calc = (total * v.value) / 100;
      if (v.maxDiscount && calc > v.maxDiscount) calc = v.maxDiscount;
      return Math.round(calc);
    }
    return Math.min(total, v.value);
  };

  // Rank eligible vouchers by highest discount amount
  const sortedEligibleVouchers = [...discountVouchers].sort((a, b) => {
    return getVoucherDiscountAmount(b, rawSelectedTotal) - getVoucherDiscountAmount(a, rawSelectedTotal);
  });

  const bestRecommendedVoucher = sortedEligibleVouchers.find(
    (v) => (!v.minSpend || rawSelectedTotal >= v.minSpend) && getVoucherDiscountAmount(v, rawSelectedTotal) > 0
  );

  const selectedVoucher = appliedDiscountCode
    ? dbVouchers.find((v) => v.code === appliedDiscountCode && (!v.minSpend || rawSelectedTotal >= v.minSpend))
    : bestRecommendedVoucher;

  // Total Discount Amount a from active/recommended voucher (0 if not eligible)
  const totalDiscountAmount = selectedVoucher
    ? getVoucherDiscountAmount(selectedVoucher, rawSelectedTotal)
    : 0;

  const checkedRowCount = checkedItems.length;
  const discountPerRow = checkedRowCount > 0 ? Math.round(totalDiscountAmount / checkedRowCount) : 0;
  const finalTotalAfterVoucher = Math.max(0, rawSelectedTotal - (checkedRowCount > 0 ? totalDiscountAmount : 0));

  return (
    <main className="min-h-screen bg-gray-50 font-sans flex flex-col justify-between">
      <div>
        <Navbar />

        <section className="mx-auto max-w-5xl px-4 pt-28 pb-44">
          {/* Top Navigation Header */}
          <div className="flex items-center justify-between mb-6">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Kembali Belanja Produk</span>
            </Link>

            <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 px-3.5 py-1.5 rounded-full border border-indigo-100">
              <ShoppingCart className="w-4 h-4 text-indigo-600" />
              <span>Keranjang Saya ({cart.length})</span>
            </div>
          </div>

          {cart.length === 0 ? (
            /* Empty Cart State - No Shadow */
            <div className="bg-white rounded-3xl border border-gray-200 p-12 text-center max-w-lg mx-auto space-y-4 my-8">
              <div className="w-20 h-20 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center mx-auto border border-purple-100">
                <ShoppingCart className="w-10 h-10" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Keranjang Belanja Anda Masih Kosong</h2>
              <p className="text-xs text-gray-500 max-w-sm mx-auto leading-relaxed">
                Jelajahi berbagai koleksi produk perabotan rumah tangga berkualitas dari Everhome Indonesia di katalog kami.
              </p>
              <Link
                href="/products"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#774EFC] hover:bg-[#6332f6] text-white font-bold text-xs rounded-xl transition-all"
              >
                <span>Mulai Belanja Sekarang</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            /* Cart Items List Container - Clean Flat Design (No Shadow) */
            <div className="bg-white rounded-3xl border border-gray-200 p-6 space-y-4">
              {/* Header Bar with Select All Checkbox */}
              <div className="flex items-center justify-between border-b border-gray-200 pb-4">
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 text-sm font-bold text-gray-900 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      onChange={toggleSelectAll}
                      className="w-4.5 h-4.5 accent-[#774EFC] rounded cursor-pointer"
                    />
                    <span>Pilih Semua ({cart.length} Produk)</span>
                  </label>
                </div>

                <button
                  onClick={clearCart}
                  className="text-xs text-rose-600 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Kosongkan Keranjang</span>
                </button>
              </div>

              {/* Items List - No Shadows */}
              <div className="space-y-4 pt-2">
                {cart.map((item) => {
                  const isChecked = selectedCartItemIds.includes(item.cartItemId);
                  const rawItemTotal = item.effectiveUnitPrice * item.quantity;
                  const rowDiscount = isChecked ? discountPerRow : 0;
                  const finalItemAccumulatedTotal = Math.max(0, rawItemTotal - rowDiscount);
                  const effectivePerUnitPrice = Math.round(finalItemAccumulatedTotal / item.quantity);

                  return (
                    <div
                      key={item.cartItemId}
                      className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between ${
                        isChecked
                          ? 'bg-gray-50/80 border-gray-200'
                          : 'bg-white border-gray-100'
                      }`}
                    >
                      <div className="flex gap-3.5 items-center min-w-0 flex-1">
                        {/* Multi-Selection Checkbox [✓] */}
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleSelectItem(item.cartItemId)}
                          className="w-4.5 h-4.5 accent-[#774EFC] rounded cursor-pointer shrink-0"
                        />

                        <img
                          src={item.product.thumbnail}
                          alt={item.product.name}
                          className="w-20 h-20 object-cover rounded-xl bg-white border border-gray-200 flex-shrink-0"
                          onError={(e: any) => { e.target.src = 'https://via.placeholder.com/150'; }}
                        />
                        <div className="min-w-0 flex-1">
                          <h3 className="font-bold text-sm text-gray-900 line-clamp-2 leading-snug">
                            {item.product.name}
                          </h3>
                          {item.selectedVariant && (
                            <span className="inline-block mt-1 px-2.5 py-0.5 bg-purple-50 text-purple-700 border border-purple-100 rounded-full text-[11px] font-bold mr-1">
                              {item.selectedVariant.name}
                            </span>
                          )}

                          {Number(item.product.moq || (item.product as any).minOrder) > 1 && (
                            <span className="inline-block mt-1 px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 rounded-md text-[10px] font-extrabold">
                              Min. Pembelian: {Number(item.product.moq || (item.product as any).minOrder)} item
                            </span>
                          )}

                          {/* Dynamic Price Display */}
                          <div className="flex items-center gap-2 flex-wrap mt-1">
                            <span className="font-extrabold text-sm text-[#774EFC]">
                              {formatIDR(effectivePerUnitPrice)}
                            </span>
                            {item.effectiveUnitPrice > effectivePerUnitPrice && (
                              <span className="text-[11px] text-gray-400 line-through font-semibold">
                                {formatIDR(item.effectiveUnitPrice)}
                              </span>
                            )}
                            <span className="text-[10px] text-purple-700 font-bold bg-purple-50 px-2 py-0.5 rounded border border-purple-100 flex items-center gap-1">
                              <Ticket className="w-3 h-3 text-purple-600" />
                              Dengan Voucher
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Quantity Selector & Item Total */}
                      <div className="flex items-center justify-between sm:justify-end gap-5 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-gray-200">
                        <div className="flex items-center border border-gray-200 rounded-xl bg-white">
                          <button
                            onClick={() => {
                              if (item.quantity > 1) {
                                updateQuantity(item.cartItemId, item.quantity - 1);
                              } else {
                                removeFromCart(item.cartItemId);
                              }
                            }}
                            className="px-3 py-1.5 text-xs font-bold text-gray-700 hover:bg-gray-100 rounded-l transition-colors cursor-pointer"
                          >
                            -
                          </button>
                          <span className="px-3 py-1.5 text-xs font-bold text-gray-900 min-w-[28px] text-center select-none">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                            className="px-3 py-1.5 text-xs font-bold text-gray-700 hover:bg-gray-100 rounded-r transition-colors cursor-pointer"
                          >
                            +
                          </button>
                        </div>

                        <div className="text-right">
                          <div className="text-[10px] text-gray-400 font-semibold">Total Harga:</div>
                          <div className="text-sm font-extrabold text-[#774EFC]">
                            {formatIDR(finalItemAccumulatedTotal)}
                          </div>
                          {rawItemTotal > finalItemAccumulatedTotal && (
                            <div className="text-[10px] text-gray-400 line-through font-medium">
                              {formatIDR(rawItemTotal)}
                            </div>
                          )}
                        </div>

                        <button
                          onClick={() => removeFromCart(item.cartItemId)}
                          className="p-2 text-gray-400 hover:text-rose-600 transition-colors rounded-lg hover:bg-rose-50 cursor-pointer ml-1"
                          title="Hapus produk ini"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
              {/* Inline Checkout Action Card (Tanpa fixed bottombar melayang) */}
              <div className="mt-6 rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-xs font-sans">
                {/* Voucher Bar */}
                <div
                  onClick={() => setIsVoucherModalOpen(true)}
                  className="border-b border-gray-200 px-4 py-3 bg-gradient-to-r from-purple-50/50 via-white to-teal-50/50 flex items-center justify-between cursor-pointer hover:bg-purple-50/60 transition-colors"
                >
                  <div className="flex items-center gap-2 text-xs font-bold text-gray-800">
                    <Ticket className="w-4 h-4 text-[#774EFC]" />
                    <span>Voucher Diskon Produk / Cashback</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-200 inline-flex items-center gap-1">
                      <Truck className="w-3.5 h-3.5 text-blue-600" />
                      <span>Voucher Ongkir</span>
                    </span>

                    {selectedVoucher && totalDiscountAmount > 0 && (
                      <span className="text-[11px] font-bold text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-md border border-teal-200 inline-flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-[#00A896]" />
                        <span>Voucher {selectedVoucher.code}</span>
                      </span>
                    )}

                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </div>
                </div>

                {/* Checkout Action Row */}
                <div className="px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4 text-xs">
                    <label className="flex items-center gap-2 font-bold text-gray-800 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={isAllSelected}
                        onChange={toggleSelectAll}
                        className="w-4.5 h-4.5 accent-[#774EFC] rounded cursor-pointer"
                      />
                      <span>Pilih Semua</span>
                    </label>

                    <div className="flex flex-col justify-center pl-3 border-l border-gray-200">
                      <div className="flex items-baseline gap-1.5 flex-wrap">
                        <span className="text-xs font-bold text-gray-700">Total ({checkedTotalCount} produk):</span>
                        <span className="text-xl font-extrabold text-[#774EFC]">{formatIDR(finalTotalAfterVoucher)}</span>
                        {totalDiscountAmount > 0 && (
                          <span className="text-xs font-extrabold text-[#774EFC] bg-purple-50 px-2 py-0.5 rounded-md border border-purple-100">
                            Hemat: {formatIDR(totalDiscountAmount)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      disabled={checkedTotalCount === 0}
                      onClick={() => router.push('/checkout')}
                      className="w-full sm:w-auto px-8 py-3.5 bg-[#774EFC] hover:bg-[#6332f6] text-white font-extrabold text-sm rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-sm"
                    >
                      <span>Checkout ({checkedTotalCount})</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>
      </div>

      {/* Shopee Voucher Selector Modal */}
      {isVoucherModalOpen && (
        <VoucherSelectorModal
          isOpen={isVoucherModalOpen}
          onClose={() => setIsVoucherModalOpen(false)}
          subtotal={rawSelectedTotal}
          shippingCost={0}
          appliedShippingCode=""
          appliedDiscountCode={appliedDiscountCode}
          onApplyDualVouchers={(_, dCode) => {
            setAppliedDiscountCode(dCode);
          }}
        />
      )}

      <Footer />
    </main>
  );
}
