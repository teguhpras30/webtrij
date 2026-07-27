"use client";

import { useState, useEffect, useRef } from "react";
import { X, Loader2, AlertCircle, Upload, Trash2, Image as ImageIcon, Plus, RefreshCw, Info } from "lucide-react";

interface ProductModalProps {
  categories: any[];
  initialData?: any;
  onClose: () => void;
  onSuccess: (saved: any) => void;
}

export default function ProductModal({ categories, initialData, onClose, onSuccess }: ProductModalProps) {
  const [name, setName] = useState(initialData?.name || "");
  const [categoryId, setCategoryId] = useState<string | number>(
    initialData?.categoryId || initialData?.category?.id || (categories.length > 0 ? categories[0].id : "")
  );
  const [description, setDescription] = useState(initialData?.description || "");
  const [sold, setSold] = useState(initialData?.sold || "0 Terjual");

  // Image upload states
  const [thumbnail, setThumbnail] = useState<string>(initialData?.thumbnail || "");
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);

  const [galleryImages, setGalleryImages] = useState<string[]>(
    initialData?.images
      ? initialData.images.map((img: any) => (typeof img === "string" ? img : img.image))
      : []
  );
  const [uploadingGallery, setUploadingGallery] = useState(false);

  const [isPopular, setIsPopular] = useState(initialData?.isPopular || false);
  const [isDeal, setIsDeal] = useState(initialData?.isDeal || false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  // Synchronize categoryId if categories finish loading after modal opens
  useEffect(() => {
    if (!categoryId && categories.length > 0) {
      setCategoryId(initialData?.categoryId || initialData?.category?.id || categories[0].id);
    }
  }, [categories, categoryId, initialData]);

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
      throw new Error(data.error || "Gagal mengunggah file gambar.");
    }
    return data.url;
  };

  // Thumbnail upload handler with 1MB check
  const handleThumbnailChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1 * 1024 * 1024) {
      setError(`Ukuran file '${file.name}' melebihi 1MB (Ukuran: ${(file.size / (1024 * 1024)).toFixed(2)}MB). Maksimal ukuran gambar adalah 1MB.`);
      if (thumbnailInputRef.current) thumbnailInputRef.current.value = "";
      return;
    }

    setUploadingThumbnail(true);
    setError("");
    try {
      const url = await uploadFile(file);
      setThumbnail(url);
    } catch (err: any) {
      setError(err.message || "Gagal mengunggah thumbnail.");
    } finally {
      setUploadingThumbnail(false);
      if (thumbnailInputRef.current) thumbnailInputRef.current.value = "";
    }
  };

  // Gallery images upload handler with 1MB check
  const handleGalleryChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const oversizedFiles = files.filter((f) => f.size > 1 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      setError(
        `Beberapa file melebihi batas 1MB (${oversizedFiles.map((f) => f.name).join(", ")}). Harap upload gambar berukuran maksimal 1MB.`
      );
      if (galleryInputRef.current) galleryInputRef.current.value = "";
      return;
    }

    setUploadingGallery(true);
    setError("");

    try {
      const uploadedUrls: string[] = [];
      for (const file of files) {
        const url = await uploadFile(file);
        uploadedUrls.push(url);
      }
      setGalleryImages((prev) => [...prev, ...uploadedUrls]);
    } catch (err: any) {
      setError(err.message || "Gagal mengunggah beberapa gambar galeri.");
    } finally {
      setUploadingGallery(false);
      if (galleryInputRef.current) galleryInputRef.current.value = "";
    }
  };

  // Remove gallery image
  const removeGalleryImage = (indexToRemove: number) => {
    setGalleryImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!categoryId) {
      setError("Silakan pilih kategori terlebih dahulu.");
      setLoading(false);
      return;
    }

    if (!thumbnail) {
      setError("Gambar Utama (Thumbnail) wajib diunggah.");
      setLoading(false);
      return;
    }

    try {
      const url = initialData ? `/api/admin/products/${initialData.id}` : "/api/admin/products";
      const method = initialData ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          categoryId: Number(categoryId),
          description,
          sold,
          thumbnail,
          images: galleryImages,
          isPopular,
          isDeal,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menyimpan produk.");

      onSuccess(data);
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan saat menyimpan produk.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl p-6 relative shadow-2xl my-8">
        <button onClick={onClose} className="absolute top-5 right-5 text-slate-400 hover:text-white cursor-pointer transition">
          <X className="w-5 h-5" />
        </button>

        <div className="mb-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-red-500" />
            <span>{initialData ? "Edit Produk" : "Input Produk Baru"}</span>
          </h2>
          <div className="mt-2 text-xs text-amber-300 bg-amber-500/15 border border-amber-500/30 px-3.5 py-2.5 rounded-xl flex items-center gap-2 font-semibold shadow-xs">
            <Info className="w-4 h-4 shrink-0 text-amber-400" />
            <span>Ketentuan Gambar Produk: <strong>Rasio 1:1 (Persegi)</strong> • Ukuran File <strong>Maksimal 1MB</strong></span>
          </div>
        </div>

        {error && (
          <div className="mb-4 text-xs text-red-400 bg-red-500/10 p-3 rounded-xl border border-red-500/20 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {categories.length === 0 && (
          <div className="mb-4 text-xs text-amber-400 bg-amber-500/10 p-3 rounded-xl border border-amber-500/20 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
            <span>Belum ada data kategori di database. Silakan buat kategori terlebih dahulu pada tab "Input Kategori".</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 mb-1 font-medium">Nama Produk *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: Lemari Lipat Bow-Bow 4 Susun"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-red-500"
              />
            </div>
            <div>
              <label className="block text-slate-300 mb-1 font-medium">Kategori *</label>
              <select
                required
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-red-500 font-medium cursor-pointer"
              >
                <option value="" disabled>
                  -- Pilih Kategori Produk --
                </option>
                {categories.length === 0 ? (
                  <option value="" disabled>
                    (Belum ada kategori)
                  </option>
                ) : (
                  categories.map((c: any) => (
                    <option key={c.id} value={c.id} className="bg-slate-900 text-white">
                      📁 {c.name}
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-300 mb-1 font-medium">Deskripsi *</label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tuliskan deskripsi lengkap produk..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-red-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 mb-1 font-medium">Jumlah Terjual</label>
              <input
                type="text"
                value={sold}
                onChange={(e) => setSold(e.target.value)}
                placeholder="Contoh: 10rb+ Terjual"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-red-500"
              />
            </div>

            {/* Gambar Utama (Thumbnail) Upload Zone */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-slate-300 font-medium">Gambar Utama (Thumbnail) *</label>
                <span className="text-[10px] text-amber-400 font-semibold bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                  Rasio 1:1 (Max 1MB)
                </span>
              </div>
              <input
                ref={thumbnailInputRef}
                type="file"
                accept="image/*"
                onChange={handleThumbnailChange}
                className="hidden"
                id="thumbnail-upload-file"
              />

              {thumbnail ? (
                <div className="relative group w-full h-36 bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden flex items-center justify-center p-2">
                  <img
                    src={thumbnail}
                    alt="Thumbnail Preview"
                    className="max-h-full max-w-full object-contain rounded-xl aspect-square"
                  />
                  <div className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-xs">
                    <button
                      type="button"
                      onClick={() => thumbnailInputRef.current?.click()}
                      disabled={uploadingThumbnail}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-[11px] font-semibold flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Ganti Gambar</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setThumbnail("")}
                      className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-lg text-[11px] font-semibold flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Hapus</span>
                    </button>
                  </div>
                  {uploadingThumbnail && (
                    <div className="absolute inset-0 bg-slate-950/80 flex items-center justify-center gap-2 text-white">
                      <Loader2 className="w-5 h-5 animate-spin text-red-500" />
                      <span className="text-xs">Mengunggah...</span>
                    </div>
                  )}
                </div>
              ) : (
                <label
                  htmlFor="thumbnail-upload-file"
                  className={`w-full h-36 border-2 border-dashed border-slate-700 hover:border-red-500/60 bg-slate-950/60 hover:bg-slate-900/80 rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer transition p-4 text-center ${
                    uploadingThumbnail ? "opacity-50 pointer-events-none" : ""
                  }`}
                >
                  {uploadingThumbnail ? (
                    <Loader2 className="w-6 h-6 animate-spin text-red-500" />
                  ) : (
                    <Upload className="w-6 h-6 text-slate-400 group-hover:text-red-400" />
                  )}
                  <div>
                    <span className="font-semibold text-slate-200 block text-xs">
                      {uploadingThumbnail ? "Mengunggah gambar..." : "Klik untuk Upload Gambar Utama"}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">Format JPG, PNG, WEBP — Rasio 1:1 (Max 1MB)</span>
                  </div>
                </label>
              )}
            </div>
          </div>

          {/* Galeri Gambar Upload Zone & Preview Grid */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <label className="block text-slate-300 font-medium">
                  Galeri Gambar Produk ({galleryImages.length} Foto)
                </label>
                <span className="text-[10px] text-amber-400 font-semibold bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                  Rasio 1:1 (Max 1MB)
                </span>
              </div>
              <button
                type="button"
                onClick={() => galleryInputRef.current?.click()}
                disabled={uploadingGallery}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-[11px] font-medium flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
              >
                {uploadingGallery ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-red-400" />
                ) : (
                  <Plus className="w-3.5 h-3.5 text-red-400" />
                )}
                <span>+ Tambah Gambar Galeri</span>
              </button>
            </div>

            <input
              ref={galleryInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleGalleryChange}
              className="hidden"
            />

            {galleryImages.length > 0 ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 bg-slate-950 p-3 rounded-2xl border border-slate-800 max-h-48 overflow-y-auto">
                {galleryImages.map((imgUrl, index) => (
                  <div
                    key={index}
                    className="relative group aspect-square bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex items-center justify-center p-1"
                  >
                    <img
                      src={imgUrl}
                      alt={`Galeri ${index + 1}`}
                      className="max-h-full max-w-full object-cover rounded-lg aspect-square"
                    />
                    <div className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-xs">
                      <button
                        type="button"
                        onClick={() => removeGalleryImage(index)}
                        className="p-1.5 bg-red-600 hover:bg-red-500 text-white rounded-lg transition cursor-pointer"
                        title="Hapus gambar galeri"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <span className="absolute bottom-1 left-1 bg-slate-950/80 text-[9px] text-slate-400 px-1.5 py-0.5 rounded font-mono">
                      #{index + 1}
                    </span>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() => galleryInputRef.current?.click()}
                  disabled={uploadingGallery}
                  className="aspect-square border-2 border-dashed border-slate-800 hover:border-red-500/50 bg-slate-900/40 hover:bg-slate-900 rounded-xl flex flex-col items-center justify-center gap-1 text-slate-500 hover:text-slate-300 transition cursor-pointer"
                >
                  <Plus className="w-5 h-5 text-red-500/70" />
                  <span className="text-[10px] font-medium">Upload</span>
                </button>
              </div>
            ) : (
              <div
                onClick={() => galleryInputRef.current?.click()}
                className="w-full py-6 border-2 border-dashed border-slate-800 hover:border-red-500/50 bg-slate-950/40 hover:bg-slate-950/80 rounded-2xl flex flex-col items-center justify-center gap-1.5 cursor-pointer transition text-center"
              >
                {uploadingGallery ? (
                  <Loader2 className="w-5 h-5 animate-spin text-red-500" />
                ) : (
                  <Upload className="w-5 h-5 text-slate-500" />
                )}
                <span className="text-xs text-slate-400 font-medium">
                  {uploadingGallery ? "Mengunggah foto galeri..." : "Belum ada foto galeri. Klik untuk upload foto galeri tambahan (Rasio 1:1, Max 1MB)"}
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-6 pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isPopular}
                onChange={(e) => setIsPopular(e.target.checked)}
                className="rounded border-slate-800 text-red-600 focus:ring-red-500"
              />
              <span className="text-slate-300 font-medium">Tampilkan di Produk Populer</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isDeal}
                onChange={(e) => setIsDeal(e.target.checked)}
                className="rounded border-slate-800 text-red-600 focus:ring-red-500"
              />
              <span className="text-slate-300 font-medium">Tampilkan di Hot Deal</span>
            </label>
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
              disabled={loading || uploadingThumbnail || uploadingGallery || categories.length === 0}
              className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white font-semibold rounded-xl flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>Simpan Produk</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
