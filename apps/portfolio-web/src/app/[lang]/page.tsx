/**
 * @file apps/portfolio-web/src/app/[lang]/page.tsx
 * @description Orquestador Soberano de la Landing Page (Recepción).
 *              Nivelado: Implementa el acceso directo a los aparatos (Sovereign Architecture),
 *              erradicando las regresiones TS2339 tras el aplanamiento del esquema.
 * @version 15.2 - Zero Homepage Nesting Sync
 * @author Raz Podestá - MetaShark Tech
 */

import { Suspense } from 'react';
import { type Metadata } from 'next';

/**
 * IMPORTACIONES DE INFRAESTRUCTRURA
 */
import { getDictionary } from '../../lib/get-dictionary';
import { type Locale } from '../../config/i18n.config';
import { JsonLdScript } from '../../components/ui/JsonLdScript';

/**
 * IMPORTACIONES DE APARATOS VISUALES
 */
import { HeroCarousel } from '../../components/sections/homepage/HeroCarousel';
import { LiveStatusTicker } from '../../components/sections/homepage/LiveStatusTicker';
import { AboutSection } from '../../components/sections/homepage/AboutSection';
import { AiContentSection } from '../../components/sections/homepage/AiContentSection';
import { ExperienceShowcase3D } from '../../components/sections/homepage/ExperienceShowcase3D';
import { ValuePropositionSection } from '../../components/sections/homepage/ValuePropositionSection';
import { HistorySection } from '../../components/sections/homepage/HistorySection';
import { ContactSection } from '../../components/sections/homepage/ContactSection';

type PageProps = { 
  params: Promise<{ lang: Locale }>;
};

/**
 * GENERACIÓN SOBERANA DE METADATOS
 * @pilar I: Visión Holística - SEO E-E-A-T.
 * Acceso corregido: dict.hero en lugar de dict.homepage.hero
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
      images:[
        {
          url: '/images/hotel/og-main.jpg',
          width: 1200,
          height: 630,
          alt: 'Vista panorámica del Beach Hotel Canasvieiras',
        }
      ],
      type: 'website',
    }
  };
}

/**
 * APARATO: HotelHomePage
 */
export default async function HotelHomePage(props: PageProps) {
  const { lang } = await props.params;
  const dict = await getDictionary(lang);

  /**
   * DATOS ESTRUCTURADOS (Schema.org)
   * Acceso corregido: dict.hero.page_description
   */
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Hotel",
    "name": "Beach Hotel Canasvieiras",
    "description": dict.hero.page_description,
    "image": "/images/hotel/og-main.jpg",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Av. das Nações",
      "addressLocality": "Florianópolis",
      "addressRegion": "SC",
      "postalCode": "88054-000",
      "addressCountry": "BR"
    },
    "telephone": "+5548999999999",
    "url": "https://beachhotelcanasvieiras.com"
  };

  return (
    <div className="bg-[#050505] min-h-screen selection:bg-purple-500/30 flex flex-col">
      <JsonLdScript data={structuredData} />

      {/* 1. RECEPCIÓN INMERSIVA (LCP) - Acceso: dict.hero */}
      <section id="hero" className="relative w-full" aria-label="Hero Section">
        <HeroCarousel dictionary={dict.hero} />
      </section>

      {/* 2. TELEMETRÍA EN VIVO */}
      <Suspense fallback={<div className="h-14 w-full bg-[#050505] border-y border-white/5 animate-pulse" aria-hidden="true" />}>
        <LiveStatusTicker dictionary={dict.system_status} />
      </Suspense>

      {/* 3. NARRATIVA INSTITUCIONAL - Acceso: dict.about */}
      <section id="about" className="relative z-10 w-full">
        <AboutSection dictionary={dict.about} />
      </section>

      {/* 4. SÍNTESIS VISUAL IA - Acceso: dict.ai_gallery_section */}
      <section id="visual-synth" className="relative z-10 w-full border-t border-white/5">
        <AiContentSection dictionary={dict.ai_gallery_section} />
      </section>

      {/* 5. FESTIVAL TAKEOVER */}
      <section id="festival-preview" className="relative w-full bg-zinc-950/30 border-t border-white/5" aria-label="Pride Escape Festival Preview">
        <div className="container mx-auto px-6 pt-24 text-center md:text-left">
            <span className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-5 py-2 text-[10px] font-bold uppercase tracking-[0.4em] text-purple-400">
                {dict['nav-links'].nav_links.festival}
            </span>
        </div>
        <Suspense fallback={<div className="h-[600px] w-full flex items-center justify-center bg-zinc-950/30"><div className="w-12 h-12 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" /></div>}>
            <ExperienceShowcase3D />
        </Suspense>
      </section>

      {/* 6. PROPUESTA DE VALOR & AMENIDADES - Acceso: dict.value_proposition */}
      <section id="pillars" className="relative w-full z-10">
        <ValuePropositionSection dictionary={dict.value_proposition} />
      </section>

      {/* 7. LEGADO INSTITUCIONAL - Acceso: dict.history */}
      <HistorySection dictionary={dict.history} />

      {/* 8. CONVERSIÓN & CONTACTO - Acceso: dict.contact */}
      <section id="reservas" className="relative w-full border-t border-white/5 z-10">
        <ContactSection dictionary={dict.contact} />
      </section>
    </div>
  );
}