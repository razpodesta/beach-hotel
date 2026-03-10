// RUTA: apps/portfolio-web/src/app/[lang]/layout.tsx
// VERSIÓN: 26.0 - Integración Tipográfica Soberana
// DESCRIPCIÓN: Layout con Google Inter, Dicaten y Clash Display inyectados como variables CSS.

import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import { i18n, type Locale } from '../../config/i18n.config';
import { getDictionary } from '../../lib/get-dictionary';
import { Providers } from '../../components/layout/Providers';
import { Header } from '../../components/layout/Header';
import { Footer } from '../../components/layout/Footer';
import { SystemStatusTicker } from '../../components/ui/SystemStatusTicker';
import { NewsletterModal } from '../../components/ui/NewsletterModal';
import { VisitorHud } from '../../components/ui/VisitorHud';
import { NavigationTracker } from '../../components/layout/NavigationTracker';

// Importamos el motor de fuentes que creamos
import { fontInter, fontSignature, fontClashDisplay } from '../../lib/fonts';

import '../global.css';

// Variables combinadas para el body
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
    description: 'Explora un ecosistema digital en evolución. Desarrollo web, IA y estrategia.',
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
      <body className={`${fontVariables} font-sans antialiased`}>
        <Providers>
            <Suspense fallback={null}>
              <NavigationTracker />
            </Suspense>

            <div className="flex min-h-screen flex-col">
              <Header dictionary={dictionary} />
              <SystemStatusTicker dictionary={dictionary.system_status} />

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
            </Suspense>

            <VisitorHud dictionary={dictionary.visitor_hud} />
        </Providers>
      </body>
    </html>
  );
}