"use client";

import { useState } from "react";
import { FileText, Plus, Search, Edit3, Trash2, ExternalLink, Calendar, User, Tag, Eye, Star } from "lucide-react";
import { BlogPost, getBlogCoverImage, DEFAULT_BLOG_COVER } from "@/data/blogPosts";

interface BlogTabProps {
  posts: BlogPost[];
  onAddPost: () => void;
  onEditPost: (post: BlogPost) => void;
  onDeletePost: (id: string) => void;
  onToggleHighlight?: (post: BlogPost) => void;
}

export default function BlogTab({
  posts,
  onAddPost,
  onEditPost,
  onDeletePost,
  onToggleHighlight,
}: BlogTabProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");

  const filteredPosts = posts.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.author.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === "ALL" ? true : post.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6 font-sans">
      {/* Action Bar Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-gray-200 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-[#774EFC] border border-purple-100 flex items-center justify-center font-bold shrink-0">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900">Artikel Blog & Edukasi Pelanggan</h3>
            <p className="text-xs text-gray-500">
              Kelola artikel tips perabotan, peluang usaha grosir, dan review produk TRI J.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onAddPost}
          className="w-full sm:w-auto px-5 py-2.5 bg-[#774EFC] hover:bg-[#6332f6] text-white font-bold text-xs rounded-2xl shadow-md flex items-center justify-center gap-2 transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Artikel Blog</span>
        </button>
      </div>

      {/* Search & Category Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Cari judul artikel..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-2xl text-xs text-gray-900 focus:outline-none focus:border-[#774EFC] font-medium"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {["ALL", "Tips Perabotan", "Peluang Usaha", "Review Produk", "Kemitraan"].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold shrink-0 transition cursor-pointer ${
                selectedCategory === cat
                  ? "bg-[#774EFC] text-white shadow-xs"
                  : "bg-white border border-gray-200 text-gray-600 hover:text-gray-900"
              }`}
            >
              {cat === "ALL" ? "Semua Kategori" : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Blog Cards List */}
      {filteredPosts.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-3xl p-12 text-center space-y-2">
          <FileText className="w-10 h-10 text-gray-300 mx-auto" />
          <p className="text-xs font-bold text-gray-600">Tidak ada artikel blog yang ditemukan.</p>
          <p className="text-[11px] text-gray-400">Silakan ubah kata kunci pencarian atau tambah artikel baru.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredPosts.map((post) => (
            <div
              key={post.id}
              className="bg-white border border-gray-200 rounded-3xl p-5 shadow-xs hover:shadow-md transition space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-3">
                {/* Cover Image & Category Badge */}
                <div className="relative h-44 rounded-2xl overflow-hidden bg-gray-100 border border-gray-100">
                  <img
                    src={getBlogCoverImage(post)}
                    alt={post.title}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.onerror = null;
                      target.src = DEFAULT_BLOG_COVER;
                    }}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    <div className="bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1 rounded-full border border-white/20">
                      {post.category}
                    </div>
                    {post.isHighlight && (
                      <div className="bg-amber-500 text-white text-[10px] font-black px-2.5 py-1 rounded-full shadow-md flex items-center gap-1">
                        <Star className="w-3 h-3 fill-white" />
                        <span>HIGHLIGHT</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Article Info */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-3 text-[10px] text-gray-400 font-semibold">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-[#774EFC]" />
                      <span>{post.date}</span>
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3 text-emerald-600" />
                      <span>{post.author}</span>
                    </span>
                  </div>

                  <h4 className="font-extrabold text-sm text-gray-900 line-clamp-2 leading-snug">
                    {post.title}
                  </h4>

                  <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                    {post.excerpt}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-2 text-xs">
                <a
                  href={`/blog/${post.slug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] font-bold text-[#774EFC] hover:underline flex items-center gap-1"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Lihat Artikel</span>
                </a>

                <div className="flex items-center gap-1.5">
                  {onToggleHighlight && (
                    <button
                      type="button"
                      onClick={() => onToggleHighlight(post)}
                      className={`px-2.5 py-1.5 font-bold rounded-xl flex items-center gap-1 transition cursor-pointer text-[11px] ${
                        post.isHighlight
                          ? "bg-amber-100 text-amber-900 border border-amber-300"
                          : "bg-gray-100 hover:bg-gray-200 text-gray-600"
                      }`}
                      title={post.isHighlight ? "Hapus dari Artikel Unggulan" : "Jadikan Artikel Unggulan (Highlight)"}
                    >
                      <Star className={`w-3.5 h-3.5 ${post.isHighlight ? "text-amber-600 fill-amber-500" : "text-gray-400"}`} />
                      <span>{post.isHighlight ? "Unggulan" : "Set Highlight"}</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => onEditPost(post)}
                    className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl flex items-center gap-1 transition cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-blue-600" />
                    <span>Edit</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onDeletePost(post.id)}
                    className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 font-bold rounded-xl flex items-center gap-1 transition cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-red-600" />
                    <span>Hapus</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
