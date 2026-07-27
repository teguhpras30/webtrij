"use client";
import Image from "next/image";
import { motion } from "framer-motion";

export default function AboutContent() {
    return (
        <>
            {/* Our Story */}
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
                <section className="py-12 md:py-16 lg:py-20">
                    <div className="mx-auto grid max-w-[1440px] grid-cols-1 items-center gap-10 px-5 sm:px-6 md:px-10 lg:grid-cols-2 lg:items-start lg:gap-10 lg:px-12 xl:gap-20 xl:px-20">
                        {/* Left */}
                        <div className="max-w-xl">
                            <h2 className="font-['MADE_Sunflower'] text-3xl leading-tight text-[#1D1D1F] sm:text-4xl lg:text-5xl xl:text-6xl">
                                Our Story
                            </h2>

                            <div className="mt-5 space-y-4 text-sm leading-7 text-[#4A4A4A] md:text-base md:leading-8 lg:text-[15px] lg:leading-7 xl:text-base">
                                <p>
                                    Kami memulai sebagai importir peralatan rumah tangga untuk memenuhi kebutuhan pasar dengan produk yang kompetitif.
                                </p>

                                <p>
                                    Seiring berkembangnya bisnis, kami membangun fasilitas produksi sendiri guna menghadirkan kualitas yang lebih terkontrol, pasokan yang stabil, dan proses yang lebih efisien.
                                </p>

                                <p>
                                    Kini, kami hadir sebagai produsen sekaligus mitra bisnis yang siap memberikan solusi andal dan berkelanjutan.
                                </p>

                                <p>
                                    Dari importir menjadi produsen, kami membangun kendali untuk hasil yang lebih pasti.
                                </p>


                            </div>
                        </div>

                        {/* Right */}
                        <div
                            className="
                            group
                            relative
                            mx-auto
                            h-[260px]
                            w-full
                            overflow-hidden
                            rounded-[28px]

                            sm:h-[360px]

                            lg:mx-0
                            lg:h-[460px]
                        "
                        >
                            <Image
                                src="/images/aboutus/image.png"
                                alt="Factory"
                                fill
                                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 520px, 580px"
                                className="object-cover transition duration-700 group-hover:scale-110"
                            />
                        </div>
                    </div>
                </section>
            </motion.div>

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
                {/* What We Do */}
                <section className="bg-[#F2F4F5] py-12 md:py-16 lg:py-20">
                    <div className="mx-auto grid max-w-[1440px] grid-cols-1 items-center gap-10 px-5 sm:px-6 md:px-10 lg:grid-cols-2 lg:items-start lg:gap-10 lg:px-12 xl:gap-20 xl:px-20">
                        {/* Image */}
                        <div
                            className="
                            group
                            relative
                            mx-auto
                            h-[260px]
                            w-full
                            overflow-hidden
                            rounded-[28px]

                            sm:h-[360px]

                            lg:mx-0
                            lg:h-[460px]
                        "
                        >
                            <Image
                                src="/images/aboutus/gudang.png"
                                alt="Warehouse"
                                fill
                                className="object-cover transition duration-700 group-hover:scale-110"
                            />
                        </div>

                        {/* Text */}
                        <div className="order-1 max-w-xl lg:order-2">
                            <h2 className="font-['MADE_Sunflower'] text-3xl leading-tight text-[#1D1D1F] sm:text-4xl lg:text-5xl xl:text-6xl">
                                What We Do
                            </h2>

                            <div className="mt-5 space-y-4 text-sm leading-7 text-[#4A4A4A] md:text-base md:leading-8 lg:text-[15px] lg:leading-7 xl:text-base">
                                <p>
                                    Kami menyediakan peralatan rumah tangga berbahan plastik dengan
                                    fokus pada kualitas, konsistensi, dan efisiensi.
                                </p>

                                <p>
                                    Setiap produk dirancang oleh designer tersertifikasi, menggabungkan
                                    fungsi yang tepat dengan pemahaman kebutuhan pasar.
                                </p>

                                <p>
                                    Kami membuka peluang kerja sama bagi distributor yang
                                    ingin berkembang bersama, dengan dukungan produk yang
                                    siap dipasarkan, kualitas stabil, dan pasokan yang terjaga.
                                </p>

                                <p>
                                    Komitmen kami terhadap kualitas didukung oleh sertifikasi
                                    ISO dari TÜV NORD, SNI, K3 Kementerian Ketenagakerjaan, dan
                                    K3L untuk produk elektronika. Selain itu, produk yang
                                    bersentuhan langsung dengan makanan diproduksi menggunakan
                                    material berstandar Food Grade, sehingga aman digunakan
                                    dalam aktivitas sehari-hari.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>
            </motion.div>
        </>
    );
}
