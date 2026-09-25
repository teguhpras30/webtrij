"use client";

import { useRef } from "react";
import { X, Printer, Package, MapPin, Phone, User, FileText, CheckCircle2, Download } from "lucide-react";

interface ShippingLabelModalProps {
  order: any;
  type: "label" | "invoice";
  onClose: () => void;
}

function BarcodeSVG({ value }: { value: string }) {
  const str = String(value || "ORD-TJ-000000").toUpperCase();
  const bars: { width: number; isBar: boolean }[] = [];

  bars.push(
    { width: 2, isBar: true },
    { width: 1, isBar: false },
    { width: 1, isBar: true },
    { width: 4, isBar: false },
    { width: 1, isBar: true },
    { width: 2, isBar: false }
  );

  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i);
    bars.push({ width: (code % 3) + 1, isBar: true });
    bars.push({ width: ((code * 3) % 3) + 1, isBar: false });
    bars.push({ width: ((code * 7) % 4) + 1, isBar: true });
    bars.push({ width: ((code * 11) % 3) + 1, isBar: false });
  }

  bars.push(
    { width: 2, isBar: true },
    { width: 3, isBar: false },
    { width: 3, isBar: true },
    { width: 1, isBar: false },
    { width: 1, isBar: true },
    { width: 2, isBar: true }
  );

  const totalWidth = bars.reduce((sum, b) => sum + b.width, 0);
  let currentX = 0;
  const rects: React.ReactNode[] = [];

  bars.forEach((b, idx) => {
    if (b.isBar) {
      rects.push(
        <rect key={idx} x={currentX} y={0} width={b.width} height={48} fill="black" />
      );
    }
    currentX += b.width;
  });

  return (
    <div className="flex flex-col items-center justify-center my-1.5 w-full">
      <svg
        viewBox={`0 0 ${totalWidth} 48`}
        className="w-full max-w-[360px] h-12"
        preserveAspectRatio="none"
      >
        {rects}
      </svg>
    </div>
  );
}

export default function ShippingLabelModal({ order, type, onClose }: ShippingLabelModalProps) {
  const printRef = useRef<HTMLDivElement>(null);

  const formatIDR = (val: number) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(val || 0);
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "-";
    try {
      return new Date(dateStr).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  const handlePrint = () => {
    const content = printRef.current;
    if (!content) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Pop-up diblokir oleh browser. Harap izinkan pop-up untuk mencetak label.");
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${type === "label" ? "Label_Pengiriman" : "Invoice"}_${order.orderNumber || order.id}</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            @page { size: auto; margin: 10mm; }
            body { font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
          </style>
        </head>
        <body class="bg-white p-4 text-black">
          ${content.innerHTML}
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleDownload = () => {
    const content = printRef.current;
    if (!content) return;

    const htmlString = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>${type === "label" ? "Label_Pengiriman" : "Invoice"}_${order.orderNumber || order.id}</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            @page { size: auto; margin: 10mm; }
            body { font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #fff; padding: 20px; }
          </style>
        </head>
        <body class="bg-white p-4 text-black">
          <div style="max-width: 650px; margin: 0 auto;">
            ${content.innerHTML}
          </div>
        </body>
      </html>
    `;

    const blob = new Blob([htmlString], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${type === "label" ? "Label_Pengiriman" : "Invoice"}_${order.orderNumber || order.id}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-gray-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto font-sans">
      <div className="bg-white border border-gray-200 rounded-3xl w-full max-w-2xl p-6 relative shadow-2xl space-y-5 my-auto">
        {/* Header Action Bar */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600">
              {type === "label" ? <Package className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-sm">
                {type === "label" ? "Label Pengiriman Gudang (Shipping Label)" : "Faktur Pembelian (Official Invoice)"}
              </h3>
              <p className="text-xs text-gray-500 font-mono">
                No. Pesanan: {order.orderNumber || order.id}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md transition cursor-pointer"
              title="Cetak via Printer atau Simpan PDF"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak / PDF</span>
            </button>
            <button
              onClick={handleDownload}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md transition cursor-pointer"
              title="Download File Resi"
            >
              <Download className="w-4 h-4" />
              <span>Download File</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-700 rounded-xl hover:bg-gray-100 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Area Content */}
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-2xl max-h-[70vh] overflow-y-auto">
          <div ref={printRef} className="bg-white p-6 border-2 border-dashed border-gray-300 rounded-2xl space-y-6 text-black">
            {type === "label" ? (
              /* --- E-COMMERCE SHIPPING LABEL LAYOUT --- */
              <div className="space-y-4 font-sans text-xs">
                {/* Top Shipping Bar */}
                <div className="flex items-center justify-between border-b-2 border-black pb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-black tracking-wider text-black">TRI J</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-black text-white rounded">GUDANG OFFICIAL</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-black uppercase text-purple-700">
                      {order.courierName || "BITESHIP EXPRESS"}
                    </div>
                    <div className="text-[11px] font-mono font-bold">
                      RESI: {order.waybillNumber || `BITESHIP-${order.orderNumber || order.id}`}
                    </div>
                  </div>
                </div>

                {/* Official Vector Barcode Graphic */}
                <div className="bg-slate-50 p-2.5 text-center border border-gray-300 rounded-xl space-y-1">
                  <BarcodeSVG value={String(order.orderNumber || order.id)} />
                  <div className="text-[11px] font-mono font-black text-black tracking-widest">
                    {order.orderNumber || order.id}
                  </div>
                </div>

                {/* Sender & Recipient Box */}
                <div className="grid grid-cols-2 gap-4 border-2 border-black p-3 rounded-xl bg-gray-50">
                  <div className="space-y-1 pr-2 border-r border-gray-300">
                    <span className="text-[10px] font-black uppercase text-gray-500 block">PENGIRIM (SENDER):</span>
                    <div className="font-extrabold text-black text-xs">TRI J Official Store</div>
                    <div className="text-[11px] font-medium text-gray-700">WA: 0896-1656-039</div>
                    <div className="text-[10px] text-gray-600">Cikarang Pusat, Kab. Bekasi, Jawa Barat</div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase text-gray-500 block">PENERIMA (RECIPIENT):</span>
                    <div className="font-extrabold text-black text-xs">{order.customerName || "Pelanggan TRI J"}</div>
                    <div className="text-[11px] font-medium text-gray-700">WA/HP: {order.customerPhone || "-"}</div>
                    <div className="text-[11px] text-black font-semibold leading-snug">
                      {order.shippingAddress || "Alamat belum disetting"}
                    </div>
                  </div>
                </div>

                {/* Order Items Summary */}
                <div className="space-y-2 pt-2">
                  <div className="font-black text-xs border-b border-black pb-1 uppercase">
                    Daftar Isi Paket ({order.items?.length || 0} Barang):
                  </div>
                  <div className="divide-y divide-gray-200">
                    {order.items && order.items.length > 0 ? (
                      order.items.map((item: any, idx: number) => (
                        <div key={idx} className="py-1.5 flex items-center justify-between text-[11px]">
                          <span className="font-bold text-black">{idx + 1}. {item.product?.name || "Produk TRI J"}</span>
                          <span className="font-black px-2 py-0.5 bg-gray-100 rounded border border-gray-300">
                            {item.quantity || 1} Pcs
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="py-1 text-gray-500 text-[11px]">Item produk tersimpan di invoice sistem.</div>
                    )}
                  </div>
                </div>

                {/* Footer Note */}
                <div className="pt-3 border-t border-dashed border-gray-400 text-[10px] text-gray-500 text-center font-medium">
                  Harap periksa kelengkapan isi paket saat diterima dari kurir. Terima kasih telah berbelanja di TRI J!
                </div>
              </div>
            ) : (
              /* --- OFFICIAL INVOICE PDF LAYOUT --- */
              <div className="space-y-5 font-sans text-xs">
                <div className="flex items-center justify-between border-b-2 border-black pb-4">
                  <div>
                    <h2 className="text-xl font-black text-extrabold">INVOICE PEMBELIAN</h2>
                    <p className="text-xs text-gray-500 font-mono">No: {order.orderNumber || order.id}</p>
                    <p className="text-[10px] text-gray-400">Tanggal: {formatDate(order.createdAt)}</p>
                  </div>
                  <div className="text-right flex flex-col items-end">
                    <img src="/logotrij.png" alt="TRI J Logo" className="h-8 w-auto mb-1 object-contain" />
                    <span className="px-2 py-1 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full border border-emerald-300 uppercase">
                      LUNAS / COMPLETED
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-gray-500 font-bold block mb-1">Ditagihkan Kepada:</span>
                    <div className="font-extrabold text-black">{order.customerName || "Pelanggan TRI J"}</div>
                    <div className="text-gray-600">{order.customerEmail}</div>
                    <div className="text-gray-600">{order.customerPhone}</div>
                  </div>
                  <div>
                    <span className="text-gray-500 font-bold block mb-1">Alamat Pengiriman:</span>
                    <div className="text-gray-800 font-medium leading-snug">{order.shippingAddress}</div>
                    <div className="text-gray-600 font-bold mt-1">Ekspedisi: {order.courierName || "Biteship"}</div>
                  </div>
                </div>

                {/* Items Table */}
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-gray-100 border-y border-black font-bold">
                      <th className="py-2 px-2">Produk</th>
                      <th className="py-2 px-2 text-center">Qty</th>
                      <th className="py-2 px-2 text-right">Harga Satuan</th>
                      <th className="py-2 px-2 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {order.items && order.items.length > 0 ? (
                      order.items.map((item: any, idx: number) => (
                        <tr key={idx}>
                          <td className="py-2.5 px-2 font-medium">{item.product?.name || "Produk TRI J"}</td>
                          <td className="py-2.5 px-2 text-center font-bold">{item.quantity || 1}</td>
                          <td className="py-2.5 px-2 text-right">{formatIDR(item.unitPrice || item.totalPrice)}</td>
                          <td className="py-2.5 px-2 text-right font-bold">{formatIDR((item.unitPrice || item.totalPrice) * (item.quantity || 1))}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="py-3 px-2 text-center text-gray-400">Rincian produk tersimpan di database.</td>
                      </tr>
                    )}
                  </tbody>
                </table>

                {/* Totals Summary */}
                <div className="flex justify-end pt-2">
                  <div className="w-64 space-y-1.5 text-xs">
                    <div className="flex justify-between text-gray-600">
                      <span>Subtotal Produk:</span>
                      <span>{formatIDR(order.subtotal || order.grandTotal)}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Ongkos Kirim:</span>
                      <span>{formatIDR(order.shippingCost || 0)}</span>
                    </div>
                    <div className="flex justify-between font-extrabold text-sm text-black pt-2 border-t-2 border-black">
                      <span>Total Bayar:</span>
                      <span>{formatIDR(order.grandTotal)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
