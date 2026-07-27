"use client";

import { useState } from "react";

interface ProductGalleryProps {
  image?: string;
  images?: string[];
  name?: string;
}

function safeImageSrc(src?: string): string {
  if (!src || !src.trim()) return "https://placehold.co/600x600?text=No+Image";
  const clean = src.trim();
  if (clean.startsWith("http://") || clean.startsWith("https://") || clean.startsWith("/")) {
    return clean;
  }
  return `/${clean}`;
}

export default function ProductGallery({
  image,
  images = [],
  name = "Product",
}: ProductGalleryProps) {
  const mainSrc = safeImageSrc(image);
  const [selectedImage, setSelectedImage] = useState(mainSrc);
  const galleryImages = [mainSrc, ...(images || []).map(safeImageSrc)];

  return (
    <div>
      {/* Gambar utama */}
      <div className="relative aspect-square overflow-hidden rounded-2xl border-2 border-gray-200 bg-gray-50 flex items-center justify-center">
        <img
          key={selectedImage}
          src={selectedImage}
          alt={name}
          className="w-full h-full object-cover transition-opacity duration-500"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              "https://placehold.co/600x600?text=No+Image";
          }}
        />
      </div>

      {/* Thumbnail */}
      {galleryImages.length > 1 && (
        <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
          {galleryImages.map((img, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setSelectedImage(img)}
              className={`relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl border-2 transition-all duration-200 bg-gray-50 ${
                selectedImage === img
                  ? "border-[#774EFC]"
                  : "border-gray-200 hover:border-[#774EFC]"
              }`}
            >
              <img
                src={img}
                alt={`${name}-${index + 1}`}
                className={`w-full h-full object-cover transition-transform duration-300 ${
                  selectedImage === img ? "scale-105" : "hover:scale-105"
                }`}
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    "https://placehold.co/100x100?text=No+Image";
                }}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}