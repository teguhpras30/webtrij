"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { blogPosts, BlogPost, getBlogCoverImage, DEFAULT_BLOG_COVER } from "@/data/blogPosts";
import { Calendar, Clock, User, ArrowLeft, Tag, Share2, CheckCircle2, MessageSquare } from "lucide-react";

interface BlogPostClientProps {
  slug: string;
  initialPost?: BlogPost;
}

export default function BlogPostClient({ slug, initialPost }: BlogPostClientProps) {
  const [post, setPost] = useState<BlogPost | undefined>(initialPost);
  const [allPosts, setAllPosts] = useState<BlogPost[]>(blogPosts);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function loadPostDetail() {
      try {
        const res = await fetch(`/api/public/blogs?slug=${encodeURIComponent(slug)}&t=${Date.now()}`, {
          cache: "no-store",
        });
        if (res.ok) {
          const data = await res.json();
          if (data && data.slug) {
            setPost(data);
          }
        }
      } catch (e) {}

      try {
        const resAll = await fetch(`/api/public/blogs?t=${Date.now()}`, { cache: "no-store" });
        if (resAll.ok) {
          const list = await resAll.json();
          if (Array.isArray(list) && list.length > 0) {
            setAllPosts(list);
            return;
          }
        }
      } catch (e) {}

      try {
        const local = localStorage.getItem("webtrij_blog_posts");
        if (local) {
          const parsed: BlogPost[] = JSON.parse(local);
          setAllPosts(parsed);
          const found = parsed.find((p) => p.slug === slug);
          if (found) setPost(found);
        }
      } catch (e) {}
    }
    loadPostDetail();
  }, [slug]);

  if (!post) {
    return (
      <div className="py-24 text-center space-y-4">
        <h2 className="text-xl font-bold text-gray-800">Artikel Tidak Ditemukan</h2>
        <p className="text-xs text-gray-500">Artikel yang Anda cari tidak tersedia atau telah dihapus.</p>
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#774EFC] text-white text-xs font-bold rounded-xl shadow-md"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Daftar Blog</span>
        </Link>
      </div>
    );
  }

  const relatedPosts = allPosts.filter((p) => p.slug !== post.slug).slice(0, 3);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  return (
    <article className="max-w-4xl mx-auto space-y-8 font-sans">
      {/* Back Button */}
      <div>
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-xs font-bold text-gray-600 hover:text-[#774EFC] bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-2xs transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Semua Artikel</span>
        </Link>
      </div>

      {/* Article Header */}
      <header className="bg-white p-6 sm:p-10 rounded-3xl border border-gray-200/80 shadow-xs space-y-6">
        <div className="inline-block bg-[#774EFC]/10 text-[#774EFC] text-xs font-bold px-3.5 py-1.5 rounded-full border border-purple-200">
          {post.category}
        </div>

        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 leading-tight">
          {post.title}
        </h1>

        <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-medium">
          {post.excerpt}
        </p>

        <div className="pt-4 border-t border-gray-100 flex flex-wrap items-center justify-between gap-4 text-xs text-gray-500 font-semibold">
          <div className="flex flex-wrap items-center gap-4">
            <span className="flex items-center gap-1.5 text-gray-800 font-bold">
              <User className="w-4 h-4 text-[#774EFC]" />
              <span>{post.author}</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-emerald-600" />
              <span>{post.date}</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-amber-500" />
              <span>{post.readTime}</span>
            </span>
          </div>

          <button
            type="button"
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl border border-gray-200 text-xs font-bold transition cursor-pointer"
          >
            {copied ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Link Tersalin!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5 text-[#774EFC]" />
                <span>Bagikan Artikel</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* Cover Image (Uncropped, Full Image View) */}
      <div className="rounded-3xl overflow-hidden bg-gray-50 border border-gray-200/80 shadow-md flex items-center justify-center p-2 sm:p-4">
        <img
          src={getBlogCoverImage(post)}
          alt={post.title}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.onerror = null;
            target.src = DEFAULT_BLOG_COVER;
          }}
          className="w-full h-auto max-h-[650px] object-contain rounded-2xl mx-auto shadow-2xs"
        />
      </div>

      {/* Article Content Body */}
      <div className="bg-white p-6 sm:p-10 rounded-3xl border border-gray-200/80 shadow-xs">
        <div
          className="prose prose-sm sm:prose-base max-w-none text-gray-800 leading-relaxed space-y-4 font-normal"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Article Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="mt-8 pt-6 border-t border-gray-100 flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-gray-500 flex items-center gap-1">
              <Tag className="w-3.5 h-3.5 text-[#774EFC]" />
              <span>Tag Terkait:</span>
            </span>
            {post.tags.map((tag, idx) => (
              <span
                key={idx}
                className="px-3 py-1 bg-gray-100 hover:bg-purple-50 text-gray-700 hover:text-[#774EFC] rounded-full text-xs font-semibold border border-gray-200/60 transition"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Standalone B2B Wholesale Callout Banner (Di luar artikel) */}
      <div className="bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-950 text-white p-6 sm:p-8 rounded-3xl shadow-xl space-y-4 relative overflow-hidden border border-purple-700/50">
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-2">
          <span className="bg-white/10 text-purple-200 border border-white/20 text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
            ✨ JAMINAN GARANSI PENGIRIMAN TRI J
          </span>
          <h4 className="font-black text-lg sm:text-xl text-white">
            GARANSI PART RUSAK? GANTI BARU!
          </h4>
          <p className="text-xs lg:text-sm text-purple-200 leading-relaxed max-w-2xl font-medium">
            Rusak saat ekspedisi? Kami ganti part baru! 📦✨
          </p>
        </div>
        <div className="pt-2 relative z-10">
          <a
            href="https://wa.me/628961656039?text=Halo%20Sales%20Tri-J,%20saya%20tertarik%20tanya%20harga%20grosir"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs sm:text-sm rounded-2xl shadow-lg hover:shadow-emerald-500/20 transition-all cursor-pointer border border-emerald-400"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Hubungi Sales Grosir B2B WhatsApp</span>
          </a>
        </div>
      </div>

      {/* Related Articles Footer */}
      {relatedPosts.length > 0 && (
        <div className="space-y-6 pt-6">
          <h3 className="text-xl font-black text-gray-900 border-b border-gray-200 pb-3">
            Artikel Terkait Lainnya
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {relatedPosts.map((rel) => (
              <Link
                key={rel.id}
                href={`/blog/${rel.slug}`}
                className="group bg-white p-4 rounded-2xl border border-gray-200/80 shadow-2xs hover:shadow-md transition flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2">
                  <div className="h-36 rounded-xl overflow-hidden bg-gray-100">
                    <img
                      src={getBlogCoverImage(rel)}
                      alt={rel.title}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.onerror = null;
                        target.src = DEFAULT_BLOG_COVER;
                      }}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <h4 className="font-bold text-xs text-gray-900 group-hover:text-[#774EFC] line-clamp-2 leading-snug">
                    {rel.title}
                  </h4>
                </div>
                <div className="text-[10px] text-gray-400 font-semibold">{rel.date}</div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </article>
  );
}
