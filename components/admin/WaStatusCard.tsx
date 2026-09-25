"use client";

import { useState, useEffect } from "react";
import { MessageSquare, RefreshCw, QrCode, Send, CheckCircle2, XCircle, Loader2 } from "lucide-react";

export default function WaStatusCard() {
  const [status, setStatus] = useState<"connected" | "disconnected" | "checking">("checking");
  const [account, setAccount] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Test send states
  const [testPhone, setTestPhone] = useState("");
  const [sendingTest, setSendingTest] = useState(false);
  const [showTestForm, setShowTestForm] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/wa-status", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setStatus(data.status === "connected" ? "connected" : "disconnected");
        setAccount(data.account || null);
      } else {
        setStatus("disconnected");
        setAccount(null);
      }
    } catch (e) {
      setStatus("disconnected");
      setAccount(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    // Auto refresh status every 12 seconds
    const interval = setInterval(fetchStatus, 12000);
    return () => clearInterval(interval);
  }, []);

  const handleSendTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testPhone) return;

    setSendingTest(true);
    setTestResult(null);

    try {
      const res = await fetch("/api/admin/wa-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target: testPhone }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setTestResult({
          success: true,
          message: data.message || `Pesan WA OTP berhasil terkirim ke ${testPhone}!`,
        });
      } else {
        setTestResult({
          success: false,
          message: data.error || "Gagal mengirim pesan via WA Gateway.",
        });
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err?.message || "Terjadi kesalahan saat menguji pengiriman WA.",
      });
    } finally {
      setSendingTest(false);
    }
  };

  const formattedAccount = account
    ? account.split("@")[0].split(":")[0].replace(/^62/, "0")
    : null;

  return (
    <div className="bg-white border border-emerald-100 rounded-2xl p-5 shadow-xs mb-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left Info Section */}
        <div className="flex items-start sm:items-center gap-3.5">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-md ${
            status === "connected"
              ? "bg-emerald-500 text-white shadow-emerald-500/20"
              : "bg-amber-500 text-white shadow-amber-500/20"
          }`}>
            <MessageSquare className="w-6 h-6" />
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm font-bold text-gray-900">WhatsApp Gateway OTP Server</h3>

              {status === "checking" ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Mengecek...
                </span>
              ) : status === "connected" ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Terhubung & Aktif
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  Belum Terhubung
                </span>
              )}
            </div>

            <p className="text-xs text-gray-500 mt-1">
              {status === "connected" && formattedAccount ? (
                <>Nomor WA Pengirim Resmi: <strong className="text-emerald-700 font-semibold">{formattedAccount}</strong> (+6285139396850)</>
              ) : (
                <>Silakan scan QR Code untuk menghubungkan nomor WhatsApp pengirim OTP toko Anda.</>
              )}
            </p>
          </div>
        </div>

        {/* Right Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={fetchStatus}
            disabled={loading}
            className="p-2.5 text-gray-600 hover:text-emerald-700 bg-gray-50 hover:bg-emerald-50 border border-gray-200 rounded-xl transition cursor-pointer"
            title="Cek Ulang Status Koneksi WA"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-emerald-600" : ""}`} />
          </button>

          <a
            href="/api/admin/wa-qr"
            target="_blank"
            rel="noreferrer"
            className="px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm hover:shadow-md transition flex items-center gap-2 cursor-pointer"
          >
            <QrCode className="w-4 h-4" />
            <span>Scan / Tautkan QR Code</span>
          </a>

          <button
            type="button"
            onClick={() => setShowTestForm(!showTestForm)}
            className="px-3.5 py-2.5 bg-white border border-emerald-300 text-emerald-700 hover:bg-emerald-50 text-xs font-bold rounded-xl transition flex items-center gap-2 cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Uji Coba Kirim WA</span>
          </button>
        </div>
      </div>

      {/* Test Form Drawer */}
      {showTestForm && (
        <div className="mt-4 pt-4 border-t border-emerald-100 bg-emerald-50/50 p-4 rounded-xl">
          <form onSubmit={handleSendTest} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="flex-1">
              <label className="block text-xs font-bold text-gray-700 mb-1">Nomor WhatsApp Pengujian:</label>
              <input
                type="text"
                placeholder="Contoh: 08961656039 atau 628123456789"
                value={testPhone}
                onChange={(e) => setTestPhone(e.target.value)}
                className="w-full px-3.5 py-2 bg-white border border-gray-300 rounded-xl text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>
            <button
              type="submit"
              disabled={sendingTest || !testPhone}
              className="mt-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer transition"
            >
              {sendingTest ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              <span>{sendingTest ? "Mengirim..." : "Kirim Tes Pesan WA"}</span>
            </button>
          </form>

          {testResult && (
            <div className={`mt-3 p-3 rounded-lg text-xs font-semibold flex items-center gap-2 ${
              testResult.success ? "bg-emerald-100 text-emerald-800 border border-emerald-200" : "bg-red-100 text-red-800 border border-red-200"
            }`}>
              {testResult.success ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <XCircle className="w-4 h-4 text-red-600 shrink-0" />}
              <span>{testResult.message}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
