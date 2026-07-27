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
            initial={{
                opacity: 0,
                y: 60,
            }}
            animate={{
                opacity: 1,
                y: 0,
            }}
            exit={{
                opacity: 0,
                y: 60,
            }}
            transition={{
                duration: 0.6,
                ease: "easeOut",
            }}
            className="
                absolute
               
                top-[76%]
                lg:top-[63%]
                xl:top-[65%]
                -translate-y-1/2

                left-8
                lg:left-16
                xl:left-24
            "
        >
            <div className="max-w-xl lg:max-w-[520px] xl:max-w-xl">
                <div className="flex max-w-[400px] xl:max-w-[500] items-end">
                    <h1
                        className="font-['MADE_Sunflower'] leading-tight text-[#1D1D1F] text-4xl lg:text-6xl xl:text-7xl"
                        style={{
                            textShadow: "0 0 2px white, 0 0 90px white, 0 0 100px white",
                        }}
                    >
                        {title}
                    </h1>
                </div>


                <p className="mt-4 text-lg leading-8 text-[#1D1D1F]">
                    {description}
                </p>

                <div className="mt-4 flex gap-4">
                    <Link
                        href="/products"
                        className="rounded-[20px] bg-[#774EFC] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#774EFC]/80"
                    >
                        Explore Products
                    </Link>

                    <Link
                        href="/contact-us"
                        className="rounded-[20] border border-#1D1D1F px-5 py-3 font-semibold text-#1D1D1F"
                    >
                        Contact Us
                    </Link>
                </div>
            </div>
        </motion.div>
    );
}
