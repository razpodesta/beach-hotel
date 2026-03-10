/**
 * @file page.tsx
 * @version 5.0 - Master Orchestrator
 * @description Orquestador de la Landing Page del Beach Hotel Canasvieiras.
 *              Implementa carga progresiva, SEO estructurado y arquitectura Lego.
 */

import { Suspense } from 'react';
import { type Metadata } from 'next';
import { getDictionary } from '../../lib/get-dictionary';
import { type Locale } from '../../config/i18n.config';

// --- Importación de Aparatos Lego (Nivelados) ---
import { HeroCarousel } from '../../components/sections/homepage/HeroCarousel';
import { LiveStatusTicker } from '../../components/sections/homepage/LiveStatusTicker';
import { AboutSection } from '../../components/sections/homepage/AboutSection';
import { ValuePropositionSection } from '../../components/sections/homepage/ValuePropositionSection';
import { ExperienceShowcase3D } from '../../components/sections/homepage/ExperienceShowcase3D';
import { ContactSection } from '../../components/sections/homepage/ContactSection';
import { JsonLdScript } from '../../components/ui/JsonLdScript';

type PageProps = { params: Promise<{ lang: Locale }> };

/**
 * @description Generación de Metadatos Dinámicos para SEO de Élite.
 */
export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const { lang } = await props.params;
  const dict = await getDictionary(lang);
  
  return {
    title: `Beach Hotel Canasvieiras | ${dict.header.tagline}`,
    description: dict.homepage.hero.page_description,
    alternates: {
      canonical: `/${lang}`,
    },
    openGraph: {
      images: ['/images/hotel/og-main.jpg'], // Imagen premium del hotel
      type: 'website',
    }
  };
}

export default async function HotelHomePage(props: PageProps) {
  const { lang } = await props.params;
  const dict = await getDictionary(lang);

  // --- Esquema JSON-LD: Hotel & Evento ---
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
    },
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Pride Escape 2026",
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Event",
            "name": "Canasvieiras Fest 2026"
          }
        }
      ]
    }
  };

  return (
    <div className="bg-[#050505] min-h-screen selection:bg-purple-500/30">
      <JsonLdScript data={structuredData} />

      {/* 1. SECCIÓN HERO: Venta de Lujo Inmersiva (Video/Audio) */}
      <section id="hero" className="relative">
        <HeroCarousel />
      </section>

      {/* 2. TICKER: Hype, FOMO y Status en Tiempo Real */}
      <Suspense fallback={<div className="h-20 bg-zinc-950 animate-pulse" />}>
        <LiveStatusTicker />
      </Suspense>

      {/* 3. EL HOTEL: Narrativa de Marca (Historia y Diseño) */}
      <section id="about" className="relative z-10">
        <AboutSection dictionary={dict.homepage.about_section} />
      </section>

      {/* 4. EXPERIENCIAS: El "Gancho" del Festival (Showcase 3D) */}
      <section id="festival-preview" className="bg-zinc-950/30">
        <div className="container mx-auto px-6 pt-20">
            <span className="text-purple-500 font-mono text-xs font-bold uppercase tracking-[0.4em]">
                {dict.nav_links?.nav_links?.festival || "PRIDE ESCAPE 2026"}
            </span>
        </div>
        <Suspense fallback={<div className="h-[600px] flex items-center justify-center text-zinc-800">Cargando Experiencias...</div>}>
            <ExperienceShowcase3D />
        </Suspense>
      </section>

      {/* 5. VALORES: Por qué elegir Beach Hotel (Los 3 Pilares) */}
      <section id="pillars">
        <ValuePropositionSection dictionary={dict.homepage.value_proposition_section} />
      </section>

      {/* 6. CONVERSIÓN: Reserva y Contacto Directo */}
      <section id="reservas" className="relative border-t border-white/5">
        <ContactSection dictionary={dict.homepage.contact} />
      </section>
    </div>
  );
}