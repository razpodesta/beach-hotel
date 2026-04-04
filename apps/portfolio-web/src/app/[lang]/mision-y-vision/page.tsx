/**
 * @file apps/portfolio-web/src/app/[lang]/mision-y-vision/page.tsx
 * @description Orquestador de la narrativa institucional (Misión y Visión).
 *              Refactorizado: Blindaje de renderizado estático y resiliencia 
 *              de build frente a variables de entorno.
 * @version 7.0 - Static Build Hardened
 * @author Staff Engineer - MetaShark Tech
 */

import React from 'react';
import type { Metadata } from 'next';

/**
 * IMPORTACIONES NIVELADAS
 */
import { type Locale } from '../../../config/i18n.config';
import { getDictionary } from '../../../lib/get-dictionary';
import { BlurText } from '../../../components/razBits/BlurText';
import { PillarCard } from '../../../components/ui/PillarCard';
import { FadeIn } from '../../../components/ui/FadeIn';
import type { VisionPillar } from '../../../lib/schemas/mission_vision.schema';

/**
 * @pilar VIII: Resiliencia de Infraestructura.
 * Forzamos renderizado estático.
 */
export const dynamic = 'force-static';
export const revalidate = false;

type MissionVisionPageProps = {
  params: Promise<{ lang: Locale }>;
};

/**
 * Orquestador de Metadatos con Blindaje.
 */
export async function generateMetadata(props: MissionVisionPageProps): Promise<Metadata> {
  const { lang } = await props.params;
  const dictionary = await getDictionary(lang).catch(() => ({ 
    mission_vision: { mission_title: 'Misión', vision_title: 'Visión', mission_description: '' } 
  }));
  const t = dictionary.mission_vision;
  
  return {
    title: `${t.mission_title} & ${t.vision_title}`,
    description: t.mission_description,
    openGraph: {
      title: `${t.mission_title} | Beach Hotel Canasvieiras`,
      description: t.mission_description,
      type: 'website',
    }
  };
}

const PILLAR_ICONS = ['book-open', 'brain-circuit', 'goal'] as const;

export default async function MissionVisionPage(props: MissionVisionPageProps) {
  const { lang } = await props.params;
  const dictionary = await getDictionary(lang);
  const t = dictionary.mission_vision;

  return (
    <main className="min-h-screen bg-[#050505] text-zinc-300 selection:bg-purple-500/30 transition-colors duration-1000">
      <div className="container mx-auto px-6 py-32 sm:py-48">
        
        {/* 1. SECCIÓN: MISIÓN */}
        <section className="mx-auto max-w-4xl text-center mb-32">
          <header className="mb-12">
            <span className="text-[10px] font-bold tracking-[0.4em] text-purple-500 uppercase mb-4 block">
               Core Purpose
            </span>
            <BlurText
              text={t.mission_title}
              className="font-display text-5xl md:text-7xl font-bold tracking-tighter text-white justify-center"
              animateBy="words"
            />
          </header>
          
          <FadeIn delay={0.4} yOffset={30}>
            <p className="font-sans text-lg md:text-2xl text-zinc-400 leading-relaxed max-w-3xl mx-auto">
              {t.mission_description}
            </p>
          </FadeIn>
        </section>

        <div className="relative mx-auto my-32 h-px w-full max-w-5xl bg-linear-to-r from-transparent via-zinc-800 to-transparent" />

        {/* 2. SECCIÓN: VISIÓN */}
        <section className="mx-auto max-w-6xl text-center">
          <header className="mb-20">
            <span className="text-[10px] font-bold tracking-[0.4em] text-pink-500 uppercase mb-4 block">
               Future Strategy
            </span>
            <BlurText
              text={t.vision_title}
              className="font-display text-5xl md:text-7xl font-bold tracking-tighter text-white justify-center mb-8"
              animateBy="words"
            />
            <FadeIn delay={0.2}>
              <p className="font-sans text-lg md:text-xl text-zinc-500 max-w-2xl mx-auto italic">
                {t.vision_subtitle}
              </p>
            </FadeIn>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-3 items-stretch gap-8 lg:gap-12">
            {t.vision_pillars.map((pillar: VisionPillar, index: number) => (
              <PillarCard
                key={pillar.title}
                iconName={PILLAR_ICONS[index] || 'goal'}
                title={pillar.title}
                description={pillar.description}
                sequence={index + 1}
                className="h-full"
              />
            ))}
          </div>
        </section>
      </div>

      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_bottom_left,rgba(168,85,247,0.05),transparent_40%)] pointer-events-none" />
    </main>
  );
}