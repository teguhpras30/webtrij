"use client";

import { useState } from "react";
import { X, Loader2, Tag, Percent, DollarSign, AlertCircle, Calendar, Truck } from "lucide-react";

function formatDateForInput(dateStr?: string | Date | null): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "";
  const pad = (n: number) => (n < 10 ? `0${n}` : n);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

interface VoucherModalProps {
  products?: any[];
  initialData?: any;
  onClose: () => void;
  onSuccess: (saved: any) => void;
}

export default function VoucherModal({ products = [], initialData, onClose, onSuccess }: VoucherModalProps) {
  const [code, setCode] = useState(initialData?.code || "");
  const [scope, setScope] = useState<"SHOP" | "PRODUCT" | "SHIPPING">(
    initialData?.scope || (initialData?.isOngkirTemplate ? "SHIPPING" : "SHOP")
  );
  const [targetProductIds, setTargetProductIds] = useState<number[]>(
    initialData?.targetProductIds || []
  );
  const [discountType, setDiscountType] = useState<"PERCENTAGE" | "FIXED">(
    initialData?.discountType || "PERCENTAGE"
  );
  const [discountValue, setDiscountValue] = useState<number | string>(
    initialData?.discountValue !== undefined ? initialData.discountValue : ""
  );
  const [minPurchase, setMinPurchase] = useState<number | string>(
    initialData?.minPurchase !== undefined ? initialData.minPurchase : 0
  );
  const [maxDiscount, setMaxDiscount] = useState<number | string>(
    initialData?.maxDiscount !== undefined && initialData?.maxDiscount !== null
      ? initialData.maxDiscount
      : ""
  );
  const [usageLimit, setUsageLimit] = useState<number | string>(
    initialData?.usageLimit !== undefined && initialData?.usageLimit !== null
      ? initialData.usageLimit
      : ""
  );
  const [isActive, setIsActive] = useState<boolean>(
    initialData?.isActive !== undefined ? initialData.isActive : true
  );
  const [startDate, setStartDate] = useState<string>(formatDateForInput(initialData?.startDate));
  const [endDate, setEndDate] = useState<string>(formatDateForInput(initialData?.endDate));

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      setError("Kode voucher wajib diisi.");
      return;
    }
    if (!discountValue || Number(discountValue) <= 0) {
      setError("Nilai diskon harus lebih dari 0.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const isEditing = Boolean(initialData && initialData.id);
      const url = isEditing ? `/api/admin/vouchers/${initialData.id}` : "/api/admin/vouchers";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: code.trim().toUpperCase(),
          discountType,
          discountValue: Number(discountValue),
          minPurchase: Number(minPurchase) || 0,
          maxDiscount: maxDiscount ? Number(maxDiscount) : null,
          usageLimit: usageLimit ? Number(usageLimit) : null,
          isActive,
          startDate: startDate ? new Date(startDate).toISOString() : null,
          endDate: endDate ? new Date(endDate).toISOString() : null,
          scope,
          targetProductIds: scope === "PRODUCT" ? targetProductIds : [],
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menyimpan voucher.");

      onSuccess(data);
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan saat menyimpan voucher.");
    } finally {
      setLoading(false);
    }
  };

  const isEditing = Boolean(initialData && initialData.id);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 font-sans">
      <div className="bg-white border border-gray-200 rounded-3xl w-full max-w-lg p-5 relative shadow-2xl max-h-[88vh] flex flex-col my-auto">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 cursor-pointer transition">
          <X className="w-5 h-5" />
        </button>

        <div className="mb-3 shrink-0 pr-6">
          <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
            {initialData?.isOngkirTemplate ? (
              <>
                <Truck className="w-5 h-5 text-blue-600" />
                <span className="text-blue-900">
                  {isEditing ? "Edit Voucher Potongan Ongkir" : "Tambah Voucher Potongan Ongkir"}
                </span>
              </>
            ) : (
              <>
                <Tag className="w-4 h-4 text-red-600" />
                <span>{isEditing ? "Edit Voucher Diskon" : "Tambah Voucher Baru"}</span>
              </>
            )}
          </h2>
          <p className="text-[11px] text-gray-500 mt-0.5">
            {initialData?.isOngkirTemplate
              ? "Buat kupon potongan ongkos kirim (Shipping Voucher) untuk potongan pengiriman di checkout."
              : "Atur kode diskon, tipe persentase/nominal, serta syarat minimal belanja."}
          </p>
        </div>

        {error && (
          <div className="mb-3 text-xs text-red-600 bg-red-50 p-2.5 rounded-xl border border-red-200 flex items-center gap-2 font-medium shrink-0">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3 text-xs overflow-y-auto pr-1.5 flex-1 scrollbar-thin">
          <div>
            <label className="block text-gray-700 mb-1 font-semibold">Kode Voucher *</label>
            <input
              type="text"
              required
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder={initialData?.isOngkirTemplate ? "Contoh: FREEONGKIR10K / ONGKIRBEBAS" : "Contoh: TRIJHEMAT50 / DISKON10"}
              className={`w-full bg-gray-50 border focus:bg-white rounded-xl px-3 py-2.5 text-gray-900 font-bold uppercase focus:outline-none tracking-wider ${
                initialData?.isOngkirTemplate ? "border-blue-300 focus:border-blue-500" : "border-gray-200 focus:border-red-500"
              }`}
            />
          </div>

          {/* Tipe Cakupan Voucher: Voucher Toko vs Voucher Produk (Disembunyikan jika Voucher Ongkir) */}
          {!initialData?.isOngkirTemplate && (
            <>
              <div>
                <label className="block text-gray-700 mb-1.5 font-semibold">Tipe Cakupan Voucher *</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setScope("SHOP")}
                    className={`p-2.5 rounded-2xl border text-left flex flex-col gap-1 transition cursor-pointer ${
                      scope === "SHOP"
                        ? "bg-emerald-50/80 border-emerald-500 text-emerald-900 shadow-xs"
                        : "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-[11px]">Voucher Toko</span>
                      <span className={`w-3 h-3 rounded-full border flex items-center justify-center ${scope === "SHOP" ? "border-emerald-600 bg-emerald-600" : "border-gray-400"}`}>
                        {scope === "SHOP" && <div className="w-1 h-1 rounded-full bg-white" />}
                      </span>
                    </div>
                    <span className="text-[9px] text-gray-500 leading-tight">Semua produk toko</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setScope("PRODUCT")}
                    className={`p-2.5 rounded-2xl border text-left flex flex-col gap-1 transition cursor-pointer ${
                      scope === "PRODUCT"
                        ? "bg-emerald-50/80 border-emerald-500 text-emerald-900 shadow-xs"
                        : "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-[11px]">Voucher Produk</span>
                      <span className={`w-3 h-3 rounded-full border flex items-center justify-center ${scope === "PRODUCT" ? "border-emerald-600 bg-emerald-600" : "border-gray-400"}`}>
                        {scope === "PRODUCT" && <div className="w-1 h-1 rounded-full bg-white" />}
                      </span>
                    </div>
                    <span className="text-[9px] text-gray-500 leading-tight">Produk tertentu</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setScope("SHIPPING")}
                    className={`p-2.5 rounded-2xl border text-left flex flex-col gap-1 transition cursor-pointer ${
                      scope === "SHIPPING"
                        ? "bg-teal-50/80 border-teal-500 text-teal-900 shadow-xs"
                        : "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-[11px]">Gratis Ongkir</span>
                      <span className={`w-3 h-3 rounded-full border flex items-center justify-center ${scope === "SHIPPING" ? "border-teal-600 bg-teal-600" : "border-gray-400"}`}>
                        {scope === "SHIPPING" && <div className="w-1 h-1 rounded-full bg-white" />}
                      </span>
                    </div>
                    <span className="text-[9px] text-gray-500 leading-tight">Potongan ongkos kirim</span>
                  </button>
                </div>
              </div>

              {/* Product Picker Selection List if scope === "PRODUCT" */}
              {scope === "PRODUCT" && (() => {
                const allProductIds = products ? products.map((p) => p.id) : [];
                const isAllProductsSelected =
                  allProductIds.length > 0 && allProductIds.every((id) => targetProductIds.includes(id));

                const toggleSelectAllProducts = () => {
                  if (isAllProductsSelected) {
                    setTargetProductIds([]);
                  } else {
                    setTargetProductIds(allProductIds);
                  }
                };

                return (
                  <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-200 space-y-2">
                    <div className="flex items-center justify-between border-b border-gray-200 pb-1.5">
                      <label className="flex items-center gap-2 cursor-pointer select-none font-bold text-xs text-gray-800">
                        <input
                          type="checkbox"
                          checked={isAllProductsSelected}
                          onChange={toggleSelectAllProducts}
                          className="rounded border-gray-300 text-red-600 focus:ring-red-500 w-4 h-4 cursor-pointer"
                        />
                        <span>Centang Semua Produk ({products.length})</span>
                      </label>
                      <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-md border border-red-200">
                        {targetProductIds.length} / {products.length} Dipilih
                      </span>
                    </div>

                  {products && products.length > 0 ? (
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {products.map((p) => {
                        const isChecked = targetProductIds.includes(p.id);
                        return (
                          <label
                            key={p.id}
                            className={`flex items-center justify-between p-2 rounded-xl border transition cursor-pointer select-none ${
                              isChecked
                                ? "bg-white border-red-400 shadow-2xs"
                                : "bg-white/50 border-gray-200 hover:bg-white"
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setTargetProductIds([...targetProductIds, p.id]);
                                  } else {
                                    setTargetProductIds(targetProductIds.filter((id) => id !== p.id));
                                  }
                                }}
                                className="rounded border-gray-300 text-red-600 focus:ring-red-500 w-4 h-4 cursor-pointer"
                              />
                              <img
                                src={p.thumbnail || p.image}
                                alt={p.name}
                                className="w-8 h-8 rounded-lg object-cover border border-gray-200 shrink-0"
                              />
                              <div>
                                <p className="font-bold text-xs text-gray-900 line-clamp-1">{p.name}</p>
                                <p className="text-[10px] text-gray-500">Rp {p.retailPrice?.toLocaleString("id-ID")}</p>
                              </div>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400 py-2">Tidak ada produk tersedia untuk dipilih.</p>
                  )}
                </div>
                );
              })()}
            </>
          )}

          {/* Nominal Diskon / Potongan Ongkir */}
          {initialData?.isOngkirTemplate ? (
            <div>
              <label className="block text-gray-700 mb-1 font-semibold flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-blue-600" />
                <span>Nominal Potongan Ongkir (Rp) *</span>
              </label>
              <input
                type="number"
                min={1}
                required
                value={discountValue}
                onChange={(e) => setDiscountValue(e.target.value === "" ? "" : Number(e.target.value))}
                placeholder="Contoh: 10000 (Potongan Rp 10.000)"
                className="w-full bg-blue-50/50 border border-blue-300 focus:bg-white rounded-xl px-3 py-2.5 text-gray-900 font-bold focus:outline-none focus:border-blue-500"
              />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-gray-700 mb-1 font-semibold">Tipe Diskon *</label>
                <select
                  value={discountType}
                  onChange={(e) => setDiscountType(e.target.value as any)}
                  className="w-full bg-gray-50 border border-gray-200 focus:bg-white rounded-xl px-3 py-2.5 text-gray-900 font-semibold focus:outline-none focus:border-red-500 cursor-pointer"
                >
                  <option value="PERCENTAGE">Persentase (%)</option>
                  <option value="FIXED">Nominal Tetap (Rp)</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-700 mb-1 font-semibold">
                  {discountType === "PERCENTAGE" ? "Besar Diskon (%) *" : "Nominal Potongan (Rp) *"}
                </label>
                <input
                  type="number"
                  min={1}
                  required
                  value={discountValue}
                  onChange={(e) => setDiscountValue(e.target.value === "" ? "" : Number(e.target.value))}
                  placeholder={discountType === "PERCENTAGE" ? "Contoh: 10 (10%)" : "Contoh: 50000"}
                  className="w-full bg-gray-50 border border-gray-200 focus:bg-white rounded-xl px-3 py-2.5 text-gray-900 font-bold focus:outline-none focus:border-red-500"
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-700 mb-1 font-semibold">Minimal Belanja (Rp)</label>
              <input
                type="number"
                min={0}
                value={minPurchase}
                onChange={(e) => setMinPurchase(e.target.value === "" ? "" : Number(e.target.value))}
                placeholder="0 = Tanpa Minimal"
                className="w-full bg-gray-50 border border-gray-200 focus:bg-white rounded-xl px-3 py-2.5 text-gray-900 font-bold focus:outline-none focus:border-red-500"
              />
            </div>

            {discountType === "PERCENTAGE" ? (
              <div>
                <label className="block text-gray-700 mb-1 font-semibold">Maksimal Diskon (Rp)</label>
                <input
                  type="number"
                  min={0}
                  value={maxDiscount}
                  onChange={(e) => setMaxDiscount(e.target.value === "" ? "" : Number(e.target.value))}
                  placeholder="Kosongkan jika unlimited"
                  className="w-full bg-gray-50 border border-gray-200 focus:bg-white rounded-xl px-3 py-2.5 text-gray-900 font-bold focus:outline-none focus:border-red-500"
                />
              </div>
            ) : (
              <div>
                <label className="block text-gray-700 mb-1 font-semibold">Batas Kuota Pakai (Pengguna)</label>
                <input
                  type="number"
                  min={1}
                  value={usageLimit}
                  onChange={(e) => setUsageLimit(e.target.value === "" ? "" : Number(e.target.value))}
                  placeholder="Kosongkan jika tak terbatas"
                  className="w-full bg-gray-50 border border-gray-200 focus:bg-white rounded-xl px-3 py-2.5 text-gray-900 font-bold focus:outline-none focus:border-red-500"
                />
              </div>
            )}
          </div>

          {discountType === "PERCENTAGE" && (
            <div>
              <label className="block text-gray-700 mb-1 font-semibold">Batas Kuota Pakai (Pengguna)</label>
              <input
                type="number"
                min={1}
                value={usageLimit}
                onChange={(e) => setUsageLimit(e.target.value === "" ? "" : Number(e.target.value))}
                placeholder="Kosongkan jika tak terbatas"
                className="w-full bg-gray-50 border border-gray-200 focus:bg-white rounded-xl px-3 py-2.5 text-gray-900 font-bold focus:outline-none focus:border-red-500"
              />
            </div>
          )}

          {/* Pengaturan Waktu Masa Berlaku Voucher */}
          <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-200 space-y-3">
            <div className="flex items-center gap-2 font-bold text-gray-800 text-xs border-b border-gray-200 pb-1.5">
              <Calendar className="w-4 h-4 text-red-600" />
              <span>Pengaturan Waktu Masa Berlaku Voucher</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-gray-700 mb-1 font-semibold text-xs">Waktu Mulai Berlaku</label>
                <input
                  type="datetime-local"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-white border border-gray-200 focus:bg-white rounded-xl px-3 py-2 text-gray-900 font-semibold focus:outline-none focus:border-red-500 text-xs"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-1 font-semibold text-xs">Waktu Berakhir (Kadaluarsa)</label>
                <input
                  type="datetime-local"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full bg-white border border-gray-200 focus:bg-white rounded-xl px-3 py-2 text-gray-900 font-semibold focus:outline-none focus:border-red-500 text-xs"
                />
              </div>
            </div>
            <p className="text-[10px] text-gray-500 italic">
              * Kosongkan jika voucher berlaku selamanya tanpa batas waktu mulai atau berakhir.
            </p>
          </div>

          <div className="pt-2">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="rounded border-gray-300 text-red-600 focus:ring-red-500 w-4 h-4 cursor-pointer"
              />
              <span className="text-gray-800 font-bold text-xs">Status Voucher Aktif</span>
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 cursor-pointer font-medium"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white font-semibold rounded-xl flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>Simpan Voucher</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
