"use client";

import React, { useState, useEffect } from "react";
import { Star, ThumbsUp, CheckCircle2, MessageSquare, Loader2 } from "lucide-react";

interface ProductReviewsProps {
  product: any;
}

export default function ProductReviews({ product }: ProductReviewsProps) {
  const [reviewsList, setReviewsList] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [likedReviews, setLikedReviews] = useState<Record<number, boolean>>({});

  useEffect(() => {
    async function fetchReviews() {
      if (!product?.id) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const res = await fetch(`/api/public/reviews/${product.id}`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            setReviewsList(data);
          }
        }
      } catch (err) {
        console.warn("Failed to fetch product reviews:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchReviews();
  }, [product?.id]);

  const handleLike = (id: number) => {
    setLikedReviews((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredReviews = reviewsList.filter((rev) => {
    if (selectedFilter === "5") return Number(rev.rating) === 5;
    if (selectedFilter === "4") return Number(rev.rating) === 4;
    if (selectedFilter === "photo") return Boolean(rev.avatar);
    return true; // "all"
  });

  const averageRating =
    reviewsList.length > 0
      ? (
          reviewsList.reduce((acc, r) => acc + (Number(r.rating) || 5), 0) /
          reviewsList.length
        ).toFixed(1)
      : "5.0";

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-xs space-y-6 font-sans">
      {/* Header Title */}
      <div className="flex items-center justify-between border-b border-gray-100 pb-4">
        <div className="flex items-center gap-2">
          <Star className="w-5 h-5 text-amber-500 fill-amber-400" />
          <h2 className="text-lg sm:text-xl font-bold text-gray-900">
            Penilaian Produk ({reviewsList.length} Ulasan)
          </h2>
        </div>
        <span className="text-xs text-gray-500 font-semibold bg-gray-100 px-3 py-1 rounded-full">
          Terjual: <span className="font-extrabold text-gray-800">{product.sold || "0"}</span> produk
        </span>
      </div>

      {loading ? (
        <div className="py-8 flex flex-col items-center justify-center text-gray-400 text-xs gap-2">
          <Loader2 className="w-5 h-5 animate-spin text-[#774EFC]" />
          <span>Memuat penilaian produk...</span>
        </div>
      ) : reviewsList.length === 0 ? (
        /* Empty State */
        <div className="py-12 px-4 text-center space-y-3 bg-gray-50/70 rounded-2xl border border-dashed border-gray-200">
          <div className="w-14 h-14 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mx-auto border border-amber-200 shadow-2xs">
            <Star className="w-7 h-7 fill-amber-400 text-amber-400" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-extrabold text-gray-800">Belum Ada Penilaian Produk</h3>
            <p className="text-xs text-gray-500 max-w-md mx-auto leading-relaxed">
              Produk ini belum memiliki penilaian dari pembeli. Jadilah pelanggan pertama yang memberikan ulasan setelah melakukan pembelian!
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* Rating Summary & Filter Box */}
          <div className="bg-purple-50/50 border border-purple-100 rounded-2xl p-5 flex flex-col md:flex-row items-center gap-6">
            {/* Left Rating Overall Score */}
            <div className="flex flex-col items-center justify-center text-center pr-0 md:pr-6 border-b md:border-b-0 md:border-r border-purple-200/60 pb-4 md:pb-0 w-full md:w-auto shrink-0">
              <div className="text-4xl sm:text-5xl font-black text-[#774EFC] tracking-tight">
                {averageRating} <span className="text-base font-bold text-gray-500">/ 5</span>
              </div>
              <div className="flex items-center gap-1 my-1.5 text-amber-400">
                {[...Array(Math.round(Number(averageRating)))].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <span className="text-xs text-gray-500 font-medium">Berdasarkan {reviewsList.length} Penilaian</span>
            </div>

            {/* Right Filter Chips */}
            <div className="flex flex-wrap items-center gap-2.5 flex-1">
              <button
                type="button"
                onClick={() => setSelectedFilter("all")}
                className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                  selectedFilter === "all"
                    ? "bg-[#774EFC] text-white border-[#774EFC] shadow-sm"
                    : "bg-white text-gray-700 border-gray-200 hover:border-purple-300"
                }`}
              >
                Semua ({reviewsList.length})
              </button>

              <button
                type="button"
                onClick={() => setSelectedFilter("5")}
                className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer flex items-center gap-1 ${
                  selectedFilter === "5"
                    ? "bg-[#774EFC] text-white border-[#774EFC] shadow-sm"
                    : "bg-white text-gray-700 border-gray-200 hover:border-purple-300"
                }`}
              >
                <span>5 Bintang</span>
                <span className="text-[11px] opacity-80">({reviewsList.filter(r => Number(r.rating) === 5).length})</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedFilter("4")}
                className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer flex items-center gap-1 ${
                  selectedFilter === "4"
                    ? "bg-[#774EFC] text-white border-[#774EFC] shadow-sm"
                    : "bg-white text-gray-700 border-gray-200 hover:border-purple-300"
                }`}
              >
                <span>4 Bintang</span>
                <span className="text-[11px] opacity-80">({reviewsList.filter(r => Number(r.rating) === 4).length})</span>
              </button>
            </div>
          </div>

          {/* Review List */}
          <div className="divide-y divide-gray-100">
            {filteredReviews.map((review) => (
              <div key={review.id} className="py-5 first:pt-2 last:pb-0 space-y-3">
                {/* Reviewer Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {review.avatar ? (
                      <img
                        src={review.avatar}
                        alt={review.name}
                        className="w-10 h-10 rounded-full object-cover border border-purple-200 shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-purple-100 text-[#774EFC] font-extrabold flex items-center justify-center text-sm shrink-0 uppercase border border-purple-200">
                        {review.name?.[0] || "U"}
                      </div>
                    )}

                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-gray-900">{review.name}</span>
                        <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.2 rounded-full font-bold flex items-center gap-0.5">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Pembeli Terverifikasi</span>
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 text-amber-400">
                        {[...Array(Number(review.rating) || 5)].map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        ))}
                        <span className="text-[11px] font-semibold text-gray-400 ml-2 font-mono">
                          {new Date(review.createdAt || Date.now()).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Variant Tag */}
                {review.variantName && (
                  <div className="text-[11px] text-gray-500 bg-gray-50 px-3 py-1 rounded-lg border border-gray-200/70 inline-block font-medium">
                    Variasi Dibeli: <span className="font-bold text-gray-800">{review.variantName}</span>
                  </div>
                )}

                {/* Comment Text */}
                <p className="text-xs sm:text-sm text-gray-800 leading-relaxed font-normal">
                  {review.review || review.comment}
                </p>

                {/* Photo & Video Media Attachments */}
                {Array.isArray(review.mediaUrls) && review.mediaUrls.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    {review.mediaUrls.map((url: string, mIdx: number) => {
                      const isVid = url.endsWith(".mp4") || url.endsWith(".webm") || url.endsWith(".mov") || url.includes("video");
                      return (
                        <div key={mIdx} className="relative w-20 h-20 rounded-xl overflow-hidden border border-gray-200 bg-slate-950 shadow-2xs">
                          {isVid ? (
                            <video src={url} controls className="w-full h-full object-cover" />
                          ) : (
                            <img
                              src={url}
                              alt="Bukti foto ulasan"
                              onClick={() => window.open(url, "_blank")}
                              className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform"
                              title="Klik untuk memperbesar foto"
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Helpful Like Button */}
                <div className="flex items-center gap-4 pt-1 text-xs text-gray-400">
                  <button
                    type="button"
                    onClick={() => handleLike(review.id)}
                    className={`flex items-center gap-1.5 text-[11px] font-bold transition cursor-pointer ${
                      likedReviews[review.id]
                        ? "text-[#774EFC]"
                        : "hover:text-gray-700"
                    }`}
                  >
                    <ThumbsUp className={`w-3.5 h-3.5 ${likedReviews[review.id] ? "fill-[#774EFC]" : ""}`} />
                    <span>Membantu ({(review.likes || 0) + (likedReviews[review.id] ? 1 : 0)})</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
