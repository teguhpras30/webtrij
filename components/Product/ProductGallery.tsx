"use client";

import { useState, useEffect } from "react";
import { Video } from "lucide-react";

interface ProductGalleryProps {
  image?: string;
  thumbnail?: string;
  images?: any[];
  variants?: any[];
  name?: string;
  activeVariantImage?: string;
}

function safeImageSrc(src?: string): string {
  if (!src || !src.trim()) return "https://placehold.co/600x600?text=No+Image";
  const clean = src.trim();
  if (clean.startsWith("http://") || clean.startsWith("https://") || clean.startsWith("/")) {
    return clean;
  }
  return `/${clean}`;
}

function isVideoUrl(url?: string): boolean {
  if (!url) return false;
  const clean = url.toLowerCase();
  return (
    clean.endsWith(".mp4") ||
    clean.endsWith(".webm") ||
    clean.endsWith(".mov") ||
    clean.endsWith(".avi") ||
    clean.endsWith(".mkv") ||
    clean.includes("/video/") ||
    clean.includes("data:video/")
  );
}

export default function ProductGallery({
  image,
  thumbnail,
  images = [],
  variants = [],
  name = "Product",
  activeVariantImage,
}: ProductGalleryProps) {
  const mainThumbnail = safeImageSrc(thumbnail || image);
  const mainSrc = safeImageSrc(activeVariantImage || image || thumbnail);

  const rawGalleryImages = (images || [])
    .map((img) => (typeof img === "string" ? safeImageSrc(img) : safeImageSrc(img?.image)))
    .filter((img) => img && typeof img === "string" && img.trim() !== "");

  const rawVariantImages = (variants || [])
    .map((v) => (typeof v === "string" ? v : v?.image))
    .filter((img) => img && typeof img === "string" && img.trim() !== "")
    .map(safeImageSrc);

  // Combine main thumbnail, gallery images, and variant photos
  const allMedia = Array.from(
    new Set([mainThumbnail, ...rawGalleryImages, ...rawVariantImages])
  );

  // Re-order: Videos come first (#1), then non-video images
  const videos = allMedia.filter((url) => isVideoUrl(url));
  const nonVideos = allMedia.filter((url) => !isVideoUrl(url));
  const galleryImages = [...videos, ...nonVideos];

  const defaultSelected =
    activeVariantImage && activeVariantImage.trim() !== ""
      ? safeImageSrc(activeVariantImage)
      : galleryImages.length > 0
      ? galleryImages[0]
      : mainSrc;

  const [selectedImage, setSelectedImage] = useState(defaultSelected);

  useEffect(() => {
    if (activeVariantImage && activeVariantImage.trim() !== "") {
      setSelectedImage(safeImageSrc(activeVariantImage));
    } else if (galleryImages.length > 0) {
      setSelectedImage(galleryImages[0]);
    } else if (image || thumbnail) {
      setSelectedImage(safeImageSrc(image || thumbnail));
    }
  }, [activeVariantImage, image, thumbnail]);

  return (
    <div>
      {/* Gambar / Video Utama */}
      <div className="relative aspect-square overflow-hidden rounded-2xl border-2 border-gray-200 bg-gray-50 flex items-center justify-center">
        {isVideoUrl(selectedImage) ? (
          <video
            key={selectedImage}
            src={selectedImage}
            controls
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
          />
        ) : (
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
        )}
      </div>

      {/* Thumbnail Bar */}
      {galleryImages.length > 1 && (
        <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
          {galleryImages.map((img, index) => {
            const isVid = isVideoUrl(img);
            return (
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
                {isVid ? (
                  <video src={img} className="w-full h-full object-cover" muted />
                ) : (
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
                )}
                {isVid && (
                  <div className="absolute top-1 left-1 bg-black/80 text-white text-[8px] font-extrabold px-1 rounded flex items-center gap-0.5">
                    <Video className="w-2.5 h-2.5 text-red-500" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}