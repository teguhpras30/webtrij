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
  const displayCategories =
    categories && categories.length > 0
      ? categories.includes(ALL_CATEGORY)
        ? categories
        : [ALL_CATEGORY, ...categories]
      : [ALL_CATEGORY, ...staticCategories];

  return (
    <>
      {/* Mobile */}
      <div className="flex gap-3 overflow-x-auto pb-2 lg:hidden">
        {displayCategories.map((category) => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`whitespace-nowrap rounded-full px-5 py-2 text-sm transition cursor-pointer ${
              activeCategory === category
                ? "bg-[#774EFC] text-white"
                : "bg-white border border-gray-200 text-[#1D1D1F]"
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Desktop */}
      <aside className="hidden w-[220px] lg:block">
        {displayCategories.map((category) => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`mb-2 flex w-full gap-4 rounded-xl px-5 py-4 text-left transition cursor-pointer ${
              activeCategory === category
                ? "bg-[#774EFC] text-white"
                : "text-[#1D1D1F] hover:bg-gray-100"
            }`}
          >
            {category}
          </button>
        ))}
      </aside>
    </>
  );
}