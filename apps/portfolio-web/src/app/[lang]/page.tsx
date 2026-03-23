/**
 * @file page.tsx
 * @description Orquestador Soberano de la Landing Page (Recepción).
 *              Implementa un Embudo de Ventas (Conversion Funnel) de próxima generación.
 *              Refactorizado: 100% Data-Driven, Resolución de Error TS2741 y SEO Pro.
 * @version 19.0 - Triple-Check Integrity Edition
 * @author Raz Podestá - MetaShark Tech
 */

import { Suspense } from 'react';
import type { Metadata } from 'next';

/**
 * IMPORTACIONES DE INFRAESTRUCTRURA
 * @pilar V: Adherencia arquitectónica mediante fronteras Nx.
 */
import { getDictionary } from '../../lib/get-dictionary';
import { type Locale } from '../../config/i18n.config';
import { JsonLdScript } from '../../components/ui/JsonLdScript';

/**
 * APARATOS DE SECCIÓN (Lego System)
 * @pilar IX: Componentización desacoplada.
 */
import { HeroCarousel } from '../../components/sections/homepage/HeroCarousel';
import { LiveStatusTicker } from '../../components/sections/homepage/LiveStatusTicker';
import { AboutSection } from '../../components/sections/homepage/AboutSection';
import { AiContentSection } from '../../components/sections/homepage/AiContentSection';
import { ExperienceShowcase3D } from '../../components/sections/homepage/ExperienceShowcase3D';
import { ValuePropositionSection } from '../../components/sections/homepage/ValuePropositionSection';
import { HistorySection } from '../../components/sections/homepage/HistorySection';
import { ContactSection } from '../../components/sections/homepage/ContactSection';

/**
 * @interface PageProps
 * @description Contrato de parámetros asíncronos para Next.js 15.
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
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://beachhotelcanasvieiras.com';
  
  return {
    title: `Beach Hotel Canasvieiras | ${dict.header.tagline}`,
    description: dict.hero.page_description,
    alternates: { canonical: `${baseUrl}/${lang}` },
    openGraph: {
      title: `Beach Hotel Canasvieiras | ${dict.header.tagline}`,
      description: dict.hero.page_description,
      url: `${baseUrl}/${lang}`,
      siteName: 'Beach Hotel Canasvieiras',
      images: [{
        url: '/images/hotel/og-main.jpg',
        width: 1200,
        height: 630,
        alt: dict.header.personal_portfolio,
      }],
      type: 'website',
    }
  };
}

/**
 * APARATO PRINCIPAL: HotelHomePage
 * @description Orquesta la composición del embudo comercial mediante inyección atómica de SSoT.
 */
export default async function HotelHomePage(props: PageProps) {
  // @pilar III: Resolución asíncrona de parámetros obligatoria
  const { lang } = await props.params;
  const dict = await getDictionary(lang);

  /**
   * DATOS ESTRUCTURADOS (Schema.org)
   * @description Provee contexto semántico rico para motores de búsqueda.
   */
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Hotel",
    "name": dict.header.personal_portfolio,
    "description": dict.hero.page_description,
    "image": "/images/hotel/og-main.jpg",
    "url": "https://beachhotelcanasvieiras.com",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Av. das Nações, 123",
      "addressLocality": "Florianópolis",
      "addressRegion": "SC",
      "postalCode": "88054-000",
      "addressCountry": "BR"
    },
    "telephone": "+5548999999999",
    "priceRange": "R$$-R$$$",
    "containsPlace": dict.suite_gallery.cat_all
  };

  return (
    <div className="bg-[#050505] min-h-screen selection:bg-primary/30 flex flex-col overflow-x-hidden">
      {/* Cimiento de Infraestructura SEO */}
      <JsonLdScript data={structuredData} />

      {/* --- FASE 1: ATENCIÓN (AWARENESS) --- */}
      <header id="hero" className="relative w-full" aria-label="Hero Experience">
        <HeroCarousel dictionary={dict.hero} />
      </header>

      {/* --- FASE 2: VALIDACIÓN SOCIAL (TRUST) --- */}
      <aside id="pulse" className="relative z-20">
        <Suspense fallback={<div className="h-14 w-full bg-zinc-950 animate-pulse border-y border-white/5" />}>
          <LiveStatusTicker dictionary={dict.system_status} />
        </Suspense>
      </aside>

      {/* --- FASE 3: CONEXIÓN EMOCIONAL (CONSIDERATION) --- */}
      <section id="about" className="relative z-10 w-full bg-black">
        <AboutSection dictionary={dict.about} />
      </section>

      {/* --- FASE 4: INNOVACIÓN Y HYPE (DIFFERENTIATION) --- */}
      <section id="visual-synth" className="relative z-10 w-full border-t border-white/5 bg-[#050505]">
        <AiContentSection dictionary={dict.ai_gallery_section} />
      </section>

      {/* --- FASE 5: TAKEOVER (EXCLUSIVITY) --- 
          @fix TS2741: Inyección soberana del diccionario festival nivelado.
      */}
      <section id="festival-preview" className="relative w-full bg-zinc-950/30 border-t border-white/5" aria-label="Pride Escape Takeover">
        <div className="container mx-auto px-6 pt-24 text-center md:text-left">
            <span className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-5 py-2 text-[10px] font-bold uppercase tracking-[0.4em] text-purple-400">
                {dict.festival.hero.title}
            </span>
        </div>
        <Suspense fallback={<div className="h-[600px] w-full flex items-center justify-center bg-zinc-950/20" />}>
            <ExperienceShowcase3D dictionary={dict.festival} />
        </Suspense>
      </section>

      {/* --- FASE 6: JUSTIFICACIÓN LÓGICA (VALUE) --- */}
      <section id="pillars" className="relative w-full z-10">
        <ValuePropositionSection dictionary={dict.value_proposition} />
      </section>

      {/* --- FASE 7: LEGADO (AUTHORITY) --- */}
      <HistorySection dictionary={dict.history} />

      {/* --- FASE 8: CONVERSIÓN FINAL (ACTION) --- */}
      <footer id="reservas" className="relative w-full border-t border-white/5 z-10 bg-[#020202]">
        <ContactSection dictionary={dict.contact} />
      </footer>
    </div>
  );
}