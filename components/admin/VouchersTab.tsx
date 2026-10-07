"use client";

import { useState } from "react";
import {
  Tag,
  Plus,
  Search,
  Edit2,
  Trash2,
  Percent,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Sparkles,
  Truck,
  Users,
} from "lucide-react";
import VoucherUsageModal from "./VoucherUsageModal";

interface VouchersTabProps {
  vouchers: any[];
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenCreateModal: () => void;
  onOpenEditModal: (voucher: any) => void;
  onDeleteVoucher: (id: number) => void;
  onBatchDeleteVouchers?: (ids: number[]) => void;
  onToggleStatus: (id: number, currentStatus: boolean) => void;
}

function getVoucherStatusInfo(v: any) {
  if (!v.isActive) {
    return {
      label: "Nonaktif",
      badgeClass: "bg-gray-100 text-gray-500 border-gray-300 hover:bg-gray-200",
      icon: XCircle,
      iconColor: "text-gray-400",
      canDelete: true,
      tooltipDelete: "Hapus Voucher",
    };
  }

  const now = new Date();

  if (v.startDate && new Date(v.startDate) > now) {
    return {
      label: "Belum Mulai",
      badgeClass: "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100",
      icon: Clock,
      iconColor: "text-blue-600",
      canDelete: true,
      tooltipDelete: "Hapus Voucher (Belum Mulai)",
    };
  }

  if (v.endDate && new Date(v.endDate) < now) {
    return {
      label: "Kadaluarsa",
      badgeClass: "bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100",
      icon: AlertCircle,
      iconColor: "text-amber-600",
      canDelete: true,
      tooltipDelete: "Hapus Voucher (Kadaluarsa)",
    };
  }

  return {
    label: "Aktif",
    badgeClass: "bg-emerald-100 text-emerald-800 border-emerald-300 hover:bg-emerald-200",
    icon: CheckCircle,
    iconColor: "text-emerald-600",
    canDelete: false,
    tooltipDelete: "Voucher aktif tidak dapat dihapus. Nonaktifkan terlebih dahulu.",
  };
}

export default function VouchersTab({
  vouchers,
  searchQuery,
  onSearchChange,
  onOpenCreateModal,
  onOpenEditModal,
  onDeleteVoucher,
  onBatchDeleteVouchers,
  onToggleStatus,
}: VouchersTabProps) {
  const [selectedVoucherIds, setSelectedVoucherIds] = useState<number[]>([]);
  const [selectedVoucherUsage, setSelectedVoucherUsage] = useState<any>(null);

  const filtered = vouchers.filter((v) =>
    v.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredIds = filtered.map((v) => v.id);
  const isAllSelected =
    filteredIds.length > 0 && filteredIds.every((id) => selectedVoucherIds.includes(id));

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedVoucherIds([]);
    } else {
      setSelectedVoucherIds(filteredIds);
    }
  };

  const handleBatchDelete = () => {
    if (selectedVoucherIds.length === 0) return;
    if (onBatchDeleteVouchers) {
      onBatchDeleteVouchers(selectedVoucherIds);
      setSelectedVoucherIds([]);
    }
  };

  const handleDeleteAll = () => {
    if (vouchers.length === 0) return;
    const allIds = vouchers.map((v) => Number(v.id));
    if (onBatchDeleteVouchers) {
      onBatchDeleteVouchers(allIds);
      setSelectedVoucherIds([]);
    }
  };

  return (
    <div className="space-y-4 relative">
      {/* Header Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari kode voucher..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-red-500 focus:bg-white transition"
          />
        </div>

        <div className="flex items-center gap-2">
          {selectedVoucherIds.length > 0 ? (
            <button
              onClick={handleBatchDelete}
              className="px-3.5 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Hapus Terpilih ({selectedVoucherIds.length})</span>
            </button>
          ) : (
            vouchers.length > 0 && (
              <button
                onClick={handleDeleteAll}
                className="px-3.5 py-2 bg-gray-100 hover:bg-red-50 text-gray-700 hover:text-red-600 border border-gray-200 hover:border-red-200 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition"
                title="Hapus Semua Voucher Di Database"
              >
                <Trash2 className="w-3.5 h-3.5 text-red-500" />
                <span>Hapus Semua Voucher ({vouchers.length})</span>
              </button>
            )
          )}
        </div>
      </div>

      {/* Vouchers Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-700 font-bold uppercase tracking-wider whitespace-nowrap">
              <tr>
                <th className="px-3 py-3 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={toggleSelectAll}
                    className="rounded border-gray-300 text-red-600 focus:ring-red-500 w-4 h-4 cursor-pointer"
                    title="Centang Semua Voucher"
                  />
                </th>
                <th className="px-4 py-3">Kode Voucher</th>
                <th className="px-4 py-3">Tipe & Diskon</th>
                <th className="px-4 py-3">Syarat Min Belanja</th>
                <th className="px-4 py-3">Maksimal Diskon</th>
                <th className="px-4 py-3">Masa Berlaku</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-gray-400 font-semibold">
                    Belum ada voucher diskon. Klik tombol "Tambah Voucher Baru" untuk membuat voucher.
                  </td>
                </tr>
              ) : (
                filtered.map((v) => (
                  <tr key={v.id} className={`hover:bg-gray-50/80 transition ${selectedVoucherIds.includes(v.id) ? "bg-red-50/30" : ""}`}>
                    <td className="px-3 py-3 text-center">
                      <input
                        type="checkbox"
                        checked={selectedVoucherIds.includes(v.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedVoucherIds([...selectedVoucherIds, v.id]);
                          } else {
                            setSelectedVoucherIds(selectedVoucherIds.filter((id) => id !== v.id));
                          }
                        }}
                        className="rounded border-gray-300 text-red-600 focus:ring-red-500 w-4 h-4 cursor-pointer"
                      />
                    </td>
                    {/* Voucher Code & Scope */}
                    <td className="px-4 py-3 font-extrabold text-gray-900">
                      <div className="flex flex-col items-start gap-1">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-red-50 text-red-700 rounded-lg border border-red-200 font-mono text-xs tracking-wider">
                          <Tag className="w-3.5 h-3.5" />
                          {v.code}
                        </span>
                        {v.code.toUpperCase().includes("ONGKIR") || v.code.toUpperCase().includes("FREE") || v.scope === "SHIPPING" ? (
                          <span className="text-[10px] font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200 inline-flex items-center gap-1">
                            <Truck className="w-3 h-3 text-blue-600" />
                            Voucher Potongan Ongkir
                          </span>
                        ) : v.scope === "PRODUCT" ? (
                          <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                            Voucher Produk ({v.targetProductIds?.length || 0} Produk)
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                            Voucher Toko (Semua Produk)
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Type & Discount Value */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      {v.discountType === "PERCENTAGE" ? (
                        <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 inline-flex items-center gap-1 whitespace-nowrap">
                          <Percent className="w-3 h-3" />
                          Diskon {v.discountValue}%
                        </span>
                      ) : v.code.toUpperCase().includes("ONGKIR") || v.code.toUpperCase().includes("FREE") || v.scope === "SHIPPING" ? (
                        <span className="font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md border border-sky-200 inline-flex items-center gap-1 whitespace-nowrap">
                          Potongan Rp {v.discountValue.toLocaleString("id-ID")}
                        </span>
                      ) : (
                        <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 inline-flex items-center gap-1 whitespace-nowrap">
                          Potongan Rp {v.discountValue.toLocaleString("id-ID")}
                        </span>
                      )}
                    </td>

                    {/* Min Purchase */}
                    <td className="px-4 py-3 font-semibold text-gray-700 whitespace-nowrap">
                      {v.minPurchase > 0 ? (
                        <span>Rp {v.minPurchase.toLocaleString("id-ID")}</span>
                      ) : (
                        <span className="text-gray-400 italic">Tanpa Minimal</span>
                      )}
                    </td>

                    {/* Maksimal Diskon */}
                    <td className="px-4 py-3 font-semibold text-gray-700 whitespace-nowrap">
                      {v.discountType === "PERCENTAGE" && v.maxDiscount && Number(v.maxDiscount) > 0 ? (
                        <span className="text-amber-700 font-bold">Rp {Number(v.maxDiscount).toLocaleString("id-ID")}</span>
                      ) : (
                        <span className="text-gray-400 italic">-</span>
                      )}
                    </td>

                    {/* Date Range / Masa Berlaku */}
                    <td className="px-4 py-3 text-gray-600 font-medium text-[11px] whitespace-nowrap">
                      {v.startDate || v.endDate ? (
                        <div className="space-y-0.5">
                          {v.startDate && (
                            <div>Mulai: <span className="font-semibold text-gray-900">{new Date(v.startDate).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</span></div>
                          )}
                          {v.endDate && (
                            <div>Berakhir: <span className="font-semibold text-red-600">{new Date(v.endDate).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</span></div>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400 italic">Selamanya</span>
                      )}
                    </td>

                    {/* Status Toggle with Automatic Date Calculation */}
                    <td className="px-4 py-3 text-center whitespace-nowrap">
                      {(() => {
                        const statusInfo = getVoucherStatusInfo(v);
                        const StatusIcon = statusInfo.icon;
                        return (
                          <button
                            onClick={() => onToggleStatus(v.id, v.isActive)}
                            className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold cursor-pointer transition inline-flex items-center gap-1 border ${statusInfo.badgeClass}`}
                            title="Klik untuk menonaktifkan / mengaktifkan voucher"
                          >
                            <StatusIcon className={`w-3 h-3 ${statusInfo.iconColor}`} />
                            <span>{statusInfo.label}</span>
                          </button>
                        );
                      })()}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      {(() => {
                        const statusInfo = getVoucherStatusInfo(v);
                        return (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => onOpenEditModal(v)}
                              className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                              title="Edit Voucher"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => onDeleteVoucher(v.id)}
                              className={`p-1.5 rounded-lg transition cursor-pointer ${statusInfo.canDelete
                                  ? "text-gray-600 hover:text-red-600 hover:bg-red-50"
                                  : "text-gray-300 hover:text-red-400 hover:bg-red-50/50"
                                }`}
                              title={statusInfo.tooltipDelete}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        );
                      })()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
