import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ProductGallery from "@/components/Product/ProductGallery";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getPublicProductById } from "@/lib/data";

export default async function ProductDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getPublicProductById(Number(id));

  if (!product) notFound();

  return (
    <main className="min-h-screen bg-[var(--Bg)]">
      <Navbar />

      <div className="mx-auto max-w-[1600px] px-4 pt-24 pb-16 sm:px-6 md:px-8 md:pt-28 lg:px-10 lg:pt-32 lg:pb-20">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-14 xl:gap-20 items-start">
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