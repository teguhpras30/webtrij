"use client";

import { useRef, useEffect, useState } from "react";
import {
  Bold as BoldIcon,
  Italic as ItalicIcon,
  Underline as UnderlineIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  ListOrdered,
  List as ListBullet,
  Indent,
  Outdent,
  Quote,
  Minus,
  RemoveFormatting,
  Undo,
  Redo,
  Image as ImageIcon,
  ChevronDown,
  Baseline,
  Type,
  Loader2,
} from "lucide-react";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  onUploadImage?: (file: File) => Promise<string>;
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = "Tulis isi artikel di sini...",
  onUploadImage,
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const inlineFileInputRef = useRef<HTMLInputElement>(null);

  const [isHeadingOpen, setIsHeadingOpen] = useState(false);
  const [isAlignOpen, setIsAlignOpen] = useState(false);
  const [isColorOpen, setIsColorOpen] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [activeHeading, setActiveHeading] = useState("Paragraf");

  // Sync initial content once when editor mounts or value changes externally
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || "";
    }
  }, [value]);

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const exec = (command: string, val: string | undefined = undefined) => {
    document.execCommand(command, false, val);
    handleInput();
  };

  const applyHeading = (tag: string, label: string) => {
    exec("formatBlock", tag);
    setActiveHeading(label);
    setIsHeadingOpen(false);
  };

  const handleInlineImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onUploadImage) return;

    setUploadingImage(true);
    try {
      const url = await onUploadImage(file);
      if (url) {
        const imgHtml = `<div class="my-6 text-center"><img src="${url}" alt="Gambar Artikel" class="w-full rounded-2xl border border-gray-200 shadow-sm max-h-[450px] object-cover mx-auto" /></div><p><br></p>`;
        exec("insertHTML", imgHtml);
      }
    } catch (err) {
      console.error("Gagal upload gambar inline:", err);
    } finally {
      setUploadingImage(false);
    }
  };

  const colors = [
    { name: "Hitam Default", color: "#1f2937" },
    { name: "Ungu TRI J", color: "#774EFC" },
    { name: "Merah", color: "#dc2626" },
    { name: "Biru", color: "#2563eb" },
    { name: "Hijau", color: "#16a34a" },
    { name: "Oranye", color: "#ea580c" },
    { name: "Abu-abu", color: "#6b7280" },
  ];

  return (
    <div className="border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-2xs font-sans">
      {/* RICH TEXT WYSIWYG TOOLBAR (SESUAI GAMBAR USER) */}
      <div className="flex flex-wrap items-center gap-1 p-2 bg-slate-50 border-b border-gray-200 text-gray-700 select-none">
        {/* Undo / Redo */}
        <div className="flex items-center gap-0.5 pr-1.5 border-r border-gray-200">
          <button
            type="button"
            onClick={() => exec("undo")}
            className="p-1.5 rounded-lg hover:bg-gray-200/80 text-gray-600 transition cursor-pointer"
            title="Urungkan (Undo)"
          >
            <Undo className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => exec("redo")}
            className="p-1.5 rounded-lg hover:bg-gray-200/80 text-gray-600 transition cursor-pointer"
            title="Ulangi (Redo)"
          >
            <Redo className="w-4 h-4" />
          </button>
        </div>

        {/* Heading Dropdown (TT Icon) */}
        <div className="relative border-r border-gray-200 pr-1.5">
          <button
            type="button"
            onClick={() => setIsHeadingOpen(!isHeadingOpen)}
            className="flex items-center gap-1 px-2 py-1.5 rounded-lg hover:bg-gray-200/80 text-xs font-bold text-gray-700 transition cursor-pointer"
            title="Ukuran Teks & Judul (H1, H2, H3)"
          >
            <Type className="w-4 h-4 text-purple-700" />
            <span className="max-w-[70px] truncate text-[11px]">{activeHeading}</span>
            <ChevronDown className="w-3 h-3 text-gray-400" />
          </button>

          {isHeadingOpen && (
            <div className="absolute top-full left-0 mt-1 w-40 bg-white border border-gray-200 rounded-xl shadow-xl z-30 py-1 text-xs font-semibold">
              <button
                type="button"
                onClick={() => applyHeading("p", "Paragraf")}
                className="w-full text-left px-3 py-1.5 hover:bg-purple-50 text-gray-700"
              >
                Paragraf Normal
              </button>
              <button
                type="button"
                onClick={() => applyHeading("h2", "Judul H2")}
                className="w-full text-left px-3 py-1.5 hover:bg-purple-50 text-gray-900 font-extrabold text-sm"
              >
                Judul Bab (H2)
              </button>
              <button
                type="button"
                onClick={() => applyHeading("h3", "Sub-Judul H3")}
                className="w-full text-left px-3 py-1.5 hover:bg-purple-50 text-gray-800 font-bold text-xs"
              >
                Sub-Judul (H3)
              </button>
            </div>
          )}
        </div>

        {/* Text Styling: B, I, U */}
        <div className="flex items-center gap-0.5 pr-1.5 border-r border-gray-200">
          <button
            type="button"
            onClick={() => exec("bold")}
            className="p-1.5 rounded-lg hover:bg-gray-200/80 text-gray-700 font-extrabold transition cursor-pointer"
            title="Cetak Tebal (Bold)"
          >
            <BoldIcon className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => exec("italic")}
            className="p-1.5 rounded-lg hover:bg-gray-200/80 text-gray-700 transition cursor-pointer"
            title="Cetak Miring (Italic)"
          >
            <ItalicIcon className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => exec("underline")}
            className="p-1.5 rounded-lg hover:bg-gray-200/80 text-gray-700 transition cursor-pointer"
            title="Garis Bawah (Underline)"
          >
            <UnderlineIcon className="w-4 h-4" />
          </button>
        </div>

        {/* Color Picker Dropdown (A Icon) */}
        <div className="relative border-r border-gray-200 pr-1.5">
          <button
            type="button"
            onClick={() => setIsColorOpen(!isColorOpen)}
            className="flex items-center gap-1 p-1.5 rounded-lg hover:bg-gray-200/80 text-gray-700 transition cursor-pointer"
            title="Warna Teks (Color)"
          >
            <Baseline className="w-4 h-4 text-purple-600" />
            <ChevronDown className="w-3 h-3 text-gray-400" />
          </button>

          {isColorOpen && (
            <div className="absolute top-full left-0 mt-1 w-36 bg-white border border-gray-200 rounded-xl shadow-xl z-30 p-2 grid grid-cols-4 gap-1.5">
              {colors.map((c) => (
                <button
                  key={c.color}
                  type="button"
                  onClick={() => {
                    exec("foreColor", c.color);
                    setIsColorOpen(false);
                  }}
                  style={{ backgroundColor: c.color }}
                  className="w-6 h-6 rounded-full border border-gray-300 hover:scale-110 transition cursor-pointer"
                  title={c.name}
                />
              ))}
            </div>
          )}
        </div>

        {/* Alignment Dropdown */}
        <div className="relative border-r border-gray-200 pr-1.5">
          <button
            type="button"
            onClick={() => setIsAlignOpen(!isAlignOpen)}
            className="flex items-center gap-1 p-1.5 rounded-lg hover:bg-gray-200/80 text-gray-700 transition cursor-pointer"
            title="Rata Teks (Alignment)"
          >
            <AlignLeft className="w-4 h-4" />
            <ChevronDown className="w-3 h-3 text-gray-400" />
          </button>

          {isAlignOpen && (
            <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl z-30 py-1 flex flex-col text-xs font-semibold">
              <button
                type="button"
                onClick={() => {
                  exec("justifyLeft");
                  setIsAlignOpen(false);
                }}
                className="flex items-center gap-2 px-3 py-1.5 hover:bg-purple-50 text-gray-700"
              >
                <AlignLeft className="w-3.5 h-3.5" />
                <span>Rata Kiri</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  exec("justifyCenter");
                  setIsAlignOpen(false);
                }}
                className="flex items-center gap-2 px-3 py-1.5 hover:bg-purple-50 text-gray-700"
              >
                <AlignCenter className="w-3.5 h-3.5" />
                <span>Rata Tengah</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  exec("justifyRight");
                  setIsAlignOpen(false);
                }}
                className="flex items-center gap-2 px-3 py-1.5 hover:bg-purple-50 text-gray-700"
              >
                <AlignRight className="w-3.5 h-3.5" />
                <span>Rata Kanan</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  exec("justifyFull");
                  setIsAlignOpen(false);
                }}
                className="flex items-center gap-2 px-3 py-1.5 hover:bg-purple-50 text-gray-700"
              >
                <AlignJustify className="w-3.5 h-3.5" />
                <span>Rata Kiri-Kanan</span>
              </button>
            </div>
          )}
        </div>

        {/* Lists: Ordered List, Bullet List */}
        <div className="flex items-center gap-0.5 pr-1.5 border-r border-gray-200">
          <button
            type="button"
            onClick={() => exec("insertOrderedList")}
            className="p-1.5 rounded-lg hover:bg-gray-200/80 text-gray-700 transition cursor-pointer"
            title="Daftar Angka (1 2 3)"
          >
            <ListOrdered className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => exec("insertUnorderedList")}
            className="p-1.5 rounded-lg hover:bg-gray-200/80 text-gray-700 transition cursor-pointer"
            title="Daftar Poin Bullet (• • •)"
          >
            <ListBullet className="w-4 h-4" />
          </button>
        </div>

        {/* Indent / Outdent */}
        <div className="flex items-center gap-0.5 pr-1.5 border-r border-gray-200">
          <button
            type="button"
            onClick={() => exec("outdent")}
            className="p-1.5 rounded-lg hover:bg-gray-200/80 text-gray-700 transition cursor-pointer"
            title="Geser Kiri (Outdent)"
          >
            <Outdent className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => exec("indent")}
            className="p-1.5 rounded-lg hover:bg-gray-200/80 text-gray-700 transition cursor-pointer"
            title="Geser Kanan (Indent)"
          >
            <Indent className="w-4 h-4" />
          </button>
        </div>

        {/* Blockquote & Horizontal Line */}
        <div className="flex items-center gap-0.5 pr-1.5 border-r border-gray-200">
          <button
            type="button"
            onClick={() => exec("formatBlock", "blockquote")}
            className="p-1.5 rounded-lg hover:bg-gray-200/80 text-gray-700 transition cursor-pointer"
            title="Kutipan (Quote)"
          >
            <Quote className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => exec("insertHorizontalRule")}
            className="p-1.5 rounded-lg hover:bg-gray-200/80 text-gray-700 transition cursor-pointer"
            title="Garis Pembatas (Horizontal Line)"
          >
            <Minus className="w-4 h-4" />
          </button>
        </div>

        {/* Clear Format */}
        <div className="flex items-center gap-0.5 pr-1.5 border-r border-gray-200">
          <button
            type="button"
            onClick={() => exec("removeFormat")}
            className="p-1.5 rounded-lg hover:bg-gray-200/80 text-gray-700 transition cursor-pointer"
            title="Hapus Format (Clear Formatting)"
          >
            <RemoveFormatting className="w-4 h-4" />
          </button>
        </div>

        {/* Inline Upload Image */}
        {onUploadImage && (
          <div>
            <button
              type="button"
              onClick={() => inlineFileInputRef.current?.click()}
              disabled={uploadingImage}
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#774EFC] hover:bg-[#6332f6] text-white text-[11px] font-bold rounded-lg transition cursor-pointer shadow-2xs disabled:opacity-50"
              title="Sisipkan Gambar ke Dalam Artikel"
            >
              {uploadingImage ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <ImageIcon className="w-3.5 h-3.5" />
              )}
              <span>+ Sisipkan Gambar</span>
            </button>
            <input
              ref={inlineFileInputRef}
              type="file"
              accept="image/*"
              onChange={handleInlineImage}
              className="hidden"
            />
          </div>
        )}
      </div>

      {/* CONTENT EDITABLE VISUAL AREA */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        className="min-h-[280px] p-4 focus:outline-none prose prose-sm max-w-none text-gray-800 leading-relaxed"
        style={{ minHeight: "280px" }}
      />
    </div>
  );
}
