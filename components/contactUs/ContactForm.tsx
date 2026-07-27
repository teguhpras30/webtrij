"use client";

import { useState, FormEvent } from "react";
import { motion } from "framer-motion";
import { Loader2, CheckCircle2, AlertCircle, Send } from "lucide-react";

export default function ContactForm() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/public/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          message,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gagal mengirim pesan.");
      }

      setSuccessMessage(
        "Pesan Anda berhasil dikirim ke tim sales (sherly_59@yahoo.com & teguhpras30@gmail.com). Kami akan merespons segera!"
      );
      setFirstName("");
      setLastName("");
      setEmail("");
      setMessage("");
    } catch (err: any) {
      setErrorMessage(err.message || "Terjadi kesalahan saat mengirim pesan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 80 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 1, ease: "easeOut" }}
    >
      <form onSubmit={handleSubmit} className="w-full max-w-[560px] space-y-6 md:space-y-8 lg:max-w-none">
        {successMessage && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 p-4 rounded-2xl flex items-center gap-3 text-sm font-medium">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-600 p-4 rounded-2xl flex items-center gap-3 text-sm font-medium">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Name */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label className="mb-3 block font-medium text-gray-800">First Name *</label>
            <input
              type="text"
              required
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Enter your first name"
              className="h-14 w-full rounded-full bg-white px-6 outline-none md:h-16 border border-transparent focus:border-[#774EFC] transition text-sm"
            />
          </div>

          <div>
            <label className="mb-3 block font-medium text-gray-800">Last Name</label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Enter your last name"
              className="h-14 w-full rounded-full bg-white px-6 outline-none md:h-16 border border-transparent focus:border-[#774EFC] transition text-sm"
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="mb-3 block font-medium text-gray-800">Email *</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="h-14 w-full rounded-full bg-white px-6 outline-none md:h-16 border border-transparent focus:border-[#774EFC] transition text-sm"
          />
        </div>

        {/* Message */}
        <div>
          <label className="mb-3 block font-medium text-gray-800">How can we help you? *</label>
          <textarea
            required
            rows={7}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Write your message..."
            className="min-h-[180px] w-full resize-none rounded-[24px] bg-white p-6 outline-none md:rounded-[30px] border border-transparent focus:border-[#774EFC] transition text-sm"
          />
        </div>

        {/* Button */}
        <button
          type="submit"
          disabled={loading}
          className="h-14 w-full rounded-full bg-[#774EFC] hover:bg-[#6438f5] text-lg font-semibold text-white transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 md:h-16 md:text-xl shadow-lg shadow-purple-600/20"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Sending Message...</span>
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              <span>Send Message</span>
            </>
          )}
        </button>
      </form>
    </motion.div>
  );
}