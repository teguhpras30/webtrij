"use client";

import { useState, useEffect, useRef } from "react";
import {
  X,
  Loader2,
  AlertCircle,
  Upload,
  Trash2,
  Image as ImageIcon,
  Plus,
  RefreshCw,
  Info,
  DollarSign,
  Layers,
  Camera,
  Zap,
  CheckSquare,
  Square,
  Sparkles,
  Check,
  Boxes,
  Video,
  Smile,
  List,
  FileText,
  CornerDownLeft,
  ArrowDown,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Heading1,
  Eye,
  Edit3,
  FileCode,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import RichTextEditor from "./RichTextEditor";

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

interface ProductModalProps {
  categories: any[];
  initialData?: any;
  onClose: () => void;
  onSuccess: (saved: any) => void;
}

interface VariantItem {
  id?: number;
  groupName: string; // e.g. "READY" or "WARNA" or "KOMBINASI"
  name: string;      // e.g. "4 SUSUN - HIJAU OLIVE" or "HIJAU OLIVE"
  price: number | string;
  stock: number | string;
  sku?: string;
  image?: string;
}

function formatRupiahInput(val: number | string): string {
  if (val === "" || val === null || val === undefined || val === 0) return "";
  const numStr = String(val).replace(/\D/g, "");
  if (!numStr) return "";
  return Number(numStr).toLocaleString("id-ID");
}

function parseRupiahInput(val: string): number {
  if (!val) return 0;
  const clean = val.replace(/\D/g, "");
  return clean ? Number(clean) : 0;
}

function parseInitialVariantOptions(initialVariants: any[]) {
  if (!initialVariants || initialVariants.length === 0) {
    return {
      hasGroup1: false,
      group1Name: "WARNA",
      group1Items: [""],
      hasGroup2: false,
      group2Name: "BUBBLE PACKAGE",
      group2Items: [""],
      group2Mode: "addon" as "addon" | "matrix",
    };
  }

  const rawGroupName = initialVariants[0]?.groupName || "WARNA";
  let g1Name = "WARNA";
  let g2Name = "BUBBLE PACKAGE";
  let addOnItems: string[] = [];
  let detectedGroup2Mode: "addon" | "matrix" = "addon";

  if (rawGroupName.includes("::")) {
    detectedGroup2Mode = "addon";
    const [headerPart, metaPart] = rawGroupName.split("::");
    if (headerPart.includes(" | ")) {
      const [p1, p2] = headerPart.split(" | ");
      if (p1 && p1.trim()) g1Name = p1.trim();
      if (p2 && p2.trim()) g2Name = p2.trim();
    } else if (headerPart.trim()) {
      g1Name = headerPart.trim();
    }

    if (metaPart && metaPart.trim()) {
      addOnItems = metaPart.split("|").filter((s: string) => s.trim() !== "");
    }
  } else if (rawGroupName.includes(" | ")) {
    detectedGroup2Mode = "matrix";
    const [p1, p2] = rawGroupName.split(" | ");
    if (p1 && p1.trim()) g1Name = p1.trim();
    if (p2 && p2.trim()) g2Name = p2.trim();
  } else if (rawGroupName.trim()) {
    g1Name = rawGroupName.trim();
  }

  const g1Set = new Set<string>();
  const g2Set = new Set<string>();
  let hasMatrixHyphenNames = false;

  initialVariants.forEach((v) => {
    const rawName = String(v.name || "").trim();
    if (rawName.includes(" - ")) {
      hasMatrixHyphenNames = true;
      const [g1Part, g2Part] = rawName.split(" - ");
      if (g1Part && g1Part.trim()) g1Set.add(g1Part.trim());
      if (g2Part && g2Part.trim()) g2Set.add(g2Part.trim());
    } else {
      if (rawName) g1Set.add(rawName);
    }
  });

  if (rawGroupName.includes("::") || addOnItems.length > 0 || !hasMatrixHyphenNames) {
    detectedGroup2Mode = "addon";
  } else if (rawGroupName.includes(" | ") || hasMatrixHyphenNames) {
    detectedGroup2Mode = "matrix";
  }

  const g1List = Array.from(g1Set);
  const g2List = addOnItems.length > 0 ? addOnItems : Array.from(g2Set);

  return {
    hasGroup1: true,
    group1Name: g1Name,
    group1Items: g1List.length > 0 ? g1List : [""],
    hasGroup2: g2List.length > 0 || g2Set.size > 0,
    group2Name: g2Name,
    group2Items: g2List.length > 0 ? g2List : [""],
    group2Mode: detectedGroup2Mode,
  };
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
    return <span className="text-gray-400 italic">Belum ada deskripsi untuk dipratinjau.</span>;
  }

  // Jika teks mengandung tag HTML (dari Visual Editor), render HTML secara langsung
  if (/<(p|h[1-6]|ul|ol|li|div|strong|em|u|del|span|br|a)\b[^>]*>/i.test(text)) {
    return (
      <div
        className="prose max-w-none text-xs sm:text-sm leading-relaxed text-slate-800 font-sans"
        dangerouslySetInnerHTML={{ __html: text }}
      />
    );
  }

  const lines = text.split("\n");

  return (
    <div className="space-y-1 text-xs sm:text-sm leading-relaxed text-slate-800 font-sans">
      {lines.map((line, idx) => {
        const trimmed = line.trim();

        // Horizontal Separator (--- or ***)
        if (trimmed === "---" || trimmed === "***" || trimmed === "___") {
          return <hr key={idx} className="my-2.5 border-t border-gray-200" />;
        }

        // H1 Heading (# Heading)
        if (trimmed.startsWith("# ")) {
          return (
            <h3 key={idx} className="text-sm sm:text-base font-black text-slate-900 mt-3 mb-1.5 pb-1 border-b border-gray-100 flex items-center gap-2">
              {renderInlineFormatting(trimmed.substring(2))}
            </h3>
          );
        }

        // H2 Heading (## Subheading)
        if (trimmed.startsWith("## ")) {
          return (
            <h4 key={idx} className="text-xs sm:text-sm font-extrabold text-[#774EFC] mt-2.5 mb-1 flex items-center gap-2">
              {renderInlineFormatting(trimmed.substring(3))}
            </h4>
          );
        }

        // H3 Heading (### Subheading Small)
        if (trimmed.startsWith("### ")) {
          return (
            <h5 key={idx} className="text-xs font-bold text-slate-900 mt-2 mb-1">
              {renderInlineFormatting(trimmed.substring(4))}
            </h5>
          );
        }

        // Blockquote (> Quote)
        if (trimmed.startsWith("> ")) {
          return (
            <blockquote key={idx} className="border-l-4 border-[#774EFC] pl-3 py-1 bg-purple-50/60 text-slate-800 italic rounded-r-lg my-1.5 text-xs">
              {renderInlineFormatting(trimmed.substring(2))}
            </blockquote>
          );
        }

        // Numbered List (e.g. "1. Item")
        const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
        if (numMatch) {
          return (
            <div key={idx} className="flex items-start gap-2 my-0.5 pl-1">
              <span className="text-[#774EFC] font-extrabold text-xs shrink-0 select-none">{numMatch[1]}.</span>
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
            <div key={idx} className="flex items-start gap-2 my-0.5 pl-1">
              <span className="text-[#774EFC] font-black text-sm shrink-0 select-none leading-none pt-0.5">•</span>
              <span className="text-slate-800 font-normal leading-relaxed">
                {renderInlineFormatting(content)}
              </span>
            </div>
          );
        }

        // Empty line gap
        if (trimmed === "") {
          return <div key={idx} className="h-2" />;
        }

        // Standard paragraph line
        return (
          <p key={idx} className="text-slate-800 font-normal leading-relaxed my-0.5">
            {renderInlineFormatting(line)}
          </p>
        );
      })}
    </div>
  );
}

export default function ProductModal({ categories, initialData, onClose, onSuccess }: ProductModalProps) {
  const initialOptions = parseInitialVariantOptions(initialData?.variants);

  const [name, setName] = useState(initialData?.name || "");
  const [categoryId, setCategoryId] = useState<string | number>(
    initialData?.categoryId || initialData?.category?.id || (categories.length > 0 ? categories[0].id : "")
  );
  const [description, setDescription] = useState(initialData?.description || "");
  const [descMode, setDescMode] = useState<"visual" | "code" | "preview">("visual");
  const [sold, setSold] = useState(initialData?.sold || "0 Terjual");
  const [weightGram, setWeightGram] = useState<number>(initialData?.weightGram || 1000);
  const [lengthCm, setLengthCm] = useState<number>(initialData?.lengthCm || 20);
  const [widthCm, setWidthCm] = useState<number>(initialData?.widthCm || 20);
  const [heightCm, setHeightCm] = useState<number>(initialData?.heightCm || 20);
  const [retailPrice, setRetailPrice] = useState<number | string>(
    initialData?.retailPrice !== undefined ? initialData.retailPrice : ""
  );
  const [stock, setStock] = useState<number | string>(
    initialData?.stock !== undefined ? initialData.stock : ""
  );
  const [moq, setMoq] = useState<number>(initialData?.moq || initialData?.minOrder || 1);

  // Group 1 & Group 2 Independent ON/OFF Toggles & Names
  const [hasGroup1, setHasGroup1] = useState<boolean>(initialOptions.hasGroup1);
  const [group1Name, setGroup1Name] = useState<string>(initialOptions.group1Name);

  const [hasGroup2, setHasGroup2] = useState<boolean>(initialOptions.hasGroup2);
  const [group2Name, setGroup2Name] = useState<string>(initialOptions.group2Name);
  const [group2Mode, setGroup2Mode] = useState<"addon" | "matrix">(initialOptions.group2Mode || "addon");

  // Simple item lists for Group 1 and Group 2
  const [group1Items, setGroup1Items] = useState<string[]>(initialOptions.group1Items);
  const [group2Items, setGroup2Items] = useState<string[]>(initialOptions.group2Items);

  // Combined Matrix Variants Items (Each combination has its own Price, Stock Quantity & Photo)
  const [variantSortBy, setVariantSortBy] = useState<"group1" | "group2">("group2");
  const [isVariationSectionOpen, setIsVariationSectionOpen] = useState<boolean>(true);
  const [isDescriptionSectionOpen, setIsDescriptionSectionOpen] = useState<boolean>(true);

  const sortVariants = (list: VariantItem[], sortBy: "group1" | "group2") => {
    if (!hasGroup1 || !hasGroup2 || list.length <= 1) return list;

    const validG1 = group1Items.filter((i) => i.trim() !== "").map((i) => i.trim().toLowerCase());
    const validG2 = group2Items.filter((i) => i.trim() !== "").map((i) => i.trim().toLowerCase());

    return [...list].sort((a, b) => {
      const partsA = a.name.split(" - ");
      const partsB = b.name.split(" - ");
      const g1A = (partsA[0] || "").trim().toLowerCase();
      const g2A = (partsA[1] || partsA[0] || "").trim().toLowerCase();
      const g1B = (partsB[0] || "").trim().toLowerCase();
      const g2B = (partsB[1] || partsB[0] || "").trim().toLowerCase();

      if (sortBy === "group2") {
        const idxG2A = validG2.indexOf(g2A);
        const idxG2B = validG2.indexOf(g2B);
        if (idxG2A !== idxG2B) {
          if (idxG2A !== -1 && idxG2B !== -1) return idxG2A - idxG2B;
          if (idxG2A !== -1) return -1;
          if (idxG2B !== -1) return 1;
          return g2A.localeCompare(g2B);
        }
        const idxG1A = validG1.indexOf(g1A);
        const idxG1B = validG1.indexOf(g1B);
        if (idxG1A !== -1 && idxG1B !== -1) return idxG1A - idxG1B;
        return g1A.localeCompare(g1B);
      } else {
        const idxG1A = validG1.indexOf(g1A);
        const idxG1B = validG1.indexOf(g1B);
        if (idxG1A !== idxG1B) {
          if (idxG1A !== -1 && idxG1B !== -1) return idxG1A - idxG1B;
          if (idxG1A !== -1) return -1;
          if (idxG1B !== -1) return 1;
          return g1A.localeCompare(g1B);
        }
        const idxG2A = validG2.indexOf(g2A);
        const idxG2B = validG2.indexOf(g2B);
        if (idxG2A !== -1 && idxG2B !== -1) return idxG2A - idxG2B;
        return g2A.localeCompare(g2B);
      }
    });
  };

  const handleSortChange = (newSort: "group1" | "group2") => {
    setVariantSortBy(newSort);
    setVariants((prev) => sortVariants(prev, newSort));
  };

  const [hasVariants, setHasVariants] = useState<boolean>(
    initialData?.variants && initialData.variants.length > 0 ? true : false
  );

  const [variants, setVariants] = useState<VariantItem[]>(() => {
    if (initialData?.variants && initialData.variants.length > 0) {
      return initialData.variants.map((v: any) => ({
        id: v.id,
        groupName: v.groupName || "WARNA",
        name: v.name || "",
        price: v.price || 0,
        stock: v.stock !== undefined ? v.stock : 100,
        sku: v.sku || "",
        image: v.image || "",
      }));
    }
    return [];
  });

  const [bulkPriceInput, setBulkPriceInput] = useState<string>("");
  const [bulkStockInput, setBulkStockInput] = useState<string>("");

  const applyBulkPrice = () => {
    if (!bulkPriceInput) return;
    const priceVal = parseRupiahInput(bulkPriceInput);
    setVariants((prev) =>
      prev.map((v) => ({
        ...v,
        price: priceVal,
      }))
    );
  };

  const applyBulkStock = () => {
    if (bulkStockInput === "") return;
    const stockVal = Number(bulkStockInput) || 0;
    setVariants((prev) =>
      prev.map((v) => ({
        ...v,
        stock: stockVal,
      }))
    );
  };

  const [uploadingVariantIdx, setUploadingVariantIdx] = useState<number | null>(null);

  // Image upload states
  const [thumbnail, setThumbnail] = useState<string>(initialData?.thumbnail || "");
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);

  const [galleryImages, setGalleryImages] = useState<string[]>(
    initialData?.images
      ? initialData.images.map((img: any) => (typeof img === "string" ? img : img.image))
      : []
  );
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<{
    current: number;
    total: number;
    percent: number;
    fileName: string;
    title: string;
  } | null>(null);

  const handleThumbnailChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      setError(`Ukuran file '${file.name}' melebihi batas 15MB.`);
      if (thumbnailInputRef.current) thumbnailInputRef.current.value = "";
      return;
    }

    setUploadingThumbnail(true);
    setError("");
    setUploadStatus({
      current: 1,
      total: 1,
      percent: 50,
      fileName: file.name,
      title: "Mengunggah & Mengompres Gambar Utama",
    });

    try {
      const url = await uploadFile(file);
      setThumbnail(url);
      setUploadStatus({
        current: 1,
        total: 1,
        percent: 100,
        fileName: file.name,
        title: "Selesai Mengunggah Gambar Utama! ✨",
      });
      setTimeout(() => setUploadStatus(null), 2000);
    } catch (err: any) {
      setError(err.message || "Gagal mengunggah thumbnail.");
      setUploadStatus(null);
    } finally {
      setUploadingThumbnail(false);
      if (thumbnailInputRef.current) thumbnailInputRef.current.value = "";
    }
  };

  const handleGalleryChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const oversizedFiles = files.filter((f) => f.size > 50 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      setError(`Beberapa file melebihi batas 50MB.`);
      if (galleryInputRef.current) galleryInputRef.current.value = "";
      return;
    }

    setUploadingGallery(true);
    setError("");

    try {
      const totalFiles = files.length;
      const uploadedUrls: string[] = [];
      let count = 0;

      for (const file of files) {
        count++;
        const percent = Math.round((count / totalFiles) * 100);
        setUploadStatus({
          current: count,
          total: totalFiles,
          percent,
          fileName: file.name,
          title: `Mengunggah Media Galeri (${count}/${totalFiles})`,
        });
        const url = await uploadFile(file);
        uploadedUrls.push(url);
      }
      setGalleryImages((prev) => [...prev, ...uploadedUrls]);
      setUploadStatus({
        current: totalFiles,
        total: totalFiles,
        percent: 100,
        fileName: `${totalFiles} File Media Selesai!`,
        title: "Seluruh Media Galeri Berhasil Diunggah! ✨",
      });
      setTimeout(() => setUploadStatus(null), 2000);
    } catch (err: any) {
      setError(err.message || "Gagal mengunggah beberapa gambar galeri.");
      setUploadStatus(null);
    } finally {
      setUploadingGallery(false);
      if (galleryInputRef.current) galleryInputRef.current.value = "";
    }
  };

  const handleVariantImageChange = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      setError(`Ukuran file foto variasi melebihi 15MB.`);
      return;
    }

    setUploadingVariantIdx(index);
    setError("");
    const varName = variants[index]?.name || `Variasi Baris ${index + 1}`;
    setUploadStatus({
      current: 1,
      total: 1,
      percent: 50,
      fileName: file.name,
      title: `Mengunggah Foto ${varName}`,
    });

    try {
      const url = await uploadFile(file);
      updateVariantRow(index, "image", url);
      setUploadStatus({
        current: 1,
        total: 1,
        percent: 100,
        fileName: file.name,
        title: `Foto ${varName} Berhasil Diunggah! ✨`,
      });
      setTimeout(() => setUploadStatus(null), 2000);
    } catch (err: any) {
      setError(err.message || "Gagal mengunggah foto variasi.");
      setUploadStatus(null);
    } finally {
      setUploadingVariantIdx(null);
    }
  };

  const [isPopular, setIsPopular] = useState(initialData?.isPopular || false);
  const [isDeal, setIsDeal] = useState(initialData?.isDeal || false);
  const [isBuyerOnly, setIsBuyerOnly] = useState(initialData?.isBuyerOnly || false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const descTextareaRef = useRef<HTMLTextAreaElement>(null);
  const variantInputRefs = useRef<{ [key: number]: HTMLInputElement | null }>({});

  const POPULAR_EMOJIS = [
    "✅", "⭐", "📦", "🚚", "🛡️", "🔥", "💎", "🏷️", "📌", "💡", 
    "🌟", "🛒", "📏", "⚡", "🎁", "💖", "👍", "💯", "🎉", "📍", 
    "✨", "💥", "🌿", "🌸", "🏆", "💬", "🔑", "🔒", "➡️", "✔️"
  ];

  const handleInsertEmoji = (emoji: string) => {
    if (descMode === "preview") setDescMode("visual");
    if (!descTextareaRef.current || descMode === "visual") {
      setDescription((prev: string) => prev + emoji);
      return;
    }

    const el = descTextareaRef.current;
    const start = el.selectionStart || description.length;
    const end = el.selectionEnd || description.length;
    const newText = description.substring(0, start) + emoji + description.substring(end);

    setDescription(newText);

    setTimeout(() => {
      if (descTextareaRef.current) {
        descTextareaRef.current.focus();
        descTextareaRef.current.setSelectionRange(start + emoji.length, start + emoji.length);
      }
    }, 10);
  };

  const handleInsertBullet = () => {
    if (descMode === "preview") setDescMode("visual");
    if (!descTextareaRef.current || descMode === "visual") {
      setDescription((prev: string) => (prev ? prev + "\n• " : "• "));
      return;
    }
    const el = descTextareaRef.current;
    const start = el.selectionStart || description.length;
    const end = el.selectionEnd || description.length;
    const prefix = start === 0 || description[start - 1] === "\n" ? "" : "\n";
    const bulletStr = `${prefix}• `;
    const newText = description.substring(0, start) + bulletStr + description.substring(end);
    setDescription(newText);

    setTimeout(() => {
      if (descTextareaRef.current) {
        descTextareaRef.current.focus();
        descTextareaRef.current.setSelectionRange(start + bulletStr.length, start + bulletStr.length);
      }
    }, 10);
  };

  const handleWrapText = (openTag: string, closeTag: string, defaultText: string = "teks") => {
    if (descMode === "preview") setDescMode("code");
    if (!descTextareaRef.current || descMode === "visual") {
      setDescription((prev: string) => prev + `${openTag}${defaultText}${closeTag}`);
      return;
    }
    const el = descTextareaRef.current;
    const start = el.selectionStart;
    const end = el.selectionEnd;

    const selectedText = description.substring(start, end) || defaultText;
    const wrappedStr = `${openTag}${selectedText}${closeTag}`;
    const newText = description.substring(0, start) + wrappedStr + description.substring(end);
    
    setDescription(newText);

    setTimeout(() => {
      if (descTextareaRef.current) {
        descTextareaRef.current.focus();
        descTextareaRef.current.setSelectionRange(start + openTag.length, start + openTag.length + selectedText.length);
      }
    }, 10);
  };

  const handleInsertParagraph = () => {
    if (descMode === "preview") setDescMode("visual");
    if (!descTextareaRef.current || descMode === "visual") {
      setDescription((prev: string) => prev + "\n\n");
      return;
    }
    const el = descTextareaRef.current;
    const start = el.selectionStart || description.length;
    const end = el.selectionEnd || description.length;
    const newText = description.substring(0, start) + "\n\n" + description.substring(end);
    setDescription(newText);

    setTimeout(() => {
      if (descTextareaRef.current) {
        descTextareaRef.current.focus();
        descTextareaRef.current.setSelectionRange(start + 2, start + 2);
      }
    }, 10);
  };

  const handleInsertTemplate = () => {
    const templateText = `# ✨ KEUNGGULAN PRODUK
• Bahan tebal, kokoh, elastis & tahan lama
• Desain modern minimalis & hemat tempat
• Anti rayap, anti jamur & mudah dibersihkan

## 📏 SPESIFIKASI PRODUK
• Dimensi: 40 x 35 x 120 cm
• Berat: 3.5 kg
• Material: PP (Polypropylene) Premium Grade A

## 📦 ISI KEMASAN
• 1x Unit Produk Perabotan
• 1x Buku Panduan Pemasangan Presisi

## 🛡️ GARANSI & PELAYANAN
• Garansi 100% Tukar Baru jika barang rusak saat pengiriman
• Packing ekstra aman berlapis kardus tebal & bubble wrap`;

    if (!description || !description.trim()) {
      setDescription(templateText);
    } else {
      setDescription((prev: string) => prev + "\n\n" + templateText);
    }
  };

  useEffect(() => {
    if (!categoryId && categories.length > 0) {
      setCategoryId(initialData?.categoryId || initialData?.category?.id || categories[0].id);
    }
  }, [categories, categoryId, initialData]);

  // Keep total product stock synchronized with variant stock sum if variants exist
  useEffect(() => {
    if (hasVariants && variants.length > 0) {
      const totalVariantStock = variants.reduce((sum, v) => sum + (Number(v.stock) || 0), 0);
      setStock(totalVariantStock);
    }
  }, [variants, hasVariants]);



  // Upload file helper (diberi opsi productName untuk penamaan SEO gambar)
  const uploadFile = async (file: File, customTitle?: string): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    if (customTitle || name) {
      formData.append("productName", customTitle || name);
    }

    const res = await fetch("/api/admin/upload", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Gagal mengunggah file gambar.");
    }
    return data.url;
  };

  const removeGalleryImage = (indexToRemove: number) => {
    setGalleryImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  // Apply Base Price (Harga Dasar) to All Variants
  const handleApplyBasePriceToAllVariants = () => {
    if (variants.length === 0) return;
    const basePriceVal = Number(retailPrice) > 0 ? Number(retailPrice) : 0;
    if (basePriceVal === 0) {
      setError("Silakan isi Harga Dasar produk terlebih dahulu.");
      return;
    }
    setVariants((prev) =>
      prev.map((v) => ({
        ...v,
        price: basePriceVal,
      }))
    );
    setError("");
  };

  // Apply Base Stock (Stok Dasar) to All Variants  
  const handleApplyBaseStockToAllVariants = () => {
    if (variants.length === 0) return;
    const baseStockVal = stock !== "" && stock !== undefined && stock !== null ? Number(stock) : 0;
    setVariants((prev) =>
      prev.map((v) => ({
        ...v,
        stock: baseStockVal,
      }))
    );
  };

  // Apply First Image to All Variants
  const applyBulkImage = () => {
    if (variants.length === 0) return;
    const firstImage = variants.find((v) => v.image && v.image.trim())?.image || "";
    if (!firstImage) {
      setError("Silakan unggah minimal 1 foto pada salah satu variasi terlebih dahulu.");
      return;
    }
    setVariants((prev) =>
      prev.map((v) => ({
        ...v,
        image: firstImage,
      }))
    );
    setError("");
  };

  // Copy current variant row data to the row below it
  const copyRowDown = (idx: number) => {
    if (idx >= variants.length - 1) return;
    const current = variants[idx];
    setVariants((prev) => {
      const next = [...prev];
      next[idx + 1] = {
        ...next[idx + 1],
        price: current.price,
        stock: current.stock,
        image: current.image || next[idx + 1].image,
      };
      return next;
    });
  };

  // Add preset color chip to Group 2 items
  const handleAddPresetColor = (colorName: string) => {
    const next = [...group2Items];
    if (next.length > 0 && !next[next.length - 1].trim()) {
      next[next.length - 1] = colorName;
    } else if (!next.map((s) => s.toLowerCase().trim()).includes(colorName.toLowerCase().trim())) {
      next.push(colorName);
    }
    setGroup2Items(next);
  };

  // Generate Matrix Combination Helper (Menjaga foto, harga, dan stok variasi tetap utuh walaupun nama opsi variasi diedit)
  const handleGenerateMatrix = () => {
    const validGroup1 = hasGroup1 ? group1Items.filter((i) => i.trim() !== "") : [];
    const validGroup2 = hasGroup2 ? group2Items.filter((i) => i.trim() !== "") : [];

    if (validGroup1.length === 0 && validGroup2.length === 0) {
      setError("Silakan aktifkan dan isi minimal 1 opsi pada Variasi 1 atau Variasi 2.");
      return;
    }

    const numericPrice = Number(retailPrice) > 0 ? Number(retailPrice) : 0;
    const combinations: VariantItem[] = [];
    let idxCounter = 0;

    const findExistingVariant = (comboName: string, index: number) => {
      // 1. Pencocokan nama persis
      const exact = variants.find(
        (v) => v.name.trim().toLowerCase() === comboName.trim().toLowerCase()
      );
      if (exact) return exact;

      // 2. Fallback berdasarkan urutan baris/indeks jika teks nama opsi diedit (misal BIRU menjadi BIRU 1)
      if (variants[index]) {
        return variants[index];
      }

      return null;
    };

    if (validGroup1.length > 0 && validGroup2.length > 0) {
      if (group2Mode === "matrix") {
        const fullGroupName = `${group1Name || "WARNA"} | ${group2Name || "UKURAN"}`;

        validGroup1.forEach((g1) => {
          validGroup2.forEach((g2) => {
            const g2Clean = g2.split(":+")[0].trim();
            const comboName = `${g1.trim()} - ${g2Clean}`;
            const existing = findExistingVariant(comboName, idxCounter);

            if (existing) {
              combinations.push({
                id: existing.id,
                groupName: fullGroupName,
                name: comboName,
                price: existing.price !== undefined && existing.price !== "" ? existing.price : numericPrice,
                stock: existing.stock !== undefined ? existing.stock : "",
                sku: existing.sku || "",
                image: existing.image || "",
              });
            } else {
              combinations.push({
                groupName: fullGroupName,
                name: comboName,
                price: numericPrice,
                stock: "",
                sku: "",
                image: "",
              });
            }
            idxCounter++;
          });
        });
      } else {
        const addOnMeta = validGroup2
          .map((g2) => {
            const parts = g2.split(":+");
            const optName = parts[0]?.trim() || "";
            const extraVal = parts[1] !== undefined ? Number(parts[1]) || 0 : 0;
            return `${optName}:+${extraVal}`;
          })
          .join("|");

        const fullGroupName = `${group1Name || "WARNA"} | ${group2Name || "BUBBLE PACKAGE"}::${addOnMeta}`;

        validGroup1.forEach((g1) => {
          const comboName = g1.trim();
          const existing = findExistingVariant(comboName, idxCounter);

          if (existing) {
            combinations.push({
              id: existing.id,
              groupName: fullGroupName,
              name: comboName,
              price: existing.price !== undefined && existing.price !== "" ? existing.price : numericPrice,
              stock: existing.stock !== undefined ? existing.stock : "",
              sku: existing.sku || "",
              image: existing.image || "",
            });
          } else {
            combinations.push({
              groupName: fullGroupName,
              name: comboName,
              price: numericPrice,
              stock: "",
              sku: "",
              image: "",
            });
          }
          idxCounter++;
        });
      }
    } else if (validGroup1.length > 0) {
      // Group 1 ON, Group 2 OFF
      validGroup1.forEach((g1) => {
        const comboName = g1.trim();
        const existing = findExistingVariant(comboName, idxCounter);

        if (existing) {
          combinations.push({
            id: existing.id,
            groupName: group1Name || "WARNA",
            name: comboName,
            price: existing.price !== undefined && existing.price !== "" ? existing.price : numericPrice,
            stock: existing.stock !== undefined ? existing.stock : "",
            sku: existing.sku || "",
            image: existing.image || "",
          });
        } else {
          combinations.push({
            groupName: group1Name || "WARNA",
            name: comboName,
            price: numericPrice,
            stock: "",
            sku: "",
            image: "",
          });
        }
        idxCounter++;
      });
    } else {
      // Group 2 ON, Group 1 OFF
      validGroup2.forEach((g2) => {
        const comboName = g2.trim();
        const existing = findExistingVariant(comboName, idxCounter);

        if (existing) {
          combinations.push({
            id: existing.id,
            groupName: group2Name || "UKURAN",
            name: comboName,
            price: existing.price !== undefined && existing.price !== "" ? existing.price : numericPrice,
            stock: existing.stock !== undefined ? existing.stock : "",
            sku: existing.sku || "",
            image: existing.image || "",
          });
        } else {
          combinations.push({
            groupName: group2Name || "UKURAN",
            name: comboName,
            price: numericPrice,
            stock: "",
            sku: "",
            image: "",
          });
        }
        idxCounter++;
      });
    }

    setVariants(combinations);
    setHasVariants(true);
    setError("");
  };

  const addVariantRow = () => {
    const numericPrice = Number(retailPrice) > 0 ? Number(retailPrice) : (variants[0]?.price ? Number(variants[0].price) : 0);
    setVariants([
      ...variants,
      {
        groupName: group1Name || "WARNA",
        name: `KOMBINASI BARU ${variants.length + 1}`,
        price: numericPrice,
        stock: "",
        image: "",
      },
    ]);
  };

  const updateVariantRow = (index: number, field: keyof VariantItem, value: any) => {
    const next = [...variants];
    next[index] = { ...next[index], [field]: value };
    setVariants(next);
  };

  const removeGroup1Option = (idx: number) => {
    const removedItem = group1Items[idx];
    const nextG1 = group1Items.filter((_, i) => i !== idx);
    setGroup1Items(nextG1.length > 0 ? nextG1 : [""]);

    if (removedItem && removedItem.trim() && variants.length > 0) {
      setVariants((prev) =>
        prev.filter((v) => {
          const parts = v.name.split(" - ");
          return parts[0]?.trim().toLowerCase() !== removedItem.trim().toLowerCase();
        })
      );
    }
  };

  const removeGroup2Option = (idx: number) => {
    const nextG2 = group2Items.filter((_, i) => i !== idx);
    setGroup2Items(nextG2.length > 0 ? nextG2 : [""]);
  };

  const removeVariantRow = (index: number) => {
    const nextVariants = variants.filter((_, i) => i !== index);
    setVariants(nextVariants);

    if (nextVariants.length === 0) {
      setGroup1Items([""]);
      setHasVariants(false);
      return;
    }

    // Auto sync Group 1 options list with remaining variant cards
    if (hasGroup1 && group1Items.length > 0) {
      const remainingG1 = group1Items.filter((g1Item) => {
        if (!g1Item.trim()) return false;
        return nextVariants.some((v) => v.name.trim().toLowerCase() === g1Item.trim().toLowerCase());
      });
      if (remainingG1.length !== group1Items.length) {
        setGroup1Items(remainingG1.length > 0 ? remainingG1 : [""]);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!categoryId) {
      setError("Silakan pilih kategori terlebih dahulu.");
      setLoading(false);
      return;
    }

    if (!thumbnail) {
      setError("Gambar Utama (Thumbnail) wajib diunggah.");
      setLoading(false);
      return;
    }

    try {
      const isEditMode = Boolean(initialData && initialData.id && !isNaN(Number(initialData.id)));
      const url = isEditMode ? `/api/admin/products/${initialData.id}` : "/api/admin/products";
      const method = isEditMode ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          categoryId: Number(categoryId),
          description,
          sold,
          retailPrice: Number(retailPrice) > 0
            ? Number(retailPrice)
            : (hasGroup1 && variants.length > 0 ? Number(variants[0]?.price) || 0 : 0),
          stock: stock !== "" && stock !== undefined && stock !== null
            ? Number(stock)
            : (hasGroup1 && variants.length > 0 ? variants.reduce((acc, v) => acc + (Number(v.stock) || 0), 0) : 0),
          moq: Math.max(1, Number(moq) || 1),
          weightGram: Number(weightGram),
          lengthCm: Number(lengthCm),
          widthCm: Number(widthCm),
          heightCm: Number(heightCm),
          thumbnail,
          images: galleryImages,
          isPopular: isBuyerOnly ? false : isPopular,
          isDeal: isBuyerOnly ? false : isDeal,
          isBuyerOnly,
          variants: (() => {
            const validGroup2 = group2Items.filter((i: string) => i.trim() !== "");
            const addOnMeta = (hasGroup2 && group2Mode === "addon")
              ? validGroup2
                  .map((g2: string) => {
                    const parts = g2.split(":+");
                    const optName = parts[0]?.trim() || "";
                    const extraVal = parts[1] !== undefined ? Number(parts[1]) || 0 : 0;
                    return `${optName}:+${extraVal}`;
                  })
                  .join("|")
              : "";

            if (hasGroup1 && variants.length > 0) {
              const constructedGroupName = (hasGroup2 && group2Mode === "addon" && addOnMeta)
                ? `${group1Name.trim() || "WARNA"} | ${group2Name.trim() || "BUBBLE PACKAGE"}::${addOnMeta}`
                : (hasGroup1 && hasGroup2
                  ? `${group1Name.trim() || "WARNA"} | ${group2Name.trim() || "UKURAN"}`
                  : (group1Name.trim() || "WARNA"));

              return variants.map((v) => ({
                ...v,
                groupName: constructedGroupName,
                price: Number(v.price) || 0,
                stock: Number(v.stock) || 0,
              }));
            } else if (hasGroup2 && addOnMeta) {
              const constructedGroupName = `PRODUK | ${group2Name.trim() || "BUBBLE PACKAGE"}::${addOnMeta}`;
              return [
                {
                  name: "PRODUK",
                  price: Number(retailPrice) || 0,
                  stock: stock !== "" && stock !== undefined && stock !== null ? Number(stock) : 100,
                  groupName: constructedGroupName,
                },
              ];
            }
            return [];
          })(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menyimpan produk.");

      onSuccess(data);
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan saat menyimpan produk.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto font-sans">
      <div className="bg-white border border-gray-200 rounded-3xl w-full max-w-3xl p-6 relative shadow-2xl my-8 max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-5 right-5 text-gray-400 hover:text-gray-700 cursor-pointer transition">
          <X className="w-5 h-5" />
        </button>

        <div className="mb-4">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-red-600" />
            <span>{initialData && initialData.id ? "Edit Produk" : "Input Produk Baru"}</span>
          </h2>
          <div className="mt-2 text-xs text-amber-800 bg-amber-50 border border-amber-200 px-3.5 py-2.5 rounded-xl flex items-center gap-2 font-semibold shadow-xs">
            <Info className="w-4 h-4 shrink-0 text-amber-600" />
            <span>Ketentuan Gambar Produk & Variasi: <strong>Rasio 1:1 (Persegi)</strong> • Max <strong>1MB</strong> per Gambar</span>
          </div>
        </div>



        {error && (
          <div className="mb-4 text-xs text-red-600 bg-red-50 p-3 rounded-xl border border-red-200 flex items-center gap-2 font-medium">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 mb-1 font-semibold">Nama Produk *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: Lemari Lipat Bow-Bow 4 Susun"
                className="w-full bg-gray-50 border border-gray-200 focus:bg-white rounded-xl px-3 py-2.5 text-gray-900 focus:outline-none focus:border-red-500"
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-1 font-semibold">Kategori *</label>
              <select
                required
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 focus:bg-white rounded-xl px-3 py-2.5 text-gray-900 focus:outline-none focus:border-red-500 font-semibold cursor-pointer"
              >
                <option value="" disabled>
                  -- Pilih Kategori Produk --
                </option>
                {categories.map((c: any) => (
                  <option key={c.id} value={c.id}>
                    📁 {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Pengaturan Variasi Produk (Standard Clean UI Style) */}
          <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-4">
            <div
              className="flex items-center justify-between border-b border-gray-200 pb-2 cursor-pointer select-none"
              onClick={() => setIsVariationSectionOpen(!isVariationSectionOpen)}
            >
              <div className="flex items-center gap-2 font-semibold text-gray-900 text-xs">
                <Layers className="w-4 h-4 text-gray-600" />
                <span>Pengaturan Variasi Produk</span>
                {!isVariationSectionOpen && variants.length > 0 && (
                  <span className="text-[10px] text-purple-700 font-bold bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                    ({variants.length} Variasi)
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsVariationSectionOpen(!isVariationSectionOpen);
                }}
                className="p-1 text-gray-500 hover:text-gray-900 hover:bg-gray-200/80 rounded-lg transition cursor-pointer flex items-center gap-1 text-xs font-semibold"
                title={isVariationSectionOpen ? "Sembunyikan Pengaturan Variasi" : "Tampilkan Pengaturan Variasi"}
              >
                <span className="text-[11px] font-bold text-gray-600">
                  {isVariationSectionOpen ? "Sembunyikan" : "Tampilkan"}
                </span>
                {isVariationSectionOpen ? (
                  <ChevronUp className="w-4 h-4 text-gray-700" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-700" />
                )}
              </button>
            </div>

            {isVariationSectionOpen && (
              <div className="space-y-4">
                {/* Inputs for Variasi 1 and Variasi 2 with ON/OFF Toggle Switches & Text Box Names */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* VARIASI 1 */}
                  <div className={`p-3.5 rounded-xl border transition-all ${hasGroup1 ? "bg-white border-gray-200 shadow-xs" : "bg-gray-100/70 border-gray-200 opacity-60"
                    }`}>
                    <div className="flex items-center justify-between border-b border-gray-100 pb-2 mb-3">
                      <div className="flex items-center gap-2.5">
                        {/* Modern Toggle Switch UI (Variasi 1) */}
                        <label className="relative inline-flex items-center cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={hasGroup1}
                            onChange={(e) => {
                              const val = e.target.checked;
                              setHasGroup1(val);
                              if (!val) {
                                setHasGroup2(false);
                              }
                            }}
                            className="sr-only peer"
                          />
                          <div className="w-9 h-5 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-red-500"></div>
                        </label>
                        <span className="font-semibold text-xs text-gray-900 shrink-0">
                          Variasi 1
                        </span>
                      </div>
                    </div>

                    {hasGroup1 && (
                      <div className="space-y-3">
                        {/* Text Box Nama Variasi 1 */}
                        <div>
                          <label className="block text-gray-700 mb-1 font-semibold text-xs">Nama Variasi 1 *</label>
                          <input
                            type="text"
                            value={group1Name}
                            onChange={(e) => setGroup1Name(e.target.value)}
                            placeholder="Contoh: Susun / Ukuran / Ready Stock"
                            className="w-full bg-gray-50 border border-gray-200 focus:bg-white rounded-xl px-3 py-2 text-gray-900 focus:outline-none focus:border-red-500 font-semibold text-xs"
                          />
                        </div>

                        <div className="space-y-2 pt-1">
                          <label className="block text-gray-700 font-semibold text-xs">Daftar Opsi {group1Name || "Variasi 1"}:</label>
                          {group1Items.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-1.5 w-full">
                              <input
                                type="text"
                                value={item}
                                onChange={(e) => {
                                  const next = [...group1Items];
                                  next[idx] = e.target.value;
                                  setGroup1Items(next);
                                }}
                                placeholder="e.g. 4 SUSUN"
                                className="flex-1 min-w-0 bg-gray-50 border border-gray-200 focus:bg-white rounded-lg px-2.5 py-1.5 text-gray-900 focus:outline-none focus:border-red-500 font-semibold text-xs"
                              />
                              <button
                                type="button"
                                onClick={() => removeGroup1Option(idx)}
                                className="p-1 text-red-500 hover:bg-red-50 rounded-lg cursor-pointer transition shrink-0"
                                title="Hapus Opsi Ini"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={() => setGroup1Items([...group1Items, ""])}
                            className="w-full py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold text-xs rounded-xl border border-dashed border-gray-300 flex items-center justify-center gap-1.5 transition cursor-pointer mt-2"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Tambah Opsi {group1Name || "Variasi 1"}</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* VARIASI 2 */}
                  <div className={`p-3.5 rounded-xl border transition-all ${hasGroup2 ? "bg-white border-gray-200 shadow-xs" : "bg-gray-100/70 border-gray-200 opacity-60"
                    }`}>
                    <div className="flex items-center justify-between border-b border-gray-100 pb-2 mb-3">
                      <div className="flex items-center gap-2.5">
                        {/* Modern Toggle Switch UI (Variasi 2) */}
                        <label className="relative inline-flex items-center cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={hasGroup2}
                            disabled={!hasGroup1}
                            onChange={(e) => setHasGroup2(e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-9 h-5 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-red-500 peer-disabled:opacity-50"></div>
                        </label>
                        <span className="font-semibold text-xs text-gray-900 shrink-0">
                          Variasi 2
                        </span>
                      </div>
                    </div>

                    {hasGroup2 && (
                      <div className="space-y-3">
                        {/* Mode Switcher for Variasi 2 */}
                        <div className="bg-purple-50/70 p-2.5 rounded-xl border border-purple-200 space-y-1.5">
                          <label className="block text-[11px] font-extrabold text-purple-900">
                            Pilih Sifat & Tipe Variasi 2:
                          </label>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <button
                              type="button"
                              onClick={() => setGroup2Mode("addon")}
                              className={`p-2 rounded-xl text-left border transition cursor-pointer flex flex-col justify-between ${
                                group2Mode === "addon"
                                  ? "bg-[#774EFC] text-white border-purple-600 shadow-xs font-bold"
                                  : "bg-white text-gray-700 border-gray-200 hover:bg-purple-50/50"
                              }`}
                            >
                              <span className="font-extrabold text-xs">📦 Opsi Paket / Add-On</span>
                              <span className={`text-[10px] mt-0.5 leading-tight ${group2Mode === "addon" ? "text-purple-100" : "text-gray-500"}`}>
                                Stok bersama Variasi 1 + Biaya paket tambahan (+Rp)
                              </span>
                            </button>

                            <button
                              type="button"
                              onClick={() => setGroup2Mode("matrix")}
                              className={`p-2 rounded-xl text-left border transition cursor-pointer flex flex-col justify-between ${
                                group2Mode === "matrix"
                                  ? "bg-[#774EFC] text-white border-purple-600 shadow-xs font-bold"
                                  : "bg-white text-gray-700 border-gray-200 hover:bg-purple-50/50"
                              }`}
                            >
                              <span className="font-extrabold text-xs">📊 Matriks Stok Terpisah</span>
                              <span className={`text-[10px] mt-0.5 leading-tight ${group2Mode === "matrix" ? "text-purple-100" : "text-gray-500"}`}>
                                Setiap kombinasi (Varian 1 x Varian 2) punya stok sendiri
                              </span>
                            </button>
                          </div>
                        </div>

                        {/* Text Box Nama Variasi 2 */}
                        <div>
                          <label className="block text-gray-700 mb-1 font-semibold text-xs">Nama Variasi 2 *</label>
                          <input
                            type="text"
                            value={group2Name}
                            onChange={(e) => setGroup2Name(e.target.value)}
                            placeholder={group2Mode === "addon" ? "Contoh: BUBBLE PACKAGE / GARANSI" : "Contoh: UKURAN / TIPE"}
                            className="w-full bg-gray-50 border border-gray-200 focus:bg-white rounded-xl px-3 py-2 text-gray-900 focus:outline-none focus:border-red-500 font-semibold text-xs"
                          />
                        </div>

                        <div className="space-y-2 pt-1">
                          <label className="block text-gray-700 font-semibold text-xs flex items-center justify-between">
                            <span>
                              Daftar Opsi {group2Name || "Variasi 2"}
                              {group2Mode === "addon" ? " (Opsi Layanan/Kemasan):" : " (Pilihan Kombinasi):"}
                            </span>
                            {group2Mode === "addon" && (
                              <span className="text-[10px] text-purple-600 font-bold">Biaya Tambahan (Rp)</span>
                            )}
                          </label>
                          {group2Items.map((item, idx) => {
                            const parts = item.split(":+");
                            const optName = parts[0] || "";
                            const extraVal = parts[1] !== undefined ? parts[1] : "";

                            return (
                              <div key={idx} className="flex items-center gap-1.5 w-full">
                                <input
                                  type="text"
                                  value={optName}
                                  onChange={(e) => {
                                    const next = [...group2Items];
                                    const newName = e.target.value;
                                    next[idx] = (group2Mode === "addon" && extraVal !== "") ? `${newName}:+${extraVal}` : newName;
                                    setGroup2Items(next);
                                  }}
                                  placeholder={group2Mode === "addon" ? "Nama Opsi (e.g. BUBBLE LUAR)" : "Nama Opsi (e.g. S / M / L)"}
                                  className="flex-1 min-w-0 bg-gray-50 border border-gray-200 focus:bg-white rounded-lg px-2.5 py-1.5 text-gray-900 focus:outline-none focus:border-purple-500 font-semibold text-xs"
                                />
                                {group2Mode === "addon" && (
                                  <div className="relative w-24 sm:w-28 shrink-0">
                                    <span className="absolute left-2 top-1.5 text-[10px] text-gray-400 font-bold">+Rp</span>
                                    <input
                                      type="text"
                                      placeholder="0"
                                      value={formatRupiahInput(extraVal)}
                                      onChange={(e) => {
                                        const next = [...group2Items];
                                        const cleanVal = parseRupiahInput(e.target.value);
                                        next[idx] = `${optName}:+${cleanVal}`;
                                        setGroup2Items(next);
                                      }}
                                      className="w-full pl-8 pr-1.5 py-1.5 bg-gray-50 border border-gray-200 focus:bg-white rounded-lg text-xs font-bold text-purple-700 focus:outline-none focus:border-purple-500"
                                    />
                                  </div>
                                )}
                                <button
                                  type="button"
                                  onClick={() => removeGroup2Option(idx)}
                                  className="p-1 text-red-500 hover:bg-red-50 rounded-lg cursor-pointer transition shrink-0"
                                  title="Hapus Opsi Ini"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            );
                          })}
                          <button
                            type="button"
                            onClick={() => setGroup2Items([...group2Items, ""])}
                            className="w-full py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold text-xs rounded-xl border border-dashed border-gray-300 flex items-center justify-center gap-1.5 transition cursor-pointer mt-2"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Tambah Opsi {group2Name || "Variasi 2"}</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Generate Combinations Matrix Button Banner */}
                <div className="flex flex-wrap items-center justify-between gap-2 bg-white p-3 rounded-xl border border-gray-200 shadow-xs">
                  {hasGroup1 && hasGroup2 && group2Mode === "matrix" ? (
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs text-gray-600 font-medium">Urutkan Kombinasi:</span>
                      <select
                        value={variantSortBy}
                        onChange={(e) => handleSortChange(e.target.value as "group1" | "group2")}
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-xs font-bold rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-purple-500 cursor-pointer"
                      >
                        <option value="group2">Variasi 2 ({group2Name || "UKURAN"}) Dahulu</option>
                        <option value="group1">Variasi 1 ({group1Name || "WARNA"}) Dahulu</option>
                      </select>
                    </div>
                  ) : <div />}
                  <button
                    type="button"
                    onClick={handleGenerateMatrix}
                    className="px-3.5 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold text-xs flex items-center gap-1.5 shadow-xs transition cursor-pointer shrink-0 ml-auto"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Produk</span>
                  </button>
                </div>

                {/* Bulk Apply Bar for Mass Price & Stock */}
                {variants.length > 0 && (
                  <div className="p-3 bg-purple-50/70 border border-purple-200 rounded-xl space-y-2">
                    <div className="flex items-center gap-1.5 text-xs font-extrabold text-purple-900">
                      <Zap className="w-4 h-4 text-purple-600" />
                      <span>Pengaturan Massal Variasi (Terapkan Ke Semua Baris):</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                      {/* Bulk Price */}
                      <div className="flex items-center gap-1">
                        <div className="relative w-28 sm:w-36">
                          <span className="absolute left-2 top-1.5 text-[10px] text-gray-400 font-bold">Rp</span>
                          <input
                            type="text"
                            placeholder="Harga Rp"
                            value={formatRupiahInput(bulkPriceInput)}
                            onChange={(e) => setBulkPriceInput(parseRupiahInput(e.target.value).toString())}
                            className="w-full pl-7 pr-2 py-1 text-xs bg-white border border-gray-200 focus:border-purple-500 rounded-lg font-bold"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={applyBulkPrice}
                          className="px-2.5 py-1 bg-[#774EFC] hover:bg-purple-700 text-white rounded-lg text-xs font-bold transition cursor-pointer shrink-0"
                        >
                          Terapkan Harga
                        </button>
                      </div>

                      {/* Bulk Stock */}
                      <div className="flex items-center gap-1">
                        <div className="w-20 sm:w-24">
                          <input
                            type="number"
                            min={0}
                            placeholder="Stok Qty"
                            value={bulkStockInput}
                            onChange={(e) => setBulkStockInput(e.target.value)}
                            className="w-full px-2 py-1 text-xs bg-white border border-gray-200 focus:border-emerald-500 rounded-lg font-bold text-emerald-600"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={applyBulkStock}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition cursor-pointer shrink-0"
                        >
                          Terapkan Stok
                        </button>
                      </div>

                      {/* Bulk Image */}
                      <button
                        type="button"
                        onClick={applyBulkImage}
                        className="px-2.5 py-1 bg-white hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-lg text-xs font-bold transition cursor-pointer shrink-0 sm:ml-auto"
                        title="Samakan foto variasi pertama ke seluruh baris variasi"
                      >
                        Terapkan Foto 1 ke Semua
                      </button>
                    </div>
                  </div>
                )}

                {/* Table / List of Interlinked Matrix Variant Items */}
                <div className="space-y-3 relative">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-bold text-gray-700 px-1 pt-1 border-b border-gray-100 pb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="shrink-0 text-gray-900 font-bold text-xs">
                        Daftar Variasi Produk ({variants.length} Baris Varian):
                      </span>


                    </div>
                  </div>

                  {variants.map((item, idx) => {
                    return (
                      <div
                        key={idx}
                        className={`flex flex-wrap sm:flex-nowrap items-center gap-2 p-3 rounded-xl border transition-all ${
                          uploadingVariantIdx === idx
                            ? "bg-purple-50/50 border-purple-300 ring-2 ring-purple-200"
                            : "bg-white border-gray-200 shadow-xs"
                        }`}
                      >
                        {/* 1. Thumbnail / Camera Upload */}
                        <div className="relative shrink-0">
                          <input
                            ref={(el) => {
                              variantInputRefs.current[idx] = el;
                            }}
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleVariantImageChange(idx, e)}
                            className="hidden"
                          />
                          {uploadingVariantIdx === idx ? (
                            <div className="w-10 h-10 rounded-lg border border-purple-300 bg-purple-100 flex items-center justify-center text-purple-700 animate-pulse shadow-xs" title="Sedang Mengunggah Gambar...">
                              <Loader2 className="w-4 h-4 animate-spin" />
                            </div>
                          ) : item.image ? (
                            <div className="relative group w-10 h-10 rounded-lg border border-purple-200 overflow-hidden bg-white">
                              <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                              <button
                                type="button"
                                onClick={() => updateVariantRow(idx, "image", "")}
                                className="absolute inset-0 bg-red-600/80 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => variantInputRefs.current[idx]?.click()}
                              className="w-10 h-10 rounded-lg border border-dashed border-purple-300 bg-purple-50 hover:bg-purple-100 flex items-center justify-center text-purple-600 transition cursor-pointer"
                              title="Upload Foto Spesifik Kombinasi Ini"
                            >
                              <Camera className="w-4 h-4" />
                            </button>
                          )}
                        </div>

                        {/* Loading Badge Inside Card */}
                        {uploadingVariantIdx === idx && (
                          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-purple-600 text-white rounded-lg text-[10px] font-bold animate-pulse shrink-0">
                            <Loader2 className="w-3 h-3 animate-spin text-amber-300" />
                            <span>Mengunggah Foto...</span>
                          </div>
                        )}

                        {/* 2. Combination Name */}
                        <div className="flex-1 min-w-[140px] px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold text-gray-900 uppercase flex items-center gap-2 select-none">
                          <span className="w-2 h-2 rounded-full bg-purple-500 shrink-0"></span>
                          <span className="truncate">{item.name}</span>
                        </div>

                        {/* 3. Harga Variasi */}
                        <div className="w-32 relative">
                          <span className="absolute left-2.5 top-1.5 text-[10px] text-gray-400 font-bold">Rp</span>
                          <input
                            type="text"
                            placeholder="0"
                            value={formatRupiahInput(item.price)}
                            onChange={(e) => updateVariantRow(idx, "price", parseRupiahInput(e.target.value))}
                            className="w-full pl-8 pr-2 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold text-gray-900 focus:bg-white focus:border-purple-500"
                          />
                        </div>

                        {/* 4. Stok Qty */}
                        <div className="w-24 relative">
                          <span className="absolute right-2 top-1.5 text-[9px] text-gray-400 font-semibold">Stok</span>
                          <input
                            type="number"
                            min={0}
                            placeholder="Stok Qty"
                            value={item.stock}
                            onChange={(e) => updateVariantRow(idx, "stock", e.target.value === "" ? "" : Number(e.target.value))}
                            className="w-full pl-2.5 pr-9 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold text-emerald-600 focus:bg-white focus:border-purple-500"
                          />
                        </div>

                        {/* 5. Salin Bawah Button (Only visible in Matrix mode) */}
                        {idx < variants.length - 1 && group2Mode === "matrix" && (
                          <button
                            type="button"
                            onClick={() => copyRowDown(idx)}
                            className="p-1.5 sm:px-2.5 sm:py-1 text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg transition cursor-pointer shrink-0 flex items-center gap-1 text-[10px] font-bold"
                            title="Salin Harga, Stok & Foto baris ini ke baris bawahnya"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Salin Bawah</span>
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Pricing & Stock Fields (Sembunyi saat Variasi Hidup) */}
          {!hasGroup1 ? (
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-3">
              <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                <div className="flex items-center gap-2 font-bold text-gray-900 text-xs">
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                  <span>Harga & Stok Dasar Produk</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className="block text-gray-700 mb-1 font-semibold text-xs">Harga Dasar (Rp) *</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-xs text-gray-400 font-bold">Rp</span>
                    <input
                      type="text"
                      required={!hasGroup1}
                      value={formatRupiahInput(retailPrice)}
                      onChange={(e) => setRetailPrice(parseRupiahInput(e.target.value))}
                      placeholder="0"
                      className="w-full bg-white border border-gray-200 focus:border-emerald-500 rounded-xl pl-9 pr-3 py-2 text-gray-900 focus:outline-none font-bold text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 mb-1 font-semibold text-xs">Stok Dasar *</label>
                  <input
                    type="number"
                    min={0}
                    required={!hasGroup1}
                    value={stock}
                    onChange={(e) => setStock(e.target.value === "" ? "" : Number(e.target.value))}
                    placeholder="Contoh: 100"
                    className="w-full bg-white border border-gray-200 focus:border-emerald-500 rounded-xl px-3 py-2 text-gray-900 focus:outline-none font-bold text-xs"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 mb-1 font-semibold text-xs flex items-center gap-1">
                    <Boxes className="w-3.5 h-3.5 text-[#774EFC]" />
                    <span>Min. Pembelian *</span>
                  </label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={moq}
                    onChange={(e) => setMoq(Math.max(1, parseInt(e.target.value) || 1))}
                    placeholder="1"
                    className="w-full bg-white border border-purple-200 focus:border-[#774EFC] rounded-xl px-3 py-2 text-purple-900 focus:outline-none font-extrabold text-xs"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 mb-1 font-semibold text-xs">Berat (Gram) *</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={weightGram}
                    onChange={(e) => setWeightGram(Number(e.target.value))}
                    placeholder="Contoh: 1000"
                    className="w-full bg-white border border-gray-200 focus:border-emerald-500 rounded-xl px-3 py-2 text-gray-900 focus:outline-none font-bold text-xs"
                  />
                </div>
              </div>

              {/* Dimensi Produk (Pengiriman) */}
              <div className="grid grid-cols-3 gap-3 pt-2 border-t border-gray-100">
                <div>
                  <label className="block text-gray-700 mb-1 font-semibold text-xs">Panjang (cm) *</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={lengthCm}
                    onChange={(e) => setLengthCm(Number(e.target.value))}
                    placeholder="20"
                    className="w-full bg-white border border-gray-200 focus:border-emerald-500 rounded-xl px-3 py-2 text-gray-900 focus:outline-none font-bold text-xs"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 mb-1 font-semibold text-xs">Lebar (cm) *</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={widthCm}
                    onChange={(e) => setWidthCm(Number(e.target.value))}
                    placeholder="20"
                    className="w-full bg-white border border-gray-200 focus:border-emerald-500 rounded-xl px-3 py-2 text-gray-900 focus:outline-none font-bold text-xs"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 mb-1 font-semibold text-xs">Tinggi (cm) *</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={heightCm}
                    onChange={(e) => setHeightCm(Number(e.target.value))}
                    placeholder="20"
                    className="w-full bg-white border border-gray-200 focus:border-emerald-500 rounded-xl px-3 py-2 text-gray-900 focus:outline-none font-bold text-xs"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-3">
              <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                <div className="flex items-center gap-2 font-bold text-gray-900 text-xs">
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                  <span>Informasi Pengiriman & Stok Variasi</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                  <Boxes className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Total Stok Semua Variasi: {variants.reduce((acc, v) => acc + (Number(v.stock) || 0), 0)} Pcs</span>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 items-end">
                <div>
                  <label className="block text-gray-700 mb-1 font-semibold text-xs flex items-center gap-1">
                    <Boxes className="w-3.5 h-3.5 text-[#774EFC]" />
                    <span>Min. Pembelian *</span>
                  </label>
                  <div className="w-full h-[42px] bg-white border border-purple-200 focus-within:border-[#774EFC] rounded-xl px-3 flex items-center justify-between">
                    <input
                      type="number"
                      min={1}
                      required
                      value={moq}
                      onChange={(e) => setMoq(Math.max(1, parseInt(e.target.value) || 1))}
                      placeholder="1"
                      className="w-full bg-transparent border-none text-purple-900 focus:outline-none font-extrabold text-xs"
                    />
                    <span className="text-xs font-semibold text-purple-400 shrink-0 ml-1">Pcs</span>
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 mb-1 font-semibold text-xs">Berat (Gram) *</label>
                  <div className="w-full h-[42px] bg-white border border-gray-200 focus-within:border-emerald-500 rounded-xl px-3 flex items-center justify-between">
                    <input
                      type="number"
                      min={1}
                      required
                      value={weightGram}
                      onChange={(e) => setWeightGram(Number(e.target.value))}
                      placeholder="1000"
                      className="w-full bg-transparent border-none text-gray-900 focus:outline-none font-bold text-xs"
                    />
                    <span className="text-xs font-semibold text-gray-400 shrink-0 ml-1">Gram</span>
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 mb-1 font-semibold text-xs">Panjang (cm) *</label>
                  <div className="w-full h-[42px] bg-white border border-gray-200 focus-within:border-emerald-500 rounded-xl px-3 flex items-center justify-between">
                    <input
                      type="number"
                      min={1}
                      required
                      value={lengthCm}
                      onChange={(e) => setLengthCm(Number(e.target.value))}
                      placeholder="20"
                      className="w-full bg-transparent border-none text-gray-900 focus:outline-none font-bold text-xs"
                    />
                    <span className="text-xs font-semibold text-gray-400 shrink-0 ml-1">cm</span>
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 mb-1 font-semibold text-xs">Lebar (cm) *</label>
                  <div className="w-full h-[42px] bg-white border border-gray-200 focus-within:border-emerald-500 rounded-xl px-3 flex items-center justify-between">
                    <input
                      type="number"
                      min={1}
                      required
                      value={widthCm}
                      onChange={(e) => setWidthCm(Number(e.target.value))}
                      placeholder="20"
                      className="w-full bg-transparent border-none text-gray-900 focus:outline-none font-bold text-xs"
                    />
                    <span className="text-xs font-semibold text-gray-400 shrink-0 ml-1">cm</span>
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 mb-1 font-semibold text-xs">Tinggi (cm) *</label>
                  <div className="w-full h-[42px] bg-white border border-gray-200 focus-within:border-emerald-500 rounded-xl px-3 flex items-center justify-between">
                    <input
                      type="number"
                      min={1}
                      required
                      value={heightCm}
                      onChange={(e) => setHeightCm(Number(e.target.value))}
                      placeholder="20"
                      className="w-full bg-transparent border-none text-gray-900 focus:outline-none font-bold text-xs"
                    />
                    <span className="text-xs font-semibold text-gray-400 shrink-0 ml-1">cm</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Gambar Utama (Thumbnail) */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-gray-700 font-semibold">Gambar Utama (Thumbnail) *</label>
              <span className="text-[10px] text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                Rasio 1:1 (Max 1MB)
              </span>
            </div>
            <input
              ref={thumbnailInputRef}
              type="file"
              accept="image/*"
              onChange={handleThumbnailChange}
              className="hidden"
              id="thumbnail-upload-file"
            />

            {thumbnail ? (
              <div className="relative group w-full h-32 bg-gray-50 border border-gray-200 rounded-2xl overflow-hidden flex items-center justify-center p-2">
                <img
                  src={thumbnail}
                  alt="Thumbnail Preview"
                  className="max-h-full max-w-full object-contain rounded-xl aspect-square"
                />
                <div className="absolute inset-0 bg-gray-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-xs">
                  <button
                    type="button"
                    onClick={() => thumbnailInputRef.current?.click()}
                    disabled={uploadingThumbnail}
                    className="px-3 py-1.5 bg-white text-gray-800 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 transition cursor-pointer hover:bg-gray-100"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Ganti Gambar</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setThumbnail("")}
                    className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-lg text-[11px] font-semibold flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Hapus</span>
                  </button>
                </div>
                {uploadingThumbnail && (
                  <div className="absolute inset-0 bg-white/80 flex items-center justify-center gap-2 text-gray-900 font-semibold">
                    <Loader2 className="w-5 h-5 animate-spin text-red-600" />
                    <span className="text-xs">Mengunggah...</span>
                  </div>
                )}
              </div>
            ) : (
              <label
                htmlFor="thumbnail-upload-file"
                className={`w-full h-28 border-2 border-dashed border-gray-300 hover:border-red-500 bg-gray-50/60 hover:bg-gray-100/80 rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer transition p-4 text-center ${uploadingThumbnail ? "opacity-50 pointer-events-none" : ""
                  }`}
              >
                {uploadingThumbnail ? (
                  <Loader2 className="w-6 h-6 animate-spin text-red-600" />
                ) : (
                  <Upload className="w-6 h-6 text-gray-400 group-hover:text-red-600" />
                )}
                <div>
                  <span className="font-semibold text-gray-700 block text-xs">
                    {uploadingThumbnail ? "Mengunggah gambar..." : "Klik untuk Upload Gambar Utama"}
                  </span>
                  <span className="text-[10px] text-gray-500 font-medium">Format JPG, PNG, WEBP — Rasio 1:1 (Max 1MB)</span>
                </div>
              </label>
            )}
          </div>

          {/* Galeri Gambar & Video */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <label className="block text-gray-700 font-semibold">
                  Galeri Foto & Video Produk ({galleryImages.length} Media)
                </label>
              </div>
              <button
                type="button"
                onClick={() => galleryInputRef.current?.click()}
                disabled={uploadingGallery}
                className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200 rounded-xl text-[11px] font-semibold flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
              >
                {uploadingGallery ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-red-600" />
                ) : (
                  <Plus className="w-3.5 h-3.5 text-red-600" />
                )}
                <span>Tambah Foto / Video</span>
              </button>
            </div>

            <input
              ref={galleryInputRef}
              type="file"
              accept="image/*,video/*"
              multiple
              onChange={handleGalleryChange}
              className="hidden"
            />

            {galleryImages.length > 0 && (
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 bg-gray-50 p-2.5 rounded-2xl border border-gray-200">
                {galleryImages.map((mediaUrl, index) => {
                  const isVid = isVideoUrl(mediaUrl);
                  return (
                    <div
                      key={index}
                      className="relative group aspect-square bg-gray-900 border border-gray-200 rounded-xl overflow-hidden flex items-center justify-center p-0.5"
                    >
                      {isVid ? (
                        <video
                          src={mediaUrl}
                          autoPlay
                          loop
                          muted
                          playsInline
                          className="w-full h-full object-cover rounded-lg aspect-square"
                        />
                      ) : (
                        <img
                          src={mediaUrl}
                          alt={`Galeri ${index + 1}`}
                          className="max-h-full max-w-full object-cover rounded-lg aspect-square"
                        />
                      )}

                      {isVid && (
                        <div className="absolute top-1 left-1 bg-black/75 backdrop-blur-xs text-white text-[8px] font-extrabold px-1.5 py-0.5 rounded flex items-center gap-1">
                          <Video className="w-2.5 h-2.5 text-red-500" />
                          <span>VIDEO</span>
                        </div>
                      )}

                      <div className="absolute inset-0 bg-gray-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-xs">
                        <button
                          type="button"
                          onClick={() => removeGalleryImage(index)}
                          className="p-1.5 bg-red-600 hover:bg-red-500 text-white rounded-lg transition cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Deskripsi Lengkap Produk (With Collapsible Hide/Unhide Toggle) */}
          <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-3">
            <div
              className="flex items-center justify-between gap-2 border-b border-gray-200 pb-2 cursor-pointer select-none"
              onClick={() => setIsDescriptionSectionOpen(!isDescriptionSectionOpen)}
            >
              <div className="flex items-center gap-2 font-semibold text-gray-900 text-xs">
                <FileText className="w-4 h-4 text-gray-600" />
                <span>Deskripsi Lengkap Produk *</span>
                <span className="text-[10px] text-[#774EFC] font-bold bg-purple-50 px-2 py-0.5 rounded-full border border-purple-100 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  <span className="hidden sm:inline">Editor Visual & Markdown</span>
                </span>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsDescriptionSectionOpen(!isDescriptionSectionOpen);
                }}
                className="p-1 text-gray-500 hover:text-gray-900 hover:bg-gray-200/80 rounded-lg transition cursor-pointer flex items-center gap-1 text-xs font-semibold shrink-0"
                title={isDescriptionSectionOpen ? "Sembunyikan Deskripsi" : "Tampilkan Deskripsi"}
              >
                <span className="text-[11px] font-bold text-gray-600">
                  {isDescriptionSectionOpen ? "Sembunyikan" : "Tampilkan"}
                </span>
                {isDescriptionSectionOpen ? (
                  <ChevronUp className="w-4 h-4 text-gray-700" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-700" />
                )}
              </button>
            </div>

            {isDescriptionSectionOpen && (
              <div className="space-y-3 pt-1">
                {/* Mode Tab Switcher: Visual Editor vs Raw Code vs Live Preview */}
                <div className="flex items-center bg-white p-0.5 rounded-xl border border-gray-200 text-xs font-bold gap-0.5 shadow-2xs w-fit">
                  <button
                    type="button"
                    onClick={() => setDescMode("visual")}
                    className={`px-3 py-1 rounded-lg transition cursor-pointer flex items-center gap-1 text-[11px] ${
                      descMode === "visual"
                        ? "bg-purple-50 text-purple-700 border border-purple-200 font-black"
                        : "text-gray-500 hover:text-gray-800"
                    }`}
                    title="Edit Visual Langsung Berfungsi"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>Visual</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDescMode("code")}
                    className={`px-3 py-1 rounded-lg transition cursor-pointer flex items-center gap-1 text-[11px] ${
                      descMode === "code"
                        ? "bg-gray-100 text-gray-900 border border-gray-200 font-black"
                        : "text-gray-500 hover:text-gray-800"
                    }`}
                    title="Edit Kode Raw Teks / Markdown"
                  >
                    <FileCode className="w-3.5 h-3.5 text-blue-600" />
                    <span>Markdown</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDescMode("preview")}
                    className={`px-3 py-1 rounded-lg transition cursor-pointer flex items-center gap-1 text-[11px] ${
                      descMode === "preview"
                        ? "bg-[#774EFC] text-white font-black"
                        : "text-gray-500 hover:text-gray-800"
                    }`}
                    title="Pratinjau Tampilan Pembeli"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Preview</span>
                  </button>
                </div>
                {/* Quick Formatting & Emoji Toolbars (Selalu Tampil) */}
                {descMode !== "preview" && (
                  <>
                    <div className="mb-2 flex flex-wrap items-center justify-between gap-2 p-2 bg-slate-50 border border-slate-200 rounded-2xl">
                      <div className="flex flex-wrap items-center gap-1">
                        {/* Bold */}
                        <button
                          type="button"
                          onClick={() => handleWrapText("**", "**", "teks tebal")}
                          className="px-2 py-1 bg-white hover:bg-slate-100 text-slate-900 border border-slate-300 rounded-lg text-xs font-black flex items-center gap-1 shadow-2xs transition cursor-pointer"
                          title="Format Teks Tebal (Bold)"
                        >
                          <Bold className="w-3.5 h-3.5 text-slate-900" />
                          <span>Tebal</span>
                        </button>

                        {/* Italic */}
                        <button
                          type="button"
                          onClick={() => handleWrapText("*", "*", "teks miring")}
                          className="px-2 py-1 bg-white hover:bg-slate-100 text-slate-900 border border-slate-300 rounded-lg text-xs font-semibold italic flex items-center gap-1 shadow-2xs transition cursor-pointer"
                          title="Format Teks Miring (Italic)"
                        >
                          <Italic className="w-3.5 h-3.5 text-slate-700" />
                          <span>Miring</span>
                        </button>

                        {/* Underline */}
                        <button
                          type="button"
                          onClick={() => handleWrapText("<u>", "</u>", "teks garis bawah")}
                          className="px-2 py-1 bg-white hover:bg-slate-100 text-slate-900 border border-slate-300 rounded-lg text-xs font-semibold underline flex items-center gap-1 shadow-2xs transition cursor-pointer"
                          title="Format Garis Bawah (Underline)"
                        >
                          <Underline className="w-3.5 h-3.5 text-purple-600" />
                          <span>Garis Bawah</span>
                        </button>

                        {/* Bullet */}
                        <button
                          type="button"
                          onClick={handleInsertBullet}
                          className="px-2 py-1 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 rounded-lg text-xs font-extrabold flex items-center gap-1 shadow-2xs transition cursor-pointer"
                          title="Sisipkan Titik Bulat (•) di baris baru"
                        >
                          <List className="w-3.5 h-3.5 text-red-600" />
                          <span>• Poin</span>
                        </button>

                        {/* Paragraph */}
                        <button
                          type="button"
                          onClick={handleInsertParagraph}
                          className="px-2 py-1 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 rounded-lg text-xs font-extrabold flex items-center gap-1 shadow-2xs transition cursor-pointer"
                          title="Buat Jarak Paragraf Baru"
                        >
                          <CornerDownLeft className="w-3.5 h-3.5 text-blue-600" />
                          <span>↵ Paragraf</span>
                        </button>
                      </div>

                      {/* Template */}
                      <button
                        type="button"
                        onClick={handleInsertTemplate}
                        className="px-3 py-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl text-xs font-extrabold flex items-center gap-1.5 shadow-xs transition cursor-pointer shrink-0"
                        title="Sisipkan Draf Template Deskripsi Estetik & Rapi"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                        <span>✨ Template Rapi</span>
                      </button>
                    </div>

                    {/* Quick Emoji Toolbar */}
                    <div className="mb-2.5 p-2 bg-gray-50 border border-gray-200 rounded-2xl flex flex-wrap items-center gap-1">
                      <span className="text-[10px] font-bold text-gray-600 mr-1.5 flex items-center gap-1 px-1">
                        <Smile className="w-3.5 h-3.5 text-amber-500" />
                        <span>Sisipkan Emoji:</span>
                      </span>
                      {POPULAR_EMOJIS.map((emoji, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleInsertEmoji(emoji)}
                          className="w-7 h-7 flex items-center justify-center text-sm rounded-lg hover:bg-white hover:shadow-xs hover:scale-125 active:scale-95 transition cursor-pointer select-none border border-transparent hover:border-gray-200"
                          title={`Klik untuk menyisipkan ${emoji}`}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </>
                )}

                {descMode === "visual" ? (
                  /* Rich Text Visual WYSIWYG Editor (LANGSUNG BERFUNGSI DI EDIT BOX) */
                  <RichTextEditor
                    value={description}
                    onChange={(val) => setDescription(val)}
                    placeholder="Tuliskan deskripsi lengkap produk (spesifikasi bahan, keunggulan, ukuran, garansi, dsb)..."
                  />
                ) : descMode === "code" ? (
                  /* Raw Markdown Code Textarea */
                  <textarea
                    ref={descTextareaRef}
                    required
                    rows={8}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Tuliskan deskripsi lengkap produk dalam format Markdown / teks biasa..."
                    className="w-full min-h-[220px] bg-gray-50 border border-gray-300 focus:bg-white rounded-2xl p-4 text-gray-900 focus:outline-none focus:border-red-500 font-mono text-xs leading-relaxed resize-y shadow-xs transition-all"
                  />
                ) : (
                  /* Live Preview Tampilan Pembeli Container */
                  <div className="w-full min-h-[260px] max-h-[420px] overflow-y-auto bg-white border-2 border-purple-200 rounded-2xl p-5 shadow-xs space-y-3 font-sans">
                    <div className="flex items-center justify-between pb-2 border-b border-purple-100 text-purple-700 font-bold text-xs">
                      <div className="flex items-center gap-2">
                        <Eye className="w-4 h-4 text-purple-600 animate-pulse" />
                        <span>Pratinjau Tampilan Pembeli (Live Preview):</span>
                      </div>
                      <span className="text-[10px] bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full font-extrabold">100% Persis Seperti Di Website</span>
                    </div>
                    {renderFormattedDescription(description)}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-200 space-y-2">
            <div className="flex items-center justify-between border-b border-gray-200 pb-1.5">
              <span className="text-gray-800 font-bold text-xs">Opsi Tampilan & Label Produk:</span>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <label className={`flex items-center gap-2 select-none cursor-pointer transition ${isBuyerOnly ? "opacity-40 cursor-not-allowed" : "hover:text-gray-900"}`}>
                <input
                  type="checkbox"
                  disabled={isBuyerOnly}
                  checked={isPopular && !isBuyerOnly}
                  onChange={(e) => setIsPopular(e.target.checked)}
                  className="rounded border-gray-300 text-red-600 focus:ring-red-500 cursor-pointer disabled:cursor-not-allowed"
                />
                <span className="text-gray-700 font-semibold text-xs">Tampilkan di Produk Populer</span>
              </label>

              <label className={`flex items-center gap-2 select-none cursor-pointer transition ${isBuyerOnly ? "opacity-40 cursor-not-allowed" : "hover:text-gray-900"}`}>
                <input
                  type="checkbox"
                  disabled={isBuyerOnly}
                  checked={isDeal && !isBuyerOnly}
                  onChange={(e) => setIsDeal(e.target.checked)}
                  className="rounded border-gray-300 text-red-600 focus:ring-red-500 cursor-pointer disabled:cursor-not-allowed"
                />
                <span className="text-gray-700 font-semibold text-xs">Tampilkan di Hot Deal</span>
              </label>

              <label className={`flex items-center gap-2 select-none cursor-pointer px-2.5 py-1 rounded-lg border transition ${isBuyerOnly ? "bg-purple-100 border-purple-300 text-purple-900 font-bold" : "bg-purple-50 border-purple-200 text-purple-800"}`}>
                <input
                  type="checkbox"
                  checked={isBuyerOnly}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setIsBuyerOnly(checked);
                    if (checked) {
                      setIsPopular(false);
                      setIsDeal(false);
                    }
                  }}
                  className="rounded border-purple-400 text-purple-600 focus:ring-purple-500 cursor-pointer"
                />
                <span className="font-bold text-xs">Buyer Only (Khusus Pembeli)</span>
              </label>
            </div>
            {isBuyerOnly && (
              <p className="text-[10px] text-purple-700 font-semibold italic pt-0.5">
                * Keterangan: Saat 'Buyer Only' aktif, opsi Produk Populer & Hot Deal otomatis terkunci/dinonaktifkan.
              </p>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 cursor-pointer font-medium"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading || uploadingThumbnail || uploadingGallery || categories.length === 0}
              className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white font-semibold rounded-xl flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>Simpan Produk</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
