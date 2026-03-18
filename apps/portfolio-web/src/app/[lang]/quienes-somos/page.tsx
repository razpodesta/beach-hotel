/**
 * @file page.tsx (Quienes Somos)
 * @description Orquestador soberano de la página "Nuestra Historia".
 *              Proyecta el legado del hotel mediante renderizado en servidor (SSR),
 *              datos estructurados y una coreografía de animaciones de alta fidelidad.
 * @version 3.0 - Elite Hospitality Resilience
 * @author Raz Podestá - MetaShark Tech
 */

import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';

/**
 * IMPORTACIONES DE INFRAESTRUCTRURA
 * @pilar V: Adherencia arquitectónica.
 */
import { BlurText } from '../../../components/razBits/BlurText';
import { FadeIn } from '../../../components/ui/FadeIn';
import { type Locale } from '../../../config/i18n.config';
import { getDictionary } from '../../../lib/get-dictionary';
import { cn } from '../../../lib/utils/cn';
import { getLocalizedHref } from '../../../lib/utils/link-helpers';

/**
 * @interface PageProps
 * @description Contrato de parámetros asíncronos para Next.js 15.
 */
interface PageProps { 
  params: Promise<{ lang: Locale }> 
}

/**
 * @interface LocalPillar
 * @description Estructura extendida de un pilar de hospitalidad para la UI.
 */
interface LocalPillar {
  title: string;
  description: string;
  color: string;
}

/**
 * GENERACIÓN DE METADATOS SOBERANOS
 * @pilar I: Visión Holística - SEO E-E-A-T.
 */
export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const { lang } = await props.params;
  const dict = await getDictionary(lang);
  
  if (!dict.quienes_somos) return { title: 'Nossa História | Beach Hotel' };

  const { page_title, page_description } = dict.quienes_somos;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://beachhotelcanasvieiras.com';

  return { 
    title: `${page_title} | Beach Hotel Canasvieiras`, 
    description: page_description,
    alternates: {
      canonical: `${baseUrl}/${lang}/quienes-somos`,
    },
    openGraph: {
      title: page_title,
      description: page_description,
      type: 'website',
      url: `${baseUrl}/${lang}/quienes-somos`,
      siteName: 'Beach Hotel Canasvieiras',
    }
  };
}

/**
 * APARATO PRINCIPAL: QuienesSomosPage
 * @description Orquesta el contenido narrativo desde el servidor.
 */
export default async function QuienesSomosPage(props: PageProps) {
  const { lang } = await props.params;
  
  // Protocolo Heimdall: Trazabilidad de orquestación
  console.log(`[HEIMDALL][SSR] Orchestrating QuienesSomosPage for locale: ${lang}`);

  const dict = await getDictionary(lang);
  const t = dict.quienes_somos;

  // @pilar VIII: Guardia de Resiliencia ante fallos de carga de diccionario
  if (!t) {
    console.error(`[HEIMDALL][CRITICAL] Missing 'quienes_somos' dictionary for ${lang}`);
    return null;
  }

  /**
   * PROCESAMIENTO DE PILARES
   * @pilar III: Seguridad de Tipos Absoluta.
   */
  const processedPillars: LocalPillar[] = [
    { ...t.luxury_pillar, color: 'text-purple-400' },
    { ...t.comfort_pillar, color: 'text-pink-400' },
    { ...t.service_pillar, color: 'text-blue-400' },
  ];

  const reservationHref = getLocalizedHref('/#reservas', lang);

  return (
    <main className="min-h-screen bg-[#050505] text-white pt-40 pb-24 selection:bg-purple-500/30">
      <div className="container mx-auto px-6">
        
        {/* 1. HERO NARRATIVO: El Legado */}
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

        {/* 2. GRID DE HOSPITALIDAD: Valores Fundamentales */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 mb-32" aria-label="Nossos pilares de excelência">
          {processedPillars.map((pillar, i) => (
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
        </section>

        {/* 3. CONVERSIÓN: Invitación al Santuario */}
        <FadeIn delay={0.8} yOffset={0}>
          <section className="text-center bg-white/5 p-12 md:p-24 rounded-[3.5rem] border border-white/5 relative overflow-hidden">
            {/* Elemento MEA: Glow de atmósfera */}
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

      {/* Artefacto estructural de profundidad */}
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.03),transparent_40%)] pointer-events-none" />
    </main>
  );
}