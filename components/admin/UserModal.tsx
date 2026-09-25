"use client";

import { useState, useEffect } from "react";
import {
  X,
  UserCheck,
  Shield,
  Mail,
  Phone,
  User as UserIcon,
  Loader2,
  MapPin,
  Ticket,
  Truck,
  Eye,
  Edit2,
  Lock,
  ArrowLeft,
  Star,
  ShoppingBag,
} from "lucide-react";

interface UserModalProps {
  initialData: any;
  allOrders?: any[];
  onClose: () => void;
  onSuccess: (updated: any) => void;
}

export default function UserModal({ initialData, allOrders = [], onClose, onSuccess }: UserModalProps) {
  const [isEditMode, setIsEditMode] = useState(false);

  const [name, setName] = useState(initialData?.name || "");
  const [email, setEmail] = useState(initialData?.email || "");
  const [phone, setPhone] = useState(initialData?.phone || "");
  const [address, setAddress] = useState(initialData?.address || "");
  const [role, setRole] = useState(initialData?.role || "USER");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch active vouchers accessible by this user
  const [userVouchers, setUserVouchers] = useState<any[]>([]);
  const [loadingVouchers, setLoadingVouchers] = useState(false);

  // Fetch reviews & ratings written by this user
  const [userReviews, setUserReviews] = useState<any[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);

  // User orders state
  const [userOrders, setUserOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  useEffect(() => {
    const fetchVouchers = async () => {
      setLoadingVouchers(true);
      try {
        const res = await fetch("/api/public/vouchers");
        if (res.ok) {
          const data = await res.json();
          setUserVouchers(data);
        }
      } catch (err) {
        console.warn("Failed to fetch vouchers in user modal", err);
      } finally {
        setLoadingVouchers(false);
      }
    };
    fetchVouchers();
  }, []);

  useEffect(() => {
    const fetchReviews = async () => {
      setLoadingReviews(true);
      try {
        const res = await fetch("/api/public/testimonials");
        if (res.ok) {
          const data = await res.json();
          const matched = Array.isArray(data)
            ? data.filter(
                (t) =>
                  t.name?.toLowerCase().includes(initialData?.name?.toLowerCase()) ||
                  t.review?.toLowerCase().includes(initialData?.name?.toLowerCase())
              )
            : [];
          setUserReviews(matched);
        }
      } catch (err) {
        console.warn("Failed to fetch user reviews in modal", err);
      } finally {
        setLoadingReviews(false);
      }
    };
    if (initialData?.name) {
      fetchReviews();
    }
  }, [initialData]);

  useEffect(() => {
    const fetchUserOrders = async () => {
      setLoadingOrders(true);
      try {
        let combined: any[] = allOrders || [];
        if (combined.length === 0) {
          try {
            const local = localStorage.getItem("webtrij_user_orders");
            if (local) combined = JSON.parse(local);
          } catch (e) {}
        }
        
        try {
          const res = await fetch("/api/user/orders");
          if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data) && data.length > 0) {
              combined = [...combined, ...data];
            }
          }
        } catch (e) {}

        const matched = combined.filter((o) => {
          if (!o) return false;
          const uIdMatch = o.userId && Number(o.userId) === Number(initialData?.id);
          const emailMatch = o.customerEmail && o.customerEmail.toLowerCase() === initialData?.email?.toLowerCase();
          const nameMatch = o.customerName && o.customerName.toLowerCase().includes(initialData?.name?.toLowerCase());
          return uIdMatch || emailMatch || nameMatch;
        });

        const uniqueOrders = Array.from(
          new Map(matched.map((item) => [item.orderNumber || item.id, item])).values()
        );

        setUserOrders(uniqueOrders);
      } catch (err) {
        console.warn("Failed to filter user orders", err);
      } finally {
        setLoadingOrders(false);
      }
    };

    fetchUserOrders();
  }, [initialData, allOrders]);

  // Helper to parse multi-line profile addresses
  const parseProfileAddresses = (addrStr: string) => {
    if (!addrStr || typeof addrStr !== "string") return [];
    return addrStr
      .split(/\n+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
  };

  const profileAddresses = parseProfileAddresses(address || initialData?.address || "");

  const addressList = profileAddresses.map((addr: string, idx: number) => ({
    id: idx + 1,
    address: addr,
    isPrimary: idx === 0,
    label: idx === 0 ? "📍 Alamat Utama" : `📍 Alamat ${idx + 1}`,
  }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      setError("Nama dan email wajib diisi.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/admin/users/${initialData.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone,
          address,
          role,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal memperbarui user.");

      setIsEditMode(false);
      onSuccess(data);
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan saat menyimpan perubahan user.");
    } finally {
      setLoading(false);
    }
  };

  const roleStr = String(role || "USER").trim().toUpperCase();
  const displayAddress = (address || initialData?.address || "").trim();

  return (
    <div className="bg-white border border-gray-200 rounded-3xl w-full p-6 shadow-sm space-y-5 font-sans animate-in fade-in duration-150">
      {/* Top Inline Bar (Back button + Mode Badge) */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-4">
        <button
          type="button"
          onClick={onClose}
          className="px-3.5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl font-bold text-xs flex items-center gap-2 transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-gray-600" />
          <span>Kembali ke Daftar Pengguna</span>
        </button>

        <div className="flex items-center gap-2">
          <span
            className={`text-[10px] font-black px-3 py-1 rounded-full border uppercase tracking-wider ${isEditMode
                ? "bg-amber-100 text-amber-800 border-amber-300"
                : "bg-purple-100 text-purple-800 border-purple-300"
              }`}
          >
            {isEditMode ? "Mode Edit Data" : "Mode Pratinjau (Read-Only)"}
          </span>
        </div>
      </div>

      {/* Main Header Info */}
      <div className="flex items-center gap-3">
        <div
          className={`w-12 h-12 rounded-2xl flex items-center justify-center border shrink-0 transition-colors ${isEditMode
              ? "bg-amber-50 border-amber-200 text-amber-600"
              : "bg-purple-50 border-purple-200 text-purple-600"
            }`}
        >
          {isEditMode ? <Edit2 className="w-6 h-6" /> : <Eye className="w-6 h-6" />}
        </div>
        <div>
          <h2 className="text-base font-bold text-gray-900">
            {isEditMode ? "Edit Akses & Profile User" : "Preview Detail Pengguna"}
          </h2>
          <p className="text-xs text-gray-500 font-medium mt-0.5">
            {isEditMode
              ? "Ubah data kontak, alamat utama, & role hak akses pengguna"
              : "Pratinjau data pengguna secara inline tanpa jendela pop-up baru"}
          </p>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-red-700">
          {error}
        </div>
      )}

      {/* USER SUMMARY CARD */}
      <div className="bg-gray-50/80 border border-gray-200/80 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {initialData?.avatar ? (
            <img
              src={initialData.avatar}
              alt={name}
              className="w-12 h-12 rounded-full object-cover border border-purple-200 shadow-xs shrink-0"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-purple-100 border border-purple-200 flex items-center justify-center font-black text-purple-700 text-base shrink-0">
              {name ? name.charAt(0).toUpperCase() : "U"}
            </div>
          )}
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-sm text-gray-900 truncate">{name || "Tanpa Nama"}</h3>
              {roleStr === "ADMIN" ? (
                <span className="px-2.5 py-0.5 bg-red-50 text-red-700 border border-red-200 text-[10px] rounded-full font-extrabold inline-flex items-center gap-1 shrink-0">
                  <Shield className="w-3 h-3 text-red-600" />
                  <span>ADMINISTRATOR</span>
                </span>
              ) : (
                <span className="px-2.5 py-0.5 bg-purple-50 text-purple-700 border border-purple-200 text-[10px] rounded-full font-extrabold inline-flex items-center gap-1 shrink-0">
                  <UserIcon className="w-3 h-3 text-purple-600" />
                  <span>PEMBELI (USER)</span>
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 truncate font-mono mt-0.5">{email || "-"}</p>
          </div>
        </div>

        {/* Action Toggle Button */}
        <div>
          {!isEditMode ? (
            <button
              type="button"
              onClick={() => setIsEditMode(true)}
              className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-md transition cursor-pointer"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Ubah Data User</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIsEditMode(false)}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold rounded-xl text-xs transition cursor-pointer"
            >
              Kembali ke View Mode
            </button>
          )}
        </div>
      </div>

      {/* VIEW MODE UI vs EDIT MODE UI */}
      {!isEditMode ? (
        /* FULL INLINE READ-ONLY VIEW MODE */
        <div className="space-y-5 pt-1 text-xs">
          {/* Contact Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-white p-3.5 rounded-2xl border border-gray-200 space-y-1">
              <span className="text-[10px] text-gray-400 font-bold uppercase flex items-center gap-1">
                <UserIcon className="w-3.5 h-3.5 text-purple-600" />
                Nama Lengkap
              </span>
              <p className="font-bold text-gray-900 text-xs">{name || "-"}</p>
            </div>

            <div className="bg-white p-3.5 rounded-2xl border border-gray-200 space-y-1">
              <span className="text-[10px] text-gray-400 font-bold uppercase flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-purple-600" />
                No. Telepon / HP
              </span>
              <p className="font-bold text-gray-900 text-xs font-mono">{phone || "-"}</p>
            </div>

            <div className="bg-white p-3.5 rounded-2xl border border-gray-200 space-y-1">
              <span className="text-[10px] text-gray-400 font-bold uppercase flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-purple-600" />
                Alamat Email
              </span>
              <p className="font-bold text-gray-900 text-xs font-mono">{email || "-"}</p>
            </div>
          </div>

          {/* Active Vouchers Received Section (Read-Only) */}
          <div className="space-y-2 pt-2 border-t border-gray-100">
            <label className="block text-xs font-bold text-gray-800 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Ticket className="w-4 h-4 text-[#EE4D2D]" />
                <span>Voucher Aktif yang Diterima / Tersedia ({userVouchers.length})</span>
              </span>
              <span className="text-[10px] text-gray-400 font-normal">Voucher Toko & Ongkir Aktif</span>
            </label>

            {loadingVouchers ? (
              <div className="p-4 text-center text-xs text-gray-400">Memuat voucher pengguna...</div>
            ) : userVouchers.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-48 overflow-y-auto pr-1">
                {userVouchers.map((v) => {
                  const isOngkir =
                    v.code.toUpperCase().includes("ONGKIR") ||
                    v.code.toUpperCase().includes("FREE") ||
                    v.scope === "SHIPPING";
                  const discountTitle =
                    v.discountType === "PERCENTAGE"
                      ? `Diskon ${v.discountValue}%`
                      : `Potongan Rp ${v.discountValue.toLocaleString("id-ID")}`;
                  const minText =
                    v.minPurchase > 0
                      ? `Min: Rp ${v.minPurchase.toLocaleString("id-ID")}`
                      : "Tanpa Min.";

                  return (
                    <div
                      key={v.id}
                      className="relative rounded-2xl h-[88px] transition-all overflow-hidden flex items-stretch border border-gray-200 bg-white shadow-2xs"
                    >
                      {/* Left Badge Icon Ticket Area */}
                      <div
                        className={`w-24 text-white p-2 flex flex-col items-center justify-center text-center relative shrink-0 ${
                          isOngkir
                            ? "bg-gradient-to-br from-[#2563EB] to-blue-700"
                            : "bg-gradient-to-br from-emerald-600 to-teal-700"
                        }`}
                      >
                        {isOngkir ? (
                          <Truck className="w-5 h-5 mb-0.5 opacity-95 text-white" />
                        ) : (
                          <ShoppingBag className="w-5 h-5 mb-0.5 opacity-95 text-white" />
                        )}
                        <span className="text-[8px] font-extrabold leading-tight uppercase tracking-wider text-white">
                          {isOngkir ? "Ongkir" : "Diskon Toko"}
                        </span>
                        {/* Half Circle Cutouts */}
                        <div className="absolute -top-2 -right-2 w-3.5 h-3.5 rounded-full bg-white border-b border-l border-gray-200/80" />
                        <div className="absolute -bottom-2 -right-2 w-3.5 h-3.5 rounded-full bg-white border-t border-l border-gray-200/80" />
                      </div>

                      {/* Right Details Area */}
                      <div className="flex-1 p-2.5 flex items-center justify-between min-w-0 bg-white">
                        <div className="pr-2 min-w-0 flex flex-col justify-center space-y-0.5">
                          <span className="text-xs font-extrabold text-gray-900 line-clamp-1">
                            {discountTitle}
                          </span>
                          <div className="text-[10px] text-gray-500 font-medium line-clamp-1">
                            Kode: <span className="font-extrabold text-gray-800 font-mono underline">{v.code}</span>
                          </div>
                          <span className="text-[9px] text-gray-400 font-semibold line-clamp-1">
                            • {minText}
                          </span>
                        </div>

                        <div className="text-right shrink-0 text-[10px] text-gray-600 bg-gray-50 px-2 py-1 rounded-lg border border-gray-200">
                          <div>Kuota: <span className="font-extrabold text-purple-700">{v.usageLimit ? v.usageLimit : "∞"}</span></div>
                          <div>Pakai: <span className="font-extrabold text-emerald-600">{v.usedCount || 0}</span></div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-4 bg-gray-50 rounded-2xl border border-dashed border-gray-200 text-center text-xs text-gray-400">
                Belum ada voucher aktif yang tersedia untuk pengguna ini.
              </div>
            )}
          </div>

          {/* User Addresses List Section (Moved to Very Bottom) */}
          <div className="space-y-2 pt-2 border-t border-gray-100">
            <label className="block text-xs font-bold text-gray-800 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-purple-600" />
                <span>Daftar Alamat Pengguna ({addressList.length})</span>
              </span>
              <span className="text-[10px] text-gray-400 font-normal">Alamat Utama & Alamat Pengiriman</span>
            </label>

            {addressList.length === 0 ? (
              <div className="p-4 bg-gray-50 rounded-2xl border border-dashed border-gray-200 text-center text-xs text-gray-400">
                Belum ada data alamat tersimpan untuk pengguna ini.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-48 overflow-y-auto pr-1">
                {addressList.map((item: any, idx: number) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-2xl border space-y-1.5 text-xs transition ${item.isPrimary
                        ? "bg-purple-50/70 border-purple-300"
                        : "bg-gray-50 border-gray-200"
                      }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${item.isPrimary
                            ? "bg-purple-600 text-white border-purple-600"
                            : "bg-gray-200 text-gray-700 border-gray-300"
                          }`}
                      >
                        {item.isPrimary ? "📍 Alamat Utama" : `📍 Alamat ${idx + 1}`}
                      </span>
                    </div>

                    <p className="text-gray-800 font-medium leading-relaxed text-xs">
                      {item.address}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* List Pembelian & Riwayat Pesanan Section */}
          <div className="space-y-2 pt-2 border-t border-gray-100">
            <label className="block text-xs font-bold text-gray-800 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <ShoppingBag className="w-4 h-4 text-[#774EFC]" />
                <span>List Pembelian & Riwayat Pesanan ({userOrders.length})</span>
              </span>
              <span className="text-[10px] text-gray-400 font-normal">Riwayat Transaksi Checkout</span>
            </label>

            {loadingOrders ? (
              <div className="p-4 text-center text-xs text-gray-400">Memuat riwayat pembelian pengguna...</div>
            ) : userOrders.length > 0 ? (
              <div className="space-y-2.5 max-h-52 overflow-y-auto pr-1">
                {userOrders.map((ord: any, idx: number) => {
                  const statusStr = String(ord.status || "PENDING").toUpperCase();
                  const isCompleted = statusStr === "COMPLETED" || statusStr === "PAID" || statusStr === "DELIVERED";
                  return (
                    <div
                      key={ord.id || idx}
                      className={`p-3 rounded-2xl border space-y-2 text-xs transition ${
                        isCompleted ? "bg-purple-50/50 border-purple-200" : "bg-gray-50 border-gray-200"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold font-mono text-gray-900 text-xs">
                            {ord.orderNumber || `#ORD-${ord.id}`}
                          </span>
                          <span
                            className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full border ${
                              isCompleted
                                ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                                : "bg-amber-100 text-amber-800 border-amber-300"
                            }`}
                          >
                            {statusStr}
                          </span>
                        </div>

                        <span className="font-extrabold text-[#774EFC] text-xs font-mono">
                          Rp {(ord.grandTotal || 0).toLocaleString("id-ID")}
                        </span>
                      </div>

                      {/* Items list */}
                      {ord.items && ord.items.length > 0 && (
                        <div className="text-[11px] text-gray-600 bg-white p-2.5 rounded-xl border border-gray-100 space-y-1">
                          {ord.items.map((it: any, i: number) => (
                            <div key={i} className="flex justify-between">
                              <span>
                                • {it.product?.name || it.name || "Produk TRI J"} {it.variantName ? `(${it.variantName})` : ""}
                              </span>
                              <span className="font-semibold text-gray-800">x{it.quantity || 1}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Penilaian / Rating Bintang pada Setiap Card Pembelian */}
                      {isCompleted ? (
                        <div className="bg-amber-50/80 p-2 rounded-xl border border-amber-200/80 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                          <div className="flex items-center gap-1 text-amber-500">
                            <span className="font-extrabold text-gray-800 mr-1 text-[10px]">Penilaian:</span>
                            {[...Array(ord.rating || 5)].map((_, i) => (
                              <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                            ))}
                            <span className="font-extrabold text-amber-900 text-[10px] ml-1 font-mono">
                              {ord.rating || 5}.0
                            </span>
                          </div>
                          <span className="text-[10px] font-extrabold text-amber-800 italic bg-white/90 px-2 py-0.5 rounded border border-amber-200">
                            {ord.review ? `"${ord.review}"` : "Sangat Puas ⭐⭐⭐⭐⭐"}
                          </span>
                        </div>
                      ) : (
                        <div className="bg-gray-100/70 p-1.5 rounded-xl border border-gray-200/60 flex items-center justify-between text-[10px] text-gray-500">
                          <span>Penilaian Pembeli:</span>
                          <span className="font-semibold italic text-gray-400">Belum Ada Penilaian (Pesanan Belum Selesai)</span>
                        </div>
                      )}

                      <div className="flex items-center justify-between text-[10px] text-gray-400 pt-1 border-t border-gray-100">
                        <span>Kurir: {ord.courierName || ord.courierCode || "Standard"}</span>
                        <span>{ord.createdAt ? new Date(ord.createdAt).toLocaleDateString("id-ID") : "Terbaru"}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-4 bg-gray-50 rounded-2xl border border-dashed border-gray-200 text-center text-xs text-gray-400">
                Belum ada riwayat transaksi atau pembelian untuk pengguna ini.
              </div>
            )}
          </div>
        </div>
      ) : (
        /* EDIT MODE FORM UI */
        <form onSubmit={handleSubmit} className="space-y-4 pt-2 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Nama Lengkap *</label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nama Pengguna"
                  className="w-full bg-gray-50 border border-gray-200 focus:bg-white focus:border-purple-500 rounded-xl pl-9 pr-3 py-2 text-xs font-semibold text-gray-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">No. Telepon / HP</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="08123456789"
                  className="w-full bg-gray-50 border border-gray-200 focus:bg-white focus:border-purple-500 rounded-xl pl-9 pr-3 py-2 text-xs font-semibold text-gray-900"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Alamat Email *</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@domain.com"
                className="w-full bg-gray-50 border border-gray-200 focus:bg-white focus:border-purple-500 rounded-xl pl-9 pr-3 py-2 text-xs font-semibold text-gray-900"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-gray-700">Alamat Pengguna</label>
              <span className="text-[10px] text-gray-400 font-normal">Gunakan Enter / Baris Baru untuk memisahkan jika lebih dari 1 alamat</span>
            </div>
            <div className="relative">
              <MapPin className="w-4 h-4 text-purple-600 absolute left-3 top-3" />
              <textarea
                rows={3}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Jl. Merdeka No. 123 (Alamat Utama)&#10;Jl. Sudirman No. 45 (Alamat 2)"
                className="w-full bg-gray-50 border border-gray-200 focus:bg-white focus:border-purple-500 rounded-xl pl-9 pr-3 py-2 text-xs font-semibold text-gray-900 resize-y"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Role & Hak Akses Pengguna *</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole("USER")}
                className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition cursor-pointer flex flex-col items-center gap-1 ${roleStr === "USER" || roleStr === "BUYER"
                    ? "bg-purple-50 border-purple-300 text-purple-800 shadow-xs font-extrabold"
                    : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
                  }`}
              >
                <div className="flex items-center gap-1.5">
                  <UserIcon className="w-3.5 h-3.5 text-purple-600" />
                  <span>USER</span>
                </div>
                <span className="text-[10px] font-semibold text-purple-700">Pembeli Terdaftar</span>
              </button>

              <button
                type="button"
                onClick={() => setRole("ADMIN")}
                className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition cursor-pointer flex flex-col items-center gap-1 ${roleStr === "ADMIN"
                    ? "bg-red-50 border-red-300 text-red-800 shadow-xs font-extrabold"
                    : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
                  }`}
              >
                <div className="flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-red-600" />
                  <span>ADMIN</span>
                </div>
                <span className="text-[10px] font-semibold text-red-600">Administrator System</span>
              </button>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setIsEditMode(false)}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold text-xs transition cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl flex items-center gap-2 cursor-pointer text-xs disabled:opacity-50 shadow-md transition"
            >
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Simpan Perubahan</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
