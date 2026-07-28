"use client";

import Image from "next/image";
import { motion } from "framer-motion";

export default function ShowcaseSection() {
    return (
        <section className="py-16 md:py-24">
            <div className="mx-auto max-w-7xl px-5 md:px-10 lg:px-20">

                <motion.div
                    initial={{
                        opacity: 0,
                        y: 80,
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
                        duration: 1,
                        ease: "easeOut",
                    }}
                >
                    {/* Why Choose Us */}
                    <div className="relative z-10 flex flex-col gap-10 xl:flex-row xl:items-end xl:justify-between">
                        <div className="max-w-xl text-center xl:text-left xl:max-w-xl mx-auto xl:mx-0">
                            <h2
                                className="text-4xl lg:text-6xl text-[#1D1D1F]"
                                style={{ fontFamily: "MADE Sunflower" }}
                            >
                                Why Choose Us
                            </h2>

                            <p className="mt-6 text-lg leading-8 text-[#333]">
                                Didukung sertifikasi ISO dari TUV NORD, SNI, K3
                                Kemenaker, K3L produk elektronika, serta standar Food
                                Grade untuk produk yang bersentuhan langsung dengan
                                makanan, kami siap menjadi mitra terpercaya bagi
                                distributor dan pelaku bisnis.
                            </p>
                        </div>

                        {/* Certification */}
                        <div className="flex flex-wrap items-center justify-center gap-5 xl:justify-end">
                            <Image
                                src="/images/aboutus/iso hitam.svg"
                                alt="ISO"
                                width={50}
                                height={50}
                                className="h-16 w-auto transition duration-300 hover:scale-110"
                            />
                            <Image
                                src="/images/aboutus/k3 hitam.svg"
                                alt="K3"
                                width={50}
                                height={50}
                                className="h-16 w-auto transition duration-300 hover:scale-110"
                            />
                            <Image
                                src="/images/aboutus/sni hitam.svg"
                                alt="SNI"
                                width={50}
                                height={50}
                                className="h-16 w-auto transition duration-300 hover:scale-110"
                            />
                            <Image
                                src="/images/aboutus/K3L hitam.png"
                                alt="K3L"
                                width={50}
                                height={50}
                                className="h-16 w-auto transition duration-300 hover:scale-110"
                            />
                            <Image
                                src="/images/aboutus/FoodGrade hitam.png"
                                alt="Food Grade"
                                width={50}
                                height={50}
                                className="h-16 w-auto transition duration-300 hover:scale-110"
                            />
                            <Image
                                src="/images/aboutus/bbi hitam.png"
                                alt="Bangga Indonesia"
                                width={50}
                                height={50}
                                className="h-16 w-auto transition duration-300 hover:scale-110"
                            />
                        </div>
                    </div>
                </motion.div>

                {/* Hand Image shifted left on laptop screens */}
                <motion.div
                    initial={{
                        opacity: 0,
                        y: 80,
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
                        duration: 1,
                        ease: "easeOut",
                    }}
                    className="
                        relative
                        left-1/2
                        w-screen
                        -translate-x-1/2
                        overflow-hidden
                    "
                >
                    <Image
                        src="/images/home/hand2.png"
                        alt="Hand"
                        width={1800}
                        height={900}
                        className="
                        w-[180%]
                        max-w-none
                        -translate-x-1/2

                        sm:w-[160%]
                        sm:-translate-x-[38%]

                        lg:w-[145%]
                        lg:-translate-x-[36%]

                        xl:w-full
                        xl:translate-x-0

                        object-contain
                        "
                        priority
                    />
                </motion.div>

                <motion.div
                    initial={{
                        opacity: 0,
                        y: 80,
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
                        duration: 1,
                        ease: "easeOut",
                    }}
                >
                    {/* Section 2 */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
                        {/* Desktop: Text kiri */}
                        <div className="order-2 lg:order-1">
                            <h2
                                className="
                                text-3xl
                                md:text-4xl
                                lg:text-5xl
                                text-gray-800
                        "
                                style={{ fontFamily: "MADE Sunflower" }}
                            >
                                Style for Every Home
                            </h2>

                            <p
                                className="
                                mt-6
                                text-base
                                md:text-lg
                                leading-7
                                md:leading-8
                                text-gray-700
                            "
                            >
                                Peralatan rumah tangga kami dibuat untuk tahan lama, ringan,
                                dan mudah digunakan. Solusi praktis untuk kebutuhan rumah
                                tangga modern—tanpa ribet, tanpa mahal.
                            </p>
                        </div>

                        {/* Desktop: Image kanan */}
                        <div
                            className="
                            order-1
                            lg:order-2
                            group
                            overflow-hidden
                            rounded-[32px]
                            h-[260px]
                            sm:h-[350px]
                            lg:h-[420px]
                            "
                        >
                            <Image
                                src="/images/home/Showcase Image2.jpg"
                                alt="Style for Every Home"
                                width={700}
                                height={500}
                                className="
                                h-full
                                w-full
                                object-cover
                                transition-transform
                                duration-700
                                group-hover:scale-110
                              "
                            />
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
