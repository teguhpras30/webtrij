"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { blogPosts, BlogPost, getBlogCoverImage, DEFAULT_BLOG_COVER } from "@/data/blogPosts";
import { Calendar, Clock, User, ArrowRight, Tag, Search, Star, Image as ImageIcon } from "lucide-react";

export default function BlogClient() {
  const [posts, setPosts] = useState<BlogPost[]>(blogPosts);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");

  useEffect(() => {
    async function loadBlogs() {
      try {
        const res = await fetch(`/api/public/blogs?t=${Date.now()}`, {
          cache: "no-store",
        });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setPosts(data);
            return;
          }
        }
      } catch (e) {}

      try {
        const local = localStorage.getItem("webtrij_blog_posts");
        if (local) {
          const parsed: BlogPost[] = JSON.parse(local);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setPosts(parsed);
          }
        }
      } catch (e) {}
    }
    loadBlogs();
  }, []);

  const filteredPosts = posts.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === "ALL" ? true : post.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  // Prioritize article explicitly marked as isHighlight
  const highlightedPost = filteredPosts.find((p) => p.isHighlight === true);
  const featuredPost = highlightedPost || filteredPosts[0] || posts[0];
  const remainingPosts = filteredPosts.filter((p) => p.id !== featuredPost?.id);

  return (
    <div className="space-y-12 font-sans">
      {/* Category Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-3xl border border-gray-200/80 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-gray-400" />
          <input
            type="text"
            placeholder="Cari artikel tips & peluang usaha..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs text-gray-900 focus:outline-none focus:border-[#774EFC] font-medium"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {["ALL", "Tips Perabotan", "Peluang Usaha", "Review Produk", "Kemitraan"].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-bold shrink-0 transition cursor-pointer ${
                selectedCategory === cat
                  ? "bg-[#774EFC] text-white shadow-xs"
                  : "bg-gray-100 border border-gray-200/60 text-gray-600 hover:text-gray-900"
              }`}
            >
              {cat === "ALL" ? "Semua Kategori" : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Featured Highlight Article Hero Card (Area Highlight Utama) */}
      {featuredPost && (
        <article className="group relative bg-white border border-purple-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 grid grid-cols-1 lg:grid-cols-12 gap-0">
          <div className="lg:col-span-7 relative h-72 lg:h-auto min-h-[320px] overflow-hidden bg-gray-50 flex items-center justify-center">
            <img
              src={getBlogCoverImage(featuredPost)}
              alt={featuredPost.title}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.onerror = null;
                target.src = DEFAULT_BLOG_COVER;
              }}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />

            <div className="absolute top-4 left-4 flex flex-wrap items-center gap-2 z-10">
              <span className="bg-[#774EFC] text-white text-xs font-bold px-3.5 py-1.5 rounded-full shadow-md">
                {featuredPost.category}
              </span>
              {featuredPost.isHighlight && (
                <span className="bg-amber-500 text-white text-xs font-extrabold px-3.5 py-1.5 rounded-full shadow-md flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-white" />
                  <span>ARTIKEL UNGGULAN (HIGHLIGHT)</span>
                </span>
              )}
            </div>
          </div>

          <div className="lg:col-span-5 p-6 sm:p-8 lg:p-10 flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 font-semibold">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-[#774EFC]" />
                  <span>{featuredPost.date}</span>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-emerald-600" />
                  <span>{featuredPost.readTime}</span>
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-gray-900 leading-snug group-hover:text-[#774EFC] transition-colors">
                <Link href={`/blog/${featuredPost.slug}`}>{featuredPost.title}</Link>
              </h2>

              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed line-clamp-3">
                {featuredPost.excerpt}
              </p>
            </div>

            <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-purple-100 text-[#774EFC] flex items-center justify-center font-bold text-xs shadow-2xs">
                  TJ
                </div>
                <span className="text-xs font-bold text-gray-700">{featuredPost.author}</span>
              </div>

              <Link
                href={`/blog/${featuredPost.slug}`}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#774EFC] hover:bg-[#6332f6] text-white text-xs font-bold rounded-xl shadow-md hover:shadow-purple-500/20 transition-all"
              >
                <span>Baca Selengkapnya</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </article>
      )}

      {/* Grid of Other Articles */}
      {remainingPosts.length > 0 && (
        <div className="space-y-6">
          <h3 className="text-lg font-black text-gray-900 border-b border-gray-200 pb-3 flex items-center justify-between">
            <span>Artikel Lainnya</span>
            <span className="text-xs font-semibold text-gray-400">{remainingPosts.length} Artikel</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {remainingPosts.map((post) => (
              <article
                key={post.id}
                className="group bg-white border border-gray-200/80 rounded-3xl overflow-hidden shadow-2xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="relative h-48 overflow-hidden bg-gray-50 flex items-center justify-center">
                    <img
                      src={getBlogCoverImage(post)}
                      alt={post.title}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.onerror = null;
                        target.src = DEFAULT_BLOG_COVER;
                      }}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    <div className="absolute top-3 left-3">
                      <span className="bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1 rounded-full border border-white/20">
                        {post.category}
                      </span>
                    </div>
                  </div>

                  <div className="px-5 space-y-2">
                    <div className="flex items-center justify-between text-[11px] text-gray-400 font-semibold">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-[#774EFC]" />
                        <span>{post.date}</span>
                      </span>
                      <span>{post.readTime}</span>
                    </div>

                    <h3 className="text-sm font-extrabold text-gray-900 group-hover:text-[#774EFC] transition-colors line-clamp-2 leading-snug">
                      <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                    </h3>

                    <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                      {post.excerpt}
                    </p>
                  </div>
                </div>

                <div className="p-5 pt-4 border-t border-gray-100 flex items-center justify-between mt-4">
                  <span className="text-[11px] font-bold text-gray-500">{post.author}</span>
                  <Link
                    href={`/blog/${post.slug}`}
                    className="text-xs font-bold text-[#774EFC] hover:underline flex items-center gap-1"
                  >
                    <span>Baca</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
