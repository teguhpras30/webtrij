"use client";

import React, { useState } from "react";
import { Link2, Check, Share2 } from "lucide-react";
import { createProductSlug } from "@/lib/slug";

interface ProductShareBarProps {
  product: {
    id: number | string;
    name: string;
    image?: string;
  };
}

export default function ProductShareBar({ product }: ProductShareBarProps) {
  const [copied, setCopied] = useState(false);

  // Fallback to window.location.href or canonical domain with SEO Slug
  const getProductUrl = () => {
    if (typeof window !== "undefined" && window.location.origin) {
      return `${window.location.origin}/products/${createProductSlug(product.id, product.name)}`;
    }
    return `https://tri-j.co.id/products/${createProductSlug(product.id, product.name)}`;
  };

  const productUrl = getProductUrl();
  const encodedUrl = encodeURIComponent(productUrl);
  const shareText = `Lihat produk unggulan "${product.name}" di TRI J Peralatan Rumah Tangga:`;
  const encodedText = encodeURIComponent(`${shareText} ${productUrl}`);

  const handleCopyLink = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(productUrl);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = productUrl;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error("Gagal menyalin link:", err);
    }
  };

  const shareLinks = [
    {
      name: "WhatsApp",
      url: `https://api.whatsapp.com/send?text=${encodedText}`,
      bg: "bg-[#25D366] hover:bg-[#20bd5a]",
      icon: (
        <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
        </svg>
      ),
    },
    {
      name: "Facebook",
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      bg: "bg-[#1877F2] hover:bg-[#166fe5]",
      icon: (
        <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      ),
    },
    {
      name: "Messenger",
      url: `fb-messenger://share?link=${encodedUrl}`,
      bg: "bg-gradient-to-tr from-[#00B2FF] via-[#006AFF] to-[#9900FF] hover:opacity-90",
      icon: (
        <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
          <path d="M12 0C5.373 0 0 4.974 0 11.111c0 3.498 1.744 6.614 4.469 8.654V24l4.088-2.242c1.077.299 2.222.463 3.443.463 6.627 0 12-4.975 12-11.11C24 4.974 18.627 0 12 0zm1.191 14.963l-3.055-3.26-5.963 3.26L10.8 8.8l3.129 3.26 5.89-3.26-7.028 6.163z"/>
        </svg>
      ),
    },
    {
      name: "Pinterest",
      url: `https://pinterest.com/pin/create/button/?url=${encodedUrl}&description=${encodedText}`,
      bg: "bg-[#E60023] hover:bg-[#cc001f]",
      icon: (
        <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
          <path d="M12 0c-6.627 0-12 5.372-12 12 0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 12-5.373 12-12 0-6.628-5.393-12-12-12z"/>
        </svg>
      ),
    },
    {
      name: "X (Twitter)",
      url: `https://twitter.com/intent/tweet?text=${encodedText}`,
      bg: "bg-black hover:bg-neutral-800",
      icon: (
        <svg className="w-3.5 h-3.5 fill-white" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      ),
    },
  ];

  return (
    <div className="flex items-center gap-2.5 my-3 py-2 flex-wrap">
      <span className="text-xs sm:text-sm font-bold text-slate-700 select-none">
        Share:
      </span>

      <div className="flex items-center gap-2 flex-wrap">
        {/* Social Share Buttons */}
        {shareLinks.map((item, idx) => (
          <a
            key={idx}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            title={`Bagikan ke ${item.name}`}
            aria-label={`Bagikan ${product.name} ke ${item.name}`}
            className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full ${item.bg} flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 shadow-xs shrink-0 cursor-pointer`}
          >
            {item.icon}
          </a>
        ))}

        {/* Copy Link Button */}
        <button
          type="button"
          onClick={handleCopyLink}
          title="Salin Tautan Produk"
          aria-label="Salin Tautan Produk"
          className={`h-7 sm:h-8 px-2.5 rounded-full flex items-center gap-1.5 text-xs font-bold transition-all duration-200 shadow-xs cursor-pointer ${
            copied
              ? "bg-emerald-600 text-white"
              : "bg-slate-100 hover:bg-purple-100 text-slate-700 hover:text-purple-700 border border-slate-200"
          }`}
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-white animate-in zoom-in" />
              <span className="text-[11px]">Tersalin!</span>
            </>
          ) : (
            <>
              <Link2 className="w-3.5 h-3.5 text-purple-600" />
              <span className="text-[11px] hidden sm:inline">Salin Link</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
