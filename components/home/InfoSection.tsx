"use client";
import Image from "next/image";
import { motion } from "framer-motion";

const features = [
    {
        icon: "/konsisten.svg",
        iconWhite: "/konsisten white.svg",

        title: "Kualitas Konsisten",
        description:
            "Setiap produk melalui proses kontrol kualitas yang terstandarisasi untuk memastikan hasil yang stabil dan siap dipasarkan.",
    },
    {
        icon: "/pasokan.svg",
        iconWhite: "/pasokan white2.svg",
        title: "Pasokan Stabil",
        description:
            "Didukung sistem produksi dan distribusi yang terorganisir untuk menjaga ketersediaan produk secara berkelanjutan.",
    },
    {
        icon: "/Fungsional.svg",
        iconWhite: "Fungsional white.svg",
        title: "Desain Fungsional",
        description:
            "Dirancang dengan fokus pada fungsi, ketahanan, efisiensi, dan kebutuhan pasar modern.",
    },
];

export default function InfoSection() {
    return (
        <section className="bg-[#F5F5F5] py-16 md:py-24 px-5 md:px-10 lg:px-20">
            <div className="max-w-7xl mx-auto">
                <motion.div
                    initial={{
                        opacity: 0,
                        y: 60,
                    }}
                    whileInView={{
                        opacity: 1,
                        y: 0,
                    }}
                    viewport={{
                        once: true,
                        amount: 0.3,
                    }}
                    transition={{
                        duration: 0.6,
                        ease: "easeOut",
                    }}
                >
                    {/* Heading */}
                    <h2
                        className="
                        mx-auto
                        max-w-3xl
                        text-center
                        text-3xl
                        sm:text-4xl
                        lg:text-5xl
                        font-semibold
                        leading-tight
                        text-gray-800
                    "
                        style={{ fontFamily: "MADE Sunflower" }}
                    >
                        Modern Home Appliance
                        <br />
                        For Everyday Living
                    </h2>

                    <p
                        className="
                        mx-auto
                        mt-6
                        max-w-2xl
                        text-center
                        text-base
                        md:text-lg
                        leading-7
                        text-gray-600
                    "
                    >
                        Produk berkualitas, harga bersahabat. Peralatan kami dibuat untuk
                        tahan lama, ringan, dan mudah digunakan. Solusi praktis untuk
                        kebutuhan rumah tangga modern—tanpa ribet, tanpa mahal.
                    </p>
                </motion.div>
                {/* Feature Cards */}
                <motion.div
                    initial={{
                        opacity: 0,
                        y: 60,
                    }}
                    whileInView={{
                        opacity: 1,
                        y: 0,
                    }}
                    viewport={{
                        once: true,
                        amount: 0.3,
                    }}
                    transition={{
                        duration: 0.6,
                        ease: "easeOut",
                    }}
                >
                    <div className="mt-14 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                        {features.map((feature, index) => (
                            <div
                                key={index}
                                className="
                    group
                    rounded-[32px]
                    bg-white
                    px-8
                    py-10
                    text-center
                    flex
                    flex-col
                    items-center
                    transition-all
                    duration-300
                    hover:-translate-y-3
                    hover:bg-[#774EFC]
                "
                            >
                                {/* Icon Ungu */}
                                <Image
                                    src={feature.icon}
                                    alt={feature.title}
                                    width={70}
                                    height={70}
                                    className="
                        absolute
                        opacity-100
                        transition-opacity
                        duration-300
                        group-hover:opacity-0
                    "
                                />

                                {/* Icon Putih */}
                                <Image
                                    src={feature.iconWhite}
                                    alt={feature.title}
                                    width={70}
                                    height={70}
                                    className="
                        opacity-0
                        transition-opacity
                        duration-300
                        group-hover:opacity-100
                    "
                                />

                                <h3
                                    className="
                        mt-6
                        text-xl
                        md:text-2xl
                        text-gray-800
                        transition-colors
                        duration-300
                        group-hover:text-white
                    "
                                    style={{ fontFamily: "MADE Sunflower" }}
                                >
                                    {feature.title}
                                </h3>

                                <p
                                    className="
                        mt-4
                        text-sm
                        md:text-base
                        leading-7
                        text-gray-600
                        transition-colors
                        duration-300
                        group-hover:text-white/90
                    "
                                >
                                    {feature.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </section>
    );
}