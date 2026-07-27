import { motion } from "framer-motion";

interface HeroDotsProps {
    total: number;
    selectedIndex: number;
    progress: number;
    scrollTo: (index: number) => void;
}

export default function HeroDots({
    total,
    selectedIndex,
    progress,
    scrollTo,
}: HeroDotsProps) {
    return (
        <motion.div
            initial={{
                opacity: 0,
                y: 40,
            }}
            animate={{
                opacity: 1,
                y: 0,
            }}
            exit={{
                opacity: 0,
                y: 40,
            }}
            transition={{
                duration: 0.6,
                ease: "easeOut",
            }}
            className="
                absolute
                
                top-[92%]
                z-20
                flex
                items-center
                gap-2

                left-8
                lg:left-16
                xl:left-24
            "
        >
            {Array.from({ length: total }).map((_, index) => (
                <button
                    key={index}
                    onClick={() => scrollTo(index)}
                    className={`relative overflow-hidden rounded-full transition-all duration-300 ${selectedIndex === index
                        ? "h-1.5 w-20 bg-black/60"
                        : "h-1.5 w-1.5 bg-black/60"
                        }`}
                >
                    {selectedIndex === index && (
                        <div
                            className="absolute left-0 top-0 h-full bg-[#774EFC]"
                            style={{
                                width: `${progress}%`,
                            }}
                        />
                    )}
                </button>
            ))}
        </motion.div>
    );
}