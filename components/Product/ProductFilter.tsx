"use client";

interface ProductFilterProps {
  activeFilter: string;
  setActiveFilter: (filter: string) => void;
}

const filters = ["Populer", "Terbaru", "Terlaris"];

export default function ProductFilter({
  activeFilter,
  setActiveFilter,
}: ProductFilterProps) {
  return (
    <div className="flex items-center justify-between gap-2 rounded-2xl bg-white border border-gray-200/80 p-2 sm:p-3 shadow-sm">
      <div className="flex items-center gap-1.5 sm:gap-2">
        <span className="text-xs sm:text-sm font-medium text-gray-500 pl-1 sm:pl-2">
          Urutkan:
        </span>

        <div className="flex items-center gap-1">
          {filters.map((filter) => {
            const isActive = activeFilter === filter;
            return (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`rounded-xl px-2.5 sm:px-4 py-1.5 text-xs sm:text-sm font-medium transition-all duration-200 cursor-pointer ${
                  isActive
                    ? "bg-[#774EFC] text-white font-semibold"
                    : "bg-gray-100 text-[#333] hover:bg-gray-200/70"
                }`}
              >
                {filter}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}