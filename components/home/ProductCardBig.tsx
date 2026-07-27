"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { useWishlist } from "@/context/WishlistContext";
import { useAuth } from "@/context/AuthContext";

interface ProductCardBigProps {
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

export default function ProductCardBig({ product }: ProductCardBigProps) {
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
    <div className="relative w-[360px] overflow-hidden rounded-[30px] bg-white transition duration-300 hover:-translate-y-1 shadow-sm border border-gray-100 font-sans">
      {/* Heart / Wishlist Button - Only shown when user is logged in */}
      {user && (
        <button
          onClick={handleWishlistClick}
          className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-white/80 backdrop-blur-md border border-gray-100 shadow-md hover:scale-110 transition-all cursor-pointer"
          title={active ? "Hapus dari Favorit" : "Tambah ke Favorit"}
        >
          <Heart
            className={`w-4 h-4 transition-colors ${
              active ? "fill-rose-500 text-rose-500" : "text-gray-400 hover:text-rose-500"
            }`}
          />
        </button>
      )}

      {/* Product Detail */}
      <Link href={`/products/${product.id}`} className="group block">
        <div className="relative aspect-square w-full overflow-hidden bg-gray-50 flex items-center justify-center">
          <img
            src={imgSrc}
            alt={product.name || "Product"}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-contain transition duration-500 group-hover:scale-105"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                "https://placehold.co/600x600?text=No+Image";
            }}
          />
        </div>

        <div className="px-6 pt-6">
          <h3 className="truncate text-[24px] font-semibold text-[#1D1D1F]">
            {product.name}
          </h3>

          <p className="truncate mt-2 text-sm leading-6 text-[#666]">
            {product.description}
          </p>
        </div>
      </Link>

      {/* Footer */}
      <div className="flex items-center justify-between px-6 pb-6 pt-6">
        <Link
          href="/contact-us"
          className="rounded-[16px] bg-[#774EFC] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#774EFC]/80"
        >
          Get Best Price
        </Link>

        <span className="whitespace-nowrap text-sm text-[#666]">
          {product.sold}
        </span>
      </div>
    </div>
  );
}