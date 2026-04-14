/**
 * @file apps/portfolio-web/src/app/[lang]/layout.tsx
 * @description Orquestador del Shell Localizado (Oxygen Shell).
 *              Responsable de la hidratación de diccionarios y UI operativa.
 *              Refactorizado: Mejora en la resiliencia de metadatos SEO y 
 *              aislamiento de capas persistentes mediante Suspense.
 * 
 * @version 56.0 - Forensic SEO & UI Layer Grouping
 * @author Staff Engineer - MetaShark Tech
 */

import React, { Suspense } from 'react';
import type { Metadata } from 'next';

/** 
 * IMPORTACIONES DE INFRAESTRUCTRURA (Fronteras Nx)
 * @pilar V: Adherencia Arquitectónica.
 */
import { i18n, type Locale } from '../../config/i18n.config';
import { getDictionary } from '../../lib/get-dictionary';

/** APARATOS DE INFRAESTRUCTRURA DE UI (Oxygen Engine) */
import { Header } from '../../components/layout/Header';
import { Footer } from '../../components/layout/Footer';
import { SystemStatusTicker } from '../../components/ui/SystemStatusTicker';
import { NewsletterModal } from '../../components/ui/NewsletterModal';
import { AuthPortal } from '../../components/ui/AuthPortal';
import { NavigationTracker } from '../../components/layout/NavigationTracker';
import { VisitorHud } from '../../components/ui/VisitorHud';

/**
 * @function generateStaticParams
 * @description Pre-renderiza los perímetros de idioma en tiempo de construcción.
 */
export async function generateStaticParams() {
  return i18n.locales.map((locale) => ({ lang: locale }));
}

/**
 * METADATOS DINÁMICOS Y SEO (E-E-A-T Excellence)
 * @pilar VIII: Resiliencia - Fallback determinista si el motor de contenido falla.
 */
export async function generateMetadata(props: { params: Promise<{ lang: Locale }> }): Promise<Metadata> {
  const { lang } = await props.params;
  
  try {
    const dict = await getDictionary(lang);
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://beachhotelcanasvieiras.com';
    
    return {
      title: { 
        template: `%s | ${dict.header.personal_portfolio}`, 
        default: dict.header.tagline 
      },
      description: dict.hero.page_description,
      alternates: {
        canonical: `${baseUrl}/${lang}`,
        languages: i18n.locales.reduce((acc, loc) => ({
          ...acc,
          [loc]: `${baseUrl}/${loc}`,
        }), {}),
      },
      openGraph: {
        type: 'website',
        siteName: dict.header.personal_portfolio,
        locale: lang,
        url: `${baseUrl}/${lang}`,
      }
    };
  } catch {
    return { title: 'Beach Hotel Canasvieiras' };
  }
}

/**
 * APARATO: LocalizedLayout
 * @description Orquestador soberano de la UI operativa basada en idioma.
 */
export default async function LocalizedLayout({ 
  children, 
  params 
}: { 
  children: React.ReactNode, 
  params: Promise<{ lang: Locale }> 
}) {
  const { lang } = await params;
  
  // Handshake de Diccionario (MACS)
  const dictionary = await getDictionary(lang);
  
  /**
   * PROTOCOLO HEIMDALL: Registro de Sincronización
   */
  if (process.env.NODE_ENV !== 'production') {
    console.info(`\x1b[35m\x1b[1m[DNA][LAYOUT]\x1b[0m Oxygen Context Synchronized | Locale: \x1b[36m${lang}\x1b[0m`);
  }

  return (
    <>
      {/* ACCESIBILIDAD ELITE: Skip Link */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:fixed focus:top-6 focus:left-6 focus:z-200 focus:bg-primary focus:text-white focus:px-8 focus:py-4 focus:rounded-full focus:font-bold focus:shadow-3xl"
      >
        Saltar al contenido
      </a>

      {/* TRACKING SILENCIOSO (Edge Safe) */}
      <Suspense fallback={null}>
        <NavigationTracker />
      </Suspense>
      
      {/* 1. NIVEL: CABECERA Y TELEMETRÍA */}
      <Header dictionary={dictionary} />
      
      <Suspense fallback={<div className="h-[41px] w-full bg-background border-b border-border" />}>
        <SystemStatusTicker dictionary={dictionary.system_status} />
      </Suspense>

      {/* 2. NIVEL: VIEWPORT DE EXPERIENCIA */}
      <main className="grow relative z-0 flex flex-col" id="main-content" role="main">
        {children}
      </main>

      {/* 3. NIVEL: CIERRE Y CONFORMIDAD */}
      <Footer
        content={dictionary.footer}
        newsletterContent={dictionary.newsletter_form}
        navLabels={dictionary['nav-links'].nav_links}
        tagline={dictionary.header.tagline}
      />

      {/* 
          4. NIVEL: CAPA SOBERANA (Portales y HUD)
          Envolviendo componentes pesados del lado del cliente en límites de Suspense
          para optimizar el tiempo de interactividad (TTI).
      */}
      <Suspense fallback={null}>
        {/* Portal de Acceso y Gestión de Identidad */}
        <AuthPortal dictionary={dictionary.auth_portal} />
        
        {/* Captación de Leads y Notificaciones */}
        <NewsletterModal dictionary={dictionary.newsletter_form} />
        
        {/* Centro de Mando del Visitante */}
        <VisitorHud dictionary={dictionary} />
      </Suspense>
    </>
  );
}