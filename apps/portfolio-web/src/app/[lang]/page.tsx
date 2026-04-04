/**
 * @file apps/portfolio-web/src/app/[lang]/page.tsx
 * @description Orquestador Soberano de la Recepción (Landing Page).
 * @version 3.1 - Build Resilience Edition
 */

import React from 'react';
import type { Metadata } from 'next';
import { getDictionary } from '../../lib/get-dictionary';
import { type Locale } from '../../config/i18n.config';
import { JsonLdScript } from '../../components/ui/JsonLdScript';
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
  // Acceso defensivo: si el env no está, caemos a un valor seguro para el build
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://beachhotelcanasvieiras.com';

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

export default async function HomePage(props: PageProps) {
  const { lang } = await props.params;
  const dict = await getDictionary(lang);
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://beachhotelcanasvieiras.com';

  const hotelSchema = {
    '@context': 'https://schema.org',
    '@type': 'Hotel',
    name: dict.header.personal_portfolio,
    description: dict.hero.page_description,
    image: `${baseUrl}/images/hotel/og-main.jpg`,
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
        <HeroCarousel dictionary={dict.hero} />
        <AboutSection dictionary={dict.about} />
        <ValuePropositionSection dictionary={dict.value_proposition} />
        <AiContentSection dictionary={dict.ai_gallery_section} />
        <HistorySection dictionary={dict.history} />
      </div>
    </>
  );
}