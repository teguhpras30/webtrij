import type { Metadata } from "next";
import "./globals.css";
import { Inter } from "next/font/google";
import { AuthProvider } from "@/context/AuthContext";
import { WishlistProvider } from "@/context/WishlistContext";

const inter = Inter({ subsets: ["latin"] });

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://tri-j.co.id";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "TRI J - Peralatan Rumah Tangga Berkualitas",
    template: "%s | TRI J",
  },
  description:
    "TRI J menyediakan berbagai pilihan peralatan rumah tangga berkualitas tinggi, fungsional, dan tahan lama untuk kebutuhan harian & kemitraan usaha Anda.",
  keywords: [
    "TRI J",
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
    title: "TRI J - Peralatan Rumah Tangga Berkualitas",
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
    title: "TRI J - Peralatan Rumah Tangga Berkualitas",
    description:
      "Temukan berbagai peralatan rumah tangga berkualitas tinggi dan fungsional di TRI J.",
    images: ["/assets/hero/peralatan-rumah-tangga.jpg"],
  },
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" data-scroll-behavior="smooth">
      <body className={inter.className}>
        <AuthProvider>
          <WishlistProvider>{children}</WishlistProvider>
        </AuthProvider>
      </body>
    </html>
  );
}