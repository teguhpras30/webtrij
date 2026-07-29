import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ProductGallery from "@/components/Product/ProductGallery";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getPublicProductById } from "@/lib/data";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const product = await getPublicProductById(Number(id));

  if (!product) {
    return {
      title: "Produk Tidak Ditemukan | TRI J",
    };
  }

  const title = `${product.name} | TRI J`;
  const description =
    product.description ||
    `Dapatkan ${product.name} berkualitas tinggi dari TRI J. Peralatan rumah tangga unggulan, fungsional, dan tahan lama.`;

  const imageUrl = product.image?.startsWith("http")
    ? product.image
    : product.image;

  return {
    title,
    description,
    keywords: [
      product.name,
      product.category || "Peralatan Rumah Tangga",
      "Perabot Rumah Tangga TRI J",
      "Distributor Perabot",
    ],
    alternates: {
      canonical: `/products/${product.id}`,
    },
    openGraph: {
      title,
      description,
      url: `/products/${product.id}`,
      type: "article",
      images: imageUrl ? [{ url: imageUrl, alt: product.name }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: imageUrl ? [imageUrl] : [],
    },
  };
}

export default async function ProductDetail({ params }: Props) {
  const { id } = await params;
  const product = await getPublicProductById(Number(id));

  if (!product) notFound();

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://tri-j.co.id";
  const imageUrl = product.image?.startsWith("http")
    ? product.image
    : `${baseUrl}${product.image}`;

  const jsonLd = {
    "@context": "https://schema.org/",
    "@type": "Product",
    name: product.name,
    image: imageUrl ? [imageUrl] : [],
    description: product.description,
    category: product.category,
    brand: {
      "@type": "Brand",
      name: "TRI J",
    },
    offers: {
      "@type": "Offer",
      url: `${baseUrl}/products/${product.id}`,
      priceCurrency: "IDR",
      availability: "https://schema.org/InStock",
      seller: {
        "@type": "Organization",
        name: "TRI J",
      },
    },
  };

  return (
    <main className="min-h-screen bg-[var(--Bg)]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />

      <div className="mx-auto max-w-[1600px] px-4 pt-24 pb-16 sm:px-6 md:px-8 md:pt-28 lg:px-10 lg:pt-32 lg:pb-20">
        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-2 lg:gap-14 xl:gap-20">
          {/* Gallery */}
          <div className="w-full">
            <ProductGallery
              image={product.image}
              images={product.images}
              name={product.name}
            />
          </div>

          {/* Informasi */}
          <div className="flex flex-col">
            <h1 className="text-2xl font-bold sm:text-3xl lg:text-4xl">
              {product.name}
            </h1>

            <p className="mt-4 text-sm leading-7 text-gray-600 sm:text-base lg:mt-6">
              {product.description}
            </p>

            <div className="mt-8">
              <Link
                href="/contact-us"
                className="inline-flex w-full items-center justify-center rounded-[16px] bg-[#774EFC] px-6 py-4 text-base font-semibold text-white transition hover:bg-[#774EFC]/80 sm:w-auto"
              >
                Get Best Price
              </Link>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}