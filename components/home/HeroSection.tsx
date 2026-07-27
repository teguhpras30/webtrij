"use client";

import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { useCallback, useEffect, useState } from "react";
import { heroSlides as initialHeroSlides } from "@/data/heroSlides";
import { AnimatePresence } from "framer-motion";

import HeroDots from "./HeroDots";
import HeroContent from "./HeroContent";

export default function HeroSection() {
  const [slides, setSlides] = useState(initialHeroSlides);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    async function fetchSlides() {
      try {
        const res = await fetch("/api/public/hero-slides");
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setSlides(data);
          }
        }
      } catch (err) {
        console.error("Failed to fetch public hero slides:", err);
      }
    }
    fetchSlides();
  }, []);

  useEffect(() => {
    setProgress(0);

    const duration = 5000;
    const interval = 50;

    const timer = setInterval(() => {
      setProgress((prev) => {
        const next = prev + (interval / duration) * 100;
        return next >= 100 ? 100 : next;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [selectedIndex]);

  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: true,
    },
    [
      Autoplay({
        delay: 5000,
        stopOnInteraction: false,
      }),
    ]
  );

  const scrollTo = useCallback(
    (index: number) => {
      emblaApi?.scrollTo(index);
    },
    [emblaApi]
  );

  useEffect(() => {
    if (!emblaApi) return;

    const onSelect = () => {
      setSelectedIndex(emblaApi.selectedScrollSnap());
    };

    onSelect();
    emblaApi.on("select", onSelect);

    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi]);

  const safeIndex = selectedIndex < slides.length ? selectedIndex : 0;
  const currentSlide = slides[safeIndex] || slides[0];

  return (
    <section className="relative h-screen overflow-hidden">
      {/* Carousel */}
      <div className="h-full overflow-hidden" ref={emblaRef}>
        <div className="flex h-full">
          {slides.map((slide) => (
            <div key={slide.id} className="relative min-w-full h-full">
              {/* Desktop */}
              <img
                src={slide.desktopImage}
                alt={slide.title}
                loading="eager"
                decoding="async"
                className="hidden w-full h-full object-cover lg:block"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    "https://placehold.co/1920x1080?text=Hero+Banner";
                }}
              />

              {/* Mobile */}
              <img
                src={slide.mobileImage}
                alt={slide.title}
                loading="eager"
                decoding="async"
                className="block w-full h-full object-cover lg:hidden"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    "https://placehold.co/800x1200?text=Hero+Banner";
                }}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="pointer-events-none absolute inset-0 z-10">
        <div className="absolute bottom-0 left-0 h-[60%] w-[80%] bg-gradient-to-tr from-[#F5F5F5] via-[#F5F5F5]/2 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-[#F5F5F5] to-transparent" />
      </div>

      {/* Content */}
      <div className="mt-2 absolute inset-0 z-20">
        <AnimatePresence mode="wait">
          <HeroContent
            key={safeIndex}
            title={currentSlide.title}
            description={currentSlide.description}
          />
        </AnimatePresence>

        <AnimatePresence mode="wait">
          <HeroDots
            key={safeIndex}
            total={slides.length}
            selectedIndex={safeIndex}
            progress={progress}
            scrollTo={scrollTo}
          />
        </AnimatePresence>
      </div>
    </section>
  );
}