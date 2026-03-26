/**
 * @file page.tsx
 * @description Orquestador Soberano de la Landing Page (Recepción).
 *              Implementa un Embudo de Conversión de alta fidelidad integrando 
 *              el motor editorial 3D y la telemetría del Santuario.
 * @version 20.0 - Full Funnel & Blog Facade Integration
 * @author Raz Podestá - MetaShark Tech
 */

import { Suspense } from 'react';
import type { Metadata } from 'next';

/**
 * IMPORTACIONES DE INFRAESTRUCTRURA
 * @pilar V: Adherencia arquitectónica. Uso de Fachada de Dominio y extensiones ESM.
 */
import { getDictionary } from '../../lib/get-dictionary.js';
import { getAllPosts } from '../../lib/blog-api.js';
import type { Locale } from '../../config/i18n.config.js';
import { JsonLdScript } from '../../components/ui/JsonLdScript.js';

/**
 * APARATOS DE SECCIÓN (Lego System)
 * @pilar IX: Componentización desacoplada.
 */
import { HeroCarousel } from '../../components/sections/homepage/HeroCarousel.js';
import { LiveStatusTicker } from '../../components/sections/homepage/LiveStatusTicker.js';
import { AboutSection } from '../../components/sections/homepage/AboutSection.js';
import { AiContentSection } from '../../components/sections/homepage/AiContentSection.js';
import { ExperienceShowcase3D } from '../../components/sections/homepage/ExperienceShowcase3D.js';
import { ValuePropositionSection } from '../../components/sections/homepage/ValuePropositionSection.js';
import { BlogSection3D } from '../../components/sections/homepage/BlogSection3D.js';
import { HistorySection } from '../../components/sections/homepage/HistorySection.js';
import { ContactSection } from '../../components/sections/homepage/ContactSection.js';

/**
 * @interface PageProps
 * @description Contrato de parámetros asíncronos para Next.js 15 Standard.
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
  const { lang } = await props.params;

  /**
   * @pilar X: Rendimiento de Élite.
   * Obtención paralela de Diccionario y Contenido Editorial para minimizar el bloqueo.
   */
  const [dict, posts] = await Promise.all([
    getDictionary(lang),
    getAllPosts(lang)
  ]);

  /**
   * DATOS ESTRUCTURADOS (Schema.org)
   * @description Provee contexto semántico rico para el posicionamiento del Hotel.
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
    "priceRange": "R$$-R$$$"
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
        <Suspense fallback={<div className="h-24 w-full bg-[#050505] animate-pulse border-y border-white/5" />}>
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

      {/* --- FASE 5: TAKEOVER (EXCLUSIVITY) --- */}
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

      {/* --- FASE 7: EVIDENCIA EDITORIAL (AUTHORITY) --- 
          @pilar XII: MEA/UX - Inyección del carrusel 3D con datos de la fachada.
      */}
      <section id="journal-preview" className="relative w-full z-10">
        <BlogSection3D 
          posts={posts} 
          dictionary={dict.blog_page} 
          lang={lang} 
        />
      </section>

      {/* --- FASE 8: LEGADO (HERITAGE) --- */}
      <HistorySection dictionary={dict.history} />

      {/* --- FASE 9: CONVERSIÓN FINAL (ACTION) --- */}
      <footer id="reservas" className="relative w-full border-t border-white/5 z-10 bg-[#020202]">
        <ContactSection dictionary={dict.contact} />
      </footer>
    </div>
  );
}