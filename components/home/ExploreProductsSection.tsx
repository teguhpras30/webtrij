"use client";

import { useState, useEffect } from "react";
import { allProducts as initialProducts } from "@/data/Products";
import { categories as initialCategories } from "@/data/categories";
import ProductCard from "@/components/home/ProductCard";
import { motion } from "framer-motion";

export default function ExploreProductsSection() {
  const [categoriesList, setCategoriesList] = useState<string[]>(initialCategories);
  const [allProducts, setAllProducts] = useState(initialProducts);
  const [activeCategory, setActiveCategory] = useState(initialCategories[0]);

  useEffect(() => {
    async function fetchData() {
      try {
        const [resC, resP] = await Promise.all([
          fetch("/api/public/categories"),
          fetch("/api/public/products"),
        ]);

        if (resC.ok) {
          const cats = await resC.json();
          if (Array.isArray(cats) && cats.length > 0) {
            setCategoriesList(cats);
            setActiveCategory(cats[0]);
          }
        }

        if (resP.ok) {
          const prods = await resP.json();
          if (Array.isArray(prods) && prods.length > 0) {
            setAllProducts(prods);
          }
        }
      } catch (err) {
        console.error("Failed to fetch public categories/products:", err);
      }
    }
    fetchData();
  }, []);

  const filteredProducts = allProducts
    .filter((product: any) => product.category === activeCategory)
    .slice(0, 4);

  return (
    <section className="py-24">
      <div className="mx-auto max-w-[1228px] px-5 sm:px-6 md:px-10 lg:px-12 xl:px-0">
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          {/* Header */}
          <div className="text-center">
            <h2 className="font-['MADE_Sunflower'] text-[56px]">
              Explore Our Products
            </h2>

            <p className="mx-auto mt-4 max-w-[650px] text-[#666]">
              Jelajahi berbagai pilihan peralatan rumah tangga yang dirancang fungsional, dengan kualitas konsisten dan siap untuk didistribusikan.
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          {/* Categories */}
          <div className="mt-10 flex justify-center gap-8 overflow-x-auto">
            {categoriesList.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`whitespace-nowrap text-sm transition ${
                  activeCategory === category ? "font-bold text-[#774EFC]" : "text-gray-500"
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Products */}
          <div className="mt-10 grid grid-cols-1 justify-items-center gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {filteredProducts.map((product: any) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {/* Dots */}
          <div className="mt-10 flex justify-center gap-2">
            {[1, 2, 3, 4, 5, 6].map((dot) => (
              <div key={dot} className="h-2 w-2 rounded-full bg-gray-300" />
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
