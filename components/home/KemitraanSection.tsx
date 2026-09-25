"use client";

import { motion } from "framer-motion";
import {
    Factory,
    RotateCcw,
    Award,
    Truck,
    MessageSquare,
    ArrowRight,
    Sparkles,
    CheckCircle2,
    TrendingUp,
    Building2,
    ShieldCheck,
    PackageCheck,
} from "lucide-react";

export default function KemitraanSection() {
    const benefits = [
        {
            icon: Factory,
            title: "Harga Tangan Pertama",
            description:
                "Dapatkan penawaran harga grosir eksklusif langsung dari produsen tanpa perantara untuk marjin keuntungan toko yang maksimal.",
            badge: "Marjin Tinggi",
        },
        {
            icon: RotateCcw,
            title: "Garansi Retur & Ganti Baru",
            description:
                "Jaminan kualitas pasokan stok berkelanjutan. Jika terdapat barang cacat produksi, kami siap mengganti dengan unit baru. Syarat & ketentuan berlaku*",
            badge: "Bebas Risiko",
        },
        {
            icon: Award,
            title: "Standar Sertifikasi",
            description:
                "Seluruh produk peralatan rumah tangga diproduksi dengan standar resmi, teruji aman, dan siap dipasarkan di toko fisik maupun marketplace.",
            badge: "Terjamin Resmi",
        },
        {
            icon: Truck,
            title: "Dukungan Logistik",
            description:
                "Dukungan armada darat yang hemat, cepat, dan aman langsung dikirim ke lokasi gudang atau toko Anda.",
            badge: "Jangkauan Luas",
        },
    ];

    const steps = [
        {
            number: "01",
            title: "Hubungi Sales B2B",
            desc: "Konsultasikan kebutuhan produk perabotan rumah tangga plastik Anda dengan tim kami via WhatsApp.",
        },
        {
            number: "02",
            title: "Pilih Katalog & Sample",
            desc: "Dapatkan katalog lengkap, daftar harga grosir, serta penawaran sampel produk unggulan.",
        },
        {
            number: "03",
            title: "Penawaran & Pembayaran",
            desc: "Dapatkan skema harga grosir khusus kuantitas, invoice resmi, dan kepastian jadwal kirim.",
        },
        {
            number: "04",
            title: "Pengiriman ke Gudang",
            desc: "Pesanan dikemas secara aman dan dikirimkan via truck langsung menuju lokasi bisnis Anda.",
        },
    ];


    return (
        <section className="relative overflow-hidden bg-white text-gray-900 py-20 lg:py-28 px-4 sm:px-6 lg:px-12 border-t border-gray-100">
            {/* Background Decorative Gradient Light Elements */}
            <div className="pointer-events-none absolute -top-40 -left-40 h-96 w-96 rounded-full bg-purple-100/50 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-purple-100/50 blur-3xl" />

            <div className="relative max-w-7xl mx-auto">
                {/* Header Section */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="text-center max-w-3xl mx-auto"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-50 border border-purple-200 text-[#774EFC] text-xs sm:text-sm font-extrabold tracking-wide uppercase mb-4 shadow-2xs">
                        <Sparkles className="w-4 h-4 text-[#774EFC]" />
                        <span>Peluang Bisnis B2B & Grosir</span>
                    </div>

                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-['MADE_Sunflower'] tracking-tight text-gray-900 leading-tight">
                        Peluang Kemitraan Distributor & Grosir{" "}
                        <span className="text-[#774EFC]">
                            TRI J
                        </span>
                    </h2>

                    <p className="mt-4 text-base sm:text-lg text-gray-600 leading-relaxed font-medium">
                        TRI J membuka kesempatan bagi pemilik toko perabotan, agen grosir, distributor, dan reseller untuk mendapatkan pasokan peralatan rumah tangga plastik berkualitas langsung dari pabrik tangan pertama.
                    </p>
                </motion.div>

                {/* 4 Cards Grid */}
                <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {benefits.map((item, idx) => {
                        const Icon = item.icon;
                        return (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, amount: 0.2 }}
                                transition={{ duration: 0.5, delay: idx * 0.1, ease: "easeOut" }}
                                className="group relative bg-white p-6 sm:p-7 rounded-3xl border border-gray-200 hover:border-[#774EFC] transition-all duration-300 flex flex-col justify-between shadow-xs hover:shadow-lg hover:-translate-y-1"
                            >
                                <div>
                                    <div className="flex items-center justify-between mb-5">
                                        <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-100 text-[#774EFC] flex items-center justify-center group-hover:scale-110 group-hover:bg-[#774EFC] group-hover:text-white transition-all duration-300">
                                            <Icon className="w-6 h-6" />
                                        </div>
                                        <span className="text-[11px] font-extrabold tracking-wider text-[#774EFC] bg-purple-50 border border-purple-200 px-2.5 py-1 rounded-full uppercase">
                                            {item.badge}
                                        </span>
                                    </div>

                                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-[#774EFC] transition-colors">
                                        {item.title}
                                    </h3>

                                    <p className="mt-2 text-sm text-gray-600 leading-relaxed font-medium">
                                        {item.description}
                                    </p>
                                </div>

                                <div className="mt-6 pt-4 border-t border-gray-100 flex items-center text-xs text-gray-500 font-semibold group-hover:text-[#774EFC] transition-colors">
                                    <span>Keunggulan B2B</span>
                                    <CheckCircle2 className="w-4 h-4 ml-auto text-[#774EFC]" />
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                {/* 4 Steps Process */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="mt-20 bg-gray-50/80 border border-gray-200 rounded-3xl p-8 sm:p-10 lg:p-12 shadow-2xs relative"
                >
                    <div className="text-center max-w-2xl mx-auto mb-10">
                        <h3 className="text-2xl sm:text-3xl font-['MADE_Sunflower'] text-gray-900">
                            4 Langkah Mudah Menjadi Mitra TRI J
                        </h3>
                        <p className="text-gray-600 text-sm sm:text-base mt-2 font-medium">
                            Proses kerja sama yang cepat, transparan, dan terstruktur untuk mendukung perkembangan bisnis perabotan Anda.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
                        {steps.map((step, idx) => (
                            <div
                                key={idx}
                                className="relative bg-white border border-gray-200 rounded-2xl p-6 hover:border-[#774EFC] transition-all shadow-2xs hover:shadow-md"
                            >
                                <div className="text-3xl font-black text-[#774EFC] mb-3 font-mono">
                                    {step.number}
                                </div>
                                <h4 className="text-base font-bold text-gray-900 mb-2">
                                    {step.title}
                                </h4>
                                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-medium">
                                    {step.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* CTA Card Section */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.96 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="mt-16 relative overflow-hidden bg-white border border-gray-200 rounded-3xl p-8 sm:p-12 text-center shadow-lg text-gray-900"
                >
                    <div className="relative z-10 max-w-3xl mx-auto">
                        <h3 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900 leading-tight">
                            Siap Mengembangkan Toko & Bisnis Grosir Anda?
                        </h3>
                        <p className="mt-4 text-gray-600 text-sm sm:text-base leading-relaxed font-medium">
                            Dapatkan penawaran harga grosir produk terbaru, katalog lengkap, serta konsultasi gratis bersama Sales Representative B2B TRI J sekarang.
                        </p>

                        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                            <a
                                href="https://wa.me/628961656039?text=Halo%20Sales%20Tri-J,%20saya%20tertarik%20tanya%20harga%20grosir"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full sm:w-auto bg-[#774EFC] hover:bg-[#6539E4] text-white font-extrabold py-4 px-8 rounded-full text-base sm:text-lg inline-flex items-center justify-center gap-3 transition-all duration-300 shadow-md hover:scale-[1.02]"
                            >
                                <MessageSquare className="w-5 h-5 fill-white" />
                                <span>Hubungi Sales Minta Harga Terbaik</span>
                                <ArrowRight className="w-5 h-5" />
                            </a>
                        </div>

                        <p className="mt-4 text-xs text-gray-500 font-medium">
                            * Respon cepat di jam kerja operasional (Senin - Sabtu)
                        </p>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}