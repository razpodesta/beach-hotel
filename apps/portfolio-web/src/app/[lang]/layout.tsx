/**
 * @file layout.tsx
 * @description Orquestador Soberano del Shell Principal (The Master Shell).
 *              Implementa arquitectura Dual-Mode, cumplimiento MACS v1.0 
 *              y optimización de Core Web Vitals (Zero CLS).
 * @version 32.0 - Tailwind v4 Sync & ESM Compliance
 * @author Raz Podestá - MetaShark Tech
 */

import React, { Suspense } from 'react';
import type { Metadata } from 'next';

/**
 * IMPORTACIONES DE INFRAESTRUCTRURA
 * @pilar V: Adherencia arquitectónica mediante extensiones ESM obligatorias.
 */
import { i18n } from '../../config/i18n.config.js';
import type { Locale } from '../../config/i18n.config.js';
import { getDictionary } from '../../lib/get-dictionary.js';
import { fontInter, fontSignature, fontClashDisplay } from '../../lib/fonts.js';
import { cn } from '../../lib/utils/cn.js';

/**
 * IMPORTACIONES DE COMPONENTES DEL SHELL (Lego System)
 */
import { Providers } from '../../components/layout/Providers.js';
import { Header } from '../../components/layout/Header.js';
import { Footer } from '../../components/layout/Footer.js';
import { SystemStatusTicker } from '../../components/ui/SystemStatusTicker.js';
import { NewsletterModal } from '../../components/ui/NewsletterModal.js';
import { VisitorHud } from '../../components/ui/VisitorHud.js';
import { NavigationTracker } from '../../components/layout/NavigationTracker.js';

import '../global.css';

/**
 * GENERACIÓN DE RUTAS ESTÁTICAS (SSG)
 */
export async function generateStaticParams() {
  return i18n.locales.map((locale) => ({ lang: locale }));
}

/**
 * ORQUESTADOR DE METADATOS SOBERANO
 * @pilar I: Visión Holística - SEO E-E-A-T.
 */
export async function generateMetadata(props: { 
  params: Promise<{ lang: Locale }> 
}): Promise<Metadata> {
  const { lang } = await props.params;
  const dict = await getDictionary(lang);
  
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://beachhotelcanasvieiras.com';

  return {
    title: { 
      template: `%s | ${dict.header.personal_portfolio}`, 
      default: `${dict.header.personal_portfolio} | ${dict.header.tagline}` 
    },
    description: dict.hero.page_description,
    metadataBase: new URL(baseUrl),
    alternates: { 
      canonical: `${baseUrl}/${lang}`,
      languages: {
        'pt-BR': `${baseUrl}/pt-BR`,
        'es-ES': `${baseUrl}/es-ES`,
        'en-US': `${baseUrl}/en-US`,
      }
    },
    openGraph: {
      title: dict.header.personal_portfolio,
      description: dict.hero.page_description,
      url: `${baseUrl}/${lang}`,
      siteName: 'Beach Hotel Canasvieiras',
      locale: lang,
      type: 'website',
      images: [{
        url: '/images/hotel/og-main.jpg',
        width: 1200,
        height: 630,
      }]
    },
    twitter: {
      card: 'summary_large_image',
      title: dict.header.personal_portfolio,
      description: dict.hero.page_description,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

/**
 * APARATO PRINCIPAL: RootLayout
 * @description Orquesta la jerarquía visual base y la inyección de recursos globales.
 */
export default async function RootLayout(props: {
  children: React.ReactNode;
  params: Promise<{ lang: Locale }>;
}) {
  const { children, params } = props;
  const { lang } = await params;
  
  // Obtención paralela de recursos para optimizar el TTFB (Pilar X)
  const dictionary = await getDictionary(lang);

  /**
   * CONFIGURACIÓN TIPOGRÁFICA SOBERANA
   * @pilar VII: Sincronización con tokens de global.css.
   * Forzamos que la variable de Clash Display coincida con el token --font-clash.
   */
  const fontVariables = cn(
    fontInter.variable, 
    fontSignature.variable, 
    fontClashDisplay.variable,
    "[--font-clash:var(--font-clash-display)]" // Inyección de alias para Tailwind v4
  );

  return (
    <html lang={lang} suppressHydrationWarning className="scroll-smooth">
      <body className={cn(
        fontVariables, 
        "font-sans antialiased min-h-screen flex flex-col bg-[#050505] text-zinc-100 selection:bg-primary/30"
      )}>
        <Providers>
          {/* TRACKING SILENCIOSO (Pilar IV: Heimdall) */}
          <Suspense fallback={null}>
            <NavigationTracker />
          </Suspense>

          {/* CABECERA SOBERANA (NavDesk) */}
          <Header dictionary={dictionary} />
          
          {/* TELEMETRÍA GLOBAL (Ticker) 
              @pilar X: Altura exacta de 40px para evitar Layout Shift (CLS) */}
          <Suspense fallback={<div className="h-10 w-full bg-black border-b border-white/5 animate-pulse" />}>
            <SystemStatusTicker dictionary={dictionary.system_status} />
          </Suspense>

          {/* CONTENIDO PRINCIPAL (ViewPort) */}
          <main className="grow relative z-0 flex flex-col">
            {children}
          </main>

          {/* PIE DE PÁGINA INSTITUCIONAL (Conversion & Compliance) */}
          <Footer
            content={dictionary.footer}
            navLabels={dictionary['nav-links'].nav_links}
            tagline={dictionary.header.tagline}
          />

          {/* APARATOS PERSISTENTES (Overlay Layer) */}
          <Suspense fallback={null}>
            <NewsletterModal dictionary={dictionary.footer} />
            <VisitorHud dictionary={dictionary} />
          </Suspense>
        </Providers>
      </body>
    </html>
  );
}