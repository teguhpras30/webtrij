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
  title: "TRI J - Distributor & Produsen Peralatan Rumah Tangga Terlengkap",
  description:
    "Situs resmi TRI J (tri-j.co.id). Produsen & distributor peralatan rumah tangga berkualitas tinggi, perabot plastik, rak, lemari, dispenser beras & kebutuhan dapur grosir maupun eceran.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "TRI J - Distributor & Produsen Peralatan Rumah Tangga Terlengkap",
    description:
      "Situs resmi TRI J. Katalog perabot rumah tangga terlengkap & kemitraan grosir.",
    url: "/",
    siteName: "TRI J",
  },
};

export default function HomePage() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://tri-j.co.id";

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": ["Organization", "LocalBusiness"],
        "@id": `${baseUrl}/#business`,
        name: "TRI J",
        alternateName: [
          "Tri J",
          "tri j",
          "TRI-J",
          "Toko TRI J",
          "TRI J Official",
          "PT TRI J Indonesia",
          "TRI J Peralatan Rumah Tangga",
        ],
        url: baseUrl,
        logo: `${baseUrl}/logotrij.png`,
        image: `${baseUrl}/logotrij.png`,
        description:
          "TRI J adalah produsen dan distributor resmi peralatan rumah tangga berkualitas tinggi, fungsional, dan tahan lama di Indonesia.",
        telephone: "+628961656039",
        email: "sales@tri-j.co.id",
        priceRange: "$$",
        address: {
          "@type": "PostalAddress",
          streetAddress: "Raya Manukan Wetan No. 60 B 19, Tandes",
          addressLocality: "Surabaya",
          addressRegion: "Jawa Timur",
          postalCode: "60185",
          addressCountry: "ID",
        },
        geo: {
          "@type": "GeoCoordinates",
          latitude: -7.2575,
          longitude: 112.7521,
        },
        openingHoursSpecification: [
          {
            "@type": "OpeningHoursSpecification",
            dayOfWeek: [
              "Monday",
              "Tuesday",
              "Wednesday",
              "Thursday",
              "Friday",
              "Saturday",
            ],
            opens: "08:00",
            closes: "17:00",
          },
        ],
        contactPoint: {
          "@type": "ContactPoint",
          telephone: "+628961656039",
          contactType: "sales and customer service",
          areaServed: "ID",
          availableLanguage: ["Indonesian"],
        },
        sameAs: [
          "https://www.instagram.com/trij.official/",
          "https://www.facebook.com/61592615336794",
          "https://wa.me/628961656039",
        ],
      },
      {
        "@type": "WebSite",
        "@id": `${baseUrl}/#website`,
        url: baseUrl,
        name: "TRI J",
        alternateName: "TRI J Official Store",
        description: "Peralatan Rumah Tangga Berkualitas & Terpercaya",
        publisher: {
          "@id": `${baseUrl}/#business`,
        },
        inLanguage: "id-ID",
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: `${baseUrl}/products?search={search_term_string}`,
          },
          "query-input": "required name=search_term_string",
        },
      },
    ],
  };

  return (
    <main>
      <h1 className="sr-only">
        TRI J - Produsen &amp; Supplier Peralatan Rumah Tangga Berkualitas
      </h1>
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