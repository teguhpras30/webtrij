"use client";

import { useState, useEffect, useRef } from "react";
import {
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ChevronDown,
} from "lucide-react";

interface ProductsTabProps {
  products: any[];
  categories?: any[];
  searchQuery: string;
  onEdit: (product: any) => void;
  onDelete: (id: number) => void;
}

export default function ProductsTab({
  products,
  categories = [],
  searchQuery,
  onEdit,
  onDelete,
}: ProductsTabProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [isInfiniteScroll, setIsInfiniteScroll] = useState(false);
  const [infiniteLimit, setInfiniteLimit] = useState(25);
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");

  const bottomSentinelRef = useRef<HTMLDivElement | null>(null);

  // Derive unique categories if not provided
  const categoryOptions =
    categories && categories.length > 0
      ? categories
      : Array.from(
          new Map(
            products
              .filter((p) => p.category)
              .map((p) => [p.category.id || p.category.name, p.category])
          ).values()
        );

  // Filter products based on search and selected category
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category?.name?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === "ALL" ||
      String(p.categoryId) === String(selectedCategory) ||
      String(p.category?.id) === String(selectedCategory) ||
      p.category?.name === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const totalRows = filteredProducts.length;
  const totalPages = Math.max(1, Math.ceil(totalRows / rowsPerPage));

  // Reset pagination on search, rowsPerPage, or category change
  useEffect(() => {
    setCurrentPage(1);
    setInfiniteLimit(rowsPerPage);
  }, [searchQuery, rowsPerPage, selectedCategory]);

  // Infinite Scroll IntersectionObserver
  useEffect(() => {
    if (!isInfiniteScroll) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setInfiniteLimit((prev) => Math.min(prev + rowsPerPage, totalRows));
        }
      },
      { threshold: 0.5 }
    );

    const sentinel = bottomSentinelRef.current;
    if (sentinel) observer.observe(sentinel);

    return () => {
      if (sentinel) observer.unobserve(sentinel);
    };
  }, [isInfiniteScroll, rowsPerPage, totalRows]);

  // Determine displayed products
  const displayedProducts = isInfiniteScroll
    ? filteredProducts.slice(0, infiniteLimit)
    : filteredProducts.slice(
        (currentPage - 1) * rowsPerPage,
        currentPage * rowsPerPage
      );

  return (
    <div className="space-y-4">
      {/* Main Table Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3.5">#</th>
                <th className="px-4 py-3.5">Produk</th>
                <th className="px-4 py-3.5">
                  <div className="relative inline-flex items-center">
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="bg-slate-900 border border-slate-700/80 hover:border-slate-600 text-slate-200 text-[11px] py-1 pl-2.5 pr-7 rounded-lg appearance-none focus:outline-none focus:border-red-500 cursor-pointer font-medium normal-case transition-colors shadow-xs"
                      title="Filter berdasarkan kategori"
                    >
                      <option value="ALL" className="bg-slate-900 text-slate-200">
                        Semua Kategori
                      </option>
                      {categoryOptions.map((c: any) => (
                        <option key={c.id || c.name} value={c.id || c.name} className="bg-slate-900 text-slate-200">
                          {c.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 pointer-events-none" />
                  </div>
                </th>
                <th className="px-4 py-3.5">Terjual</th>
                <th className="px-4 py-3.5">Status Badge</th>
                <th className="px-4 py-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {displayedProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-slate-500">
                    Belum ada produk ditemukan.
                  </td>
                </tr>
              ) : (
                displayedProducts.map((p, index) => {
                  const rowIndex = isInfiniteScroll
                    ? index + 1
                    : (currentPage - 1) * rowsPerPage + index + 1;

                  return (
                    <tr key={p.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-4 py-3 text-slate-500 font-mono">{rowIndex}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={p.thumbnail}
                            alt={p.name}
                            className="w-12 h-12 rounded-lg object-cover bg-slate-950 border border-slate-800 shrink-0"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                "https://placehold.co/100x100?text=No+Img";
                            }}
                          />
                          <div>
                            <div className="font-medium text-white text-sm">{p.name}</div>
                            <div className="text-slate-400 line-clamp-1 max-w-xs">{p.description}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2.5 py-1 bg-slate-800 text-slate-300 rounded-lg text-[11px] font-medium border border-slate-700/50">
                          {p.category?.name || "Uncategorized"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-400 font-mono">{p.sold}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          {p.isPopular && (
                            <span className="px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[10px] rounded-full font-semibold">
                              Populer
                            </span>
                          )}
                          {p.isDeal && (
                            <span className="px-2 py-0.5 bg-rose-500/10 text-rose-400 border border-rose-500/30 text-[10px] rounded-full font-semibold">
                              Hot Deal
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => onEdit(p)}
                            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onDelete(p.id)}
                            className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                            title="Hapus"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Sentinel for infinite scroll trigger */}
        {isInfiniteScroll && infiniteLimit < totalRows && (
          <div ref={bottomSentinelRef} className="py-4 text-center text-xs text-slate-500">
            Memuat produk lainnya... ({infiniteLimit} dari {totalRows})
          </div>
        )}
      </div>

      {/* Pagination & Infinite Scroll Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
        <div className="text-xs text-slate-400">
          Menampilkan <span className="text-white font-semibold">{displayedProducts.length}</span> dari{" "}
          <span className="text-white font-semibold">{totalRows}</span> produk
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Pagination Toolbar */}
          {!isInfiniteScroll && (
            <div className="inline-flex items-center bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-md text-xs font-medium">
              {/* First Page (<<) */}
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(1)}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent transition-colors border-r border-slate-800 cursor-pointer"
                title="Halaman Pertama"
              >
                <ChevronsLeft className="w-4 h-4" />
              </button>

              {/* Previous Page (<) */}
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent transition-colors border-r border-slate-800 cursor-pointer"
                title="Sebelumnya"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {/* Current Page Status */}
              <div className="px-3.5 py-1.5 text-slate-200 font-mono">
                <span className="text-white font-bold">{currentPage}</span> of{" "}
                <span className="text-slate-400">{totalPages}</span>
              </div>

              {/* Rows Per Page Dropdown */}
              <div className="relative border-l border-r border-slate-800 px-2 py-1 flex items-center bg-slate-950/50">
                <select
                  value={rowsPerPage}
                  onChange={(e) => setRowsPerPage(Number(e.target.value))}
                  className="bg-transparent text-slate-200 text-xs py-0.5 pr-4 appearance-none focus:outline-none cursor-pointer font-mono"
                >
                  <option value={10} className="bg-slate-900 text-slate-200">10 rows per page</option>
                  <option value={25} className="bg-slate-900 text-slate-200">25 rows per page</option>
                  <option value={50} className="bg-slate-900 text-slate-200">50 rows per page</option>
                  <option value={100} className="bg-slate-900 text-slate-200">100 rows per page</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 pointer-events-none" />
              </div>

              {/* Next Page (>) */}
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent transition-colors border-r border-slate-800 cursor-pointer"
                title="Berikutnya"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              {/* Last Page (>>) */}
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(totalPages)}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
                title="Halaman Terakhir"
              >
                <ChevronsRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Infinite Scroll Toggle Switch */}
          <div className="inline-flex items-center gap-2.5 bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-1.5 shadow-md text-xs">
            <button
              type="button"
              onClick={() => {
                setIsInfiniteScroll(!isInfiniteScroll);
                setInfiniteLimit(rowsPerPage);
              }}
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                isInfiniteScroll ? "bg-red-600" : "bg-slate-700"
              }`}
              role="switch"
              aria-checked={isInfiniteScroll}
            >
              <span
                aria-hidden="true"
                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                  isInfiniteScroll ? "translate-x-4" : "translate-x-0"
                }`}
              />
            </button>
            <span className="text-slate-300 font-medium select-none">infinite scroll</span>
          </div>
        </div>
      </div>
    </div>
  );
}
