/**
 * @file apps/portfolio-web/src/app/[lang]/layout.tsx
 * @description Orquestador Soberano del Shell Principal (The Master Shell).
 *              Refactorizado: Cumplimiento del Manifiesto MACS v1.0.
 *              Elimina errores de tipo 'homepage' y sincroniza metadatos SEO.
 * @version 29.0 - Flattened Metadata Sync & CLS Protection
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
 * IMPORTACIONES DE COMPONENTES DEL SHELL
 * @pilar IX: Componentización Lego.
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
 * CONFIGURACIÓN TIPOGRÁFICA (Pilar VII)
 */
const fontVariables = `${fontInter.variable} ${fontSignature.variable} ${fontClashDisplay.variable}`;

/**
 * GENERACIÓN DE RUTAS ESTÁTICAS (SSG)
 */
export async function generateStaticParams() {
  return i18n.locales.map((locale) => ({ lang: locale }));
}

/**
 * ORQUESTADOR DE METADATOS SOBERANO
 * @pilar I: Visión Holística - SEO E-E-A-T.
 * @description Refactorizado para acceso MACS directo (dict.hero).
 */
export async function generateMetadata({ params }: { params: Promise<{ lang: Locale }> }): Promise<Metadata> {
  const { lang } = await params;
  const dict = await getDictionary(lang);
  
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://beachhotelcanasvieiras.com';

  return {
    title: { 
      template: `%s | ${dict.header.personal_portfolio}`, 
      default: `${dict.header.personal_portfolio} | ${dict.header.tagline}` 
    },
    /** @pilar III: Corregido acceso dict.hero (Flattened Sync) */
    description: dict.hero.page_description,
    metadataBase: new URL(baseUrl),
    alternates: { canonical: `${baseUrl}/${lang}` },
    openGraph: {
      title: dict.header.personal_portfolio,
      description: dict.hero.page_description,
      type: 'website',
      locale: lang,
    }
  };
}

/**
 * APARATO PRINCIPAL: RootLayout
 * @description Orquesta la jerarquía visual base y la inyección de recursos globales.
 */
export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: Locale }>;
}) {
  // @pilar III: Resolución asíncrona de parámetros obligatoria en Next.js 15
  const { lang } = await params;
  const dictionary = await getDictionary(lang);

  return (
    <html lang={lang} suppressHydrationWarning>
      <body className={cn(
        fontVariables, 
        "font-sans antialiased min-h-screen flex flex-col bg-[#050505] text-zinc-100 selection:bg-purple-500/30"
      )}>
        <Providers>
          {/* TRACKING SILENCIOSO (No-UI) */}
          <Suspense fallback={null}>
            <NavigationTracker />
          </Suspense>

          {/* CABECERA (NavDesk) */}
          <Header dictionary={dictionary} />
          
          {/* TELEMETRÍA GLOBAL (Ticker) 
              @pilar VIII: Fallback con altura reservada para evitar CLS */}
          <Suspense fallback={<div className="h-10 w-full bg-[#050505] border-b border-white/10 animate-pulse" />}>
            <SystemStatusTicker dictionary={dictionary.system_status} />
          </Suspense>

          {/* CONTENIDO PRINCIPAL */}
          <main className="grow relative z-0 flex flex-col">
            {children}
          </main>

          {/* PIE DE PÁGINA INSTITUCIONAL */}
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