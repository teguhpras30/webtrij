"use client";

import { useWishlist } from "@/context/WishlistContext";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ProductCard from "@/components/home/ProductCard";
import Link from "next/link";
import { Heart, ArrowLeft, Loader2, ShoppingBag } from "lucide-react";

export default function WishlistPage() {
  const { user, loading: authLoading } = useAuth();
  const { wishlistProducts, loading: wishlistLoading } = useWishlist();

  const loading = authLoading || wishlistLoading;

  return (
    <main className="min-h-screen bg-[var(--Bg)] font-sans">
      <Navbar />

      <section className="mx-auto max-w-7xl px-5 md:px-10 lg:px-20 pt-28 pb-20">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs text-slate-500 hover:text-slate-800 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Beranda</span>
        </Link>

        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 text-rose-500 flex items-center justify-center shadow-sm">
            <Heart className="w-6 h-6 fill-rose-500" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Produk Favorit Saya</h1>
            <p className="text-xs md:text-sm text-gray-500 mt-0.5">
              Daftar produk unggulan yang Anda simpan untuk pengajuan harga dan pemesanan.
            </p>
          </div>
        </div>

        {/* Loading state */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-gray-400">
            <Loader2 className="w-8 h-8 animate-spin text-purple-600 mb-3" />
            <span className="text-xs">Memuat produk favorit Anda...</span>
          </div>
        ) : !user ? (
          <div className="py-16 text-center bg-white rounded-3xl border border-gray-200 p-8 shadow-sm max-w-md mx-auto">
            <Heart className="w-12 h-12 text-rose-400 mx-auto mb-4 animate-bounce" />
            <h2 className="text-lg font-bold text-gray-900">Silakan Masuk Akun</h2>
            <p className="text-xs text-gray-500 mt-2 mb-6">
              Anda perlu masuk ke akun pelanggan untuk melihat dan mengelola produk favorit.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-red-600 to-rose-600 text-white font-semibold text-xs rounded-xl shadow-md hover:from-red-500 hover:to-rose-500 transition-all"
            >
              Kembali ke Utama
            </Link>
          </div>
        ) : wishlistProducts.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-3xl border border-gray-200 p-8 shadow-sm max-w-md mx-auto">
            <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h2 className="text-lg font-bold text-gray-900">Wishlist Masih Kosong</h2>
            <p className="text-xs text-gray-500 mt-2 mb-6">
              Anda belum menandai produk sebagai favorit. Jelajahi katalog produk kami sekarang!
            </p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#774EFC] text-white font-semibold text-xs rounded-xl shadow-md hover:bg-[#774EFC]/80 transition-all"
            >
              Jelajahi Produk
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8 justify-items-center">
            {wishlistProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      <Footer />
    </main>
  );
}
