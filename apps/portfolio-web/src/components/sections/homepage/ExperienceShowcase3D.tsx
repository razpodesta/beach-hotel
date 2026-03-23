/**
 * @file ExperienceShowcase3D.tsx
 * @description Aparato de exhibición inmersiva 3D para la cartelera del festival.
 *              Fase 5 del Embudo: Exclusividad y Deseo.
 *              Refactorizado: 100% Data-Driven (MACS), i18n Nativa y UX Cromática.
 * @version 3.0 - Elite Production Standard
 * @author Raz Podestá - MetaShark Tech
 */

'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Ship, Martini, Sunset, MapPin, ChevronRight, ChevronLeft, 
  Music, Disc, Activity, Sparkles, type LucideIcon 
} from 'lucide-react';
import Image from 'next/image';

/**
 * IMPORTACIONES DE INFRAESTRUCTRURA
 */
import { cn } from '../../../lib/utils/cn';
import type { Dictionary } from '../../../lib/schemas/dictionary.schema';

/**
 * MAPA DE ICONOS DETERMINISTA
 * @description Resuelve el icono visual basado en la identidad o vibración del evento.
 */
const ICON_MAP: Record<string, LucideIcon> = {
  'sunset-welcome': Sunset,
  'hq-party': Sunset,
  'main-boat-party': Ship,
  'techno-sanctuary': Disc,
  'praia-mole': Martini,
  // Fallbacks por Vibe
  'Techno': Activity,
  'House': Music,
  'Chill': Sunset,
  'Disco': Sparkles
};

interface ExperienceShowcase3DProps {
  /** Fragmento del diccionario festival validado por SSoT */
  dictionary: Dictionary['festival'];
}

/**
 * APARATO: ExperienceShowcase3D
 * @description Orquesta la presentación táctica de eventos mediante transformaciones espaciales.
 */
export function ExperienceShowcase3D({ dictionary }: ExperienceShowcase3DProps) {
  const [index, setIndex] = useState(0);

  const events = useMemo(() => dictionary?.events || [], [dictionary]);
  const active = useMemo(() => events[index], [events, index]);

  /**
   * PROTOCOLO HEIMDALL: Telemetría de Navegación
   * @pilar IV: Registra qué experiencia genera más interés visual.
   */
  useEffect(() => {
    if (active) {
      console.log(`[HEIMDALL][UX] Festival_Experience_Focus: ${active.id}`);
    }
  }, [active]);

  const next = () => setIndex((prev) => (prev + 1) % events.length);
  const prev = () => setIndex((prev) => (prev - 1 + events.length) % events.length);

  // @pilar VIII: Guardia de Resiliencia ante datos nulos o vacíos
  if (events.length === 0 || !active) return null;

  const ActiveIcon = ICON_MAP[active.id] || ICON_MAP[active.vibe] || Activity;

  return (
    <section 
      className="relative py-24 bg-transparent overflow-hidden select-none"
      aria-label="Festival Experience Showcase"
    >
      <div className="container mx-auto px-6">
        <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-32">
          
          {/* --- LADO IZQUIERDO: VISUAL STACK (Perspectiva 3D) --- */}
          <div className="relative w-full lg:w-1/2 aspect-square flex items-center justify-center perspective-2000">
            <AnimatePresence mode="wait">
              <motion.div
                key={active.id}
                initial={{ opacity: 0, scale: 0.8, rotateY: -25, x: -100 }}
                animate={{ opacity: 1, scale: 1, rotateY: 0, x: 0 }}
                exit={{ opacity: 0, scale: 1.1, rotateY: 25, x: 100 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="relative w-[280px] sm:w-[380px] h-[400px] sm:h-[520px] rounded-[3rem] overflow-hidden border border-white/10 shadow-3xl transform-gpu"
              >
                <Image 
                  src={active.image} 
                  alt={active.title} 
                  fill 
                  className="object-cover brightness-75 transition-transform duration-2000 hover:scale-110"
                  sizes="(max-width: 768px) 300px, 400px"
                  priority
                />
                
                {/* Overlay de gradiente reactivo */}
                <div 
                  className="absolute inset-0 bg-linear-to-t from-black via-black/20 to-transparent opacity-90" 
                  style={{ backgroundImage: `linear-gradient(to top, black 0%, transparent 60%, ${active.neon_color}10 100%)` }}
                />
                
                <div className="absolute bottom-10 left-10">
                   <motion.div
                     initial={{ y: 20, opacity: 0 }}
                     animate={{ y: 0, opacity: 1 }}
                     transition={{ delay: 0.4 }}
                   >
                     <ActiveIcon 
                        className="mb-6 drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]" 
                        size={48} 
                        strokeWidth={1.2}
                        style={{ color: active.neon_color }}
                     />
                     <h3 className="font-display text-3xl sm:text-5xl font-bold text-white tracking-tighter uppercase leading-none">
                       {active.title}
                     </h3>
                   </motion.div>
                </div>

                {/* Badge VIP (Conversión) */}
                {active.isVipOnly && (
                  <div className="absolute top-8 right-8">
                    <span className="inline-flex items-center gap-2 rounded-full bg-yellow-500 px-4 py-1.5 text-[9px] font-bold uppercase tracking-widest text-black shadow-2xl">
                      VIP ONLY
                    </span>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
            
            {/* Artefactos de órbita decorativa */}
            <div className="absolute inset-0 border border-white/5 rounded-full animate-spin-slow pointer-events-none opacity-20" />
            <div className="absolute inset-20 border border-primary/10 rounded-full animate-spin-reverse-slow pointer-events-none" />
          </div>

          {/* --- LADO DERECHO: NARRATIVA & CONTROLES --- */}
          <div className="w-full lg:w-1/2">
            <motion.div
              key={active.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-10"
            >
              <div className="inline-flex items-center gap-4 text-zinc-500 font-mono text-xs uppercase tracking-[0.4em] bg-white/5 px-6 py-2.5 rounded-full border border-white/10 backdrop-blur-xl">
                <MapPin size={16} style={{ color: active.neon_color }} /> 
                {active.location}
              </div>

              <h2 className="font-display text-6xl md:text-8xl font-bold text-white tracking-tighter leading-[0.85]">
                THE <br />
                <span 
                  className="transition-colors duration-1000 block"
                  style={{ color: active.neon_color, textShadow: `0 0 40px ${active.neon_color}40` }}
                >
                  {active.vibe}
                </span>
                EXPERIENCE
              </h2>

              <p className="text-zinc-400 text-lg md:text-2xl max-w-md leading-relaxed font-light italic">
                {active.description}
              </p>
              
              {/* Controles Ergonómicos (Thumb-Driven UX) */}
              <div className="flex items-center gap-8 pt-6">
                <button 
                  onClick={prev} 
                  className="group p-6 rounded-full border border-white/10 bg-white/5 hover:bg-white hover:text-black transition-all active:scale-90"
                  aria-label="Previous Experience"
                >
                  <ChevronLeft size={28} strokeWidth={1.5} className="group-hover:-translate-x-1 transition-transform" />
                </button>
                
                <div className="flex gap-3">
                   {events.map((_, i) => (
                     <button
                       key={i}
                       onClick={() => setIndex(i)}
                       className={cn(
                         "h-1.5 transition-all duration-700 rounded-full outline-none",
                         i === index ? "w-12 bg-white" : "w-3 bg-zinc-800 hover:bg-zinc-600"
                       )}
                       aria-label={`Go to slide ${i + 1}`}
                     />
                   ))}
                </div>

                <button 
                  onClick={next} 
                  className="group p-6 rounded-full border border-white/10 bg-white/5 hover:bg-white hover:text-black transition-all active:scale-90"
                  aria-label="Next Experience"
                >
                  <ChevronRight size={28} strokeWidth={1.5} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

              <div className="pt-4 border-t border-white/5 max-w-sm">
                <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-zinc-600">
                   Schedule: {active.startTime} • Day {active.day} of the Takeover
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Artefacto Atmosférico: Glow reactivo al color del evento */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] rounded-full blur-[180px] opacity-10 transition-colors duration-1500 pointer-events-none"
        style={{ backgroundColor: active.neon_color }}
      />
    </section>
  );
}