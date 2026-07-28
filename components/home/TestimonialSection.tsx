"use client";

import { useState, useEffect } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { testimonials as initialTestimonials } from "@/data/testimoniMember";
import { motion } from "framer-motion";

interface TestimonialSectionProps {
  title?: string;
  subtitle?: string;
}

export default function TestimonialSection({
  title = "What Our Member Are Saying",
  subtitle = "Testimoni dari mitra terpercaya yang mengandalkan kualitas dan layanan kami secara berkelanjutan.",
}: TestimonialSectionProps) {
  const [list, setList] = useState(initialTestimonials);

  useEffect(() => {
    async function fetchTestimonials() {
      try {
        const res = await fetch("/api/public/testimonials");
        if (res.ok) {
          const data = await res.json();
          if (data && Array.isArray(data.member) && data.member.length > 0) {
            setList(data.member);
          }
        }
      } catch (err) {
        console.error("Failed to fetch public testimonials:", err);
      }
    }
    fetchTestimonials();
  }, []);

  const [emblaRef] = useEmblaCarousel(
    {
      loop: true,
      align: "start",
    },
    [
      Autoplay({
        delay: 4000,
        stopOnInteraction: false,
      }),
    ]
  );

  return (
    <section className="bg-[#F2F4F5] py-24">
      <div className="mx-auto max-w-[1300px] px-5 sm:px-6 md:px-10 lg:px-12 xl:px-20">
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          {/* Header */}
          <div className="text-center">
            <h2 className="font-['MADE_Sunflower'] text-4xl leading-tight text-[#1D1D1F] sm:text-5xl xl:text-[56px]">
              {title}
            </h2>

            <p className="mx-auto mt-5 max-w-[650px] text-[18px] text-[#666]">
              {subtitle}
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          {/* Slider */}
          <div
            className="mt-16 -mx-5 sm:-mx-6 md:-mx-10 lg:-mx-12 xl:-mx-20 overflow-hidden px-5 sm:px-6 md:px-10 lg:px-12 xl:px-20 py-4"
            ref={emblaRef}
          >
            <div className="flex -ml-6">
              {list.map((item: any, index: number) => (
                <div key={index} className="flex-none pl-6">
                  <div className="flex w-[290px] sm:w-[340px] lg:w-[360px] xl:w-[380px] h-[300px] flex-col justify-between rounded-[30px] bg-white p-6 sm:p-8 border border-gray-100/80 shadow-md transition-shadow hover:shadow-lg">
                    {/* Quote */}
                    <div>
                      <img src="/petik.svg" alt="Quote" width="48" height="48" />
                      <p className="mt-5 text-[15px] sm:text-[17px] leading-[1.6] text-[#1D1D1F] line-clamp-4">
                        {item.message || item.review}
                      </p>
                    </div>

                    {/* User */}
                    <div className="flex items-center gap-4">
                      {item.avatar ? (
                        <img
                          src={item.avatar}
                          alt={item.name}
                          className="h-12 w-12 rounded-full object-cover border border-gray-200 shrink-0 shadow-sm"
                        />
                      ) : (
                        <div className="h-12 w-12 rounded-full bg-[#6B5F5F] text-white flex items-center justify-center font-bold text-lg uppercase shrink-0">
                          {item.name?.[0] || "M"}
                        </div>
                      )}
                      <div className="min-w-0">
                        <h4 className="truncate text-[20px] sm:text-[22px] font-semibold text-[#1D1D1F]">
                          {item.name}
                        </h4>
                        <p className="truncate text-xs sm:text-sm text-[#A3A3A3]">
                          {item.role || "Mitra TRI J"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
