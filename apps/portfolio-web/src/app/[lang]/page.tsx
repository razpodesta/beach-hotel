/**
 * @file apps/portfolio-web/src/app/[lang]/page.tsx
 * @description Orquestador Soberano de la Recepción (Landing Page).
 *              Restauración de Emergencia: Reemplaza el código del Portal 
 *              erróneamente inyectado y restablece la orquestación de la 
 *              página de inicio con rutas relativas saneadas (2 niveles).
 * @version 3.0 - Landing Restoration & Path Hardening
 * @author Raz Podestá - MetaShark Tech
 */

import React from 'react';
import type { Metadata } from 'next';

/**
 * IMPORTACIONES DE INFRAESTRUCTURA
 * @pilar V: Adherencia arquitectónica (Rutas saneadas a 2 saltos).
 */
import { getDictionary } from '../../lib/get-dictionary';
import { type Locale } from '../../config/i18n.config';
import { JsonLdScript } from '../../components/ui/JsonLdScript';

/**
 * IMPORTACIONES DE APARATOS DE SECCIÓN
 */
import { HeroCarousel } from '../../components/sections/homepage/HeroCarousel';
import { AboutSection } from '../../components/sections/homepage/AboutSection';
import { ValuePropositionSection } from '../../components/sections/homepage/ValuePropositionSection';
import { AiContentSection } from '../../components/sections/homepage/AiContentSection';
import { HistorySection } from '../../components/sections/homepage/HistorySection';

interface PageProps {
  params: Promise<{ lang: Locale }>;
}

/**
 * METADATOS DINÁMICOS Y SEO (E-E-A-T)
 */
export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const { lang } = await props.params;
  const dict = await getDictionary(lang);
  
  const title = dict.hero.page_title;
  const description = dict.hero.page_description;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://beachhotelcanasvieiras.com';

  return { 
    title,
    description,
    alternates: {
      canonical: `${baseUrl}/${lang}`
    },
    openGraph: {
      title,
      description,
      url: `${baseUrl}/${lang}`,
      type: 'website'
    }
  };
}

/**
 * APARATO PRINCIPAL: HomePage
 * @description Orquesta la narrativa del embudo de conversión principal.
 */
export default async function HomePage(props: PageProps) {
  const { lang } = await props.params;
  
  // Orquestación paralela para minimizar latencia (Pilar X)
  const dict = await getDictionary(lang);

  /**
   * ESTRUCTURA DE DATOS PARA GOOGLE (JSON-LD)
   * @pilar I: Define la entidad "Hotel" para posicionamiento semántico.
   */
  const hotelSchema = {
    '@context': 'https://schema.org',
    '@type': 'Hotel',
    name: dict.header.personal_portfolio,
    description: dict.hero.page_description,
    image: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://beachhotelcanasvieiras.com'}/images/hotel/og-main.jpg`,
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Av. das Nações',
      addressLocality: 'Florianópolis',
      addressRegion: 'SC',
      addressCountry: 'BR'
    }
  };

  return (
    <>
      <JsonLdScript data={hotelSchema} />
      
      <div className="flex flex-col w-full overflow-x-hidden">
        {/* FASE 1: Concienciación y Deseo */}
        <HeroCarousel dictionary={dict.hero} />
        
        {/* FASE 2: Confianza y Narrativa */}
        <AboutSection dictionary={dict.about} />
        
        {/* FASE 3: Lógica y Prueba Social */}
        <ValuePropositionSection dictionary={dict.value_proposition} />
        
        {/* FASE 4: Innovación y Ecosistema Digital */}
        <AiContentSection dictionary={dict.ai_gallery_section} />
        
        {/* FASE 5: Legado y Cierre Narrativo */}
        <HistorySection dictionary={dict.history} />
      </div>
    </>
  );
}