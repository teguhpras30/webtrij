"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Heart,
  ShoppingCart,
  User as UserIcon,
  Menu,
  X,
  LogOut,
  ShieldCheck,
  UserCheck,
  ChevronRight,
} from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { useWishlist } from "@/context/WishlistContext";
import CustomerAuthModal from "@/components/auth/CustomerAuthModal";

export default function Navbar() {
  const router = useRouter();
  const { user, setUser, logout: authLogout } = useAuth();
  const { wishlistProductIds } = useWishlist();

  const [isOpen, setIsOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  // Auth Modal state
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<"login" | "register">("login");

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await authLogout();
    setUserDropdownOpen(false);
    router.refresh();
  };

  const handleWishlistClick = () => {
    if (user) {
      router.push("/user/wishlist");
    } else {
      setAuthModalTab("login");
      setIsAuthModalOpen(true);
    }
  };

  return (
    <>
      <header className="fixed top-0 left-0 z-50 w-full font-sans">
        <div className="bg-white/10 backdrop-blur-xl border-b border-white/20">
          <div className="max-w-7xl mx-auto flex items-center justify-between px-5 md:px-10 lg:px-20 py-4">
            {/* Logo */}
            <Link href="/">
              <Image
                src="/logotrij.png"
                alt="TRIJ Logo"
                width={80}
                height={28}
                priority
              />
            </Link>

            {/* Desktop Menu */}
            <nav className="hidden md:flex gap-8 text-sm font-medium text-black">
              <Link href="/" className="hover:text-purple-600 transition">
                Home
              </Link>
              <Link href="/products" className="hover:text-purple-600 transition">
                Products
              </Link>
              <Link href="/about-us" className="hover:text-purple-600 transition">
                About us
              </Link>
              <Link href="/contact-us" className="hover:text-purple-600 transition">
                Contact us
              </Link>
            </nav>

            {/* Desktop Icons */}
            <div className="hidden md:flex items-center gap-4 text-black relative">
              {/* Wishlist Button */}
              <button
                onClick={handleWishlistClick}
                className="hover:text-purple-600 transition cursor-pointer relative"
                title="Produk Favorit (Wishlist)"
              >
                <Heart size={20} className={wishlistProductIds.length > 0 ? "fill-rose-500 text-rose-500" : ""} />
                {wishlistProductIds.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-rose-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-sm animate-in zoom-in-50 duration-200">
                    {wishlistProductIds.length}
                  </span>
                )}
              </button>

              {/* User Account Popover */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className={`p-1.5 rounded-full transition cursor-pointer ${
                    user ? "bg-purple-600 text-white shadow-md" : "hover:text-purple-600"
                  }`}
                  title="Akun Saya"
                >
                  <UserIcon size={20} />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-3 w-64 bg-slate-900 border border-slate-800 text-white rounded-2xl shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    {user ? (
                      <div>
                        {/* User Profile Summary */}
                        <div className="pb-3 mb-3 border-b border-slate-800 flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center font-bold text-white uppercase text-sm">
                            {user.name?.[0] || user.username?.[0] || "U"}
                          </div>
                          <div className="overflow-hidden">
                            <div className="font-bold text-sm text-white truncate">{user.name || user.username}</div>
                            <div className="text-[11px] text-slate-400 truncate">{user.email}</div>
                            <span className="inline-block mt-1 px-2 py-0.2 bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] rounded-full font-mono">
                              {user.role === "ADMIN" ? "Super Admin" : "Pelanggan"}
                            </span>
                          </div>
                        </div>

                        <div className="space-y-1 text-xs">
                          {user.role === "ADMIN" ? (
                            <Link
                              href="/admin"
                              onClick={() => setUserDropdownOpen(false)}
                              className="w-full px-3 py-2 rounded-xl flex items-center justify-between hover:bg-slate-800 text-slate-200 transition-colors"
                            >
                              <div className="flex items-center gap-2">
                                <ShieldCheck className="w-4 h-4 text-red-500" />
                                <span>Dashboard Admin</span>
                              </div>
                              <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                            </Link>
                          ) : (
                            <>
                              <Link
                                href="/user/profile"
                                onClick={() => setUserDropdownOpen(false)}
                                className="w-full px-3 py-2 rounded-xl flex items-center justify-between hover:bg-slate-800 text-slate-200 transition-colors"
                              >
                                <div className="flex items-center gap-2">
                                  <UserCheck className="w-4 h-4 text-purple-400" />
                                  <span>Profil Saya</span>
                                </div>
                                <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                              </Link>
                              <Link
                                href="/user/wishlist"
                                onClick={() => setUserDropdownOpen(false)}
                                className="w-full px-3 py-2 rounded-xl flex items-center justify-between hover:bg-slate-800 text-slate-200 transition-colors"
                              >
                                <div className="flex items-center gap-2">
                                  <Heart className="w-4 h-4 text-rose-400 fill-rose-400" />
                                  <span>Wishlist Saya ({wishlistProductIds.length})</span>
                                </div>
                                <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                              </Link>
                            </>
                          )}

                          <button
                            onClick={handleLogout}
                            className="w-full px-3 py-2 rounded-xl flex items-center gap-2 hover:bg-red-500/10 text-red-400 transition-colors cursor-pointer text-left"
                          >
                            <LogOut className="w-4 h-4" />
                            <span>Keluar (Logout)</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2 text-xs">
                        <div className="text-slate-400 font-semibold mb-2 text-[11px] uppercase tracking-wider">
                          Akun Pelanggan
                        </div>
                        <button
                          onClick={() => {
                            setAuthModalTab("login");
                            setIsAuthModalOpen(true);
                            setUserDropdownOpen(false);
                          }}
                          className="w-full py-2.5 px-3 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-semibold rounded-xl text-center shadow-md transition-all cursor-pointer"
                        >
                          Masuk Akun
                        </button>
                        <button
                          onClick={() => {
                            setAuthModalTab("register");
                            setIsAuthModalOpen(true);
                            setUserDropdownOpen(false);
                          }}
                          className="w-full py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-center transition-colors cursor-pointer"
                        >
                          Daftar Akun Baru
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <button className="hover:text-purple-600 transition cursor-pointer" title="Keranjang">
                <ShoppingCart size={20} />
              </button>
            </div>

            {/* Hamburger */}
            <button className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>

          {/* Mobile Menu */}
          {isOpen && (
            <div className="md:hidden bg-white/90 backdrop-blur-xl border-t border-gray-200">
              <nav className="flex flex-col px-5 py-5 gap-5 text-black font-medium">
                <Link href="/" onClick={() => setIsOpen(false)}>
                  Home
                </Link>
                <Link href="/products" onClick={() => setIsOpen(false)}>
                  Products
                </Link>
                <Link href="/about-us" onClick={() => setIsOpen(false)}>
                  About us
                </Link>
                <Link href="/contact-us" onClick={() => setIsOpen(false)}>
                  Contact us
                </Link>

                <div className="flex items-center justify-between pt-3 border-t">
                  <div className="flex gap-6 text-black items-center">
                    <button onClick={handleWishlistClick} className="relative">
                      <Heart size={22} className={wishlistProductIds.length > 0 ? "fill-rose-500 text-rose-500" : ""} />
                      {wishlistProductIds.length > 0 && (
                        <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                          {wishlistProductIds.length}
                        </span>
                      )}
                    </button>
                    <button
                      onClick={() => {
                        setIsOpen(false);
                        if (user) {
                          if (user.role === "ADMIN") router.push("/admin");
                          else router.push("/user/profile");
                        } else {
                          setAuthModalTab("login");
                          setIsAuthModalOpen(true);
                        }
                      }}
                      className="flex items-center gap-2"
                    >
                      <UserIcon size={22} />
                      <span className="text-xs font-semibold">
                        {user ? user.name || user.username : "Masuk"}
                      </span>
                    </button>
                    <ShoppingCart size={22} />
                  </div>
                </div>
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