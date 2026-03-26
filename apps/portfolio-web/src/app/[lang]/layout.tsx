/**
 * @file layout.tsx
 * @description Orquestador Soberano del Shell Principal (The Master Shell).
 *              Implementa la arquitectura Dual-Mode, cumplimiento MACS v1.0 
 *              y optimización de Core Web Vitals (Zero CLS).
 * @version 31.0 - Next.js 15 Async Standard & Fix TS2304
 * @author Raz Podestá - MetaShark Tech
 */

import React, { Suspense } from 'react';
import type { Metadata } from 'next';

/**
 * IMPORTACIONES DE INFRAESTRUCTRURA
 * @pilar V: Adherencia arquitectónica mediante fronteras Nx.
 */
import { i18n, type Locale } from '../../config/i18n.config';
import { getDictionary } from '../../lib/get-dictionary';
import { fontInter, fontSignature, fontClashDisplay } from '../../lib/fonts';
import { cn } from '../../lib/utils/cn';

/**
 * IMPORTACIONES DE COMPONENTES DEL SHELL (Lego System)
 * @pilar IX: Componentización desacoplada y atómica.
 */
import { Providers } from '../../components/layout/Providers';
import { Header } from '../../components/layout/Header';
import { Footer } from '../../components/layout/Footer';
import { SystemStatusTicker } from '../../components/ui/SystemStatusTicker';
import { NewsletterModal } from '../../components/ui/NewsletterModal';
import { VisitorHud } from '../../components/ui/VisitorHud';
import { NavigationTracker } from '../../components/layout/NavigationTracker';

import '../global.css';

/**
 * CONFIGURACIÓN TIPOGRÁFICA SOBERANA
 * @pilar VII: Theming Semántico inyectado vía CSS Variables.
 */
const fontVariables = `${fontInter.variable} ${fontSignature.variable} ${fontClashDisplay.variable}`;

/**
 * GENERACIÓN DE RUTAS ESTÁTICAS (SSG)
 * @description Garantiza que el Shell esté pre-renderizado para cada idioma.
 */
export async function generateStaticParams() {
  return i18n.locales.map((locale) => ({ lang: locale }));
}

/**
 * ORQUESTADOR DE METADATOS SOBERANO
 * @pilar I: Visión Holística - SEO E-E-A-T.
 * @description Implementa resolución asíncrona de parámetros nativa de Next.js 15.
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
    /** @pilar III: Acceso MACS directo (Sovereign Flat Schema) */
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
    },
    twitter: {
      card: 'summary_large_image',
      title: dict.header.personal_portfolio,
      description: dict.hero.page_description,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

/**
 * APARATO PRINCIPAL: RootLayout
 * @description Orquesta la jerarquía visual base y la inyección de recursos globales.
 * @fix TS2304: Se desestructura 'children' explícitamente de las props.
 */
export default async function RootLayout(props: {
  children: React.ReactNode;
  params: Promise<{ lang: Locale }>;
}) {
  /** 
   * @pilar III: Resolución de Props.
   * Extraemos 'children' y 'params' de forma segura.
   */
  const { children, params } = props;
  const { lang } = await params;
  
  // Obtención paralela de recursos para optimizar el TTFB (Pilar X)
  const dictionary = await getDictionary(lang);

  return (
    <html lang={lang} suppressHydrationWarning>
      <body className={cn(
        fontVariables, 
        "font-sans antialiased min-h-screen flex flex-col bg-[#050505] text-zinc-100 selection:bg-purple-500/30"
      )}>
        <Providers>
          {/* TRACKING SILENCIOSO (Zero-UI Behavior Tracking) */}
          <Suspense fallback={null}>
            <NavigationTracker />
          </Suspense>

          {/* CABECERA SOBERANA (NavDesk) */}
          <Header dictionary={dictionary} />
          
          {/* TELEMETRÍA GLOBAL (Ticker) 
              @pilar VIII: Fallback con altura reservada para evitar Layout Shift */}
          <Suspense fallback={<div className="h-10 w-full bg-[#050505] border-b border-white/10 animate-pulse" />}>
            <SystemStatusTicker dictionary={dictionary.system_status} />
          </Suspense>

          {/* CONTENIDO PRINCIPAL (ViewPort) */}
          <main className="grow relative z-0 flex flex-col">
            {children}
          </main>

          {/* PIE DE PÁGINA INSTITUCIONAL (Compliance & Conversion) */}
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