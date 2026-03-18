/**
 * @file AboutSection.tsx
 * @description Presentación narrativa de marca. 
 *              Nivelado: Adaptación a jerarquía plana (Sovereign) y cumplimiento de esquema de párrafos.
 * @version 8.5 - Sovereign Type Mapping & Array Logic
 * @author Raz Podestá - MetaShark Tech
 */

'use client';

import React, { useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowRight, Landmark } from 'lucide-react';

/**
 * IMPORTACIONES DE INFRAESTRUCTRURA
 */
import { FadeIn } from '../../ui/FadeIn';
import { getLocalizedHref } from '../../../lib/utils/link-helpers';
import { i18n, type Locale } from '../../../config/i18n.config';
import type { Dictionary } from '../../../lib/schemas/dictionary.schema';

interface AboutSectionProps {
  /** 
   * @pilar III: Seguridad de Tipos. 
   * Mapeo directo al aparato soberano 'about'.
   */
  dictionary: Dictionary['about'];
}

/**
 * APARATO: AboutSection
 */
export function AboutSection({ dictionary }: AboutSectionProps) {
  const pathname = usePathname();

  /**
   * RESOLUCIÓN DE IDIOMA SOBERANA
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

  // @pilar VIII: Resiliencia - Guardia ante datos nulos para el Build
  if (!dictionary || !dictionary.paragraphs) return null;

  return (
    <section 
      id="about-sanctuary" 
      className="relative w-full overflow-hidden py-24 sm:py-32 bg-black"
      aria-labelledby="about-title"
    >
      <div className="relative z-10 container mx-auto px-6">
        <div className="grid grid-cols-1 items-stretch gap-16 lg:grid-cols-5 lg:gap-24">
          
          <div className="lg:col-span-2">
            <FadeIn delay={0.2} yOffset={40}>
              <div className="relative h-full min-h-[450px] rounded-[3rem] border border-white/5 bg-zinc-950/30 p-3 backdrop-blur-md">
                <div className="relative h-full w-full overflow-hidden rounded-[2.5rem] shadow-3xl">
                  <Image
                    src="/images/hotel/about-building-front.jpg"
                    alt="Sanctuary Façade"
                    fill
                    className="object-cover transition-transform duration-1000 hover:scale-105"
                    sizes="(max-width: 1024px) 100vw, 40vw"
                    priority
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black via-black/20 to-transparent" />
                  
                  <div className="absolute bottom-8 left-8 flex items-center gap-4">
                    <div className="h-12 w-12 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-2xl border border-white/10">
                      <Landmark size={22} className="text-purple-400" />
                    </div>
                    <span className="text-[10px] font-mono font-bold tracking-[0.4em] text-white uppercase">
                      Since 2026
                    </span>
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>

          <div className="lg:col-span-3 flex flex-col justify-center">
            <div className="space-y-10">
              <FadeIn delay={0.4}>
                <h2 id="about-title" className="font-display text-5xl md:text-7xl font-bold tracking-tighter text-white">
                  {dictionary.title}
                </h2>
              </FadeIn>

              <FadeIn delay={0.6} yOffset={20}>
                <div className="space-y-8 text-lg md:text-xl text-zinc-400 font-light leading-relaxed">
                  {dictionary.paragraphs.map((p, i) => (
                    <p key={`p-${i}`}>
                      {p.text} 
                      {p.highlight && (
                        <strong className="font-bold text-white ml-1 underline decoration-purple-500/30 decoration-4 underline-offset-8">
                          {p.highlight}
                        </strong>
                      )}
                    </p>
                  ))}
                </div>
              </FadeIn>

              <FadeIn delay={0.8} yOffset={0}>
                <div className="pt-8">
                  <Link
                    href={storyHref}
                    className="group inline-flex items-center gap-6 rounded-full bg-white px-12 py-5 text-[10px] font-bold text-black uppercase tracking-[0.3em] transition-all hover:bg-purple-600 hover:text-white active:scale-95"
                  >
                    {dictionary.cta_button} 
                    <ArrowRight size={18} className="transition-transform group-hover:translate-x-2" />
                  </Link>
                </div>
              </FadeIn>
            </div>
          </div>

        </div>
      </div>
      
      <div className="absolute top-0 right-0 w-1/3 h-full bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.03),transparent_70%)] pointer-events-none" />
    </section>
  );
}