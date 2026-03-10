// RUTA: apps/portfolio-web/src/app/[lang]/quienes-somos/page.tsx
// VERSIÓN: 1.1 - Server Component (Corregido)
// DESCRIPCIÓN: Eliminado 'use client'. Ahora puede importar funciones de servidor.

import type { Metadata } from 'next';
import Link from 'next/link';
import { BlurText } from '@/components/razBits/BlurText';
import { FadeIn } from '@/components/ui/FadeIn';
import { type Locale } from '@/config/i18n.config';
import { getDictionary } from '@/lib/get-dictionary';

type PageProps = { params: Promise<{ lang: Locale }> };

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const { lang } = await props.params;
  const dict = await getDictionary(lang);
  return { title: dict.quienes_somos.page_title, description: dict.quienes_somos.page_description };
}

export default async function QuienesSomosPage(props: PageProps) {
  const { lang } = await props.params;
  const dict = await getDictionary(lang);
  const t = dict.quienes_somos;

  return (
    <main className="min-h-screen bg-[#020202] text-white pt-32 pb-20">
      <div className="container mx-auto px-6">
        <section className="mb-24 text-center">
          <BlurText text={t.hero_title} className="font-display text-5xl md:text-8xl font-bold tracking-tighter justify-center mb-6" />
          <FadeIn delay={0.3}>
            <p className="text-zinc-400 text-lg md:text-xl max-w-2xl mx-auto italic">{t.hero_subtitle}</p>
          </FadeIn>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
          {[t.luxury_pillar, t.comfort_pillar, t.service_pillar].map((pillar, i) => (
            <FadeIn key={i} delay={0.5 + (i * 0.1)}>
              <div className="p-8 rounded-3xl border border-white/10 bg-zinc-900/50 hover:border-purple-500/50 transition-all hover:-translate-y-2">
                <h3 className="font-display text-2xl font-bold mb-4 text-purple-400">{pillar.title}</h3>
                <p className="text-zinc-400 leading-relaxed">{pillar.description}</p>
              </div>
            </FadeIn>
          ))}
        </section>

        <section className="text-center bg-white/5 p-16 rounded-3xl border border-white/5">
          <h2 className="font-display text-4xl font-bold mb-8">{t.cta_title}</h2>
          <Link href={`/${lang}/#reservas`} className="rounded-full bg-white px-10 py-5 font-bold text-black hover:scale-105 transition-transform">
            {t.cta_button}
          </Link>
        </section>
      </div>
    </main>
  );
}