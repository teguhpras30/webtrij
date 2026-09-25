import type { Metadata } from "next";
import { Suspense } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ProductsContent from "@/components/Product/ProductsContent";

import ProductVouchersBanner from "@/components/Product/ProductVouchersBanner";

export const metadata: Metadata = {
  title: "Katalog Produk Peralatan & Perabot Rumah Tangga",
  description:
    "Jelajahi koleksi lengkap peralatan dan perabotan rumah tangga TRI J. Mulai dari lemari lipat susun, rak plastik, rice bucket, dispenser beras, hingga perlengkapan dapur berkualitas.",
  keywords: [
    "Katalog Peralatan Rumah Tangga",
    "Perabot Dapur TRI J",
    "Lemari Lipat Susun",
    "Rice Bucket TRI J",
    "Dispenser Beras Plastik",
    "Rak & Lemari Plastik",
    "Perlengkapan Dapur",
    "Grosir Perabot Plastik",
  ],
  alternates: {
    canonical: "/products",
  },
  openGraph: {
    title: "Katalog Produk Peralatan & Perabot Rumah Tangga | TRI J",
    description:
      "Temukan ragam perabotan rumah tangga, lemari lipat, rice bucket, dan perlengkapan dapur berkualitas dengan harga bersaing. Siap melayani grosir & eceran.",
    url: "/products",
  },
};

export default function ProductsPage() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://tri-j.co.id";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Katalog Produk Peralatan & Perabot Rumah Tangga TRI J",
    description:
      "Katalog produk peralatan rumah tangga, lemari lipat, rice bucket, dispenser beras & perlengkapan dapur terlengkap dari TRI J.",
    url: `${baseUrl}/products`,
    isPartOf: {
      "@type": "WebSite",
      name: "TRI J",
      url: baseUrl,
    },
  };

  return (
    <main className="min-h-screen bg-[#F8FAFC]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />

      {/* Hero Header Banner Indigo (Sama persis seperti halaman Blog) */}
      <section className="bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 text-white pt-28 pb-16 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-7xl mx-auto text-center space-y-4 relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-md rounded-full text-xs font-bold border border-white/20 text-purple-200 flex-wrap justify-center">
            <span className="px-2.5 py-0.5 bg-emerald-500 text-white font-extrabold rounded-full shadow-xs">🚚 Free Ongkir</span>
            <span className="px-2.5 py-0.5 bg-amber-400 text-purple-950 font-extrabold rounded-full shadow-xs">⚡ Tanpa Biaya Admin</span>
            <span>✨ Jaminan Garansi Pengiriman oleh TRI J</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight">
            Garansi Part Rusak? Ganti Part Baru!
          </h1>

          <p className="max-w-2xl mx-auto text-xs sm:text-sm text-purple-200 leading-relaxed font-medium">
            ✅ Free Ongkir | ✅ Tanpa Biaya Admin | ✅ Garansi Ganti Part Baru
          </p>
        </div>
      </section>

      {/* Banner Voucher Khusus Pengguna Terverifikasi */}
      <section className="mx-auto max-w-[1600px] px-3.5 sm:px-6 lg:px-10 pt-6">
        <ProductVouchersBanner />
      </section>

      {/* Main Products Listing Section */}
      <section className="mx-auto max-w-[1600px] px-3.5 sm:px-6 py-12 lg:px-10">
        <Suspense
          fallback={
            <div className="py-10 text-center font-medium text-gray-500">
              Memuat produk...
            </div>
          }
        >
          <ProductsContent />
        </Suspense>
      </section>

      <Footer />
    </main>
  );
}