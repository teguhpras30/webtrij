"use client";

import { useState, FormEvent } from "react";
import { motion } from "framer-motion";
import {
  X,
  User,
  Mail,
  Phone,
  KeyRound,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  MessageSquare,
  CheckCircle2,
  RefreshCw,
  Edit3,
  MapPin,
} from "lucide-react";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";

const formatDisplayPhone = (raw: string): string => {
  if (!raw) return "";
  let clean = String(raw).replace(/\D/g, "");
  if (clean.startsWith("62")) return "+" + clean;
  if (clean.startsWith("0")) return "+62" + clean.substring(1);
  return "+62" + clean;
};

const formatApiPhone = (raw: string): string => {
  if (!raw) return "";
  let clean = String(raw).replace(/\D/g, "");
  if (clean.startsWith("62")) return clean;
  if (clean.startsWith("0")) return "62" + clean.substring(1);
  return "62" + clean;
};

interface CustomerAuthModalProps {
  initialTab?: "login" | "register" | "quick-otp";
  onClose: () => void;
  onSuccess: (user: any) => void;
}

export default function CustomerAuthModal({
  initialTab = "quick-otp",
  onClose,
  onSuccess,
}: CustomerAuthModalProps) {
  const [tab, setTab] = useState<"login" | "register" | "quick-otp" | "otp">(initialTab);

  // Form states
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // OTP states
  const [otpInput, setOtpInput] = useState("");
  const [registeredUserId, setRegisteredUserId] = useState<number | null>(null);
  const [otpPhone, setOtpPhone] = useState("");
  const [debugOtpCode, setDebugOtpCode] = useState<string | null>(null);
  const [resendingOtp, setResendingOtp] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLoginSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: username || email, password }),
      });

      const data = await res.json();

      if (data.requiresOtp) {
        setRegisteredUserId(data.userId);
        if (data.phone) {
          const cleanP = String(data.phone).replace(/^(\+?62|0)/, "");
          setPhone(cleanP);
          setOtpPhone(cleanP);
          setOtpSent(true);
        } else {
          setPhone("");
          setOtpPhone("");
          setOtpSent(false);
        }
        if (data.debugOtp) setDebugOtpCode(data.debugOtp);
        setSuccessMessage(data.error || "Akun Anda belum terverifikasi. Masukkan kode OTP WhatsApp!");
        setTab("otp");
        return;
      }

      if (!res.ok) throw new Error(data.error || "Gagal melakukan login.");

      onSuccess(data.user);
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan saat login.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, username, email, phone: formatApiPhone(phone), password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal melakukan pendaftaran.");

      if (data.requiresOtp) {
        setRegisteredUserId(data.userId);
        setOtpPhone(data.phone || formatApiPhone(phone));
        setOtpSent(true);
        if (data.debugOtp) setDebugOtpCode(data.debugOtp);
        setSuccessMessage("Kode OTP telah dikirim ke WhatsApp Anda!");
        setTab("otp");
      } else {
        onSuccess(data.user);
      }
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan saat mendaftar.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickOtpSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/quick-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name || "Pelanggan TRI J",
          phone: formatApiPhone(phone),
          address: address,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal mengirimkan kode OTP WhatsApp.");

      if (data.requiresOtp) {
        setRegisteredUserId(data.userId);
        setOtpPhone(data.phone || formatApiPhone(phone));
        setOtpSent(true);
        if (data.debugOtp) setDebugOtpCode(data.debugOtp);
        setSuccessMessage(data.message || "Kode OTP telah dikirim ke WhatsApp Anda!");
        setTab("otp");
      } else if (data.user) {
        onSuccess(data.user);
      }
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan saat mengirim OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpVerifySubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: registeredUserId,
          phone: formatApiPhone(otpPhone || phone),
          otpCode: otpInput,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Kode OTP salah atau kadaluarsa.");

      onSuccess(data.user);
    } catch (err: any) {
      setError(err.message || "Gagal memverifikasi OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setError(null);
    setSuccessMessage(null);
    setResendingOtp(true);

    try {
      const res = await fetch("/api/auth/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: registeredUserId,
          phone: formatApiPhone(otpPhone || phone),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal mengirim ulang OTP.");

      if (data.debugOtp) setDebugOtpCode(data.debugOtp);
      setSuccessMessage("Kode OTP baru telah dikirimkan ke WhatsApp Anda!");
    } catch (err: any) {
      setError(err.message || "Gagal mengirim ulang OTP.");
    } finally {
      setResendingOtp(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setGoogleLoading(true);

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      const idToken = await user.getIdToken();

      const res = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user.email,
          name: user.displayName,
          avatar: user.photoURL,
          uid: user.uid,
          idToken,
        }),
      });

      const data = await res.json();

      if (data.requiresOtp) {
        setRegisteredUserId(data.userId);
        setPhone("");
        setOtpPhone("");
        setOtpSent(false);
        if (data.debugOtp) setDebugOtpCode(data.debugOtp);
        setSuccessMessage(data.message || "Login Google berhasil! Silakan masukkan nomor WhatsApp Anda di bawah untuk menerima kode OTP.");
        setTab("otp");
        return;
      }

      if (!res.ok) throw new Error(data.error || "Gagal login dengan Google.");

      onSuccess(data.user);
    } catch (err: any) {
      if (err.code === "auth/popup-closed-by-user") {
        setError("Proses login Google dibatalkan.");
      } else if (err.code === "auth/cancelled-popup-request") {
        setError("Permintaan login Google lain sedang berjalan.");
      } else {
        setError(err.message || "Gagal masuk menggunakan Google.");
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white border border-gray-100 w-full max-w-md rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden font-sans"
      >
        {/* Background glow effects */}
        <div className="absolute -top-16 -right-16 w-32 h-32 bg-red-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center transition-colors cursor-pointer z-10"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Title & Subtitle */}
        <div className="text-center space-y-1 mb-6 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-700 rounded-full text-[11px] font-bold border border-red-100 mb-1">
            <span>TRI J Official Marketplace</span>
          </div>
          <h3 className="text-xl font-black text-gray-900 tracking-tight">
            {tab === "quick-otp"
              ? "Masukkan Alamat dan Nomor Telepon untuk Pengiriman"
              : tab === "login"
                ? "Masuk ke Akun Pelanggan"
                : tab === "register"
                  ? "Daftar Akun Baru"
                  : "Verifikasi Kode OTP WhatsApp"}
          </h3>
          <p className="text-xs text-gray-500 font-medium">
            {tab === "quick-otp"
              ? "Lengkapi Nama, Nomor WhatsApp, & Alamat Anda untuk kemudahan pengiriman."
              : tab === "login"
                ? "Akses kemudahan belanja & lacak status pesanan Anda."
                : tab === "register"
                  ? "Dapatkan diskon promo eksklusif & gratis pengiriman."
                  : `Masukkan 4 digit kode OTP yang dikirim ke ${otpPhone ? "+" + otpPhone : "WhatsApp Anda"}.`}
          </p>
        </div>

        {/* Tab Switcher (Only visible for non-otp steps) */}
        {tab !== "otp" && (
          <div className="flex bg-gray-100/80 p-1 rounded-2xl mb-5 relative z-10 border border-gray-200/60">
            <button
              type="button"
              onClick={() => {
                setTab("quick-otp");
                setError(null);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1 ${
                tab === "quick-otp"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Cepat WA</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setTab("login");
                setError(null);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                tab === "login"
                  ? "bg-white text-gray-900 shadow-xs"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Masuk
            </button>
            <button
              type="button"
              onClick={() => {
                setTab("register");
                setError(null);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                tab === "register"
                  ? "bg-white text-gray-900 shadow-xs"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Daftar
            </button>
          </div>
        )}

        {/* Google One-Tap Quick Login Button */}
        {tab !== "otp" && (
          <div className="mb-5 relative z-10 space-y-3">
            <button
              type="button"
              disabled={googleLoading || loading}
              onClick={handleGoogleSignIn}
              className="w-full py-2.5 px-4 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold text-xs rounded-xl shadow-2xs flex items-center justify-center gap-3 transition-all cursor-pointer disabled:opacity-50"
            >
              {googleLoading ? (
                <Loader2 className="w-4 h-4 animate-spin text-red-600" />
              ) : (
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
              )}
              <span>{googleLoading ? "Menghubungkan Google..." : "Lanjutkan dengan Google"}</span>
            </button>

            <div className="relative flex items-center justify-center">
              <div className="border-t border-gray-200 w-full" />
              <span className="bg-white px-3 text-[10px] text-gray-400 uppercase font-bold tracking-wider relative z-10 shrink-0">
                Atau Form Manual
              </span>
            </div>
          </div>
        )}

        {/* Alert Error Box */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-semibold flex items-start gap-2 animate-in fade-in duration-150">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        {/* Alert Success Box */}
        {successMessage && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-start gap-2 animate-in fade-in duration-150">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* QUICK OTP FORM (Opsi B: Nama + WhatsApp OTP) */}
        {tab === "quick-otp" && (
          <form onSubmit={handleQuickOtpSubmit} className="space-y-3.5 relative z-10">
            <div>
              <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                Nama Lengkap <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-3 text-gray-400" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Budi Santoso"
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 placeholder-gray-400 focus:bg-white focus:outline-none focus:border-emerald-500 font-bold"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                Nomor WhatsApp <span className="text-emerald-600 font-bold">(Wajib untuk OTP)</span>
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3.5 flex items-center gap-1 bg-emerald-50 text-emerald-800 font-extrabold text-xs px-2.5 py-1 rounded-lg border border-emerald-200 pointer-events-none z-10">
                  <span>🇮🇩</span>
                  <span>+62</span>
                </div>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => {
                    let val = e.target.value.replace(/\D/g, "");
                    if (val.startsWith("62")) val = val.substring(2);
                    if (val.startsWith("0")) val = val.substring(1);
                    setPhone(val);
                  }}
                  placeholder="8123456789"
                  className="w-full pl-20 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 font-bold tracking-wider focus:bg-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                Alamat Lengkap Pengiriman <span className="text-gray-400 font-normal">(Opsional)</span>
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 absolute left-3.5 top-3 text-gray-400" />
                <textarea
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Contoh: Jl. Raya Cikarang No. 123, RT 02/05, Kec. Cikarang Barat, Kab. Bekasi, 17530"
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 placeholder-gray-400 focus:bg-white focus:outline-none focus:border-emerald-500 font-medium resize-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !phone.trim() || !name.trim()}
              className="w-full mt-3 py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Mengirim Kode OTP...</span>
                </>
              ) : (
                <>
                  <MessageSquare className="w-4 h-4" />
                  <span>Kirim Kode OTP WA</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* LOGIN FORM */}
        {tab === "login" && (
          <form onSubmit={handleLoginSubmit} className="space-y-3.5 relative z-10">
            <div>
              <label className="block text-[11px] font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Username / Email
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-3 text-gray-400" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="pelanggan atau user@trij.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 placeholder-gray-400 focus:bg-white focus:outline-none focus:border-red-500 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 absolute left-3.5 top-3 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 placeholder-gray-400 focus:bg-white focus:outline-none focus:border-red-500 font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || googleLoading}
              className="w-full mt-3 py-3 px-4 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Memproses Login...</span>
                </>
              ) : (
                <>
                  <span>Masuk Akun</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* REGISTER FORM */}
        {tab === "register" && (
          <form onSubmit={handleRegisterSubmit} className="space-y-3.5 relative z-10">
            <div>
              <label className="block text-[11px] font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Nama Lengkap
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-3 text-gray-400" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Budi Santoso"
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 placeholder-gray-400 focus:bg-white focus:outline-none focus:border-red-500 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Username
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-3 text-gray-400" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="budi_trij"
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 placeholder-gray-400 focus:bg-white focus:outline-none focus:border-red-500 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-3 text-gray-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="budi@gmail.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 placeholder-gray-400 focus:bg-white focus:outline-none focus:border-red-500 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Nomor WhatsApp <span className="text-emerald-600 font-bold">(Wajib untuk OTP)</span>
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3.5 flex items-center gap-1 bg-emerald-50 text-emerald-800 font-extrabold text-xs px-2.5 py-1 rounded-lg border border-emerald-200 pointer-events-none z-10">
                  <span>🇮🇩</span>
                  <span>+62</span>
                </div>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => {
                    let val = e.target.value.replace(/\D/g, "");
                    if (val.startsWith("62")) val = val.substring(2);
                    if (val.startsWith("0")) val = val.substring(1);
                    setPhone(val);
                  }}
                  placeholder=""
                  className="w-full pl-20 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 placeholder-gray-400 focus:bg-white focus:outline-none focus:border-emerald-500 font-bold tracking-wider"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Password
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 absolute left-3.5 top-3 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimal 6 karakter"
                  className="w-full pl-10 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 placeholder-gray-400 focus:bg-white focus:outline-none focus:border-red-500 font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || googleLoading}
              className="w-full mt-3 py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Mengirim Kode OTP...</span>
                </>
              ) : (
                <>
                  <MessageSquare className="w-4 h-4" />
                  <span>Daftar & Kirim OTP WA</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* OTP VERIFICATION STEP FORM */}
        {tab === "otp" && (
          <div className="space-y-4 relative z-10 animate-in fade-in duration-200">
            {/* Jika kode OTP belum dikirim (misal user Google SSO perlu menginput nomor WA dahulu) */}
            {!otpSent ? (
              <div className="space-y-4">
                <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200 text-xs text-amber-900 space-y-1">
                  <p className="font-extrabold flex items-center gap-1 text-amber-800">
                    <span>📱</span>
                    <span>Hampir Selesai! Lengkapi Nomor WhatsApp</span>
                  </p>
                  <p className="text-[11px] text-amber-700">
                    Silakan masukkan nomor WhatsApp Anda di bawah ini untuk menerima kode OTP verifikasi akun.
                  </p>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Nomor WhatsApp Anda <span className="text-emerald-600 font-bold">(Wajib)</span>
                  </label>
                  <div className="relative flex items-center">
                    <div className="absolute left-3.5 flex items-center gap-1 bg-emerald-50 text-emerald-800 font-extrabold text-xs px-2.5 py-1 rounded-lg border border-emerald-200 pointer-events-none z-10">
                      <span>🇮🇩</span>
                      <span>+62</span>
                    </div>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => {
                        let val = e.target.value.replace(/\D/g, "");
                        if (val.startsWith("62")) val = val.substring(2);
                        if (val.startsWith("0")) val = val.substring(1);
                        setPhone(val);
                      }}
                      placeholder=""
                      className="w-full pl-20 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 font-bold tracking-wider focus:bg-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  disabled={resendingOtp || !phone.trim()}
                  onClick={async () => {
                    if (!phone.trim()) return;
                    const cleanPhone = phone.trim();
                    setOtpPhone(cleanPhone);
                    setOtpSent(true);
                    await handleResendOtp();
                  }}
                  className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                >
                  {resendingOtp ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Mengirim Kode OTP...</span>
                    </>
                  ) : (
                    <>
                      <MessageSquare className="w-4 h-4" />
                      <span>Kirim Kode OTP WA</span>
                    </>
                  )}
                </button>
              </div>
            ) : (
              <form onSubmit={handleOtpVerifySubmit} className="space-y-4">
                <div className="bg-emerald-50/80 p-4 rounded-2xl border border-emerald-200/80 space-y-2 text-center">
                  <div className="w-12 h-12 bg-emerald-600 text-white rounded-full flex items-center justify-center mx-auto shadow-md">
                    <MessageSquare className="w-6 h-6" />
                  </div>
                  <p className="text-[11px] text-emerald-800">
                    Silakan cek aplikasi WhatsApp di nomor <span className="font-bold">{formatDisplayPhone(otpPhone || phone)}</span>.
                  </p>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-2 text-center">
                    Masukkan 4 Digit Kode OTP:
                  </label>
                  <input
                    type="text"
                    maxLength={4}
                    required
                    value={otpInput}
                    onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ""))}
                    placeholder="• • • •"
                    className="w-full text-center tracking-[0.5em] text-2xl font-black font-mono py-3 bg-gray-50 border-2 border-emerald-400 rounded-2xl text-gray-900 focus:bg-white focus:outline-none focus:border-emerald-600 shadow-inner"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || otpInput.length < 4}
                  className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Memverifikasi Kode...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Verifikasi & Aktifkan Akun</span>
                    </>
                  )}
                </button>
              </form>
            )}

            <div className="text-center pt-2 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3">
              <button
                type="button"
                disabled={resendingOtp}
                onClick={handleResendOtp}
                className="text-xs font-bold text-emerald-700 hover:underline flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${resendingOtp ? "animate-spin" : ""}`} />
                <span>{resendingOtp ? "Mengirim ulang..." : "Kirim Ulang Kode OTP via WA"}</span>
              </button>

              <span className="hidden sm:inline text-gray-300">•</span>

              <button
                type="button"
                onClick={() => {
                  setOtpSent(false);
                  setOtpInput("");
                  setPhone("");
                  setOtpPhone("");
                  setError(null);
                  setSuccessMessage(null);
                }}
                className="text-xs font-bold text-gray-600 hover:text-emerald-700 hover:underline flex items-center justify-center gap-1.5 cursor-pointer transition"
              >
                <Edit3 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Ganti Nomor WhatsApp</span>
              </button>
            </div>
          </div>
        )}

        {/* Footer info */}
        <div className="mt-5 pt-3 border-t border-gray-100 text-center relative z-10">
          <p className="text-[10px] text-gray-500 flex items-center justify-center gap-1.5 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Sistem Otentikasi WhatsApp OTP Terverifikasi & Terlindungi</span>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
