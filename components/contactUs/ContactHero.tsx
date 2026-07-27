"use client";

import ContactForm from "./ContactForm";
import { motion } from "framer-motion";
import Image from "next/image";



export default function ContactHero() {
    return (
        <section className="pt-28 pb-16 md:pt-36 md:pb-20 lg:pt-40 lg:pb-24">
            <div className="mx-auto flex max-w-[1440px] flex-col gap-12 px-5 md:px-10 lg:flex-row lg:items-start lg:justify-between lg:gap-12 lg:px-12 xl:gap-24 xl:px-20">
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

                    {/* Left */}
                    <div className="max-w-[470px]">

                        <span className="inline-block rounded-full bg-white px-5 py-2 text-sm font-medium text-[#774EFC] md:px-6 md:py-3 md:text-base">
                            Contact us
                        </span>

                        <h1 className="mt-8 font-['MADE_Sunflower'] text-[42px] leading-tight text-[#1D1D1F] sm:text-[56px] lg:text-[48px] xl:text-[72px]">

                            Get in

                            <span className="mx-4 hidden h-[2px] w-[90px] bg-gray-400 align-middle sm:inline-block lg:mx-8 lg:w-[170px]" />

                            <br />

                            touch with us

                        </h1>

                        <p className="mt-6 text-base leading-8 text-[#555] lg:text-[16px]">
                            Kami siap membantu! Jika Anda memiliki pertanyaan
                            tentang produk kami, membutuhkan bantuan memilih
                            peralatan rumah tangga yang sesuai, atau memerlukan
                            bantuan terkait pesanan, tim kami siap melayani Anda.
                        </p>

                        {/* Email */}
                        <div className="mt-10">
                            <p className="text-gray-500">
                                Email:
                            </p>

                            <h3 className="break-all text-2xl font-bold sm:text-3xl lg:text-[32px] xl:text-[42px]">
                                sales@trij.com
                            </h3>
                        </div>

                        {/* Phone */}
                        <div className="mt-8">
                            <p className="text-gray-500">
                                Phone or Whatsapp:
                            </p>

                            <h3 className="text-2xl font-bold sm:text-3xl lg:text-[32px] xl:text-[42px]">
                                <a
                                    href="https://wa.me/628113300223"
                                    target="_blank"
                                    rel="noreferrer"
                                    aria-label="Chat WhatsApp di +62 811-3300-223"
                                    className="group inline-flex items-center gap-3 transition-colors hover:text-[#25D366]"
                                >
                                    <span className="relative h-9 w-9 shrink-0 sm:h-10 sm:w-10 lg:h-12 lg:w-12">
                                        <Image
                                            src="/wa.svg"
                                            alt=""
                                            fill
                                            aria-hidden="true"
                                            className="transition-opacity group-hover:opacity-0"
                                        />
                                        <Image
                                            src="/wagreen.svg"
                                            alt=""
                                            fill
                                            aria-hidden="true"
                                            className="opacity-0 transition-opacity group-hover:opacity-100"
                                        />
                                    </span>
                                    0811 3300 223
                                </a>
                            </h3>
                        </div>

                    </div>
                </motion.div>

                {/* Right */}
                <div className="w-full lg:max-w-[480px] xl:max-w-[620px]">
                    <ContactForm />
                </div>

            </div>

            <div className="mt-20">
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
                </motion.div>
            </div>

        </section>

    );
}
