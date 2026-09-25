"use client";

import { useState, useEffect, useRef } from "react";
import {
  Edit,
  Copy,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ChevronDown,
  Tag,
  Layers,
  UserCheck,
  FileSpreadsheet,
  Upload,
  Download,
  Boxes,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";

interface ProductsTabProps {
  products: any[];
  categories?: any[];
  searchQuery: string;
  onEdit: (product: any) => void;
  onCopy?: (product: any) => void;
  onDelete: (id: number) => void;
  onOpenImportCsv?: () => void;
  onExportCsv?: () => void;
}

export default function ProductsTab({
  products,
  categories = [],
  searchQuery,
  onEdit,
  onCopy,
  onDelete,
  onOpenImportCsv,
  onExportCsv,
}: ProductsTabProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [isInfiniteScroll, setIsInfiniteScroll] = useState(false);
  const [infiniteLimit, setInfiniteLimit] = useState(25);
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [stockStatusFilter, setStockStatusFilter] = useState<"ALL" | "OUT_OF_STOCK" | "LOW_STOCK" | "IN_STOCK">("ALL");

  const bottomSentinelRef = useRef<HTMLDivElement | null>(null);

  const formatIDR = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  const getProductTotalStock = (p: any) => {
    if (p.variants && p.variants.length > 0) {
      return p.variants.reduce((sum: number, v: any) => sum + (Number(v.stock) || 0), 0);
    }
    return Number(p.stock) || 0;
  };

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

  // Stock status counts
  const outOfStockCount = products.filter((p) => getProductTotalStock(p) === 0).length;
  const lowStockCount = products.filter((p) => {
    const s = getProductTotalStock(p);
    return s > 0 && s <= 5;
  }).length;
  const inStockCount = products.filter((p) => getProductTotalStock(p) > 0).length;

  // Filter products based on search, selected category, and stock status
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category?.name?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === "ALL" ||
      String(p.categoryId) === String(selectedCategory) ||
      String(p.category?.id) === String(selectedCategory) ||
      p.category?.name === selectedCategory;

    const totalStock = getProductTotalStock(p);
    let matchesStock = true;
    if (stockStatusFilter === "OUT_OF_STOCK") matchesStock = totalStock === 0;
    else if (stockStatusFilter === "LOW_STOCK") matchesStock = totalStock > 0 && totalStock <= 5;
    else if (stockStatusFilter === "IN_STOCK") matchesStock = totalStock > 0;

    return matchesSearch && matchesCategory && matchesStock;
  });

  const totalRows = filteredProducts.length;
  const totalPages = Math.max(1, Math.ceil(totalRows / rowsPerPage));

  // Reset pagination on search, rowsPerPage, category, or stock filter change
  useEffect(() => {
    setCurrentPage(1);
    setInfiniteLimit(rowsPerPage);
  }, [searchQuery, rowsPerPage, selectedCategory, stockStatusFilter]);

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
    <div className="space-y-4 font-sans">

      {/* Stock Status Filter Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-gray-200/80">
        <button
          type="button"
          onClick={() => setStockStatusFilter("ALL")}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
            stockStatusFilter === "ALL"
              ? "bg-gray-900 text-white shadow-xs"
              : "bg-white border border-gray-200 text-gray-600 hover:text-gray-900"
          }`}
        >
          <span>Semua Produk</span>
          <span className="px-1.5 py-0.5 bg-white/20 rounded-full text-[10px]">{products.length}</span>
        </button>

        <button
          type="button"
          onClick={() => setStockStatusFilter("OUT_OF_STOCK")}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
            stockStatusFilter === "OUT_OF_STOCK"
              ? "bg-red-600 text-white shadow-xs"
              : "bg-red-50 border border-red-200 text-red-700 hover:bg-red-100"
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Stok Habis</span>
          <span className="px-1.5 py-0.5 bg-red-600/20 text-red-800 rounded-full text-[10px] font-extrabold">{outOfStockCount}</span>
        </button>

        <button
          type="button"
          onClick={() => setStockStatusFilter("LOW_STOCK")}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
            stockStatusFilter === "LOW_STOCK"
              ? "bg-amber-500 text-white shadow-xs"
              : "bg-amber-50 border border-amber-200 text-amber-700 hover:bg-amber-100"
          }`}
        >
          <span>Stok Menipis (≤5)</span>
          <span className="px-1.5 py-0.5 bg-amber-500/20 text-amber-900 rounded-full text-[10px] font-extrabold">{lowStockCount}</span>
        </button>

        <button
          type="button"
          onClick={() => setStockStatusFilter("IN_STOCK")}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
            stockStatusFilter === "IN_STOCK"
              ? "bg-emerald-600 text-white shadow-xs"
              : "bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100"
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Stok Tersedia</span>
          <span className="px-1.5 py-0.5 bg-emerald-600/20 text-emerald-800 rounded-full text-[10px] font-extrabold">{inStockCount}</span>
        </button>
      </div>

      {/* Main Table Card */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-700">
            <thead className="bg-gray-50 text-gray-500 font-semibold border-b border-gray-200 uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3.5">#</th>
                <th className="px-4 py-3.5">Produk</th>
                <th className="px-4 py-3.5">
                  <div className="relative inline-flex items-center">
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="bg-white border border-gray-200 hover:border-gray-300 text-gray-700 text-[11px] py-1 pl-2.5 pr-7 rounded-lg appearance-none focus:outline-none focus:border-red-500 cursor-pointer font-medium normal-case transition-colors shadow-xs"
                      title="Filter berdasarkan kategori"
                    >
                      <option value="ALL">Semua Kategori</option>
                      {categoryOptions.map((c: any) => (
                        <option key={c.id || c.name} value={c.id || c.name}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2 pointer-events-none" />
                  </div>
                </th>
                <th className="px-4 py-3.5">Harga & Variasi</th>
                <th className="px-4 py-3.5">Terjual</th>
                <th className="px-4 py-3.5">Status Badge</th>
                <th className="px-4 py-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {displayedProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-gray-400">
                    Belum ada produk ditemukan.
                  </td>
                </tr>
              ) : (
                displayedProducts.map((p, index) => {
                  const rowIndex = isInfiniteScroll
                    ? index + 1
                    : (currentPage - 1) * rowsPerPage + index + 1;

                  const hasVariants = p.variants && p.variants.length > 0;
                  let priceDisplay = formatIDR(p.retailPrice || 0);

                  if (hasVariants) {
                    const prices = p.variants.map((v: any) => v.price).filter((pr: number) => !isNaN(pr));
                    if (prices.length > 0) {
                      const minP = Math.min(...prices);
                      const maxP = Math.max(...prices);
                      if (minP === maxP) {
                        priceDisplay = formatIDR(minP);
                      } else {
                        priceDisplay = `${formatIDR(minP)} - ${formatIDR(maxP)}`;
                      }
                    }
                  }

                  const totalStock = hasVariants
                    ? p.variants.reduce((sum: number, v: any) => sum + (Number(v.stock) || 0), 0)
                    : (Number(p.stock) || 0);

                  const isOutOfStock = totalStock === 0;
                  const isLowStock = totalStock > 0 && totalStock <= 5;

                  return (
                    <tr
                      key={p.id}
                      className={`transition-colors ${
                        isOutOfStock
                          ? "bg-red-50/70 hover:bg-red-100/80 border-l-4 border-l-red-500"
                          : isLowStock
                          ? "bg-amber-50/50 hover:bg-amber-100/60 border-l-4 border-l-amber-400"
                          : "hover:bg-gray-50"
                      }`}
                    >
                      <td className="px-4 py-3 text-gray-400 font-mono">{rowIndex}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={p.thumbnail}
                            alt={p.name}
                            className="w-12 h-12 rounded-lg object-cover bg-gray-100 border border-gray-200 shrink-0"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                "https://placehold.co/100x100?text=No+Img";
                            }}
                          />
                          <div>
                            <div className="font-bold text-gray-900 text-sm">{p.name}</div>
                            <div className="text-gray-500 line-clamp-1 max-w-xs">{p.description}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-lg text-[11px] font-medium border border-gray-200">
                          {p.category?.name || "Uncategorized"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-extrabold text-emerald-600 font-mono text-xs">
                          {priceDisplay}
                        </div>
                        <div className="flex items-center gap-1.5 flex-wrap mt-1">
                          {hasVariants ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-50 text-purple-700 border border-purple-200 text-[10px] rounded-md font-bold">
                              <Layers className="w-3 h-3 text-purple-600" />
                              <span>{p.variants.length} Variasi</span>
                            </span>
                          ) : (
                            <span className="text-[10px] text-gray-400 font-medium">Single Item</span>
                          )}
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 border text-[10px] rounded-md font-extrabold ${
                            totalStock > 0
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-red-50 text-red-600 border-red-200"
                          }`}>
                            <Boxes className="w-3 h-3 text-emerald-600" />
                            <span>{totalStock > 0 ? `Total Stok: ${totalStock} Pcs` : "Stok Habis"}</span>
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600 font-mono">{p.sold}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {p.isBuyerOnly && (
                            <span className="px-2 py-0.5 bg-purple-50 text-purple-700 border border-purple-200 text-[10px] rounded-full font-extrabold flex items-center gap-1">
                              <UserCheck className="w-3 h-3 text-purple-600" />
                              <span>Buyer Only</span>
                            </span>
                          )}
                          {p.isPopular && (
                            <span className="px-2 py-0.5 bg-amber-50 text-amber-600 border border-amber-200 text-[10px] rounded-full font-semibold">
                              Populer
                            </span>
                          )}
                          {p.isDeal && (
                            <span className="px-2 py-0.5 bg-rose-50 text-rose-600 border border-rose-200 text-[10px] rounded-full font-semibold">
                              Hot Deal
                            </span>
                          )}
                          {!p.isBuyerOnly && !p.isPopular && !p.isDeal && (
                            <span className="text-[11px] text-gray-400 font-medium">-</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onEdit(p)}
                            className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                            title="Edit Produk"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (onCopy) {
                                onCopy(p);
                              } else {
                                onEdit({
                                  ...p,
                                  id: undefined,
                                  name: `${p.name} (Salinan)`,
                                });
                              }
                            }}
                            className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                            title="Duplikat / Salin Produk"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onDelete(p.id)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            title="Hapus Produk"
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
          <div ref={bottomSentinelRef} className="py-4 text-center text-xs text-gray-400">
            Memuat produk lainnya... ({infiniteLimit} dari {totalRows})
          </div>
        )}
      </div>

      {/* Pagination & Infinite Scroll Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
        <div className="text-xs text-gray-500">
          Menampilkan <span className="text-gray-900 font-semibold">{displayedProducts.length}</span> dari{" "}
          <span className="text-gray-900 font-semibold">{totalRows}</span> produk
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Pagination Toolbar */}
          {!isInfiniteScroll && (
            <div className="inline-flex items-center bg-white border border-gray-200 rounded-xl overflow-hidden shadow-xs text-xs font-medium">
              {/* First Page (<<) */}
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(1)}
                className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors border-r border-gray-200 cursor-pointer"
                title="Halaman Pertama"
              >
                <ChevronsLeft className="w-4 h-4" />
              </button>

              {/* Previous Page (<) */}
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors border-r border-gray-200 cursor-pointer"
                title="Sebelumnya"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {/* Current Page Status */}
              <div className="px-3.5 py-1.5 text-gray-700 font-mono">
                <span className="text-gray-900 font-bold">{currentPage}</span> of{" "}
                <span className="text-gray-500">{totalPages}</span>
              </div>

              {/* Rows Per Page Dropdown */}
              <div className="relative border-l border-r border-gray-200 px-2 py-1 flex items-center bg-gray-50">
                <select
                  value={rowsPerPage}
                  onChange={(e) => setRowsPerPage(Number(e.target.value))}
                  className="bg-transparent text-gray-800 text-xs py-0.5 pr-4 appearance-none focus:outline-none cursor-pointer font-mono font-medium"
                >
                  <option value={10}>10 rows per page</option>
                  <option value={25}>25 rows per page</option>
                  <option value={50}>50 rows per page</option>
                  <option value={100}>100 rows per page</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2 pointer-events-none" />
              </div>

              {/* Next Page (>) */}
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors border-r border-gray-200 cursor-pointer"
                title="Berikutnya"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              {/* Last Page (>>) */}
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(totalPages)}
                className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
                title="Halaman Terakhir"
              >
                <ChevronsRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Infinite Scroll Toggle Switch */}
          <div className="inline-flex items-center gap-2.5 bg-white border border-gray-200 rounded-xl px-3.5 py-1.5 shadow-xs text-xs">
            <button
              type="button"
              onClick={() => {
                setIsInfiniteScroll(!isInfiniteScroll);
                setInfiniteLimit(rowsPerPage);
              }}
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                isInfiniteScroll ? "bg-red-600" : "bg-gray-300"
              }`}
              role="switch"
              aria-checked={isInfiniteScroll}
            >
              <span
                aria-hidden="true"
                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                  isInfiniteScroll ? "translate-x-4" : "translate-x-0"
                }`}
              />
            </button>
            <span className="text-gray-700 font-medium select-none">infinite scroll</span>
          </div>
        </div>
      </div>
    </div>
  );
}
