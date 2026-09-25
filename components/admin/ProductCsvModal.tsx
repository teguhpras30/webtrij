"use client";

import { useState, useRef } from "react";
import { X, Upload, Download, FileSpreadsheet, CheckCircle2, AlertCircle, RefreshCw, Info } from "lucide-react";

interface ProductCsvModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ProductCsvModal({ isOpen, onClose, onSuccess }: ProductCsvModalProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<any[]>([]);
  const [updateExisting, setUpdateExisting] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [resultSummary, setResultSummary] = useState<any | null>(null);

  if (!isOpen) return null;

  // Simple clean CSV parser handling quoted strings
  const parseCsvText = (text: string) => {
    // Remove UTF-8 BOM if present
    const cleanText = text.replace(/^\uFEFF/, "");
    const lines = cleanText.split(/\r\n|\n/).filter((l) => l.trim().length > 0);

    if (lines.length < 2) {
      throw new Error("File CSV harus memiliki minimal 1 baris header dan 1 baris data.");
    }

    const parseLine = (line: string): string[] => {
      const result: string[] = [];
      let current = "";
      let inQuotes = false;

      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          if (inQuotes && line[i + 1] === '"') {
            current += '"';
            i++;
          } else {
            inQuotes = !inQuotes;
          }
        } else if (char === "," && !inQuotes) {
          result.push(current.trim());
          current = "";
        } else {
          current += char;
        }
      }
      result.push(current.trim());
      return result;
    };

    const rawHeaders = parseLine(lines[0]);
    const headers = rawHeaders.map((h) => h.replace(/^"|"$/g, "").trim());

    const rows: any[] = [];
    for (let i = 1; i < lines.length; i++) {
      const values = parseLine(lines[i]).map((v) => v.replace(/^"|"$/g, "").trim());
      if (values.every((v) => !v)) continue; // skip blank rows

      const rowObj: any = {};
      headers.forEach((h, idx) => {
        rowObj[h] = values[idx] !== undefined ? values[idx] : "";
      });

      // Also map standard property names
      rowObj.name = rowObj["Nama Produk"] || rowObj.name || "";
      rowObj.categoryName = rowObj["Kategori"] || rowObj.categoryName || "";
      rowObj.retailPrice = rowObj["Harga Eceran (IDR)"] || rowObj["Harga Eceran"] || rowObj.retailPrice || "0";
      rowObj.stock = rowObj["Stok Dasar"] || rowObj.stock || "0";
      rowObj.moq = rowObj["MOQ (Min Beli)"] || rowObj.moq || "1";
      rowObj.weightGram = rowObj["Berat (gram)"] || rowObj.weightGram || "1000";
      rowObj.lengthCm = rowObj["Panjang (cm)"] || rowObj.lengthCm || "20";
      rowObj.widthCm = rowObj["Lebar (cm)"] || rowObj.widthCm || "20";
      rowObj.heightCm = rowObj["Tinggi (cm)"] || rowObj.heightCm || "20";
      rowObj.description = rowObj["Deskripsi"] || rowObj.description || "";
      rowObj.thumbnail = rowObj["URL Thumbnail"] || rowObj.thumbnail || "";
      rowObj.isBuyerOnly = rowObj["Buyer Only (TRUE/FALSE)"] || rowObj.isBuyerOnly || "FALSE";
      rowObj.isPopular = rowObj["Is Popular (TRUE/FALSE)"] || rowObj.isPopular || "FALSE";
      rowObj.isDeal = rowObj["Is Deal (TRUE/FALSE)"] || rowObj.isDeal || "FALSE";
      rowObj.variants = rowObj["Variasi (Nama=Harga=Stok dipisah |)"] || rowObj.variants || "";

      if (rowObj.name) {
        rows.push(rowObj);
      }
    }

    return rows;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.name.endsWith(".csv")) {
      setErrorMsg("Harap pilih berkas dengan format .csv");
      return;
    }

    setFile(selectedFile);
    setErrorMsg(null);
    setResultSummary(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const rows = parseCsvText(text);
        setParsedData(rows);
      } catch (err: any) {
        setErrorMsg(err.message || "Gagal membaca isi berkas CSV.");
        setParsedData([]);
      }
    };
    reader.readAsText(selectedFile, "UTF-8");
  };

  const handleDownloadTemplate = () => {
    const sampleHeaders = [
      "Nama Produk",
      "Kategori",
      "Harga Eceran (IDR)",
      "Stok Dasar",
      "MOQ (Min Beli)",
      "Berat (gram)",
      "Panjang (cm)",
      "Lebar (cm)",
      "Tinggi (cm)",
      "Deskripsi",
      "URL Thumbnail",
      "Buyer Only (TRUE/FALSE)",
      "Is Popular (TRUE/FALSE)",
      "Is Deal (TRUE/FALSE)",
      "Variasi (Nama=Harga=Stok dipisah |)",
    ];

    const sampleRow1 = [
      "Rak TV Korea Premium 8 Susun",
      "Rak & Lemari",
      "195000",
      "50",
      "1",
      "3500",
      "80",
      "40",
      "120",
      "Rak TV minimalis berbahan kokoh konsisten dari TRI J",
      "https://tri-j.co.id/images/raktv.webp",
      "FALSE",
      "TRUE",
      "FALSE",
      "4 SUSUN - HIJAU OLIVE=195000=30 | 4 SUSUN - MERAH OLIVE=195000=20",
    ];

    const sampleRow2 = [
      "Dispenser Beras Rotan Trio 12KG",
      "Dispenser Beras & Air",
      "145000",
      "100",
      "1",
      "2000",
      "30",
      "30",
      "45",
      "Dispenser beras otomatis anti kutu dan higienis",
      "https://tri-j.co.id/images/dispenser.webp",
      "FALSE",
      "TRUE",
      "TRUE",
      "HIJAU OLIVE=145000=50 | COKLAT ROTAN=145000=50",
    ];

    const csvContent =
      "\uFEFF" +
      [
        sampleHeaders.map((h) => `"${h.replace(/"/g, '""')}"`).join(","),
        sampleRow1.map((f) => `"${f.replace(/"/g, '""')}"`).join(","),
        sampleRow2.map((f) => `"${f.replace(/"/g, '""')}"`).join(","),
      ].join("\r\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "template_input_produk_trij.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleUploadSubmit = async () => {
    if (parsedData.length === 0) {
      setErrorMsg("Tidak ada data produk valid yang siap diimpor.");
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setResultSummary(null);

    try {
      const res = await fetch("/api/admin/products/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          products: parsedData,
          updateExisting,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gagal mengimpor data produk.");
      }

      setResultSummary(data);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setErrorMsg(err.message || "Terjadi kesalahan saat mengunggah CSV.");
    } finally {
      setLoading(false);
    }
  };

  const formatIDR = (val: any) => {
    const num = Number(val) || 0;
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(num);
  };

  return (
    <div className="fixed inset-0 z-50 bg-gray-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto font-sans">
      <div className="bg-white border border-gray-200 rounded-3xl w-full max-w-4xl p-6 relative shadow-2xl space-y-6 my-auto max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-gray-900 text-base">Bulk Import Data Produk via CSV</h3>
              <p className="text-xs text-gray-500">Unggah puluhan/ratusan data produk toko sekaligus secara instan</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadTemplate}
              className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 font-bold rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer"
              title="Unduh Contoh Template CSV"
            >
              <Download className="w-4 h-4 text-emerald-600" />
              <span>Download Template CSV</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-700 rounded-xl hover:bg-gray-100 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="space-y-5 overflow-y-auto pr-1 flex-1">
          {/* File Picker Zone */}
          <div className="p-6 border-2 border-dashed border-purple-200 bg-purple-50/40 rounded-2xl text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-white border border-purple-100 flex items-center justify-center mx-auto text-purple-600 shadow-2xs">
              <Upload className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-800">
                {file ? `File terpilih: ${file.name}` : "Pilih berkas CSV produk untuk diunggah"}
              </p>
              <p className="text-xs text-gray-500 mt-1">Format file didukung: .csv (UTF-8)</p>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-extrabold rounded-xl text-xs shadow-md transition cursor-pointer inline-flex items-center gap-2"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>{file ? "Ganti Berkas CSV" : "Pilih Berkas CSV..."}</span>
            </button>
          </div>

          {/* Options & Settings */}
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-2xl flex items-center justify-between gap-4 flex-wrap text-xs">
            <label className="flex items-center gap-2.5 font-bold text-gray-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={updateExisting}
                onChange={(e) => setUpdateExisting(e.target.checked)}
                className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500 border-gray-300 cursor-pointer"
              />
              <span>Perbarui produk jika nama produk yang sama sudah ada di database</span>
            </label>

            {parsedData.length > 0 && (
              <span className="font-extrabold text-purple-700 bg-purple-100 px-3 py-1 rounded-full border border-purple-200">
                Terdeteksi: {parsedData.length} Produk Siap Diimpor
              </span>
            )}
          </div>

          {/* Error Message Alert */}
          {errorMsg && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Success Summary Alert */}
          {resultSummary && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs space-y-2">
              <div className="flex items-center gap-2 font-black text-emerald-800 text-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>{resultSummary.message}</span>
              </div>
              <div className="flex items-center gap-4 font-mono font-bold text-emerald-700 pt-1">
                <span>Dibuat Baru: {resultSummary.createdCount}</span>
                <span>Diperbarui: {resultSummary.updatedCount}</span>
                <span>Gagal: {resultSummary.errorCount}</span>
              </div>

              {resultSummary.errors && resultSummary.errors.length > 0 && (
                <div className="mt-2 pt-2 border-t border-emerald-200/80 text-[11px] text-red-600 space-y-1">
                  <p className="font-bold">Rincian Kendala Baris:</p>
                  <ul className="list-disc list-inside space-y-0.5 max-h-32 overflow-y-auto">
                    {resultSummary.errors.map((errStr: string, idx: number) => (
                      <li key={idx}>{errStr}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Data Preview Table */}
          {parsedData.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-gray-700">
                <span>Pratinjau Data CSV ({Math.min(10, parsedData.length)} Baris Pertama):</span>
                <span className="text-gray-400 font-normal">Periksa kembali sebelum mengklik Simpan</span>
              </div>

              <div className="border border-gray-200 rounded-xl overflow-hidden overflow-x-auto max-h-60">
                <table className="w-full text-left text-[11px] text-gray-700">
                  <thead className="bg-gray-100 text-gray-600 font-bold uppercase tracking-wider border-b border-gray-200">
                    <tr>
                      <th className="px-3 py-2">#</th>
                      <th className="px-3 py-2">Nama Produk</th>
                      <th className="px-3 py-2">Kategori</th>
                      <th className="px-3 py-2">Harga Eceran</th>
                      <th className="px-3 py-2">Stok</th>
                      <th className="px-3 py-2">MOQ</th>
                      <th className="px-3 py-2">Variasi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white font-mono">
                    {parsedData.slice(0, 10).map((row, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="px-3 py-2 text-gray-400">{idx + 1}</td>
                        <td className="px-3 py-2 font-bold text-gray-900 font-sans">{row.name}</td>
                        <td className="px-3 py-2 text-purple-700 font-sans">{row.categoryName}</td>
                        <td className="px-3 py-2 text-emerald-600 font-bold">{formatIDR(row.retailPrice)}</td>
                        <td className="px-3 py-2">{row.stock} Pcs</td>
                        <td className="px-3 py-2">{row.moq} Item</td>
                        <td className="px-3 py-2 text-gray-500 font-sans max-w-xs truncate" title={row.variants}>
                          {row.variants || "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t border-gray-100 pt-4 shrink-0">
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <Info className="w-4 h-4 text-purple-600 shrink-0" />
            <span>Kategori baru akan otomatis dibuat jika belum ada di database.</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 border border-gray-200 text-gray-600 font-bold rounded-xl text-xs hover:bg-gray-100 transition cursor-pointer"
            >
              Batal
            </button>
            <button
              type="button"
              disabled={parsedData.length === 0 || loading}
              onClick={handleUploadSubmit}
              className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-extrabold rounded-xl text-xs shadow-md transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Memproses Impor CSV...</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  <span>Simpan Impor Data ({parsedData.length} Produk)</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
