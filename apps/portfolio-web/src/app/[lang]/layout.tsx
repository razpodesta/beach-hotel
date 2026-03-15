/**
 * @file apps/portfolio-web/src/app/[lang]/layout.tsx
 * @description Orquestador del Shell Principal. Refactorizado para Build-Safety (SSG).
 *              Protege los Client Components con Suspense y límites de renderizado.
 * @version 27.2 - Build-Safe Resilience
 * @author Raz Podestá - MetaShark Tech
 */

import React, { Suspense } from 'react';
import type { Metadata } from 'next';

import { i18n, type Locale } from '../../config/i18n.config';
import { getDictionary } from '../../lib/get-dictionary';
import { fontInter, fontSignature, fontClashDisplay } from '../../lib/fonts';

import { Providers } from '../../components/layout/Providers';
import { Header } from '../../components/layout/Header';
import { Footer } from '../../components/layout/Footer';
import { SystemStatusTicker } from '../../components/ui/SystemStatusTicker';
import { NewsletterModal } from '../../components/ui/NewsletterModal';
import { VisitorHud } from '../../components/ui/VisitorHud';
import { NavigationTracker } from '../../components/layout/NavigationTracker';

import '../global.css';

const fontVariables = `${fontInter.variable} ${fontSignature.variable} ${fontClashDisplay.variable}`;

export async function generateStaticParams() {
  return i18n.locales.map((locale) => ({ lang: locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ lang: Locale }> }): Promise<Metadata> {
  const { lang: currentLanguage } = await params;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:4200';

  const languageAlternates = i18n.locales.reduce((accumulator, locale) => {
    accumulator[locale] = `${baseUrl}/${locale}`;
    return accumulator;
  }, {} as Record<Locale, string>);

  return {
    title: {
      template: '%s | Raz Podestá',
      default: 'Raz Podestá | Portafolio & Ecosistema Digital',
    },
    description: 'Explora un ecosistema digital en evolución.',
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: `${baseUrl}/${currentLanguage}`,
      languages: languageAlternates,
    },
  };
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = await params;
  const dictionary = await getDictionary(lang);

  return (
    <html lang={lang} suppressHydrationWarning>
      <head />
      {/* Añadido min-h-screen para prevenir layout shift */}
      <body className={`${fontVariables} font-sans antialiased min-h-screen`}>
        <Providers>
            {/* 
               Aparatos de Cliente Blindados:
               Se mantienen dentro de Providers pero fuera del flujo crítico de servidores.
               El uso de Suspense y la lógica interna de los componentes (ya refactorizada 
               con useIsMounted/useSyncExternalStore) evita el error de useContext nulo.
            */}
            <Suspense fallback={null}>
              <NavigationTracker />
            </Suspense>

            <div className="flex min-h-screen flex-col">
              <Header dictionary={dictionary} />
              
              <Suspense fallback={null}>
                <SystemStatusTicker dictionary={dictionary.system_status} />
              </Suspense>

              <main className="grow relative z-0">
                {children}
              </main>

              <Footer
                content={dictionary.footer}
                navLabels={dictionary['nav-links'].nav_links}
                tagline={dictionary.header.tagline}
              />
            </div>

            <Suspense fallback={null}>
              <NewsletterModal />
              <VisitorHud dictionary={dictionary.visitor_hud} />
            </Suspense>
        </Providers>
      </body>
    </html>
  );
}