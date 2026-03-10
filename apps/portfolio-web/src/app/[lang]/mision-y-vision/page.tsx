// RUTA: apps/portfolio-web/src/app/[lang]/mision-y-vision/page.tsx
// VERSIÓN: 4.0 - Serialización Corregida
// DESCRIPCIÓN: Se pasan cadenas de texto para identificar los iconos en lugar de
//              funciones, permitiendo que el Server Component serialice las props correctamente.

import type { Metadata } from 'next';
import { type Locale } from '@/config/i18n.config';
import { getDictionary } from '@/lib/get-dictionary';
import { BlurText } from '@/components/razBits/BlurText';
import { PillarCard } from '@/components/ui/PillarCard';
import { FadeIn } from '@/components/ui/FadeIn';
import React from 'react';
import type { VisionPillar } from '@/lib/schemas/mission_vision.schema';

type MissionVisionPageProps = {
  params: Promise<{ lang: Locale }>;
};

export async function generateMetadata(props: MissionVisionPageProps): Promise<Metadata> {
  const params = await props.params;
  const dictionary = await getDictionary(params.lang);
  const t = dictionary.mission_vision;
  return {
    title: `${t.mission_title} & ${t.vision_title}`,
    description: t.mission_description,
  };
}

// IDs de iconos mapeados como strings simples
const PILLAR_ICONS = ['book-open', 'brain-circuit', 'goal'];

export default async function MissionVisionPage(props: MissionVisionPageProps) {
  const params = await props.params;
  const dictionary = await getDictionary(params.lang);
  const t = dictionary.mission_vision;

  return (
    <div className={`font-display ${'var(--font-display)'}`}>
      <main className="container mx-auto px-4 py-20 sm:py-32">
        <section className="mx-auto max-w-4xl text-center">
          <BlurText
            text={t.mission_title}
            className="font-display text-4xl font-bold tracking-tight text-white sm:text-5xl justify-center mb-6"
            animateBy="words"
          />
          <FadeIn delay={0.5}>
            <p className="font-sans text-lg text-zinc-400">
              {t.mission_description}
            </p>
          </FadeIn>
        </section>

        <div className="mx-auto my-20 h-px w-2/3 bg-zinc-800" />

        <section className="mx-auto max-w-5xl text-center">
          <BlurText
            text={t.vision_title}
            className="font-display text-4xl font-bold tracking-tight text-white sm:text-5xl justify-center mb-4"
            animateBy="words"
          />
          <FadeIn delay={0.5}>
            <p className="font-sans text-lg text-zinc-400 mb-20">
              {t.vision_subtitle}
            </p>
          </FadeIn>

          <div className="flex flex-col md:flex-row items-center md:items-end justify-center gap-8">
            {t.vision_pillars.map((pillar: VisionPillar, index: number) => (
              <React.Fragment key={pillar.title}>
                <PillarCard
                  iconName={PILLAR_ICONS[index]} // <-- CAMBIO: Pasamos string
                  title={pillar.title}
                  description={pillar.description}
                  sequence={index + 1}
                  className="flex-1 min-w-0"
                />
              </React.Fragment>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
