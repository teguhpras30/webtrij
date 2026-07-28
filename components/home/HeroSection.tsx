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

  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: true,
      align: "start",
      skipSnaps: false,
      duration: 25,
    },
    [
      Autoplay({
        delay: 5000,
        stopOnInteraction: false,
        stopOnMouseEnter: true,
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
    <section className="relative h-screen overflow-hidden bg-[#F5F5F5]">
      {/* Carousel Container with GPU hardware acceleration */}
      <div className="h-full overflow-hidden touch-pan-y" ref={emblaRef}>
        <div className="flex h-full will-change-transform">
          {slides.map((slide) => (
            <div key={slide.id} className="relative min-w-full h-full flex-none">
              {/* Picture tag for single-image responsive decoding on mobile */}
              <picture className="w-full h-full block">
                <source media="(min-width: 1024px)" srcSet={slide.desktopImage} />
                <img
                  src={slide.mobileImage || slide.desktopImage}
                  alt={slide.title}
                  loading="eager"
                  decoding="async"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "https://placehold.co/800x1200?text=Hero+Banner";
                  }}
                />
              </picture>
            </div>
          ))}
        </div>
      </div>

      {/* Gradient Overlays */}
      <div className="pointer-events-none absolute inset-0 z-10">
        <div className="absolute bottom-0 left-0 h-[60%] w-[80%] bg-gradient-to-tr from-[#F5F5F5] via-[#F5F5F5]/2 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-[#F5F5F5] to-transparent" />
      </div>

      {/* Content */}
      <div className="mt-2 absolute inset-0 z-20 pointer-events-none">
        <div className="pointer-events-auto">
          <AnimatePresence mode="wait">
            <HeroContent
              key={safeIndex}
              title={currentSlide.title}
              description={currentSlide.description}
            />
          </AnimatePresence>
        </div>

        <div className="pointer-events-auto">
          <HeroDots
            key={safeIndex}
            total={slides.length}
            selectedIndex={safeIndex}
            scrollTo={scrollTo}
          />
        </div>
      </div>
    </section>
  );
}