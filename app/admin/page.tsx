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
  AlertTriangle,
  X,
  Loader2,
  ShoppingBag,
  Tag,
  Users as UsersIcon,
  Truck,
} from "lucide-react";

import AdminHeader from "@/components/admin/AdminHeader";
import TabButton from "@/components/admin/TabButton";
import ProductsTab from "@/components/admin/ProductsTab";
import CategoriesTab from "@/components/admin/CategoriesTab";
import SlidesTab from "@/components/admin/SlidesTab";
import TestimonialsTab from "@/components/admin/TestimonialsTab";
import OrdersTab from "@/components/admin/OrdersTab";
import VouchersTab from "@/components/admin/VouchersTab";
import UsersTab from "@/components/admin/UsersTab";
import ProductModal from "@/components/admin/ProductModal";
import CategoryModal from "@/components/admin/CategoryModal";
import SlideModal from "@/components/admin/SlideModal";
import TestimonialModal from "@/components/admin/TestimonialModal";
import VoucherModal from "@/components/admin/VoucherModal";
import SettingsTab from "@/components/admin/SettingsTab";
import ReviewsTab from "@/components/admin/ReviewsTab";
import ReviewAdminModal from "@/components/admin/ReviewAdminModal";
import BlogTab from "@/components/admin/BlogTab";
import BlogModal from "@/components/admin/BlogModal";
import WaStatusCard from "@/components/admin/WaStatusCard";
import ChatTab from "@/components/admin/ChatTab";
import SalesReportTab from "@/components/admin/SalesReportTab";
import ProductCsvModal from "@/components/admin/ProductCsvModal";
import { blogPosts, BlogPost } from "@/data/blogPosts";
import { CreditCard as CreditCardIcon, Star, FileText, RotateCw, BarChart3, Download, Upload } from "lucide-react";

type TabType = "products" | "categories" | "slides" | "testimonials" | "reviews" | "orders" | "reports" | "vouchers" | "users" | "blogs" | "settings" | "chat";

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
  const [reviewsList, setReviewsList] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [blogPostsList, setBlogPostsList] = useState<BlogPost[]>([]);
  const [isBlogModalOpen, setIsBlogModalOpen] = useState(false);
  const [editingBlogPost, setEditingBlogPost] = useState<BlogPost | null>(null);
  const [dataLoading, setDataLoading] = useState(false);

  // Search filter
  const [searchQuery, setSearchQuery] = useState("");
  const [voucherSearchQuery, setVoucherSearchQuery] = useState("");
  const [unreadChatCount, setUnreadChatCount] = useState(0);

  // Toast alert
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Centered Alert Modal (Di Tengah Layar)
  const [alertModal, setAlertModal] = useState<{
    title?: string;
    message: string;
    type?: "warning" | "error" | "info";
  } | null>(null);

  // Modals state
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isProductCsvModalOpen, setIsProductCsvModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any | null>(null);

  const [isSlideModalOpen, setIsSlideModalOpen] = useState(false);
  const [editingSlide, setEditingSlide] = useState<any | null>(null);

  const [isTestimonialModalOpen, setIsTestimonialModalOpen] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<any | null>(null);

  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<any | null>(null);
  const [reviewModalMode, setReviewModalMode] = useState<"edit" | "reply">("edit");

  const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState<any | null>(null);

  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any | null>(null);

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

  const loadAllData = async () => {
    if (!user) return;
    setDataLoading(true);
    try {
      const [resP, resC, resS, resT, resO, resV, resU, resRev, resB] = await Promise.all([
        fetch("/api/admin/products"),
        fetch("/api/admin/categories"),
        fetch("/api/admin/hero-slides"),
        fetch("/api/admin/testimonials"),
        fetch("/api/admin/orders"),
        fetch("/api/admin/vouchers"),
        fetch("/api/admin/users"),
        fetch("/api/admin/reviews"),
        fetch("/api/admin/blogs"),
      ]);

      if (resP.ok) setProducts(await resP.json());
      if (resC.ok) setCategories(await resC.json());
      if (resS.ok) setSlides(await resS.json());
      if (resT.ok) setTestimonials(await resT.json());
      if (resV.ok) setVouchers(await resV.json());
      if (resU.ok) setUsersList(await resU.json());
      if (resRev.ok) setReviewsList(await resRev.json());
      if (resB.ok) {
        const blogsData = await resB.json();
        if (Array.isArray(blogsData) && blogsData.length > 0) {
          setBlogPostsList(blogsData);
        }
      }

      let fetchedOrders: any[] = [];
      if (resO.ok) {
        const dataO = await resO.json();
        if (dataO.orders) fetchedOrders = dataO.orders;
      }

      let localOrders: any[] = [];
      try {
        const local = localStorage.getItem("webtrij_user_orders");
        if (local) localOrders = JSON.parse(local);
      } catch (e) { }

      const orderMap = new Map();
      localOrders.forEach((o) => orderMap.set(o.orderNumber || String(o.id), o));
      fetchedOrders.forEach((o) => orderMap.set(o.orderNumber || String(o.id), o));

      setOrders(Array.from(orderMap.values()));
    } catch (err) {
      showToast("Gagal memuat data", "error");
    } finally {
      setDataLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const res = await fetch("/api/admin/reviews");
      if (res.ok) setReviewsList(await res.json());
    } catch (e) { }
  };

  const handleDeleteReview = async (id: number) => {
    if (!confirm("Apakah Anda yakin ingin menghapus penilaian produk ini secara permanen?")) return;
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, { method: "DELETE" });
      if (res.ok) {
        setReviewsList((prev) => prev.filter((r) => Number(r.id) !== Number(id)));
        showToast("Penilaian produk berhasil dihapus!");
      }
    } catch (e) {
      showToast("Gagal menghapus penilaian produk", "error");
    }
  };

  const handleToggleReviewActive = async (id: number, currentStatus: boolean) => {
    try {
      const newStatus = !currentStatus;
      const res = await fetch(`/api/admin/reviews/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: newStatus }),
      });
      if (res.ok) {
        setReviewsList((prev) =>
          prev.map((r) => (Number(r.id) === Number(id) ? { ...r, isActive: newStatus } : r))
        );
        showToast(newStatus ? "Ulasan di-ON-kan (Tampil di Web)!" : "Ulasan di-OFF-kan (Disembunyikan)!");
      }
    } catch (e) {
      showToast("Gagal mengubah status ulasan", "error");
    }
  };

  const handleSaveReview = async (data: any) => {
    const isEdit = Boolean(data.id);
    const url = isEdit ? `/api/admin/reviews/${data.id}` : "/api/admin/reviews";
    const method = isEdit ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.error || "Gagal menyimpan ulasan");
    }

    await fetchReviews();
    showToast(isEdit ? "Penilaian produk berhasil diperbarui!" : "Penilaian produk baru berhasil ditambahkan!");
  };

  const fetchVouchers = async () => {
    try {
      const res = await fetch("/api/admin/vouchers");
      if (res.ok) {
        const data = await res.json();
        setVouchers(data);
      }
    } catch (e) { }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/admin/users");
      if (res.ok) {
        const data = await res.json();
        setUsersList(data);
      }
    } catch (e) { }
  };

  // Load all tab data on initial login and tab switch
  useEffect(() => {
    if (user) {
      loadAllData();
    }
  }, [user]);

  useEffect(() => {
    if (user && activeTab === "vouchers") {
      fetchVouchers();
    }
    if (user && activeTab === "users") {
      fetchUsers();
    }
  }, [user, activeTab]);

  const fetchUnreadChatCount = async () => {
    try {
      const res = await fetch("/api/admin/chat");
      if (res.ok) {
        const data = await res.json();
        const rooms = data.rooms || [];
        const totalUnread = rooms.reduce((acc: number, r: any) => acc + (r.unreadAdmin || 0), 0);
        setUnreadChatCount(totalUnread);
      }
    } catch (e) {}
  };

  useEffect(() => {
    if (user) {
      fetchUnreadChatCount();
      const interval = setInterval(fetchUnreadChatCount, 3000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchBlogsList = async () => {
    try {
      const res = await fetch("/api/admin/blogs");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setBlogPostsList(data);
        }
      }
    } catch (e) {}
  };

  // Load blog posts from DB / static fallback
  useEffect(() => {
    fetchBlogsList();
  }, []);

  const handleSaveBlogPost = async (postData: Partial<BlogPost>) => {
    try {
      const isEdit = Boolean(postData.id);
      const url = "/api/admin/blogs";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(postData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gagal menyimpan artikel blog.");
      }

      await fetchBlogsList();
      showToast(isEdit ? "Artikel blog berhasil diperbarui!" : "Artikel blog baru berhasil dipublikasikan!");
    } catch (err: any) {
      showToast(err.message || "Gagal menyimpan artikel blog.", "error");
    }
  };

  const handleDeleteBlogPost = async (id: string | number) => {
    if (!confirm("Apakah Anda yakin ingin menghapus artikel blog ini?")) return;
    try {
      const res = await fetch(`/api/admin/blogs?id=${encodeURIComponent(String(id))}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gagal menghapus artikel blog.");
      }

      await fetchBlogsList();
      showToast("Artikel blog berhasil dihapus!");
    } catch (err: any) {
      showToast(err.message || "Gagal menghapus artikel blog.", "error");
    }
  };

  const handleToggleHighlightBlogPost = async (post: BlogPost) => {
    const willBeHighlight = !post.isHighlight;
    try {
      const res = await fetch("/api/admin/blogs", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: post.id, isHighlight: willBeHighlight }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gagal mengupdate status highlight artikel.");
      }

      await fetchBlogsList();
      showToast(willBeHighlight ? "Artikel dijadikan Highlight Utama!" : "Artikel dihapus dari Highlight!");
    } catch (err: any) {
      showToast(err.message || "Gagal mengupdate status highlight.", "error");
    }
  };

  // User Actions
  const handleEditUser = (u: any) => {
    setEditingUser(u);
    setIsUserModalOpen(true);
  };

  const handleDeleteUser = async (id: number) => {
    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok) {
        setUsersList((prev) => prev.filter((u) => Number(u.id) !== Number(id)));
        showToast("User berhasil dihapus!");
      } else {
        setAlertModal({
          title: "Gagal Menghapus User",
          message: data.error || "Gagal menghapus user.",
          type: "error",
        });
      }
    } catch {
      showToast("Terjadi kesalahan saat menghapus user", "error");
    }
  };

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
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
      if (res.ok) {
        setProducts((prev) => prev.filter((p) => Number(p.id) !== Number(id)));
        showToast("Produk berhasil dihapus!");
        const resP = await fetch("/api/admin/products");
        if (resP.ok) setProducts(await resP.json());
      } else {
        const err = await res.json();
        showToast(err.error || "Gagal menghapus produk", "error");
      }
    } catch {
      showToast("Terjadi kesalahan saat menghapus produk", "error");
    }
  };

  // Category Actions
  const handleDeleteCategory = async (id: number) => {
    const target = categories.find((c) => Number(c.id) === Number(id));
    const count = target?._count?.products || 0;
    if (count > 0) {
      setAlertModal({
        title: "Kategori Tidak Dapat Dihapus",
        message: `Kategori "${target?.name || ''}" sedang digunakan oleh ${count} produk dan tidak dapat dihapus. Silakan hapus atau ubah kategori produk terkait terlebih dahulu.`,
        type: "warning",
      });
      return;
    }

    try {
      const res = await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok) {
        setCategories((prev) => prev.filter((c) => Number(c.id) !== Number(id)));
        showToast("Kategori berhasil dihapus!");
        const resC = await fetch("/api/admin/categories");
        if (resC.ok) setCategories(await resC.json());
      } else {
        setAlertModal({
          title: "Gagal Menghapus Kategori",
          message: data.error || "Gagal menghapus kategori.",
          type: "error",
        });
      }
    } catch {
      showToast("Terjadi kesalahan saat menghapus kategori", "error");
    }
  };

  // Hero Slide Actions
  const handleDeleteSlide = async (id: number) => {
    try {
      const res = await fetch(`/api/admin/hero-slides/${id}`, { method: "DELETE" });
      if (res.ok) {
        setSlides((prev) => prev.filter((s) => Number(s.id) !== Number(id)));
        showToast("Hero banner berhasil dihapus!");
        const resS = await fetch("/api/admin/hero-slides");
        if (resS.ok) setSlides(await resS.json());
      }
    } catch {
      showToast("Terjadi kesalahan saat menghapus banner", "error");
    }
  };

  // Testimonial Actions
  const handleDeleteTestimonial = async (id: number) => {
    try {
      const res = await fetch(`/api/admin/testimonials/${id}`, { method: "DELETE" });
      if (res.ok) {
        setTestimonials((prev) => prev.filter((t) => Number(t.id) !== Number(id)));
        showToast("Testimoni berhasil dihapus!");
        const resT = await fetch("/api/admin/testimonials");
        if (resT.ok) setTestimonials(await resT.json());
      }
    } catch {
      showToast("Terjadi kesalahan saat menghapus testimoni", "error");
    }
  };

  // Voucher Actions
  const handleDeleteVoucher = async (id: number) => {
    const target = vouchers.find((v) => Number(v.id) === Number(id));
    if (target && target.isActive) {
      setAlertModal({
        title: "Peringatan Hapus Voucher",
        message: "Voucher yang sedang aktif tidak dapat dihapus. Silakan nonaktifkan terlebih dahulu.",
      });
      return;
    }

    try {
      const res = await fetch(`/api/admin/vouchers/${id}`, { method: "DELETE" });
      if (res.ok) {
        setVouchers((prev) => prev.filter((v) => Number(v.id) !== Number(id)));
        showToast("Voucher berhasil dihapus!");
        const resV = await fetch("/api/admin/vouchers");
        if (resV.ok) setVouchers(await resV.json());
      } else {
        const data = await res.json();
        setAlertModal({
          title: "Peringatan Hapus Voucher",
          message: data.error || "Gagal menghapus voucher.",
        });
      }
    } catch {
      showToast("Terjadi kesalahan saat menghapus voucher", "error");
    }
  };

  const handleBatchDeleteVouchers = async (ids: number[]) => {
    if (!ids || ids.length === 0) return;
    const activeSelected = vouchers.filter((v) => ids.map(Number).includes(Number(v.id)) && v.isActive);
    if (activeSelected.length > 0) {
      setAlertModal({
        title: "Peringatan Hapus Voucher Massal",
        message: `Terdapat ${activeSelected.length} voucher aktif terpilih. Voucher yang sedang aktif tidak dapat dihapus. Silakan nonaktifkan terlebih dahulu.`,
      });
      return;
    }

    try {
      const res = await fetch("/api/admin/vouchers", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: ids.map(Number) }),
      });
      if (res.ok) {
        setVouchers((prev) => prev.filter((v) => !ids.map(Number).includes(Number(v.id))));
        showToast(`${ids.length} voucher berhasil dihapus!`);
        const resV = await fetch("/api/admin/vouchers");
        if (resV.ok) setVouchers(await resV.json());
      } else {
        const data = await res.json();
        setAlertModal({
          title: "Peringatan Hapus Voucher Massal",
          message: data.error || "Gagal menghapus voucher massal.",
        });
      }
    } catch {
      showToast("Terjadi kesalahan saat menghapus voucher massal", "error");
    }
  };

  const handleToggleVoucherStatus = async (id: number, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/admin/vouchers/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentStatus }),
      });
      if (res.ok) {
        const updated = await res.json();
        setVouchers(vouchers.map((v) => (v.id === id ? updated : v)));
        showToast(`Status voucher berhasil diubah!`);
      }
    } catch {
      showToast("Gagal merubah status voucher", "error");
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center text-gray-900 font-sans">
        <Loader2 className="w-10 h-10 animate-spin text-red-600 mb-3" />
        <p className="text-sm text-gray-500 font-medium">Memeriksa sesi login...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-5 right-5 z-50 px-5 py-3.5 rounded-2xl shadow-xl border flex items-center gap-3 backdrop-blur-lg text-sm font-medium ${toast.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-red-50 border-red-200 text-red-800"
              }`}
          >
            {toast.type === "success" ? (
              <CheckCircle className="w-5 h-5 text-emerald-600" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600" />
            )}
            <span>{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Centered Alert Modal Dialog (Di Tengah Layar) */}
      <AnimatePresence>
        {alertModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-gray-100 relative text-center space-y-4"
            >
              <button
                onClick={() => setAlertModal(null)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1.5 rounded-full hover:bg-gray-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="w-14 h-14 mx-auto rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
                <AlertTriangle className="w-7 h-7" />
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-1.5">
                  {alertModal.title || "Pemberitahuan Sistem"}
                </h3>
                <p className="text-xs text-gray-600 leading-relaxed font-medium">
                  {alertModal.message}
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setAlertModal(null)}
                  className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold text-xs shadow-md transition cursor-pointer"
                >
                  Saya Mengerti
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Header Component */}
      <AdminHeader user={user} onLogout={handleLogout} />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* WhatsApp Gateway Live Status Card */}
        <WaStatusCard />

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-4 mb-6">
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
          <TabButton
            active={activeTab === "reviews"}
            onClick={() => setActiveTab("reviews")}
            icon={<Star className="w-4 h-4 text-amber-500 fill-amber-400" />}
            label="Penilaian Produk"
            count={reviewsList.length}
          />
          <TabButton
            active={activeTab === "orders"}
            onClick={() => setActiveTab("orders")}
            icon={<ShoppingBag className="w-4 h-4 text-emerald-600" />}
            label="Pesanan Masuk"
            count={orders.length}
          />
          <TabButton
            active={activeTab === "reports"}
            onClick={() => setActiveTab("reports")}
            icon={<BarChart3 className="w-4 h-4 text-purple-600" />}
            label="Laporan Penjualan"
          />
          <TabButton
            active={activeTab === "vouchers"}
            onClick={() => setActiveTab("vouchers")}
            icon={<Tag className="w-4 h-4 text-red-600" />}
            label="Setelan Voucher"
            count={vouchers.length}
          />
          <TabButton
            active={activeTab === "users"}
            onClick={() => setActiveTab("users")}
            icon={<UsersIcon className="w-4 h-4 text-purple-600" />}
            label="Setelan User"
            count={usersList.length}
          />
          <TabButton
            active={activeTab === "blogs"}
            onClick={() => setActiveTab("blogs")}
            icon={<FileText className="w-4 h-4 text-purple-600" />}
            label="Kelola Artikel Blog"
            count={blogPostsList.length}
          />
          <TabButton
            active={activeTab === "chat"}
            onClick={() => setActiveTab("chat")}
            icon={<MessageSquare className="w-4 h-4 text-indigo-600" />}
            label="Live Chat Client"
            badge={unreadChatCount}
          />
          <TabButton
            active={activeTab === "settings"}
            onClick={() => setActiveTab("settings")}
            icon={<CreditCardIcon className="w-4 h-4 text-blue-600" />}
            label="Biaya Admin"
          />
        </div>

        {/* Action Header & Search */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900 capitalize">
              {activeTab === "products" && "Manajemen Input Produk"}
              {activeTab === "categories" && "Manajemen Kategori"}
              {activeTab === "slides" && "Manajemen Hero Banner"}
              {activeTab === "testimonials" && "Manajemen Testimonial"}
              {activeTab === "reviews" && "Manajemen Penilaian Produk Pembeli"}
              {activeTab === "orders" && "Monitoring Pesanan Masuk"}
              {activeTab === "reports" && "Laporan & Analitik Penjualan"}
              {activeTab === "vouchers" && "Manajemen Setelan Voucher Diskon"}
              {activeTab === "users" && "Manajemen & Setelan Pengguna"}
              {activeTab === "blogs" && "Manajemen Artikel Blog & Edukasi"}
              {activeTab === "settings" && "Pengaturan Biaya Admin & Layanan"}
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Tambahkan, perbarui, atau pantau data langsung dari sistem database
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto flex-wrap">
            <button
              type="button"
              onClick={() => {
                loadAllData();
                showToast("Data berhasil dimuat ulang dari database!");
              }}
              className="px-3.5 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-bold rounded-xl shadow-2xs flex items-center gap-1.5 transition cursor-pointer shrink-0"
              title="Sinkronkan & Muat Ulang Data Database"
            >
              <RotateCw className={`w-3.5 h-3.5 text-[#774EFC] ${dataLoading ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </button>
            {activeTab === "products" && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    window.open("/api/admin/products/export", "_blank");
                  }}
                  className="px-3.5 py-2.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 font-bold rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer shrink-0"
                  title="Unduh seluruh data produk ke file CSV"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Export CSV</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsProductCsvModalOpen(true)}
                  className="px-3.5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-extrabold rounded-xl text-xs flex items-center gap-1.5 shadow-md transition cursor-pointer shrink-0"
                  title="Unggah berkas CSV untuk menambah/mengedit produk secara massal"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Import CSV</span>
                </button>
              </>
            )}
            {activeTab === "products" && (
              <div className="relative flex-1 sm:w-64">
                <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari produk..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-red-500 placeholder-gray-400"
                />
              </div>
            )}


            {activeTab !== "orders" && activeTab !== "reports" && activeTab !== "users" && activeTab !== "settings" && activeTab !== "reviews" && activeTab !== "blogs" && activeTab !== "chat" && (
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
                  } else if (activeTab === "vouchers") {
                    setEditingVoucher(null);
                    setIsVoucherModalOpen(true);
                  }
                }}
                className={`px-4 py-2.5 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-2 transition-all cursor-pointer shrink-0 ${activeTab === "vouchers"
                  ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20"
                  : "bg-red-600 hover:bg-red-700 shadow-red-600/20"
                  }`}
              >
                <Plus className="w-4 h-4" />
                <span>
                  {activeTab === "products" && "Tambah Produk Baru"}
                  {activeTab === "categories" && "Tambah Kategori Baru"}
                  {activeTab === "slides" && "Tambah Banner Baru"}
                  {activeTab === "testimonials" && "Tambah Testimoni Baru"}
                  {activeTab === "vouchers" && "Tambah Voucher Baru"}
                </span>
              </button>
            )}
          </div>
        </div>

        {/* Tab Contents */}
        {dataLoading ? (
          <div className="py-20 flex flex-col items-center justify-center text-gray-400">
            <Loader2 className="w-8 h-8 animate-spin text-red-600 mb-2" />
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
                onCopy={(p) => {
                  setEditingProduct({
                    ...p,
                    id: undefined,
                    name: `${p.name} (Salinan)`,
                  });
                  setIsProductModalOpen(true);
                }}
                onDelete={handleDeleteProduct}
                onOpenImportCsv={() => setIsProductCsvModalOpen(true)}
                onExportCsv={() => {
                  window.open("/api/admin/products/export", "_blank");
                }}
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

            {activeTab === "reviews" && (
              <ReviewsTab
                reviews={reviewsList}
                products={products}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                onRefresh={fetchReviews}
                onEditReview={(rev) => {
                  setEditingReview(rev);
                  setReviewModalMode("edit");
                  setIsReviewModalOpen(true);
                }}
                onAddReview={() => {
                  setEditingReview(null);
                  setReviewModalMode("edit");
                  setIsReviewModalOpen(true);
                }}
                onDeleteReview={handleDeleteReview}
                onToggleActive={handleToggleReviewActive}
                onReplyReview={(rev) => {
                  setEditingReview(rev);
                  setReviewModalMode("reply");
                  setIsReviewModalOpen(true);
                }}
              />
            )}

            {activeTab === "orders" && (
              <OrdersTab
                orders={orders}
                onRefresh={loadAllData}
                showToast={showToast}
              />
            )}

            {activeTab === "reports" && (
              <SalesReportTab orders={orders} />
            )}

            {activeTab === "vouchers" && (
              <VouchersTab
                vouchers={vouchers}
                searchQuery={voucherSearchQuery}
                onSearchChange={setVoucherSearchQuery}
                onOpenCreateModal={() => {
                  setEditingVoucher(null);
                  setIsVoucherModalOpen(true);
                }}
                onOpenEditModal={(v) => {
                  setEditingVoucher(v);
                  setIsVoucherModalOpen(true);
                }}
                onDeleteVoucher={handleDeleteVoucher}
                onBatchDeleteVouchers={handleBatchDeleteVouchers}
                onToggleStatus={handleToggleVoucherStatus}
              />
            )}

            {activeTab === "users" && (
              <UsersTab
                users={usersList}
                orders={orders}
                onEditUser={handleEditUser}
                onDeleteUser={handleDeleteUser}
              />
            )}

            {activeTab === "blogs" && (
              <BlogTab
                posts={blogPostsList}
                onAddPost={() => {
                  setEditingBlogPost(null);
                  setIsBlogModalOpen(true);
                }}
                onEditPost={(post) => {
                  setEditingBlogPost(post);
                  setIsBlogModalOpen(true);
                }}
                onDeletePost={handleDeleteBlogPost}
                onToggleHighlight={handleToggleHighlightBlogPost}
              />
            )}

            {activeTab === "chat" && <ChatTab />}

            {activeTab === "settings" && (
              <SettingsTab onShowToast={showToast} />
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
          onSuccess={async (saved: any) => {
            setIsProductModalOpen(false);
            try {
              const resP = await fetch("/api/admin/products");
              if (resP.ok) {
                const updatedList = await resP.json();
                setProducts(updatedList);
              } else if (saved && saved.id) {
                setProducts((prev) => [saved, ...prev.filter((p) => p.id !== saved.id)]);
              }
            } catch {
              if (saved && saved.id) {
                setProducts((prev) => [saved, ...prev.filter((p) => p.id !== saved.id)]);
              }
            }
            showToast(editingProduct && editingProduct.id ? "Produk berhasil diperbarui!" : "Produk baru (duplikat) berhasil ditambahkan!");
          }}
        />
      )}

      {/* Product CSV Bulk Import Modal */}
      <ProductCsvModal
        isOpen={isProductCsvModalOpen}
        onClose={() => setIsProductCsvModalOpen(false)}
        onSuccess={() => {
          loadAllData();
          showToast("Data produk berhasil diimpor dari berkas CSV!");
        }}
      />

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

      {/* Testimonial Form Modal */}
      {isTestimonialModalOpen && (
        <TestimonialModal
          initialData={editingTestimonial}
          onClose={() => setIsTestimonialModalOpen(false)}
          onSuccess={(saved: any) => {
            setIsTestimonialModalOpen(false);
            if (editingTestimonial) {
              setTestimonials(testimonials.map((t) => (t.id === saved.id ? saved : t)));
              showToast("Testimoni berhasil diperbarui!");
            } else {
              setTestimonials([saved, ...testimonials]);
              showToast("Testimoni baru berhasil ditambahkan!");
            }
          }}
        />
      )}

      {/* Voucher Form Modal */}
      {isVoucherModalOpen && (
        <VoucherModal
          products={products}
          initialData={editingVoucher}
          onClose={() => setIsVoucherModalOpen(false)}
          onSuccess={(saved: any) => {
            setIsVoucherModalOpen(false);
            if (editingVoucher) {
              setVouchers(vouchers.map((v) => (v.id === saved.id ? saved : v)));
              showToast("Voucher diskon berhasil diperbarui!");
            } else {
              setVouchers([saved, ...vouchers]);
              showToast("Voucher diskon baru berhasil ditambahkan!");
            }
          }}
        />
      )}

      {/* Blog Form Modal */}
      <BlogModal
        isOpen={isBlogModalOpen}
        editingPost={editingBlogPost}
        onClose={() => setIsBlogModalOpen(false)}
        onSave={handleSaveBlogPost}
      />

      {/* Review Admin Modal */}
      <ReviewAdminModal
        isOpen={isReviewModalOpen}
        review={editingReview}
        products={products}
        mode={reviewModalMode}
        onClose={() => setIsReviewModalOpen(false)}
        onSave={handleSaveReview}
      />
    </div>
  );
}
