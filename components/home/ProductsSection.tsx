"use client";

import { useState, useCallback, useEffect } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import ProductCardBig from "@/components/home/ProductCardBig";
import { allProducts as initialProducts } from "@/data/Products";
import { motion } from "framer-motion";

export default function ProductsSection() {
  const [allProducts, setAllProducts] = useState(initialProducts);
  const [activeTab, setActiveTab] = useState<"popular" | "deals">("popular");

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch("/api/public/products");
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setAllProducts(data);
          }
        }
      } catch (err) {
        console.error("Failed to fetch public products:", err);
      }
    }
    fetchProducts();
  }, []);

  const productsList =
    activeTab === "popular"
      ? allProducts.filter((p: any) => p.isPopular).length > 0
        ? allProducts.filter((p: any) => p.isPopular)
        : allProducts
      : allProducts.filter((p: any) => p.isDeal).length > 0
      ? allProducts.filter((p: any) => p.isDeal)
      : [...allProducts].reverse();

  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: true,
      align: "start",
    },
    [
      Autoplay({
        delay: 3500,
        stopOnInteraction: false,
      }),
    ]
  );

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const handleTabChange = (tab: "popular" | "deals") => {
    setActiveTab(tab);
  };

  return (
    <section className="w-full bg-[#E5E5E5] py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-5 md:px-10 lg:px-20">
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          {/* Header */}
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h2 className="text-3xl sm:text-4xl lg:text-6xl font-['MADE_Sunflower'] text-[#1D1D1F]">
                Our Featured Products
              </h2>

              <p className="mt-4 max-w-md text-sm md:text-base leading-7 text-[#4A4A4A]">
                Produk unggulan yang telah dipilih untuk mendukung kebutuhan distributor dengan kualitas stabil, desain fungsional, dan siap dipasarkan.
              </p>

              {/* Tabs */}
              <div className="mt-8 inline-flex flex-wrap rounded-2xl bg-[#774EFC] p-2 gap-2">
                <button
                  onClick={() => handleTabChange("deals")}
                  className={`px-5 md:px-7 py-3 rounded-[14px] text-sm font-medium transition-all duration-300 ${
                    activeTab === "deals" ? "bg-white text-[#1D1D1F]" : "text-white"
                  }`}
                >
                  Best Deals
                </button>

                <button
                  onClick={() => handleTabChange("popular")}
                  className={`px-7 py-3 rounded-[14px] text-sm font-medium transition-all duration-300 ${
                    activeTab === "popular" ? "bg-white text-[#1D1D1F]" : "text-white"
                  }`}
                >
                  Most Popular
                </button>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex gap-4">
              <button
                onClick={scrollPrev}
                aria-label="Previous products"
                className="flex h-12 w-12 items-center justify-center rounded-full bg-[#1D1D1F] text-white transition hover:bg-[#333] active:scale-95"
              >
                ←
              </button>

              <button
                onClick={scrollNext}
                aria-label="Next products"
                className="flex h-12 w-12 items-center justify-center rounded-full bg-[#1D1D1F] text-white transition hover:bg-[#333] active:scale-95"
              >
                →
              </button>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          {/* Embla Carousel Slider */}
          <div className="mt-12 overflow-hidden" ref={emblaRef}>
            <div className="flex py-4 px-2">
              {productsList.map((product: any) => (
                <div key={product.id} className="flex-none mr-8 last:mr-0">
                  <ProductCardBig product={product} />
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}