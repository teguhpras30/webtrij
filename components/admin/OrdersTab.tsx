"use client";

import { useState, useEffect } from "react";
import {
  ShoppingBag,
  RefreshCw,
  Search,
  CheckCircle2,
  Clock,
  Truck,
  User,
  MapPin,
  PackageCheck,
  Printer,
  ExternalLink,
  FileText,
  X,
  Loader2,
} from "lucide-react";
import ShippingLabelModal from "@/components/admin/ShippingLabelModal";

interface OrdersTabProps {
  orders: any[];
  onRefresh: () => void;
  showToast: (msg: string, type?: "success" | "error") => void;
}

export default function OrdersTab({ orders, onRefresh, showToast }: OrdersTabProps) {
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [syncingMidtrans, setSyncingMidtrans] = useState(false);
  const [waybillInputs, setWaybillInputs] = useState<{ [key: string]: string }>({});
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [printModal, setPrintModal] = useState<{ order: any; type: "label" | "invoice" } | null>(null);

  // Inline card tracking expand/collapse state
  const [expandedTracking, setExpandedTracking] = useState<{ [orderId: string]: boolean }>({});
  const [cardTrackingDataMap, setCardTrackingDataMap] = useState<{
    [orderId: string]: { loading: boolean; data?: any; error?: string };
  }>({});

  const handleToggleCardTracking = async (order: any) => {
    const orderId = order.orderNumber || String(order.id);
    const isCurrentlyExpanded = Boolean(expandedTracking[orderId]);

    if (isCurrentlyExpanded) {
      setExpandedTracking((prev) => ({ ...prev, [orderId]: false }));
      return;
    }

    setExpandedTracking((prev) => ({ ...prev, [orderId]: true }));

    if (!cardTrackingDataMap[orderId]?.data) {
      setCardTrackingDataMap((prev) => ({ ...prev, [orderId]: { loading: true } }));
      const waybill = order.waybillNumber || `BITESHIP-${order.orderNumber || order.id}`;
      const courier = order.courierCode || order.courierName || "jne";

      try {
        const res = await fetch(
          `/api/biteship/tracking?waybill=${encodeURIComponent(waybill)}&courier=${encodeURIComponent(courier)}`
        );
        const data = await res.json();
        if (res.ok && data) {
          setCardTrackingDataMap((prev) => ({ ...prev, [orderId]: { loading: false, data } }));
        } else {
          setCardTrackingDataMap((prev) => ({
            ...prev,
            [orderId]: { loading: false, error: data.error || "Gagal memuat status pelacakan" },
          }));
        }
      } catch (err: any) {
        setCardTrackingDataMap((prev) => ({
          ...prev,
          [orderId]: { loading: false, error: err.message || "Gagal memuat status pelacakan" },
        }));
      }
    }
  };

  const [generatingJneAwb, setGeneratingJneAwb] = useState<string | null>(null);

  const handleGenerateJneAwb = async (order: any) => {
    const orderId = order.orderNumber || String(order.id);
    setGeneratingJneAwb(orderId);
    try {
      const res = await fetch("/api/admin/jne/generate-awb", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(`🎉 Resi JNE resmi berhasil dibuat: ${data.cnote}`, "success");
        onRefresh();
      } else {
        showToast(`Gagal generate resi JNE: ${data.error || "Terjadi kesalahan"}`, "error");
      }
    } catch (e: any) {
      showToast(`Error: ${e.message}`, "error");
    } finally {
      setGeneratingJneAwb(null);
    }
  };

  const [requestingBiteshipPickup, setRequestingBiteshipPickup] = useState<string | null>(null);

  const handleRequestBiteshipPickup = async (order: any) => {
    const orderId = order.orderNumber || String(order.id);
    setRequestingBiteshipPickup(orderId);
    try {
      const res = await fetch("/api/admin/biteship/pickup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(`🎉 Request pick-up Biteship berhasil! Resi: ${data.waybill}`, "success");
        onRefresh();
      } else {
        showToast(`Gagal pick-up Biteship: ${data.error || "Terjadi kesalahan"}`, "error");
      }
    } catch (e: any) {
      showToast(`Error: ${e.message}`, "error");
    } finally {
      setRequestingBiteshipPickup(null);
    }
  };

  // Combined list including local storage fallback orders
  const [allCombinedOrders, setAllCombinedOrders] = useState<any[]>(orders);

  useEffect(() => {
    let localOrders: any[] = [];
    try {
      const local = localStorage.getItem("webtrij_user_orders");
      if (local) localOrders = JSON.parse(local);
    } catch (e) {}

    const orderMap = new Map();

    // 1. Database orders take priority
    (orders || []).forEach((o) => {
      if (o && (o.orderNumber || o.id)) {
        orderMap.set(o.orderNumber || String(o.id), o);
      }
    });

    // 2. Localstorage orders for offline/client persistence
    localOrders.forEach((o) => {
      if (o && (o.orderNumber || o.id)) {
        const key = o.orderNumber || String(o.id);
        if (!orderMap.has(key)) {
          orderMap.set(key, o);
        }
      }
    });

    setAllCombinedOrders(Array.from(orderMap.values()));
  }, [orders]);

  const handleSyncMidtrans = async () => {
    try {
      setSyncingMidtrans(true);
      const res = await fetch("/api/admin/check-midtrans-paid");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal mensinkronkan status Midtrans");

      showToast(`🎉 Berhasil sinkronisasi! Ditemukan ${data.totalPaidOrders || 0} pesanan terbayar.`);
      onRefresh();
    } catch (err: any) {
      showToast(`Error Sync: ${err.message}`, "error");
    } finally {
      setSyncingMidtrans(false);
    }
  };

  const handlePrintLabel = (order: any) => {
    const waybill = order.waybillNumber || `BITESHIP-${order.orderNumber || order.id}`;
    const printWindow = window.open("", "_blank", "width=800,height=900");
    if (!printWindow) {
      showToast("Gagal membuka jendela cetak label (Pop-up diblokir browser)", "error");
      return;
    }

    const itemsHtml = (order.items || [])
      .map(
        (i: any) =>
          `<li style="margin-bottom: 4px;"><strong>${i.product?.name || "Everhome Perabot TRI J"}</strong> (${i.quantity || 1}x)</li>`
      )
      .join("");

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Cetak Resi ${order.orderNumber || order.id} - TRI J</title>
          <style>
            @media print {
              @page { size: A6 portrait; margin: 0; }
              body { margin: 10px; }
              .no-print { display: none !important; }
            }
            body { font-family: Arial, sans-serif; font-size: 12px; color: #111; margin: 20px; padding: 0; }
            .label-box { border: 2px solid #000; padding: 15px; max-width: 450px; margin: 0 auto; border-radius: 8px; background: #fff; }
            .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 8px; margin-bottom: 10px; }
            .header h2 { margin: 0; font-size: 18px; color: #EE4D2D; text-transform: uppercase; letter-spacing: 1px; }
            .header p { margin: 2px 0 0 0; font-size: 10px; color: #555; }
            .barcode-box { text-align: center; background: #f4f4f4; border: 1px dashed #000; padding: 10px; margin: 10px 0; border-radius: 4px; }
            .barcode-text { font-family: monospace; font-size: 20px; font-weight: bold; letter-spacing: 3px; color: #000; }
            .grid { display: flex; gap: 15px; border-bottom: 1px solid #ddd; padding-bottom: 10px; margin-bottom: 10px; }
            .col { flex: 1; }
            .col-title { font-weight: bold; font-size: 10px; text-transform: uppercase; color: #555; margin-bottom: 4px; }
            .items-box { background: #fafafa; border: 1px solid #eee; padding: 8px; border-radius: 4px; }
            .footer { margin-top: 15px; text-align: center; font-size: 10px; color: #777; border-top: 1px solid #eee; pt: 8px; }
            .btn-print { background: #EE4D2D; color: #fff; border: none; padding: 10px 20px; font-size: 14px; font-weight: bold; border-radius: 6px; cursor: pointer; margin-bottom: 15px; }
          </style>
        </head>
        <body>
          <div class="no-print" style="text-align: center;">
            <button class="btn-print" onclick="window.print()">🖨️ Cetak Label Resi Ini (Print Thermal A6 / A4)</button>
          </div>
          <div class="label-box">
            <div class="header">
              <h2>TOKO PERABOT TRI J</h2>
              <p>Peralatan Rumah Tangga & Perabot Plastik Tangan Pertama</p>
            </div>
            
            <div class="barcode-box">
              <div style="font-size: 10px; color: #666; font-weight: bold; text-transform: uppercase;">NOMOR RESI EXPEDISI (BITESHIP)</div>
              <div class="barcode-text">${waybill}</div>
              <div style="font-size: 11px; margin-top: 4px; color: #333;">NO PESANAN: <strong>${order.orderNumber || order.id}</strong></div>
            </div>

            <div class="grid">
              <div class="col">
                <div class="col-title">📍 PENERIMA:</div>
                <strong style="font-size: 13px;">${order.customerName || "Teguh Pras"}</strong><br/>
                HP: ${order.customerPhone || "08961656039"}<br/>
                <span style="font-size: 11px; display: inline-block; margin-top: 4px;">${order.shippingAddress || "Wisma tengger 17 No 21, Kandangan, Benowo, Surabaya"}</span>
              </div>
              <div class="col">
                <div class="col-title">🏬 PENGIRIM:</div>
                <strong style="font-size: 12px;">Toko Perabot TRI J</strong><br/>
                HP: 08123456789<br/>
                <span style="font-size: 11px; display: inline-block; margin-top: 4px;">Cikarang Pusat, Kab. Bekasi</span>
              </div>
            </div>

            <div class="grid">
              <div class="col">
                <div class="col-title">🚚 KURIR & LAYANAN:</div>
                <strong style="font-size: 12px; color: #6b21a8;">${order.courierName || "Biteship Express (JNE REG)"}</strong>
              </div>
              <div class="col">
                <div class="col-title">💰 STATUS PEMBAYARAN:</div>
                <strong style="font-size: 12px; color: #15803d;">NONTUNAI (LUNAS)</strong>
              </div>
            </div>

            <div class="items-box">
              <div class="col-title">📦 DAFTAR BARANG DIPESAN:</div>
              <ul style="margin: 0; padding-left: 15px; font-size: 11px; color: #222;">
                ${itemsHtml || "<li>Produk Perabot TRI J (1x)</li>"}
              </ul>
            </div>

            <div class="footer">
              Terima Kasih Telah Berbelanja di Toko Perabot TRI J | Official Store Cikarang
            </div>
          </div>
          <script>
            setTimeout(() => { window.print(); }, 400);
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleUpdateStatus = async (order: any, newStatus: string, waybillNumber?: string) => {
    const orderIdentifier = order.orderNumber || String(order.id || "sample-ord-1");
    const autoWaybill =
      newStatus === "SHIPPED"
        ? waybillNumber && waybillNumber.trim() !== ""
          ? waybillNumber.trim()
          : order.waybillNumber || `BITESHIP-${Math.floor(100000 + Math.random() * 900000)}`
        : waybillNumber || order.waybillNumber;

    try {
      setUpdatingOrderId(orderIdentifier);
      const res = await fetch("/api/admin/orders", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: orderIdentifier,
          status: newStatus,
          waybillNumber: autoWaybill,
          customerName: order.customerName || "Pelanggan TRI J",
          customerPhone: order.customerPhone || "",
          customerEmail: order.customerEmail || undefined,
          shippingAddress: order.shippingAddress || "Surabaya, Jawa Timur",
          courierCode: order.courierCode || "jne",
          courierService: order.courierService || "reg",
          items: order.items || [],
          grandTotal: order.grandTotal || 0,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gagal memperbarui pesanan");
      }

      // Sync LocalStorage for client-side persistence
      try {
        const local = localStorage.getItem("webtrij_user_orders");
        if (local) {
          const list = JSON.parse(local);
          const updated = list.map((o: any) => {
            if (o.orderNumber === orderIdentifier || String(o.id) === orderIdentifier) {
              return {
                ...o,
                status: newStatus,
                waybillNumber: autoWaybill || o.waybillNumber || "BITESHIP-9988",
              };
            }
            return o;
          });
          localStorage.setItem("webtrij_user_orders", JSON.stringify(updated));
        }
      } catch (e) {
        console.warn("Failed to sync localstorage order update");
      }

      // Also update component state directly for instant feedback
      setAllCombinedOrders((prev) =>
        prev.map((o) => {
          if (o.orderNumber === orderIdentifier || String(o.id) === orderIdentifier) {
            return {
              ...o,
              status: newStatus,
              waybillNumber: autoWaybill || o.waybillNumber || "BITESHIP-9988",
            };
          }
          return o;
        })
      );

      showToast(
        `Status pesanan ${orderIdentifier} berhasil diperbarui ke '${newStatus}'${
          autoWaybill ? ` (Resi: ${autoWaybill})` : ""
        }!`
      );
      onRefresh();
    } catch (err: any) {
      showToast(`Gagal update pesanan: ${err.message}`, "error");
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const formatIDR = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const isPaidStatus = (status: string) => {
    const s = (status || "").toUpperCase();
    return (
      s === "PAID" ||
      s === "PACKING" ||
      s === "PROCESSING" ||
      s === "SETTLEMENT" ||
      s === "SUCCESS" ||
      s === "CAPTURE" ||
      s === "DIKEMAS"
    );
  };

  const isReadyStatus = (status: string) => {
    const s = (status || "").toUpperCase();
    return (
      s === "READY_TO_SHIP" ||
      s === "WAITING_PICKUP" ||
      s === "ALLOCATED" ||
      s === "PICKING_UP" ||
      s === "SIAP_KIRIM"
    );
  };

  const isShippedStatus = (status: string) => {
    const s = (status || "").toUpperCase();
    return (
      s === "SHIPPED" ||
      s === "IN_TRANSIT" ||
      s === "IN-TRANSIT" ||
      s === "PICKED_UP" ||
      s === "DROPPING_OFF" ||
      s === "ON_DELIVERY" ||
      s === "OUT_FOR_DELIVERY" ||
      s === "DIKIRIM"
    );
  };

  const isCompletedStatus = (status: string) => {
    const s = (status || "").toUpperCase();
    return (
      s === "COMPLETED" ||
      s === "DELIVERED" ||
      s === "FINISHED" ||
      s === "SELESAI" ||
      s === "SUCCESS_DELIVERED"
    );
  };

  const isPendingStatus = (status: string) => {
    const s = (status || "").toUpperCase();
    return s === "PENDING";
  };

  const filteredOrders = allCombinedOrders.filter((o) => {
    const statusUpper = (o.status || "").toUpperCase();

    const matchesFilter =
      filterStatus === "ALL"
        ? true
        : filterStatus === "PAID"
        ? isPaidStatus(statusUpper)
        : filterStatus === "READY_TO_SHIP"
        ? isReadyStatus(statusUpper)
        : filterStatus === "SHIPPED"
        ? isShippedStatus(statusUpper)
        : filterStatus === "COMPLETED"
        ? isCompletedStatus(statusUpper)
        : filterStatus === "PENDING"
        ? isPendingStatus(statusUpper)
        : statusUpper === filterStatus;

    const matchesSearch =
      !searchQuery ||
      o.orderNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customerEmail?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6 font-sans">
      {/* Header & Filter Controls Bar */}
      <div className="bg-white border border-gray-200 rounded-3xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-red-50 text-red-600 border border-red-100 flex items-center justify-center font-bold">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-gray-900">
              Monitoring Pesanan Masuk ({allCombinedOrders.length})
            </h3>
            <p className="text-xs text-gray-500">
              Ganti status pesanan real-time: Dikemas ➔ Siap Kirim ➔ Dikirim ➔ Selesai
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            type="button"
            onClick={handleSyncMidtrans}
            disabled={syncingMidtrans}
            className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs rounded-xl shadow-xs flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${syncingMidtrans ? "animate-spin" : ""}`} />
            <span>{syncingMidtrans ? "Sinkronisasi..." : "Cek Live Status Midtrans"}</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0 text-xs">
          {[
            { id: "ALL", label: "Semua Pesanan", count: allCombinedOrders.length },
            {
              id: "PAID",
              label: "1. Dikemas",
              count: allCombinedOrders.filter((o) => isPaidStatus(o.status)).length,
            },
            {
              id: "READY_TO_SHIP",
              label: "2. Siap Kirim",
              count: allCombinedOrders.filter((o) => isReadyStatus(o.status)).length,
            },
            {
              id: "SHIPPED",
              label: "3. Dikirim",
              count: allCombinedOrders.filter((o) => isShippedStatus(o.status)).length,
            },
            {
              id: "COMPLETED",
              label: "4. Selesai",
              count: allCombinedOrders.filter((o) => isCompletedStatus(o.status)).length,
            },
            {
              id: "PENDING",
              label: "Belum Bayar",
              count: allCombinedOrders.filter((o) => isPendingStatus(o.status)).length,
            },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id)}
              className={`px-3.5 py-2 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                filterStatus === tab.id
                  ? "bg-red-600 text-white shadow-xs"
                  : "bg-white border border-gray-200 text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              <span>{tab.label}</span>
              <span className="px-1.5 py-0.2 bg-gray-100 text-gray-700 text-[10px] rounded-md font-mono">
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Cari order # / nama..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-red-500 placeholder-gray-400 font-medium"
          />
        </div>
      </div>

      {/* Orders List Cards */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-3xl p-12 text-center text-gray-500 text-xs font-medium space-y-2 shadow-xs">
          <ShoppingBag className="w-8 h-8 text-gray-400 mx-auto" />
          <p>Belum ada transaksi pesanan yang sesuai dengan filter ini.</p>
        </div>
      ) : (
        <div className="space-y-4 text-xs">
          {filteredOrders.map((order, index) => {
            const orderIdentifier = order.orderNumber || String(order.id || `order-${index}`);
            const statusUpper = (order.status || "PENDING").toUpperCase();
            const isPending = isPendingStatus(statusUpper);
            const isPaid = isPaidStatus(statusUpper);
            const isReadyToShip = isReadyStatus(statusUpper);
            const isShipped = isShippedStatus(statusUpper);
            const isCompleted = isCompletedStatus(statusUpper);
            const isJneOrder =
              (order.courierName || "").toLowerCase().includes("official") ||
              (order.courierName || "").toLowerCase().includes("jne") ||
              (order.courierCode || "").toLowerCase().includes("jne");

            return (
              <div
                key={orderIdentifier}
                className={`bg-white border rounded-3xl p-6 shadow-xs space-y-4 transition-all ${
                  isPaid
                    ? "border-blue-200 bg-blue-50/10"
                    : isReadyToShip
                    ? "border-amber-300 bg-amber-50/30 ring-1 ring-amber-200"
                    : isPending
                    ? "border-gray-200 bg-gray-50/30"
                    : isShipped
                    ? "border-purple-200 bg-purple-50/10"
                    : "border-emerald-200 bg-emerald-50/10"
                }`}
              >
                {/* Header Card: Order ID, Status Dropdown Selector */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-100 pb-3 gap-3">
                  <div className="flex items-center gap-3">
                    <span className="font-extrabold text-sm text-gray-900 font-mono">{orderIdentifier}</span>
                    <span className="text-[11px] text-gray-500">
                      {new Date(order.createdAt || Date.now()).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {isPaid && (
                      <span className="px-3 py-1 bg-blue-50 text-blue-700 font-extrabold rounded-full border border-blue-200 flex items-center gap-1.5 text-[11px]">
                        <PackageCheck className="w-3.5 h-3.5 text-blue-600" />
                        <span>1. Sedang Dikemas</span>
                      </span>
                    )}
                    {isReadyToShip && (
                      <span className="px-3 py-1 bg-amber-50 text-amber-800 font-extrabold rounded-full border border-amber-200 flex items-center gap-1.5 text-[11px]">
                        <Clock className="w-3.5 h-3.5 text-amber-600" />
                        <span>2. Siap Kirim</span>
                      </span>
                    )}
                    {isShipped && (
                      <span className="px-3 py-1 bg-purple-50 text-purple-700 font-extrabold rounded-full border border-purple-200 flex items-center gap-1.5 text-[11px]">
                        <Truck className="w-3.5 h-3.5 text-purple-600" />
                        <span>3. Dikirim ({order.courierName || (isJneOrder ? "JNE Express" : "Biteship")})</span>
                      </span>
                    )}
                    {isCompleted && (
                      <span className="px-3 py-1 bg-emerald-50 text-emerald-700 font-extrabold rounded-full border border-emerald-200 flex items-center gap-1.5 text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>4. Selesai</span>
                      </span>
                    )}
                    {isPending && (
                      <span className="px-3 py-1 bg-gray-100 text-gray-700 font-extrabold rounded-full border border-gray-200 flex items-center gap-1.5 text-[11px]">
                        <Clock className="w-3.5 h-3.5 text-gray-500" />
                        <span>Belum Bayar</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Banner Identifikasi Jalur Ekspedisi (Mencegah Salah Pilih Jemput JNE vs Biteship) */}
                <div
                  className={`flex flex-col sm:flex-row sm:items-center justify-between px-4 py-2.5 rounded-2xl border text-xs font-bold gap-2 ${
                    isJneOrder
                      ? "bg-red-50/90 border-red-200 text-red-900"
                      : "bg-indigo-50/90 border-indigo-200 text-indigo-900"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Truck className={`w-4 h-4 shrink-0 ${isJneOrder ? "text-red-600" : "text-indigo-600"}`} />
                    <span>
                      Jalur Ekspedisi Terpilih:{" "}
                      <span className={`px-2 py-0.5 rounded-md text-white font-extrabold text-[11px] ${
                        isJneOrder ? "bg-red-600" : "bg-indigo-600"
                      }`}>
                        {isJneOrder ? "JNE EXPRESS RESMI DIRECT (AKUN ORCHID)" : "BITESHIP AGGREGATOR LOGISTICS"}
                      </span>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-gray-700 bg-white px-2.5 py-1 rounded-lg border border-gray-200 shadow-2xs">
                      Layanan: <strong className={isJneOrder ? "text-red-700" : "text-indigo-700"}>{order.courierService || order.courierName || (isJneOrder ? "JNE REG" : "Reguler")}</strong>
                    </span>
                  </div>
                </div>

                {/* Customer Details Box */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  <div className="space-y-1">
                    <div className="font-bold text-gray-900 flex items-center gap-1.5 text-xs">
                      <User className="w-3.5 h-3.5 text-red-600" />
                      <span>{order.customerName || "Pelanggan TRI J"}</span>
                    </div>
                    <div className="text-[11px] text-gray-600">
                      Email: <span className="text-gray-900 font-medium">{order.customerEmail || "-"}</span> | HP:{" "}
                      <span className="text-gray-900 font-medium">{order.customerPhone || "-"}</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="font-bold text-gray-900 flex items-center gap-1.5 text-xs">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Alamat Pengiriman:</span>
                    </div>
                    <p className="text-[11px] text-gray-700 leading-relaxed truncate">
                      {order.shippingAddress || "Cikarang Pusat, Kab. Bekasi"}
                    </p>
                  </div>
                </div>

                {/* Purchased Items List */}
                <div className="space-y-2">
                  <div className="font-extrabold text-gray-800 text-xs">Produk Dipesan:</div>
                  <div className="divide-y divide-gray-100 border border-gray-200 rounded-2xl overflow-hidden bg-white">
                    {order.items && order.items.length > 0 ? (
                      order.items.map((item: any, idx: number) => (
                        <div key={idx} className="p-3 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            {item.product?.thumbnail ? (
                              <img
                                src={item.product.thumbnail}
                                alt={item.product.name}
                                className="w-10 h-10 object-cover rounded-xl border border-gray-200 shrink-0 bg-gray-50"
                              />
                            ) : (
                              <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-gray-500 font-bold shrink-0 border border-gray-200">
                                TJ
                              </div>
                            )}
                            <div className="min-w-0">
                              <h4 className="font-bold text-gray-900 truncate">{item.product?.name || item.variantName || "Produk TRI J"}</h4>
                              {item.variantName && item.product?.name && (
                                <div className="text-[10px] font-bold text-purple-700">
                                  Varian: {item.variantName}
                                </div>
                              )}
                              <span className="text-[10px] text-gray-500">
                                {item.quantity}x @ {formatIDR(item.unitPrice || item.totalPrice || 0)}
                              </span>
                            </div>
                          </div>

                          <div className="font-extrabold text-gray-900 shrink-0">
                            {formatIDR((item.unitPrice || item.totalPrice || 0) * (item.quantity || 1))}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-3 text-gray-500 text-xs">Detail produk tersimpan di invoice order.</div>
                    )}
                  </div>
                </div>

                {/* Footer Actions & Quick Action Buttons */}
                <div className="flex flex-col md:flex-row md:items-center justify-between pt-3 border-t border-gray-100 gap-4">
                  <div>
                    <span className="text-gray-500">Total Pembayaran: </span>
                    <span className="text-base font-extrabold text-emerald-600">{formatIDR(order.grandTotal || 0)}</span>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Tombol Set Siap Kirim: HANYA tampil pada status 1. Dikemas */}
                    {isPaid && (
                      <button
                        type="button"
                        disabled={updatingOrderId === orderIdentifier}
                        onClick={() => handleUpdateStatus(order, "READY_TO_SHIP")}
                        className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
                        title="Ubah Status ke 'Siap Kirim'"
                      >
                        <Clock className="w-3.5 h-3.5" />
                        <span>📦 Set Siap Kirim</span>
                      </button>
                    )}

                    {/* KHUSUS JNE DIRECT: Tombol Request Jemput & Buat Resi Resmi JNE */}
                    {isJneOrder && !isShipped && !isCompleted && (
                      <button
                        type="button"
                        disabled={generatingJneAwb === orderIdentifier}
                        onClick={() => handleGenerateJneAwb(order)}
                        className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
                        title="Request Pick-up & Resi Resmi Langsung ke Server JNE Express"
                      >
                        {generatingJneAwb === orderIdentifier ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Truck className="w-3.5 h-3.5" />
                        )}
                        <span>⚡ Request Jemput JNE (Akun ORCHID)</span>
                      </button>
                    )}

                    {/* KHUSUS BITESHIP: Tombol Request Jemput Kurir Biteship (SiCepat, J&T, dll) */}
                    {!isJneOrder && !isShipped && !isCompleted && (
                      <button
                        type="button"
                        disabled={requestingBiteshipPickup === orderIdentifier}
                        onClick={() => handleRequestBiteshipPickup(order)}
                        className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
                        title="Request Pick-up Armada Kurir via Biteship Aggregator"
                      >
                        {requestingBiteshipPickup === orderIdentifier ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Truck className="w-3.5 h-3.5" />
                        )}
                        <span>📦 Request Jemput Biteship</span>
                      </button>
                    )}

                    {/* Input Resi & Set to SHIPPED (Dikirim) - HANYA tampil jika BELUM dikirim/selesai */}
                    {!isShipped && !isCompleted && (
                      <div className="flex items-center gap-1.5">
                        <input
                          type="text"
                          placeholder="No Resi Ekspedisi..."
                          value={
                            waybillInputs[orderIdentifier] !== undefined
                              ? waybillInputs[orderIdentifier]
                              : order.waybillNumber || ""
                          }
                          onChange={(e) => setWaybillInputs({ ...waybillInputs, [orderIdentifier]: e.target.value })}
                          className="px-3 py-1.5 bg-white border border-gray-300 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-red-500 w-36 placeholder-gray-400 font-mono font-bold"
                        />
                        <button
                          type="button"
                          disabled={updatingOrderId === orderIdentifier}
                          onClick={() =>
                            handleUpdateStatus(
                              order,
                              "SHIPPED",
                              waybillInputs[orderIdentifier] || order.waybillNumber
                            )
                          }
                          className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
                        >
                          <Truck className="w-3.5 h-3.5" />
                          <span>Kirim</span>
                        </button>
                      </div>
                    )}

                    {/* Jika SUDAH Dikirim: Tampilkan info No Resi yang tersimpan */}
                    {isShipped && (
                      <div className="px-3 py-1.5 bg-purple-50 text-purple-700 font-mono font-extrabold rounded-xl border border-purple-200 flex items-center gap-1.5 text-xs shadow-xs">
                        <Truck className="w-3.5 h-3.5 text-purple-600" />
                        <span>No Resi: {order.waybillNumber || "BITESHIP-9988"}</span>
                      </div>
                    )}

                    {/* Tombol Lacak Lokasi Paket Real-Time Biteship (Inline Card Toggle) */}
                    <button
                      type="button"
                      onClick={() => handleToggleCardTracking(order)}
                      className={`px-3 py-1.5 font-extrabold text-xs rounded-xl border shadow-xs flex items-center gap-1.5 transition cursor-pointer ${
                        expandedTracking[orderIdentifier]
                          ? "bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-300"
                          : "bg-blue-50 hover:bg-blue-100 text-blue-800 border-blue-200"
                      }`}
                      title="Tampilkan / Sembunyikan Pelacakan Lokasi Paket Real-Time"
                    >
                      <Search className="w-3.5 h-3.5 text-blue-600" />
                      <span>
                        {expandedTracking[orderIdentifier]
                          ? "▲ Sembunyikan Pelacakan"
                          : "🔍 Lacak Lokasi Paket"}
                      </span>
                    </button>

                    {/* Tombol Cetak Resi Gudang (Shipping Label) */}
                    <button
                      type="button"
                      onClick={() => setPrintModal({ order, type: "label" })}
                      className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-800 font-extrabold text-xs rounded-xl border border-purple-200 shadow-xs flex items-center gap-1.5 transition cursor-pointer"
                      title="Cetak Label Pengiriman (Shipping Label Gudang)"
                    >
                      <Printer className="w-3.5 h-3.5 text-purple-600" />
                      <span>🖨️ Cetak Resi Gudang</span>
                    </button>

                    {/* Tombol Cetak Invoice PDF */}
                    <button
                      type="button"
                      onClick={() => setPrintModal({ order, type: "invoice" })}
                      className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-extrabold text-xs rounded-xl border border-gray-200 shadow-xs flex items-center gap-1.5 transition cursor-pointer"
                      title="Cetak Faktur Invoice Pembelian PDF"
                    >
                      <FileText className="w-3.5 h-3.5 text-blue-600" />
                      <span>📄 Invoice PDF</span>
                    </button>
                  </div>
                </div>

                {/* INLINE EXPANDABLE TRACKING BOX LANGSUNG PADA CARD */}
                {expandedTracking[orderIdentifier] && (
                  <div className="mt-4 p-4 bg-slate-50 rounded-2xl border border-blue-200 space-y-3 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between border-b border-gray-200 pb-2.5">
                      <div className="flex items-center gap-2">
                        <Truck className="w-4 h-4 text-blue-600" />
                        <span className="text-xs font-extrabold text-gray-900">
                          Pelacakan Live Status Paket #{orderIdentifier}
                        </span>
                      </div>
                      <span className="text-[11px] font-mono font-bold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-lg border border-purple-200">
                        Resi: {order.waybillNumber || `BITESHIP-${orderIdentifier}`}
                      </span>
                    </div>

                    {cardTrackingDataMap[orderIdentifier]?.loading ? (
                      <div className="py-6 text-center space-y-2">
                        <Loader2 className="w-6 h-6 text-blue-600 animate-spin mx-auto" />
                        <p className="text-[11px] font-bold text-gray-600">Menghubungkan ke API Biteship Tracking...</p>
                      </div>
                    ) : cardTrackingDataMap[orderIdentifier]?.error ? (
                      <div className="p-3 bg-red-50 text-red-700 rounded-xl border border-red-200 text-xs font-bold text-center">
                        ⚠️ {cardTrackingDataMap[orderIdentifier]?.error}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-gray-200 text-xs">
                          <span className="font-bold text-gray-700">Status Terbaru:</span>
                          <span className="px-3 py-1 bg-blue-600 text-white font-extrabold rounded-lg uppercase text-[10px] shadow-2xs">
                            {cardTrackingDataMap[orderIdentifier]?.data?.status || "IN TRANSIT"}
                          </span>
                        </div>

                        <div className="space-y-2">
                          <span className="text-[11px] font-extrabold text-gray-800 uppercase tracking-wider block">
                            Riwayat Perjalanan (Timeline):
                          </span>
                          <div className="space-y-0 relative border-l-2 border-blue-300 ml-2.5 pl-4 py-1">
                            {cardTrackingDataMap[orderIdentifier]?.data?.history &&
                            cardTrackingDataMap[orderIdentifier].data.history.length > 0 ? (
                              cardTrackingDataMap[orderIdentifier].data.history.map((h: any, idx: number) => (
                                <div key={idx} className="relative mb-4 last:mb-0">
                                  <div
                                    className={`absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full border ${
                                      idx === 0
                                        ? "border-blue-600 bg-blue-600 ring-2 ring-blue-100"
                                        : "border-gray-400 bg-white"
                                    }`}
                                  />
                                  <div className="space-y-0.5">
                                    <div className="text-[10px] font-bold text-gray-500">
                                      {new Date(h.updatedAt || Date.now()).toLocaleString("id-ID", {
                                        day: "numeric",
                                        month: "short",
                                        year: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })}
                                    </div>
                                    <p className="text-[11px] font-semibold text-gray-800 bg-white p-2 rounded-xl border border-gray-200 shadow-2xs">
                                      {h.note}
                                    </p>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <p className="text-xs text-gray-500">Belum ada riwayat pelacakan.</p>
                            )}
                          </div>
                        </div>

                        {cardTrackingDataMap[orderIdentifier]?.data?.link && (
                          <div className="pt-1 text-right">
                            <a
                              href={cardTrackingDataMap[orderIdentifier].data.link}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:underline"
                            >
                              <span>Buka Link Resmi Biteship</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Shipping Label & Invoice Modal */}
      {printModal && (
        <ShippingLabelModal
          order={printModal.order}
          type={printModal.type}
          onClose={() => setPrintModal(null)}
        />
      )}
    </div>
  );
}
