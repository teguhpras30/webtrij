import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { Inter } from "next/font/google";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";

const inter = Inter({ subsets: ["latin"] });

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://tri-j.co.id";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "TRI J - Distributor & Produsen Peralatan Rumah Tangga Terlengkap",
    template: "%s | TRI J",
  },
  description:
    "Situs resmi TRI J (tri-j.co.id) — Produsen dan distributor peralatan rumah tangga, perabot plastik, rak lemari, perlengkapan dapur & grosir terlengkap di Indonesia.",
  keywords: [
    "TRI J",
    "tri j",
    "Tri J",
    "trij",
    "tri-j",
    "tri-j.co.id",
    "Toko TRI J",
    "TRI J Surabaya",
    "Peralatan Rumah Tangga",
    "Perabotan Rumah Tangga",
    "Grosir Peralatan Rumah Tangga",
    "Supplier Peralatan Dapur",
    "Perabot Plastik",
    "Kemitraan Perabot",
    "Alat Kebersihan Rumah",
    "Peralatan Dapur Murah",
  ],
  authors: [{ name: "TRI J", url: baseUrl }],
  creator: "TRI J",
  publisher: "TRI J",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: "TRI J - Platform Hybrid Grosir B2B & E-Commerce",
    description:
      "Penyedia utama peralatan rumah tangga fungsional, tahan lama, dan terpercaya di Indonesia.",
    url: baseUrl,
    siteName: "TRI J",
    locale: "id_ID",
    type: "website",
    images: [
      {
        url: "/assets/hero/peralatan-rumah-tangga.jpg",
        width: 1200,
        height: 630,
        alt: "TRI J Peralatan Rumah Tangga",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "TRI J - Platform Hybrid Grosir B2B & E-Commerce",
    description:
      "Temukan berbagai peralatan rumah tangga berkualitas tinggi dan fungsional di TRI J.",
    images: ["/assets/hero/peralatan-rumah-tangga.jpg"],
  },
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
  verification: {
    google: "V__A6NEjOIGA68oiSlJ1e_Or2AsLxWonbqnH7oX7jH8",
    other: {
      "msvalidate.01": "495DC446C0361278CD3FA0AAB356A52B",
    },
  },
};

import UserChatWidget from "@/components/chat/UserChatWidget";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || "Mid-client-5_POe1z_gLHmztoZ";
  const isProductionClient = process.env.MIDTRANS_IS_PRODUCTION === 'true' || clientKey.startsWith('Mid-client-');
  const snapJsUrl = process.env.NEXT_PUBLIC_MIDTRANS_SNAP_URL ||
    (isProductionClient
      ? "https://app.midtrans.com/snap/snap.js"
      : "https://app.sandbox.midtrans.com/snap/snap.js");

  return (
    <html lang="id" data-scroll-behavior="smooth">
      <body className={inter.className}>
        {/* Google Analytics GA4 */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-Q5D4YDJ5VK"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-Q5D4YDJ5VK', {
              page_path: window.location.pathname,
            });
          `}
        </Script>
        <Script
          src={snapJsUrl}
          data-client-key={clientKey}
          strategy="lazyOnload"
        />
        <AuthProvider>
          <CartProvider>
            {children}
            <UserChatWidget />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}