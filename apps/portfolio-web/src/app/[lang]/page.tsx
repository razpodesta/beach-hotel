/**
 * @file apps/portfolio-web/src/app/[lang]/page.tsx
 * @description Orquestador Soberano de la Recepción (Landing Page).
 *              Centraliza la narrativa de marca, SEO estructural y el despliegue
 *              de secciones visuales de alta fidelidad.
 *              Refactorizado: Purificación total del render (React 19 Purity Sync),
 *              eliminación de cronometría no-determinista y blindaje de Build.
 * @version 4.2 - 100% Pure Render & Build Hardened
 * @author Staff Engineer - MetaShark Tech
 */

import React from 'react';
import type { Metadata } from 'next';

/** IMPORTACIONES DE INFRAESTRUCTRURA (Nx Boundary Safe) */
import { getDictionary } from '../../lib/get-dictionary';
import { type Locale, i18n } from '../../config/i18n.config';
import { JsonLdScript } from '../../components/ui/JsonLdScript';
import { cn } from '../../lib/utils/cn';

/** APARATOS DE SECCIÓN (Oxygen Engine) */
import { HeroCarousel } from '../../components/sections/homepage/HeroCarousel';
import { AboutSection } from '../../components/sections/homepage/AboutSection';
import { ValuePropositionSection } from '../../components/sections/homepage/ValuePropositionSection';
import { AiContentSection } from '../../components/sections/homepage/AiContentSection';
import { HistorySection } from '../../components/sections/homepage/HistorySection';

/**
 * CONFIGURACIÓN DE INFRAESTRUCTRURA
 * @pilar VIII: Resiliencia de Build.
 * Forzamos generación estática para inmunidad ante variables de entorno.
 */
export const dynamic = 'force-static';
export const revalidate = false;

interface PageProps {
  params: Promise<{ lang: Locale }>;
}

/**
 * GENERACIÓN DE PARÁMETROS ESTÁTICOS
 * @description Define el perímetro de idiomas para el prerendering de Vercel.
 */
export async function generateStaticParams() {
  return i18n.locales.map((lang) => ({ lang }));
}

/**
 * METADATOS DINÁMICOS Y SEO (E-E-A-T)
 */
export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const { lang } = await props.params;
  const dict = await getDictionary(lang);
  
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://beachhotelcanasvieiras.com';

  return { 
    title: dict.hero.page_title,
    description: dict.hero.page_description,
    alternates: {
      canonical: `${baseUrl}/${lang}`
    },
    openGraph: {
      title: dict.hero.page_title,
      description: dict.hero.page_description,
      url: `${baseUrl}/${lang}`,
      type: 'website',
      siteName: dict.header.personal_portfolio
    }
  };
}

/**
 * APARATO PRINCIPAL: HomePage (Landing Orchestrator)
 * @description Orquesta la construcción de la página de inicio.
 * @pilar III: Este componente es ahora 100% puro y determinista.
 */
export default async function HomePage(props: PageProps) {
  const { lang } = await props.params;
  
  // 1. HIDRATACIÓN SOBERANA DE DATOS
  // El rastro de DNA y latencia es gestionado internamente por el servicio getDictionary.
  const dict = await getDictionary(lang);
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://beachhotelcanasvieiras.com';

  // 2. CONSTRUCCIÓN DE ESQUEMA (SSoT)
  const hotelSchema = {
    '@context': 'https://schema.org',
    '@type': 'Hotel',
    name: dict.header.personal_portfolio,
    description: dict.hero.page_description,
    image: `${baseUrl}/images/hotel/og-main.jpg`,
    url: `${baseUrl}/${lang}`,
    priceRange: 'R$$$',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Av. das Nações, 1140',
      addressLocality: 'Florianópolis',
      addressRegion: 'SC',
      addressCountry: 'BR'
    },
    parentOrganization: {
      '@type': 'Organization',
      name: 'MetaShark Tech',
      url: 'https://metashark.tech'
    }
  };

  return (
    <>
      {/* INYECCIÓN DE INTELIGENCIA SEO */}
      <JsonLdScript data={hotelSchema} />
      
      <main 
        className={cn(
          "flex flex-col w-full overflow-x-hidden bg-background",
          "selection:bg-primary/20 selection:text-foreground"
        )}
      >
        {/* --- STACK DE EXPERIENCIA (Oxygen Engine) --- */}
        
        {/* FASE 1: AWARENESS */}
        <HeroCarousel dictionary={dict.hero} />
        
        {/* FASE 2: TRUST */}
        <AboutSection dictionary={dict.about} />
        
        {/* FASE 3: VALUE PROPOSITION */}
        <ValuePropositionSection dictionary={dict.value_proposition} />
        
        {/* FASE 4: VISUAL SYNTH */}
        <AiContentSection dictionary={dict.ai_gallery_section} />
        
        {/* FASE 5: LEGACY */}
        <HistorySection dictionary={dict.history} />
      </main>
    </>
  );
}