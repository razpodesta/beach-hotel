/**
 * @file HeroCarousel.tsx
 * @version 3.0 - Experience Engine
 * @description Carrusel de alto impacto con fondos de video 4K y sistema de Audio Teaser.
 *              Optimizado para la conversión de reservas en el Beach Hotel Canasvieiras.
 */

'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Fade from 'embla-carousel-fade';
import Autoplay from 'embla-carousel-autoplay';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, VolumeX, ArrowRight, Play } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

// --- Contrato de Datos de Experiencia ---
interface HeroSlide {
  id: string;
  title: string;
  subtitle: string;
  priceLabel: string;
  videoUrl: string;
  thumbnailUrl: string;
  ctaLink: string;
}

const HERO_SLIDES: HeroSlide[] = [
  {
    id: 'luxury-suite',
    title: "LUXURY OCEAN SUITE",
    subtitle: "Desperte com o som do mar de Canasvieiras",
    priceLabel: "Desde R$ 890 / Noite",
    videoUrl: "https://cdn.pixabay.com/video/2021/09/01/87113-596486047_large.mp4", // Placeholder: Habitación de Lujo
    thumbnailUrl: "/images/hotel/suite-luxury.jpg",
    ctaLink: "/reservas"
  },
  {
    id: 'pride-festival',
    title: "PRIDE ESCAPE 2026",
    subtitle: "O maior festival boutique LGBT+ de Floripa",
    priceLabel: "Tickets VIP Disponíveis",
    videoUrl: "https://cdn.pixabay.com/video/2023/10/24/186358-877995180_large.mp4", // Placeholder: Fiesta/Electrónica
    thumbnailUrl: "/images/festival/pride-hero.jpg",
    ctaLink: "/festival"
  }
];

export function HeroCarousel() {
  // --- Estados de UI & Media ---
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [Fade(), Autoplay({ delay: 8000 })]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true); // Empezamos en silencio por política de navegador
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // --- Lógica del Audio Teaser (3 Segundos) ---
  useEffect(() => {
    const playTeaser = async () => {
      if (audioRef.current) {
        try {
          audioRef.current.volume = 0.4;
          await audioRef.current.play();
          setIsMuted(false);

          // Timer de 3 segundos para silenciar automáticamente
          setTimeout(() => {
            setIsMuted(true);
            if (audioRef.current) {
                // Desvanecimiento suave de volumen antes de mutear
                const fadeOut = setInterval(() => {
                    if (audioRef.current && audioRef.current.volume > 0.05) {
                        audioRef.current.volume -= 0.05;
                    } else {
                        setIsMuted(true);
                        clearInterval(fadeOut);
                    }
                }, 100);
            }
          }, 3000);
        } catch (error) {
          console.log("Autoplay bloqueado por el navegador. Esperando interacción.");
        }
      }
    };

    playTeaser();
  }, []);

  // --- Sincronización de Mute ---
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = isMuted;
    }
  }, [isMuted]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on('select', onSelect);
  }, [emblaApi, onSelect]);

  return (
    <section className="relative h-screen w-full bg-black overflow-hidden">
      {/* --- Motor de Audio (Hidden) --- */}
      <audio 
        ref={audioRef}
        src="/audio/teaser-festival.mp3" // Ruta del track de música electrónica
        loop
      />

      {/* --- Controles de Audio Flotantes --- */}
      <div className="absolute top-28 right-8 z-50 flex items-center gap-4">
        <button
          onClick={() => setIsMuted(!isMuted)}
          className="group flex items-center gap-3 rounded-full border border-white/20 bg-black/40 p-3 text-white backdrop-blur-xl transition-all hover:bg-white hover:text-black"
        >
          {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} className="animate-pulse" />}
          <span className="hidden md:block text-[10px] font-bold uppercase tracking-widest overflow-hidden max-w-0 group-hover:max-w-xs transition-all duration-500">
            {isMuted ? "Sound Off" : "Now Playing"}
          </span>
        </button>
      </div>

      {/* --- Stage del Carrusel (Embla) --- */}
      <div className="h-full w-full" ref={emblaRef}>
        <div className="flex h-full">
          {HERO_SLIDES.map((slide, index) => (
            <div className="relative flex-[0_0_100%] h-full min-w-0" key={slide.id}>
              {/* Fondo de Video */}
              <div className="absolute inset-0 z-0">
                <video
                  src={slide.videoUrl}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-linear-to-b from-black/40 via-transparent to-black/80" />
              </div>

              {/* Contenido Visual (Textos) */}
              <div className="relative z-10 container mx-auto h-full flex flex-col justify-center px-6">
                <AnimatePresence mode="wait">
                  {index === selectedIndex && (
                    <motion.div
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -30 }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      className="max-w-4xl"
                    >
                      <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-[10px] font-bold text-white tracking-[0.3em] uppercase backdrop-blur-md mb-6">
                         <Play size={10} fill="currentColor" /> {slide.priceLabel}
                      </span>
                      
                      <h1 className="font-display text-5xl md:text-8xl font-bold text-white tracking-tighter leading-[0.9] mb-6">
                        {slide.title}
                      </h1>
                      
                      <p className="font-sans text-lg md:text-2xl text-zinc-300 max-w-2xl mb-10 leading-relaxed">
                        {slide.subtitle}
                      </p>

                      <div className="flex flex-wrap gap-4">
                        <Link 
                          href={slide.ctaLink}
                          className="group relative inline-flex items-center gap-3 overflow-hidden rounded-full bg-white px-8 py-4 text-sm font-bold text-black transition-all hover:pr-12"
                        >
                          <span>RESERVAR AGORA</span>
                          <ArrowRight className="absolute right-4 translate-x-4 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" size={18} />
                        </Link>
                        
                        <button className="px-8 py-4 rounded-full border border-white/30 text-white font-bold text-sm hover:bg-white/10 transition-colors backdrop-blur-sm">
                          EXPLORAR SUITES
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* --- Indicadores de Paginación --- */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex gap-3 z-30">
        {HERO_SLIDES.map((_, idx) => (
          <button
            key={idx}
            onClick={() => emblaApi?.scrollTo(idx)}
            className={`h-1 transition-all duration-500 rounded-full ${idx === selectedIndex ? 'w-12 bg-white' : 'w-4 bg-white/30'}`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </section>
  );
}