"use client";
import MarketplaceTestimonialCard from "@/components/aboutUs/MarketplaceTestimonialCard";
import testimonialMarketplace from "@/data/testimonialMarketplace";

import { motion } from "framer-motion";

const row1 = [...testimonialMarketplace, ...testimonialMarketplace];
const row2 = [...testimonialMarketplace, ...testimonialMarketplace];

export default function MarketplaceTestimonial() {
    return (
        <section className="py-16 md:py-24 overflow-hidden">


            {/* Heading */}
            <div className="text-center">
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
                    <h2
                        className="font-['MADE_Sunflower'] text-3xl md:text-5xl lg:text-6xl text-[#1D1D1F]">
                        What Our Customer are Saying in Market Place
                    </h2>

                    <p className="mx-auto mt-5 max-w-2xl text-gray-600 leading-7">
                        Home appliance plastik kami dibuat untuk tahan lama,
                        ringan, dan mudah digunakan. Solusi praktis untuk
                        kebutuhan rumah tangga modern.
                    </p>
                </motion.div>
            </div>

            {/* Cards */}
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
                <div className="mt-14 overflow-hidden">
                    <div className="flex w-max gap-8 animate-marquee-left">

                        {row1.map((item, index) => (
                            <MarketplaceTestimonialCard
                                key={`row1-${index}`}
                                testimonial={item}
                            />
                        ))}

                    </div>
                </div>

                <div className="mt-8 overflow-hidden">
                    <div className="flex w-max gap-8 animate-marquee-right">

                        {row2.map((item, index) => (
                            <MarketplaceTestimonialCard
                                key={`row2-${index}`}
                                testimonial={item}
                            />
                        ))}

                    </div>
                </div>
            </motion.div>

        </section>
    );
}