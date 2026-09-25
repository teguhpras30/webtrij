"use client";

import { X, Ticket, Users, ShoppingBag, Calendar, CheckCircle2, Clock, Truck, Tag, ExternalLink } from "lucide-react";

interface VoucherUsageModalProps {
  voucher: any;
  onClose: () => void;
}

export default function VoucherUsageModal({ voucher, onClose }: VoucherUsageModalProps) {
  if (!voucher) return null;

  const usages = voucher.orderUsages || [];
  const isOngkir = voucher.code.toUpperCase().includes("ONGKIR") || voucher.code.toUpperCase().includes("FREE");

  // Calculate total discount given
  const totalDiscountGiven = usages.reduce((sum: number, o: any) => {
    const amount = isOngkir ? (o.shippingDiscount || o.promoDiscount || 0) : (o.promoDiscount || 0);
    return sum + amount;
  }, 0);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "-";
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "COMPLETED":
      case "DELIVERED":
      case "PAID":
      case "SETTLEMENT":
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">SELESAI / LUNAS</span>;
      case "SHIPPED":
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-50 text-blue-700 border border-blue-200">DIKIRIM</span>;
      case "PACKED":
      case "PROCESSING":
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-50 text-amber-700 border border-amber-200">DIKEMAS</span>;
      case "CANCELLED":
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-red-50 text-red-700 border border-red-200">DIBATALKAN</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-gray-100 text-gray-700 border border-gray-200">{status}</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-gray-900/60 backdrop-blur-xs flex items-center justify-center p-4 font-sans">
      <div className="bg-white border border-gray-100 rounded-3xl w-full max-w-2xl p-6 relative shadow-2xl space-y-4 my-auto max-h-[90vh] flex flex-col">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-400 hover:text-gray-700 p-1.5 rounded-full hover:bg-gray-100 transition cursor-pointer z-10"
          title="Tutup Modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 border-b border-gray-100 pb-3.5 shrink-0 pr-8">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center border shrink-0 ${
              isOngkir ? "bg-blue-50 border-blue-200 text-blue-600" : "bg-emerald-50 border-emerald-200 text-emerald-600"
            }`}
          >
            {isOngkir ? <Truck className="w-6 h-6" /> : <Tag className="w-6 h-6" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-black text-base text-gray-900">{voucher.code}</span>
              <span
                className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full border uppercase tracking-wider ${
                  isOngkir ? "bg-blue-100 text-blue-800 border-blue-300" : "bg-emerald-100 text-emerald-800 border-emerald-300"
                }`}
              >
                {isOngkir ? "🚚 Voucher Potongan Ongkir" : "🏷️ Voucher Toko / Produk"}
              </span>
            </div>
            <p className="text-xs text-gray-500 font-medium mt-0.5">
              Rincian Pengguna & Transaksi yang Menggunakan Kuota Voucher Ini
            </p>
          </div>
        </div>

        {/* STATS SUMMARY BAR */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 shrink-0">
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-3 space-y-0.5 text-center">
            <span className="text-[10px] text-gray-400 font-bold uppercase">Kuota Terpakai</span>
            <p className="font-extrabold text-sm text-gray-900">
              {voucher.usedCount || usages.length} Kali
              <span className="text-[11px] text-gray-400 font-normal"> / {voucher.usageLimit || "∞"}</span>
            </p>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-3 space-y-0.5 text-center">
            <span className="text-[10px] text-gray-400 font-bold uppercase">Nominal Diskon Voucher</span>
            <p className="font-extrabold text-sm text-gray-900">
              {voucher.discountType === "PERCENTAGE"
                ? `${voucher.discountValue}%`
                : `Rp ${voucher.discountValue.toLocaleString("id-ID")}`}
            </p>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-2xl p-3 space-y-0.5 text-center">
            <span className="text-[10px] text-purple-600 font-bold uppercase">Total Potongan Diberikan</span>
            <p className="font-extrabold text-sm text-purple-900">
              Rp {totalDiscountGiven.toLocaleString("id-ID")}
            </p>
          </div>
        </div>

        {/* USAGES TABLE */}
        <div className="overflow-y-auto pr-1 space-y-2 flex-1 scrollbar-thin text-xs">
          <h3 className="font-bold text-gray-800 text-xs flex items-center gap-1.5 pt-1">
            <Users className="w-4 h-4 text-purple-600" />
            <span>Daftar Pemakai Voucher ({usages.length} Transaksi)</span>
          </h3>

          {usages.length === 0 ? (
            <div className="p-8 text-center space-y-2 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
              <Users className="w-10 h-10 text-gray-300 mx-auto" />
              <h4 className="text-xs font-bold text-gray-700">Belum Ada Transaksi Pemakai</h4>
              <p className="text-[11px] text-gray-400">
                Voucher ini belum pernah digunakan oleh pembeli dalam transaksi toko.
              </p>
            </div>
          ) : (
            <div className="border border-gray-200 rounded-2xl overflow-hidden shadow-xs">
              <table className="w-full text-left text-xs text-gray-700">
                <thead className="bg-gray-50 text-gray-500 font-bold border-b border-gray-200 uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="px-3.5 py-2.5">#</th>
                    <th className="px-3.5 py-2.5">Pesanan</th>
                    <th className="px-3.5 py-2.5">Pengguna / Pembeli</th>
                    <th className="px-3.5 py-2.5 text-right">Potongan</th>
                    <th className="px-3.5 py-2.5 text-center">Status</th>
                    <th className="px-3.5 py-2.5">Tanggal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {usages.map((o: any, idx: number) => {
                    const discountAmt = isOngkir ? (o.shippingDiscount || o.promoDiscount || 0) : (o.promoDiscount || 0);
                    return (
                      <tr key={o.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-3.5 py-2.5 font-mono text-gray-400 text-[11px]">{idx + 1}</td>
                        <td className="px-3.5 py-2.5 font-mono font-bold text-gray-900 text-[11px]">
                          #{o.orderNumber || o.id}
                        </td>
                        <td className="px-3.5 py-2.5">
                          <div className="flex items-center gap-2">
                            {o.user?.avatar ? (
                              <img
                                src={o.user.avatar}
                                alt={o.customerName}
                                className="w-7 h-7 rounded-full object-cover border border-gray-200 shrink-0"
                              />
                            ) : (
                              <div className="w-7 h-7 rounded-full bg-purple-100 text-purple-700 border border-purple-200 flex items-center justify-center font-bold text-xs shrink-0">
                                {o.customerName ? o.customerName.charAt(0).toUpperCase() : "U"}
                              </div>
                            )}
                            <div className="min-w-0">
                              <p className="font-bold text-gray-900 text-xs truncate">{o.customerName}</p>
                              <p className="text-[10px] text-gray-400 truncate font-mono">{o.customerEmail || o.customerPhone || "-"}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-3.5 py-2.5 text-right font-extrabold text-emerald-700 whitespace-nowrap">
                          -Rp {discountAmt.toLocaleString("id-ID")}
                        </td>
                        <td className="px-3.5 py-2.5 text-center whitespace-nowrap">
                          {getStatusBadge(o.status)}
                        </td>
                        <td className="px-3.5 py-2.5 text-gray-500 text-[11px] whitespace-nowrap">
                          {formatDate(o.createdAt)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* MODAL FOOTER */}
        <div className="pt-3 border-t border-gray-100 flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-xl text-xs transition cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
