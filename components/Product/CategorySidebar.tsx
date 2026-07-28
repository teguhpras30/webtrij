"use client";

import { useRef } from "react";
import { categories as staticCategories } from "@/data/categories";

interface CategorySidebarProps {
  categories?: string[];
  activeCategory: string;
  setActiveCategory: React.Dispatch<React.SetStateAction<string>>;
}

const ALL_CATEGORY = "Semua Produk";

export default function CategorySidebar({
  categories = staticCategories,
  activeCategory,
  setActiveCategory,
}: CategorySidebarProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const displayCategories =
    categories && categories.length > 0
      ? categories.includes(ALL_CATEGORY)
        ? categories
        : [ALL_CATEGORY, ...categories]
      : [ALL_CATEGORY, ...staticCategories];

  const handleCategoryClick = (category: string, index: number) => {
    setActiveCategory(category);

    const container = scrollContainerRef.current;
    if (container) {
      const button = container.children[index] as HTMLElement;
      if (button) {
        button.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "center",
        });
      }
    }
  };

  return (
    <>
      {/* Mobile Horizontal Category Pills */}
      <div className="w-full overflow-hidden lg:hidden">
        <div
          ref={scrollContainerRef}
          className="flex gap-2 overflow-x-auto pb-2 pt-1 scroll-smooth [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        >
          {displayCategories.map((category, idx) => {
            const isActive = activeCategory === category;
            return (
              <button
                key={category}
                onClick={() => handleCategoryClick(category, idx)}
                className={`flex-none whitespace-nowrap rounded-full px-4 py-2 text-xs sm:text-sm font-medium transition-all duration-200 cursor-pointer ${
                  isActive
                    ? "bg-[#774EFC] text-white font-semibold"
                    : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 active:scale-95"
                }`}
              >
                {category}
              </button>
            );
          })}
        </div>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden w-[240px] shrink-0 lg:block">
        <div className="sticky top-28 bg-white border border-gray-200/80 rounded-2xl p-4">
          <h3 className="font-semibold text-xs uppercase tracking-wider text-gray-400 mb-3 px-2">
            Kategori Produk
          </h3>

          <div className="space-y-1">
            {displayCategories.map((category) => {
              const isActive = activeCategory === category;
              return (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-sm font-medium transition-all duration-200 cursor-pointer ${
                    isActive
                      ? "bg-[#774EFC] text-white font-semibold"
                      : "text-[#333] hover:bg-gray-100/80 hover:text-[#1D1D1F]"
                  }`}
                >
                  <span>{category}</span>
                </button>
              );
            })}
          </div>
        </div>
      </aside>
    </>
  );
}