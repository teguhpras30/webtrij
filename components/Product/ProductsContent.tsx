"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

import { allProducts as initialProducts } from "@/data/Products";
import { categories as initialCategories } from "@/data/categories";

import CategorySidebar from "@/components/Product/CategorySidebar";
import ProductFilter from "@/components/Product/ProductFilter";
import ProductGrid from "@/components/Product/ProductGrid";

const ALL_CATEGORY = "Semua Produk";

export default function ProductsContent() {
  const searchParams = useSearchParams();
  const { user } = useAuth();

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

  const filteredProducts = allProducts.filter((product: any) => {
    const matchesCategory =
      activeCategory === ALL_CATEGORY ||
      !activeCategory ||
      (typeof product.category === "string" ? product.category : product.category?.name) === activeCategory;

    return matchesCategory;
  });

  const getProductPrice = (p: any) => {
    if (typeof p.retailPrice === "number" && p.retailPrice > 0) return p.retailPrice;
    if (typeof p.price === "number" && p.price > 0) return p.price;
    if (Array.isArray(p.variants) && p.variants.length > 0) {
      const prices = p.variants.map((v: any) => Number(v.price) || 0).filter((val: number) => val > 0);
      if (prices.length > 0) return Math.min(...prices);
    }
    return 0;
  };

  const isProductSoldOut = (p: any) => {
    if (Array.isArray(p.variants) && p.variants.length > 0) {
      const totalVarStock = p.variants.reduce((acc: number, v: any) => acc + (Number(v.stock) || 0), 0);
      return totalVarStock <= 0;
    }
    return (Number(p.stock) || 0) <= 0;
  };

  const sortedProducts = [...filteredProducts].sort((a: any, b: any) => {
    const isSoldOutA = isProductSoldOut(a);
    const isSoldOutB = isProductSoldOut(b);

    // Products that are sold out / out of stock MUST go to the very bottom
    if (isSoldOutA !== isSoldOutB) {
      return isSoldOutA ? 1 : -1;
    }

    if (activeFilter === "Harga Termurah") {
      return getProductPrice(a) - getProductPrice(b);
    }
    if (activeFilter === "Harga Termahal") {
      return getProductPrice(b) - getProductPrice(a);
    }
    if (activeFilter === "Terbaru") {
      return (Number(b.id) || 0) - (Number(a.id) || 0);
    }
    if (activeFilter === "Terlaris") {
      const soldA = parseInt(String(a.sold || "0").replace(/[^0-9]/g, ""), 10) || 0;
      const soldB = parseInt(String(b.sold || "0").replace(/[^0-9]/g, ""), 10) || 0;
      return soldB - soldA;
    }
    // "Populer"
    return (b.isPopular ? 1 : 0) - (a.isPopular ? 1 : 0);
  });

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
          <ProductGrid products={sortedProducts} />
        </div>
      </div>
    </div>
  );
}
