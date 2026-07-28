"use client";

import { motion } from "framer-motion";

interface HeroDotsProps {
    total: number;
    selectedIndex: number;
    progress?: number;
    scrollTo: (index: number) => void;
}

export default function HeroDots({
    total,
    selectedIndex,
    scrollTo,
}: HeroDotsProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="absolute bottom-10 sm:bottom-8 lg:bottom-auto lg:top-[92%] z-20 flex items-center gap-2 left-5 sm:left-8 lg:left-16 xl:left-24"
        >
            {Array.from({ length: total }).map((_, index) => {
                const isActive = selectedIndex === index;
                return (
                    <button
                        key={index}
                        onClick={() => scrollTo(index)}
                        className={`relative overflow-hidden rounded-full transition-all duration-300 cursor-pointer ${isActive ? "h-1.5 w-14 sm:w-20 bg-black/30" : "h-1.5 w-1.5 bg-black/30"
                            }`}
                        aria-label={`Go to slide ${index + 1}`}
                    >
                        {isActive && (
                            <div
                                key={`progress-${index}`}
                                className="absolute left-0 top-0 h-full bg-[#774EFC] rounded-full animate-progress"
                                style={{
                                    animation: "heroProgress 5s linear forwards",
                                }}
                            />
                        )}
                    </button>
                );
            })}

            <style jsx>{`
                @keyframes heroProgress {
                    from { width: 0%; }
                    to { width: 100%; }
                }
            `}</style>
        </motion.div>
    );
}