/**
 * @file apps/portfolio-web/src/app/[lang]/quienes-somos/page.tsx
 * @description Orquestador de la narrativa institucional "Nuestra Historia". 
 *              Presenta los valores fundamentales del hotel con una estética de lujo.
 *              Cumple con el estándar de Next.js 15 y fronteras de Nx.
 * @version 2.0
 * @author Raz Podestá - MetaShark Tech
 */

import type { Metadata } from 'next';
import Link from 'next/link';

/**
 * IMPORTACIONES NIVELADAS (Rutas relativas para cumplimiento @nx/enforce-module-boundaries)
 */
import { BlurText } from '../../../components/razBits/BlurText';
import { FadeIn } from '../../../components/ui/FadeIn';
import { type Locale } from '../../../config/i18n.config';
import { getDictionary } from '../../../lib/get-dictionary';
import { cn } from '../../../lib/utils/cn';

/**
 * Propiedades de la página (Next.js 15 asynchronous params).
 */
type PageProps = { 
  params: Promise<{ lang: Locale }> 
};

/**
 * Orquestador de Metadatos: Construye la identidad SEO institucional.
 */
export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const { lang } = await props.params;
  const dict = await getDictionary(lang);
  
  return { 
    title: `${dict.quienes_somos.page_title} | Beach Hotel Canasvieiras`, 
    description: dict.quienes_somos.page_description,
    alternates: {
      canonical: `/${lang}/quienes-somos`,
    },
    openGraph: {
      title: dict.quienes_somos.page_title,
      description: dict.quienes_somos.page_description,
      type: 'website',
    }
  };
}

/**
 * Aparato Institucional: QuienesSomosPage.
 * Renderiza la historia y pilares mediante un flujo inmersivo de animaciones.
 */
export default async function QuienesSomosPage(props: PageProps) {
  const { lang } = await props.params;
  const dict = await getDictionary(lang);
  const t = dict.quienes_somos;

  // Definición de la colección de pilares para mapeo semántico
  const pillars = [
    { ...t.luxury_pillar, color: 'text-purple-400' },
    { ...t.comfort_pillar, color: 'text-pink-400' },
    { ...t.service_pillar, color: 'text-blue-400' },
  ];

  return (
    <main className="min-h-screen bg-[#050505] text-white pt-40 pb-24 selection:bg-purple-500/30">
      <div className="container mx-auto px-6">
        
        {/* 1. HERO NARRATIVO */}
        <section className="mb-32 text-center" aria-labelledby="about-title">
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
            <p className="mt-10 text-zinc-400 text-lg md:text-2xl max-w-2xl mx-auto italic font-light leading-relaxed">
              {t.hero_subtitle}
            </p>
          </FadeIn>
        </section>

        {/* 2. GRID DE PILARES DE HOSPITALIDAD */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 mb-32" aria-label="Nuestros valores">
          {pillars.map((pillar, i) => (
            <FadeIn key={i} delay={0.5 + (i * 0.1)} yOffset={30}>
              <div className={cn(
                "h-full p-10 rounded-4xl border border-white/5 bg-zinc-900/30 backdrop-blur-sm transition-all duration-500",
                "hover:border-white/10 hover:bg-zinc-900/50 hover:-translate-y-2 hover:shadow-2xl shadow-black"
              )}>
                <h3 className={cn("font-display text-2xl font-bold mb-6 tracking-tight", pillar.color)}>
                  {pillar.title}
                </h3>
                <p className="text-zinc-400 leading-relaxed font-sans text-sm md:text-base">
                  {pillar.description}
                </p>
              </div>
            </FadeIn>
          ))}
        </section>

        {/* 3. SECCIÓN DE CONVERSIÓN (CTA) */}
        <FadeIn delay={0.8} yOffset={0}>
          <section className="text-center bg-white/02 p-12 md:p-24 rounded-[3rem] border border-white/5 relative overflow-hidden">
            {/* Glow decorativo interno */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-purple-500/10 blur-[100px] rounded-full pointer-events-none" />
            
            <h2 className="font-display text-4xl md:text-6xl font-bold mb-10 text-white tracking-tighter">
              {t.cta_title}
            </h2>
            <Link 
              href={`/${lang}/#reservas`} 
              className="group relative inline-flex items-center gap-4 rounded-full bg-white px-12 py-5 font-bold text-black uppercase tracking-[0.2em] text-xs transition-all hover:bg-purple-600 hover:text-white active:scale-95 shadow-xl shadow-black/20"
            >
              {t.cta_button}
            </Link>
          </section>
        </FadeIn>
      </div>

      {/* Artefacto de fondo estructural */}
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.03),transparent_40%)] pointer-events-none" />
    </main>
  );
}