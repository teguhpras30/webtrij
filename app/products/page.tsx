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

function ProductsContent() {
  const searchParams = useSearchParams();

  const [categoriesList, setCategoriesList] = useState<string[]>(initialCategories);
  const [allProducts, setAllProducts] = useState(initialProducts);
  const [activeCategory, setActiveCategory] = useState(initialCategories[0]);
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
            setCategoriesList(cats);
            const queryCat = searchParams.get("category");
            if (queryCat && cats.includes(queryCat)) {
              setActiveCategory(queryCat);
            } else {
              setActiveCategory(cats[0]);
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

  const filteredProducts = allProducts.filter(
    (product: any) => product.category === activeCategory
  );

  return (
    <div className="flex flex-col gap-8 lg:flex-row lg:gap-10">
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

        <div className="mt-8">
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

      <section className="mx-auto max-w-[1600px] px-4 pt-24 pb-16 md:px-8 lg:px-10 lg:pt-32 lg:pb-20">
        <Suspense fallback={<div className="text-center py-10">Memuat produk...</div>}>
          <ProductsContent />
        </Suspense>
      </section>

      <Footer />
    </main>
  );
}