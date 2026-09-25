"use client";

import { useState, useEffect } from "react";
import {
  CreditCard,
  Save,
  Loader2,
  MapPin,
  Building2,
  Phone,
  User,
  Hash,
  Plus,
  Trash2,
  CheckCircle2,
  Edit3,
  Check,
  Eye,
  X,
} from "lucide-react";
import BiteshipLocationPicker from "@/components/admin/BiteshipLocationPicker";

interface WarehouseItem {
  id: string;
  name: string;
  contactName: string;
  contactPhone: string;
  address: string;
  postalCode: number;
  isPrimary: boolean;
}

interface SettingsTabProps {
  onShowToast: (message: string, type: "success" | "error") => void;
}

export default function SettingsTab({ onShowToast }: SettingsTabProps) {
  const [adminFee, setAdminFee] = useState<number>(2500);

  // Multi-Warehouse State List
  const [warehouses, setWarehouses] = useState<WarehouseItem[]>([
    {
      id: "wh-nganjuk-1",
      name: "Gudang Utama Kertosono (Nganjuk)",
      contactName: "TRI J Official Store",
      contactPhone: "08961656039",
      address:
        "Perumahan Graha Tanjung Jalan Merapi Rt 2 Rw 4 Blok C 8 Dsn Gondang Tanjung, KERTOSONO, KAB. NGANJUK, JAWA TIMUR",
      postalCode: 64315,
      isPrimary: true,
    },
    {
      id: "wh-cikarang-2",
      name: "Gudang Cabang Cikarang (Bekasi)",
      contactName: "TRI J Warehouse Cikarang",
      contactPhone: "08961656039",
      address:
        "Kawasan Industri Cikarang, Cikarang Pusat, Kab. Bekasi, Jawa Barat",
      postalCode: 17530,
      isPrimary: false,
    },
  ]);

  // Editing Warehouse IDs Set
  const [editingIds, setEditingIds] = useState<{ [id: string]: boolean }>({});

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/settings");
      const data = await res.json();
      if (res.ok) {
        if (data.adminFee !== undefined) setAdminFee(data.adminFee);
        if (Array.isArray(data.warehouses) && data.warehouses.length > 0) {
          setWarehouses(data.warehouses);
        }
      }
    } catch (err) {
      console.error("Failed to fetch admin settings:", err);
      onShowToast("Gagal memuat pengaturan sistem", "error");
    } finally {
      setLoading(false);
    }
  };

  const toggleEdit = (id: string) => {
    setEditingIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleSetPrimary = (id: string) => {
    setWarehouses((prev) =>
      prev.map((w) => ({
        ...w,
        isPrimary: w.id === id,
      }))
    );
  };

  const handleWarehouseChange = (id: string, field: keyof WarehouseItem, value: any) => {
    setWarehouses((prev) =>
      prev.map((w) => (w.id === id ? { ...w, [field]: value } : w))
    );
  };

  const handleAddWarehouse = () => {
    const newId = `wh-custom-${Date.now()}`;
    const newWh: WarehouseItem = {
      id: newId,
      name: `Gudang Cabang #${warehouses.length + 1}`,
      contactName: "TRI J Official Store",
      contactPhone: "08961656039",
      address: "Alamat Gudang Baru...",
      postalCode: 60261,
      isPrimary: warehouses.length === 0,
    };
    setWarehouses((prev) => [...prev, newWh]);
    setEditingIds((prev) => ({ ...prev, [newId]: true }));
  };

  const handleDeleteWarehouse = (id: string) => {
    if (warehouses.length <= 1) {
      onShowToast("Minimal harus ada 1 lokasi gudang penjemputan.", "error");
      return;
    }
    const target = warehouses.find((w) => w.id === id);
    if (target?.isPrimary) {
      onShowToast("Pindahkan status Gudang Utama ke gudang lain sebelum menghapus gudang ini.", "error");
      return;
    }
    setWarehouses((prev) => prev.filter((w) => w.id !== id));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    // Ensure exactly 1 primary warehouse
    const hasPrimary = warehouses.some((w) => w.isPrimary);
    let finalWarehouses = [...warehouses];
    if (!hasPrimary && finalWarehouses.length > 0) {
      finalWarehouses[0].isPrimary = true;
    }

    try {
      setSaving(true);
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adminFee,
          warehouses: finalWarehouses,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menyimpan");

      // Close all active edit forms into clean preview card mode
      setEditingIds({});

      onShowToast("🎉 Setelan Alamat Gudang Penjemputan disimpan! Tampilan beralih ke Mode Preview.", "success");
    } catch (err: any) {
      onShowToast(err.message || "Gagal menyimpan pengaturan", "error");
    } finally {
      setSaving(false);
    }
  };

  const formatIDR = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-500 space-y-3 font-sans">
        <Loader2 className="w-8 h-8 animate-spin text-[#774EFC]" />
        <p className="text-sm font-medium">Memuat Pengaturan Multi-Gudang...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl font-sans">
      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Manajemen Multi-Gudang Penjemputan Biteship */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-purple-50 text-[#774EFC] border border-purple-100 flex items-center justify-center font-bold shrink-0">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">
                  Preview & Setelan Alamat Gudang Penjemputan ({warehouses.length} Gudang)
                </h3>
                <p className="text-xs text-gray-500">
                  Setelah disimpan, alamat tampil dalam bentuk Kartu Preview. Klik <strong>'Ubah Alamat'</strong> untuk mengedit.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleAddWarehouse}
              className="px-4 py-2.5 bg-purple-50 hover:bg-purple-100 text-[#774EFC] border border-purple-200 font-bold text-xs rounded-xl flex items-center gap-1.5 transition cursor-pointer self-start sm:self-auto shrink-0 shadow-2xs"
            >
              <Plus className="w-4 h-4" />
              <span>+ Tambah Lokasi Gudang Baru</span>
            </button>
          </div>

          {/* List of Warehouses (Preview Cards vs Edit Form) */}
          <div className="space-y-5">
            {warehouses.map((wh, index) => {
              const isEditing = Boolean(editingIds[wh.id]);

              return (
                <div
                  key={wh.id}
                  className={`p-5 sm:p-6 rounded-3xl border transition-all space-y-4 ${wh.isPrimary
                      ? "bg-purple-50/40 border-purple-300 ring-2 ring-purple-200/80 shadow-xs"
                      : "bg-white border-gray-200 hover:border-gray-300"
                    }`}
                >
                  {/* Header Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-200/60 pb-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-black text-gray-400 font-mono">#{index + 1}</span>

                      {isEditing ? (
                        <input
                          type="text"
                          value={wh.name}
                          onChange={(e) => handleWarehouseChange(wh.id, "name", e.target.value)}
                          className="text-sm font-bold text-gray-900 bg-white border border-gray-300 rounded-xl px-3 py-1 focus:outline-none focus:border-[#774EFC]"
                          placeholder="Nama Lokasi Gudang"
                        />
                      ) : (
                        <h4 className="text-sm font-bold text-gray-900">{wh.name}</h4>
                      )}

                      {wh.isPrimary && (
                        <span className="text-[10px] font-bold bg-purple-600 text-white px-3 py-0.5 rounded-full flex items-center gap-1 shadow-2xs">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Gudang Utama Penjemputan (Active Pickup)</span>
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      {!wh.isPrimary && (
                        <button
                          type="button"
                          onClick={() => handleSetPrimary(wh.id)}
                          className="px-3 py-1.5 bg-white hover:bg-purple-50 text-[#774EFC] font-bold text-xs rounded-xl border border-purple-200 transition cursor-pointer"
                        >
                          Set Sebagai Gudang Utama
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => toggleEdit(wh.id)}
                        className={`px-3.5 py-1.5 text-xs font-bold rounded-xl border transition cursor-pointer flex items-center gap-1.5 ${isEditing
                            ? "bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200"
                            : "bg-purple-50 text-[#774EFC] border-purple-200 hover:bg-purple-100"
                          }`}
                      >
                        {isEditing ? (
                          <>
                            <Eye className="w-3.5 h-3.5" />
                            <span>Selesai Edit</span>
                          </>
                        ) : (
                          <>
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Ubah Alamat</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteWarehouse(wh.id)}
                        className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer"
                        title="Hapus Gudang Ini"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Mode 1: PREVIEW CARD (Input Form Hidden) */}
                  {!isEditing ? (
                    <div className="p-4 bg-gray-50/70 border border-gray-100 rounded-2xl space-y-2 text-xs">
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-200/50 pb-2">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-[#774EFC]" />
                          <span className="font-bold text-gray-800 text-sm">{wh.contactName}</span>
                        </div>
                        <div className="flex items-center gap-1.5 font-bold text-gray-700 font-mono bg-white px-2.5 py-1 rounded-lg border border-gray-200">
                          <Phone className="w-3.5 h-3.5 text-[#774EFC]" />
                          <span>{wh.contactPhone}</span>
                        </div>
                      </div>

                      <div className="flex items-start gap-2 pt-1 text-gray-700 leading-relaxed">
                        <MapPin className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-gray-900 text-xs">{wh.address}</p>
                          <p className="text-[11px] text-gray-500 font-mono font-bold mt-1">
                            Kode Pos Penjemputan: <span className="text-purple-700">{wh.postalCode}</span>
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Mode 2: EDIT FORM (Input Text Active) */
                    <div className="p-4 bg-white border border-purple-200 rounded-2xl space-y-4 animate-fadeIn">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[11px] font-bold text-gray-700 mb-1 flex items-center gap-1">
                            <User className="w-3.5 h-3.5 text-[#774EFC]" />
                            <span>Nama Pengirim / Penanggung Jawab Gudang:</span>
                          </label>
                          <input
                            type="text"
                            value={wh.contactName}
                            onChange={(e) => handleWarehouseChange(wh.id, "contactName", e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold text-gray-900 focus:bg-white focus:outline-none focus:border-[#774EFC]"
                            placeholder="TRI J Official Store"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-gray-700 mb-1 flex items-center gap-1">
                            <Phone className="w-3.5 h-3.5 text-[#774EFC]" />
                            <span>Nomor HP Gudang:</span>
                          </label>
                          <input
                            type="text"
                            value={wh.contactPhone}
                            onChange={(e) => handleWarehouseChange(wh.id, "contactPhone", e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold text-gray-900 focus:bg-white focus:outline-none focus:border-[#774EFC]"
                            placeholder="08961656039"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <BiteshipLocationPicker
                            currentAddress={wh.address}
                            currentPostalCode={wh.postalCode}
                            onSelect={(selected) => {
                              handleWarehouseChange(wh.id, "postalCode", selected.postalCode);
                              const curr = wh.address || "";
                              let updated = curr;
                              if (!curr.toLowerCase().includes(selected.addressText.toLowerCase())) {
                                updated = curr ? `${curr}, ${selected.addressText}` : selected.addressText;
                              }
                              handleWarehouseChange(wh.id, "address", updated);
                            }}
                          />

                          <label className="block text-[11px] font-bold text-gray-700 mb-1 flex items-center gap-1 mt-3">
                            <MapPin className="w-3.5 h-3.5 text-[#774EFC]" />
                            <span>Detail Alamat Lengkap Gudang (Jalan, RT/RW, No. Rumah, Blok):</span>
                          </label>
                          <textarea
                            rows={2}
                            value={wh.address}
                            onChange={(e) => handleWarehouseChange(wh.id, "address", e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs font-semibold text-gray-900 focus:bg-white focus:outline-none focus:border-[#774EFC]"
                            placeholder="Contoh: Perumahan Graha Tanjung Jalan Merapi Rt 2 Rw 4 Blok C 8 Dsn Gondang Tanjung..."
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-gray-700 mb-1 flex items-center gap-1">
                            <Hash className="w-3.5 h-3.5 text-[#774EFC]" />
                            <span>Kode Pos Gudang:</span>
                          </label>
                          <input
                            type="number"
                            value={wh.postalCode}
                            onChange={(e) => handleWarehouseChange(wh.id, "postalCode", Number(e.target.value) || 64315)}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold text-gray-900 focus:bg-white focus:outline-none focus:border-[#774EFC]"
                            placeholder="64315"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 2: Biaya Admin Transaksi */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-xs space-y-5">
          <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center font-bold shrink-0">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">
                Pengaturan Biaya Admin Transaksi
              </h3>
              <p className="text-xs text-gray-500">
                Biaya penanganan admin yang ditambahkan secara otomatis pada halaman checkout.
              </p>
            </div>
          </div>

          <div className="max-w-md space-y-2">
            <label className="block text-xs font-bold text-gray-800">
              Nominal Biaya Admin per Transaksi (Rp)
            </label>
            <div className="relative rounded-xl shadow-xs">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-sm font-bold text-gray-500">
                Rp
              </span>
              <input
                type="number"
                min="0"
                step="500"
                value={adminFee}
                onChange={(e) => setAdminFee(Math.max(0, Number(e.target.value) || 0))}
                className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-xl font-bold text-gray-900 text-base focus:ring-2 focus:ring-[#774EFC] focus:bg-white outline-none transition-all"
                placeholder="2500"
                required
              />
            </div>
            <p className="text-[11px] text-gray-500">
              Nominal aktif: <span className="font-bold text-gray-800">{formatIDR(adminFee)}</span>
            </p>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3 bg-[#774EFC] hover:bg-[#6332f6] text-white font-bold text-xs rounded-xl shadow-lg shadow-purple-500/25 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Menyimpan Pengaturan...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Simpan Semua Pengaturan</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
