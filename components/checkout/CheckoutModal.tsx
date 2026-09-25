'use client';

import React, { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { X, Truck, CreditCard, FileText, Ticket, Loader2, ChevronRight } from 'lucide-react';
import { BiteshipCourierOption } from '@/lib/biteship';
import { ADMIN_FEE_IDR, validateDualVouchers } from '@/lib/vouchers';
import { VoucherSelectorModal } from '@/components/voucher/VoucherSelectorModal';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose }) => {
  const { cart, mode, subtotal, totalWeightGram, clearCart } = useCart();
  const { user } = useAuth();

  const [loading, setLoading] = useState(false);
  const [loadingRates, setLoadingRates] = useState(false);
  const [couriers, setCouriers] = useState<BiteshipCourierOption[]>([]);
  const [selectedCourier, setSelectedCourier] = useState<BiteshipCourierOption | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'qris' | 'va' | 'card' | 'b2b_invoice'>('qris');

  // Dual Shopee Vouchers
  const [appliedShippingCode, setAppliedShippingCode] = useState('ONGKIRFREE');
  const [appliedDiscountCode, setAppliedDiscountCode] = useState('EVERHOME10');
  const [isVoucherSelectorOpen, setIsVoucherSelectorOpen] = useState(false);

  // Form Fields auto-filled from logged-in user profile
  const [customerName, setCustomerName] = useState(user?.name || user?.username || 'Budi Santoso');
  const [phone, setPhone] = useState(user?.phone || '081299887766');
  const [email, setEmail] = useState(user?.email || 'pembeli@webtrij.co.id');
  const [companyName, setCompanyName] = useState('PT Sumber Makmur Sejahtera');
  const [taxNumber, setTaxNumber] = useState('01.345.678.9-012.000');
  const [address, setAddress] = useState(user?.address || 'Jl. Raya Industri No. 88, Kawasan Cikarang, Bekasi, Jawa Barat');

  // Sync logged in user details if available
  useEffect(() => {
    if (user) {
      if (user.name || user.username) setCustomerName(user.name || user.username);
      if (user.phone) setPhone(user.phone);
      if (user.email) setEmail(user.email);
      if (user.address) setAddress(user.address);
    }
  }, [user]);

  // Load Biteship rates from API with loading indicator
  useEffect(() => {
    if (!isOpen) return;

    const fetchRates = async () => {
      try {
        setLoadingRates(true);
        const res = await fetch('/api/biteship/rates', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            destinationArea: address,
            totalWeightGram: totalWeightGram,
            isB2B: mode === 'b2b'
          })
        });
        const data = await res.json();
        if (data.rates && data.rates.length > 0) {
          setCouriers(data.rates);
          setSelectedCourier(data.rates[0]);
        }
      } catch (err) {
        console.error('Failed to load Biteship rates:', err);
      } finally {
        setLoadingRates(false);
      }
    };

    fetchRates();
  }, [isOpen, mode, totalWeightGram, address]);

  const rawShippingCost = selectedCourier ? selectedCourier.price : 0;

  // Calculate Dual Discounts
  const { promoDiscount, shippingDiscount } = validateDualVouchers(
    appliedShippingCode,
    appliedDiscountCode,
    subtotal,
    rawShippingCost
  );

  const adminFee = ADMIN_FEE_IDR;
  const finalShippingCost = Math.max(0, rawShippingCost - shippingDiscount);
  const grandTotal = Math.max(0, subtotal - promoDiscount + finalShippingCost + adminFee);

  if (!isOpen) return null;

  const formatIDR = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  };

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart.map(item => ({
            id: item.product.id,
            name: item.selectedVariant ? `${item.product.name} (${item.selectedVariant.name})` : item.product.name,
            price: item.effectiveUnitPrice,
            quantity: item.quantity
          })),
          customerName,
          customerPhone: phone,
          customerEmail: email,
          companyName: mode === 'b2b' ? companyName : undefined,
          taxNumber: mode === 'b2b' ? taxNumber : undefined,
          shippingAddress: address,
          courier: selectedCourier,
          isB2B: mode === 'b2b',
          promoDiscount,
          shippingDiscount,
          promoCode: [appliedShippingCode, appliedDiscountCode].filter(Boolean).join(', '),
          adminFee
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Checkout gagal');

      // Trigger Snap Modal Notification
      alert(
        `🎉 BERHASIL DI-CHECKOUT!\n\nOrder ID: ${data.orderId}\n` +
        `Subtotal: ${formatIDR(subtotal)}\n` +
        `Diskon Promo: -${formatIDR(promoDiscount)}\n` +
        `Ongkir (${selectedCourier?.service_name}): ${formatIDR(rawShippingCost)}\n` +
        `Diskon Ongkir: -${formatIDR(shippingDiscount)}\n` +
        `Biaya Admin: +${formatIDR(adminFee)}\n` +
        `----------------------------------------\n` +
        `Total Pembayaran: ${formatIDR(data.grandTotal)}\n\n` +
        `Metode Pembayaran: Midtrans Gateway (${paymentMethod.toUpperCase()})\n` +
        `(Status: Transaksi Sandbox Berhasil Diproses)`
      );

      clearCart();
      onClose();
    } catch (err: any) {
      alert(`Error Checkout: ${err.message}`);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[120] flex items-center justify-center p-4 overflow-y-auto font-sans">
        <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto text-white relative">
          {/* Header */}
          <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-950/80 sticky top-0 z-10 backdrop-blur-md">
            <div>
              <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
                <span>Checkout Pembelian Retail B2C</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Integrasi Aggregator Kurir Biteship & Midtrans Payment Gateway</p>
            </div>
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer">
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleCheckoutSubmit} className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column: Customer & Biteship Courier */}
            <div className="space-y-5">
              <div>
                <h3 className="text-sm font-bold text-slate-200 mb-3 pb-1 border-b border-slate-800 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-indigo-400" />
                  <span>1. Data Pembeli & Alamat Pengiriman</span>
                </h3>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-slate-400 mb-1">Nama Lengkap Pembeli:</label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={e => setCustomerName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-100 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-slate-400 mb-1">WhatsApp / Telepon:</label>
                      <input
                        type="text"
                        required
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-100 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">Email:</label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-100 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Alamat Lengkap Pengiriman:</label>
                    <textarea
                      required
                      rows={2}
                      value={address}
                      onChange={e => setAddress(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-100 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* Biteship Couriers Selection with Loading State */}
              <div>
                <h3 className="text-sm font-bold text-slate-200 mb-3 pb-1 border-b border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Truck className="w-4 h-4 text-cyan-400" />
                    <span>2. Pilihan Kurir Aggregator Biteship</span>
                  </div>
                  {loadingRates && (
                    <span className="text-[11px] text-cyan-400 font-normal flex items-center gap-1.5 animate-pulse">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Menghitung Ongkir...
                    </span>
                  )}
                </h3>

                {loadingRates ? (
                  <div className="p-6 rounded-xl border border-cyan-500/30 bg-cyan-950/20 flex flex-col items-center justify-center text-center space-y-2 animate-pulse">
                    <Loader2 className="w-6 h-6 animate-spin text-cyan-400" />
                    <span className="text-xs font-semibold text-cyan-200">
                      Menghubungkan API Biteship Cek Ongkir Live...
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Mengalkulasi tarif pengiriman untuk berat {(totalWeightGram / 1000).toFixed(1)} kg
                    </span>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                    {couriers.map((c) => (
                      <div
                        key={c.service_code}
                        onClick={() => setSelectedCourier(c)}
                        className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                          selectedCourier?.service_code === c.service_code
                            ? 'bg-cyan-950/40 border-cyan-500'
                            : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="text-xl">{c.icon}</span>
                          <div>
                            <div className="text-xs font-bold text-slate-100">{c.service_name}</div>
                            <div className="text-[10px] text-slate-400">Estimasi: {c.etd} • {c.description}</div>
                          </div>
                        </div>
                        <div className="text-xs font-extrabold text-emerald-400">{formatIDR(c.price)}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Dual Vouchers, Midtrans Payment Channel & Total */}
            <div className="space-y-5 flex flex-col justify-between">
              {/* DUAL SHOPEE VOUCHER SELECTOR */}
              <div>
                <h3 className="text-sm font-bold text-slate-200 mb-3 pb-1 border-b border-slate-800 flex items-center gap-1.5">
                  <Ticket className="w-4 h-4 text-orange-400" />
                  <span>3. Voucher Diskon & Gratis Ongkir (Shopee Style)</span>
                </h3>

                <div className="space-y-2.5 text-xs">
                  <div
                    onClick={() => setIsVoucherSelectorOpen(true)}
                    className="p-3 rounded-xl bg-orange-950/30 border border-orange-800/80 hover:border-orange-500 transition-all cursor-pointer flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-2.5">
                      <Ticket className="w-5 h-5 text-orange-400" />
                      <div>
                        <div className="font-bold text-slate-100 text-xs flex items-center gap-1.5 flex-wrap">
                          <span>Pilih Voucher Shopee</span>
                          {appliedShippingCode && (
                            <span className="bg-[#00A896] text-white font-mono px-1.5 py-0.2 rounded text-[9px]">
                              🚚 {appliedShippingCode}
                            </span>
                          )}
                          {appliedDiscountCode && (
                            <span className="bg-[#EE4D2D] text-white font-mono px-1.5 py-0.2 rounded text-[9px]">
                              🏷️ {appliedDiscountCode}
                            </span>
                          )}
                        </div>
                        {promoDiscount + shippingDiscount > 0 && (
                          <div className="text-[10px] text-orange-300 mt-0.5">
                            Total Hemat: -{formatIDR(promoDiscount + shippingDiscount)}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-xs font-bold text-orange-400 group-hover:translate-x-1 transition-transform">
                      <span>Pilih</span>
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Midtrans Payment Channels */}
              <div>
                <h3 className="text-sm font-bold text-slate-200 mb-2 pb-1 border-b border-slate-800 flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-emerald-400" />
                  <span>4. Channel Pembayaran Midtrans</span>
                </h3>

                <div className="space-y-1.5 text-xs">
                  <label className={`flex items-center gap-2.5 p-2.5 rounded-xl border cursor-pointer ${paymentMethod === 'qris' ? 'bg-indigo-950/40 border-indigo-500' : 'bg-slate-950/60 border-slate-800'}`}>
                    <input type="radio" name="pay" checked={paymentMethod === 'qris'} onChange={() => setPaymentMethod('qris')} />
                    <div>
                      <strong className="block text-slate-200">QRIS Instan (GoPay, ShopeePay, Dana, M-Banking)</strong>
                    </div>
                  </label>

                  <label className={`flex items-center gap-2.5 p-2.5 rounded-xl border cursor-pointer ${paymentMethod === 'va' ? 'bg-indigo-950/40 border-indigo-500' : 'bg-slate-950/60 border-slate-800'}`}>
                    <input type="radio" name="pay" checked={paymentMethod === 'va'} onChange={() => setPaymentMethod('va')} />
                    <div>
                      <strong className="block text-slate-200">Virtual Account (BCA, Mandiri, BNI, BRI)</strong>
                    </div>
                  </label>

                  <label className={`flex items-center gap-2.5 p-2.5 rounded-xl border cursor-pointer ${paymentMethod === 'card' ? 'bg-indigo-950/40 border-indigo-500' : 'bg-slate-950/60 border-slate-800'}`}>
                    <input type="radio" name="pay" checked={paymentMethod === 'card'} onChange={() => setPaymentMethod('card')} />
                    <div>
                      <strong className="block text-slate-200">Kartu Kredit / Debit (Visa / Mastercard)</strong>
                    </div>
                  </label>
                </div>
              </div>

              {/* Total Financial Summary */}
              <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Subtotal Produk ({cart.reduce((a,b)=>a+b.quantity,0)} pcs)</span>
                  <span className="font-semibold text-slate-200">{formatIDR(subtotal)}</span>
                </div>

                {promoDiscount > 0 && (
                  <div className="flex justify-between text-orange-400 font-semibold">
                    <span>Diskon Voucher Produk ({appliedDiscountCode})</span>
                    <span>-{formatIDR(promoDiscount)}</span>
                  </div>
                )}

                <div className="flex justify-between text-slate-400">
                  <span>Ongkir ({selectedCourier?.courier_name || 'Biteship'})</span>
                  <span className="font-semibold text-slate-200">{formatIDR(rawShippingCost)}</span>
                </div>

                {shippingDiscount > 0 && (
                  <div className="flex justify-between text-teal-400 font-semibold">
                    <span>Diskon Gratis Ongkir ({appliedShippingCode})</span>
                    <span>-{formatIDR(shippingDiscount)}</span>
                  </div>
                )}

                <div className="flex justify-between text-slate-400">
                  <span>Biaya Admin (Midtrans / Layanan)</span>
                  <span className="font-semibold text-slate-200">+{formatIDR(adminFee)}</span>
                </div>

                <div className="flex justify-between text-base font-extrabold text-white pt-2 border-t border-slate-800">
                  <span>Total Tagihan Akhir:</span>
                  <span className="text-emerald-400 text-lg">{formatIDR(grandTotal)}</span>
                </div>

                <button
                  type="submit"
                  disabled={loading || loadingRates}
                  className="w-full mt-3 py-3 bg-gradient-to-r from-orange-600 to-purple-600 hover:from-orange-500 hover:to-purple-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span>Memproses Gateway Midtrans...</span>
                    </>
                  ) : (
                    `🚀 Bayar Sekarang (${formatIDR(grandTotal)})`
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Shopee Voucher Selector Modal inside Checkout */}
      {isVoucherSelectorOpen && (
        <VoucherSelectorModal
          isOpen={isVoucherSelectorOpen}
          onClose={() => setIsVoucherSelectorOpen(false)}
          subtotal={subtotal}
          shippingCost={rawShippingCost}
          appliedShippingCode={appliedShippingCode}
          appliedDiscountCode={appliedDiscountCode}
          onApplyDualVouchers={(sCode, dCode) => {
            setAppliedShippingCode(sCode);
            setAppliedDiscountCode(dCode);
          }}
        />
      )}
    </>
  );
};
