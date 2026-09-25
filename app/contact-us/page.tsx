import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ContactHero from "@/components/contactUs/ContactHero";

export const metadata: Metadata = {
  title: "Hubungi Kami - Konsultasi & Kemitraan Usaha",
  description:
    "Hubungi tim TRI J untuk pertanyaan produk, pemesanan grosir, kerja sama distributor, atau informasi kemitraan peralatan rumah tangga.",
  keywords: [
    "Hubungi TRI J",
    "Kontak TRI J",
    "Grosir Perabot Rumah Tangga",
    "Kemitraan Perabot",
  ],
  alternates: {
    canonical: "/contact-us",
  },
  openGraph: {
    title: "Hubungi Kami | TRI J Peralatan Rumah Tangga",
    description:
      "Hubungi tim TRI J untuk pemesanan grosir dan penawaran kemitraan terbaik.",
    url: "/contact-us",
  },
};

export default function ContactPage() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://tri-j.co.id";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: "Hubungi Kami | TRI J",
    description:
      "Layanan kontak pelanggan dan kemitraan grosir peralatan rumah tangga TRI J.",
    url: `${baseUrl}/contact-us`,
    mainEntity: {
      "@type": "LocalBusiness",
      name: "TRI J",
      url: baseUrl,
      telephone: "+628961656039",
      email: "sales@tri-j.co.id",
      address: {
        "@type": "PostalAddress",
        streetAddress: "Raya Manukan Wetan No. 60 B 19, Tandes",
        addressLocality: "Surabaya",
        addressRegion: "Jawa Timur",
        postalCode: "60185",
        addressCountry: "ID",
      },
      contactPoint: {
        "@type": "ContactPoint",
        telephone: "+628961656039",
        contactType: "customer service",
        areaServed: "ID",
        availableLanguage: ["Indonesian"],
      },
      sameAs: ["https://wa.me/628961656039"],
    },
  };

  return (
    <main className="bg-[#F2F4F5]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />
      <ContactHero />
      <Footer />
    </main>
  );
}