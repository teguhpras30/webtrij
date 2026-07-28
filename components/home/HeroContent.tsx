import Link from "next/link";
import { motion } from "framer-motion";

interface HeroContentProps {
    title: string;
    description: string;
}

export default function HeroContent({
    title,
    description,
}: HeroContentProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="absolute bottom-20 sm:bottom-24 lg:bottom-auto lg:top-[63%] lg:-translate-y-1/2 left-5 sm:left-8 lg:left-16 xl:left-24 right-5 sm:right-auto"
        >
            <div className="max-w-xl lg:max-w-[520px] xl:max-w-xl">
                <div className="flex max-w-[400px] xl:max-w-[500px] items-end">
                    <h1
                        className="font-['MADE_Sunflower'] leading-tight text-[#1D1D1F] text-3xl sm:text-4xl lg:text-6xl xl:text-7xl drop-shadow-sm"
                        style={{
                            textShadow: "0 0 2px white, 0 0 40px rgba(255,255,255,0.9)",
                        }}
                    >
                        {title}
                    </h1>
                </div>

                <p className="mt-2.5 sm:mt-3 text-xs sm:text-base lg:text-lg leading-relaxed text-[#1D1D1F] font-medium max-w-md lg:max-w-none">
                    {description}
                </p>

                <div className="mt-4 sm:mt-5 flex flex-wrap gap-2.5 sm:gap-4">
                    <Link
                        href="/products"
                        className="rounded-[20px] bg-[#774EFC] px-4 py-2.5 sm:px-5 sm:py-3 text-xs sm:text-sm font-semibold text-white transition hover:bg-[#6539E4] shadow-md shadow-[#774EFC]/25"
                    >
                        Explore Products
                    </Link>

                    <Link
                        href="/contact-us"
                        className="rounded-[20px] border border-[#1D1D1F] px-4 py-2.5 sm:px-5 sm:py-3 text-xs sm:text-sm font-semibold text-[#1D1D1F] transition hover:bg-[#1D1D1F] hover:text-white"
                    >
                        Contact Us
                    </Link>
                </div>
            </div>
        </motion.div>
    );
}
