/**
 * @file page.tsx
 * @description Orquestador Soberano de la Landing Page (Recepción).
 *              Refactorizado: Erradicación de errores TS2305/TS2552, limpieza de 
 *              importaciones ESLint y sellado del Protocolo Day-First.
 * @version 24.0 - Atmosphere Master & Linter Pure
 * @author Raz Podestá - MetaShark Tech
 */

import { Suspense } from 'react';
import type { Metadata } from 'next';

/**
 * IMPORTACIONES DE INFRAESTRUCTRURA
 * @pilar V: Adherencia arquitectónica.
 */
import { getDictionary } from '../../lib/get-dictionary';
import { getAllPosts } from '../../lib/blog-api';
import type { Locale } from '../../config/i18n.config';
import { JsonLdScript } from '../../components/ui/JsonLdScript';

/**
 * APARATOS DE SECCIÓN (Lego System)
 * @pilar IX: Componentización de responsabilidad única.
 */
import { HeroCarousel } from '../../components/sections/homepage/HeroCarousel';
import { LiveStatusTicker } from '../../components/sections/homepage/LiveStatusTicker'; 
import { AboutSection } from '../../components/sections/homepage/AboutSection';
import { AiContentSection } from '../../components/sections/homepage/AiContentSection';
import { ExperienceShowcase3D } from '../../components/sections/homepage/ExperienceShowcase3D';
import { ValuePropositionSection } from '../../components/sections/homepage/ValuePropositionSection';
import { BlogSection3D } from '../../components/sections/homepage/BlogSection3D';
import { HistorySection } from '../../components/sections/homepage/HistorySection';
import { ContactSection } from '../../components/sections/homepage/ContactSection';

/**
 * @interface PageProps
 * @description Parámetros asíncronos nativos de Next.js 15.
 */
type PageProps = { 
  params: Promise<{ lang: Locale }>;
};

/**
 * GENERACIÓN DE METADATOS SOBERANOS
 * @pilar I: Visión Holística - SEO E-E-A-T.
 */
export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const { lang } = await props.params;
  const dict = await getDictionary(lang);
  const siteName = dict.header.personal_portfolio;

  return {
    title: `${siteName} | ${dict.header.tagline}`,
    description: dict.hero.page_description,
    alternates: { canonical: `/${lang}` },
    openGraph: {
      title: `${siteName} | ${dict.header.tagline}`,
      description: dict.hero.page_description,
      url: `/${lang}`,
      siteName: siteName,
      type: 'website',
    }
  };
}

/**
 * APARATO PRINCIPAL: HotelHomePage
 * @description Ensambla el embudo de conversión adaptándose a la atmósfera global.
 */
export default async function HotelHomePage(props: PageProps) {
  const { lang } = await props.params;

  /**
   * PROTOCOLO HEIMDALL: Telemetría de Orquestación
   * @pilar IV: Trazabilidad de carga masiva paralela.
   */
  console.log(`[HEIMDALL][ORCHESTRATOR] Assembling Sovereign Reception: [${lang}]`);

  const [dict, posts] = await Promise.all([
    getDictionary(lang),
    getAllPosts(lang).catch((error) => {
      console.error('[HEIMDALL][CRITICAL] Editorial sync failed. Fallback engaged.', error);
      return []; 
    })
  ]);

  /**
   * DATOS ESTRUCTURADOS (Schema.org)
   */
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Hotel",
    "name": dict.header.personal_portfolio,
    "description": dict.hero.page_description,
    "url": process.env.NEXT_PUBLIC_BASE_URL
  };

  return (
    <div className="bg-background min-h-screen flex flex-col overflow-x-hidden transition-colors duration-1000">
      {/* Cimiento de Infraestructura SEO */}
      <JsonLdScript data={structuredData} />

      {/* --- FASE 1: ATENCIÓN (AWARENESS) --- */}
      <header id="hero" className="relative w-full">
        <HeroCarousel dictionary={dict.hero} />
      </header>

      {/* --- FASE 2: VALIDACIÓN SOCIAL (TRUST) --- 
          @pilar X: Altura reservada adaptativa para evitar CLS.
      */}
      <aside id="pulse" className="relative z-20">
        <Suspense fallback={<div className="h-[82px] w-full bg-background border-y border-border animate-pulse" />}>
          <LiveStatusTicker dictionary={dict.system_status} />
        </Suspense>
      </aside>

      {/* --- FASE 3: CONEXIÓN EMOCIONAL (CONSIDERATION) --- */}
      <section id="about" className="relative z-10 w-full">
        <AboutSection dictionary={dict.about} />
      </section>

      {/* --- FASE 4: INNOVACIÓN (DIFFERENTIATION) --- */}
      <section id="visual-synth" className="relative z-10 w-full">
        <AiContentSection dictionary={dict.ai_gallery_section} />
      </section>

      {/* --- FASE 5: TAKEOVER (EXCLUSIVITY) --- */}
      <section id="festival-preview" className="relative w-full bg-surface/30 border-t border-border">
        <div className="container mx-auto px-6 pt-24 text-center md:text-left">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-5 py-2 text-[10px] font-bold uppercase tracking-[0.4em] text-primary">
                {dict.festival.hero.title}
            </span>
        </div>
        <Suspense fallback={<div className="h-[600px] w-full flex items-center justify-center bg-surface/20" />}>
            <ExperienceShowcase3D dictionary={dict.festival} />
        </Suspense>
      </section>

      {/* --- FASE 6: JUSTIFICACIÓN LÓGICA (VALUE) --- */}
      <section id="pillars" className="relative w-full z-10">
        <ValuePropositionSection dictionary={dict.value_proposition} />
      </section>

      {/* --- FASE 7: EVIDENCIA EDITORIAL (AUTHORITY) --- */}
      <section id="journal-preview" className="relative w-full z-10">
        <BlogSection3D 
          posts={posts} 
          dictionary={dict.blog_page} 
          lang={lang} 
        />
      </section>

      {/* --- FASE 8: LEGADO (HERITAGE) --- 
          @fix TS2552: Referencia correcta a 'dict.history' tras nivelación MACS.
      */}
      <HistorySection dictionary={dict.history} />

      {/* --- FASE 9: CONVERSIÓN FINAL (ACTION) --- */}
      <footer id="reservas" className="relative w-full border-t border-border z-10">
        <ContactSection dictionary={dict.contact} />
      </footer>
    </div>
  );
}