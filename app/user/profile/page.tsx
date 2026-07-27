"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { User, Mail, Phone, Shield, Calendar, LogOut, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function CustomerProfilePage() {
  const router = useRouter();
  const { user, loading, logout } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    }
  }, [user, loading, router]);

  const handleLogout = async () => {
    await logout();
    router.push("/");
    router.refresh();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white font-sans">
        <Loader2 className="w-8 h-8 animate-spin text-red-500 mb-2" />
        <span className="text-xs text-slate-400 ml-2">Memuat profil...</span>
      </div>
    );
  }

  if (!user) return null;

  return (
    <main className="min-h-screen bg-[var(--Bg)] font-sans">
      <Navbar />

      <section className="mx-auto max-w-4xl px-4 pt-28 pb-20">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs text-slate-500 hover:text-slate-800 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Beranda</span>
        </Link>

        <div className="bg-white rounded-3xl border border-gray-200 shadow-xl overflow-hidden">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-red-600 to-rose-600 p-8 text-white relative">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
              <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-md border-2 border-white/40 flex items-center justify-center font-bold text-3xl text-white shadow-lg uppercase shrink-0">
                {user?.name?.[0] || user?.username?.[0] || "U"}
              </div>
              <div className="text-center sm:text-left">
                <h1 className="text-2xl font-bold">{user?.name || user?.username}</h1>
                <p className="text-xs text-white/80 mt-1">@{user?.username}</p>
                <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-semibold">
                  <Shield className="w-3.5 h-3.5" />
                  <span>Akun Pelanggan</span>
                </div>
              </div>
            </div>
          </div>

          {/* Body Details */}
          <div className="p-8 space-y-6">
            <h2 className="text-base font-bold text-gray-900 border-b pb-3">Informasi Akun Saya</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              <div className="flex items-center gap-3.5 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-gray-400 text-[11px] font-medium">Nama Lengkap</div>
                  <div className="text-gray-900 font-semibold text-sm mt-0.5">{user?.name || "-"}</div>
                </div>
              </div>

              <div className="flex items-center gap-3.5 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-gray-400 text-[11px] font-medium">Email</div>
                  <div className="text-gray-900 font-semibold text-sm mt-0.5">{user?.email}</div>
                </div>
              </div>

              <div className="flex items-center gap-3.5 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-gray-400 text-[11px] font-medium">Nomor Telepon</div>
                  <div className="text-gray-900 font-semibold text-sm mt-0.5">{user?.phone || "Belum diisi"}</div>
                </div>
              </div>

              <div className="flex items-center gap-3.5 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-gray-400 text-[11px] font-medium">Tanggal Bergabung</div>
                  <div className="text-gray-900 font-semibold text-sm mt-0.5">
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString("id-ID") : "-"}
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t flex justify-end">
              <button
                onClick={handleLogout}
                className="px-5 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 font-semibold text-xs rounded-xl flex items-center gap-2 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Keluar Akun (Logout)</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
