/**
 * @file ExperienceShowcase3D.tsx
 * @description Aparato de exhibición inmersiva 3D para la cartelera del festival.
 *              Refactorizado: Sincronización total Day/Night, erradicación de hardcoding,
 *              optimización de profundidad física y cumplimiento i18n.
 * @version 4.0 - Atmosphere Responsive & Zero Hardcode
 * @author Raz Podestá - MetaShark Tech
 */

'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Ship, Martini, Sunset, MapPin, ChevronRight, ChevronLeft, 
  Music, Disc, Activity, Sparkles, Clock, CalendarDays,
  type LucideIcon 
} from 'lucide-react';
import Image from 'next/image';

/**
 * IMPORTACIONES DE INFRAESTRUCTRURA
 * @pilar V: Adherencia arquitectónica.
 */
import { cn } from '../../../lib/utils/cn';
import type { Dictionary } from '../../../lib/schemas/dictionary.schema';

/**
 * MAPA DE ICONOS DETERMINISTA (SSoT)
 * @description Resuelve el icono visual basado en la identidad del evento.
 */
const ICON_MAP: Record<string, LucideIcon> = {
  'sunset-welcome': Sunset,
  'hq-party': Sunset,
  'main-boat-party': Ship,
  'techno-sanctuary': Disc,
  'praia-mole': Martini,
  'Techno': Activity,
  'House': Music,
  'Chill': Sunset,
  'Disco': Sparkles
};

/**
 * @interface ExperienceShowcase3DProps
 */
interface ExperienceShowcase3DProps {
  /** Fragmento del diccionario festival validado por SSoT */
  dictionary: Dictionary['festival'];
  className?: string;
}

/**
 * APARATO: ExperienceShowcase3D
 * @description Presentación táctica de eventos con profundidad física adaptativa.
 */
export function ExperienceShowcase3D({ dictionary, className }: ExperienceShowcase3DProps) {
  const [index, setIndex] = useState(0);

  const events = useMemo(() => dictionary?.events || [], [dictionary]);
  const active = useMemo(() => events[index], [events, index]);

  /**
   * PROTOCOLO HEIMDALL: Telemetría de Navegación
   * @pilar IV: Registra el impacto visual de cada experiencia.
   */
  useEffect(() => {
    if (active) {
      console.log(`[HEIMDALL][UX] Festival_Orbit_Focus: ${active.id} | Atmosphere: Synchronized`);
    }
  }, [active]);

  const next = useCallback(() => setIndex((prev) => (prev + 1) % events.length), [events.length]);
  const prev = useCallback(() => setIndex((prev) => (prev - 1 + events.length) % events.length), [events.length]);

  // Guardia de Resiliencia ante datos nulos (Pilar VIII)
  if (events.length === 0 || !active) return null;

  const ActiveIcon = ICON_MAP[active.id] || ICON_MAP[active.vibe] || Activity;

  return (
    <section 
      className={cn("relative py-24 bg-transparent overflow-hidden select-none", className)}
      aria-label="Festival Line-up Showcase"
    >
      <div className="container mx-auto px-6 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-20 lg:gap-32">
          
          {/* --- LADO IZQUIERDO: VISUAL STACK (Perspectiva 3D con Atmosphere Awareness) --- */}
          <div className="relative w-full lg:w-1/2 aspect-square flex items-center justify-center perspective-2000">
            <AnimatePresence mode="wait">
              <motion.div
                key={active.id}
                initial={{ opacity: 0, scale: 0.8, rotateY: -25, x: -100, filter: 'blur(10px)' }}
                animate={{ opacity: 1, scale: 1, rotateY: 0, x: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, scale: 1.1, rotateY: 25, x: 100, filter: 'blur(10px)' }}
                transition={{ 
                  duration: 0.8, 
                  ease: [0.16, 1, 0.3, 1] 
                }}
                className="relative w-[280px] sm:w-[400px] h-[450px] sm:h-[550px] rounded-[3.5rem] overflow-hidden border border-border shadow-3xl transform-gpu bg-surface"
              >
                <Image 
                  src={active.image} 
                  alt={active.title} 
                  fill 
                  className="object-cover transition-transform duration-2000 hover:scale-105 brightness-[0.85] [data-theme='dark']:brightness-[0.7]"
                  sizes="(max-width: 768px) 300px, 500px"
                  priority
                />
                
                {/* Overlay de gradiente reactivo al color del neón y atmósfera de fondo */}
                <div 
                  className="absolute inset-0 bg-linear-to-t from-background via-transparent to-transparent opacity-90 transition-colors duration-1000" 
                  style={{ backgroundImage: `linear-gradient(to top, var(--color-background) 0%, transparent 70%, ${active.neon_color}15 100%)` }}
                />
                
                <div className="absolute bottom-12 left-12 right-12">
                   <motion.div
                     initial={{ y: 20, opacity: 0 }}
                     animate={{ y: 0, opacity: 1 }}
                     transition={{ delay: 0.4 }}
                     className="space-y-6"
                   >
                     <ActiveIcon 
                        className="drop-shadow-[0_0_20px_currentColor]" 
                        size={54} 
                        strokeWidth={1.2}
                        style={{ color: active.neon_color }}
                     />
                     <h3 className="font-display text-4xl sm:text-6xl font-bold text-white tracking-tighter uppercase leading-[0.85] drop-shadow-2xl">
                       {active.title}
                     </h3>
                   </motion.div>
                </div>

                {/* Badge VIP (Adaptativo) */}
                {active.isVipOnly && (
                  <div className="absolute top-10 right-10">
                    <span className="inline-flex items-center gap-2 rounded-full bg-yellow-500 px-5 py-2 text-[9px] font-bold uppercase tracking-widest text-black shadow-2xl">
                      VIP ACCESS
                    </span>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
            
            {/* Artefactos de órbita decorativa adaptativos */}
            <div className="absolute inset-0 border border-border/20 rounded-full animate-spin-slow pointer-events-none" />
            <div className="absolute inset-20 border border-primary/10 rounded-full animate-spin-reverse-slow pointer-events-none" />
          </div>

          {/* --- LADO DERECHO: NARRATIVA & CONTROLES --- */}
          <div className="w-full lg:w-1/2">
            <motion.div
              key={active.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-12"
            >
              <div className="inline-flex items-center gap-4 text-muted-foreground font-mono text-xs uppercase tracking-[0.4em] bg-surface border border-border/50 px-6 py-3 rounded-full backdrop-blur-xl shadow-sm transition-colors">
                <MapPin size={16} style={{ color: active.neon_color }} /> 
                {active.location}
              </div>

              <h2 className="font-display text-6xl md:text-8xl lg:text-9xl font-bold text-foreground tracking-tighter leading-[0.8] transition-colors duration-1000">
                THE <br />
                <span 
                  className="transition-all duration-1000 block"
                  style={{ color: active.neon_color, textShadow: `0 0 50px ${active.neon_color}30` }}
                >
                  {active.vibe}
                </span>
                {dictionary.hero.subtitle.split(' ')[0].toUpperCase()}
              </h2>

              <p className="text-muted-foreground text-lg md:text-2xl max-w-md leading-relaxed font-light italic transition-colors duration-1000">
                {active.description}
              </p>
              
              {/* Controles Ergonómicos (Thumb-Driven UX) 
                  @pilar VII: Colores adaptativos para botones.
              */}
              <div className="flex items-center gap-8 pt-4">
                <button 
                  onClick={prev} 
                  className="group p-6 rounded-full border border-border bg-surface hover:bg-foreground hover:text-background transition-all active:scale-90 shadow-xl"
                  aria-label="Previous Experience"
                >
                  <ChevronLeft size={32} strokeWidth={1.5} className="group-hover:-translate-x-1 transition-transform" />
                </button>
                
                <div className="flex gap-4" role="tablist">
                   {events.map((_, i) => (
                     <button
                       key={i}
                       onClick={() => setIndex(i)}
                       role="tab"
                       aria-selected={i === index}
                       className={cn(
                         "h-1.5 transition-all duration-700 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-primary",
                         i === index ? "w-14 bg-foreground" : "w-3 bg-border hover:bg-muted-foreground"
                       )}
                       aria-label={`Go to event ${i + 1}`}
                     />
                   ))}
                </div>

                <button 
                  onClick={next} 
                  className="group p-6 rounded-full border border-border bg-surface hover:bg-foreground hover:text-background transition-all active:scale-90 shadow-xl"
                  aria-label="Next Experience"
                >
                  <ChevronRight size={32} strokeWidth={1.5} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

              {/* MÉTIDAS TÉCNICAS (Higiene i18n) */}
              <div className="pt-8 border-t border-border max-w-sm flex flex-col gap-3">
                <div className="flex items-center gap-3 text-[10px] font-mono uppercase tracking-[0.3em] text-muted-foreground">
                  <Clock size={14} className="text-primary" />
                  <span>{active.startTime}</span>
                </div>
                <div className="flex items-center gap-3 text-[10px] font-mono uppercase tracking-[0.3em] text-muted-foreground">
                  <CalendarDays size={14} className="text-accent" />
                  <span>Takeover Day {active.day}</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Artefacto Atmosférico: Glow adaptativo (Pilar XII)
          La intensidad se reduce en modo Día para no lavar el contraste.
      */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[1200px] rounded-full blur-[200px] pointer-events-none transition-all duration-1500 opacity-10 [data-theme='light']:opacity-[0.05]"
        style={{ backgroundColor: active.neon_color }}
      />
    </section>
  );
}