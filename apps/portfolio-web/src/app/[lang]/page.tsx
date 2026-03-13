/**
 * @file page.tsx
 * @version 6.1 - Sincronización de Contratos SSoT
 * @description Orquestador de la Landing Page. Inyecta diccionarios fuertemente 
 *              tipados. Tipos validados contra dictionary.schema.ts.
 */

import { Suspense } from 'react';
import { type Metadata } from 'next';
import { getDictionary } from '../../lib/get-dictionary';
import { type Locale } from '../../config/i18n.config';

import { HeroCarousel } from '../../components/sections/homepage/HeroCarousel';
import { LiveStatusTicker } from '../../components/sections/homepage/LiveStatusTicker';
import { AboutSection } from '../../components/sections/homepage/AboutSection';
import { ValuePropositionSection } from '../../components/sections/homepage/ValuePropositionSection';
import { ExperienceShowcase3D } from '../../components/sections/homepage/ExperienceShowcase3D';
import { ContactSection } from '../../components/sections/homepage/ContactSection';
import { JsonLdScript } from '../../components/ui/JsonLdScript';

type PageProps = { params: Promise<{ lang: Locale }> };

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const { lang } = await props.params;
  const dict = await getDictionary(lang);
  
  return {
    title: `Beach Hotel Canasvieiras | ${dict.header.tagline}`,
    description: dict.homepage.hero.page_description,
    alternates: { canonical: `/${lang}` },
    openGraph: {
      images: ['/images/hotel/og-main.jpg'],
      type: 'website',
    }
  };
}

export default async function HotelHomePage(props: PageProps) {
  const { lang } = await props.params;
  const dict = await getDictionary(lang);

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Hotel",
    "name": "Beach Hotel Canasvieiras",
    "description": dict.homepage.hero.page_description,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Av. das Nações",
      "addressLocality": "Florianópolis",
      "addressRegion": "SC",
      "addressCountry": "BR"
    }
  };

  return (
    <div className="bg-[#050505] min-h-screen selection:bg-purple-500/30">
      <JsonLdScript data={structuredData} />

      <section id="hero" className="relative">
        <HeroCarousel dictionary={dict.homepage.hero} />
      </section>

      <Suspense fallback={<div className="h-20 bg-zinc-950 animate-pulse" />}>
        {/* Pasamos el objeto system_status completo para cumplir con la interfaz */}
        <LiveStatusTicker dictionary={dict.system_status} />
      </Suspense>

      <section id="about" className="relative z-10">
        <AboutSection dictionary={dict.homepage.about_section} />
      </section>

      <section id="festival-preview" className="bg-zinc-950/30">
        <div className="container mx-auto px-6 pt-20">
            <span className="text-purple-500 font-mono text-xs font-bold uppercase tracking-[0.4em]">
                {/* Corrección de acceso: nav-links es una clave definida en dictionarySchema */}
                {dict['nav-links'].nav_links.festival || "PRIDE ESCAPE 2026"}
            </span>
        </div>
        <Suspense fallback={<div className="h-[600px] flex items-center justify-center text-zinc-800">Cargando Experiencias...</div>}>
            <ExperienceShowcase3D />
        </Suspense>
      </section>

      <section id="pillars">
        <ValuePropositionSection dictionary={dict.homepage.value_proposition_section} />
      </section>

      <section id="reservas" className="relative border-t border-white/5">
        <ContactSection dictionary={dict.homepage.contact} />
      </section>
    </div>
  );
}