"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";


export default function AboutHero() {
    return (
        <section className="relative overflow-hidden pt-24 pb-16 md:pt-28 lg:pt-20 xl:pt-25 xl:pb-20">
            <motion.div
                initial={{ opacity: 0, y: 60 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
            >
                <div className="mx-auto max-w-[1440px] px-5 sm:px-6 md:px-10 lg:px-12 xl:px-20">
                    <div
                        className="
                            grid
                            grid-cols-1
                            lg:grid-cols-2
                            items-center

                            gap-14
                            lg:gap-10
                            xl:gap-10
                        "
                    >
                        {/* LEFT */}

                        <div className="text-center lg:text-left">
                            <h1
                                className="
                                    font-['MADE_Sunflower']
                                    leading-[1.08]
                                    text-[#1D1D1F]

                                    text-4xl
                                    sm:text-5xl
                                    md:text-6xl
                                    lg:text-[52px]
                                    xl:text-[64px]
                                    2xl:text-[72px]
                                "
                            >
                                Penyedia
                                <br />
                                Home Appliance
                                <br />
                                Dengan Bahan
                                <br />

                                <span className="text-[#774EFC]">
                                    Berkualitas dan
                                </span>

                                <br />

                                <span className="text-[#774EFC]">
                                    Tangguh
                                </span>
                            </h1>

                            <p
                                className="
                                    mx-auto
                                    mt-6
                                    max-w-[540px]

                                    text-base
                                    leading-7
                                    text-[#666]

                                    lg:mx-0
                                    lg:mt-8
                                    lg:text-[17px]
                                "
                            >
                                Solusi tepat untuk kebutuhan bisnis Anda
                                dengan kualitas konsisten, pasokan stabil,
                                dan efisiensi yang terjaga.
                            </p>

                            <Link
                                href="/contact-us"
                                className="
                                    mt-8
                                    inline-flex
                                    h-14
                                    items-center
                                    justify-center
                                    rounded-2xl
                                    bg-[#774EFC]
                                    px-10
                                    font-semibold
                                    text-white
                                    transition
                                    hover:opacity-90
                                "
                            >
                                Contact us
                            </Link>
                        </div>

                        {/* RIGHT */}

                        <div
                            className="
                                group
                                relative
                                mx-auto

                                lg:-translate-x-10
                                xl:-translate-x-16
                                2xl:-translate-x-20

                                w-full
                                max-w-[380px]
                                aspect-square

                                sm:w-[420px]
                                sm:max-w-none

                                md:w-[500px]

                                lg:w-[520px]

                                xl:w-[800px]
                            "
                        >


                            {/* Circle Besar */}

                            <div
                                className="
                                    absolute
                                    left-1/2
                                    top-1/2
                                    -translate-x-1/2
                                    -translate-y-1/2

                                    rounded-full
                                    border-2
                                    border-[#FFD84D]

                                    w-[280px]
                                    h-[280px]

                                    sm:w-[360px]
                                    sm:h-[360px]

                                    md:w-[420px]
                                    md:h-[420px]

                                    lg:w-[460px]
                                    lg:h-[460px]

                                    xl:w-[520px]
                                    xl:h-[520px]
                                "
                            />

                            {/* Circle Kecil */}

                            <div
                                className="
                                    absolute
                                    left-1/2
                                    top-1/2
                                    -translate-x-1/2
                                    -translate-y-1/2

                                    rounded-full
                                    border
                                    border-[#FFD84D]

                                    w-[260px]
                                    h-[220px]

                                    sm:w-[300px]
                                    sm:h-[300px]

                                    md:w-[360px]
                                    md:h-[360px]

                                    lg:w-[410px]
                                    lg:h-[410px]

                                    xl:w-[470px]
                                    xl:h-[470px]
                                "
                            />

                            {/* Yellow Shape */}

                            <div
                                className="
                                    absolute
                                    left-1/2
                                    top-1/2
                                    -translate-x-1/2
                                    -translate-y-1/2

                                    rounded-full
                                    bg-[#FFD54A]

                                    w-[220px]
                                    aspect-square

                                    sm:w-[260px]

                                    md:w-[300px]

                                    lg:w-[360px]

                                    xl:w-[430px]
                                "
                            />

                            {/* Product */}

                            <motion.div
                                animate={{ y: [0, -15, 0] }}
                                transition={{
                                    repeat: Infinity,
                                    duration: 4,
                                    ease: "easeInOut"
                                }}
                                className="
                                    absolute
                                    bottom-8
                                    left-1/2
                                    z-20
                                    w-[115%]
                                    -translate-x-1/2
                                    sm:w-full
                                    xl:w-[100%]
                                "
                            >
                                <Image
                                    src="/images/aboutus/RiceBucket1_hp.png"
                                    alt="Rice Bucket"
                                    width={900}
                                    height={900}
                                    className="
                                        h-auto
                                        w-200
                                        sm:hidden
                                        transition duration-500 group-hover:scale-105
                                    "
                                />

                                <Image
                                    src="/images/aboutus/RiceBucket1.png"
                                    alt="Rice Bucket"
                                    width={1000}
                                    height={1000}
                                    preload
                                    className="
                                        hidden
                                        h-auto
                                        w-full
                                        sm:block
                                        transition duration-500 group-hover:scale-105
                                    "
                                />
                            </motion.div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </section>
    );
}
