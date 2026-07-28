"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { useWishlist } from "@/context/WishlistContext";
import { useAuth } from "@/context/AuthContext";

interface ProductCardProps {
  product: any;
}

function safeImageSrc(src?: string): string {
  if (!src || !src.trim()) return "https://placehold.co/600x600?text=No+Image";
  const clean = src.trim();
  if (clean.startsWith("http://") || clean.startsWith("https://") || clean.startsWith("/")) {
    return clean;
  }
  return `/${clean}`;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { user } = useAuth();

  const imgSrc = safeImageSrc(product?.image || product?.thumbnail);
  const active = isWishlisted(product.id);

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (user) {
      toggleWishlist(product.id);
    }
  };

  return (
    <div className="group relative w-full sm:max-w-[299px] mx-auto overflow-hidden rounded-2xl sm:rounded-[30px] bg-white transition hover:-translate-y-1 shadow-sm border border-gray-100 font-sans flex flex-col justify-between">
      {/* Heart / Wishlist Button - Only shown when user is logged in */}
      {user && (
        <button
          onClick={handleWishlistClick}
          className="absolute top-2.5 right-2.5 sm:top-4 sm:right-4 z-20 p-2 sm:p-2.5 rounded-full bg-white/80 backdrop-blur-md border border-gray-100 shadow-md hover:scale-110 transition-all cursor-pointer"
          title={active ? "Hapus dari Favorit" : "Tambah ke Favorit"}
        >
          <Heart
            className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-colors ${
              active ? "fill-rose-500 text-rose-500" : "text-gray-400 hover:text-rose-500"
            }`}
          />
        </button>
      )}

      <Link href={`/products/${product.id}`} className="block">
        <div className="relative aspect-square w-full overflow-hidden bg-gray-50 flex items-center justify-center">
          <img
            src={imgSrc}
            alt={product.name || "Product"}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover transition duration-500 group-hover:scale-105"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                "https://placehold.co/600x600?text=No+Image";
            }}
          />
        </div>

        <div className="p-3 sm:pt-5 sm:px-5">
          <h3 className="line-clamp-1 text-xs sm:text-[18px] font-semibold text-[#1D1D1F]">
            {product.name}
          </h3>

          <p className="mt-0.5 sm:mt-1 line-clamp-1 text-[11px] sm:text-sm text-[#666]">
            {product.description}
          </p>
        </div>
      </Link>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-1.5 sm:gap-2 p-3 sm:px-5 sm:pb-5 sm:pt-4">
        <Link
          href="/contact-us"
          className="w-full sm:w-auto rounded-xl sm:rounded-[16px] bg-[#774EFC] px-3 py-2 sm:px-5 sm:py-3 text-xs sm:text-sm font-semibold text-white transition hover:bg-[#774EFC]/80 text-center"
        >
          Get Best Price
        </Link>

        {product.sold && (
          <span className="whitespace-nowrap text-[10px] sm:text-sm text-[#666] text-right sm:text-left">
            {product.sold}
          </span>
        )}
      </div>
    </div>
  );
}