/**
 * @file Root Page - Beach Hotel Canasvieiras
 * @description Landing page de alta convertibilidad enfocada en reserva directa.
 */
import { type Metadata } from 'next';
import { getDictionary } from '../../lib/get-dictionary';
import { type Locale } from '../../config/i18n.config';
import { HeroCarousel } from '../../components/sections/homepage/HeroCarousel';
import { AboutSection } from '../../components/sections/homepage/AboutSection';
import { ValuePropositionSection } from '../../components/sections/homepage/ValuePropositionSection';
import { ContactSection } from '../../components/sections/homepage/ContactSection';
import { JsonLdScript } from '../../components/ui/JsonLdScript';

type PageProps = { params: Promise<{ lang: Locale }> };

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const { lang } = await props.params;
  const dict = await getDictionary(lang);
  return {
    title: `Beach Hotel Canasvieiras | ${dict.header.tagline}`,
    description: dict.homepage.hero.page_description,
    openGraph: {
      images: ['/images/hotel/og-main.jpg'],
      type: 'website',
    }
  };
}

export default async function HotelLandingPage(props: PageProps) {
  const { lang } = await props.params;
  const dict = await getDictionary(lang);

  // Schema.org para Hoteles (SEO Elite)
  const hotelStructuredData = {
    "@context": "https://schema.org",
    "@type": "Hotel",
    "name": "Beach Hotel Canasvieiras",
    "description": dict.homepage.hero.page_description,
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Florianópolis",
      "addressRegion": "SC",
      "addressCountry": "BR"
    }
  };

  return (
    <main className="bg-black">
      <JsonLdScript data={hotelStructuredData} />

      {/* Componente Modular: El escaparate de habitaciones y playa */}
      <HeroCarousel dictionary={dict.homepage.hero} />

      {/* Historia y Filosofía del Hotel (Legacy Section) */}
      <AboutSection dictionary={dict.homepage.about_section} />

      {/* Los 3 Pilares: Confort, Ubicación, Exclusividad */}
      <ValuePropositionSection dictionary={dict.homepage.value_proposition_section} />

      {/* Conversión: Formulario de Reserva/Contacto */}
      <ContactSection dictionary={dict.homepage.contact} />
    </main>
  );
}