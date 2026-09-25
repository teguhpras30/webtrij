"use client";

import React, { useState, useMemo } from "react";
import {
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Package,
  Calendar,
  Download,
  Printer,
  Search,
  ArrowUpRight,
  Filter,
  CheckCircle2,
  Clock,
  Truck,
  CreditCard,
  Layers,
  Award,
  BarChart3,
  FileSpreadsheet,
} from "lucide-react";

interface SalesReportTabProps {
  orders: any[];
}

export default function SalesReportTab({ orders }: SalesReportTabProps) {
  const [period, setPeriod] = useState<"today" | "7days" | "thisMonth" | "thisYear" | "all" | "custom">("thisMonth");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("PAID_ONLY");
  const [searchQuery, setSearchQuery] = useState("");

  const formatIDR = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    return d.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Filter orders by date, status, and search
  const filteredOrders = useMemo(() => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    return orders.filter((order) => {
      const orderDate = new Date(order.createdAt || Date.now());

      // Period filter
      if (period === "today") {
        if (orderDate < todayStart) return false;
      } else if (period === "7days") {
        const past7 = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        if (orderDate < past7) return false;
      } else if (period === "thisMonth") {
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        if (orderDate < monthStart) return false;
      } else if (period === "thisYear") {
        const yearStart = new Date(now.getFullYear(), 0, 1);
        if (orderDate < yearStart) return false;
      } else if (period === "custom") {
        if (startDate && orderDate < new Date(startDate)) return false;
        if (endDate) {
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
          if (orderDate > end) return false;
        }
      }

      // Status filter
      const st = String(order.status || "").toUpperCase();
      if (statusFilter === "PAID_ONLY") {
        // Successful / Paid orders
        const isPaid = [
          "PAID",
          "PACKING",
          "READY_TO_SHIP",
          "ALLOCATED",
          "PICKING_UP",
          "PICKED_UP",
          "DROPPING_OFF",
          "SHIPPED",
          "IN_TRANSIT",
          "DELIVERED",
          "COMPLETED",
        ].includes(st);
        if (!isPaid) return false;
      } else if (statusFilter === "PENDING") {
        if (st !== "PENDING") return false;
      } else if (statusFilter === "CANCELLED") {
        if (st !== "CANCELLED" && st !== "EXPIRED") return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchNumber = String(order.orderNumber || order.id).toLowerCase().includes(q);
        const matchName = String(order.customerName || "").toLowerCase().includes(q);
        const matchPhone = String(order.customerPhone || "").includes(q);
        const matchProduct = order.items?.some((i: any) =>
          String(i.variantName || i.product?.name || "").toLowerCase().includes(q)
        );
        if (!matchNumber && !matchName && !matchPhone && !matchProduct) return false;
      }

      return true;
    });
  }, [orders, period, startDate, endDate, statusFilter, searchQuery]);

  // Aggregate Statistics
  const stats = useMemo(() => {
    let totalRevenue = 0;
    let totalSubtotal = 0;
    let totalShippingCost = 0;
    let totalPromoDiscount = 0;
    let totalAdminFee = 0;
    let totalItemsSold = 0;

    const productSalesMap: {
      [key: string]: { name: string; thumbnail?: string; qty: number; revenue: number };
    } = {};

    // Grouping by date for chart
    const dailyRevenueMap: { [dateStr: string]: { revenue: number; count: number } } = {};

    filteredOrders.forEach((o) => {
      const grandTotal = Number(o.grandTotal || 0);
      const subtotal = Number(o.subtotal || 0);
      const shipping = Number(o.shippingCost || 0);
      const promo = Number(o.promoDiscount || 0) + Number(o.shippingDiscount || 0);
      const adminFee = Number(o.adminFee || 0);

      totalRevenue += grandTotal;
      totalSubtotal += subtotal;
      totalShippingCost += shipping;
      totalPromoDiscount += promo;
      totalAdminFee += adminFee;

      // Date key (DD MMM)
      const d = new Date(o.createdAt || Date.now());
      const dateKey = `${d.getDate()} ${d.toLocaleDateString("id-ID", { month: "short" })}`;
      if (!dailyRevenueMap[dateKey]) {
        dailyRevenueMap[dateKey] = { revenue: 0, count: 0 };
      }
      dailyRevenueMap[dateKey].revenue += grandTotal;
      dailyRevenueMap[dateKey].count += 1;

      // Items calculation
      if (Array.isArray(o.items)) {
        o.items.forEach((item: any) => {
          const qty = Number(item.quantity || 1);
          const price = Number(item.totalPrice || item.unitPrice * qty || 0);
          totalItemsSold += qty;

          const prodKey = String(item.product?.id || item.productId || item.variantName || item.product?.name || "Item");
          const prodName = item.variantName || item.product?.name || `Produk #${prodKey}`;
          const prodThumb = item.product?.thumbnail;

          if (!productSalesMap[prodKey]) {
            productSalesMap[prodKey] = {
              name: prodName,
              thumbnail: prodThumb,
              qty: 0,
              revenue: 0,
            };
          }
          productSalesMap[prodKey].qty += qty;
          productSalesMap[prodKey].revenue += price;
        });
      }
    });

    const averageOrderValue = filteredOrders.length > 0 ? totalRevenue / filteredOrders.length : 0;

    const topProducts = Object.values(productSalesMap)
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 6);

    const chartData = Object.entries(dailyRevenueMap).map(([date, data]) => ({
      date,
      revenue: data.revenue,
      count: data.count,
    }));

    return {
      totalOrders: filteredOrders.length,
      totalRevenue,
      totalSubtotal,
      totalShippingCost,
      totalPromoDiscount,
      totalAdminFee,
      totalItemsSold,
      averageOrderValue,
      topProducts,
      chartData,
    };
  }, [filteredOrders]);

  // Export to CSV
  const handleExportCSV = () => {
    if (filteredOrders.length === 0) {
      alert("Tidak ada data penjualan untuk diekspor.");
      return;
    }

    const headers = [
      "No. Pesanan",
      "Tanggal",
      "Nama Pelanggan",
      "No. HP",
      "Item Produk",
      "Total Qty",
      "Subtotal (Rp)",
      "Diskon (Rp)",
      "Ongkir (Rp)",
      "Biaya Layanan (Rp)",
      "Grand Total (Rp)",
      "Metode Pembayaran",
      "Kurir",
      "Status",
    ];

    const rows = filteredOrders.map((o) => {
      const itemsStr = (o.items || [])
        .map((i: any) => `${i.variantName || i.product?.name || "Produk"} (${i.quantity}x)`)
        .join(" | ");

      const totalQty = (o.items || []).reduce((acc: number, i: any) => acc + Number(i.quantity || 1), 0);

      return [
        `"${o.orderNumber || o.id}"`,
        `"${new Date(o.createdAt || Date.now()).toLocaleDateString("id-ID")}"`,
        `"${o.customerName || "-"}"`,
        `"${o.customerPhone || "-"}"`,
        `"${itemsStr.replace(/"/g, '""')}"`,
        totalQty,
        o.subtotal || 0,
        Number(o.promoDiscount || 0) + Number(o.shippingDiscount || 0),
        o.shippingCost || 0,
        o.adminFee || 0,
        o.grandTotal || 0,
        `"${o.paymentMethod || "-"}"`,
        `"${o.courierName || o.courierCode || "-"}"`,
        `"${o.status || "-"}"`,
      ];
    });

    const csvContent = [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `Laporan_Penjualan_TRI_J_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Print Report
  const handlePrint = () => {
    window.print();
  };

  const maxRevenueInChart = Math.max(...stats.chartData.map((c) => c.revenue), 1);

  return (
    <div className="space-y-6 font-sans">
      {/* Top Filter Bar */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-gray-200 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-4">
          <div>
            <h3 className="text-base sm:text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-purple-600" />
              <span>Laporan & Analitik Penjualan TRI J</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Pantau total omzet, pesanan lunas, produk terlaris, dan rincian transaksi secara real-time.
            </p>
          </div>

          {/* Export & Print Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleExportCSV}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
              title="Download File CSV / Excel"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Export Excel (CSV)</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
              title="Cetak Laporan Penjualan"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak / PDF</span>
            </button>
          </div>
        </div>

        {/* Filter Controls Row (3 Columns) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Period Filter */}
          <div>
            <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
              Periode Penjualan:
            </label>
            <select
              value={period}
              onChange={(e: any) => setPeriod(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-purple-600 cursor-pointer"
            >
              <option value="today">Hari Ini</option>
              <option value="7days">7 Hari Terakhir</option>
              <option value="thisMonth">Bulan Ini</option>
              <option value="thisYear">Tahun Ini</option>
              <option value="all">Semua Periode</option>
              <option value="custom">Kustom Rentang Tanggal</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
              Status Pesanan:
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-purple-600 cursor-pointer"
            >
              <option value="PAID_ONLY">✓ Transaksi Lunas / Berhasil</option>
              <option value="ALL">Semua Status (Termasuk Pending & Batal)</option>
              <option value="PENDING">Menunggu Pembayaran (Pending)</option>
              <option value="CANCELLED">Dibatalkan / Kadaluarsa</option>
            </select>
          </div>

          {/* Search Box */}
          <div>
            <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
              Cari Transaksi:
            </label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari No. Order, Nama, Produk..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-purple-600"
              />
            </div>
          </div>
        </div>

        {/* Custom Date Range Picker */}
        {period === "custom" && (
          <div className="flex items-center gap-3 pt-2 flex-wrap border-t border-gray-100">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-600">Dari:</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-purple-600"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-600">Sampai:</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-purple-600"
              />
            </div>
          </div>
        )}
      </div>

      {/* KPI Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Omzet */}
        <div className="bg-gradient-to-br from-purple-600 to-indigo-700 text-white rounded-3xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-purple-200">Total Omzet Penjualan</span>
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <DollarSign className="w-4 h-4 text-amber-300" />
            </div>
          </div>
          <h4 className="text-2xl font-black">{formatIDR(stats.totalRevenue)}</h4>
          <div className="flex items-center gap-1.5 text-[11px] text-purple-200 font-medium">
            <span>Subtotal Produk: {formatIDR(stats.totalSubtotal)}</span>
          </div>
        </div>

        {/* Card 2: Total Pesanan */}
        <div className="bg-white rounded-3xl p-5 border border-gray-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Jumlah Transaksi</span>
            <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <h4 className="text-2xl font-black text-slate-900">{stats.totalOrders} Pesanan</h4>
          <p className="text-[11px] text-slate-400">
            AOV: <strong className="text-slate-700">{formatIDR(stats.averageOrderValue)}</strong>/order
          </p>
        </div>

        {/* Card 3: Total Unit Terjual */}
        <div className="bg-white rounded-3xl p-5 border border-gray-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Produk Terjual</span>
            <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <h4 className="text-2xl font-black text-slate-900">{stats.totalItemsSold} Unit</h4>
          <p className="text-[11px] text-slate-400">Peralatan rumah tangga & perabot</p>
        </div>

        {/* Card 4: Total Ongkir & Diskon */}
        <div className="bg-white rounded-3xl p-5 border border-gray-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Ongkir & Diskon</span>
            <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <h4 className="text-lg font-black text-slate-900">
            {formatIDR(stats.totalShippingCost)}
          </h4>
          <div className="flex items-center justify-between text-[11px] text-slate-500">
            <span>Diskon Voucher:</span>
            <span className="font-bold text-red-500">-{formatIDR(stats.totalPromoDiscount)}</span>
          </div>
        </div>
      </div>

      {/* Middle Section: Sales Trend Timeline & Top Selling Products */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend Penjualan Visual Timeline (2 Cols) */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-gray-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-purple-600" />
              <span>Tren Grafik Omzet Penjualan</span>
            </h4>
            <span className="text-xs text-slate-400 font-medium">
              {stats.chartData.length} Titik Data
            </span>
          </div>

          {stats.chartData.length === 0 ? (
            <div className="py-16 text-center text-xs text-slate-400">
              Belum ada data transaksi pada rentang periode yang dipilih.
            </div>
          ) : (
            <div className="space-y-3 pt-2">
              <div className="flex items-end gap-2 h-44 border-b border-slate-100 pb-2 overflow-x-auto">
                {stats.chartData.map((item, idx) => {
                  const heightPercent = Math.max(8, Math.round((item.revenue / maxRevenueInChart) * 100));
                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 min-w-8 group">
                      <div className="text-[9px] font-bold text-purple-600 opacity-0 group-hover:opacity-100 transition whitespace-nowrap">
                        {formatIDR(item.revenue)}
                      </div>
                      <div
                        style={{ height: `${heightPercent}%` }}
                        className="w-full max-w-7 bg-purple-500 hover:bg-purple-600 rounded-t-lg transition duration-200 relative shadow-2xs cursor-pointer"
                        title={`${item.date}: ${formatIDR(item.revenue)} (${item.count} Pesanan)`}
                      />
                      <span className="text-[9px] text-slate-400 font-semibold truncate w-full text-center">
                        {item.date}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Top 5 Best Selling Products (1 Col) */}
        <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-500" />
              <span>Produk Terlaris</span>
            </h4>
            <span className="text-xs text-slate-400 font-medium">Rangking</span>
          </div>

          {stats.topProducts.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              Belum ada penjualan produk.
            </div>
          ) : (
            <div className="space-y-3">
              {stats.topProducts.map((p, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between gap-3 p-2.5 rounded-2xl hover:bg-slate-50 transition border border-slate-100"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center font-black text-xs shrink-0 ${
                        idx === 0
                          ? "bg-amber-400 text-purple-950 shadow-xs"
                          : idx === 1
                          ? "bg-slate-200 text-slate-800"
                          : idx === 2
                          ? "bg-amber-100 text-amber-800"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {idx + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-800 truncate" title={p.name}>
                        {p.name}
                      </p>
                      <span className="text-[11px] text-purple-600 font-bold">
                        {p.qty} Unit Terjual
                      </span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-extrabold text-slate-900 block">
                      {formatIDR(p.revenue)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Detailed Orders Transactions Table */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-gray-200 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h4 className="font-extrabold text-sm sm:text-base text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-600" />
              <span>Rincian Transaksi Penjualan ({filteredOrders.length})</span>
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Daftar seluruh pesanan yang masuk dalam filter periode laporan.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-sans text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                <th className="p-3.5 pl-6">No. Pesanan & Waktu</th>
                <th className="p-3.5">Pelanggan</th>
                <th className="p-3.5">Item Produk</th>
                <th className="p-3.5 text-right">Subtotal</th>
                <th className="p-3.5 text-right">Ongkir / Disc</th>
                <th className="p-3.5 text-right">Total Bayar</th>
                <th className="p-3.5">Metode Bayar</th>
                <th className="p-3.5 pr-6">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-slate-700">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-slate-400">
                    Tidak ada transaksi penjualan yang cocok dengan filter.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((o) => {
                  const isPaid = [
                    "PAID",
                    "PACKING",
                    "READY_TO_SHIP",
                    "SHIPPED",
                    "COMPLETED",
                  ].includes(String(o.status).toUpperCase());

                  return (
                    <tr key={o.id} className="hover:bg-slate-50/80 transition">
                      <td className="p-3.5 pl-6">
                        <span className="font-mono font-bold text-slate-900 block">
                          {o.orderNumber || `#${o.id}`}
                        </span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          {formatDate(o.createdAt)}
                        </span>
                      </td>

                      <td className="p-3.5">
                        <span className="font-bold text-slate-900 block">
                          {o.customerName || "Pelanggan Noname"}
                        </span>
                        <span className="text-[10px] text-slate-500 block">
                          {o.customerPhone || "-"}
                        </span>
                      </td>

                      <td className="p-3.5 max-w-xs">
                        <div className="space-y-1">
                          {(o.items || []).map((i: any, idx: number) => (
                            <div key={idx} className="text-[11px] truncate flex items-center gap-1">
                              <span className="font-semibold text-slate-800 truncate">
                                {i.variantName || i.product?.name || "Produk TRI J"}
                              </span>
                              <span className="text-purple-600 font-bold shrink-0">
                                ({i.quantity}x)
                              </span>
                            </div>
                          ))}
                        </div>
                      </td>

                      <td className="p-3.5 text-right font-semibold text-slate-800">
                        {formatIDR(o.subtotal || 0)}
                      </td>

                      <td className="p-3.5 text-right space-y-0.5">
                        <span className="block text-[11px] text-slate-600">
                          +{formatIDR(o.shippingCost || 0)}
                        </span>
                        {Number(o.promoDiscount || 0) > 0 && (
                          <span className="block text-[10px] text-red-500 font-bold">
                            -{formatIDR(o.promoDiscount)}
                          </span>
                        )}
                      </td>

                      <td className="p-3.5 text-right font-extrabold text-sm text-purple-700">
                        {formatIDR(o.grandTotal || 0)}
                      </td>

                      <td className="p-3.5">
                        <span className="font-medium text-slate-800 block text-[11px]">
                          {o.paymentMethod || "Midtrans / Transfer"}
                        </span>
                        <span className="text-[10px] text-slate-400 block">
                          {o.courierName || o.courierCode || "Ekspedisi"}
                        </span>
                      </td>

                      <td className="p-3.5 pr-6">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black ${
                            isPaid
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                              : o.status === "PENDING"
                              ? "bg-amber-100 text-amber-800 border border-amber-200"
                              : "bg-red-100 text-red-800 border border-red-200"
                          }`}
                        >
                          {isPaid ? (
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <Clock className="w-3 h-3 text-amber-600" />
                          )}
                          <span>{o.status || "PENDING"}</span>
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
