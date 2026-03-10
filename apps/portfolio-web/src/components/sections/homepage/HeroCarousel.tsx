// RUTA: apps/portfolio-web/src/components/sections/homepage/HeroCarousel.tsx

/**
 * @file HeroCarousel.tsx
 * @version 5.0 - Performance & LCP Optimized
 * @description Carrusel de alta conversión con carga diferida de medios.
 *              Prioriza la carga del primer slide para métricas Core Web Vitals (LCP).
 * @author Raz Podestá - MetaShark Tech
 */

'use client';

import React, { useState, useCallback, useRef } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Fade from 'embla-carousel-fade';
import Autoplay from 'embla-carousel-autoplay';
import { motion } from 'framer-motion';
import { Volume2, VolumeX, ArrowRight, Play } from 'lucide-react';
import Image from 'next/image';
import NextLink from 'next/link';
import { cn } from '../../lib/utils/cn';
import type { Dictionary } from '../../lib/schemas/dictionary.schema';

const SLIDE_SETTINGS = [
  {
    id: 'luxury-suite',
    titleKey: 'SUITES_TITLE' as const,
    subtitleKey: 'SUITES_SUBTITLE' as const,
    priceKey: 'price_info',
    videoUrl: "https://cdn.pixabay.com/video/2021/09/01/87113-596486047_large.mp4",
    posterUrl: "/images/hotel/suite-luxury-poster.jpg",
    ctaLink: "/#suites"
  },
  {
    id: 'pride-festival',
    titleKey: 'FESTIVAL_TITLE' as const,
    subtitleKey: 'FESTIVAL_SUBTITLE' as const,
    priceKey: 'ticket_info',
    videoUrl: "https://cdn.pixabay.com/video/2023/10/24/186358-877995180_large.mp4",
    posterUrl: "/images/festival/pride-poster.jpg",
    ctaLink: "/festival"
  }
];

export function HeroCarousel({ dictionary }: { dictionary: Dictionary['homepage']['hero'] }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [Fade(), Autoplay({ delay: 9000 })]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  React.useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on('select', onSelect);
  }, [emblaApi, onSelect]);

  return (
    <section className="relative h-screen w-full bg-[#050505] overflow-hidden">
      {/* Audio Control */}
      <button
        onClick={() => setIsMuted(!isMuted)}
        className="absolute top-28 right-6 z-50 rounded-full border border-white/10 bg-black/40 p-4 text-white backdrop-blur-xl hover:bg-white hover:text-black transition-all"
      >
        {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
      </button>

      <div className="h-full w-full" ref={emblaRef}>
        <div className="flex h-full">
          {SLIDE_SETTINGS.map((slide, index) => {
            const isActive = index === selectedIndex;
            return (
              <div className="relative flex-[0_0_100%] h-full min-w-0" key={slide.id}>
                {/* Optimized Media Layer */}
                <div className="absolute inset-0 z-0">
                  <video
                    src={isActive ? slide.videoUrl : undefined}
                    poster={slide.posterUrl}
                    autoPlay
                    loop
                    muted={isMuted}
                    playsInline
                    className="h-full w-full object-cover brightness-[0.7]"
                  />
                  <div className="absolute inset-0 bg-linear-to-b from-black/20 via-transparent to-black/80" />
                </div>

                {/* Content */}
                <div className="relative z-10 container mx-auto h-full flex flex-col justify-center px-6">
                  {isActive && (
                    <motion.div
                      initial={{ opacity: 0, y: 40 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                      className="max-w-4xl"
                    >
                      <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold text-white tracking-[0.4em] uppercase backdrop-blur-md mb-8">
                         <Play size={10} fill="currentColor" /> 
                         {(dictionary as any)[slide.priceKey] || "Experience"}
                      </span>
                      
                      <h1 className="font-display text-6xl md:text-9xl font-bold text-white tracking-tighter leading-[0.85] mb-8 uppercase">
                        {dictionary[slide.titleKey]}
                      </h1>
                      
                      <p className="font-sans text-xl md:text-2xl text-zinc-300 max-w-2xl mb-12 opacity-90">
                        {dictionary[slide.subtitleKey]}
                      </p>

                      <NextLink 
                        href={slide.ctaLink}
                        className="inline-flex items-center gap-4 rounded-full bg-white px-10 py-5 text-sm font-bold text-black hover:scale-105 transition-transform"
                      >
                        {dictionary.CTA_BUTTON}
                      </NextLink>
                    </motion.div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}