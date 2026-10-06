"use client";

import { useState, useEffect, useMemo } from "react";
import { Truck, Zap, Copy, Check } from "lucide-react";

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
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loadingVouchers, setLoadingVouchers] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    fetchVouchers();
  }, []);

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

  const handleCopyCode = (code: string) => {
    if (!code) return;
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(code);
      } else if (typeof document !== "undefined") {
        const textarea = document.createElement("textarea");
        textarea.value = code;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      setCopiedCode(code);
      setTimeout(() => {
        setCopiedCode((curr) => (curr === code ? null : curr));
      }, 2500);
    } catch (e) {
      console.error("Gagal menyalin kode voucher:", e);
    }
  };

  const formatIDR = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  // Buat array duplikasi identik dua sisi agar loop marquee berjalan mulus & tanpa putus (seamless infinite loop)
  const displayVouchers = useMemo(() => {
    if (!vouchers || vouchers.length === 0) return [];

    // Targetkan satu putaran (setengah track) memiliki minimal 8 kartu
    const targetPerHalf = Math.max(8, vouchers.length * 2);
    const repeatCount = Math.ceil(targetPerHalf / vouchers.length);

    const oneHalf: (Voucher & { uniqueKey: string })[] = [];
    for (let r = 0; r < repeatCount; r++) {
      vouchers.forEach((v, idx) => {
        oneHalf.push({ ...v, uniqueKey: `h1-${r}-${v.id}-${idx}` });
      });
    }

    // Setengah kedua identik dengan setengah pertama
    const secondHalf = oneHalf.map((item, idx) => ({
      ...item,
      uniqueKey: `h2-${idx}-${item.id}`,
    }));

    return [...oneHalf, ...secondHalf];
  }, [vouchers]);

  // Durasi animasi yang proporsional dan nyaman dibaca (kecepatan konsisten)
  const animationDuration = useMemo(() => {
    if (displayVouchers.length === 0) return "30s";
    return `${Math.max(22, Math.round((displayVouchers.length / 2) * 3.8))}s`;
  }, [displayVouchers]);

  if (loadingVouchers) {
    return (
      <div className="w-full font-sans my-2 py-4 text-center text-xs text-gray-400 font-medium animate-pulse">
        Memuat daftar voucher aktif...
      </div>
    );
  }

  if (vouchers.length === 0) {
    return null;
  }

  return (
    <div className="w-full font-sans my-2">
      {/* VOUCHER INFINITE MARQUEE BANNER */}
      <div className="relative w-full overflow-hidden py-1">
        <div
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => {
            setTimeout(() => setIsPaused(false), 1200);
          }}
          style={{
            animationDuration,
            animationPlayState: isPaused ? "paused" : "running",
          }}
          className="animate-voucher-marquee flex gap-4 cursor-pointer select-none"
        >
          {displayVouchers.map((v) => {
            const isOngkir =
              Boolean(v.isOngkirTemplate) ||
              v.scope === "SHIPPING" ||
              v.code.toUpperCase().includes("ONGKIR") ||
              v.code.toUpperCase().includes("FREE");

            const isCopied = copiedCode === v.code;

            return (
              <div
                key={v.uniqueKey}
                onClick={() => handleCopyCode(v.code)}
                title="Klik untuk salin kode voucher"
                className="relative rounded-2xl h-[92px] w-[260px] sm:w-[280px] shrink-0 transition-transform hover:scale-[1.02] active:scale-[0.98] overflow-hidden flex items-stretch border border-gray-200 bg-white shadow-2xs hover:shadow-md cursor-pointer group"
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
                    <Truck className="w-5 h-5 mb-0.5 opacity-90 group-hover:scale-110 transition-transform" />
                  ) : (
                    <Zap className="w-5 h-5 mb-0.5 opacity-90 group-hover:scale-110 transition-transform" />
                  )}
                  <span className="text-[9px] font-extrabold leading-tight uppercase tracking-wider">
                    {isOngkir ? "Gratis Ongkir" : "Voucher Diskon"}
                  </span>

                  {/* Half Circle Cutouts */}
                  <div className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-[#F2F4F5] border border-gray-200" />
                  <div className="absolute -bottom-2 -right-2 w-4 h-4 rounded-full bg-[#F2F4F5] border border-gray-200" />
                </div>

                {/* Right Details Area */}
                <div className="flex-1 p-3 flex flex-col justify-center min-w-0 bg-white space-y-1">
                  <div className="font-extrabold text-xs text-gray-900 line-clamp-1 group-hover:text-red-600 transition-colors">
                    {isOngkir
                      ? "Gratis Ongkir"
                      : v.discountType === "PERCENTAGE"
                      ? `Diskon ${v.discountValue}%`
                      : `Potongan ${formatIDR(v.discountValue)}`}
                  </div>
                  <p className="text-[10px] text-gray-500 font-medium line-clamp-1">
                    Min. Belanja {formatIDR(v.minPurchase)}
                  </p>
                  
                  {/* Voucher Code / Copied Badge */}
                  <div className="flex items-center gap-1.5 pt-0.5">
                    <span
                      className={`inline-flex items-center gap-1 font-mono font-bold text-[10px] px-2 py-0.5 rounded border transition-all ${
                        isCopied
                          ? "text-emerald-700 bg-emerald-50 border-emerald-300 ring-1 ring-emerald-300"
                          : isOngkir
                          ? "text-blue-700 bg-blue-50 border-blue-200 group-hover:bg-blue-100"
                          : "text-teal-700 bg-teal-50 border-teal-200 group-hover:bg-teal-100"
                      }`}
                    >
                      {isCopied ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600 animate-in zoom-in" />
                          <span>Tersalin!</span>
                        </>
                      ) : (
                        <>
                          <span>{v.code}</span>
                          <Copy className="w-2.5 h-2.5 opacity-60 ml-0.5" />
                        </>
                      )}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
