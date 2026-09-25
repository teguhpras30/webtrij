import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BlogClient from "./BlogClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Blog & Artikel - Tips Peralatan Rumah Tangga & Kemitraan",
  description:
    "Kumpulan artikel, tips perabotan rumah tangga, review produk plastik unggulan, serta peluang usaha distributor & reseller TRI J.",
  keywords: [
    "Blog TRI J",
    "Artikel Peralatan Rumah Tangga",
    "Tips Perabotan Rumah",
    "Peluang Usaha Grosir",
    "Supplier Perabot Plastik",
  ],
  alternates: {
    canonical: "/blog",
  },
  openGraph: {
    title: "Blog & Artikel | TRI J Peralatan Rumah Tangga",
    description:
      "Temukan berbagai tips rumah tangga, review produk perabotan plastik, dan panduan kemitraan usaha grosir bersama TRI J.",
    url: "/blog",
  },
};

export default function BlogIndexPage() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://tri-j.co.id";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "Blog & Artikel TRI J",
    description: "Kumpulan artikel edukasi perabotan rumah tangga dan peluang usaha B2B TRI J.",
    url: `${baseUrl}/blog`,
    publisher: {
      "@type": "Organization",
      name: "TRI J",
      url: baseUrl,
    },
  };

  return (
    <main className="relative overflow-hidden bg-[#F8FAFC]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />

      {/* Hero Header Banner */}
      <section className="bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 text-white pt-28 pb-16 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-7xl mx-auto text-center space-y-4 relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-md rounded-full text-xs font-bold border border-white/20 text-purple-200">
            <span>✨ Pusat Informasi & Edukasi TRI J</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight">
            Blog, Tips & Peluang Usaha Perabotan
          </h1>

          <p className="max-w-2xl mx-auto text-xs sm:text-sm text-purple-200 leading-relaxed font-medium">
            Temukan berbagai artikel inspiratif, tips perawatan rumah tangga, review produk plastik berkualitas, serta panduan memulai bisnis grosir reseller perabot.
          </p>
        </div>
      </section>

      {/* Blog Articles Main List Component */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <BlogClient />
      </section>

      <Footer />
    </main>
  );
}
