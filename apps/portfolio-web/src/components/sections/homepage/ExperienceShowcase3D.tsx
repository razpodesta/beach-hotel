/**
 * @file apps/portfolio-web/src/components/sections/homepage/ExperienceShowcase3D.tsx
 * @description Aparato de exhibición inmersiva 3D para las experiencias del festival.
 *              Utiliza transformaciones espaciales de Framer Motion para simular profundidad
 *              y un sistema de orquestación de contenido localizado.
 * @version 2.0
 * @author Raz Podestá - MetaShark Tech
 */

'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Ship, Martini, Sunset, MapPin, ChevronRight, ChevronLeft, type LucideIcon } from 'lucide-react';
import Image from 'next/image';

/**
 * IMPORTACIONES NIVELADAS (Cumplimiento @nx/enforce-module-boundaries)
 */
import { cn } from '../../../lib/utils/cn';

/**
 * Contrato de datos para una experiencia del festival.
 */
interface ExperienceItem {
  id: string;
  title: string;
  location: string;
  description: string;
  image: string;
  Icon: LucideIcon; // CORRECCIÓN: Eliminado 'any' por tipo estricto de Lucide
  color: string;
}

/**
 * Definición estática de la colección de experiencias.
 * Orquestada con iconos y esquemas cromáticos de neón.
 */
const EXPERIENCES: ExperienceItem[] = [
  {
    id: 'boat-party',
    title: "BOAT PARTY",
    location: "Baía Norte",
    description: "Sunset cruise com DJ set internacional e open bar premium.",
    image: "/images/festival/boat-party.jpg",
    Icon: Ship,
    color: "#a855f7" // Purple Neon
  },
  {
    id: 'praia-mole',
    title: "MOLE CIRCUIT",
    location: "Praia Mole",
    description: "Beach club takeover. O epicentro da comunidade em Floripa.",
    image: "/images/festival/praia-mole.jpg",
    Icon: Martini,
    color: "#ec4899" // Pink Neon
  },
  {
    id: 'hq-party',
    title: "HQ SUNSET",
    location: "Beach Hotel",
    description: "Pool party exclusiva no nosso Headquarters em Canasvieiras.",
    image: "/images/festival/hq-party.jpg",
    Icon: Sunset,
    color: "#3b82f6" // Blue Neon
  }
];

/**
 * Aparato Visual: ExperienceShowcase3D
 * Gestiona el carrusel de experiencias con una interfaz de alta fidelidad.
 */
export function ExperienceShowcase3D() {
  const [index, setIndex] = useState(0);

  const next = () => setIndex((prev) => (prev + 1) % EXPERIENCES.length);
  const prev = () => setIndex((prev) => (prev - 1 + EXPERIENCES.length) % EXPERIENCES.length);

  const active = useMemo(() => EXPERIENCES[index], [index]);

  return (
    <section 
      className="relative py-24 bg-[#050505] overflow-hidden select-none"
      aria-label="Festival Experience Showcase"
    >
      <div className="container mx-auto px-6">
        <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
          
          {/* --- LADO IZQUIERDO: VISUAL STACK (Perspectiva 3D) --- */}
          <div className="relative w-full lg:w-1/2 aspect-square flex items-center justify-center perspective-1000">
            <AnimatePresence mode="wait">
              <motion.div
                key={active.id}
                initial={{ opacity: 0, scale: 0.8, rotateY: -30, x: -50 }}
                animate={{ opacity: 1, scale: 1, rotateY: 0, x: 0 }}
                exit={{ opacity: 0, scale: 1.1, rotateY: 30, x: 50 }}
                transition={{ 
                  duration: 0.8, 
                  ease: [0.16, 1, 0.3, 1] // Easing de élite (out-expo)
                }}
                className="relative w-[280px] sm:w-[340px] h-[400px] sm:h-[480px] rounded-[2.5rem] overflow-hidden border border-white/10 shadow-3xl transform-gpu"
              >
                <Image 
                  src={active.image} 
                  alt={active.title} 
                  fill 
                  className="object-cover brightness-90 transition-transform duration-1000 hover:scale-110"
                  sizes="(max-width: 768px) 280px, 340px"
                  priority
                />
                
                {/* Overlay de gradiente para legibilidad */}
                <div className="absolute inset-0 bg-linear-to-t from-black via-black/20 to-transparent" />
                
                <div className="absolute bottom-8 left-8">
                   <active.Icon className="text-white mb-4 drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]" size={40} strokeWidth={1.5} />
                   <h3 className="font-display text-3xl sm:text-4xl font-bold text-white tracking-tighter uppercase leading-none">
                     {active.title}
                   </h3>
                </div>
              </motion.div>
            </AnimatePresence>
            
            {/* Elementos decorativos WebGL simulados (Anillos de órbita) */}
            <div className="absolute inset-0 border border-white/5 rounded-full animate-spin-slow pointer-events-none opacity-30" />
            <div className="absolute inset-10 border border-purple-500/10 rounded-full animate-spin-reverse-slow pointer-events-none" />
          </div>

          {/* --- LADO DERECHO: NARRATIVA & CONTROLES --- */}
          <div className="w-full lg:w-1/2">
            <motion.div
              key={active.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-8"
            >
              <div className="inline-flex items-center gap-3 text-zinc-500 font-mono text-xs uppercase tracking-[0.3em] bg-white/5 px-4 py-2 rounded-full border border-white/10 backdrop-blur-md">
                <MapPin size={14} className="text-purple-500" /> {active.location}
              </div>

              <h2 className="font-display text-6xl md:text-8xl font-bold text-white tracking-tighter leading-[0.85]">
                THE <br />
                <span 
                  className="transition-colors duration-1000"
                  style={{ color: active.color }}
                >
                  {active.title.split(' ')[0]}
                </span> <br />
                EXPERIENCE
              </h2>

              <p className="text-zinc-400 text-lg md:text-xl max-w-md leading-relaxed font-light">
                {active.description}
              </p>
              
              {/* Controles Ergonómicos (Thumb-Driven UX) */}
              <div className="flex items-center gap-6 pt-10">
                <button 
                  onClick={prev} 
                  className="group p-5 rounded-full border border-white/10 hover:bg-white hover:text-black transition-all active:scale-90"
                  aria-label="Experiencia anterior"
                >
                  <ChevronLeft size={28} strokeWidth={1.5} className="group-hover:-translate-x-1 transition-transform" />
                </button>
                
                <div className="flex gap-2">
                   {EXPERIENCES.map((_, i) => (
                     <div 
                       key={i} 
                       className={cn(
                         "h-1.5 transition-all duration-500 rounded-full",
                         i === index ? "w-10 bg-white" : "w-2 bg-zinc-800"
                       )}
                     />
                   ))}
                </div>

                <button 
                  onClick={next} 
                  className="group p-5 rounded-full border border-white/10 hover:bg-white hover:text-black transition-all active:scale-90"
                  aria-label="Siguiente experiencia"
                >
                  <ChevronRight size={28} strokeWidth={1.5} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Artefacto de fondo: Glow reactivo al color de la experiencia */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full blur-[160px] opacity-10 transition-colors duration-1000 pointer-events-none"
        style={{ backgroundColor: active.color }}
      />
    </section>
  );
}