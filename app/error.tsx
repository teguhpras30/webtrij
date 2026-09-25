"use client";

import Link from "next/link";

export default function Error({
  reset,
}: {
  error?: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans text-gray-900">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-gray-200 shadow-xl text-center space-y-5">
        <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto shadow-sm text-2xl font-bold">
          ⚠️
        </div>

        <div>
          <h2 className="text-lg font-black text-gray-900">Terjadi Kendala Teknis</h2>
          <p className="text-xs text-gray-500 mt-1 leading-relaxed">
            Halaman mengalami sedikit kendala sistem. Anda dapat mencoba memuat ulang halaman atau kembali ke Beranda Utama.
          </p>
        </div>

        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => reset()}
            className="px-5 py-2.5 bg-[#EE4D2D] hover:bg-[#d73f21] text-white font-extrabold text-xs rounded-xl shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
          >
            🔄 <span>Coba Lagi</span>
          </button>
          <Link
            href="/"
            className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all"
          >
            🏠 <span>Ke Beranda</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
