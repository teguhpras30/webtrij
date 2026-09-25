'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { ArrowLeft, Truck, CreditCard, FileText, Ticket, Loader2, ShieldCheck, ChevronRight, CheckCircle2, Edit3, MapPin, Check, X, AlertCircle } from 'lucide-react';
import { BiteshipCourierOption } from '@/lib/biteship';
import { ADMIN_FEE_IDR, validateDualVouchers, mapDbVoucherToDefinition, VoucherDefinition } from '@/lib/vouchers';
import { VoucherSelectorModal } from '@/components/voucher/VoucherSelectorModal';
import { AddressItem } from '../user/profile/page';

export default function DedicatedCheckoutPage() {
  const router = useRouter();
  const { checkedCartItems, mode, subtotal, totalWeightGram, clearCheckedCartItems } = useCart();
  const { user } = useAuth();

  const [loading, setLoading] = useState(false);
  const [loadingRates, setLoadingRates] = useState(false);
  const [couriers, setCouriers] = useState<BiteshipCourierOption[]>([]);
  const [selectedCourier, setSelectedCourier] = useState<BiteshipCourierOption | null>(null);


  // Dual Shopee Vouchers
  const [dbVouchers, setDbVouchers] = useState<VoucherDefinition[]>([]);
  const [appliedShippingCode, setAppliedShippingCode] = useState('');
  const [appliedDiscountCode, setAppliedDiscountCode] = useState('');
  const [isVoucherSelectorOpen, setIsVoucherSelectorOpen] = useState(false);

  // Fetch active vouchers from DB on checkout page load and pick the BEST eligible vouchers
  useEffect(() => {
    fetch('/api/public/vouchers')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const mapped = data.map(mapDbVoucherToDefinition);
          setDbVouchers(mapped);

          // 1. Best eligible shipping voucher
          const eligibleShipping = mapped.find(
            (v) => v.type === 'shipping_discount' && (!v.minSpend || subtotal >= v.minSpend)
          );
          if (eligibleShipping) {
            setAppliedShippingCode(eligibleShipping.code);
          }

          // 2. Best eligible discount voucher (highest discount amount)
          const eligibleDiscount = [...mapped.filter(
            (v) => (v.type === 'product_discount' || v.type === 'cashback') && (!v.minSpend || subtotal >= v.minSpend)
          )].sort((a, b) => {
            const calcAmt = (voc: any) => {
              if (voc.discountType === 'percentage') {
                let c = (subtotal * voc.value) / 100;
                if (voc.maxDiscount && c > voc.maxDiscount) c = voc.maxDiscount;
                return Math.round(c);
              }
              return Math.min(subtotal, voc.value);
            };
            return calcAmt(b) - calcAmt(a);
          })[0];

          if (eligibleDiscount) {
            setAppliedDiscountCode(eligibleDiscount.code);
          }
        }
      })
      .catch((err) => console.error('Error fetching vouchers on checkout page:', err));
  }, [subtotal]);

  // Dynamic Admin Fee State from DB Settings
  const [adminFee, setAdminFee] = useState<number>(ADMIN_FEE_IDR);

  useEffect(() => {
    fetch('/api/public/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.adminFee !== undefined) {
          setAdminFee(Number(data.adminFee) || 0);
        }
      })
      .catch((err) => console.warn('Error fetching public settings on checkout page:', err));
  }, []);

  // Saved Addresses Picker State
  const [savedAddresses, setSavedAddresses] = useState<AddressItem[]>([]);
  const [isAddressPickerOpen, setIsAddressPickerOpen] = useState(false);
  const [isEditingAddressInline, setIsEditingAddressInline] = useState(false);

  // Editable Form Fields (Initialized from Auth / DB)
  const [customerName, setCustomerName] = useState(user?.name || user?.username || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [email, setEmail] = useState(user?.email || '');
  const [address, setAddress] = useState(user?.address || '');

  // Track if initial profile values have been set to prevent overwriting user input while typing
  const isProfileInitialized = useRef(false);

  // Helper to load addresses from localStorage
  const loadLocalStorageAddresses = (userId?: number) => {
    try {
      const keysToTry = [
        userId ? `webtrij_addresses_${userId}` : null,
        "webtrij_addresses"
      ].filter(Boolean) as string[];

      for (const key of keysToTry) {
        const saved = localStorage.getItem(key);
        if (saved) {
          const list: AddressItem[] = JSON.parse(saved);
          if (list && list.length > 0) {
            setSavedAddresses(list);
            return list;
          }
        }
      }
    } catch (e) {
      console.warn("Failed to load saved addresses in checkout:", e);
    }
    return [];
  };

  // Live fetch user profile & address directly from PostgreSQL DB (/api/user/profile)
  useEffect(() => {
    fetch('/api/user/profile')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.user) {
          const dbUser = data.user;
          if (dbUser.name || dbUser.username) setCustomerName(dbUser.name || dbUser.username);
          if (dbUser.phone) setPhone(dbUser.phone);
          if (dbUser.email) setEmail(dbUser.email);
          if (dbUser.address && !isProfileInitialized.current) {
            setAddress(dbUser.address);
            isProfileInitialized.current = true;
          }

          const localList = loadLocalStorageAddresses(dbUser.id);
          if (localList.length > 0 && !isProfileInitialized.current) {
            const primary = localList.find((a) => a.isPrimary) || localList[0];
            if (primary) {
              const street = primary.streetAddress || (primary as any).address || "";
              setCustomerName(primary.recipientName || dbUser.name || "");
              setPhone(primary.phone || dbUser.phone || "");
              const fullAddr = primary.provinsiKotaKecamatan
                ? `${street}, ${primary.provinsiKotaKecamatan}`
                : street || primary.city || "";
              if (fullAddr) setAddress(fullAddr);
              isProfileInitialized.current = true;
            }
          }
        }
      })
      .catch((err) => console.warn('Failed to fetch DB user profile:', err));
  }, []);

  useEffect(() => {
    if (user) {
      if (user.email && !email) setEmail(user.email);
      if (!isProfileInitialized.current) {
        if (user.name || user.username) setCustomerName(user.name || user.username);
        if (user.phone) setPhone(user.phone);
        if (user.address) {
          setAddress(user.address);
          isProfileInitialized.current = true;
        }
        const localList = loadLocalStorageAddresses(user.id);
        if (localList.length > 0) {
          const primary = localList.find((a) => a.isPrimary) || localList[0];
          if (primary) {
            const street = primary.streetAddress || (primary as any).address || "";
            setCustomerName(primary.recipientName || user.name || "");
            setPhone(primary.phone || user.phone || "");
            const fullAddr = primary.provinsiKotaKecamatan
              ? `${street}, ${primary.provinsiKotaKecamatan}`
              : street || primary.city || "";
            if (fullAddr) setAddress(fullAddr);
            isProfileInitialized.current = true;
          }
        }
      }
    }
  }, [user]);

  // Load Biteship rates from API for ONLY checked items
  useEffect(() => {
    const fetchRates = async () => {
      if (checkedCartItems.length === 0) return;
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
          const sortedRates = [...data.rates].sort((a: any, b: any) => a.price - b.price);
          setCouriers(sortedRates);
          setSelectedCourier(sortedRates[0]); // Otomatis memilih kurir termurah (harga terendah)
        }
      } catch (err) {
        console.error('Failed to load Biteship rates:', err);
      } finally {
        setLoadingRates(false);
      }
    };

    const timer = setTimeout(() => {
      fetchRates();
    }, 400);

    return () => clearTimeout(timer);
  }, [checkedCartItems.length, totalWeightGram, address, mode]);

  const rawShippingCost = selectedCourier ? selectedCourier.price : 12000;

  // Calculate Dual Discounts
  const { promoDiscount, shippingDiscount } = validateDualVouchers(
    appliedShippingCode,
    appliedDiscountCode,
    subtotal,
    rawShippingCost,
    dbVouchers
  );

  const finalShippingCost = Math.max(0, rawShippingCost - shippingDiscount);
  const totalCombinedSavings = promoDiscount + shippingDiscount;
  const grandTotal = Math.max(0, subtotal - promoDiscount + finalShippingCost + adminFee);

  const formatIDR = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  };

  const handleSelectSavedAddress = (addr: AddressItem) => {
    const street = addr.streetAddress || (addr as any).address || "";
    setCustomerName(addr.recipientName);
    setPhone(addr.phone);
    setAddress(addr.provinsiKotaKecamatan ? `${street}, ${addr.provinsiKotaKecamatan}` : `${street}, ${addr.city}`);
    setIsAddressPickerOpen(false);
  };

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address.trim()) {
      alert("Alamat pengiriman wajib diisi atau dipilih terlebih dahulu sebelum melanjutkan pembayaran.");
      setIsAddressPickerOpen(true);
      return;
    }
    try {
      setLoading(true);
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: checkedCartItems.map(item => ({
            id: item.product.id,
            name: item.selectedVariant ? `${item.product.name} (${item.selectedVariant.name})` : item.product.name,
            price: item.effectiveUnitPrice,
            quantity: item.quantity
          })),
          customerName,
          customerPhone: phone,
          customerEmail: email,
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

      // Save order to LocalStorage for instant profile display
      try {
        const existing = JSON.parse(localStorage.getItem('webtrij_user_orders') || '[]');
        const newOrderObj = data.order || {
          id: `ord-${Date.now()}`,
          orderNumber: data.orderId,
          createdAt: new Date().toISOString(),
          status: 'PENDING',
          grandTotal: data.grandTotal,
          items: checkedCartItems.map(item => ({
            id: item.product.id,
            quantity: item.quantity,
            unitPrice: item.effectiveUnitPrice,
            totalPrice: item.effectiveUnitPrice * item.quantity,
            product: {
              id: item.product.id,
              name: item.selectedVariant ? `${item.product.name} (${item.selectedVariant.name})` : item.product.name,
              thumbnail: item.product.thumbnail
            }
          }))
        };
        localStorage.setItem('webtrij_user_orders', JSON.stringify([newOrderObj, ...existing.filter((o: any) => o.orderNumber !== data.orderId)]));
      } catch (e) {
        console.warn('Failed to store order in localstorage');
      }

      clearCheckedCartItems();

      // Trigger Midtrans Snap Popup Window Live
      if (data.snapToken && (window as any).snap) {
        (window as any).snap.pay(data.snapToken, {
          onSuccess: function () {
            router.push('/user/profile');
          },
          onPending: function () {
            router.push('/user/profile');
          },
          onError: function () {
            alert('Pembayaran gagal atau dibatalkan.');
          },
          onClose: function () {
            router.push('/user/profile');
          }
        });
      } else if (data.redirectUrl && data.redirectUrl.startsWith('http')) {
        window.location.href = data.redirectUrl;
      } else {
        alert(
          `🎉 PESANAN BERHASIL DIBUAT!\n\nOrder ID: ${data.orderId}\n` +
          `Total Pembayaran: ${formatIDR(data.grandTotal)}\n\n` +
          `Status: Transaksi Sandbox Berhasil Diproses`
        );
        router.push('/user/profile');
      }
    } catch (err: any) {
      alert(`Error Checkout: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (checkedCartItems.length === 0) {
    return (
      <main className="min-h-screen bg-gray-50 font-sans">
        <Navbar />
        <div className="max-w-md mx-auto pt-32 pb-20 px-4 text-center space-y-4">
          <div className="w-16 h-16 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center mx-auto">
            <Ticket className="w-8 h-8" />
          </div>
          <h2 className="text-lg font-bold text-gray-800">Belum Ada Produk Terpilih untuk Checkout</h2>
          <p className="text-xs text-gray-500">Silakan kembali ke keranjang dan centang produk yang ingin Anda beli.</p>
          <Link
            href="/cart"
            className="inline-block px-6 py-2.5 bg-[#774EFC] text-white font-bold text-xs rounded-xl"
          >
            Kembali ke Keranjang Belanja
          </Link>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 font-sans">
      <Navbar />

      <section className="mx-auto max-w-6xl px-4 pt-28 pb-20">
        {/* Top Header */}
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/cart"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Keranjang Belanja</span>
          </Link>

          <h1 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <span>Halaman Checkout {checkedCartItems.length} Produk</span>
          </h1>
        </div>

        <form onSubmit={handleCheckoutSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left & Middle Column (2 Cols): Alamat, Produk, Opsi Pengiriman, Voucher, Payment */}
          <div className="lg:col-span-2 space-y-6">
            {/* 1. Alamat Pengiriman (Shopee Style Clean List View & Address Picker) */}
            <div className="bg-white rounded-2xl border border-gray-200 border-t-4 border-t-[#774EFC] p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3 flex-wrap gap-2">
                <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-purple-600" />
                  <span>Alamat Pengiriman</span>
                </h2>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditingAddressInline(!isEditingAddressInline)}
                    className="text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-xl border border-slate-200 flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>{isEditingAddressInline ? "Selesai Edit" : "Edit Langsung"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsAddressPickerOpen(true)}
                    className="text-xs font-bold text-[#774EFC] hover:underline bg-purple-50 px-3.5 py-1.5 rounded-xl border border-purple-200 flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    <span>Pilih Dari Daftar ({savedAddresses.length})</span>
                  </button>
                </div>
              </div>

              {isEditingAddressInline || !address.trim() ? (
                <div className="p-4 bg-purple-50/50 border border-purple-100 rounded-2xl space-y-3 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-gray-700 block mb-1">Nama Penerima</label>
                      <input
                        type="text"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="Contoh: Budi Santoso"
                        className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-purple-600"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-gray-700 block mb-1">No. WhatsApp / HP</label>
                      <input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Contoh: 08123456789"
                        className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-purple-600 font-mono"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="font-bold text-gray-700 block mb-1">Alamat Lengkap & Kota / Kecamatan</label>
                    <textarea
                      rows={3}
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Masukkan nama jalan, nomor rumah, RT/RW, desa/kelurahan, kecamatan, kota/kabupaten & kode pos"
                      className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-purple-600"
                    />
                  </div>
                </div>
              ) : (
                /* Clean Address Summary List Box */
                <div className="space-y-1 text-xs font-sans">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-bold text-gray-800 text-sm">{customerName || user?.name || user?.username || "Nama Pembeli"}</span>
                    {phone && <span className="font-bold text-gray-700 font-mono">{phone}</span>}
                    {phone && email && <span className="font-bold text-gray-400">|</span>}
                    {email && <span className="text-gray-500 font-semibold">{email}</span>}
                  </div>

                  <p className="text-xs text-gray-600 leading-relaxed font-normal pt-1">
                    {address}
                  </p>

                  <div className="flex items-center gap-2 pt-2">
                    <span className="text-[10px] font-bold text-[#774EFC] bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                      Alamat Utama Pengiriman
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* 2. OPSI PENGIRIMAN (KURIR EXPEDITUR BITESSHIP - TERMURAH OTOMATIS TERPILIH) */}
            <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div>
                  <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
                    <Truck className="w-5 h-5 text-teal-600" />
                    <span>Opsi Pengiriman Kurir</span>
                  </h2>
                  <p className="text-[11px] text-teal-700 font-semibold mt-0.5">
                    💡 Ongkir termurah otomatis terpilih (Anda dapat bebas memilih kurir lain)
                  </p>
                </div>
                {loadingRates && (
                  <span className="text-xs text-teal-600 font-semibold flex items-center gap-1.5 animate-pulse">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Hitung Ongkir Live...</span>
                  </span>
                )}
              </div>

              {loadingRates ? (
                <div className="p-6 bg-teal-50/50 border border-teal-100 rounded-2xl flex flex-col items-center justify-center text-center space-y-2">
                  <Loader2 className="w-6 h-6 animate-spin text-teal-600" />
                  <span className="text-xs font-bold text-teal-800">Menghubungkan API Live Biteship...</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {couriers.map((c, index) => {
                    const isSelected =
                      selectedCourier &&
                      selectedCourier.courier_code === c.courier_code &&
                      selectedCourier.service_code === c.service_code;
                    const isCheapest = index === 0;

                    // Calculate shipping voucher discount for this courier option
                    const courierDiscount = appliedShippingCode
                      ? validateDualVouchers(appliedShippingCode, '', subtotal, c.price, dbVouchers).shippingDiscount
                      : 0;

                    const finalCourierPrice = Math.max(0, c.price - courierDiscount);
                    const hasDiscount = courierDiscount > 0;

                    const sNameLower = c.service_name.toLowerCase();
                    const isCargo = sNameLower.includes('cargo') || sNameLower.includes('gokil') || sNameLower.includes('jtr') || sNameLower.includes('kargo') || sNameLower.includes('trucking');
                    const isHemat = sNameLower.includes('halu') || sNameLower.includes('hemat') || sNameLower.includes('economy') || sNameLower.includes('oke');

                    return (
                      <div
                        key={c.service_code}
                        onClick={() => setSelectedCourier(c)}
                        className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between relative ${isSelected
                          ? 'bg-teal-50/70 border-teal-500 ring-2 ring-teal-300 shadow-xs'
                          : 'bg-gray-50/60 border-gray-200 hover:border-gray-300'
                          }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="text-2xl">{c.icon}</span>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <h4 className="font-bold text-gray-800 truncate">{c.service_name}</h4>
                              {isCheapest && (
                                <span className="text-[9px] font-bold bg-amber-500 text-white px-1.5 py-0.2 rounded-full shadow-2xs">
                                  🏷️ Termurah
                                </span>
                              )}
                              {isCargo && (
                                <span className="text-[9px] font-bold bg-blue-600 text-white px-1.5 py-0.2 rounded-full shadow-2xs">
                                  📦 Kargo
                                </span>
                              )}
                              {isHemat && !isCheapest && (
                                <span className="text-[9px] font-bold bg-emerald-600 text-white px-1.5 py-0.2 rounded-full shadow-2xs">
                                  💡 Hemat
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-gray-500 mt-0.5">Estimasi: {c.etd}</p>
                          </div>
                        </div>

                        <div className="text-right shrink-0 ml-2">
                          {hasDiscount ? (
                            <div className="flex flex-col items-end">
                              <span className="font-bold text-sm text-teal-700 block">
                                {finalCourierPrice === 0 ? "Gratis" : formatIDR(finalCourierPrice)}
                              </span>
                              <span className="text-xs text-gray-400 line-through font-semibold block">
                                {formatIDR(c.price)}
                              </span>
                            </div>
                          ) : (
                            <span className="font-bold text-sm text-gray-800 block">{formatIDR(c.price)}</span>
                          )}

                          {isSelected && (
                            <span className="text-[10px] font-bold text-teal-700 bg-teal-100 border border-teal-300 px-2 py-0.5 rounded-full inline-block mt-1">
                              ✓ Terpilih
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 3. VOUCHER TOKO & GRATIS ONGKIR */}
            <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm space-y-3">
              <h2 className="text-base font-bold text-gray-800 flex items-center gap-2 border-b border-gray-100 pb-3">
                <Ticket className="w-5 h-5 text-[#774EFC]" />
                <span>Voucher Toko & Gratis Ongkir</span>
              </h2>

              <div
                onClick={() => setIsVoucherSelectorOpen(true)}
                className="p-3.5 sm:p-4 rounded-xl bg-gray-50 border border-gray-200 hover:border-purple-300 hover:bg-gray-100/70 transition-all cursor-pointer flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#774EFC] text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Ticket className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm font-bold text-gray-800 flex items-center gap-1.5 flex-wrap">
                      <span>Pilih Voucher Toko</span>
                      {appliedShippingCode && (
                        <span className="text-[10px] font-mono px-2 py-0.5 bg-[#2563EB] text-white rounded-md font-bold">
                          🚚 {appliedShippingCode}
                        </span>
                      )}
                      {appliedDiscountCode && (
                        <span className="text-[10px] font-mono px-2 py-0.5 bg-[#00A896] text-white rounded-md font-bold">
                          🏷️ {appliedDiscountCode}
                        </span>
                      )}
                    </div>
                    {totalCombinedSavings > 0 && (
                      <p className="text-[11px] text-gray-500 font-medium mt-0.5">
                        Total Hemat -{formatIDR(totalCombinedSavings)}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1 text-xs font-bold text-[#774EFC] group-hover:translate-x-1 transition-transform">
                  <span>Pilih</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </div>


          </div>

          {/* Right Column: Ringkasan Rincian Pembayaran & Submit */}
          <div className="space-y-4">
            <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm space-y-5 sticky top-28">
              <h2 className="text-base font-bold text-gray-800 border-b pb-3">
                Ringkasan Pembayaran
              </h2>

              {/* ONLY Checked Items Summary list */}
              <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1 text-xs border-b pb-4">
                {checkedCartItems.map((item) => {
                  const variantText = item.selectedVariant?.name ? ` (${item.selectedVariant.name})` : '';
                  const displayName = `${item.product.name}${variantText}`;
                  return (
                    <div key={item.cartItemId} className="flex justify-between items-center text-gray-700 gap-2">
                      <span className="truncate max-w-[210px]" title={`${displayName} (${item.quantity}x)`}>
                        {displayName} ({item.quantity}x)
                      </span>
                      <span className="font-semibold text-gray-800 shrink-0">{formatIDR(item.effectiveUnitPrice * item.quantity)}</span>
                    </div>
                  );
                })}
              </div>

              {/* Breakdown */}
              <div className="space-y-2.5 text-xs text-gray-600">
                <div className="flex justify-between">
                  <span>Subtotal Produk ({checkedCartItems.reduce((a, b) => a + b.quantity, 0)} pcs)</span>
                  <span className="font-semibold text-gray-800">{formatIDR(subtotal)}</span>
                </div>

                {promoDiscount > 0 && (
                  <div className="flex justify-between">
                    <span>Diskon Produk ({appliedDiscountCode})</span>
                    <span className="font-semibold text-gray-800">-{formatIDR(promoDiscount)}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Ongkir ({selectedCourier?.courier_name || 'JNE REG'})</span>
                  <span className="font-semibold text-gray-800">{formatIDR(rawShippingCost)}</span>
                </div>

                {shippingDiscount > 0 && (
                  <div className="flex justify-between">
                    <span>Subsidi Gratis Ongkir</span>
                    <span className="font-semibold text-gray-800">-{formatIDR(shippingDiscount)}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Biaya Admin</span>
                  <span className="font-semibold text-gray-800">+{formatIDR(adminFee)}</span>
                </div>

                <div className="flex justify-between text-base font-bold text-gray-800 pt-3 border-t border-gray-100">
                  <span>Total Tagihan Akhir</span>
                  <span className="text-[#774EFC] text-xl">{formatIDR(grandTotal)}</span>
                </div>
              </div>

              {!address.trim() && (
                <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold text-center flex items-center justify-center gap-2 shadow-2xs">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Alamat pengiriman masih kosong. Silakan klik 'Ubah / Pilih Alamat' terlebih dahulu.</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || loadingRates || !address.trim()}
                className="w-full py-4 px-6 bg-[#774EFC] hover:bg-[#6332f6] text-white font-bold text-sm rounded-2xl shadow-lg shadow-purple-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Memproses Gateway Midtrans...</span>
                  </>
                ) : !address.trim() ? (
                  <span>⚠️ Lengkapi Alamat Sebelum Bayar</span>
                ) : (
                  `🚀 Bayar Sekarang (${formatIDR(grandTotal)})`
                )}
              </button>

              <div className="flex items-center justify-center gap-2 text-[11px] text-gray-400 pt-1">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>Transaksi Aman & Terverifikasi Midtrans</span>
              </div>
            </div>
          </div>
        </form>
      </section>

      {/* Modal Picker Alamat Tersimpan */}
      {isAddressPickerOpen && (
        <div className="fixed inset-0 z-[999] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl space-y-4 font-sans">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-bold text-gray-800 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-purple-600" />
                <span>Pilih Dari Daftar Alamat Saya</span>
              </h3>
              <button onClick={() => setIsAddressPickerOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {savedAddresses.length === 0 ? (
                <div className="p-6 text-center text-xs text-gray-500 space-y-3 border border-dashed border-gray-200 rounded-2xl">
                  <MapPin className="w-8 h-8 text-purple-400 mx-auto animate-bounce" />
                  <p className="font-bold text-gray-700">Belum ada daftar alamat tersimpan.</p>
                  <p className="text-[11px] text-gray-500">Anda dapat mengisi alamat langsung di halaman checkout ini atau memilih opsi kelola alamat di profil.</p>
                  <Link
                    href="/user/profile"
                    className="inline-block px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs shadow-xs transition"
                  >
                    + Kelola & Tambah Alamat di Profil
                  </Link>
                </div>
              ) : (
                savedAddresses.map((addr) => (
                  <div
                    key={addr.id}
                    onClick={() => handleSelectSavedAddress(addr)}
                    className="p-4 rounded-2xl border border-gray-200 hover:border-purple-500 hover:bg-purple-50/40 cursor-pointer transition-all space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-gray-800 bg-gray-100 px-2.5 py-0.5 rounded-lg border border-gray-200">
                        {addr.label}
                      </span>
                      {addr.isPrimary && (
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          Alamat Utama
                        </span>
                      )}
                    </div>
                    <div className="text-xs font-bold text-gray-800 pt-1">
                      {addr.recipientName} ({addr.phone})
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      {addr.streetAddress || (addr as any).address}, {addr.provinsiKotaKecamatan || addr.city}
                    </p>
                  </div>
                ))
              )}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs">
              <Link href="/user/profile" className="text-purple-600 font-bold hover:underline">
                + Kelola & Tambah Alamat Baru di Profil
              </Link>
              <button
                onClick={() => setIsAddressPickerOpen(false)}
                className="px-4 py-2 bg-gray-200 font-bold rounded-xl text-gray-700"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Shopee Voucher Selector Modal */}
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

      <Footer />
    </main>
  );
}
