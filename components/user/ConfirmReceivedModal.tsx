"use client";

import React from "react";
import { CheckCircle2, PackageCheck, Truck, MapPin, X, Sparkles, ShieldCheck, Heart } from "lucide-react";

interface ConfirmReceivedModalProps {
  order: any;
  onConfirm: () => void;
  onClose: () => void;
}

export default function ConfirmReceivedModal({
  order,
  onConfirm,
  onClose,
}: ConfirmReceivedModalProps) {
  const orderIdentifier = order.orderNumber || String(order.id || "ORD-TJ-413114");
  const items = order.items || order.orderItems || [];

  return (
    <div className="fixed inset-0 z-[999] bg-black/65 backdrop-blur-xs flex items-center justify-center p-4 font-sans animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 sm:p-7 text-gray-800 space-y-5 border border-purple-100 relative transform transition-all animate-in zoom-in-95 duration-200 overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute -top-12 -right-12 w-40 h-40 bg-gradient-to-br from-purple-200/40 via-amber-200/30 to-emerald-200/40 rounded-full blur-2xl pointer-events-none" />

        {/* Top Header Badge */}
        <div className="flex items-center justify-between relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-800 font-extrabold rounded-full border border-emerald-200 text-xs shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
            <span>Konfirmasi Penerimaan Paket</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-800 flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Icon & Title */}
        <div className="text-center space-y-2 relative z-10">
          <div className="w-16 h-16 bg-gradient-to-tr from-emerald-500 to-teal-400 text-white rounded-3xl flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/25 border-4 border-emerald-100">
            <PackageCheck className="w-9 h-9" />
          </div>

          <h3 className="text-lg font-black text-gray-900 tracking-tight">
            Pesanan Telah Diterima?
          </h3>
          <p className="text-xs text-gray-600 leading-relaxed px-2">
            Apakah Anda telah menerima pesanan <span className="font-extrabold font-mono text-purple-700">{orderIdentifier}</span> dengan baik dan lengkap tanpa kendala?
          </p>
        </div>

        {/* Order Details Preview Box */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-gray-200 space-y-2.5 relative z-10 text-xs">
          <div className="flex items-center justify-between font-bold text-gray-700 border-b border-gray-200 pb-2">
            <div className="flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-purple-600" />
              <span>{order.courierName || "Biteship Express"}</span>
            </div>
            <span className="font-mono text-[11px] text-gray-900 bg-white px-2 py-0.5 rounded border border-gray-200">
              {order.waybillNumber || `BITESHIP-${orderIdentifier}`}
            </span>
          </div>

          {items && items.length > 0 && (
            <div className="space-y-1.5 pt-0.5">
              {items.slice(0, 2).map((item: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between text-gray-800">
                  <span className="truncate max-w-[210px] font-semibold">
                    • {item.product?.name || item.variantName || "Produk Perabot TRI J"}
                  </span>
                  <span className="font-extrabold text-purple-700 shrink-0">
                    {item.quantity || 1}x
                  </span>
                </div>
              ))}
              {items.length > 2 && (
                <span className="text-[10px] text-gray-500 font-bold block pt-0.5">
                  + {items.length - 2} barang lainnya
                </span>
              )}
            </div>
          )}

          <div className="pt-2 border-t border-gray-200 flex items-center justify-between text-[11px]">
            <span className="text-gray-500 font-bold">Total Pembayaran:</span>
            <span className="font-extrabold text-emerald-700 text-xs">
              {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(order.grandTotal || 0)}
            </span>
          </div>
        </div>

        {/* Trust & Satisfaction note */}
        <div className="flex items-center gap-2 bg-amber-50/70 p-3 rounded-2xl border border-amber-200 text-[11px] text-amber-900">
          <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
          <p className="leading-tight">
            Setelah dikonfirmasi, dana transaksi akan diteruskan ke penjual dan Anda dapat memberikan nilai ulasan produk.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-1 relative z-10">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-2xl transition cursor-pointer"
          >
            Belum Diterima
          </button>

          <button
            type="button"
            onClick={onConfirm}
            className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs rounded-2xl shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-1.5 transition cursor-pointer transform active:scale-95"
          >
            <CheckCircle2 className="w-4 h-4 text-white" />
            <span>Ya, Sudah Terima!</span>
          </button>
        </div>
      </div>
    </div>
  );
}
