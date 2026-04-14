/**
 * @file apps/portfolio-web/src/app/[lang]/layout.tsx
 * @description Orquestador Soberano del Shell Raíz Localizado (Oxygen Shell).
 *              Refactorizado: Erradicación de funciones impuras (React 19 Purity).
 *              Sincronizado: Uso de clases canónicas de Tailwind v4 y Skip-Links para A11Y.
 *              Nivelado: Cumplimiento estricto de reglas de logging (Pilar IV).
 * 
 * @version 54.0 - console.info Migration & A11Y Hardened
 * @author Staff Engineer - MetaShark Tech
 */

import React, { Suspense } from 'react';
import type { Metadata, Viewport } from 'next';

/** 
 * IMPORTACIONES DE INFRAESTRUCTRURA 
 * @pilar V: Adherencia arquitectónica mediante rutas relativas.
 */
import { i18n, type Locale } from '../../config/i18n.config';
import { getDictionary } from '../../lib/get-dictionary';
import { fontVariables } from '../../lib/fonts';
import { cn } from '../../lib/utils/cn';

/** 
 * MOTOR DE ESTILOS SOBERANO
 */
import '../global.css';

/** APARATOS DE INFRAESTRUCTRURA DE UI */
import { Providers } from '../../components/layout/Providers';
import { Header } from '../../components/layout/Header';
import { Footer } from '../../components/layout/Footer';
import { SystemStatusTicker } from '../../components/ui/SystemStatusTicker';
import { NewsletterModal } from '../../components/ui/NewsletterModal';
import { AuthPortal } from '../../components/ui/AuthPortal';
import { NavigationTracker } from '../../components/layout/NavigationTracker';
import { VisitorHud } from '../../components/ui/VisitorHud';

/**
 * CONFIGURACIÓN DE VIEWPORT (Pilar XII: MEA/UX)
 */
export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#fcfcfc' },
    { media: '(prefers-color-scheme: dark)', color: '#080808' }
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

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

/**
 * APARATO PRINCIPAL: LocalizedLayout
 * @pilar III: Pureza de Render - Se eliminan llamadas impuras para cumplir con React 19.
 */
export default async function LocalizedLayout({ 
  children, 
  params 
}: { 
  children: React.ReactNode, 
  params: Promise<{ lang: Locale }> 
}) {
  const { lang } = await params;
  
  /**
   * @description Hidratación de contenido.
   * La telemetría de latencia y logs DNA son gestionados internamente por 'getDictionary'.
   */
  const dictionary = await getDictionary(lang);
  
  /**
   * PROTOCOLO HEIMDALL: Sincronización de Shell
   * @fix: console.log -> console.info para cumplimiento de reglas de linter v10.0
   */
  console.info(`\x1b[35m\x1b[1m[DNA][LAYOUT]\x1b[0m Sovereign Shell Synchronized | Locale: \x1b[36m${lang}\x1b[0m`);

  return (
    /**
     * @pilar VIII: Resiliencia de Hidratación.
     */
    <html 
      lang={lang.split('-')[0]} 
      className={cn(fontVariables, "scroll-smooth")} 
      suppressHydrationWarning
    >
      <body className={cn(
        "font-sans antialiased min-h-screen flex flex-col bg-background text-foreground",
        "selection:bg-primary/30 transition-colors duration-1000"
      )}>
        {/* 
            SKIP TO CONTENT (A11Y Elite)
            @fix: Uso de clase canónica 'focus:z-200' según recomendación del motor.
        */}
        <a 
          href="#main-content" 
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-200 focus:bg-primary focus:text-white focus:px-6 focus:py-3 focus:rounded-full focus:font-bold focus:shadow-3xl"
        >
          Saltar al contenido principal
        </a>

        <Providers>
          {/* 
              TRACKING & NAVIGATION 
              Envuelto en Suspense para evitar CSR Bailout detonado por useSearchParams.
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

          {/* CAPAS DE UI PERSISTENTE (Diferidas mediante Suspense) */}
          <Suspense fallback={null}>
            <AuthPortal dictionary={dictionary.auth_portal} />
            <NewsletterModal dictionary={dictionary.newsletter_form} />
            <VisitorHud dictionary={dictionary} />
          </Suspense>
        </Providers>
      </body>
    </html>
  );
}