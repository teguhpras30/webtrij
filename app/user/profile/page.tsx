"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import OrderTrackingTimeline from "@/components/user/OrderTrackingTimeline";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Lock,
  Save,
  ShieldCheck,
  Loader2,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  Edit3,
  X,
  Settings,
  Plus,
  Trash2,
  Check,
  ChevronDown,
  Calendar,
  Building2,
  ShoppingBag,
  Truck,
  PackageCheck,
  CreditCard,
  ExternalLink,
  Clock,
  FileText,
  Bell,
  Ticket,
  Coins,
  Shield,
  CreditCard as BankIcon,
  Printer,
  Star
} from "lucide-react";
import Link from "next/link";
import CustomerAuthModal from "@/components/auth/CustomerAuthModal";
import { useAuth } from "@/context/AuthContext";
import { ShopeeLocationPickerDropdown } from "@/components/address/ShopeeLocationPickerDropdown";
import ReviewModal from "@/components/user/ReviewModal";
import { InteractiveMapPinpoint } from "@/components/address/InteractiveMapPinpoint";
import ShippingLabelModal from "@/components/admin/ShippingLabelModal";
import ConfirmReceivedModal from "@/components/user/ConfirmReceivedModal";

export interface AddressItem {
  id: string;
  label: string; // e.g. "Rumah" or "Kantor"
  recipientName: string;
  phone: string;
  provinsiKotaKecamatan: string;
  streetAddress: string;
  address?: string;
  detailLainnya?: string;
  city: string;
  kecamatan: string;
  postalCode?: string;
  isPrimary: boolean;
  isReturnAddress?: boolean;
}

export const SHOPEE_PROVINCE_CITIES_LIST = [
  "JAWA TIMUR, KAB. NGANJUK, KERTOSONO, 64315",
  "JAWA BARAT, KAB. BEKASI, CIKARANG PUSAT, 17530",
  "JAWA BARAT, KAB. BEKASI, CIKARANG BARAT, 17520",
  "JAWA BARAT, KAB. BEKASI, CIKARANG UTARA, 17535",
  "JAWA BARAT, KAB. BEKASI, CIKARANG SELATAN, 17550",
  "JAWA BARAT, KAB. BEKASI, TAMBUN SELATAN, 17510",
  "JAWA BARAT, KOTA BEKASI, BEKASI BARAT, 17145",
  "JAWA BARAT, KOTA BEKASI, BEKASI TIMUR, 17113",
  "DKI JAKARTA, JAKARTA SELATAN, KEBAYORAN BARU, 12110",
  "DKI JAKARTA, JAKARTA TIMUR, CAKUNG, 13910",
  "DKI JAKARTA, JAKARTA BARAT, GROGOL PETAMBURAN, 11470",
  "DKI JAKARTA, JAKARTA PUSAT, TANAH ABANG, 10250",
  "JAWA BARAT, KOTA BANDUNG, BANDUNG WETAN, 40116",
  "JAWA TENGAH, KOTA SEMARANG, SEMARANG TENGAH, 50134",
  "JAWA TIMUR, KOTA SURABAYA, TEGALSARI, 60261",
  "DI YOGYAKARTA, KOTA YOGYAKARTA, MALIOBORO, 55271",
  "BALI, KOTA DENPASAR, DENPASAR SELATAN, 80224",
  "SUMATERA UTARA, KOTA MEDAN, MEDAN KOTA, 20212"
];

// Privacy Masking Helpers (Shopee Style)
const maskEmail = (str: string) => {
  if (!str || !str.includes('@')) return str || '***@***.com';
  const [local, domain] = str.split('@');
  if (local.length <= 2) return `${local[0]}*@${domain}`;
  const maskedLocal = local[0] + '*'.repeat(Math.max(3, local.length - 2)) + local[local.length - 1];
  return `${maskedLocal}@${domain}`;
};

const maskPhone = (str: string) => {
  if (!str) return '0812****7766';
  const clean = str.trim();
  if (clean.length <= 6) return clean;
  const start = clean.slice(0, 4);
  const end = clean.slice(-4);
  return `${start}****${end}`;
};

const maskBirthDate = (str: string) => {
  if (!str) return '** Mei ****';
  const parts = str.split('-');
  if (parts.length === 3) {
    const year = parts[0];
    const monthIndex = parseInt(parts[1], 10) - 1;
    const day = parts[2];
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    const monthName = months[monthIndex] || 'Mei';
    return `** ${monthName} ****`;
  }
  return '** Mei ****';
};

const formatIDR = (val: number) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
};

export default function CustomerProfilePage() {
  const router = useRouter();
  const { user, loading, logout, refreshUser } = useAuth();

  // Active Navigation Sidebar Tab (Shopee Menu Layout)
  const [activeNavTab, setActiveNavTab] = useState<'profil' | 'bank' | 'alamat' | 'password' | 'notifikasi_setting' | 'privasi' | 'pesanan' | 'notifikasi' | 'voucher' | 'koin'>('pesanan');

  const [isEditing, setIsEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // General Form Fields
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  // Tempat Tanggal Lahir & Jenis Kelamin State
  const [birthPlace, setBirthPlace] = useState("Jakarta");
  const [birthDate, setBirthDate] = useState("1995-05-15");
  const [gender, setGender] = useState<"Laki-laki" | "Perempuan">("Laki-laki");

  // Password Form Fields
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Multi-Address Management State
  const [addresses, setAddresses] = useState<AddressItem[]>([]);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);

  // Shopee Orders State (Belum Bayar, Dikemas, Dikirim, Selesai)
  const [userOrders, setUserOrders] = useState<any[]>([]);
  const [orderTab, setOrderTab] = useState<'belum_bayar' | 'dikemas' | 'siap_kirim' | 'dikirim' | 'selesai'>('belum_bayar');
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [profilePrintModal, setProfilePrintModal] = useState<{ order: any; type: "label" | "invoice" } | null>(null);
  const [confirmingOrder, setConfirmingOrder] = useState<any | null>(null);

  // Active Vouchers State for User Profile
  const [activeVouchersList, setActiveVouchersList] = useState<any[]>([]);
  const [loadingVouchersList, setLoadingVouchersList] = useState(false);

  useEffect(() => {
    if (activeNavTab === "voucher") {
      const fetchActiveVouchers = async () => {
        setLoadingVouchersList(true);
        try {
          const res = await fetch("/api/public/vouchers");
          if (res.ok) {
            const data = await res.json();
            setActiveVouchersList(data);
          }
        } catch (err) {
          console.warn("Failed to fetch vouchers:", err);
        } finally {
          setLoadingVouchersList(false);
        }
      };
      fetchActiveVouchers();
    }
  }, [activeNavTab]);

  // Shopee Address Modal Specific State Fields
  const [modalName, setModalName] = useState("");
  const [modalPhone, setModalPhone] = useState("");
  const [modalProvinsiKotaKec, setModalProvinsiKotaKec] = useState(SHOPEE_PROVINCE_CITIES_LIST[0]);
  const [modalStreetAddress, setModalStreetAddress] = useState("");
  const [modalDetailLainnya, setModalDetailLainnya] = useState("");
  const [modalTagLabel, setModalTagLabel] = useState<"Rumah" | "Kantor">("Rumah");
  const [modalIsPrimary, setModalIsPrimary] = useState(false);
  const [modalIsReturn, setModalIsReturn] = useState(false);

  // Review Modal State
  const [reviewingOrder, setReviewingOrder] = useState<any>(null);

  // Load profile, saved addresses, & order history on mount
  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    }
    if (user) {
      setName(user.name || "");
      setUsername(user.username || "");
      setPhone(user.phone || "");
      setEmail(user.email || "");

      // Load extra profile info from localStorage scoped per user ID
      try {
        const extra = localStorage.getItem(`webtrij_user_extra_info_${user.id}`);
        if (extra) {
          const parsed = JSON.parse(extra);
          if (parsed.birthPlace) setBirthPlace(parsed.birthPlace);
          if (parsed.birthDate) setBirthDate(parsed.birthDate);
          if (parsed.gender) setGender(parsed.gender);
        } else {
          setBirthPlace("");
          setBirthDate("");
          setGender("Laki-laki");
        }
      } catch (e) {
        console.warn("Failed to load extra profile info");
      }

      // Load saved addresses array from localStorage scoped per user ID
      try {
        const saved = localStorage.getItem(`webtrij_addresses_${user.id}`);
        if (saved) {
          setAddresses(JSON.parse(saved));
        } else if (user.address) {
          const initialAddr: AddressItem = {
            id: `addr-${user.id}-1`,
            label: "Rumah",
            recipientName: user.name || user.username || "",
            phone: user.phone || "",
            provinsiKotaKecamatan: "",
            streetAddress: user.address,
            detailLainnya: "",
            city: "",
            kecamatan: "",
            isPrimary: true,
            isReturnAddress: false
          };
          setAddresses([initialAddr]);
          localStorage.setItem(`webtrij_addresses_${user.id}`, JSON.stringify([initialAddr]));
        } else {
          setAddresses([]);
        }
      } catch (e) {
        console.warn("Failed to load user addresses");
      }

      // Fetch user orders history strictly for the authenticated user from PostgreSQL database
      const fetchOrders = async () => {
        try {
          setLoadingOrders(true);
          let apiOrders: any[] = [];
          const res = await fetch("/api/user/orders");
          if (res.ok) {
            const data = await res.json();
            if (data.orders && Array.isArray(data.orders)) {
              apiOrders = data.orders;
            }
          }
          setUserOrders(apiOrders);
        } catch (e) {
          console.error("Failed to fetch user orders:", e);
          setUserOrders([]);
        } finally {
          setLoadingOrders(false);
        }
      };
      fetchOrders();
    }
  }, [user, loading, router]);

  const handleOpenConfirmReceivedModal = (order: any) => {
    setConfirmingOrder(order);
  };

  const handleExecuteConfirmOrder = async (order: any) => {
    setConfirmingOrder(null);
    const orderIdentifier = order.orderNumber || String(order.id);

    try {
      // 1. Update in LocalStorage
      let localOrders: any[] = [];
      try {
        const local = localStorage.getItem("webtrij_user_orders");
        if (local) localOrders = JSON.parse(local);
      } catch (e) { }

      const updatedLocal = localOrders.map((o: any) => {
        if ((o.orderNumber || String(o.id)) === orderIdentifier) {
          return { ...o, status: "COMPLETED" };
        }
        return o;
      });
      localStorage.setItem("webtrij_user_orders", JSON.stringify(updatedLocal));

      // 2. Update state userOrders
      setUserOrders((prev) =>
        prev.map((o: any) => {
          if ((o.orderNumber || String(o.id)) === orderIdentifier) {
            return { ...o, status: "COMPLETED" };
          }
          return o;
        })
      );

      // 3. Send PUT request to API
      await fetch("/api/user/orders", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderNumber: orderIdentifier,
          status: "COMPLETED",
        }),
      });

      setNotice({
        type: "success",
        message: `🎉 Pesanan ${orderIdentifier} berhasil dikonfirmasi selesai! Silakan beri penilaian produk.`,
      });

      // Automatically open review modal for this order
      setReviewingOrder(order);
    } catch (err) {
      console.error("Failed to confirm order received:", err);
    }
  };

  // Save addresses to LocalStorage and sync to PostgreSQL Database
  const saveAddressesToStorage = async (updatedList: AddressItem[]) => {
    setAddresses(updatedList);
    try {
      if (user?.id) {
        localStorage.setItem(`webtrij_addresses_${user.id}`, JSON.stringify(updatedList));
      }
    } catch (e) {
      console.warn("Failed to save user addresses in localStorage");
    }

    try {
      // Format all user addresses into newline-separated string for DB storage
      const formattedAddresses = updatedList
        .map((a) => {
          const recipientStr = a.recipientName
            ? `${a.recipientName} (${a.phone || ""})`
            : "";
          const streetStr = a.streetAddress || a.address || "";
          const regionStr = a.provinsiKotaKecamatan || "";
          const detailStr = a.detailLainnya ? `(${a.detailLainnya})` : "";
          const full = [recipientStr, streetStr, detailStr, regionStr]
            .filter(Boolean)
            .join(" - ")
            .trim();
          return full;
        })
        .filter(Boolean)
        .join("\n");

      await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: formattedAddresses }),
      });
    } catch (err) {
      console.warn("Failed to sync user addresses to database:", err);
    }
  };

  const handleCancelEdit = () => {
    if (user) {
      setName(user.name || "");
      setUsername(user.username || "");
      setPhone(user.phone || "");
      setEmail(user.email || "");
    }
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setIsEditing(false);
    setNotice(null);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setNotice(null);

    if (newPassword && newPassword.trim()) {
      if (user?.hasPasswordSet && !currentPassword) {
        setNotice({ type: "error", message: "Masukkan password saat ini (lama) untuk verifikasi." });
        return;
      }
      if (newPassword.trim().length < 6) {
        setNotice({ type: "error", message: "Password baru minimal 6 karakter." });
        return;
      }
      if (newPassword !== confirmPassword) {
        setNotice({ type: "error", message: "Konfirmasi password baru tidak cocok." });
        return;
      }
    }

    try {
      setSubmitting(true);
      const primaryAddr = addresses.find(a => a.isPrimary) || addresses[0];

      try {
        if (user?.id) {
          localStorage.setItem(
            `webtrij_user_extra_info_${user.id}`,
            JSON.stringify({ birthPlace, birthDate, gender })
          );
        }
      } catch (e) {
        console.warn("Failed to save extra profile info");
      }

      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          username,
          phone,
          email,
          address: primaryAddr ? `${primaryAddr.streetAddress}, ${primaryAddr.provinsiKotaKecamatan}` : "",
          currentPassword: currentPassword || undefined,
          newPassword: newPassword || undefined
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal memperbarui profil.");

      setNotice({ type: "success", message: "Data Diri, Tempat/Tgl Lahir, Jenis Kelamin & Password berhasil disimpan!" });
      setIsEditing(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      await refreshUser();
    } catch (err: any) {
      setNotice({ type: "error", message: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAccountRequest = async () => {
    const confirmDelete = confirm(
      "⚠️ PERINGATAN PENGHAPUSAN AKUN!\n\nApakah Anda yakin ingin menghapus akun ini secara permanen?\nSemua data alamat, voucher, dan riwayat pesanan Anda akan dihapus total."
    );
    if (!confirmDelete) return;

    try {
      setSubmitting(true);
      const res = await fetch("/api/user/profile", {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menghapus akun.");

      try {
        localStorage.removeItem("webtrij_addresses");
        localStorage.removeItem("webtrij_user_extra_info");
        localStorage.removeItem("webtrij_user_orders");
      } catch (e) { }

      alert("🎉 Akun Anda telah berhasil dihapus secara permanen. Terima kasih telah menggunakan layanan TRI J.");
      await logout();
      router.push("/");
    } catch (err: any) {
      alert(`Error Hapus Akun: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handlePayOrder = async (order: any) => {
    try {
      setSubmitting(true);

      // Ensure Midtrans Snap JS is loaded on browser
      if (!(window as any).snap) {
        await new Promise<void>((resolve) => {
          const script = document.createElement("script");
          script.src = "https://app.sandbox.midtrans.com/snap/snap.js";
          script.setAttribute(
            "data-client-key",
            process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || "Mid-client-ivvkvuIpo0fLIzma"
          );
          script.onload = () => resolve();
          script.onerror = () => resolve();
          document.head.appendChild(script);
        });
      }

      let snapToken = order.snapToken;

      if (!snapToken) {
        const orderItems = order.items && order.items.length > 0
          ? order.items.map((item: any) => ({
            id: item.product?.id || item.id || 1,
            name: item.product?.name || "Produk TRI J",
            price: item.unitPrice || item.totalPrice || order.grandTotal,
            quantity: item.quantity || 1
          }))
          : [{
            id: 1,
            name: `Pesanan ${order.orderNumber}`,
            price: order.grandTotal,
            quantity: 1
          }];

        const res = await fetch("/api/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId: order.orderNumber || order.id,
            items: orderItems,
            customerName: user?.name || user?.username || order.customerName || "Teguh Pras",
            customerPhone: user?.phone || order.customerPhone || "(+62) 859 6034 1220",
            customerEmail: user?.email || order.customerEmail || "pembeli@webtrij.co.id",
            shippingAddress: user?.address || order.shippingAddress || "Cikarang Pusat, Kab. Bekasi",
            isB2B: false,
            promoDiscount: 0,
            shippingDiscount: 0,
            adminFee: 0
          })
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Gagal membuat sesi pembayaran Midtrans");
        snapToken = data.snapToken;
      }

      if (snapToken && (window as any).snap) {
        (window as any).snap.pay(snapToken, {
          onSuccess: function () {
            alert("🎉 Pembayaran Berhasil! Pesanan Anda berpindah ke tab Sedang Dikemas.");
            window.location.reload();
          },
          onPending: function () {
            alert("📌 Pembayaran diproses. Anda dapat menyelesaikan pembayaran di simulator Midtrans.");
            window.location.reload();
          },
          onError: function () {
            alert("❌ Pembayaran gagal atau dibatalkan.");
          },
          onClose: function () {
            window.location.reload();
          }
        });
      } else {
        alert("⚠️ Gagal memuat jendela Midtrans Snap. Silakan coba kembali.");
      }
    } catch (err: any) {
      alert(`Error Payment Gateway: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  // Shopee Address Modal Handlers
  const handleOpenAddAddress = () => {
    setEditingAddressId(null);
    setModalName(name || user?.name || user?.username || "");
    setModalPhone(phone || user?.phone || "");
    setModalProvinsiKotaKec("");
    setModalStreetAddress("");
    setModalDetailLainnya("");
    setModalTagLabel("Rumah");
    setModalIsPrimary(addresses.length === 0);
    setModalIsReturn(false);
    setIsAddressModalOpen(true);
  };

  const handleOpenEditAddress = (addr: AddressItem) => {
    setEditingAddressId(addr.id);
    setModalName(addr.recipientName);
    setModalPhone(addr.phone);
    setModalProvinsiKotaKec(addr.provinsiKotaKecamatan || SHOPEE_PROVINCE_CITIES_LIST[0]);
    setModalStreetAddress(addr.streetAddress || addr.address || "");
    setModalDetailLainnya(addr.detailLainnya || "");
    setModalTagLabel((addr.label as "Rumah" | "Kantor") || "Rumah");
    setModalIsPrimary(addr.isPrimary);
    setModalIsReturn(!!addr.isReturnAddress);
    setIsAddressModalOpen(true);
  };

  const handleSaveShopeeAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalStreetAddress.trim() || !modalName.trim()) return;

    let updatedList = [...addresses];

    if (modalIsPrimary) {
      updatedList = updatedList.map(a => ({ ...a, isPrimary: false }));
    }

    const parts = modalProvinsiKotaKec.split(', ');
    const city = parts[1] || "Kab. Bekasi";
    const kecamatan = parts[2] || "Cikarang Pusat";

    if (editingAddressId) {
      updatedList = updatedList.map(a => {
        if (a.id === editingAddressId) {
          return {
            ...a,
            label: modalTagLabel,
            recipientName: modalName,
            phone: modalPhone,
            provinsiKotaKecamatan: modalProvinsiKotaKec,
            streetAddress: modalStreetAddress,
            detailLainnya: modalDetailLainnya,
            address: modalStreetAddress,
            city,
            kecamatan,
            isPrimary: modalIsPrimary,
            isReturnAddress: modalIsReturn
          };
        }
        return a;
      });
    } else {
      const newAddr: AddressItem = {
        id: `addr-${Date.now()}`,
        label: modalTagLabel,
        recipientName: modalName,
        phone: modalPhone,
        provinsiKotaKecamatan: modalProvinsiKotaKec,
        streetAddress: modalStreetAddress,
        detailLainnya: modalDetailLainnya,
        address: modalStreetAddress,
        city,
        kecamatan,
        isPrimary: modalIsPrimary || addresses.length === 0,
        isReturnAddress: modalIsReturn
      };
      updatedList.push(newAddr);
    }

    saveAddressesToStorage(updatedList);
    setIsAddressModalOpen(false);
  };

  const handleDeleteAddress = (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus alamat ini?")) {
      const updatedList = addresses.filter(a => a.id !== id);
      if (updatedList.length > 0 && !updatedList.some(a => a.isPrimary)) {
        updatedList[0].isPrimary = true;
      }
      saveAddressesToStorage(updatedList);
    }
  };

  const handleSetPrimaryAddress = (id: string) => {
    const updatedList = addresses.map(a => ({
      ...a,
      isPrimary: a.id === id
    }));
    saveAddressesToStorage(updatedList);
  };

  // Filtered Orders according to active orderTab
  const filteredOrders = useMemo(() => {
    const isReadyStatus = (status: string) => {
      const s = (status || "").toUpperCase();
      return s === 'READY_TO_SHIP' || s === 'WAITING_PICKUP' || s === 'ALLOCATED' || s === 'PICKING_UP';
    };

    const isShippedStatus = (status: string) => {
      const s = (status || "").toUpperCase();
      return s === 'SHIPPED' || s === 'IN_TRANSIT' || s === 'PICKED_UP' || s === 'DROPPING_OFF' || s === 'DELIVERED';
    };

    if (orderTab === 'belum_bayar') {
      return userOrders.filter(o => (o.status || '').toUpperCase() === 'PENDING');
    } else if (orderTab === 'dikemas') {
      return userOrders.filter(o => (o.status || '').toUpperCase() === 'PAID' || (o.status || '').toUpperCase() === 'PACKING');
    } else if (orderTab === 'siap_kirim') {
      return userOrders.filter(o => isReadyStatus(o.status));
    } else if (orderTab === 'dikirim') {
      return userOrders.filter(o => isShippedStatus(o.status));
    } else if (orderTab === 'selesai') {
      return userOrders.filter(o => (o.status || '').toUpperCase() === 'COMPLETED');
    }
    return userOrders;
  }, [userOrders, orderTab]);

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 text-gray-900 font-sans flex items-center justify-center">
        <div className="flex items-center gap-3 text-[#EE4D2D] font-bold">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Memuat data profil...</span>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900 font-sans flex flex-col justify-between">
      <div>
        <Navbar />

        <section className="mx-auto max-w-6xl px-4 pt-28 pb-20">
          {/* BANNER PERINGATAN VERIFIKASI WA JIKA AKUN BELUM TERVERIFIKASI */}
          {user && user.isVerified === false && (
            <div className="bg-amber-50 border border-amber-200 rounded-3xl p-4 sm:p-5 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-lg shrink-0">
                  📱
                </div>
                <div>
                  <h4 className="font-extrabold text-xs sm:text-sm text-amber-900">
                    Akun Anda Belum Terverifikasi WhatsApp!
                  </h4>
                  <p className="text-xs text-amber-700">
                    Verifikasi nomor WhatsApp Anda untuk mengklaim voucher eksklusif member & membuka akses transaksi.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAuthModalOpen(true)}
                className="px-5 py-2.5 bg-[#774EFC] hover:bg-[#6332f6] text-white font-extrabold text-xs rounded-2xl shadow-md cursor-pointer shrink-0 transition"
              >
                Verifikasi WA OTP Sekarang
              </button>
            </div>
          )}

          {notice && (
            <div
              className={`p-4 rounded-2xl border text-xs font-semibold flex items-center gap-3 mb-6 animate-in fade-in duration-200 ${notice.type === "success"
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : "bg-rose-50 border-rose-200 text-rose-800"
                }`}
            >
              {notice.type === "success" ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              )}
              <span>{notice.message}</span>
            </div>
          )}
          {/* MAIN 2-COLUMN LAYOUT: SHOPEE LEFT SIDEBAR MENU + RIGHT PANEL */}
          <div className="flex flex-col md:flex-row items-start gap-8">
            {/* LEFT SHOPEE NAVIGATION SIDEBAR MENU */}
            <aside className="w-full md:w-56 shrink-0 bg-white rounded-2xl border border-gray-200 p-5 shadow-xs font-sans space-y-5">
              {/* User Brief Avatar Header */}
              <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name || "User"}
                    className="w-12 h-12 rounded-full object-cover shadow-sm shrink-0 border border-orange-200"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#EE4D2D] to-orange-500 text-white flex items-center justify-center font-bold text-lg shadow-sm shrink-0">
                    {user?.name?.[0] || user?.username?.[0] || 'U'}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-xs text-gray-900 truncate">{user?.name || user?.username}</div>
                  <button
                    type="button"
                    onClick={() => setActiveNavTab('profil')}
                    className="text-[11px] text-gray-500 hover:text-[#EE4D2D] flex items-center gap-1 cursor-pointer mt-0.5"
                  >
                    <Edit3 className="w-3 h-3 text-gray-400" />
                    <span>Ubah Profil</span>
                  </button>
                </div>
              </div>

              {/* Menu Categories List (100% Shopee Layout) */}
              <div className="space-y-4 text-xs font-semibold">
                {/* 1. Akun Saya (With Sub-Items) */}
                <div className="space-y-2">
                  <div className="font-bold text-gray-900 flex items-center gap-2 text-xs">
                    <User className="w-4 h-4 text-[#774EFC]" />
                    <span>Akun Saya</span>
                  </div>
                  <div className="pl-6 space-y-2 text-gray-600 font-medium">
                    <button
                      type="button"
                      onClick={() => setActiveNavTab('profil')}
                      className={`block text-left w-full hover:text-[#774EFC] transition-colors cursor-pointer ${activeNavTab === 'profil' ? 'text-[#774EFC] font-bold' : ''
                        }`}
                    >
                      Profil
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveNavTab('alamat')}
                      className={`block text-left w-full hover:text-[#774EFC] transition-colors cursor-pointer ${activeNavTab === 'alamat' ? 'text-[#774EFC] font-bold' : ''
                        }`}
                    >
                      Alamat
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveNavTab('password')}
                      className={`block text-left w-full hover:text-[#774EFC] transition-colors cursor-pointer ${activeNavTab === 'password' ? 'text-[#774EFC] font-bold' : ''
                        }`}
                    >
                      Ubah Password
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveNavTab('notifikasi_setting')}
                      className={`block text-left w-full hover:text-[#774EFC] transition-colors cursor-pointer ${activeNavTab === 'notifikasi_setting' ? 'text-[#774EFC] font-bold' : ''
                        }`}
                    >
                      Pengaturan Notifikasi
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveNavTab('privasi')}
                      className={`block text-left w-full hover:text-[#774EFC] transition-colors cursor-pointer ${activeNavTab === 'privasi' ? 'text-[#774EFC] font-bold' : ''
                        }`}
                    >
                      Pengaturan Privasi
                    </button>
                  </div>
                </div>

                {/* 2. Pesanan Saya */}
                <div>
                  <button
                    type="button"
                    onClick={() => setActiveNavTab('pesanan')}
                    className={`flex items-center gap-2 font-bold w-full text-left transition-colors cursor-pointer ${activeNavTab === 'pesanan' ? 'text-[#774EFC]' : 'text-gray-900 hover:text-[#774EFC]'
                      }`}
                  >
                    <ShoppingBag className="w-4 h-4 text-[#774EFC]" />
                    <span>Pesanan Saya</span>
                  </button>
                </div>

                {/* 3. Notifikasi */}
                <div>
                  <button
                    type="button"
                    onClick={() => setActiveNavTab('notifikasi')}
                    className={`flex items-center gap-2 font-bold w-full text-left transition-colors cursor-pointer ${activeNavTab === 'notifikasi' ? 'text-[#774EFC]' : 'text-gray-900 hover:text-[#774EFC]'
                      }`}
                  >
                    <Bell className="w-4 h-4 text-amber-500" />
                    <span>Notifikasi</span>
                  </button>
                </div>

                {/* 4. Voucher Saya */}
                <div>
                  <button
                    type="button"
                    onClick={() => setActiveNavTab('voucher')}
                    className={`flex items-center gap-2 font-bold w-full text-left transition-colors cursor-pointer ${activeNavTab === 'voucher' ? 'text-[#774EFC]' : 'text-gray-900 hover:text-[#774EFC]'
                      }`}
                  >
                    <Ticket className="w-4 h-4 text-[#774EFC]" />
                    <span>Voucher Saya</span>
                  </button>
                </div>
              </div>
            </aside>

            {/* RIGHT MAIN CONTENT AREA PANEL */}
            <div className="flex-1 min-w-0 w-full space-y-6">
              {/* TAB 1: PROFIL & DATA DIRI */}
              {activeNavTab === 'profil' && (
                <form onSubmit={handleSaveProfile} className="bg-white rounded-3xl border border-gray-200 p-6 md:p-8 shadow-sm space-y-5">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                    <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                      <User className="w-5 h-5 text-[#774EFC]" />
                      <span>Data Diri & Kontak Pelanggan</span>
                    </h2>
                    {!isEditing && (
                      <button
                        type="button"
                        onClick={() => setIsEditing(true)}
                        className="text-xs font-bold text-[#774EFC] hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Ubah Profil</span>
                      </button>
                    )}
                  </div>

                  {/* Foto Profil Avatar Header Card */}
                  <div className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-100">
                    {user?.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name || "User"}
                        className="w-16 h-16 rounded-full object-cover border-2 border-purple-200 shadow-sm shrink-0"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-purple-600 to-pink-500 text-white flex items-center justify-center font-bold text-2xl shadow-sm shrink-0 uppercase">
                        {user?.name?.[0] || user?.username?.[0] || "U"}
                      </div>
                    )}
                    <div className="space-y-1">
                      <div className="font-bold text-sm text-gray-900">{user?.name || user?.username}</div>
                      {user?.avatar && (
                        <div className="inline-flex items-center gap-1 text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200 mt-1">
                          <span>Google Account Avatar</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {!isEditing ? (
                    <div className="space-y-3.5 text-xs">
                      <div className="flex items-center justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-500 w-36 md:w-44 shrink-0 font-semibold">Username</span>
                        <span className="text-gray-900 font-bold flex-1">{username || user?.username || '-'}</span>
                      </div>

                      <div className="flex items-center justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-500 w-36 md:w-44 shrink-0 font-semibold">Nama Lengkap</span>
                        <span className="text-gray-900 font-bold flex-1">{name || user?.name || '-'}</span>
                      </div>

                      <div className="flex items-center justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-500 w-36 md:w-44 shrink-0 font-semibold">Alamat Email</span>
                        <div className="flex items-center justify-between flex-1">
                          <span className="text-gray-900 font-bold font-mono">{maskEmail(email || user?.email || '')}</span>
                          <button
                            type="button"
                            onClick={() => setIsEditing(true)}
                            className="text-[#774EFC] font-bold text-[11px] hover:underline cursor-pointer ml-2"
                          >
                            Ubah
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-500 w-36 md:w-44 shrink-0 font-semibold">Nomor Telepon</span>
                        <div className="flex items-center justify-between flex-1">
                          <span className="text-gray-900 font-bold font-mono">{maskPhone(phone || user?.phone || '')}</span>
                          <button
                            type="button"
                            onClick={() => setIsEditing(true)}
                            className="text-[#774EFC] font-bold text-[11px] hover:underline cursor-pointer ml-2"
                          >
                            Ubah
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-500 w-36 md:w-44 shrink-0 font-semibold">Jenis Kelamin</span>
                        <span className="text-gray-900 font-bold flex-1">
                          {gender === 'Laki-laki' ? '👨 Laki-laki' : '👩 Perempuan'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-500 w-36 md:w-44 shrink-0 font-semibold">Tempat, Tanggal Lahir</span>
                        <div className="flex items-center justify-between flex-1">
                          <span className="text-gray-900 font-bold font-mono">
                            {birthPlace}, {maskBirthDate(birthDate)}
                          </span>
                          <button
                            type="button"
                            onClick={() => setIsEditing(true)}
                            className="text-[#774EFC] font-bold text-[11px] hover:underline cursor-pointer ml-2"
                          >
                            Ubah
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs animate-in fade-in duration-200">
                      <div>
                        <label className="block text-gray-700 mb-1.5 font-bold">Nama Lengkap:</label>
                        <input
                          type="text"
                          value={name}
                          onChange={e => setName(e.target.value)}
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-gray-900 font-semibold focus:outline-none focus:border-[#774EFC]"
                        />
                      </div>

                      <div>
                        <label className="block text-gray-700 mb-1.5 font-bold">Username Akun:</label>
                        <input
                          type="text"
                          value={username}
                          onChange={e => setUsername(e.target.value)}
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-gray-900 font-semibold focus:outline-none focus:border-[#774EFC]"
                        />
                      </div>

                      <div>
                        <label className="block text-gray-700 mb-1.5 font-bold">Nomor WA / HP:</label>
                        <input
                          type="text"
                          value={phone}
                          onChange={e => setPhone(e.target.value)}
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-gray-900 font-semibold focus:outline-none focus:border-[#774EFC]"
                        />
                      </div>

                      <div>
                        <label className="block text-gray-700 mb-1.5 font-bold">Alamat Email:</label>
                        <input
                          type="email"
                          value={email}
                          onChange={e => setEmail(e.target.value)}
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-gray-900 font-semibold focus:outline-none focus:border-[#774EFC]"
                        />
                      </div>

                      <div>
                        <label className="block text-gray-700 mb-1.5 font-bold">Tempat Lahir:</label>
                        <input
                          type="text"
                          value={birthPlace}
                          onChange={e => setBirthPlace(e.target.value)}
                          placeholder="Contoh: Jakarta / Bekasi"
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-gray-900 font-semibold focus:outline-none focus:border-[#774EFC]"
                        />
                      </div>

                      <div>
                        <label className="block text-gray-700 mb-1.5 font-bold">Tanggal Lahir:</label>
                        <input
                          type="date"
                          value={birthDate}
                          onChange={e => setBirthDate(e.target.value)}
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-gray-900 font-semibold focus:outline-none focus:border-[#774EFC] cursor-pointer"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-gray-700 mb-1.5 font-bold">Jenis Kelamin:</label>
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => setGender("Laki-laki")}
                            className={`px-5 py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${gender === "Laki-laki"
                              ? "bg-purple-50 border-[#774EFC] text-[#774EFC] shadow-xs"
                              : "bg-gray-50 border-gray-200 text-gray-700 hover:border-gray-300"
                              }`}
                          >
                            👨 Laki-laki
                          </button>

                          <button
                            type="button"
                            onClick={() => setGender("Perempuan")}
                            className={`px-5 py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${gender === "Perempuan"
                              ? "bg-purple-50 border-[#774EFC] text-[#774EFC] shadow-xs"
                              : "bg-gray-50 border-gray-200 text-gray-700 hover:border-gray-300"
                              }`}
                          >
                            👩 Perempuan
                          </button>
                        </div>
                      </div>

                      <div className="md:col-span-2 flex items-center justify-end gap-3 pt-3 border-t">
                        <button
                          type="button"
                          onClick={handleCancelEdit}
                          className="px-6 py-2.5 bg-gray-200 text-gray-700 font-bold text-xs rounded-xl"
                        >
                          Batal
                        </button>
                        <button
                          type="submit"
                          disabled={submitting}
                          className="px-6 py-2.5 bg-[#774EFC] hover:bg-[#6332f6] text-white font-bold text-xs rounded-xl shadow-xs"
                        >
                          {submitting ? 'Menyimpan...' : 'Simpan Profil'}
                        </button>
                      </div>
                    </div>
                  )}
                </form>
              )}



              {/* TAB 3: DAFTAR ALAMAT PENGIRIMAN */}
              {activeNavTab === 'alamat' && (
                <div className="bg-white rounded-3xl border border-gray-200 p-6 md:p-8 shadow-sm space-y-5">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                    <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-[#774EFC]" />
                      <span>Daftar Alamat Pengiriman Saya ({addresses.length} Alamat)</span>
                    </h2>

                    <button
                      type="button"
                      onClick={handleOpenAddAddress}
                      className="px-4 py-2 bg-[#774EFC] hover:bg-[#6332f6] text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md shadow-purple-500/20 transition-all cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>+ Tambah Alamat Baru</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                    {addresses.map((addr) => (
                      <div
                        key={addr.id}
                        className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${addr.isPrimary
                          ? "bg-purple-50/40 border-[#774EFC] ring-1 ring-purple-200"
                          : "bg-gray-50/50 border-gray-200 hover:border-gray-300"
                          }`}
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-gray-900 text-xs px-2.5 py-0.5 bg-gray-200 rounded-lg border border-gray-300">
                                {addr.label}
                              </span>
                              {addr.isPrimary && (
                                <span className="text-[10px] font-bold text-[#774EFC] bg-purple-100 px-2 py-0.5 rounded-full border border-purple-300">
                                  Utama / Pribadi
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => handleOpenEditAddress(addr)}
                                className="p-1 text-gray-500 hover:text-gray-900 transition-colors"
                                title="Edit Alamat"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              {addresses.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => handleDeleteAddress(addr.id)}
                                  className="p-1 text-gray-400 hover:text-rose-600 transition-colors"
                                  title="Hapus Alamat"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </div>

                          <div className="text-xs text-gray-900 font-bold mb-1">
                            {addr.recipientName} ({addr.phone})
                          </div>
                          <p className="text-xs text-gray-600 leading-relaxed line-clamp-2">
                            {addr.streetAddress || addr.address}
                          </p>
                          {addr.detailLainnya && (
                            <p className="text-[11px] text-gray-400 mt-0.5">{addr.detailLainnya}</p>
                          )}
                          <p className="text-[11px] text-gray-500 mt-1 font-mono">{addr.provinsiKotaKecamatan}</p>
                        </div>

                        {!addr.isPrimary && (
                          <div className="pt-3 mt-3 border-t border-gray-200">
                            <button
                              type="button"
                              onClick={() => handleSetPrimaryAddress(addr.id)}
                              className="text-[11px] font-bold text-[#774EFC] hover:underline flex items-center gap-1 cursor-pointer"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Jadikan Alamat Utama</span>
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 4: UBAH PASSWORD */}
              {activeNavTab === 'password' && (
                <form onSubmit={handleSaveProfile} className="bg-white rounded-3xl border border-gray-200 p-6 md:p-8 shadow-sm space-y-5">
                  <h2 className="text-base font-bold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-4">
                    <KeyRound className="w-5 h-5 text-indigo-600" />
                    <span>Ubah Password Akun</span>
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs">
                    {user?.hasPasswordSet && (
                      <div>
                        <label className="block text-gray-700 mb-1.5 font-bold">Password Saat Ini:</label>
                        <input
                          type="password"
                          placeholder="••••••••"
                          value={currentPassword}
                          onChange={e => setCurrentPassword(e.target.value)}
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-gray-900 focus:outline-none focus:border-[#774EFC]"
                        />
                      </div>
                    )}

                    <div>
                      <label className="block text-gray-700 mb-1.5 font-bold">Password Baru (min 6 kar):</label>
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-gray-900 focus:outline-none focus:border-[#774EFC]"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 mb-1.5 font-bold">Konfirmasi Password Baru:</label>
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-gray-900 focus:outline-none focus:border-[#774EFC]"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end pt-3 border-t">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-6 py-2.5 bg-[#774EFC] hover:bg-[#6332f6] text-white font-extrabold text-xs rounded-xl shadow-md shadow-purple-500/20 transition-all cursor-pointer"
                    >
                      {submitting ? "Menyimpan..." : "Simpan Password Baru"}
                    </button>
                  </div>
                </form>
              )}

              {/* TAB 5: PENGATURAN NOTIFIKASI */}
              {activeNavTab === 'notifikasi_setting' && (
                <div className="bg-white rounded-3xl border border-gray-200 p-6 md:p-8 shadow-sm space-y-5">
                  <h2 className="text-base font-bold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-4">
                    <Bell className="w-5 h-5 text-amber-500" />
                    <span>Pengaturan Notifikasi</span>
                  </h2>
                  <div className="space-y-4 text-xs">
                    <label className="flex items-center justify-between p-3 bg-gray-50 rounded-xl cursor-pointer">
                      <span className="font-semibold text-gray-800">Notifikasi Email Status Pesanan</span>
                      <input type="checkbox" defaultChecked className="w-4 h-4 accent-[#774EFC]" />
                    </label>
                    <label className="flex items-center justify-between p-3 bg-gray-50 rounded-xl cursor-pointer">
                      <span className="font-semibold text-gray-800">Notifikasi WA Resi Ekspedisi</span>
                      <input type="checkbox" defaultChecked className="w-4 h-4 accent-[#774EFC]" />
                    </label>
                  </div>
                </div>
              )}

              {/* TAB 6: PENGATURAN PRIVASI & HAPUS AKUN (SHOPEE STYLE) */}
              {activeNavTab === 'privasi' && (
                <div className="bg-white rounded-3xl border border-gray-200 p-6 md:p-8 shadow-sm space-y-6">
                  <h2 className="text-base font-bold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-4">
                    <Shield className="w-5 h-5 text-emerald-600" />
                    <span>Pengaturan Privasi & Keamanan Akun</span>
                  </h2>

                  <div className="space-y-3 text-xs text-gray-600 leading-relaxed bg-emerald-50/50 p-4 rounded-2xl border border-emerald-200">
                    <h3 className="font-bold text-emerald-900 flex items-center gap-1.5 text-xs">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>Perlindungan Data Sensitif Pelanggan</span>
                    </h3>
                    <p>
                      Data sensitif seperti alamat email, nomor telepon, dan tanggal lahir Anda dilindungi dengan enkripsi & sensor sensorik (*) saat dalam mode tampilan publik.
                    </p>
                  </div>

                  {/* Hapus Akun Saya Box (Shopee Account Deletion) */}
                  <div className="pt-4 border-t border-gray-200 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold text-rose-700 flex items-center gap-2">
                        <Trash2 className="w-4 h-4 text-rose-600" />
                        <span>Pengajuan Penghapusan Akun Saya</span>
                      </h3>
                      <span className="text-[10px] bg-rose-50 text-rose-700 px-2.5 py-0.5 rounded-full font-bold border border-rose-200">
                        Tindakan Permanen
                      </span>
                    </div>

                    <div className="bg-rose-50/60 p-4 rounded-2xl border border-rose-200 text-xs space-y-2 text-rose-900">
                      <p className="font-bold">Sebelum mengajukan penghapusan akun, mohon perhatikan ketentuan berikut:</p>
                      <ul className="list-disc pl-4 space-y-1 text-[11px] text-rose-800">
                        <li>Semua pesanan yang sedang berjalan (Belum Bayar, Dikemas, Dikirim) harus diselesaikan terlebih dahulu.</li>
                        <li>Riwayat transaksi, daftar alamat tersimpan, voucher diskon, dan koin member Anda akan dihapus secara permanen.</li>
                        <li>Akun yang telah dihapus tidak dapat diaktifkan kembali.</li>
                      </ul>
                    </div>

                    <button
                      type="button"
                      onClick={handleDeleteAccountRequest}
                      className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-md shadow-rose-500/20 flex items-center gap-2 transition-all cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Hapus Akun Saya Secara Permanen</span>
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 7: PESANAN SAYA (BELUM BAYAR, DIKEMAS, DIKIRIM, SELESAI) */}
              {activeNavTab === 'pesanan' && (
                <div className="bg-white rounded-3xl border border-gray-200 p-6 md:p-8 shadow-sm space-y-5">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                    <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                      <ShoppingBag className="w-5 h-5 text-[#774EFC]" />
                      <span>Pesanan Saya</span>
                    </h2>
                  </div>

                  {/* Status Tab Bar (Belum Bayar | Dikemas | Siap Kirim | Dikirim | Selesai) */}
                  <div className="flex items-center border-b border-gray-200 text-xs font-bold bg-white overflow-x-auto">
                    <button
                      type="button"
                      onClick={() => setOrderTab('belum_bayar')}
                      className={`flex-1 min-w-[90px] py-3 text-center transition-all cursor-pointer relative ${orderTab === 'belum_bayar'
                        ? 'text-[#774EFC] border-b-2 border-[#774EFC]'
                        : 'text-gray-500 hover:text-gray-800'
                        }`}
                    >
                      Belum Bayar
                      {userOrders.filter(o => o.status === 'PENDING').length > 0 && (
                        <span className="ml-1.5 px-2 py-0.2 bg-[#774EFC] text-white text-[10px] rounded-full">
                          {userOrders.filter(o => o.status === 'PENDING').length}
                        </span>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => setOrderTab('dikemas')}
                      className={`flex-1 min-w-[110px] py-3 text-center transition-all cursor-pointer relative ${orderTab === 'dikemas'
                        ? 'text-[#774EFC] border-b-2 border-[#774EFC]'
                        : 'text-gray-500 hover:text-gray-800'
                        }`}
                    >
                      Sedang Dikemas
                      {userOrders.filter(o => o.status === 'PAID' || o.status === 'PACKING').length > 0 && (
                        <span className="ml-1.5 px-2 py-0.2 bg-[#774EFC] text-white text-[10px] rounded-full">
                          {userOrders.filter(o => o.status === 'PAID' || o.status === 'PACKING').length}
                        </span>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => setOrderTab('siap_kirim')}
                      className={`flex-1 min-w-[140px] py-3 text-center transition-all cursor-pointer relative ${orderTab === 'siap_kirim'
                        ? 'text-[#774EFC] border-b-2 border-[#774EFC]'
                        : 'text-gray-500 hover:text-gray-800'
                        }`}
                    >
                      Siap Kirim
                      {userOrders.filter(o => ['READY_TO_SHIP', 'WAITING_PICKUP', 'ALLOCATED', 'PICKING_UP'].includes((o.status || '').toUpperCase())).length > 0 && (
                        <span className="ml-1.5 px-2 py-0.2 bg-[#774EFC] text-white text-[10px] rounded-full">
                          {userOrders.filter(o => ['READY_TO_SHIP', 'WAITING_PICKUP', 'ALLOCATED', 'PICKING_UP'].includes((o.status || '').toUpperCase())).length}
                        </span>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => setOrderTab('dikirim')}
                      className={`flex-1 min-w-[90px] py-3 text-center transition-all cursor-pointer relative ${orderTab === 'dikirim'
                        ? 'text-[#774EFC] border-b-2 border-[#774EFC]'
                        : 'text-gray-500 hover:text-gray-800'
                        }`}
                    >
                      Dikirim
                      {userOrders.filter(o => ['SHIPPED', 'IN_TRANSIT', 'PICKED_UP', 'DROPPING_OFF', 'DELIVERED'].includes((o.status || '').toUpperCase())).length > 0 && (
                        <span className="ml-1.5 px-2 py-0.2 bg-[#774EFC] text-white text-[10px] rounded-full">
                          {userOrders.filter(o => ['SHIPPED', 'IN_TRANSIT', 'PICKED_UP', 'DROPPING_OFF', 'DELIVERED'].includes((o.status || '').toUpperCase())).length}
                        </span>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => setOrderTab('selesai')}
                      className={`flex-1 min-w-[80px] py-3 text-center transition-all cursor-pointer relative ${orderTab === 'selesai'
                        ? 'text-[#774EFC] border-b-2 border-[#774EFC]'
                        : 'text-gray-500 hover:text-gray-800'
                        }`}
                    >
                      Selesai
                    </button>
                  </div>

                  {/* Order Cards List */}
                  <div className="space-y-4 pt-2">
                    {loadingOrders ? (
                      <div className="py-8 text-center text-gray-500 text-xs font-semibold flex items-center justify-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-[#774EFC]" />
                        <span>Memuat daftar pesanan...</span>
                      </div>
                    ) : filteredOrders.length === 0 ? (
                      <div className="py-12 text-center space-y-2">
                        <div className="w-12 h-12 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mx-auto">
                          <ShoppingBag className="w-6 h-6" />
                        </div>
                        <p className="text-xs font-bold text-gray-600">Belum ada pesanan pada status ini.</p>
                        <p className="text-[11px] text-gray-400">Jelajahi katalog perabotan rumah tangga TRI J dan buat pesanan Anda!</p>
                      </div>
                    ) : (
                      filteredOrders.map((order) => (
                        <div
                          key={order.id}
                          className="bg-white border border-gray-200 rounded-2xl p-4 md:p-5 shadow-xs space-y-3"
                        >
                          <div className="flex items-center justify-between border-b border-gray-100 pb-3 text-xs">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-gray-900">{order.orderNumber}</span>
                              <span className="text-gray-400">•</span>
                              <span className="text-gray-500 text-[11px]">
                                {new Date(order.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                              </span>
                            </div>

                            <div>
                              {order.status === 'PENDING' && (
                                <span className="px-2.5 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold rounded-full flex items-center gap-1">
                                  <Clock className="w-3 h-3 text-amber-600" />
                                  <span>Belum Bayar</span>
                                </span>
                              )}
                              {(order.status === 'PAID' || order.status === 'PACKING') && (
                                <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold rounded-full flex items-center gap-1">
                                  <PackageCheck className="w-3 h-3 text-blue-600" />
                                  <span>Sedang Dikemas</span>
                                </span>
                              )}
                              {(order.status === 'READY_TO_SHIP' || order.status === 'WAITING_PICKUP' || order.status === 'ALLOCATED' || order.status === 'PICKING_UP') && (
                                <span className="px-2.5 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold rounded-full flex items-center gap-1">
                                  <Clock className="w-3 h-3 text-amber-600" />
                                  <span>
                                    {order.status === 'ALLOCATED'
                                      ? 'Siap Kirim (Kurir Ditunjuk)'
                                      : order.status === 'PICKING_UP'
                                        ? 'Siap Kirim (Kurir Menuju Toko)'
                                        : 'Siap Kirim'}
                                  </span>
                                </span>
                              )}
                              {(order.status === 'SHIPPED' || order.status === 'IN_TRANSIT' || order.status === 'PICKED_UP' || order.status === 'DROPPING_OFF' || order.status === 'DELIVERED') && (
                                <span className={`px-2.5 py-0.5 border text-[10px] font-bold rounded-full flex items-center gap-1 ${order.status === 'DELIVERED'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : 'bg-purple-50 text-purple-700 border-purple-200'
                                  }`}>
                                  {order.status === 'DELIVERED' ? (
                                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                  ) : (
                                    <Truck className="w-3 h-3 text-purple-600" />
                                  )}
                                  <span>
                                    {order.status === 'PICKED_UP'
                                      ? 'Paket Diambil Kurir'
                                      : order.status === 'DROPPING_OFF'
                                        ? 'Kurir Menuju Alamat Anda'
                                        : order.status === 'DELIVERED'
                                          ? 'Barang Sampai Tujuan ✅'
                                          : 'Sedang Dikirim'}
                                  </span>
                                </span>
                              )}
                              {order.status === 'COMPLETED' && (
                                <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold rounded-full flex items-center gap-1">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                  <span>Pesanan Selesai</span>
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Visual Lifecycle Stepper: Sedang Dikemas ==> Siap Kirim ==> Di Kirim ==> Selesai */}
                          {order.status !== 'PENDING' && (
                            <div className="bg-gray-50/80 p-3.5 rounded-2xl border border-gray-200/80 space-y-2">
                              <div className="flex items-center justify-between text-[11px] font-bold text-gray-700">
                                <span>Pelacakan Status Pesanan:</span>
                                <span className="text-[#774EFC] font-bold">
                                  {order.status === 'PAID' || order.status === 'PACKING'
                                    ? '📦 1. Sedang Dikemas di Gudang TRI J'
                                    : order.status === 'ALLOCATED'
                                      ? '⏳ 2. Siap Kirim (Kurir Ditunjuk)'
                                      : order.status === 'PICKING_UP'
                                        ? '⏳ 2. Siap Kirim (Kurir Menuju Toko TRI J)'
                                        : order.status === 'READY_TO_SHIP' || order.status === 'WAITING_PICKUP'
                                          ? '⏳ 2. Siap Kirim'
                                          : order.status === 'PICKED_UP'
                                            ? `🚚 3. Di Kirim (Paket Diambil Kurir - Resi: ${order.waybillNumber || 'BITESHIP-9988'})`
                                            : order.status === 'DROPPING_OFF'
                                              ? `🚚 3. Di Kirim (Kurir Dalam Perjalanan ke Alamat Pembeli - Resi: ${order.waybillNumber || 'BITESHIP-9988'})`
                                              : order.status === 'DELIVERED'
                                                ? `✅ 3. Di Kirim (Barang Sampai Tujuan ✅)`
                                                : order.status === 'SHIPPED' || order.status === 'IN_TRANSIT'
                                                  ? `🚚 3. Di Kirim (Resi: ${order.waybillNumber || 'BITESHIP-9988'})`
                                                  : '✅ 4. Pesanan Diterima (Selesai)'}
                                </span>
                              </div>

                              <div className="flex items-center justify-between relative px-4 sm:px-8 py-2.5">
                                {/* Progress Connecting Line */}
                                <div className="absolute top-1/2 left-8 right-8 h-1 bg-gray-200 -translate-y-1/2 -z-0">
                                  <div
                                    className="h-full bg-[#774EFC] transition-all duration-500 rounded-full"
                                    style={{
                                      width: order.status === 'COMPLETED' || order.status === 'DELIVERED'
                                        ? '100%'
                                        : (order.status === 'SHIPPED' || order.status === 'IN_TRANSIT' || order.status === 'PICKED_UP' || order.status === 'DROPPING_OFF')
                                          ? '66%'
                                          : (order.status === 'READY_TO_SHIP' || order.status === 'WAITING_PICKUP' || order.status === 'ALLOCATED' || order.status === 'PICKING_UP')
                                            ? '33%'
                                            : '0%'
                                    }}
                                  />
                                </div>

                                {/* Step 1: Sedang Dikemas */}
                                <div className="flex flex-col items-center gap-1 relative z-10">
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shadow-xs transition-all ${order.status === 'PAID' || order.status === 'PACKING' || order.status === 'READY_TO_SHIP' || order.status === 'WAITING_PICKUP' || order.status === 'SHIPPED' || order.status === 'IN_TRANSIT' || order.status === 'DELIVERED' || order.status === 'COMPLETED'
                                    ? 'bg-[#774EFC] text-white ring-4 ring-purple-100'
                                    : 'bg-gray-200 text-gray-400'
                                    }`}>
                                    <PackageCheck className="w-4 h-4" />
                                  </div>
                                  <span className={`text-[10px] font-bold ${order.status === 'PAID' || order.status === 'PACKING' ? 'text-[#774EFC]' : 'text-gray-600'
                                    }`}>1. Dikemas</span>
                                </div>

                                {/* Step 2: Siap Kirim */}
                                <div className="flex flex-col items-center gap-1 relative z-10">
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shadow-xs transition-all ${order.status === 'READY_TO_SHIP' || order.status === 'WAITING_PICKUP' || order.status === 'SHIPPED' || order.status === 'IN_TRANSIT' || order.status === 'DELIVERED' || order.status === 'COMPLETED'
                                    ? 'bg-[#774EFC] text-white ring-4 ring-purple-100'
                                    : 'bg-gray-200 text-gray-400'
                                    }`}>
                                    <Clock className="w-4 h-4" />
                                  </div>
                                  <span className={`text-[10px] font-bold text-center ${order.status === 'READY_TO_SHIP' || order.status === 'WAITING_PICKUP' ? 'text-[#774EFC]' : 'text-gray-600'
                                    }`}>2. Siap Kirim</span>
                                </div>

                                {/* Step 3: Di Kirim */}
                                <div className="flex flex-col items-center gap-1 relative z-10">
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shadow-xs transition-all ${order.status === 'SHIPPED' || order.status === 'IN_TRANSIT' || order.status === 'DELIVERED' || order.status === 'COMPLETED'
                                    ? 'bg-[#774EFC] text-white ring-4 ring-purple-100'
                                    : 'bg-gray-200 text-gray-400'
                                    }`}>
                                    <Truck className="w-4 h-4" />
                                  </div>
                                  <span className={`text-[10px] font-bold ${order.status === 'SHIPPED' || order.status === 'IN_TRANSIT' ? 'text-[#774EFC]' : 'text-gray-600'
                                    }`}>3. Dikirim</span>
                                </div>

                                {/* Step 4: Selesai */}
                                <div className="flex flex-col items-center gap-1 relative z-10">
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shadow-xs transition-all ${order.status === 'COMPLETED' || order.status === 'DELIVERED'
                                    ? 'bg-emerald-600 text-white ring-4 ring-emerald-100'
                                    : 'bg-gray-200 text-gray-400'
                                    }`}>
                                    <CheckCircle2 className="w-4 h-4" />
                                  </div>
                                  <span className={`text-[10px] font-bold ${order.status === 'COMPLETED' || order.status === 'DELIVERED' ? 'text-emerald-600' : 'text-gray-600'
                                    }`}>4. Selesai</span>
                                </div>
                              </div>

                              {/* Embedded Live Progress Tracking Biteship Timeline */}
                              {['SHIPPED', 'IN_TRANSIT', 'PICKED_UP', 'DROPPING_OFF', 'DELIVERED', 'COMPLETED'].includes((order.status || '').toUpperCase()) && (
                                <OrderTrackingTimeline
                                  waybillNumber={order.waybillNumber || `BITESHIP-${(order.orderNumber || order.id || '443558').replace('ORD-TJ-', '')}`}
                                  courierName={order.courierName || "JNE REG"}
                                  currentStatus={order.status}
                                />
                              )}
                            </div>
                          )}

                          {/* Recipient & Shipping Address Info Box */}
                          <div className="bg-gray-50 p-3.5 rounded-2xl border border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                            <div className="space-y-0.5">
                              <div className="font-bold text-gray-900 flex items-center gap-1.5 text-[11px]">
                                <User className="w-3.5 h-3.5 text-[#774EFC]" />
                                <span>Penerima: {order.customerName || user?.name || "Budi Santoso"}</span>
                              </div>
                              <div className="text-[11px] text-gray-600">
                                HP: <span className="font-medium text-gray-900">{order.customerPhone || user?.phone || "08123456789"}</span>
                              </div>
                            </div>

                            <div className="space-y-0.5">
                              <div className="font-bold text-gray-900 flex items-center gap-1.5 text-[11px]">
                                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Alamat Pengiriman:</span>
                              </div>
                              <p className="text-[11px] text-gray-700 leading-relaxed truncate">
                                {order.shippingAddress || (addresses.find(a => a.isPrimary) ? `${addresses.find(a => a.isPrimary)?.streetAddress}, ${addresses.find(a => a.isPrimary)?.provinsiKotaKecamatan}` : "Jl. Raya Cikarang No. 88, Cikarang Pusat, Kab. Bekasi")}
                              </p>
                            </div>
                          </div>

                          <div className="space-y-3">
                            {order.items?.map((item: any) => (
                              <div key={item.id} className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center shrink-0 overflow-hidden">
                                  {item.product?.thumbnail ? (
                                    <img src={item.product.thumbnail} alt={item.product.name} className="w-full h-full object-cover" />
                                  ) : (
                                    <ShoppingBag className="w-5 h-5 text-gray-400" />
                                  )}
                                </div>
                                <div className="flex-1 min-w-0 text-xs">
                                  <div className="font-bold text-gray-900 truncate">{item.product?.name || item.variantName || 'Produk TRI J'}</div>
                                  {item.variantName && item.product?.name && (
                                    <div className="text-[11px] font-bold text-purple-700 mt-0.5">
                                      Varian: {item.variantName}
                                    </div>
                                  )}
                                  <div className="text-[11px] text-gray-500 mt-0.5">
                                    {item.quantity}x • {formatIDR(item.unitPrice)}
                                  </div>
                                </div>
                                <div className="font-bold text-xs text-gray-900">
                                  {formatIDR(item.totalPrice)}
                                </div>
                              </div>
                            ))}
                          </div>

                          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-t border-gray-100 pt-3 gap-3 text-xs">
                            <div>
                              <span className="text-gray-500">Total Pesanan: </span>
                              <span className="font-extrabold text-[#774EFC] text-sm">{formatIDR(order.grandTotal)}</span>
                            </div>

                            <div className="flex items-center gap-2">
                              {order.status === 'PENDING' && (
                                <button
                                  type="button"
                                  disabled={submitting}
                                  onClick={() => handlePayOrder(order)}
                                  className="px-4 py-2 bg-[#774EFC] hover:bg-[#6332f6] text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
                                >
                                  <CreditCard className="w-3.5 h-3.5" />
                                  <span>{submitting ? "Memuat..." : "Bayar Sekarang"}</span>
                                </button>
                              )}

                              {/* Tombol Konfirmasi Pesanan Selesai (Diterima Pembeli) */}
                              {['SHIPPED', 'IN_TRANSIT', 'PICKED_UP', 'DROPPING_OFF', 'DELIVERED'].includes((order.status || '').toUpperCase()) && (
                                <button
                                  type="button"
                                  onClick={() => handleOpenConfirmReceivedModal(order)}
                                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
                                  title="Konfirmasi bahwa barang sudah Anda terima dengan baik"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>Pesanan Selesai</span>
                                </button>
                              )}

                              {/* Tombol Beri Penilaian Produk (Buka Modal Rating & Ulasan) */}
                              {(order.status || '').toUpperCase() === 'COMPLETED' && (
                                <button
                                  type="button"
                                  onClick={() => setReviewingOrder(order)}
                                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs rounded-xl shadow-md shadow-amber-500/20 flex items-center gap-1.5 transition-all cursor-pointer border border-amber-400"
                                  title="Beri Penilaian Bintang & Ulasan Produk"
                                >
                                  <Star className="w-3.5 h-3.5 fill-white text-white" />
                                  <span>Beri Penilaian</span>
                                </button>
                              )}

                              {/* Tombol Cetak Invoice PDF */}
                              <button
                                type="button"
                                onClick={() => setProfilePrintModal({ order, type: "invoice" })}
                                className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs rounded-xl flex items-center gap-1.5 transition cursor-pointer"
                                title="Cetak Faktur Invoice PDF"
                              >
                                <FileText className="w-3.5 h-3.5 text-blue-600" />
                                <span>📄 Invoice PDF</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* TAB 8: NOTIFIKASI */}
              {activeNavTab === 'notifikasi' && (
                <div className="bg-white rounded-3xl border border-gray-200 p-6 md:p-8 shadow-sm space-y-5">
                  <h2 className="text-base font-bold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-4">
                    <Bell className="w-5 h-5 text-orange-500" />
                    <span>Notifikasi Akun Saya</span>
                  </h2>
                  <div className="p-8 text-center space-y-2 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
                    <Bell className="w-10 h-10 text-gray-400 mx-auto" />
                    <h3 className="text-xs font-bold text-gray-800">Belum Ada Notifikasi Baru</h3>
                    <p className="text-[11px] text-gray-500">Notifikasi perubahan status pengiriman dan promo akan ditampilkan di sini.</p>
                  </div>
                </div>
              )}

              {/* TAB 9: VOUCHER SAYA */}
              {activeNavTab === 'voucher' && (
                <div className="bg-white rounded-3xl border border-gray-200 p-6 md:p-8 shadow-sm space-y-5">
                  <h2 className="text-base font-bold text-[#774EFC] flex items-center gap-2 border-b border-gray-100 pb-4">
                    <Ticket className="w-5 h-5 text-[#774EFC]" />
                    <span>Voucher Diskon & Gratis Ongkir Saya</span>
                  </h2>

                  {loadingVouchersList ? (
                    <div className="py-12 flex flex-col items-center justify-center text-gray-400">
                      <Loader2 className="w-6 h-6 animate-spin text-[#774EFC] mb-2" />
                      <span className="text-xs">Memuat voucher aktif dari toko...</span>
                    </div>
                  ) : activeVouchersList.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {activeVouchersList.map((v) => {
                        const isOngkir =
                          v.code.toUpperCase().includes("ONGKIR") ||
                          v.code.toUpperCase().includes("FREE") ||
                          v.scope === "SHIPPING";
                        const discountTitle = isOngkir
                          ? "Gratis Ongkir"
                          : v.discountType === "PERCENTAGE"
                          ? `Diskon Belanja ${v.discountValue}%`
                          : `Potongan Rp ${v.discountValue.toLocaleString("id-ID")}`;
                        const minText =
                          v.minPurchase > 0
                            ? `Min Belanja Rp ${v.minPurchase.toLocaleString("id-ID")}`
                            : "Tanpa Min Belanja";

                        return (
                          <div
                            key={v.id}
                            className="relative rounded-2xl h-[98px] transition-all overflow-hidden flex items-stretch border border-gray-200 bg-white shadow-2xs hover:shadow-md hover:border-gray-300"
                          >
                            {/* Left Badge Icon Ticket Area */}
                            <div
                              className={`w-28 text-white p-3 flex flex-col items-center justify-center text-center relative shrink-0 ${isOngkir
                                ? "bg-gradient-to-br from-[#2563EB] to-blue-700"
                                : "bg-gradient-to-br from-emerald-600 to-teal-700"
                                }`}
                            >
                              {isOngkir ? (
                                <Truck className="w-6 h-6 mb-1 opacity-95 text-white" />
                              ) : (
                                <ShoppingBag className="w-6 h-6 mb-1 opacity-95 text-white" />
                              )}
                              <span className="text-[9px] font-bold leading-tight uppercase tracking-wider text-white">
                                {isOngkir ? "Potongan Ongkir" : "Diskon Toko"}
                              </span>
                              {/* Half Circle Cutouts */}
                              <div className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-white border-b border-l border-gray-200/80" />
                              <div className="absolute -bottom-2 -right-2 w-4 h-4 rounded-full bg-white border-t border-l border-gray-200/80" />
                            </div>

                            {/* Right Details Area */}
                            <div className="flex-1 p-3.5 flex items-center justify-between min-w-0 bg-white">
                              <div className="pr-2 min-w-0 flex flex-col justify-center space-y-1">
                                <span className="text-xs font-bold text-gray-900 line-clamp-1">
                                  {discountTitle}
                                </span>
                                <div className="text-[11px] text-gray-500 font-medium line-clamp-1">
                                  Kode: <span className="font-bold text-gray-800 font-mono underline">{v.code}</span>
                                </div>
                                <span className="text-[10px] text-gray-400 font-semibold line-clamp-1">
                                  • {minText}
                                </span>
                              </div>

                              <Link
                                href="/products"
                                className="px-2.5 py-1.5 bg-purple-50 hover:bg-purple-100 text-[#774EFC] text-[10px] font-bold rounded-lg border border-purple-200 transition shrink-0 cursor-pointer shadow-2xs"
                              >
                                Pakai
                              </Link>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-8 text-center space-y-2 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
                      <Ticket className="w-10 h-10 text-gray-400 mx-auto" />
                      <h3 className="text-xs font-bold text-gray-800">Belum Ada Voucher Aktif</h3>
                      <p className="text-[11px] text-gray-500">Voucher promo dan potongan ongkir aktif dari toko akan ditampilkan di sini.</p>
                    </div>
                  )}
                </div>
              )}


            </div>
          </div>
        </section>
      </div>

      {/* MODAL SHOPEE UBAH / TAMBAH ALAMAT */}
      {isAddressModalOpen && (
        <div className="fixed inset-0 z-[999] bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 font-sans animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-white rounded-lg shadow-2xl p-6 text-gray-800 space-y-4 border border-gray-100">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-800">
                {editingAddressId ? "Ubah Alamat" : "Alamat Baru"}
              </h3>
              <button
                onClick={() => setIsAddressModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveShopeeAddress} className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="relative border border-gray-300 rounded focus-within:border-gray-500 p-2 pt-1.5">
                  <label className="block text-[10px] text-gray-400 font-normal">Nama Lengkap</label>
                  <input
                    type="text"
                    required
                    value={modalName}
                    onChange={e => setModalName(e.target.value)}
                    placeholder="Contoh: Budi Santoso"
                    className="w-full bg-transparent text-gray-900 font-semibold focus:outline-none text-xs"
                  />
                </div>

                <div className="relative border border-gray-300 rounded focus-within:border-gray-500 p-2 pt-1.5">
                  <label className="block text-[10px] text-gray-400 font-normal">Nomor Telepon</label>
                  <input
                    type="text"
                    required
                    value={modalPhone}
                    onChange={e => setModalPhone(e.target.value)}
                    placeholder="Contoh: 08123456789"
                    className="w-full bg-transparent text-gray-900 font-semibold focus:outline-none text-xs"
                  />
                </div>
              </div>

              <ShopeeLocationPickerDropdown
                value={modalProvinsiKotaKec}
                onChange={(fullVal) => setModalProvinsiKotaKec(fullVal)}
              />

              <div className="relative border border-gray-300 rounded focus-within:border-gray-500 p-2 pt-1.5">
                <label className="block text-[10px] text-gray-400 font-normal">Nama Jalan, Gedung, No. Rumah</label>
                <textarea
                  required
                  rows={2}
                  value={modalStreetAddress}
                  onChange={e => setModalStreetAddress(e.target.value)}
                  placeholder="Contoh: Jl. Merapi No. 12, RT 02/RW 04, Komplek..."
                  className="w-full bg-transparent text-gray-900 font-normal focus:outline-none text-xs leading-relaxed resize-none"
                />
              </div>

              <div className="border border-gray-300 rounded p-2.5">
                <input
                  type="text"
                  value={modalDetailLainnya}
                  onChange={e => setModalDetailLainnya(e.target.value)}
                  placeholder="Detail Lainnya (Cth: Blok / Unit No., Patokan)"
                  className="w-full bg-transparent text-gray-800 placeholder-gray-400 focus:outline-none text-xs"
                />
              </div>

              <InteractiveMapPinpoint
                addressText={`${modalStreetAddress ? modalStreetAddress + ', ' : ''}${modalDetailLainnya ? modalDetailLainnya + ', ' : ''}${modalProvinsiKotaKec}`}
              />

              <div className="space-y-1.5 pt-1">
                <label className="block text-gray-500 text-xs font-normal">Tandai Sebagai:</label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setModalTagLabel("Rumah")}
                    className={`px-4 py-1.5 border text-xs font-normal rounded cursor-pointer transition-all ${modalTagLabel === "Rumah"
                      ? "border-[#EE4D2D] text-[#EE4D2D] bg-orange-50/50 font-bold"
                      : "border-gray-300 text-gray-700 hover:border-gray-400"
                      }`}
                  >
                    Rumah
                  </button>

                  <button
                    type="button"
                    onClick={() => setModalTagLabel("Kantor")}
                    className={`px-4 py-1.5 border text-xs font-normal rounded cursor-pointer transition-all ${modalTagLabel === "Kantor"
                      ? "border-[#EE4D2D] text-[#EE4D2D] bg-orange-50/50 font-bold"
                      : "border-gray-300 text-gray-700 hover:border-gray-400"
                      }`}
                  >
                    Kantor
                  </button>
                </div>
              </div>

              <div className="space-y-1.5 pt-2 text-xs">
                <label className="flex items-center gap-2 text-gray-500 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={modalIsPrimary}
                    onChange={e => setModalIsPrimary(e.target.checked)}
                    className="w-4 h-4 accent-[#EE4D2D] rounded border-gray-300 cursor-pointer"
                  />
                  <span>Atur sebagai Alamat Utama / Pribadi</span>
                </label>

                <label className="flex items-center gap-2 text-gray-500 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={modalIsReturn}
                    onChange={e => setModalIsReturn(e.target.checked)}
                    className="w-4 h-4 accent-[#EE4D2D] rounded border-gray-300 cursor-pointer"
                  />
                  <span>Atur sebagai Alamat Pengembalian</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setIsAddressModalOpen(false)}
                  className="text-xs font-semibold text-gray-600 hover:text-gray-900 cursor-pointer"
                >
                  Nanti Saja
                </button>

                <button
                  type="submit"
                  className="px-8 py-2.5 bg-[#EE4D2D] hover:bg-[#d73f21] text-white font-bold text-xs rounded-xs shadow transition-all cursor-pointer"
                >
                  OK
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Shipping Label & Invoice Print Modal */}
      {profilePrintModal && (
        <ShippingLabelModal
          order={profilePrintModal.order}
          type={profilePrintModal.type}
          onClose={() => setProfilePrintModal(null)}
        />
      )}

      {/* Interactive Review Modal */}
      {reviewingOrder && (
        <ReviewModal
          order={reviewingOrder}
          onClose={() => setReviewingOrder(null)}
          onSuccess={() => {
            setNotice({
              type: "success",
              message: "🎉 Penilaian & ulasan produk Anda berhasil disimpan!",
            });
          }}
        />
      )}

      {/* Customer Auth Modal (jika user klik verifikasi WA) */}
      {isAuthModalOpen && (
        <CustomerAuthModal
          initialTab="login"
          onClose={() => setIsAuthModalOpen(false)}
          onSuccess={() => {
            setIsAuthModalOpen(false);
            window.location.reload();
          }}
        />
      )}

      {/* Modal Konfirmasi Penerimaan Paket Yang Menarik */}
      {confirmingOrder && (
        <ConfirmReceivedModal
          order={confirmingOrder}
          onConfirm={() => handleExecuteConfirmOrder(confirmingOrder)}
          onClose={() => setConfirmingOrder(null)}
        />
      )}

      <Footer />
    </main>
  );
}
