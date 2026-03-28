/**
 * @file layout.tsx
 * @description Orquestador Soberano del Shell Principal (The Master Shell).
 *              Refactorizado: Sincronización total con el Manifiesto Day-First,
 *              erradicación de bloqueos cromáticos y optimización de PWA.
 * @version 36.0 - Atmosphere Master Sync (Next.js 15)
 * @author Raz Podestá - MetaShark Tech
 */

import React, { Suspense } from 'react';
import type { Metadata, Viewport } from 'next';

/**
 * IMPORTACIONES DE INFRAESTRUCTRURA
 * @pilar V: Adherencia arquitectónica a las fronteras de Nx.
 */
import { i18n } from '../../config/i18n.config';
import type { Locale } from '../../config/i18n.config';
import { getDictionary } from '../../lib/get-dictionary';
import { fontInter, fontSignature, fontClashDisplay } from '../../lib/fonts';
import { cn } from '../../lib/utils/cn';

/**
 * IMPORTACIONES DE COMPONENTES DEL SHELL (Lego System)
 */
import { Providers } from '../../components/layout/Providers';
import { Header } from '../../components/layout/Header';
import { Footer } from '../../components/layout/Footer';
import { SystemStatusTicker } from '../../components/ui/SystemStatusTicker';
import { NewsletterModal } from '../../components/ui/NewsletterModal';
import { NavigationTracker } from '../../components/layout/NavigationTracker';
import { VisitorHud } from '../../components/ui/VisitorHud';

import '../global.css';

/**
 * CONFIGURACIÓN DE VIEWPORT (Next.js 15 Standard)
 * @description Se define un color neutral para el tema del navegador que 
 *              armoniza con la identidad de marca (Sovereign Neutral).
 */
export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#fcfcfc' }, // Arena (Light)
    { media: '(prefers-color-scheme: dark)', color: '#050505' }   // Obsidiana (Dark)
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

/**
 * GENERACIÓN DE RUTAS ESTÁTICAS (SSG)
 */
export async function generateStaticParams() {
  return i18n.locales.map((locale) => ({ lang: locale }));
}

/**
 * ORQUESTADOR DE METADATOS SOBERANO
 * @pilar I: Visión Holística - SEO E-E-A-T & PWA Identity.
 */
export async function generateMetadata(props: { 
  params: Promise<{ lang: Locale }> 
}): Promise<Metadata> {
  const { lang } = await props.params;
  const dict = await getDictionary(lang);
  
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://beachhotelcanasvieiras.com';
  const siteName = dict.header.personal_portfolio;

  return {
    metadataBase: new URL(baseUrl),
    title: { 
      template: `%s | ${siteName}`, 
      default: `${siteName} | ${dict.header.tagline}` 
    },
    description: dict.hero.page_description,
    
    /** @protocolo PWA: Sincronización de Artefacto de Instalabilidad */
    manifest: '/manifest.json',
    
    /** IDENTIDAD APPLE (iOS Optimization) */
    appleWebApp: {
      capable: true,
      title: siteName,
      statusBarStyle: 'black-translucent',
    },

    alternates: { 
      canonical: `/${lang}`,
      languages: {
        'pt-BR': '/pt-BR',
        'es-ES': '/es-ES',
        'en-US': '/en-US',
      }
    },

    openGraph: {
      title: siteName,
      description: dict.hero.page_description,
      url: `/${lang}`,
      siteName: siteName,
      locale: lang,
      type: 'website',
      images: [{
        url: '/images/hotel/og-main.jpg',
        width: 1200, height: 630,
        alt: siteName
      }]
    },

    twitter: {
      card: 'summary_large_image',
      title: siteName,
      description: dict.hero.page_description,
      images: ['/images/hotel/og-main.jpg'],
    }
  };
}

/**
 * @interface RootLayoutProps
 */
interface RootLayoutProps {
  children: React.ReactNode;
  params: Promise<{ lang: Locale }>;
}

/**
 * APARATO PRINCIPAL: RootLayout
 * @description Orquesta la jerarquía visual base y la inyección de recursos globales.
 */
export default async function RootLayout({ children, params }: RootLayoutProps) {
  const { lang } = await params;
  
  /** @pilar IV: Protocolo Heimdall - Trazabilidad de montaje del Shell */
  console.log(`[HEIMDALL][SHELL] Master Shell Instantiated: [${lang}]`);

  const dictionary = await getDictionary(lang);

  /**
   * CONFIGURACIÓN TIPOGRÁFICA SOBERANA (Pilar VII)
   */
  const fontVariables = cn(
    fontInter.variable, 
    fontSignature.variable, 
    fontClashDisplay.variable,
    "[--font-clash:var(--font-clash-display)]" 
  );

  return (
    <html lang={lang} suppressHydrationWarning className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://flagcdn.com" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
      </head>
      <body className={cn(
        fontVariables, 
        /**
         * @pilar VII: Theming Soberano
         * Sustituimos 'bg-[#050505]' por 'bg-background'.
         * La transición de color asegura que el cambio de atmósfera sea fluido (Pilar XII).
         */
        "font-sans antialiased min-h-screen flex flex-col bg-background text-foreground selection:bg-primary/30 transition-colors duration-1000"
      )}>
        <Providers>
          {/* TRACKING COMPORTAMENTAL (Pilar XII) */}
          <Suspense fallback={null}>
            <NavigationTracker />
          </Suspense>

          {/* CABECERA SOBERANA */}
          <Header dictionary={dictionary} />
          
          {/* TELEMETRÍA GLOBAL (Ticker) 
              @pilar X: Skeleton adaptativo para evitar Layout Shift (CLS).
          */}
          <Suspense fallback={
            <div className="h-[41px] w-full bg-background border-b border-border animate-pulse" aria-hidden="true" />
          }>
            <SystemStatusTicker dictionary={dictionary.system_status} />
          </Suspense>

          {/* VIEWPORT PRINCIPAL (ID para anclajes ARIA) */}
          <main className="grow relative z-0 flex flex-col" id="main-content">
            {children}
          </main>

          {/* PIE DE PÁGINA (Compliance & Trust) */}
          <Footer
            content={dictionary.footer}
            navLabels={dictionary['nav-links'].nav_links}
            tagline={dictionary.header.tagline}
          />

          {/* CAPA DE PORTALES (Overlay Layer) */}
          <Suspense fallback={null}>
            <NewsletterModal dictionary={dictionary.footer} />
            <VisitorHud dictionary={dictionary} />
          </Suspense>
        </Providers>
      </body>
    </html>
  );
}