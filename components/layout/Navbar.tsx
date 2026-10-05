"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShoppingCart,
  User as UserIcon,
  Menu,
  X,
  LogOut,
  ShieldCheck,
  UserCheck,
  ChevronRight,
  Bell,
  Package,
  Tag,
  CreditCard,
  CheckCheck,
} from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import CustomerAuthModal from "@/components/auth/CustomerAuthModal";

export default function Navbar() {
  const router = useRouter();
  const { user, setUser, logout: authLogout } = useAuth();
  const { totalItems, clearCart, isCartBouncing } = useCart();

  const [isOpen, setIsOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadNotifCount, setUnreadNotifCount] = useState(0);

  // Auth Modal state
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<"login" | "register" | "quick-otp">("quick-otp");

  const dropdownRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // Dynamic Notifications Data Fetcher
  useEffect(() => {
    async function loadNotifications() {
      if (!user) {
        setNotifications([]);
        setUnreadNotifCount(0);
        return;
      }

      const notifs: any[] = [];

      try {
        // Load real user orders
        const resOrders = await fetch("/api/user/orders", { cache: "no-store" });
        if (resOrders.ok) {
          const data = await resOrders.json();
          const orders = data.orders || [];
          orders.forEach((ord: any) => {
            const num = ord.orderNumber || String(ord.id);
            const status = String(ord.status || "").toUpperCase();
            if (status === "PAID" || status === "PROCESSING") {
              notifs.push({
                id: `ord-${ord.id}`,
                title: "Pesanan Sedang Dikemas",
                body: `Pesanan #${num} telah terbayar dan dalam proses pengemasan.`,
                time: "Baru saja",
                type: "package",
              });
            } else if (status === "PENDING") {
              notifs.push({
                id: `ord-${ord.id}`,
                title: "Menunggu Pembayaran",
                body: `Pesanan #${num} siap dibayar via Midtrans Snap.`,
                time: "Baru saja",
                type: "payment",
              });
            } else if (status === "COMPLETED") {
              notifs.push({
                id: `ord-${ord.id}`,
                title: "Pesanan Selesai",
                body: `Pesanan #${num} telah diterima. Terima kasih telah berbelanja!`,
                time: "Selesai",
                type: "completed",
              });
            }
          });
        }
      } catch (e) {}

      try {
        // Load active public vouchers
        const resV = await fetch("/api/public/vouchers", { cache: "no-store" });
        if (resV.ok) {
          const vouchers = await resV.json();
          if (Array.isArray(vouchers)) {
            vouchers.filter((v: any) => v.isActive).forEach((v: any) => {
              notifs.push({
                id: `v-${v.id}`,
                title: `Voucher Diskon ${v.code} Aktif`,
                body: `Gunakan kode ${v.code} untuk potongan belanja Anda di halaman checkout.`,
                time: "Promo",
                type: "voucher",
              });
            });
          }
        }
      } catch (e) {}

      setNotifications(notifs);
      const readCount = typeof window !== "undefined" && user?.id
        ? Number(localStorage.getItem(`webtrij_read_notif_${user.id}`)) || 0
        : 0;
      const unread = Math.max(0, notifs.length - readCount);
      setUnreadNotifCount(unread);
    }

    loadNotifications();
  }, [user]);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotifDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    clearCart();
    await authLogout();
    setUserDropdownOpen(false);
    setNotifDropdownOpen(false);
    router.refresh();
  };

  return (
    <>
      <header className="fixed top-0 left-0 z-50 w-full font-sans">
        <div className="bg-white/80 backdrop-blur-xl border-b border-gray-200/80 shadow-xs">
          <div className="max-w-7xl mx-auto flex items-center justify-between px-5 md:px-10 lg:px-20 py-3">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3">
              <Image
                src="/logotrij.png"
                alt="TRIJ Logo"
                width={80}
                height={28}
                priority
              />
            </Link>

            {/* Desktop Menu */}
            <nav className="hidden md:flex gap-8 text-sm font-medium text-gray-800 items-center">
              <Link href="/" className="hover:text-purple-600 transition">
                Home
              </Link>
              <Link href="/products" className="hover:text-purple-600 transition">
                Products
              </Link>
              <Link href="/about-us" className="hover:text-purple-600 transition">
                About us
              </Link>
              <Link href="/blog" className="hover:text-purple-600 transition">
                Blog
              </Link>
              <Link href="/contact-us" className="hover:text-purple-600 transition">
                Contact us
              </Link>
            </nav>

            {/* Desktop Icons Container - Perfectly Uniform Spacing (gap-3) */}
            <div className="hidden md:flex items-center gap-2 sm:gap-3 text-gray-800 relative">
              {user && (
                <>
                  {/* 1. Notification Bell Dropdown */}
                  <div className="relative" ref={notifRef}>
                    <button
                      onClick={() => {
                        const nextState = !notifDropdownOpen;
                        setNotifDropdownOpen(nextState);
                        setUserDropdownOpen(false);
                        if (nextState) {
                          setUnreadNotifCount(0);
                          if (typeof window !== "undefined" && user?.id) {
                            localStorage.setItem(`webtrij_read_notif_${user.id}`, String(notifications.length));
                          }
                        }
                      }}
                      className="w-9 h-9 rounded-full flex items-center justify-center text-gray-700 hover:text-purple-600 hover:bg-gray-100/80 transition-all cursor-pointer relative"
                      title="Notifikasi & Promo"
                    >
                      <Bell size={20} />
                      {unreadNotifCount > 0 && (
                        <span className="absolute top-0.5 right-0.5 bg-red-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-xs animate-pulse">
                          {unreadNotifCount}
                        </span>
                      )}
                    </button>

                    {notifDropdownOpen && (
                      <div className="absolute right-0 mt-3 w-80 bg-white border border-gray-200 text-gray-900 rounded-2xl shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                          <div className="flex items-center gap-2">
                            <Bell className="w-4 h-4 text-purple-600" />
                            <span className="font-extrabold text-sm text-gray-900">Notifikasi Saya</span>
                          </div>
                          {unreadNotifCount > 0 && (
                            <button
                              onClick={() => {
                                setUnreadNotifCount(0);
                                if (typeof window !== "undefined" && user?.id) {
                                  localStorage.setItem(`webtrij_read_notif_${user.id}`, String(notifications.length));
                                }
                              }}
                              className="text-[10px] text-purple-600 hover:text-purple-700 font-bold transition cursor-pointer flex items-center gap-1"
                            >
                              <CheckCheck className="w-3 h-3" />
                              <span>Tandai Dibaca</span>
                            </button>
                          )}
                        </div>

                        <div className="divide-y divide-gray-100 max-h-72 overflow-y-auto my-2 text-xs">
                          {notifications.length > 0 ? (
                            notifications.map((item) => (
                              <div key={item.id} className="py-2.5 flex items-start gap-3 hover:bg-gray-50 p-2 rounded-xl transition cursor-pointer">
                                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 border ${
                                  item.type === "package" ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                                  item.type === "voucher" ? "bg-purple-50 text-purple-600 border-purple-100" :
                                  item.type === "payment" ? "bg-amber-50 text-amber-600 border-amber-100" :
                                  "bg-blue-50 text-blue-600 border-blue-100"
                                }`}>
                                  {item.type === "package" && <Package className="w-4 h-4" />}
                                  {item.type === "voucher" && <Tag className="w-4 h-4" />}
                                  {item.type === "payment" && <CreditCard className="w-4 h-4" />}
                                  {item.type === "completed" && <CheckCheck className="w-4 h-4" />}
                                </div>
                                <div>
                                  <div className="font-bold text-gray-900">{item.title}</div>
                                  <p className="text-[11px] text-gray-600 mt-0.5 leading-snug">
                                    {item.body}
                                  </p>
                                  <span className="text-[9px] text-gray-400 mt-1 block font-mono">{item.time}</span>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="py-8 text-center text-gray-400 space-y-1">
                              <Bell className="w-8 h-8 mx-auto text-gray-300 stroke-1" />
                              <div className="font-bold text-xs text-gray-700">Belum Ada Notifikasi Baru</div>
                              <p className="text-[11px] text-gray-400 max-w-[200px] mx-auto">
                                Status pesanan dan promo voucher aktif Anda akan muncul di sini.
                              </p>
                            </div>
                          )}
                        </div>

                        <div className="pt-2 border-t border-gray-100 text-center">
                          <Link
                            href="/user/profile"
                            onClick={() => setNotifDropdownOpen(false)}
                            className="text-[11px] font-bold text-purple-600 hover:text-purple-700 transition block py-1"
                          >
                            Lihat Selengkapnya di Pesanan Saya →
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 2. Shopping Cart Button */}
                  <Link
                    id="navbar-cart-icon"
                    href="/cart"
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-gray-700 hover:text-purple-600 hover:bg-gray-100/80 transition-all cursor-pointer relative ${
                      isCartBouncing ? 'animate-cart-bounce text-[#EE4D2D]' : ''
                    }`}
                    title="Halaman Keranjang Belanja"
                  >
                    <ShoppingCart size={20} className={isCartBouncing ? 'text-[#EE4D2D]' : ''} />
                    {totalItems > 0 && (
                      <span className={`absolute top-0.5 right-0.5 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-xs transition-transform ${
                        isCartBouncing ? 'bg-[#EE4D2D] scale-125' : 'bg-indigo-600'
                      }`}>
                        {totalItems}
                      </span>
                    )}
                  </Link>
                </>
              )}

              {/* 3. User Account Popover */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => {
                    setUserDropdownOpen(!userDropdownOpen);
                    setNotifDropdownOpen(false);
                  }}
                  className={`w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer overflow-hidden border ${
                    user
                      ? "border-purple-300 shadow-xs"
                      : "border-transparent text-gray-700 hover:text-purple-600 hover:bg-gray-100/80"
                  }`}
                  title="Akun Saya"
                >
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name || "User"}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className={`w-full h-full flex items-center justify-center ${user ? "bg-purple-600 text-white" : ""}`}>
                      <UserIcon size={18} />
                    </div>
                  )}
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-3 w-64 bg-white border border-gray-200 text-gray-900 rounded-2xl shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    {user ? (
                      <div>
                        <div className="pb-3 mb-3 border-b border-gray-100 flex items-center gap-3">
                          {user.avatar ? (
                            <img
                              src={user.avatar}
                              alt={user.name || "User"}
                              className="w-10 h-10 rounded-full object-cover border border-purple-200 shadow-xs shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center font-bold text-white uppercase text-sm shadow-xs shrink-0">
                              {user.name?.[0] || user.username?.[0] || "U"}
                            </div>
                          )}
                          <div className="overflow-hidden">
                            <div className="font-bold text-sm text-gray-900 truncate">{user.name || user.username}</div>
                            <div className="text-[11px] text-gray-500 truncate">{user.email}</div>
                            <span className="inline-block mt-1 px-2 py-0.2 bg-purple-50 text-purple-700 border border-purple-200 text-[10px] rounded-full font-mono font-semibold">
                              {user.role === "ADMIN" ? "Super Admin" : "Pelanggan"}
                            </span>
                          </div>
                        </div>

                        <div className="space-y-1 text-xs">
                          {user.role === "ADMIN" ? (
                            <Link
                              href="/admin"
                              onClick={() => setUserDropdownOpen(false)}
                              className="w-full px-3 py-2 rounded-xl flex items-center justify-between hover:bg-gray-50 text-gray-700 hover:text-gray-900 transition-colors font-medium"
                            >
                              <div className="flex items-center gap-2">
                                <ShieldCheck className="w-4 h-4 text-red-600" />
                                <span>Dashboard Admin</span>
                              </div>
                              <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                            </Link>
                          ) : (
                            <Link
                              href="/user/profile"
                              onClick={() => setUserDropdownOpen(false)}
                              className="w-full px-3 py-2 rounded-xl flex items-center justify-between hover:bg-gray-50 text-gray-700 hover:text-gray-900 transition-colors font-medium"
                            >
                              <div className="flex items-center gap-2">
                                <UserCheck className="w-4 h-4 text-purple-600" />
                                <span>Profil Saya</span>
                              </div>
                              <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                            </Link>
                          )}

                          <button
                            onClick={handleLogout}
                            className="w-full px-3 py-2 rounded-xl flex items-center gap-2 hover:bg-red-50 text-red-600 transition-colors cursor-pointer text-left font-semibold"
                          >
                            <LogOut className="w-4 h-4" />
                            <span>Keluar (Logout)</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2 text-xs">
                        <div className="text-gray-400 font-semibold mb-2 text-[11px] uppercase tracking-wider">
                          Akun Pelanggan
                        </div>
                        <button
                          onClick={() => {
                            setAuthModalTab("login");
                            setIsAuthModalOpen(true);
                            setUserDropdownOpen(false);
                          }}
                          className="w-full py-2.5 px-3 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-semibold rounded-xl text-center shadow-xs transition-all cursor-pointer"
                        >
                          Masuk Akun
                        </button>
                        <button
                          onClick={() => {
                            setAuthModalTab("register");
                            setIsAuthModalOpen(true);
                            setUserDropdownOpen(false);
                          }}
                          className="w-full py-2.5 px-3 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold rounded-xl text-center transition-colors cursor-pointer"
                        >
                          Daftar Akun Baru
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Mobile Icons & Hamburger Container */}
            <div className="flex md:hidden items-center gap-2">
              {/* Mobile Shopping Cart Icon */}
              {user && (
                <Link
                  href="/cart"
                  className="w-9 h-9 rounded-full flex items-center justify-center text-gray-700 hover:bg-gray-100 transition-all relative"
                  title="Keranjang Belanja"
                >
                  <ShoppingCart size={20} />
                  {totalItems > 0 && (
                    <span className="absolute top-0.5 right-0.5 bg-indigo-600 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                      {totalItems}
                    </span>
                  )}
                </Link>
              )}

              {/* Mobile User Account Button */}
              <button
                onClick={() => {
                  if (user) {
                    router.push("/user/profile");
                  } else {
                    setAuthModalTab("login");
                    setIsAuthModalOpen(true);
                  }
                }}
                className="w-9 h-9 rounded-full flex items-center justify-center text-gray-700 hover:bg-gray-100 transition-all border border-gray-200 overflow-hidden shrink-0"
                title={user ? "Profil Saya" : "Masuk Akun"}
              >
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.name || "User"} className="w-full h-full object-cover rounded-full" />
                ) : (
                  <div className={`w-full h-full flex items-center justify-center ${user ? "bg-purple-600 text-white" : "bg-gray-100 text-gray-700"}`}>
                    <UserIcon size={18} />
                  </div>
                )}
              </button>

              {/* Mobile Hamburger Button */}
              <button className="text-gray-800 p-1" onClick={() => setIsOpen(!isOpen)}>
                {isOpen ? <X size={26} /> : <Menu size={26} />}
              </button>
            </div>
          </div>

          {/* Mobile Dropdown Menu Drawer */}
          {isOpen && (
            <div className="md:hidden bg-white/95 backdrop-blur-xl border-t border-gray-200 shadow-xl animate-in fade-in duration-200">
              {/* User Info / Login Buttons Header in Mobile Drawer */}
              {user ? (
                <div className="p-4 bg-purple-50/70 border-b border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name || "User"} className="w-10 h-10 rounded-full object-cover border border-purple-200 shadow-xs" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-600 to-pink-500 text-white flex items-center justify-center font-bold uppercase text-sm shadow-xs">
                        {user.name?.[0] || user.username?.[0] || "U"}
                      </div>
                    )}
                    <div className="overflow-hidden">
                      <div className="font-bold text-sm text-gray-900 truncate">{user.name || user.username}</div>
                      <div className="text-xs text-gray-500 truncate">{user.email}</div>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-[10px] rounded-full font-mono font-bold shrink-0">
                    {user.role === "ADMIN" ? "Admin" : "Pelanggan"}
                  </span>
                </div>
              ) : (
                <div className="p-4 bg-gray-50 border-b border-gray-100 space-y-2">
                  <div className="text-xs text-gray-400 font-semibold mb-1 uppercase tracking-wider text-[11px]">
                    Akun Pelanggan
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => {
                        setAuthModalTab("login");
                        setIsAuthModalOpen(true);
                        setIsOpen(false);
                      }}
                      className="py-2.5 px-3 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-extrabold text-xs rounded-xl text-center shadow-xs transition cursor-pointer"
                    >
                      Masuk Akun
                    </button>
                    <button
                      onClick={() => {
                        setAuthModalTab("register");
                        setIsAuthModalOpen(true);
                        setIsOpen(false);
                      }}
                      className="py-2.5 px-3 bg-white border border-gray-300 text-gray-800 font-extrabold text-xs rounded-xl text-center transition hover:bg-gray-50 cursor-pointer"
                    >
                      Daftar Akun
                    </button>
                  </div>
                </div>
              )}

              <nav className="flex flex-col px-5 py-4 gap-2 text-gray-900 font-semibold text-sm">
                <Link href="/" onClick={() => setIsOpen(false)} className="py-2 hover:text-purple-600 transition border-b border-gray-50">
                  Home
                </Link>
                <Link href="/products" onClick={() => setIsOpen(false)} className="py-2 hover:text-purple-600 transition border-b border-gray-50">
                  Products
                </Link>
                <Link href="/about-us" onClick={() => setIsOpen(false)} className="py-2 hover:text-purple-600 transition border-b border-gray-50">
                  About us
                </Link>
                <Link href="/blog" onClick={() => setIsOpen(false)} className="py-2 hover:text-purple-600 transition border-b border-gray-50">
                  Blog
                </Link>
                <Link href="/contact-us" onClick={() => setIsOpen(false)} className="py-2 hover:text-purple-600 transition border-b border-gray-50">
                  Contact us
                </Link>

                {user ? (
                  <div className="pt-2 space-y-2">
                    {user.role === "ADMIN" ? (
                      <Link
                        href="/admin"
                        onClick={() => setIsOpen(false)}
                        className="py-2.5 px-3 bg-red-50 text-red-600 rounded-xl flex items-center justify-between font-bold text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <ShieldCheck className="w-4 h-4 text-red-600" />
                          <span>Dashboard Admin</span>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-red-400" />
                      </Link>
                    ) : (
                      <Link
                        href="/user/profile"
                        onClick={() => setIsOpen(false)}
                        className="py-2.5 px-3 bg-purple-50 text-purple-700 rounded-xl flex items-center justify-between font-bold text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <UserCheck className="w-4 h-4 text-purple-600" />
                          <span>Profil & Pesanan Saya</span>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-purple-400" />
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        setIsOpen(false);
                        handleLogout();
                      }}
                      className="w-full py-2.5 px-3 bg-gray-100 hover:bg-red-50 text-red-600 rounded-xl flex items-center gap-2 font-bold text-xs transition cursor-pointer text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Keluar (Logout)</span>
                    </button>
                  </div>
                ) : null}
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Customer Auth Modal */}
      {isAuthModalOpen && (
        <CustomerAuthModal
          initialTab={authModalTab}
          onClose={() => setIsAuthModalOpen(false)}
          onSuccess={(loggedInUser) => {
            setUser(loggedInUser);
            setIsAuthModalOpen(false);
            router.refresh();
          }}
        />
      )}
    </>
  );
}