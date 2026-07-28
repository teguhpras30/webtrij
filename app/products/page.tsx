"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";

import { allProducts as initialProducts } from "@/data/Products";
import { categories as initialCategories } from "@/data/categories";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CategorySidebar from "@/components/Product/CategorySidebar";
import ProductFilter from "@/components/Product/ProductFilter";
import ProductGrid from "@/components/Product/ProductGrid";

const ALL_CATEGORY = "Semua Produk";

function ProductsContent() {
  const searchParams = useSearchParams();

  const [categoriesList, setCategoriesList] = useState<string[]>([
    ALL_CATEGORY,
    ...initialCategories,
  ]);
  const [allProducts, setAllProducts] = useState(initialProducts);
  const [activeCategory, setActiveCategory] = useState(ALL_CATEGORY);
  const [activeFilter, setActiveFilter] = useState("Populer");

  useEffect(() => {
    async function fetchPublicData() {
      try {
        const [resC, resP] = await Promise.all([
          fetch("/api/public/categories"),
          fetch("/api/public/products"),
        ]);

        if (resC.ok) {
          const cats = await resC.json();
          if (Array.isArray(cats) && cats.length > 0) {
            const combinedCats = [
              ALL_CATEGORY,
              ...cats.filter((c: string) => c !== ALL_CATEGORY),
            ];
            setCategoriesList(combinedCats);

            const queryCat = searchParams.get("category");
            if (queryCat && combinedCats.includes(queryCat)) {
              setActiveCategory(queryCat);
            } else {
              setActiveCategory(ALL_CATEGORY);
            }
          }
        }

        if (resP.ok) {
          const prods = await resP.json();
          if (Array.isArray(prods) && prods.length > 0) {
            setAllProducts(prods);
          }
        }
      } catch (err) {
        console.error("Failed to fetch public products/categories:", err);
      }
    }
    fetchPublicData();
  }, [searchParams]);

  const filteredProducts =
    activeCategory === ALL_CATEGORY || !activeCategory
      ? allProducts
      : allProducts.filter(
          (product: any) =>
            (typeof product.category === "string"
              ? product.category
              : product.category?.name) === activeCategory
        );

  return (
    <div className="flex flex-col gap-4 sm:gap-6 lg:flex-row lg:gap-10">
      <CategorySidebar
        categories={categoriesList}
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
      />

      <div className="flex-1">
        <ProductFilter
          activeFilter={activeFilter}
          setActiveFilter={setActiveFilter}
        />

        <div className="mt-4 sm:mt-8">
          <ProductGrid products={filteredProducts} />
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <main className="min-h-screen bg-[var(--Bg)]">
      <Navbar />

      <section className="mx-auto max-w-[1600px] px-3.5 sm:px-6 pt-20 sm:pt-24 pb-16 lg:px-10 lg:pt-32 lg:pb-20">
        <Suspense fallback={<div className="text-center py-10">Memuat produk...</div>}>
          <ProductsContent />
        </Suspense>
      </section>

      <Footer />
    </main>
  );
}