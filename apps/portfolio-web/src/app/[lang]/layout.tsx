/**
 * @file apps/portfolio-web/src/app/[lang]/layout.tsx
 * @description Layout Localizado Soberano (Sovereign Localized Root).
 *              Refactorizado: Al erradicar app/layout.tsx, este componente asume 
 *              el trono como Root Layout absoluto para todas las rutas.
 *              Nivelado: Inyección de Suspense Boundary para NavigationTracker
 *              para erradicar el CSR Bailout y blindar el pre-renderizado de Next.js 15.
 * @version 51.0 - Suspense Boundary Hardened (CSR Bailout Fix)
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
 * Al ser el Root Layout, es obligatorio importar el CSS global aquí.
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
 */
export default async function LocalizedLayout({ 
  children, 
  params 
}: { 
  children: React.ReactNode, 
  params: Promise<{ lang: Locale }> 
}) {
  const { lang } = await params;
  const dictionary = await getDictionary(lang);
  
  // Rastro DNA para auditoría de servidor
  console.log(`\x1b[35m\x1b[1m[DNA][LAYOUT]\x1b[0m Sovereign Root Shell Synchronized | Locale: \x1b[36m${lang}\x1b[0m`);

  return (
    /**
     * @pilar VIII: Resiliencia de Build.
     * Al ser el Root Layout definitivo, inyectamos <html>, <body> y los tokens
     * de fuentes dinámicas (fontVariables). suppressHydrationWarning es vital 
     * para la inyección oscura/clara de next-themes.
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
        <Providers>
          {/* 
              TRACKING & NAVIGATION 
              @pilar XIII: Build Isolation.
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
          <main className="grow relative z-0 flex flex-col" id="main-content">
            {children}
          </main>

          {/* CIERRE INSTITUCIONAL */}
          <Footer
            content={dictionary.footer}
            newsletterContent={dictionary.newsletter_form}
            navLabels={dictionary['nav-links'].nav_links}
            tagline={dictionary.header.tagline}
          />

          {/* MODALES Y HUD (Diferidos mediante Suspense) */}
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