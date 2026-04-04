/**
 * @file apps/portfolio-web/src/app/[lang]/quienes-somos/page.tsx
 * @description Orquestador soberano de la narrativa institucional (Nuestra Historia).
 *              Refactorizado: Blindaje de renderizado estático, eliminación de 
 *              castings inseguros y resiliencia de build absoluta.
 * @version 7.0 - Static Build Hardened & Type Safe
 * @author Raz Podestá - MetaShark Tech
 */

import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';

/**
 * IMPORTACIONES DE INFRAESTRUCTRURA
 */
import { BlurText } from '../../../components/razBits/BlurText';
import { FadeIn } from '../../../components/ui/FadeIn';
import { type Locale } from '../../../config/i18n.config';
import { getDictionary } from '../../../lib/get-dictionary';
import { cn } from '../../../lib/utils/cn';
import { getLocalizedHref } from '../../../lib/utils/link-helpers';

/**
 * @pilar VIII: Resiliencia de Infraestructura.
 * Forzamos renderizado estático para evitar llamadas a runtime en el build.
 */
export const dynamic = 'force-static';
export const revalidate = false;

interface PageProps { 
  params: Promise<{ lang: Locale }> 
}

/**
 * @interface LocalPillar
 */
interface LocalPillar {
  title: string;
  description: string;
  color: string;
}

/**
 * GENERACIÓN DE METADATOS SOBERANOS
 */
export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const { lang } = await props.params;
  const dictionary = await getDictionary(lang).catch(() => ({ 
    quienes_somos: { page_title: 'Nossa História', page_description: '' } 
  }));
  
  const t = dictionary.quienes_somos;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://beachhotelcanasvieiras.com';

  return { 
    title: `${t.page_title} | Beach Hotel Canasvieiras`, 
    description: t.page_description,
    alternates: {
      canonical: `${baseUrl}/${lang}/quienes-somos`,
    },
    openGraph: {
      title: t.page_title,
      description: t.page_description,
      type: 'website',
      url: `${baseUrl}/${lang}/quienes-somos`,
      siteName: 'Beach Hotel Canasvieiras',
    }
  };
}

//const PILLAR_ICONS = ['book-open', 'brain-circuit', 'goal'] as const;

/**
 * APARATO PRINCIPAL: QuienesSomosPage
 */
export default async function QuienesSomosPage(props: PageProps) {
  const { lang } = await props.params;
  const dictionary = await getDictionary(lang);
  const t = dictionary.quienes_somos;

  const processedPillars: LocalPillar[] = [
    { ...t.luxury_pillar, color: 'text-purple-400' },
    { ...t.comfort_pillar, color: 'text-pink-400' },
    { ...t.service_pillar, color: 'text-blue-400' },
  ];

  const reservationHref = getLocalizedHref('/#reservas', lang);

  return (
    <main className="min-h-screen bg-[#050505] text-white pt-40 pb-24 selection:bg-purple-500/30">
      <div className="container mx-auto px-6">
        
        <section className="mb-32 text-center" aria-labelledby="history-hero-title">
          <header className="space-y-6">
            <span className="text-[10px] font-bold tracking-[0.6em] text-zinc-600 uppercase block animate-fade-in">
              The Sanctuary Legacy
            </span>
            <BlurText 
              text={t.hero_title.toUpperCase()} 
              className="font-display text-5xl md:text-8xl lg:text-9xl font-bold tracking-tighter justify-center text-white" 
              delay={50}
            />
          </header>
          
          <FadeIn delay={0.4} yOffset={20}>
            <p className="mt-10 text-zinc-400 text-lg md:text-2xl max-w-3xl mx-auto italic font-light leading-relaxed">
              {t.hero_subtitle}
            </p>
          </FadeIn>
        </section>

        <div className="relative mx-auto my-32 h-px w-full max-w-5xl bg-linear-to-r from-transparent via-zinc-800 to-transparent" />

        <section className="mx-auto max-w-6xl text-center" aria-label="Nossos pilares de excelência">
          <header className="mb-20">
            <span className="text-[10px] font-bold tracking-[0.4em] text-pink-500 uppercase mb-4 block">
               Future Strategy
            </span>
            <BlurText
              text={t.cta_title}
              className="font-display text-5xl md:text-7xl font-bold tracking-tighter text-white justify-center mb-8"
              animateBy="words"
            />
          </header>

          <div className="grid grid-cols-1 md:grid-cols-3 items-stretch gap-8 lg:gap-12 mb-32">
            {processedPillars.map((pillar: LocalPillar, i: number) => (
              <FadeIn key={`pillar-${i}`} delay={0.5 + (i * 0.1)} yOffset={30}>
                <div className={cn(
                  "h-full p-10 rounded-[2.5rem] border border-white/5 bg-zinc-900/30 backdrop-blur-sm transition-all duration-700",
                  "hover:border-white/10 hover:bg-zinc-900/50 hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
                )}>
                  <h3 className={cn("font-display text-2xl font-bold mb-6 tracking-tight", pillar.color)}>
                    {pillar.title}
                  </h3>
                  <p className="text-zinc-400 leading-relaxed font-sans text-sm md:text-base font-light">
                    {pillar.description}
                  </p>
                </div>
              </FadeIn>
            ))}
          </div>
        </section>

        <FadeIn delay={0.8} yOffset={0}>
          <section className="text-center bg-white/5 p-12 md:p-24 rounded-[3.5rem] border border-white/5 relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-80 bg-purple-500/10 blur-[120px] rounded-full pointer-events-none" />
            
            <h2 className="font-display text-4xl md:text-7xl font-bold mb-12 text-white tracking-tighter leading-none">
              {t.cta_title}
            </h2>
            <Link 
              href={reservationHref} 
              className={cn(
                "group relative inline-flex items-center gap-6 rounded-full bg-white px-12 py-5 font-bold text-black uppercase tracking-[0.3em] text-[10px]",
                "transition-all duration-500 hover:bg-purple-600 hover:text-white hover:shadow-3xl shadow-purple-500/20 active:scale-95"
              )}
            >
              {t.cta_button}
            </Link>
          </section>
        </FadeIn>
      </div>
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.03),transparent_40%)] pointer-events-none" />
    </main>
  );
}