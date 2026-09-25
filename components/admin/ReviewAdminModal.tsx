"use client";

import React, { useState, useEffect } from "react";
import { Star, X, Loader2, Camera, Video, MessageSquare } from "lucide-react";

interface ReviewAdminModalProps {
  isOpen: boolean;
  review: any | null;
  products: any[];
  mode?: "edit" | "reply";
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
}

export default function ReviewAdminModal({
  isOpen,
  review,
  products,
  mode = "edit",
  onClose,
  onSave,
}: ReviewAdminModalProps) {
  const [productId, setProductId] = useState<number>(products[0]?.id || 1);
  const [name, setName] = useState<string>("");
  const [rating, setRating] = useState<number>(5);
  const [reviewText, setReviewText] = useState<string>("");
  const [variantName, setVariantName] = useState<string>("");
  const [sellerReply, setSellerReply] = useState<string>("");
  const [isActive, setIsActive] = useState<boolean>(true);
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (review) {
      setProductId(review.productId || products[0]?.id || 1);
      setName(review.name || "");
      setRating(review.rating || 5);
      setReviewText(review.review || "");
      setVariantName(review.variantName || "");
      setSellerReply(review.sellerReply || "");
      setIsActive(review.isActive !== false);
      setMediaUrls(Array.isArray(review.mediaUrls) ? review.mediaUrls : []);
    } else {
      setProductId(products[0]?.id || 1);
      setName("");
      setRating(5);
      setReviewText("");
      setVariantName("");
      setSellerReply("");
      setIsActive(true);
      setMediaUrls([]);
    }
    setError("");
  }, [review, products, isOpen]);

  if (!isOpen) return null;

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    setError("");

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/admin/upload", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || "Gagal mengunggah file media");
        }

        const data = await res.json();
        if (data.url) {
          setMediaUrls((prev) => [...prev, data.url]);
        }
      }
    } catch (err: any) {
      setError(err.message || "Gagal mengunggah file.");
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveMedia = (url: string) => {
    setMediaUrls((prev) => prev.filter((m) => m !== url));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (mode === "reply") {
      if (!sellerReply.trim()) {
        setError("Silakan tulis balasan / tanggapan toko.");
        return;
      }
    } else {
      if (!name.trim() || !reviewText.trim()) {
        setError("Nama Pengulas dan Isi Ulasan wajib diisi.");
        return;
      }
    }

    setSubmitting(true);
    try {
      await onSave({
        id: review?.id,
        productId,
        name,
        rating,
        review: reviewText,
        variantName,
        sellerReply,
        isActive,
        mediaUrls,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || "Gagal menyimpan data penilaian produk.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[999] bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 font-sans animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl p-6 sm:p-8 text-gray-800 space-y-5 border border-gray-100 relative max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2">
            {mode === "reply" ? (
              <MessageSquare className="w-5 h-5 text-[#774EFC]" />
            ) : (
              <Star className="w-5 h-5 text-amber-500 fill-amber-400" />
            )}
            <h3 className="text-base sm:text-lg font-bold text-gray-900">
              {mode === "reply"
                ? "Beri Tanggapan Penjual"
                : review
                ? "Edit Penilaian Produk"
                : "Tambah Penilaian Produk Manual"}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold">
              {error}
            </div>
          )}

          {mode === "reply" ? (
            /* Mode Beri Tanggapan Penjual */
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-extrabold text-gray-900">{review?.name}</span>
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(review?.rating || 5)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-amber-400" />
                    ))}
                  </div>
                </div>
                <p className="text-xs text-gray-700 font-medium">"{review?.review}"</p>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-gray-800 mb-1.5 flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-[#774EFC]" />
                  <span>Tanggapan Resmi Penjual (Official Store TRI J):</span>
                </label>
                <textarea
                  rows={4}
                  placeholder="Contoh: Halo Kak, terima kasih telah berbelanja di Official Store TRI J. Semoga produk ini bermanfaat dan kami nantikan pesanan selanjutnya! 🙏"
                  value={sellerReply}
                  onChange={(e) => setSellerReply(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-2xl p-3 text-xs font-medium text-gray-900 focus:outline-none focus:border-[#774EFC]"
                />
              </div>
            </div>
          ) : (
            /* Mode Edit / Tambah Penilaian */
            <div className="space-y-4">
              {/* Product selector */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Pilih Produk:
                </label>
                <select
                  value={productId}
                  onChange={(e) => setProductId(Number(e.target.value))}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs font-bold text-gray-800 focus:bg-white focus:outline-none focus:border-[#774EFC] cursor-pointer"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      #{p.id} - {p.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Reviewer Name & Variant */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Nama Pengulas / Pembeli:
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Rika Kusmaningsih"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs font-semibold text-gray-900 focus:bg-white focus:outline-none focus:border-[#774EFC]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Variasi Dibeli (Opsional):
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: PUTIH (4 SUSUN)"
                    value={variantName}
                    onChange={(e) => setVariantName(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs font-semibold text-gray-900 focus:bg-white focus:outline-none focus:border-[#774EFC]"
                  />
                </div>
              </div>

              {/* Rating Selector */}
              <div className="bg-purple-50/60 p-3.5 rounded-2xl border border-purple-100 flex items-center justify-between">
                <span className="text-xs font-bold text-gray-800">Skor Rating Bintang:</span>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="p-1 cursor-pointer transition-transform hover:scale-125"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= rating
                            ? "text-amber-400 fill-amber-400"
                            : "text-gray-300"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Review Text */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Teks Ulasan Produk:
                </label>
                <textarea
                  rows={3}
                  placeholder="Tulis ulasan produk..."
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs font-medium text-gray-900 focus:bg-white focus:outline-none focus:border-[#774EFC]"
                />
              </div>

              {/* Seller Reply */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Tanggapan Penjual (Opsional):
                </label>
                <textarea
                  rows={2}
                  placeholder="Tanggapan toko..."
                  value={sellerReply}
                  onChange={(e) => setSellerReply(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs font-medium text-gray-900 focus:bg-white focus:outline-none focus:border-[#774EFC]"
                />
              </div>

              {/* Media Uploads */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Foto / Video Ulasan (Opsional):
                </label>
                <div className="flex flex-wrap items-center gap-2">
                  {mediaUrls.map((url, idx) => (
                    <div key={idx} className="relative w-14 h-14 rounded-xl border border-gray-200 overflow-hidden bg-black/90 group shadow-2xs">
                      {url.endsWith(".mp4") || url.endsWith(".webm") || url.includes("video") ? (
                        <video src={url} className="w-full h-full object-cover" />
                      ) : (
                        <img src={url} alt="Media" className="w-full h-full object-cover" />
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemoveMedia(url)}
                        className="absolute top-1 right-1 bg-black/70 hover:bg-rose-600 text-white rounded-full p-0.5 text-[9px] cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}

                  <label className="w-14 h-14 rounded-xl border-2 border-dashed border-purple-300 hover:border-[#774EFC] bg-purple-50/50 flex flex-col items-center justify-center cursor-pointer transition">
                    {uploading ? (
                      <Loader2 className="w-4 h-4 animate-spin text-[#774EFC]" />
                    ) : (
                      <Camera className="w-4 h-4 text-[#774EFC]" />
                    )}
                    <input
                      type="file"
                      accept="image/*,video/*"
                      multiple
                      className="hidden"
                      onChange={(e) => handleFileUpload(e.target.files)}
                    />
                  </label>
                </div>
              </div>

              {/* Status Toggle ON/OFF */}
              <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                <span className="text-xs font-bold text-gray-800">Status Tampil di Website:</span>
                <button
                  type="button"
                  onClick={() => setIsActive(!isActive)}
                  className={`px-4 py-1.5 rounded-xl text-xs font-extrabold transition cursor-pointer border ${
                    isActive
                      ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                      : "bg-rose-50 text-rose-700 border-rose-300"
                  }`}
                >
                  {isActive ? "🟢 Aktif (ON)" : "🔴 Nonaktif (OFF)"}
                </button>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl transition cursor-pointer"
            >
              Batal
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 bg-[#774EFC] hover:bg-[#6332f6] text-white font-extrabold text-xs rounded-xl shadow-md shadow-purple-500/20 flex items-center gap-2 transition cursor-pointer"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>Simpan Perubahan</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
