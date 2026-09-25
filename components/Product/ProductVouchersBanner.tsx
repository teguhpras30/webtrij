"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import CustomerAuthModal from "@/components/auth/CustomerAuthModal";
import { Lock, Sparkles, Truck, Zap } from "lucide-react";

interface Voucher {
  id: number;
  code: string;
  discountType: string;
  discountValue: number;
  minPurchase: number;
  isOngkirTemplate?: boolean;
  scope?: string;
  endDate?: string;
}

export default function ProductVouchersBanner() {
  const { user, loading: authLoading } = useAuth();
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loadingVouchers, setLoadingVouchers] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const isVerified = Boolean(user && user.isVerified !== false);

  useEffect(() => {
    fetchVouchers();
  }, []);

  // Auto-scroll loop effect
  useEffect(() => {
    if (!scrollRef.current || vouchers.length === 0 || isHovered) return;

    const interval = setInterval(() => {
      if (scrollRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        if (scrollLeft + clientWidth >= scrollWidth - 2) {
          scrollRef.current.scrollLeft = 0;
        } else {
          scrollRef.current.scrollLeft += 1;
        }
      }
    }, 25);

    return () => clearInterval(interval);
  }, [vouchers, isHovered]);

  const fetchVouchers = async () => {
    setLoadingVouchers(true);
    try {
      const res = await fetch("/api/public/vouchers");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setVouchers(data);
        }
      }
    } catch (e) {
      console.error("Gagal mengambil data voucher:", e);
    } finally {
      setLoadingVouchers(false);
    }
  };

  const formatIDR = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="w-full font-sans my-2">
      {/* VOUCHER CAROUSEL KHUSUS USER TERVERIFIKASI */}
      <div>
          {loadingVouchers ? (
            <div className="py-4 text-center text-xs text-gray-400 font-medium animate-pulse">
              Memuat daftar voucher...
            </div>
          ) : vouchers.length === 0 ? null : (
            <div
              ref={scrollRef}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              className="flex items-center justify-start md:justify-center gap-4 overflow-x-auto pb-2 pt-1 scrollbar-none scroll-smooth cursor-grab active:cursor-grabbing"
            >
              {/* Duplikat array agar animasi marquee terlihat kontinu jika voucher sedikit */}
              {vouchers.map((v, index) => {
                const isOngkir =
                  Boolean(v.isOngkirTemplate) ||
                  v.scope === "SHIPPING" ||
                  v.code.toUpperCase().includes("ONGKIR") ||
                  v.code.toUpperCase().includes("FREE");

                return (
                  <div
                    key={`${v.id}-${index}`}
                    className="relative rounded-2xl h-[92px] w-[260px] sm:w-[280px] shrink-0 transition-all overflow-hidden flex items-stretch border border-gray-200 bg-white shadow-2xs hover:shadow-md"
                  >
                    {/* Left Badge Icon Ticket Area */}
                    <div
                      className={`w-24 text-white p-2.5 flex flex-col items-center justify-center text-center relative shrink-0 ${
                        isOngkir
                          ? "bg-gradient-to-br from-[#2563EB] to-blue-700"
                          : "bg-gradient-to-br from-[#00A896] to-teal-700"
                      }`}
                    >
                      {isOngkir ? (
                        <Truck className="w-5 h-5 mb-0.5 opacity-90" />
                      ) : (
                        <Zap className="w-5 h-5 mb-0.5 opacity-90" />
                      )}
                      <span className="text-[9px] font-extrabold leading-tight uppercase tracking-wider">
                        {isOngkir ? "Gratis Ongkir" : "Voucher Diskon"}
                      </span>

                      {/* Half Circle Cutouts */}
                      <div className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-[#F8FAFC] border border-gray-200" />
                      <div className="absolute -bottom-2 -right-2 w-4 h-4 rounded-full bg-[#F8FAFC] border border-gray-200" />
                    </div>

                    {/* Right Details Area (Tanpa Tombol Salin) */}
                    <div className="flex-1 p-3 flex flex-col justify-center min-w-0 bg-white space-y-1">
                      <div className="font-extrabold text-xs text-gray-900 line-clamp-1">
                        {isOngkir
                          ? "Gratis Ongkir"
                          : v.discountType === "PERCENTAGE"
                          ? `Diskon ${v.discountValue}%`
                          : `Potongan ${formatIDR(v.discountValue)}`}
                      </div>
                      <p className="text-[10px] text-gray-500 font-medium line-clamp-1">
                        Min. Belanja {formatIDR(v.minPurchase)}
                      </p>
                      <div
                        className={`inline-block font-mono font-bold text-[10px] px-2 py-0.5 rounded border w-max ${
                          isOngkir
                            ? "text-blue-700 bg-blue-50 border-blue-100"
                            : "text-teal-700 bg-teal-50 border-teal-100"
                        }`}
                      >
                        {v.code}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      {/* Customer Auth Modal (jika user klik tombol login/verifikasi) */}
      {isAuthModalOpen && (
        <CustomerAuthModal
          initialTab="quick-otp"
          onClose={() => setIsAuthModalOpen(false)}
          onSuccess={() => {
            setIsAuthModalOpen(false);
            window.location.reload();
          }}
        />
      )}
    </div>
  );
}
