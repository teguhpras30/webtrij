"use client";

import React, { useState } from "react";
import { Star, X, CheckCircle2, Loader2, ShoppingBag, Camera, Video, Plus, Image } from "lucide-react";

interface ReviewModalProps {
  order: any;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ReviewModal({ order, onClose, onSuccess }: ReviewModalProps) {
  const rawItems = order.items && order.items.length > 0 ? order.items : order.orderItems;
  const items = Array.isArray(rawItems) && rawItems.length > 0 ? rawItems : [
    {
      id: order.id || 1,
      productId: order.productId || 1,
      variantName: order.variantName || "Standard",
      product: {
        name: order.productName || order.orderTitle || `Produk Pesanan ${order.orderNumber || order.id || ''}`,
        thumbnail: order.thumbnail || order.image || "/assets/hero/rak-dapur-multiguna.jpg"
      }
    }
  ];

  const [ratings, setRatings] = useState<Record<number, number>>({});
  const [hoverRatings, setHoverRatings] = useState<Record<number, number>>({});
  const [comments, setComments] = useState<Record<number, string>>({});
  const [attachedMedia, setAttachedMedia] = useState<Record<number, { url: string; type: "image" | "video" }[]>>({});
  const [uploadingItem, setUploadingItem] = useState<Record<number, boolean>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  const handleStarClick = (itemId: number, star: number) => {
    setRatings((prev) => ({ ...prev, [itemId]: star }));
  };

  const handleStarHover = (itemId: number, star: number) => {
    setHoverRatings((prev) => ({ ...prev, [itemId]: star }));
  };

  const handleStarLeave = (itemId: number) => {
    setHoverRatings((prev) => ({ ...prev, [itemId]: 0 }));
  };

  const handleCommentChange = (itemId: number, text: string) => {
    setComments((prev) => ({ ...prev, [itemId]: text }));
  };

  const handleFileUpload = async (itemId: number, files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploadingItem((prev) => ({ ...prev, [itemId]: true }));
    setError("");

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/user/upload", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || "Gagal mengunggah file media.");
        }

        const data = await res.json();
        setAttachedMedia((prev) => {
          const existing = prev[itemId] || [];
          return {
            ...prev,
            [itemId]: [...existing, { url: data.url, type: data.type }],
          };
        });
      }
    } catch (err: any) {
      setError(err.message || "Gagal mengunggah foto/video ulasan.");
    } finally {
      setUploadingItem((prev) => ({ ...prev, [itemId]: false }));
    }
  };

  const handleRemoveMedia = (itemId: number, mediaUrl: string) => {
    setAttachedMedia((prev) => ({
      ...prev,
      [itemId]: (prev[itemId] || []).filter((m) => m.url !== mediaUrl),
    }));
  };

  const handleSubmitAllReviews = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (items.length === 0) return;

    setSubmitting(true);
    try {
      for (const item of items) {
        const prodId = item.productId || item.product?.id || 1;
        const rVal = ratings[item.id] || 5;
        const cVal = comments[item.id] || "Sangat memuaskan, produk sesuai pesanan!";
        const mediaUrls = (attachedMedia[item.id] || []).map((m) => m.url);

        if (!prodId) continue;

        const res = await fetch("/api/user/reviews", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            productId: prodId,
            orderId: order.id,
            rating: rVal,
            review: cVal,
            variantName: item.variantName || item.product?.name || "Standard",
            mediaUrls,
          }),
        });

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || "Gagal mengirimkan ulasan.");
        }
      }

      setSubmittedSuccess(true);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1800);
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan saat menyimpan penilaian.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[999] bg-black/65 backdrop-blur-xs flex items-center justify-center p-3 font-sans animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl p-6 sm:p-8 text-gray-800 space-y-5 border border-amber-100 relative max-h-[90vh] overflow-y-auto transform transition-all animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-gradient-to-tr from-amber-400 to-amber-500 text-white rounded-2xl flex items-center justify-center shadow-md shadow-amber-500/20">
              <Star className="w-5 h-5 fill-white text-white" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-gray-900 tracking-tight">
                Beri Penilaian & Ulasan Produk
              </h3>
              <p className="text-[11px] text-gray-500 font-medium">
                Pesanan <span className="font-bold font-mono text-purple-700">{order.orderNumber || order.id}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {submittedSuccess ? (
          <div className="py-10 text-center space-y-3 bg-emerald-50/70 rounded-2xl border border-emerald-200 animate-in zoom-in-95 duration-200">
            <div className="w-14 h-14 bg-emerald-600 text-white rounded-full flex items-center justify-center mx-auto shadow-md shadow-emerald-500/20">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h4 className="text-base font-extrabold text-gray-900">Terima Kasih Atas Ulasan Anda!</h4>
              <p className="text-xs text-gray-600">Penilaian produk & lampiran foto/video berhasil disimpan.</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmitAllReviews} className="space-y-5">
            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold">
                {error}
              </div>
            )}

            <p className="text-xs text-gray-500">
              Silakan berikan rating bintang, ulasan, serta lampiran foto/video untuk pesanan <span className="font-extrabold font-mono text-gray-800">{order.orderNumber}</span>:
            </p>

            <div className="space-y-4 divide-y divide-gray-100">
              {items.map((item: any) => {
                const currentRating = ratings[item.id] || 5;
                const hoverVal = hoverRatings[item.id] || 0;
                const activeVal = hoverVal > 0 ? hoverVal : currentRating;

                return (
                  <div key={item.id} className="pt-4 first:pt-0 space-y-3">
                    {/* Item header */}
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center shrink-0 overflow-hidden">
                        {item.product?.thumbnail ? (
                          <img src={item.product.thumbnail} alt={item.product?.name} className="w-full h-full object-cover" />
                        ) : (
                          <ShoppingBag className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1 text-xs">
                        <div className="font-extrabold text-gray-900 truncate">
                          {item.product?.name || item.variantName || "Produk TRI J"}
                        </div>
                        {item.variantName && (
                          <div className="text-[11px] text-gray-500 font-medium">
                            Variasi: <span className="font-bold text-gray-700">{item.variantName}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Star Rating selector */}
                    <div className="bg-amber-50/60 p-3.5 rounded-2xl border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-extrabold text-amber-900">Rating Kualitas:</span>
                        <span className="text-[11px] font-black text-amber-700 bg-white px-2 py-0.5 rounded-md border border-amber-200 shadow-2xs">
                          {activeVal === 5 ? "⭐⭐⭐⭐⭐ Sangat Memuaskan!" : activeVal === 4 ? "⭐⭐⭐⭐ Bagus & Sesuai" : activeVal === 3 ? "⭐⭐⭐ Cukup Baik" : activeVal === 2 ? "⭐⭐ Kurang Puas" : "⭐ Sangat Kecewa"}
                        </span>
                      </div>

                      <div className="flex items-center gap-1" onMouseLeave={() => handleStarLeave(item.id)}>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => handleStarClick(item.id, star)}
                            onMouseEnter={() => handleStarHover(item.id, star)}
                            className="p-1 cursor-pointer transition-transform hover:scale-125 transform active:scale-90"
                          >
                            <Star
                              className={`w-7 h-7 drop-shadow-xs transition-colors ${
                                star <= activeVal
                                  ? "text-amber-400 fill-amber-400"
                                  : "text-gray-300 fill-gray-100"
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Textarea review */}
                    <div>
                      <textarea
                        rows={3}
                        placeholder="Tulis ulasan Anda mengenai kualitas barang, kepresisian, dan kecepatan pengiriman..."
                        value={comments[item.id] || ""}
                        onChange={(e) => handleCommentChange(item.id, e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-3 text-xs font-medium text-gray-900 focus:bg-white focus:outline-none focus:border-[#774EFC]"
                      />
                    </div>

                    {/* Photo & Video Upload Attachment Area */}
                    <div className="space-y-2 pt-1">
                      <label className="block text-[11px] font-bold text-gray-700 flex items-center justify-between">
                        <span>Upload Foto & Video Ulasan (Opsional):</span>
                        <span className="text-[10px] text-gray-400 font-normal">Maks 50MB (Video) / 10MB (Foto)</span>
                      </label>

                      <div className="flex flex-wrap items-center gap-2.5">
                        {/* Media Previews */}
                        {(attachedMedia[item.id] || []).map((media, idx) => (
                          <div key={idx} className="relative w-16 h-16 rounded-xl border border-gray-200 overflow-hidden bg-black/90 group shadow-2xs">
                            {media.type === "video" ? (
                              <video src={media.url} className="w-full h-full object-cover" />
                            ) : (
                              <img src={media.url} alt="Review attachment" className="w-full h-full object-cover" />
                            )}
                            <button
                              type="button"
                              onClick={() => handleRemoveMedia(item.id, media.url)}
                              className="absolute top-1 right-1 bg-black/70 hover:bg-rose-600 text-white rounded-full p-0.5 text-[10px] cursor-pointer transition shadow-xs"
                              title="Hapus media ini"
                            >
                              <X className="w-3 h-3" />
                            </button>
                            {media.type === "video" && (
                              <div className="absolute bottom-1 left-1 bg-black/70 text-white text-[8px] px-1 py-0.2 rounded font-extrabold flex items-center gap-0.5">
                                <Video className="w-2.5 h-2.5 text-amber-400" />
                                <span>VID</span>
                              </div>
                            )}
                          </div>
                        ))}

                        {/* File Upload Button */}
                        <label className={`w-16 h-16 rounded-xl border-2 border-dashed border-purple-300 hover:border-[#774EFC] bg-purple-50/50 hover:bg-purple-50 flex flex-col items-center justify-center text-center cursor-pointer transition ${uploadingItem[item.id] ? 'opacity-50 pointer-events-none' : ''}`}>
                          {uploadingItem[item.id] ? (
                            <Loader2 className="w-5 h-5 animate-spin text-[#774EFC]" />
                          ) : (
                            <>
                              <div className="flex items-center gap-0.5 text-[#774EFC]">
                                <Camera className="w-4 h-4" />
                                <Video className="w-3.5 h-3.5" />
                              </div>
                              <span className="text-[9px] font-extrabold text-[#774EFC] mt-0.5">+ Upload</span>
                            </>
                          )}
                          <input
                            type="file"
                            accept="image/*,video/*"
                            multiple
                            className="hidden"
                            onChange={(e) => handleFileUpload(item.id, e.target.files)}
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl transition cursor-pointer"
              >
                Nanti Saja
              </button>

              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 bg-[#774EFC] hover:bg-[#6332f6] text-white font-extrabold text-xs rounded-xl shadow-md shadow-purple-500/20 flex items-center gap-2 transition cursor-pointer"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Mengirim...</span>
                  </>
                ) : (
                  <>
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span>Kirim Penilaian</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
