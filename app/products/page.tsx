import type { Metadata } from "next";
import { Suspense } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ProductsContent from "@/components/Product/ProductsContent";

export const metadata: Metadata = {
  title: "Katalog Produk Peralatan Rumah Tangga",
  description:
    "Jelajahi koleksi lengkap peralatan rumah tangga TRI J. Mulai dari perabotan dapur, ember, baskom, tempat sampah, hingga perlengkapan kebersihan berkualitas.",
  keywords: [
    "Katalog Peralatan Rumah Tangga",
    "Perabot Dapur TRI J",
    "Ember Plastik",
    "Baskom Plastik",
    "Perlengkapan Kebersihan",
    "Grosir Perabot Plastik",
  ],
  alternates: {
    canonical: "/products",
  },
  openGraph: {
    title: "Katalog Produk Peralatan Rumah Tangga | TRI J",
    description:
      "Temukan ragam perabotan rumah tangga berkualitas dengan harga bersaing. Siap melayani kebutuhan grosir & kemitraan.",
    url: "/products",
  },
};

export default function ProductsPage() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://tri-j.co.id";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Katalog Produk Peralatan Rumah Tangga TRI J",
    description:
      "Katalog produk peralatan rumah tangga terlengkap dari TRI J.",
    url: `${baseUrl}/products`,
    isPartOf: {
      "@type": "WebSite",
      name: "TRI J",
      url: baseUrl,
    },
  };

  return (
    <main className="min-h-screen bg-[var(--Bg)]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />

      <section className="mx-auto max-w-[1600px] px-3.5 sm:px-6 pt-20 sm:pt-24 pb-16 lg:px-10 lg:pt-32 lg:pb-20">
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