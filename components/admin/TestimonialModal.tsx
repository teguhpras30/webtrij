"use client";

import { useState, useRef } from "react";
import { X, Loader2, Upload, Trash2, User } from "lucide-react";

interface TestimonialModalProps {
  initialData?: any;
  onClose: () => void;
  onSuccess: (saved: any) => void;
}

export default function TestimonialModal({ initialData, onClose, onSuccess }: TestimonialModalProps) {
  const [type, setType] = useState(initialData?.type || "MARKETPLACE");
  const [name, setName] = useState(initialData?.name || "");
  const [role, setRole] = useState(initialData?.role || "");
  const [review, setReview] = useState(initialData?.review || "");
  const [avatar, setAvatar] = useState(initialData?.avatar || "");
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const avatarInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarUpload = async (file: File) => {
    if (!file) return;

    if (file.size > 1024 * 1024) {
      setError("Ukuran foto avatar maksimal 1MB.");
      return;
    }

    setUploadingAvatar(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal mengunggah foto avatar.");

      setAvatar(data.url);
    } catch (err: any) {
      setError(err.message || "Gagal mengunggah foto avatar.");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const url = initialData ? `/api/admin/testimonials/${initialData.id}` : "/api/admin/testimonials";
      const method = initialData ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, name, role, review, avatar }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menyimpan testimoni.");

      onSuccess(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg p-6 relative shadow-2xl">
        <button onClick={onClose} className="absolute top-5 right-5 text-slate-400 hover:text-white cursor-pointer">
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-lg font-bold text-white mb-4">
          {initialData ? "Edit Testimoni" : "Input Testimoni Baru"}
        </h2>

        {error && <div className="mb-4 text-xs text-red-400 bg-red-500/10 p-3 rounded-xl border border-red-500/20">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 mb-1 font-medium">Tipe Testimoni *</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-red-500"
            >
              <option value="MARKETPLACE">Marketplace (Ulasan Pembeli Online)</option>
              <option value="MEMBER">Member (Mitra / Pelanggan Setia)</option>
            </select>
          </div>

          {/* Avatar Upload */}
          <div>
            <label className="block text-slate-300 mb-1 font-medium">Foto Avatar (Maksimal 1MB)</label>
            <input
              type="file"
              ref={avatarInputRef}
              accept="image/png, image/jpeg, image/webp, image/gif"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleAvatarUpload(file);
              }}
            />

            {avatar ? (
              <div className="flex items-center gap-3 p-3 bg-slate-950 border border-slate-800 rounded-xl">
                <img
                  src={avatar}
                  alt="Avatar Preview"
                  className="w-12 h-12 rounded-full object-cover border border-slate-700 shrink-0"
                />
                <div className="flex-1 overflow-hidden">
                  <div className="text-[11px] text-slate-300 truncate">{avatar}</div>
                  <div className="text-[10px] text-emerald-400">Foto avatar berhasil diunggah</div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => avatarInputRef.current?.click()}
                    disabled={uploadingAvatar}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[11px] transition-colors cursor-pointer"
                  >
                    Ganti
                  </button>
                  <button
                    type="button"
                    onClick={() => setAvatar("")}
                    className="p-1.5 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => avatarInputRef.current?.click()}
                className="border-2 border-dashed border-slate-800 hover:border-red-500/50 bg-slate-950 rounded-xl p-4 text-center cursor-pointer transition-colors"
              >
                {uploadingAvatar ? (
                  <div className="flex items-center justify-center gap-2 text-slate-400 py-2">
                    <Loader2 className="w-5 h-5 animate-spin text-red-500" />
                    <span>Mengunggah foto avatar...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-3 py-1 text-slate-400">
                    <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center shrink-0">
                      <User className="w-5 h-5 text-slate-400" />
                    </div>
                    <div className="text-left">
                      <div className="text-slate-200 font-semibold flex items-center gap-1.5">
                        <Upload className="w-3.5 h-3.5 text-red-500" /> Unggah Foto Avatar
                      </div>
                      <div className="text-[10px] text-slate-500">Klik untuk memilih gambar (Maks. 1MB)</div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 mb-1 font-medium">Nama Pelanggan *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Budi Santoso"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-red-500"
              />
            </div>
            <div>
              <label className="block text-slate-300 mb-1 font-medium">Jabatan / Role (Opsional)</label>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="Pemilik Toko Perabot"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-red-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 mb-1 font-medium">Isi Ulasan (Review) *</label>
            <textarea
              required
              rows={3}
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder="Tulis ulasan pembeli di sini..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-red-500"
            />
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
              disabled={loading || uploadingAvatar}
              className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white font-semibold rounded-xl flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>Simpan Testimoni</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
