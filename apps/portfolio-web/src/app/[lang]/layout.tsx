/**
 * @file apps/portfolio-web/src/app/[lang]/layout.tsx
 * @description Orquestador Soberano del Shell Principal (The Master Shell).
 *              Implementa arquitectura Dual-Mode, cumplimiento MACS v1.0, 
 *              y conexión con aparatos atómicos (VisitorHud).
 * @version 34.0 - Atomic Component Sync & CLS Protection
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

/**
 * @pilar IV: Consumo Atómico.
 * Importación sincronizada con el directorio VisitorHud/index.ts.
 */
import { VisitorHud } from '../../components/ui/VisitorHud';

import '../global.css';

/**
 * CONFIGURACIÓN DE VIEWPORT (Next.js 15 Standard)
 */
export const viewport: Viewport = {
  themeColor: '#050505',
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
 * @pilar I: Visión Holística - SEO E-E-A-T.
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
        width: 1200,
        height: 630,
        alt: siteName
      }]
    }
  };
}

/**
 * @interface RootLayoutProps
 * @description Contrato de propiedades para el orquestador visual.
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
  
  // Protocolo Heimdall: Trazabilidad de montaje del Shell
  console.log(`[HEIMDALL][SHELL] Assembling Master Shell for locale: ${lang}`);

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
      </head>
      <body className={cn(
        fontVariables, 
        "font-sans antialiased min-h-screen flex flex-col bg-[#050505] text-zinc-100 selection:bg-primary/30"
      )}>
        <Providers>
          {/* TRACKING COMPORTAMENTAL (Pilar XII) */}
          <Suspense fallback={null}>
            <NavigationTracker />
          </Suspense>

          {/* CABECERA SOBERANA */}
          <Header dictionary={dictionary} />
          
          {/* TELEMETRÍA GLOBAL (Ticker) 
              @pilar X: Fallback de altura exacta (41px) para evitar Layout Shift (CLS) */}
          <Suspense fallback={
            <div className="h-[41px] w-full bg-[#050505] border-b border-white/5 animate-pulse" aria-hidden="true" />
          }>
            <SystemStatusTicker dictionary={dictionary.system_status} />
          </Suspense>

          {/* VIEWPORT PRINCIPAL */}
          <main className="grow relative z-0 flex flex-col" id="main-content">
            {children}
          </main>

          {/* PIE DE PÁGINA (Compliance & Conversion) */}
          <Footer
            content={dictionary.footer}
            navLabels={dictionary['nav-links'].nav_links}
            tagline={dictionary.header.tagline}
          />

          {/* CAPA DE PORTALES (Overlay Layer) 
              @pilar IX: Los aparatos se inyectan con sus fragmentos de diccionario específicos. */}
          <Suspense fallback={null}>
            <NewsletterModal dictionary={dictionary.footer} />
            <VisitorHud dictionary={dictionary} />
          </Suspense>
        </Providers>
      </body>
    </html>
  );
}