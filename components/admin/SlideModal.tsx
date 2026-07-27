"use client";

import { useState } from "react";
import { X, Loader2, Image as ImageIcon } from "lucide-react";

interface SlideModalProps {
  initialData?: any;
  onClose: () => void;
  onSuccess: (saved: any) => void;
}

export default function SlideModal({ initialData, onClose, onSuccess }: SlideModalProps) {
  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [desktopImage, setDesktopImage] = useState(initialData?.desktopImage || "");
  const [mobileImage, setMobileImage] = useState(initialData?.mobileImage || "");
  const [sortOrder, setSortOrder] = useState(initialData?.sortOrder || 0);
  const [isActive, setIsActive] = useState(initialData?.isActive ?? true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const url = initialData ? `/api/admin/hero-slides/${initialData.id}` : "/api/admin/hero-slides";
      const method = initialData ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, desktopImage, mobileImage, sortOrder, isActive }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menyimpan banner.");

      onSuccess(data);
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan saat menyimpan banner.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg p-6 relative shadow-2xl">
        <button onClick={onClose} className="absolute top-5 right-5 text-slate-400 hover:text-white cursor-pointer transition">
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <ImageIcon className="w-5 h-5 text-red-500" />
          <span>{initialData ? "Edit Hero Banner" : "Input Hero Banner Baru"}</span>
        </h2>

        {error && <div className="mb-4 text-xs text-red-400 bg-red-500/10 p-3 rounded-xl border border-red-500/20">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 mb-1 font-medium">Judul Banner *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Judul Promosi Banner"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-red-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 mb-1 font-medium">Deskripsi Singkat *</label>
            <textarea
              required
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Deskripsi promo hero banner..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-red-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 mb-1 font-medium">URL / Path Gambar Desktop *</label>
            <input
              type="text"
              required
              value={desktopImage}
              onChange={(e) => setDesktopImage(e.target.value)}
              placeholder="/assets/hero/banner-desktop.jpg"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-red-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 mb-1 font-medium">URL / Path Gambar Mobile *</label>
            <input
              type="text"
              required
              value={mobileImage}
              onChange={(e) => setMobileImage(e.target.value)}
              placeholder="/assets/hero/banner-mobile.jpg"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-red-500"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="w-1/2 pr-2">
              <label className="block text-slate-300 mb-1 font-medium">Urutan Tampil</label>
              <input
                type="number"
                value={sortOrder}
                onChange={(e) => setSortOrder(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-red-500"
              />
            </div>
            <div className="w-1/2 pt-5">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="rounded border-slate-800 text-red-600 focus:ring-red-500"
                />
                <span className="text-slate-300 font-medium">Status Banner Aktif</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl hover:bg-slate-700 cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white font-semibold rounded-xl flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>Simpan Banner</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
