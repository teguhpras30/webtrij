"use client";

import React, { useState } from "react";
import ProductGallery from "@/components/Product/ProductGallery";
import ProductDetailActions from "@/components/Product/ProductDetailActions";
import ProductReviews from "@/components/Product/ProductReviews";
import ProductShareBar from "@/components/Product/ProductShareBar";
import { FileText } from "lucide-react";

interface ProductDetailClientProps {
  product: any;
}

function parsePattern(
  nodes: (string | React.ReactNode)[],
  regex: RegExp,
  renderNode: (matchedText: string, group2: string | undefined, key: string) => React.ReactNode
) {
  const result: (string | React.ReactNode)[] = [];

  nodes.forEach((node, nodeIdx) => {
    if (typeof node !== "string") {
      result.push(node);
      return;
    }

    let lastIndex = 0;
    let match: RegExpExecArray | null;
    const currentRegex = new RegExp(regex.source, regex.flags);

    while ((match = currentRegex.exec(node)) !== null) {
      if (match.index > lastIndex) {
        result.push(node.substring(lastIndex, match.index));
      }

      result.push(renderNode(match[1], match[2], `${nodeIdx}-${match.index}`));
      lastIndex = currentRegex.lastIndex;
    }

    if (lastIndex < node.length) {
      result.push(node.substring(lastIndex));
    }
  });

  return result;
}

function renderInlineFormatting(str: string) {
  let parts: (string | React.ReactNode)[] = [str];

  // Markdown Links [Label](url)
  parts = parsePattern(parts, /\[(.*?)\]\((.*?)\)/g, (label, url, key) => (
    <a
      key={key}
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="text-[#774EFC] hover:underline font-semibold"
    >
      {label}
    </a>
  ));

  // Bold **text** or __text__
  parts = parsePattern(parts, /(\*\*|__)(.*?)\1/g, (match, _, key) => (
    <strong key={key} className="font-black text-slate-900">{match}</strong>
  ));

  // Italic *text* or _text_
  parts = parsePattern(parts, /(\*|_)(.*?)\1/g, (match, _, key) => (
    <em key={key} className="italic text-slate-800">{match}</em>
  ));

  // Underline <u>text</u>
  parts = parsePattern(parts, /<u>(.*?)<\/u>/gi, (match, _, key) => (
    <u key={key} className="underline underline-offset-3 decoration-[#774EFC] font-semibold">{match}</u>
  ));

  // Strikethrough ~~text~~
  parts = parsePattern(parts, /~~(.*?)~~/g, (match, _, key) => (
    <del key={key} className="line-through text-slate-400">{match}</del>
  ));

  return parts;
}

function renderFormattedDescription(text: string) {
  if (!text || !text.trim()) {
    return <span className="text-gray-400 italic">Belum ada deskripsi untuk produk ini.</span>;
  }

  // Jika teks mengandung tag HTML (dari Visual Editor), render HTML secara langsung
  if (/<(p|h[1-6]|ul|ol|li|div|strong|em|u|del|span|br|a)\b[^>]*>/i.test(text)) {
    return (
      <div
        className="prose max-w-none text-sm sm:text-base leading-relaxed text-slate-800 font-sans"
        dangerouslySetInnerHTML={{ __html: text }}
      />
    );
  }

  const lines = text.split("\n");

  return (
    <div className="space-y-1 text-sm sm:text-base leading-relaxed text-slate-800 font-sans">
      {lines.map((line, idx) => {
        const trimmed = line.trim();

        // Horizontal Separator (--- or ***)
        if (trimmed === "---" || trimmed === "***" || trimmed === "___") {
          return <hr key={idx} className="my-3 border-t border-gray-200" />;
        }

        // H1 Heading (# Heading)
        if (trimmed.startsWith("# ")) {
          return (
            <h3 key={idx} className="text-base sm:text-xl font-black text-slate-900 mt-4 mb-2 pb-1 border-b border-gray-100 flex items-center gap-2">
              {renderInlineFormatting(trimmed.substring(2))}
            </h3>
          );
        }

        // H2 Heading (## Subheading)
        if (trimmed.startsWith("## ")) {
          return (
            <h4 key={idx} className="text-sm sm:text-lg font-extrabold text-[#774EFC] mt-3 mb-1.5 flex items-center gap-2">
              {renderInlineFormatting(trimmed.substring(3))}
            </h4>
          );
        }

        // H3 Heading (### Subheading Small)
        if (trimmed.startsWith("### ")) {
          return (
            <h5 key={idx} className="text-xs sm:text-base font-bold text-slate-900 mt-2.5 mb-1">
              {renderInlineFormatting(trimmed.substring(4))}
            </h5>
          );
        }

        // Blockquote (> Quote)
        if (trimmed.startsWith("> ")) {
          return (
            <blockquote key={idx} className="border-l-4 border-[#774EFC] pl-3 py-1 bg-purple-50/60 text-slate-800 italic rounded-r-lg my-1.5 text-xs sm:text-sm">
              {renderInlineFormatting(trimmed.substring(2))}
            </blockquote>
          );
        }

        // Numbered List (e.g. "1. Item")
        const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
        if (numMatch) {
          return (
            <div key={idx} className="flex items-start gap-2 my-1 pl-1">
              <span className="text-[#774EFC] font-extrabold text-xs sm:text-sm shrink-0 select-none">{numMatch[1]}.</span>
              <span className="text-slate-800 font-normal leading-relaxed">
                {renderInlineFormatting(numMatch[2])}
              </span>
            </div>
          );
        }

        // Bullet point (•, -, *)
        if (trimmed.startsWith("• ") || trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
          const content = trimmed.substring(2);
          return (
            <div key={idx} className="flex items-start gap-2.5 my-1 pl-1">
              <span className="text-[#774EFC] font-black text-base shrink-0 select-none leading-none pt-0.5">•</span>
              <span className="text-slate-800 font-normal leading-relaxed">
                {renderInlineFormatting(content)}
              </span>
            </div>
          );
        }

        // Empty line gap
        if (trimmed === "") {
          return <div key={idx} className="h-3" />;
        }

        // Standard paragraph line
        return (
          <p key={idx} className="text-slate-800 font-normal leading-relaxed my-1">
            {renderInlineFormatting(line)}
          </p>
        );
      })}
    </div>
  );
}

export default function ProductDetailClient({ product }: ProductDetailClientProps) {
  const [activeImage, setActiveImage] = useState<string>("");

  const handleVariantChange = (variant: any) => {
    if (variant && variant.image && variant.image.trim() !== "") {
      setActiveImage(variant.image);
    } else {
      setActiveImage("");
    }
  };

  return (
    <div className="space-y-8 sm:space-y-12">
      {/* Top Section: Gallery & Product Actions */}
      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-2 lg:gap-14 xl:gap-20">
        {/* Gallery */}
        <div className="w-full">
          <ProductGallery
            image={activeImage || product.thumbnail || product.image}
            thumbnail={product.thumbnail || product.image}
            images={product.images}
            variants={product.variants}
            name={product.name}
            activeVariantImage={activeImage}
          />
        </div>

        {/* Product Title & Purchase Actions */}
        <div className="flex flex-col">
          <h1 className="text-2xl font-bold sm:text-3xl lg:text-4xl text-slate-900 leading-tight">
            {product.name}
          </h1>

          {/* Social Media Share Bar */}
          <ProductShareBar product={product} />

          <ProductDetailActions
            product={product}
            onVariantChange={handleVariantChange}
          />
        </div>
      </div>

      {/* Bottom Section 1: Full-Width Product Description Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-xs space-y-4 font-sans">
        <div className="flex items-center gap-2 border-b border-gray-100 pb-4">
          <FileText className="w-5 h-5 text-[#774EFC]" />
          <h2 className="text-lg sm:text-xl font-bold text-gray-900">
            Deskripsi Produk
          </h2>
        </div>

        {renderFormattedDescription(product.description)}
      </div>

      {/* Bottom Section 2: Full-Width Product Reviews & Rating Card */}
      <ProductReviews product={product} />
    </div>
  );
}
