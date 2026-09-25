"use client";

import React, { useState } from "react";
import {
  Star,
  Search,
  Plus,
  Edit3,
  Trash2,
  MessageSquare,
  Eye,
  EyeOff,
  CheckCircle2,
  Loader2,
  Video,
  ShoppingBag,
  Filter,
} from "lucide-react";

interface ReviewsTabProps {
  reviews: any[];
  products: any[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onRefresh: () => void;
  onEditReview: (review: any) => void;
  onAddReview: () => void;
  onDeleteReview: (id: number) => void;
  onToggleActive: (id: number, currentStatus: boolean) => void;
  onReplyReview: (review: any) => void;
}

export default function ReviewsTab({
  reviews,
  products,
  searchQuery,
  setSearchQuery,
  onRefresh,
  onEditReview,
  onAddReview,
  onDeleteReview,
  onToggleActive,
  onReplyReview,
}: ReviewsTabProps) {
  const [filterRating, setFilterRating] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const filteredReviews = reviews.filter((item) => {
    const matchesSearch =
      (item.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.review || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.product?.name || "").toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRating =
      filterRating === "all" || Number(item.rating) === Number(filterRating);

    const matchesStatus =
      filterStatus === "all"
        ? true
        : filterStatus === "active"
        ? item.isActive !== false
        : item.isActive === false;

    return matchesSearch && matchesRating && matchesStatus;
  });

  const totalReviews = reviews.length;
  const activeCount = reviews.filter((r) => r.isActive !== false).length;
  const inactiveCount = reviews.filter((r) => r.isActive === false).length;
  const avgRating =
    totalReviews > 0
      ? (reviews.reduce((acc, r) => acc + (Number(r.rating) || 5), 0) / totalReviews).toFixed(1)
      : "5.0";

  return (
    <div className="space-y-6 font-sans">
      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-500">Total Ulasan</p>
            <p className="text-2xl font-black text-gray-900 mt-1">{totalReviews}</p>
          </div>
          <div className="w-12 h-12 bg-purple-50 text-[#774EFC] rounded-2xl flex items-center justify-center border border-purple-100">
            <MessageSquare className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-500">Ulasan Aktif (ON)</p>
            <p className="text-2xl font-black text-emerald-600 mt-1">{activeCount}</p>
          </div>
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center border border-emerald-100">
            <Eye className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-500">Nonaktif (OFF)</p>
            <p className="text-2xl font-black text-rose-600 mt-1">{inactiveCount}</p>
          </div>
          <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center border border-rose-100">
            <EyeOff className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-500">Rata-rata Rating</p>
            <div className="flex items-center gap-1.5 mt-1">
              <p className="text-2xl font-black text-amber-500">{avgRating}</p>
              <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
            </div>
          </div>
          <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center border border-amber-100">
            <Star className="w-6 h-6 fill-amber-400" />
          </div>
        </div>
      </div>

      {/* Control Bar: Search & Action */}
      <div className="bg-white rounded-2xl p-4 border border-gray-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari pengulas, produk, ulasan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-4 py-2 text-xs font-semibold text-gray-800 focus:bg-white focus:outline-none focus:border-[#774EFC]"
          />
        </div>

        {/* Filters & Add Button */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-end">
          {/* Rating filter */}
          <select
            value={filterRating}
            onChange={(e) => setFilterRating(e.target.value)}
            className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-gray-700 focus:outline-none focus:border-[#774EFC] cursor-pointer"
          >
            <option value="all">Semua Rating ⭐</option>
            <option value="5">5 Bintang ⭐⭐⭐⭐⭐</option>
            <option value="4">4 Bintang ⭐⭐⭐⭐</option>
            <option value="3">3 Bintang ⭐⭐⭐</option>
            <option value="2">2 Bintang ⭐⭐</option>
            <option value="1">1 Bintang ⭐</option>
          </select>

          {/* Status filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-gray-700 focus:outline-none focus:border-[#774EFC] cursor-pointer"
          >
            <option value="all">Semua Status</option>
            <option value="active">Aktif (ON)</option>
            <option value="inactive">Nonaktif (OFF)</option>
          </select>

          <button
            type="button"
            onClick={onAddReview}
            className="px-4 py-2 bg-[#774EFC] hover:bg-[#6332f6] text-white font-extrabold text-xs rounded-xl shadow-md shadow-purple-500/20 flex items-center gap-1.5 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Penilaian</span>
          </button>
        </div>
      </div>

      {/* Reviews List Cards / Table */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
        {filteredReviews.length === 0 ? (
          <div className="py-16 text-center space-y-2">
            <MessageSquare className="w-10 h-10 text-gray-300 mx-auto" />
            <p className="text-sm font-bold text-gray-700">Belum ada penilaian produk ditemukan.</p>
            <p className="text-xs text-gray-400">Coba ubah kata kunci pencarian atau filter status ulasan.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredReviews.map((rev) => (
              <div key={rev.id} className="p-5 sm:p-6 space-y-4 hover:bg-gray-50/50 transition">
                {/* Header Row: Product Info & Actions */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
                  {/* Product */}
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-gray-100 border border-gray-200 overflow-hidden shrink-0">
                      {rev.product?.thumbnail ? (
                        <img src={rev.product.thumbnail} alt={rev.product?.name} className="w-full h-full object-cover" />
                      ) : (
                        <ShoppingBag className="w-5 h-5 text-gray-400 m-auto mt-3" />
                      )}
                    </div>
                    <div>
                      <span className="text-[11px] font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md">
                        ID Produk: #{rev.productId}
                      </span>
                      <h4 className="text-xs font-extrabold text-gray-900 line-clamp-1 mt-0.5">
                        {rev.product?.name || `Produk ID #${rev.productId}`}
                      </h4>
                    </div>
                  </div>

                  {/* Actions & Status Toggle */}
                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    {/* Toggle ON/OFF Switch */}
                    <button
                      type="button"
                      onClick={() => onToggleActive(rev.id, rev.isActive !== false)}
                      className={`px-3 py-1.5 rounded-xl text-[11px] font-extrabold flex items-center gap-1.5 transition cursor-pointer border ${
                        rev.isActive !== false
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                          : "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100"
                      }`}
                      title="Klik untuk mengubah status tampil ulasan di web"
                    >
                      {rev.isActive !== false ? (
                        <>
                          <Eye className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Status: ON</span>
                        </>
                      ) : (
                        <>
                          <EyeOff className="w-3.5 h-3.5 text-rose-600" />
                          <span>Status: OFF</span>
                        </>
                      )}
                    </button>

                    {/* Beri Tanggapan */}
                    <button
                      type="button"
                      onClick={() => onReplyReview(rev)}
                      className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-[#774EFC] border border-purple-200 font-extrabold text-[11px] rounded-xl flex items-center gap-1.5 transition cursor-pointer"
                      title="Beri atau ubah tanggapan resmi toko"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>{rev.sellerReply ? "Edit Tanggapan" : "Beri Tanggapan"}</span>
                    </button>

                    {/* Edit */}
                    <button
                      type="button"
                      onClick={() => onEditReview(rev)}
                      className="p-2 text-gray-600 hover:text-purple-600 hover:bg-gray-100 rounded-xl transition cursor-pointer"
                      title="Edit Ulasan"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    {/* Delete */}
                    <button
                      type="button"
                      onClick={() => onDeleteReview(rev.id)}
                      className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer"
                      title="Hapus Ulasan"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Reviewer & Rating details */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {rev.avatar ? (
                        <img src={rev.avatar} alt={rev.name} className="w-8 h-8 rounded-full object-cover border border-gray-200" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-purple-100 text-[#774EFC] font-extrabold text-xs flex items-center justify-center">
                          {rev.name?.[0] || "U"}
                        </div>
                      )}
                      <div>
                        <span className="font-extrabold text-xs text-gray-900">{rev.name}</span>
                        {rev.variantName && (
                          <span className="ml-2 text-[10px] text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full font-medium">
                            Variasi: {rev.variantName}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 text-amber-400">
                      {[...Array(Number(rev.rating) || 5)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      ))}
                      <span className="text-[10px] text-gray-400 ml-1.5 font-mono">
                        {new Date(rev.createdAt || Date.now()).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-gray-800 leading-relaxed font-normal bg-gray-50/70 p-3 rounded-xl border border-gray-100">
                    "{rev.review}"
                  </p>

                  {/* Photo & Video Media attachments */}
                  {Array.isArray(rev.mediaUrls) && rev.mediaUrls.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      {rev.mediaUrls.map((url: string, mIdx: number) => {
                        const isVid = url.endsWith(".mp4") || url.endsWith(".webm") || url.endsWith(".mov") || url.includes("video");
                        return (
                          <div key={mIdx} className="relative w-16 h-16 rounded-xl overflow-hidden border border-gray-200 bg-slate-950 shadow-2xs">
                            {isVid ? (
                              <video src={url} className="w-full h-full object-cover" />
                            ) : (
                              <img src={url} alt="Review attachment" className="w-full h-full object-cover cursor-pointer" onClick={() => window.open(url, "_blank")} />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Seller Official Reply */}
                  {rev.sellerReply && (
                    <div className="bg-purple-50/60 border-l-4 border-[#774EFC] p-3 rounded-r-xl space-y-1 text-xs mt-2">
                      <div className="font-extrabold text-[#774EFC] flex items-center gap-1.5 text-[11px]">
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Tanggapan Penjual (Official Store TRI J):</span>
                      </div>
                      <p className="text-gray-700 leading-relaxed font-medium">{rev.sellerReply}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
