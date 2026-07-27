"use client";

import { useState, useRef } from "react";
import { X, Loader2, Upload, Trash2, Image as ImageIcon, RefreshCw, AlertCircle, Info } from "lucide-react";

interface SlideModalProps {
  initialData?: any;
  onClose: () => void;
  onSuccess: (saved: any) => void;
}

export default function SlideModal({ initialData, onClose, onSuccess }: SlideModalProps) {
  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(initialData?.description || "");
  
  // Image states
  const [desktopImage, setDesktopImage] = useState(initialData?.desktopImage || "");
  const [uploadingDesktop, setUploadingDesktop] = useState(false);

  const [mobileImage, setMobileImage] = useState(initialData?.mobileImage || "");
  const [uploadingMobile, setUploadingMobile] = useState(false);

  const [sortOrder, setSortOrder] = useState(initialData?.sortOrder || 0);
  const [isActive, setIsActive] = useState(initialData?.isActive ?? true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const desktopInputRef = useRef<HTMLInputElement>(null);
  const mobileInputRef = useRef<HTMLInputElement>(null);

  // Upload file helper
  const uploadFile = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/admin/upload", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    if (!res.ok) {
      if (res.status === 401) {
        throw new Error("Sesi login Anda telah berakhir (401 Unauthorized). Silakan login ulang via /secret-login.");
      }
      throw new Error(data.error || "Gagal mengunggah file gambar.");
    }

    if (!data.url) {
      throw new Error("Tidak mendapatkan URL hasil upload gambar.");
    }

    return data.url;
  };

  // Strict Image Validator helper
  const validateHeroImage = (
    file: File,
    targetWidth: number = 1920,
    targetHeight: number = 1080,
    maxSizeBytes: number = 1 * 1024 * 1024
  ): Promise<string | null> => {
    return new Promise((resolve) => {
      // 1. File size check (Max 1MB)
      if (file.size > maxSizeBytes) {
        const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
        resolve(
          `Ukuran file '${file.name}' (${sizeMB}MB) melebihi batas 1MB. Gambar tidak memenuhi syarat dan tidak dapat diupdate.`
        );
        return;
      }

      // 2. Resolution check (1920 x 1080 px)
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);

      img.onload = () => {
        URL.revokeObjectURL(objectUrl);
        // Allow 1920x1080 or 1080x1920 (for mobile vertical banner)
        const isMatch =
          (img.width === targetWidth && img.height === targetHeight) ||
          (img.width === targetHeight && img.height === targetWidth);

        if (!isMatch) {
          resolve(
            `Resolusi file '${file.name}' (${img.width}x${img.height} px) tidak sesuai. Syarat wajib: ${targetWidth} x ${targetHeight} px (Max 1MB).`
          );
        } else {
          resolve(null);
        }
      };

      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        resolve("Gagal membaca dimensi file gambar.");
      };

      img.src = objectUrl;
    });
  };

  const handleDesktopImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError("");
    const validationError = await validateHeroImage(file, 1920, 1080, 1 * 1024 * 1024);
    if (validationError) {
      setError(validationError);
      if (desktopInputRef.current) desktopInputRef.current.value = "";
      return;
    }

    setUploadingDesktop(true);
    try {
      const url = await uploadFile(file);
      setDesktopImage(url);
    } catch (err: any) {
      setError(err.message || "Gagal mengunggah gambar desktop.");
    } finally {
      setUploadingDesktop(false);
      if (desktopInputRef.current) desktopInputRef.current.value = "";
    }
  };

  const handleMobileImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError("");
    const validationError = await validateHeroImage(file, 1920, 1080, 1 * 1024 * 1024);
    if (validationError) {
      setError(validationError);
      if (mobileInputRef.current) mobileInputRef.current.value = "";
      return;
    }

    setUploadingMobile(true);
    try {
      const url = await uploadFile(file);
      setMobileImage(url);
    } catch (err: any) {
      setError(err.message || "Gagal mengunggah gambar mobile.");
    } finally {
      setUploadingMobile(false);
      if (mobileInputRef.current) mobileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!desktopImage) {
      setError("Gambar Desktop wajib diunggah.");
      setLoading(false);
      return;
    }

    if (!mobileImage) {
      setError("Gambar Mobile wajib diunggah.");
      setLoading(false);
      return;
    }

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
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg p-6 relative shadow-2xl my-8">
        <button onClick={onClose} className="absolute top-5 right-5 text-slate-400 hover:text-white cursor-pointer transition">
          <X className="w-5 h-5" />
        </button>

        <div className="mb-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-red-500" />
            <span>{initialData ? "Edit Hero Banner" : "Input Hero Banner Baru"}</span>
          </h2>
          <div className="mt-2 text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-2 rounded-xl flex items-center gap-2 font-medium">
            <Info className="w-4 h-4 shrink-0 text-amber-400" />
            <span>Syarat Wajib Gambar: <strong>1920 x 1080 px</strong> • Maksimal <strong>1MB</strong></span>
          </div>
        </div>

        {error && (
          <div className="mb-4 text-xs text-red-400 bg-red-500/10 p-3 rounded-xl border border-red-500/20 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

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

          {/* Upload Gambar Desktop */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-slate-300 font-medium">Gambar Desktop (Layar Lebar) *</label>
              <span className="text-[10px] text-amber-400 font-semibold bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                1920 x 1080 px (Max 1MB)
              </span>
            </div>
            <input
              ref={desktopInputRef}
              type="file"
              accept="image/*"
              onChange={handleDesktopImageChange}
              className="hidden"
            />

            {desktopImage ? (
              <div className="relative group w-full h-32 bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden flex items-center justify-center p-2">
                <img
                  src={desktopImage}
                  alt="Desktop Banner Preview"
                  className="max-h-full max-w-full object-contain rounded-xl"
                />
                <div className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-xs">
                  <button
                    type="button"
                    onClick={() => desktopInputRef.current?.click()}
                    disabled={uploadingDesktop}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-[11px] font-semibold flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Ganti Gambar</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDesktopImage("")}
                    className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-lg text-[11px] font-semibold flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Hapus</span>
                  </button>
                </div>
                {uploadingDesktop && (
                  <div className="absolute inset-0 bg-slate-950/80 flex items-center justify-center gap-2 text-white">
                    <Loader2 className="w-5 h-5 animate-spin text-red-500" />
                    <span className="text-xs">Mengunggah...</span>
                  </div>
                )}
              </div>
            ) : (
              <label
                onClick={() => desktopInputRef.current?.click()}
                className={`w-full h-28 border-2 border-dashed border-slate-700 hover:border-red-500/60 bg-slate-950/60 hover:bg-slate-900/80 rounded-2xl flex flex-col items-center justify-center gap-1.5 cursor-pointer transition p-4 text-center ${
                  uploadingDesktop ? "opacity-50 pointer-events-none" : ""
                }`}
              >
                {uploadingDesktop ? (
                  <Loader2 className="w-5 h-5 animate-spin text-red-500" />
                ) : (
                  <Upload className="w-5 h-5 text-slate-400 group-hover:text-red-400" />
                )}
                <div>
                  <span className="font-semibold text-slate-200 block text-xs">
                    {uploadingDesktop ? "Mengunggah gambar..." : "Klik untuk Upload Gambar Desktop"}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">Syarat Wajib: 1920 x 1080 px — Maksimal 1MB</span>
                </div>
              </label>
            )}
          </div>

          {/* Upload Gambar Mobile */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-slate-300 font-medium">Gambar Mobile (Layar HP) *</label>
              <span className="text-[10px] text-amber-400 font-semibold bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                1920 x 1080 px (Max 1MB)
              </span>
            </div>
            <input
              ref={mobileInputRef}
              type="file"
              accept="image/*"
              onChange={handleMobileImageChange}
              className="hidden"
            />

            {mobileImage ? (
              <div className="relative group w-full h-32 bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden flex items-center justify-center p-2">
                <img
                  src={mobileImage}
                  alt="Mobile Banner Preview"
                  className="max-h-full max-w-full object-contain rounded-xl"
                />
                <div className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-xs">
                  <button
                    type="button"
                    onClick={() => mobileInputRef.current?.click()}
                    disabled={uploadingMobile}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-[11px] font-semibold flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Ganti Gambar</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setMobileImage("")}
                    className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-lg text-[11px] font-semibold flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Hapus</span>
                  </button>
                </div>
                {uploadingMobile && (
                  <div className="absolute inset-0 bg-slate-950/80 flex items-center justify-center gap-2 text-white">
                    <Loader2 className="w-5 h-5 animate-spin text-red-500" />
                    <span className="text-xs">Mengunggah...</span>
                  </div>
                )}
              </div>
            ) : (
              <label
                onClick={() => mobileInputRef.current?.click()}
                className={`w-full h-28 border-2 border-dashed border-slate-700 hover:border-red-500/60 bg-slate-950/60 hover:bg-slate-900/80 rounded-2xl flex flex-col items-center justify-center gap-1.5 cursor-pointer transition p-4 text-center ${
                  uploadingMobile ? "opacity-50 pointer-events-none" : ""
                }`}
              >
                {uploadingMobile ? (
                  <Loader2 className="w-5 h-5 animate-spin text-red-500" />
                ) : (
                  <Upload className="w-5 h-5 text-slate-400 group-hover:text-red-400" />
                )}
                <div>
                  <span className="font-semibold text-slate-200 block text-xs">
                    {uploadingMobile ? "Mengunggah gambar..." : "Klik untuk Upload Gambar Mobile"}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">Syarat Wajib: 1920 x 1080 px — Maksimal 1MB</span>
                </div>
              </label>
            )}
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
              disabled={loading || uploadingDesktop || uploadingMobile}
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
