/**
 * @file AboutSection.tsx
 * @description Presentación narrativa del Santuario (Fase 3: Trust).
 *              Refactorizado: Sincronización total con el Manifiesto Day-First, 
 *              clases canónicas Tailwind v4 y observabilidad Heimdall.
 * @version 13.0 - Atmosphere Master Edition
 * @author Raz Podestá - MetaShark Tech
 */

'use client';

import React, { useMemo, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, type Variants } from 'framer-motion';
import { ArrowRight, Landmark, Sparkles } from 'lucide-react';

/**
 * IMPORTACIONES DE INFRAESTRUCTRURA
 * @pilar V: Adherencia arquitectónica.
 */
import { FadeIn } from '../../ui/FadeIn';
import { getLocalizedHref } from '../../../lib/utils/link-helpers';
import { i18n, type Locale } from '../../../config/i18n.config';
import type { AboutDictionary } from '../../../lib/schemas/about_section.schema';
import { cn } from '../../../lib/utils/cn';

/**
 * @interface AboutSectionProps
 */
interface AboutSectionProps {
  /** Fragmento del diccionario validado por MACS */
  dictionary: AboutDictionary;
}

/**
 * COREOGRAFÍA MEA/UX (Pilar XII)
 */
const textContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.3
    }
  }
};

const paragraphVariants: Variants = {
  hidden: { opacity: 0, x: -15, filter: 'blur(8px)' },
  visible: { 
    opacity: 1, 
    x: 0,
    filter: 'blur(0px)',
    transition: { duration: 1, ease: [0.16, 1, 0.3, 1] }
  }
};

/**
 * APARATO: AboutSection
 * @description Orquesta la conexión emocional con el huésped adaptándose a la atmósfera global.
 */
export function AboutSection({ dictionary }: AboutSectionProps) {
  const pathname = usePathname();

  /**
   * PROTOCOLO HEIMDALL: Telemetría de Montaje
   * @pilar IV: Registra la visibilidad de la sección para auditoría de engagement.
   */
  useEffect(() => {
    console.log('[HEIMDALL][UX] AboutSection synchronized with current atmosphere.');
  }, []);

  const currentLang = useMemo(() => {
    const segments = pathname?.split('/') ?? [];
    const candidate = segments[1] as Locale;
    return i18n.locales.includes(candidate) ? candidate : i18n.defaultLocale;
  }, [pathname]);

  const storyHref = useMemo(() => 
    getLocalizedHref('/quienes-somos', currentLang), 
    [currentLang]
  );

  // Guardia de Resiliencia (Pilar VIII)
  if (!dictionary?.paragraphs || dictionary.paragraphs.length === 0) return null;

  return (
    <section 
      id="about-sanctuary" 
      /**
       * @pilar VII: Theming Soberano
       * Sustituimos 'bg-black' por 'bg-background' para habilitar el modo Día.
       */
      className="relative w-full overflow-hidden py-24 sm:py-40 bg-background transition-colors duration-1000 selection:bg-primary/30"
      aria-labelledby="about-title"
      role="region"
    >
      <div className="relative z-10 container mx-auto px-6">
        <div className="grid grid-cols-1 items-stretch gap-16 lg:grid-cols-5 lg:gap-32">
          
          {/* --- BLOQUE VISUAL: EL PATRIMONIO (Perspectiva Glassmorphism) --- */}
          <div className="lg:col-span-2">
            <FadeIn delay={0.2} yOffset={40}>
              <div className="group relative h-full min-h-[500px] rounded-5xl border border-border/50 bg-surface/30 p-4 backdrop-blur-md transition-all duration-700 hover:border-primary/20 transform-gpu">
                <div className="relative h-full w-full overflow-hidden rounded-4xl shadow-3xl">
                  <Image
                    src="/images/hotel/about-building-front.jpg"
                    alt={dictionary.title}
                    fill
                    className="object-cover transition-transform duration-2000 ease-out group-hover:scale-105"
                    sizes="(max-width: 1024px) 100vw, 35vw"
                    priority={true}
                  />
                  
                  {/* Overlay de profundidad adaptativo */}
                  <div className="absolute inset-0 bg-linear-to-t from-background/80 via-transparent to-transparent opacity-70 transition-colors duration-1000" />
                  
                  {/* BADGE DE IDENTIDAD SOBERANA */}
                  <div className="absolute bottom-10 left-10 flex items-center gap-5">
                    <motion.div 
                      whileHover={{ rotate: 10, scale: 1.1 }}
                      className="h-16 w-16 flex items-center justify-center rounded-2xl bg-surface/50 backdrop-blur-3xl border border-border/40 text-primary shadow-2xl"
                    >
                      <Landmark size={32} strokeWidth={1.2} />
                    </motion.div>
                    <div className="flex flex-col">
                      <span className="text-[9px] font-mono font-bold tracking-[0.5em] text-muted-foreground uppercase">
                        Sovereign Hub
                      </span>
                      <span className="text-[12px] font-bold text-foreground uppercase tracking-widest mt-1">
                        {dictionary.badge_label}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>

          {/* --- BLOQUE NARRATIVO: LA FILOSOFÍA --- */}
          <div className="lg:col-span-3 flex flex-col justify-center">
            <div className="space-y-16">
              <header className="space-y-6">
                <FadeIn delay={0.3}>
                  <div className="inline-flex items-center gap-3 text-primary">
                    <Sparkles size={18} className="animate-pulse" />
                    <span className="text-[10px] font-bold uppercase tracking-[0.6em] font-mono">The Sanctuary Philosophy</span>
                  </div>
                </FadeIn>
                <FadeIn delay={0.4}>
                  <h2 
                    id="about-title"
                    className="font-display text-5xl md:text-7xl lg:text-9xl font-bold tracking-tighter text-foreground leading-[0.85] drop-shadow-sm transition-colors duration-1000"
                  >
                    {dictionary.title}
                  </h2>
                </FadeIn>
              </header>

              {/* Narrativa Staggered con Resaltado Dinámico */}
              <motion.div 
                variants={textContainerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="space-y-10"
              >
                {dictionary.paragraphs.map((p, i) => (
                  <motion.p 
                    key={`p-narrative-${i}`}
                    variants={paragraphVariants}
                    className="text-lg md:text-2xl text-muted-foreground font-sans font-light leading-relaxed max-w-3xl transition-colors duration-1000"
                  >
                    {p.text} 
                    {p.highlight && (
                      <span className="relative inline-block ml-3">
                        <strong className="font-bold text-foreground italic">{p.highlight}</strong>
                        <motion.span 
                          initial={{ scaleX: 0 }}
                          whileInView={{ scaleX: 1 }}
                          viewport={{ once: true }}
                          transition={{ delay: 1.2 + (i * 0.2), duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
                          className="absolute -bottom-2 left-0 h-0.5 w-full bg-primary/40 origin-left"
                        />
                      </span>
                    )}
                  </motion.p>
                ))}
              </motion.div>

              {/* CALL TO ACTION SOBERANO (Color-Mix Inversion) */}
              <FadeIn delay={0.8} yOffset={20}>
                <div className="pt-6">
                  <Link
                    href={storyHref}
                    className={cn(
                      "group relative inline-flex items-center gap-8 rounded-full px-12 py-6 text-[11px] font-bold uppercase tracking-[0.4em] transition-all duration-500 shadow-2xl active:scale-95",
                      "bg-foreground text-background hover:bg-primary hover:text-white hover:shadow-primary/20"
                    )}
                  >
                    {dictionary.cta_button} 
                    <ArrowRight size={20} className="transition-transform duration-700 group-hover:translate-x-4" />
                  </Link>
                </div>
              </FadeIn>
            </div>
          </div>

        </div>
      </div>
      
      {/* CAPAS DE ATMÓSFERA SENSORIAL (Adaptativas) */}
      <div className="absolute top-1/4 -right-32 w-[600px] h-[600px] bg-primary/5 blur-[160px] rounded-full pointer-events-none transition-colors" />
      <div className="absolute -bottom-32 -left-32 w-[600px] h-[600px] bg-accent/5 blur-[160px] rounded-full pointer-events-none transition-colors" />
    </section>
  );
}