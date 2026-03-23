/**
 * @file AboutSection.tsx
 * @description Presentación narrativa del Santuario (Fase 3: Trust).
 *              Refactorizado: 100% Data-Driven, Coreografía de animaciones staggered
 *              y cumplimiento estricto de los 12 Pilares de Élite.
 * @version 10.0 - Elite UX Standard
 * @author Raz Podestá - MetaShark Tech
 */

'use client';

import React, { useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, type Variants } from 'framer-motion';
import { ArrowRight, Landmark } from 'lucide-react';

/**
 * IMPORTACIONES DE INFRAESTRUCTRURA
 */
import { FadeIn } from '../../ui/FadeIn';
import { getLocalizedHref } from '../../../lib/utils/link-helpers';
import { i18n, type Locale } from '../../../config/i18n.config';
import type { Dictionary } from '../../../lib/schemas/dictionary.schema';

/**
 * @interface AboutSectionProps
 * @description Contrato de propiedades para la sección narrativa.
 */
interface AboutSectionProps {
  /** Fragmento aplanado del diccionario validado por MACS */
  dictionary: Dictionary['about'];
}

/**
 * VARIANTES DE ANIMACIÓN (MEA/UX)
 * @description Crea una secuencia de entrada elegante para los párrafos.
 */
const textContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.4
    }
  }
};

const paragraphVariants: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
  }
};

/**
 * APARATO: AboutSection
 * @description Orquesta la conexión emocional con el huésped mediante narrativa y visuales de alta gama.
 */
export function AboutSection({ dictionary }: AboutSectionProps) {
  const pathname = usePathname();

  /**
   * RESOLUCIÓN DE CONTEXTO SOBERANA
   */
  const currentLang = useMemo(() => {
    const segments = pathname?.split('/') ?? [];
    const candidate = segments[1] as Locale;
    return i18n.locales.includes(candidate) ? candidate : i18n.defaultLocale;
  }, [pathname]);

  const storyHref = useMemo(() => 
    getLocalizedHref('/quienes-somos', currentLang), 
    [currentLang]
  );

  /**
   * GUARDIÁN DE RESILIENCIA (Pilar VIII)
   */
  if (!dictionary?.paragraphs || dictionary.paragraphs.length === 0) {
    return null;
  }

  return (
    <section 
      id="about-sanctuary" 
      className="relative w-full overflow-hidden py-24 sm:py-32 bg-black selection:bg-purple-500/30"
      aria-label={dictionary.title}
    >
      <div className="relative z-10 container mx-auto px-6">
        <div className="grid grid-cols-1 items-stretch gap-16 lg:grid-cols-5 lg:gap-24">
          
          {/* --- COLUMNA VISUAL: EL PATRIMONIO --- */}
          <div className="lg:col-span-2">
            <FadeIn delay={0.2} yOffset={40}>
              <div className="group relative h-full min-h-[450px] rounded-[3.5rem] border border-white/5 bg-zinc-950/30 p-4 backdrop-blur-md transition-colors hover:border-primary/20">
                <div className="relative h-full w-full overflow-hidden rounded-[2.8rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)]">
                  <Image
                    src="/images/hotel/about-building-front.jpg"
                    alt={dictionary.title}
                    fill
                    className="object-cover transition-transform duration-2000 ease-out group-hover:scale-110"
                    sizes="(max-width: 1024px) 100vw, 40vw"
                    priority
                  />
                  
                  {/* Overlay de profundidad */}
                  <div className="absolute inset-0 bg-linear-to-t from-black via-transparent to-transparent opacity-80" />
                  
                  {/* IDENTIDAD SOBERANA (Badge) */}
                  <div className="absolute bottom-8 left-8 flex items-center gap-4">
                    <motion.div 
                      whileHover={{ rotate: 15, scale: 1.1 }}
                      className="h-14 w-14 flex items-center justify-center rounded-2xl bg-white/10 backdrop-blur-2xl border border-white/20 text-primary shadow-2xl"
                    >
                      <Landmark size={28} strokeWidth={1.5} />
                    </motion.div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-mono font-bold tracking-[0.4em] text-white uppercase opacity-80">
                        Sanctuary HQ
                      </span>
                      <span className="text-[11px] font-bold text-primary uppercase tracking-widest">
                        {dictionary.badge_label}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>

          {/* --- COLUMNA NARRATIVA: LA FILOSOFÍA --- */}
          <div className="lg:col-span-3 flex flex-col justify-center">
            <div className="space-y-12">
              <FadeIn delay={0.3}>
                <h2 className="font-display text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter text-white leading-[0.9] drop-shadow-sm">
                  {dictionary.title}
                </h2>
              </FadeIn>

              {/* Narrativa Staggered (Pilar XII) */}
              <motion.div 
                variants={textContainerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="space-y-8"
              >
                {dictionary.paragraphs.map((p, i) => (
                  <motion.p 
                    key={`p-${i}`}
                    variants={paragraphVariants}
                    className="text-lg md:text-2xl text-zinc-400 font-sans font-light leading-relaxed"
                  >
                    {p.text} 
                    {p.highlight && (
                      <strong className="relative inline-block font-bold text-white ml-2">
                        {p.highlight}
                        <motion.span 
                          initial={{ width: 0 }}
                          whileInView={{ width: '100%' }}
                          transition={{ delay: 1, duration: 1 }}
                          className="absolute -bottom-1 left-0 h-px bg-primary/40"
                        />
                      </strong>
                    )}
                  </motion.p>
                ))}
              </motion.div>

              {/* ACCIÓN DE CONVERSIÓN SECUNDARIA */}
              <FadeIn delay={0.8} yOffset={0}>
                <div className="pt-6">
                  <Link
                    href={storyHref}
                    className="group relative inline-flex items-center gap-6 rounded-full bg-white px-12 py-5 text-[11px] font-bold text-black uppercase tracking-[0.3em] transition-all hover:bg-primary hover:text-white active:scale-95 shadow-[0_20px_50px_rgba(0,0,0,0.3)]"
                  >
                    {dictionary.cta_button} 
                    <ArrowRight size={20} className="transition-transform duration-500 group-hover:translate-x-3" />
                  </Link>
                </div>
              </FadeIn>
            </div>
          </div>

        </div>
      </div>
      
      {/* CAPA DE AMBIENTACIÓN (MACS Compliance) */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-purple-500/5 blur-[120px] rounded-full pointer-events-none" />
    </section>
  );
}