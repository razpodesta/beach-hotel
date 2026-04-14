/**
 * @file apps/portfolio-web/src/app/[lang]/layout.tsx
 * @description Orquestador del Shell Localizado (Oxygen Shell).
 *              Responsable de la inyección de diccionarios y UI operativa.
 * 
 * @version 55.0 - Structure Normalization & 404 Prevention
 * @author Staff Engineer - MetaShark Tech
 */

import React, { Suspense } from 'react';
import type { Metadata } from 'next';

/** 
 * IMPORTACIONES DE INFRAESTRUCTRURA 
 */
import { i18n, type Locale } from '../../config/i18n.config';
import { getDictionary } from '../../lib/get-dictionary';

/** APARATOS DE INFRAESTRUCTRURA DE UI */
import { Header } from '../../components/layout/Header';
import { Footer } from '../../components/layout/Footer';
import { SystemStatusTicker } from '../../components/ui/SystemStatusTicker';
import { NewsletterModal } from '../../components/ui/NewsletterModal';
import { AuthPortal } from '../../components/ui/AuthPortal';
import { NavigationTracker } from '../../components/layout/NavigationTracker';
import { VisitorHud } from '../../components/ui/VisitorHud';

/**
 * GENERACIÓN DE PARÁMETROS ESTÁTICOS
 */
export async function generateStaticParams() {
  return i18n.locales.map((locale) => ({ lang: locale }));
}

/**
 * METADATOS DINÁMICOS Y SEO (E-E-A-T)
 */
export async function generateMetadata(props: { params: Promise<{ lang: Locale }> }): Promise<Metadata> {
  const { lang } = await props.params;
  const dict = await getDictionary(lang);
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://beachhotelcanasvieiras.com';
  
  return {
    metadataBase: new URL(baseUrl),
    title: { 
      template: `%s | ${dict.header.personal_portfolio}`, 
      default: dict.header.tagline 
    },
    description: dict.hero.page_description,
    manifest: '/manifest.json',
    icons: { apple: '/images/hotel/icon-192x192.png' },
    openGraph: {
      type: 'website',
      siteName: dict.header.personal_portfolio,
      locale: lang,
    }
  };
}

export default async function LocalizedLayout({ 
  children, 
  params 
}: { 
  children: React.ReactNode, 
  params: Promise<{ lang: Locale }> 
}) {
  const { lang } = await params;
  const dictionary = await getDictionary(lang);
  
  /**
   * PROTOCOLO HEIMDALL: Sincronización de Shell
   */
  console.info(`\x1b[35m\x1b[1m[DNA][LAYOUT]\x1b[0m Localized Context Injected | Locale: \x1b[36m${lang}\x1b[0m`);

  return (
    <>
      {/* 
          SKIP TO CONTENT (A11Y Elite)
          Inyectado en el fragmento para que sea el primer elemento enfocable del body.
      */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-200 focus:bg-primary focus:text-white focus:px-6 focus:py-3 focus:rounded-full focus:font-bold focus:shadow-3xl"
      >
        Saltar al contenido principal
      </a>

      {/* 
          TRACKING & NAVIGATION 
          Sincronización silenciosa del hilo de Ariadna.
      */}
      <Suspense fallback={null}>
        <NavigationTracker />
      </Suspense>
      
      {/* CABECERA OPERATIVA */}
      <Header dictionary={dictionary} />
      
      {/* TELEMETRÍA PERIMETRAL */}
      <Suspense fallback={<div className="h-[41px] w-full bg-background border-b border-border animate-pulse" />}>
        <SystemStatusTicker dictionary={dictionary.system_status} />
      </Suspense>

      {/* CONTENIDO DE EXPERIENCIA */}
      <main className="grow relative z-0 flex flex-col" id="main-content" role="main">
        {children}
      </main>

      {/* CIERRE INSTITUCIONAL */}
      <Footer
        content={dictionary.footer}
        newsletterContent={dictionary.newsletter_form}
        navLabels={dictionary['nav-links'].nav_links}
        tagline={dictionary.header.tagline}
      />

      {/* CAPAS DE UI PERSISTENTE */}
      <Suspense fallback={null}>
        <AuthPortal dictionary={dictionary.auth_portal} />
        <NewsletterModal dictionary={dictionary.newsletter_form} />
        <VisitorHud dictionary={dictionary} />
      </Suspense>
    </>
  );
}