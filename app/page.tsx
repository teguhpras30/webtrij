import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import HeroSection from "@/components/home/HeroSection";
//import BrandLogo from "@/components/home/BrandLogo";
import InfoSection from "@/components/home/InfoSection";
import Showcase from "@/components/home/ShowcaseSection";
import ProductSection from "@/components/home/ProductsSection";
import ExploreProductsSection from "@/components/home/ExploreProductsSection";
import KemitraanSection from "@/components/home/KemitraanSection";
import TestimonialSection from "@/components/home/TestimonialSection";
import Footer from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "TRI J - Peralatan Rumah Tangga Berkualitas",
  description:
    "Jelajahi produk peralatan rumah tangga unggulan dari TRI J. Solusi perabotan berkualitas, tahan lama, dan harga terjangkau untuk hunian dan usaha Anda.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "TRI J - Peralatan Rumah Tangga Berkualitas",
    description:
      "Jelajahi katalog perabotan rumah tangga terlengkap dari TRI J. Kualitas terjamin untuk rumah dan kemitraan bisnis.",
    url: "/",
  },
};

export default function HomePage() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://tri-j.co.id";

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${baseUrl}/#organization`,
        name: "TRI J",
        url: baseUrl,
        logo: `${baseUrl}/favicon.svg`,
        description:
          "TRI J adalah produsen dan distributor peralatan rumah tangga berkualitas tinggi, fungsional, dan tahan lama.",
      },
      {
        "@type": "WebSite",
        "@id": `${baseUrl}/#website`,
        url: baseUrl,
        name: "TRI J",
        description: "Peralatan Rumah Tangga Berkualitas & Terpercaya",
        publisher: {
          "@id": `${baseUrl}/#organization`,
        },
        inLanguage: "id-ID",
      },
    ],
  };

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />
      <HeroSection />
      {/* <BrandLogo /> */}
      <InfoSection />
      <Showcase />
      <ProductSection />
      <ExploreProductsSection />
      <KemitraanSection />
      <TestimonialSection />
      <Footer />
    </main>
  );
}