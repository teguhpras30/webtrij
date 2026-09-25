"use client";

import { useState, useEffect, FormEvent, useRef } from "react";
import {
  X,
  FileText,
  Tag,
  User,
  Calendar,
  Loader2,
  Sparkles,
  Upload,
  Eye,
  Star,
} from "lucide-react";
import { BlogPost } from "@/data/blogPosts";
import RichTextEditor from "./RichTextEditor";

interface BlogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (post: Partial<BlogPost>) => Promise<void>;
  editingPost?: BlogPost | null;
}

export default function BlogModal({
  isOpen,
  onClose,
  onSave,
  editingPost,
}: BlogModalProps) {
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [category, setCategory] = useState("Tips Perabotan");
  const [author, setAuthor] = useState("Tim Spesialis TRI J");
  const [tagsStr, setTagsStr] = useState("");
  const [readTime, setReadTime] = useState("5 min baca");
  const [isHighlight, setIsHighlight] = useState(false);

  // Upload state
  const [uploadingCover, setUploadingCover] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingPost) {
      setTitle(editingPost.title || "");
      setSlug(editingPost.slug || "");
      setExcerpt(editingPost.excerpt || "");
      setContent(editingPost.content || "");
      setCoverImage(editingPost.coverImage || "");
      setCategory(editingPost.category || "Tips Perabotan");
      setAuthor(editingPost.author || "Tim Spesialis TRI J");
      setTagsStr(editingPost.tags ? editingPost.tags.join(", ") : "");
      setReadTime(editingPost.readTime || "5 min baca");
      setIsHighlight(Boolean(editingPost.isHighlight));
    } else {
      setTitle("");
      setSlug("");
      setExcerpt("");
      setContent("");
      setCoverImage("");
      setCategory("Tips Perabotan");
      setAuthor("Tim Spesialis TRI J");
      setTagsStr("Perabotan, TRI J, Tips Rumah");
      setReadTime("5 min baca");
      setIsHighlight(false);
    }
    setError(null);
  }, [editingPost, isOpen]);

  // Auto-generate slug from title
  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!editingPost) {
      const generatedSlug = val
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .trim()
        .replace(/\s+/g, "-");
      setSlug(generatedSlug);
    }
  };

  // Safe JSON parser helper
  const safeParseJson = async (res: Response) => {
    const text = await res.text();
    try {
      return JSON.parse(text);
    } catch {
      throw new Error(
        `Gagal mengunggah file (HTTP ${res.status}): Server tidak mengembalikan respons JSON. Pastikan ukuran file gambar max 1MB.`
      );
    }
  };

  // Upload Cover Image handler
  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingCover(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const data = await safeParseJson(res);
      if (!res.ok) throw new Error(data.error || "Gagal mengunggah gambar sampul.");

      setCoverImage(data.url);
    } catch (err: any) {
      setError(err.message || "Gagal mengunggah gambar.");
    } finally {
      setUploadingCover(false);
    }
  };

  // Upload Inline Image handler for RichTextEditor
  const handleUploadInlineImage = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/admin/upload", {
      method: "POST",
      body: formData,
    });

    const data = await safeParseJson(res);
    if (!res.ok) throw new Error(data.error || "Gagal mengunggah gambar artikel.");

    return data.url;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!title.trim() || !slug.trim() || !excerpt.trim() || !content.trim()) {
        throw new Error("Judul, Slug, Ringkasan, dan Isi Konten wajib diisi.");
      }

      const tags = tagsStr
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t.length > 0);

      const payload: Partial<BlogPost> = {
        id: editingPost?.id || String(Date.now()),
        title: title.trim(),
        slug: slug.trim(),
        excerpt: excerpt.trim(),
        content: content.trim(),
        coverImage: coverImage.trim(),
        category: category.trim(),
        author: author.trim(),
        date: editingPost?.date || new Date().toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" }),
        readTime: readTime.trim(),
        tags: tags.length > 0 ? tags : ["TRI J"],
        isHighlight: Boolean(isHighlight),
      };

      await onSave(payload);
      onClose();
    } catch (err: any) {
      setError(err.message || "Gagal menyimpan artikel blog.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white border border-gray-100 w-full max-w-4xl rounded-3xl p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto font-sans">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center transition-colors cursor-pointer z-10"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header Title */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-purple-50 text-[#774EFC] border border-purple-100 flex items-center justify-center font-bold shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-black text-gray-900">
              {editingPost ? "Edit Artikel Blog" : "Tambah Artikel Blog Baru"}
            </h3>
            <p className="text-xs text-gray-500 font-medium">
              Gunakan Visual Rich Text Editor lengkap dengan format H1/H2/H3, Bold, Italic, Underline, Rata Teks, List & Gambar.
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-gray-700 font-bold mb-1">Judul Artikel:</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="Contoh: 7 Tips Memilih Lemari Plastik Awet"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-gray-900 font-semibold focus:outline-none focus:border-[#774EFC]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-700 font-bold mb-1">Slug URL (Unik):</label>
              <input
                type="text"
                required
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="7-tips-memilih-lemari-plastik-awet"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-gray-900 font-mono font-medium focus:outline-none focus:border-[#774EFC]"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-bold mb-1">Kategori Blog:</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-gray-900 font-semibold focus:outline-none focus:border-[#774EFC]"
              >
                <option value="Tips Perabotan">Tips Perabotan</option>
                <option value="Peluang Usaha">Peluang Usaha</option>
                <option value="Review Produk">Review Produk</option>
                <option value="Kemitraan">Kemitraan</option>
                <option value="Berita & Promo">Berita & Promo</option>
              </select>
            </div>
          </div>

          {/* 1. UPLOAD GAMBAR SAMPUL (COVER IMAGE) */}
          <div className="space-y-2">
            <label className="block text-gray-700 font-bold">Gambar Sampul Artikel (Upload Image):</label>
            
            <div className="p-4 bg-gray-50 rounded-2xl border-2 border-dashed border-purple-200 space-y-3">
              {coverImage ? (
                <div className="relative h-44 rounded-xl overflow-hidden border border-gray-200 group bg-gray-100">
                  <img src={coverImage} alt="Cover Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1.5 bg-white text-gray-900 text-xs font-bold rounded-lg shadow-sm hover:bg-gray-100 cursor-pointer"
                    >
                      Ubah Gambar
                    </button>
                    <button
                      type="button"
                      onClick={() => setCoverImage("")}
                      className="px-3 py-1.5 bg-red-600 text-white text-xs font-bold rounded-lg shadow-sm hover:bg-red-700 cursor-pointer"
                    >
                      Hapus
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="py-8 text-center space-y-2 cursor-pointer hover:bg-purple-50/50 transition rounded-xl"
                >
                  <div className="w-12 h-12 rounded-full bg-purple-100 text-[#774EFC] flex items-center justify-center mx-auto">
                    <Upload className="w-6 h-6" />
                  </div>
                  <p className="text-xs font-bold text-gray-700">Klik untuk Unggah Gambar Sampul</p>
                  <p className="text-[10px] text-gray-400">Format: JPG, PNG, WEBP (Maksimal 1MB)</p>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleCoverUpload}
                className="hidden"
              />

              {uploadingCover && (
                <div className="flex items-center justify-center gap-2 text-xs text-[#774EFC] font-semibold animate-pulse py-1">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Mengunggah Gambar Sampul...</span>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-700 font-bold mb-1">Penulis (Author):</label>
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="Tim Spesialis TRI J"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-gray-900 font-semibold focus:outline-none focus:border-[#774EFC]"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-bold mb-1">Estimasi Waktu Baca:</label>
              <input
                type="text"
                value={readTime}
                onChange={(e) => setReadTime(e.target.value)}
                placeholder="5 min baca"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-gray-900 font-semibold focus:outline-none focus:border-[#774EFC]"
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-700 font-bold mb-1">Ringkasan Singkat (Excerpt):</label>
            <textarea
              rows={2}
              required
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Panduan lengkap memilih lemari plastik berkualitas..."
              className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-gray-900 font-medium focus:outline-none focus:border-[#774EFC]"
            />
          </div>

          {/* 2. WYSIWYG RICH TEXT EDITOR (SESUAI FOTO ACUAN USER) */}
          <div className="space-y-2">
            <label className="block text-gray-700 font-bold">
              Isi Konten Artikel (Visual Rich Text Editor):
            </label>

            <RichTextEditor
              value={content}
              onChange={setContent}
              placeholder="Tuliskan isi artikel Anda di sini..."
              onUploadImage={handleUploadInlineImage}
            />

            {/* Live Visual Preview Container */}
            {content.trim().length > 0 && (
              <div className="mt-3 p-5 bg-white border border-purple-100 rounded-2xl shadow-2xs space-y-2">
                <div className="text-[11px] font-extrabold text-[#774EFC] uppercase tracking-wider flex items-center gap-1 border-b border-purple-100 pb-2">
                  <Eye className="w-3.5 h-3.5" />
                  <span>Pratonton Tampilan Artikel (Live Preview):</span>
                </div>
                <div
                  className="prose prose-sm max-w-none text-gray-800 leading-relaxed font-sans pt-1"
                  dangerouslySetInnerHTML={{ __html: content }}
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-gray-700 font-bold mb-1">Tag Artikel (Dipisahkan Koma):</label>
            <input
              type="text"
              value={tagsStr}
              onChange={(e) => setTagsStr(e.target.value)}
              placeholder="Lemari Plastik, Tips Rumah, TRI J"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-gray-900 font-medium focus:outline-none focus:border-[#774EFC]"
            />
          </div>

          {/* Highlight Status Toggle Checkbox */}
          <div className="flex items-center gap-3 p-3.5 bg-amber-50/70 border border-amber-200 rounded-2xl">
            <input
              type="checkbox"
              id="isHighlight"
              checked={isHighlight}
              onChange={(e) => setIsHighlight(e.target.checked)}
              className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500 border-gray-300 cursor-pointer"
            />
            <label htmlFor="isHighlight" className="text-xs font-extrabold text-amber-900 cursor-pointer flex items-center gap-1.5 select-none">
              <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
              <span>Jadikan Artikel Unggulan (Highlight Utama di Halaman Blog)</span>
            </label>
          </div>

          <div className="pt-3 flex items-center justify-end gap-3 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-[#774EFC] hover:bg-[#6332f6] text-white font-bold rounded-xl shadow-md flex items-center gap-2 transition cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>{editingPost ? "Simpan Perubahan" : "Publikasikan Artikel"}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
