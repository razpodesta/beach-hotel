/**
 * @file apps/portfolio-web/src/app/[lang]/layout.tsx
 * @description Orquestador Soberano del Shell Principal.
 *              Protege la hidratación de los Client Components, previene el CLS
 *              y genera metadatos SEO multilingües de élite (E-E-A-T).
 * @version 28.0 - Elite SSoT Shell & Zero CLS
 * @author Raz Podestá - MetaShark Tech
 */

import React, { Suspense } from 'react';
import type { Metadata } from 'next';

/**
 * IMPORTACIONES DE INFRAESTRUCTURA Y CONTRATOS
 * @pilar V: Adherencia Arquitectónica estricta.
 */
import { i18n, type Locale } from '../../config/i18n.config';
import { getDictionary } from '../../lib/get-dictionary';
import { fontInter, fontSignature, fontClashDisplay } from '../../lib/fonts';
import { cn } from '../../lib/utils/cn';

/**
 * IMPORTACIONES DE APARATOS DEL SHELL
 */
import { Providers } from '../../components/layout/Providers';
import { Header } from '../../components/layout/Header';
import { Footer } from '../../components/layout/Footer';
import { SystemStatusTicker } from '../../components/ui/SystemStatusTicker';
import { NewsletterModal } from '../../components/ui/NewsletterModal';
import { VisitorHud } from '../../components/ui/VisitorHud';
import { NavigationTracker } from '../../components/layout/NavigationTracker';

import '../global.css';

const fontVariables = `${fontInter.variable} ${fontSignature.variable} ${fontClashDisplay.variable}`;

/**
 * @description Generación de parámetros estáticos (SSG).
 * @pilar VIII: Resiliencia de Build y distribución Edge global.
 */
export async function generateStaticParams() {
  return i18n.locales.map((locale) => ({ lang: locale }));
}

/**
 * @description Generador de Identidad SEO.
 * @pilar I & VI: Genera metadatos localizados basados en el Master Dictionary.
 */
export async function generateMetadata({ params }: { params: Promise<{ lang: Locale }> }): Promise<Metadata> {
  const { lang } = await params;
  const dict = await getDictionary(lang);
  
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://beachhotelcanasvieiras.com';

  // Matriz de lenguajes alternativos para SEO Internacional (hreflang)
  const languageAlternates = i18n.locales.reduce((accumulator, locale) => {
    accumulator[locale] = `${baseUrl}/${locale}`;
    return accumulator;
  }, {} as Record<Locale, string>);

  const brandName = dict.header.personal_portfolio;

  return {
    title: {
      template: `%s | ${brandName}`,
      default: `${brandName} | ${dict.header.tagline}`,
    },
    description: dict.homepage.hero.page_description,
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: `${baseUrl}/${lang}`,
      languages: languageAlternates,
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
 * @description Envuelve toda la aplicación. Gobierna el DOM raíz y la inyección de Providers.
 */
export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = await params;
  
  // Carga del diccionario maestro para inyectarlo en el shell (Header, Footer, Ticker)
  const dictionary = await getDictionary(lang);

  return (
    <html lang={lang} suppressHydrationWarning>
      {/* 
         @pilar VII: Fusión semántica. Establecemos el fondo base desde el servidor
         para evitar el "Flash of Unstyled Content" (FOUC).
      */}
      <body 
        className={cn(
          fontVariables,
          "font-sans antialiased min-h-screen flex flex-col bg-[#050505] text-zinc-100 selection:bg-purple-500/30"
        )}
      >
        <Providers>
          {/* APARATO DE TELEMETRÍA (No Visual) */}
          <Suspense fallback={null}>
            <NavigationTracker />
          </Suspense>

          {/* CABECERA SOBERANA */}
          <Header dictionary={dictionary} />
          
          {/* 
             TICKER DE SISTEMA
             @pilar X (Performance): Se inyecta un esqueleto con dimensiones físicas exactas 
             (`h-10 border-b`) para evitar el Cumulative Layout Shift (CLS) en la carga.
          */}
          <Suspense fallback={<div className="h-10 w-full bg-[#050505] border-b border-white/10 animate-pulse" aria-hidden="true" />}>
            <SystemStatusTicker dictionary={dictionary.system_status} />
          </Suspense>

          {/* NÚCLEO DE CONTENIDO (Páginas dinámicas) */}
          <main className="grow relative z-0 flex flex-col">
            {children}
          </main>

          {/* PIE DE PÁGINA SOBERANO */}
          <Footer
            content={dictionary.footer}
            navLabels={dictionary['nav-links'].nav_links}
            tagline={dictionary.header.tagline}
          />

          {/* APARATOS EMERGENTES / HUD */}
          <Suspense fallback={null}>
            <NewsletterModal />
            <VisitorHud dictionary={dictionary.visitor_hud} />
          </Suspense>
        </Providers>
      </body>
    </html>
  );
}