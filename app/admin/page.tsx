"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package,
  Layers,
  Image as ImageIcon,
  MessageSquare,
  Plus,
  Search,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";

import AdminHeader from "@/components/admin/AdminHeader";
import TabButton from "@/components/admin/TabButton";
import ProductsTab from "@/components/admin/ProductsTab";
import CategoriesTab from "@/components/admin/CategoriesTab";
import SlidesTab from "@/components/admin/SlidesTab";
import TestimonialsTab from "@/components/admin/TestimonialsTab";
import ProductModal from "@/components/admin/ProductModal";
import CategoryModal from "@/components/admin/CategoryModal";
import SlideModal from "@/components/admin/SlideModal";
import TestimonialModal from "@/components/admin/TestimonialModal";

type TabType = "products" | "categories" | "slides" | "testimonials";

export default function AdminDashboardPage() {
  const router = useRouter();
  const [authLoading, setAuthLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<TabType>("products");

  // Data states
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [slides, setSlides] = useState<any[]>([]);
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [dataLoading, setDataLoading] = useState(false);

  // Search filter
  const [searchQuery, setSearchQuery] = useState("");

  // Toast alert
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Modals state
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any | null>(null);

  const [isSlideModalOpen, setIsSlideModalOpen] = useState(false);
  const [editingSlide, setEditingSlide] = useState<any | null>(null);

  const [isTestimonialModalOpen, setIsTestimonialModalOpen] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<any | null>(null);

  // Check auth status
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json();

        if (!res.ok || !data.authenticated || data.user?.role?.trim().toUpperCase() !== "ADMIN") {
          router.push("/secret-login");
          return;
        }

        setUser(data.user);
        setAuthLoading(false);
      } catch (err) {
        router.push("/secret-login");
      }
    }
    checkAuth();
  }, [router]);

  // Load all tab data on initial login so badge counts are instantly populated
  useEffect(() => {
    if (!user) return;

    async function loadAllData() {
      setDataLoading(true);
      try {
        const [resP, resC, resS, resT] = await Promise.all([
          fetch("/api/admin/products"),
          fetch("/api/admin/categories"),
          fetch("/api/admin/hero-slides"),
          fetch("/api/admin/testimonials"),
        ]);

        if (resP.ok) setProducts(await resP.json());
        if (resC.ok) setCategories(await resC.json());
        if (resS.ok) setSlides(await resS.json());
        if (resT.ok) setTestimonials(await resT.json());
      } catch (err) {
        showToast("Gagal memuat data", "error");
      } finally {
        setDataLoading(false);
      }
    }

    loadAllData();
  }, [user]);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/secret-login");
  };

  // Product Actions
  const handleDeleteProduct = async (id: number) => {
    if (!confirm("Apakah Anda yakin ingin menghapus produk ini?")) return;
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
      if (res.ok) {
        setProducts(products.filter((p) => p.id !== id));
        showToast("Produk berhasil dihapus!");
      } else {
        const err = await res.json();
        showToast(err.error || "Gagal menghapus produk", "error");
      }
    } catch {
      showToast("Terjadi kesalahan", "error");
    }
  };

  // Category Actions
  const handleDeleteCategory = async (id: number) => {
    if (!confirm("Apakah Anda yakin ingin menghapus kategori ini?")) return;
    try {
      const res = await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok) {
        setCategories(categories.filter((c) => c.id !== id));
        showToast("Kategori berhasil dihapus!");
      } else {
        showToast(data.error || "Gagal menghapus kategori", "error");
      }
    } catch {
      showToast("Terjadi kesalahan", "error");
    }
  };

  // Hero Slide Actions
  const handleDeleteSlide = async (id: number) => {
    if (!confirm("Hapus hero banner ini?")) return;
    try {
      const res = await fetch(`/api/admin/hero-slides/${id}`, { method: "DELETE" });
      if (res.ok) {
        setSlides(slides.filter((s) => s.id !== id));
        showToast("Hero banner berhasil dihapus!");
      }
    } catch {
      showToast("Terjadi kesalahan", "error");
    }
  };

  // Testimonial Actions
  const handleDeleteTestimonial = async (id: number) => {
    if (!confirm("Hapus testimoni ini?")) return;
    try {
      const res = await fetch(`/api/admin/testimonials/${id}`, { method: "DELETE" });
      if (res.ok) {
        setTestimonials(testimonials.filter((t) => t.id !== id));
        showToast("Testimoni berhasil dihapus!");
      }
    } catch {
      showToast("Terjadi kesalahan", "error");
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white">
        <Loader2 className="w-10 h-10 animate-spin text-red-500 mb-3" />
        <p className="text-sm text-slate-400">Memeriksa sesi login...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-5 right-5 z-50 px-5 py-3.5 rounded-2xl shadow-xl border flex items-center gap-3 backdrop-blur-lg text-sm font-medium ${
              toast.type === "success"
                ? "bg-emerald-950/90 border-emerald-500/40 text-emerald-300"
                : "bg-red-950/90 border-red-500/40 text-red-300"
            }`}
          >
            {toast.type === "success" ? (
              <CheckCircle className="w-5 h-5 text-emerald-400" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-400" />
            )}
            <span>{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Component */}
      <AdminHeader user={user} onLogout={handleLogout} />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-4 mb-6">
          <TabButton
            active={activeTab === "products"}
            onClick={() => setActiveTab("products")}
            icon={<Package className="w-4 h-4" />}
            label="Input Produk"
            count={products.length}
          />
          <TabButton
            active={activeTab === "categories"}
            onClick={() => setActiveTab("categories")}
            icon={<Layers className="w-4 h-4" />}
            label="Input Kategori"
            count={categories.length}
          />
          <TabButton
            active={activeTab === "slides"}
            onClick={() => setActiveTab("slides")}
            icon={<ImageIcon className="w-4 h-4" />}
            label="Hero Banner"
            count={slides.length}
          />
          <TabButton
            active={activeTab === "testimonials"}
            onClick={() => setActiveTab("testimonials")}
            icon={<MessageSquare className="w-4 h-4" />}
            label="Testimonial"
            count={testimonials.length}
          />
        </div>

        {/* Action Header & Search */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-white capitalize">
              {activeTab === "products" && "Manajemen Input Produk"}
              {activeTab === "categories" && "Manajemen Kategori"}
              {activeTab === "slides" && "Manajemen Hero Banner"}
              {activeTab === "testimonials" && "Manajemen Testimonial"}
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Tambahkan, perbarui, atau hapus data langsung ke database PostgreSQL
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {activeTab === "products" && (
              <div className="relative flex-1 sm:w-64">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                <input
                  type="text"
                  placeholder="Cari produk..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-red-500"
                />
              </div>
            )}

            <button
              onClick={() => {
                if (activeTab === "products") {
                  setEditingProduct(null);
                  setIsProductModalOpen(true);
                } else if (activeTab === "categories") {
                  setEditingCategory(null);
                  setIsCategoryModalOpen(true);
                } else if (activeTab === "slides") {
                  setEditingSlide(null);
                  setIsSlideModalOpen(true);
                } else if (activeTab === "testimonials") {
                  setEditingTestimonial(null);
                  setIsTestimonialModalOpen(true);
                }
              }}
              className="px-4 py-2.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-red-600/20 flex items-center gap-2 transition-all cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Data Baru</span>
            </button>
          </div>
        </div>

        {/* Tab Contents */}
        {dataLoading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-500">
            <Loader2 className="w-8 h-8 animate-spin text-red-500 mb-2" />
            <span className="text-xs">Memuat data dari database...</span>
          </div>
        ) : (
          <>
            {activeTab === "products" && (
              <ProductsTab
                products={products}
                categories={categories}
                searchQuery={searchQuery}
                onEdit={(p) => {
                  setEditingProduct(p);
                  setIsProductModalOpen(true);
                }}
                onDelete={handleDeleteProduct}
              />
            )}

            {activeTab === "categories" && (
              <CategoriesTab
                categories={categories}
                onEdit={(c) => {
                  setEditingCategory(c);
                  setIsCategoryModalOpen(true);
                }}
                onDelete={handleDeleteCategory}
              />
            )}

            {activeTab === "slides" && (
              <SlidesTab
                slides={slides}
                onEdit={(s) => {
                  setEditingSlide(s);
                  setIsSlideModalOpen(true);
                }}
                onDelete={handleDeleteSlide}
              />
            )}

            {activeTab === "testimonials" && (
              <TestimonialsTab
                testimonials={testimonials}
                onEdit={(t) => {
                  setEditingTestimonial(t);
                  setIsTestimonialModalOpen(true);
                }}
                onDelete={handleDeleteTestimonial}
              />
            )}
          </>
        )}
      </main>

      {/* Product Form Modal */}
      {isProductModalOpen && (
        <ProductModal
          categories={categories}
          initialData={editingProduct}
          onClose={() => setIsProductModalOpen(false)}
          onSuccess={(saved: any) => {
            setIsProductModalOpen(false);
            if (editingProduct) {
              setProducts(products.map((p) => (p.id === saved.id ? saved : p)));
              showToast("Produk berhasil diperbarui!");
            } else {
              setProducts([saved, ...products]);
              showToast("Produk baru berhasil ditambahkan!");
            }
          }}
        />
      )}

      {/* Category Form Modal */}
      {isCategoryModalOpen && (
        <CategoryModal
          initialData={editingCategory}
          onClose={() => setIsCategoryModalOpen(false)}
          onSuccess={(saved: any) => {
            setIsCategoryModalOpen(false);
            if (editingCategory) {
              setCategories(categories.map((c) => (c.id === saved.id ? saved : c)));
              showToast("Kategori berhasil diperbarui!");
            } else {
              setCategories([...categories, saved]);
              showToast("Kategori baru berhasil ditambahkan!");
            }
          }}
        />
      )}

      {/* Hero Slide Modal */}
      {isSlideModalOpen && (
        <SlideModal
          initialData={editingSlide}
          onClose={() => setIsSlideModalOpen(false)}
          onSuccess={(saved: any) => {
            setIsSlideModalOpen(false);
            if (editingSlide) {
              setSlides(slides.map((s) => (s.id === saved.id ? saved : s)));
              showToast("Hero banner diperbarui!");
            } else {
              setSlides([...slides, saved]);
              showToast("Hero banner baru ditambahkan!");
            }
          }}
        />
      )}

      {/* Testimonial Modal */}
      {isTestimonialModalOpen && (
        <TestimonialModal
          initialData={editingTestimonial}
          onClose={() => setIsTestimonialModalOpen(false)}
          onSuccess={(saved: any) => {
            setIsTestimonialModalOpen(false);
            if (editingTestimonial) {
              setTestimonials(testimonials.map((t) => (t.id === saved.id ? saved : t)));
              showToast("Testimoni diperbarui!");
            } else {
              setTestimonials([saved, ...testimonials]);
              showToast("Testimoni baru ditambahkan!");
            }
          }}
        />
      )}
    </div>
  );
}
