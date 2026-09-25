"use client";

import { useState, useRef, useEffect } from "react";
import { ArrowUpDown, TrendingUp, Sparkles, Flame, ChevronDown, Check, ArrowUp, ArrowDown } from "lucide-react";

interface ProductFilterProps {
  activeFilter: string;
  setActiveFilter: (filter: string) => void;
}

const mainFilters = ["Populer", "Terbaru", "Terlaris"];

export default function ProductFilter({
  activeFilter,
  setActiveFilter,
}: ProductFilterProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isPriceFilterActive = activeFilter === "Harga Termurah" || activeFilter === "Harga Termahal";

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getPriceLabel = () => {
    if (activeFilter === "Harga Termurah") return "Harga: Rendah ke Tinggi";
    if (activeFilter === "Harga Termahal") return "Harga: Tinggi ke Rendah";
    return "Harga";
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white border border-gray-200/80 p-2.5 sm:p-3.5 shadow-xs font-sans">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs sm:text-sm font-bold text-gray-700 pr-1 flex items-center gap-1.5">
          <ArrowUpDown className="w-4 h-4 text-[#774EFC]" />
          <span>Urutkan:</span>
        </span>

        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          {/* Main Filter Buttons */}
          {mainFilters.map((filter) => {
            const isActive = activeFilter === filter;
            return (
              <button
                key={filter}
                type="button"
                onClick={() => {
                  setActiveFilter(filter);
                  setIsDropdownOpen(false);
                }}
                className={`rounded-xl px-3.5 sm:px-4 py-2 text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
                  isActive
                    ? "bg-[#774EFC] text-white shadow-sm scale-102"
                    : "bg-gray-100/80 text-gray-700 hover:bg-purple-50 hover:text-[#774EFC]"
                }`}
              >
                {filter === "Populer" && <Flame className={`w-3.5 h-3.5 ${isActive ? "fill-white" : "text-amber-500"}`} />}
                {filter === "Terbaru" && <Sparkles className={`w-3.5 h-3.5 ${isActive ? "fill-white" : "text-emerald-500"}`} />}
                {filter === "Terlaris" && <TrendingUp className={`w-3.5 h-3.5 ${isActive ? "fill-white" : "text-blue-500"}`} />}
                {filter}
              </button>
            );
          })}

          {/* Shopee-Style Dropdown Menu for Price Sort */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setIsDropdownOpen((prev) => !prev)}
              className={`rounded-xl px-3.5 sm:px-4 py-2 text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
                isPriceFilterActive
                  ? "bg-[#774EFC] text-white shadow-sm scale-102"
                  : "bg-gray-100/80 text-gray-700 hover:bg-purple-50 hover:text-[#774EFC]"
              }`}
            >
              <span>{getPriceLabel()}</span>
              <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`} />
            </button>

            {/* Dropdown Menu Items */}
            {isDropdownOpen && (
              <div className="absolute left-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150 space-y-1">
                <button
                  type="button"
                  onClick={() => {
                    setActiveFilter("Harga Termurah");
                    setIsDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition cursor-pointer ${
                    activeFilter === "Harga Termurah"
                      ? "bg-purple-50 text-[#774EFC]"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <ArrowDown className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Harga: Rendah ke Tinggi</span>
                  </div>
                  {activeFilter === "Harga Termurah" && <Check className="w-4 h-4 text-[#774EFC]" />}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveFilter("Harga Termahal");
                    setIsDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition cursor-pointer ${
                    activeFilter === "Harga Termahal"
                      ? "bg-purple-50 text-[#774EFC]"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <ArrowUp className="w-3.5 h-3.5 text-rose-600" />
                    <span>Harga: Tinggi ke Rendah</span>
                  </div>
                  {activeFilter === "Harga Termahal" && <Check className="w-4 h-4 text-[#774EFC]" />}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}