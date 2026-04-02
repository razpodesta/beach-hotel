/**
 * @file apps/portfolio-web/src/app/[lang]/layout.tsx
 * @description Orquestador Soberano del Shell Principal (The Master Shell).
 *              Consolidado como el ÚNICO Root Layout del ecosistema.
 *              Refactorizado: Erradicación de doble anidamiento DOM, 
 *              optimización de hidratación y soporte PWA nativo.
 * @version 43.0 - Single Root Integrity & Hydration Safe
 * @author Raz Podestá - Staff Engineer, MetaShark Tech
 */

import React, { Suspense } from 'react';
import type { Metadata, Viewport } from 'next';

/**
 * IMPORTACIONES DE INFRAESTRUCTURA
 * @pilar_V: Adherencia arquitectónica a las fronteras de Nx.
 */
import { i18n, type Locale } from '../../config/i18n.config';
import { getDictionary } from '../../lib/get-dictionary';
import { fontVariables } from '../../lib/fonts';
import { cn } from '../../lib/utils/cn';
import '../global.css';

/**
 * IMPORTACIONES DE COMPONENTES DEL SHELL (Lego System)
 * @pilar_IX: Componentización de responsabilidad única.
 */
import { Providers } from '../../components/layout/Providers';
import { Header } from '../../components/layout/Header';
import { Footer } from '../../components/layout/Footer';
import { SystemStatusTicker } from '../../components/ui/SystemStatusTicker';
import { NewsletterModal } from '../../components/ui/NewsletterModal';
import { AuthPortal } from '../../components/ui/AuthPortal';
import { NavigationTracker } from '../../components/layout/NavigationTracker';
import { VisitorHud } from '../../components/ui/VisitorHud';

/**
 * CONFIGURACIÓN DE VIEWPORT (Next.js 15 Standard)
 * @description Sincronizado con Oxygen Engine para estabilidad cromática inicial.
 */
export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#fcfcfc' }, // Arena (Día)
    { media: '(prefers-color-scheme: dark)', color: '#080808' }   // Obsidiana (Noche)
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

/**
 * GENERACIÓN DE RUTAS ESTÁTICAS (SSG)
 * @description Pre-construye el esqueleto para todos los idiomas autorizados.
 */
export async function generateStaticParams() {
  return i18n.locales.map((locale) => ({ lang: locale }));
}

/**
 * ORQUESTADOR DE METADATOS SOBERANO
 * @pilar_I: Visión Holística - SEO E-E-A-T & PWA Identity.
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
    manifest: '/manifest.json',
    
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
        width: 1200, 
        height: 630,
        alt: siteName
      }]
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
 * APARATO PRINCIPAL: RootLayout (The Master Shell)
 * @description Orquesta la jerarquía visual base y la inyección de recursos globales.
 *              Actúa como el único <html> y <body> del árbol de renderizado.
 */
export default async function RootLayout({ children, params }: RootLayoutProps) {
  const { lang } = await params;
  const dictionary = await getDictionary(lang);
  
  /** @pilar_IV: Protocolo Heimdall - Telemetría de Montaje del Shell */
  console.log(`[HEIMDALL][SHELL] Master Shell Synced: [${lang}]`);

  return (
    <html lang={lang} suppressHydrationWarning className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://flagcdn.com" />
        <link rel="apple-touch-icon" href="/images/hotel/icon-192x192.png" />
      </head>
      <body className={cn(
        fontVariables, // Inyección atómica de tokens Sora, Inter y Dicaten
        "font-sans antialiased min-h-screen flex flex-col bg-background text-foreground selection:bg-primary/30 transition-colors duration-1000"
      )}>
        <Providers>
          {/* TRACKING COMPORTAMENTAL (Pilar XII) */}
          <Suspense fallback={null}>
            <NavigationTracker />
          </Suspense>

          {/* CABECERA SOBERANA (NavDesk) */}
          <Header dictionary={dictionary} />
          
          {/* TELEMETRÍA GLOBAL (Ticker) */}
          <Suspense fallback={
            <div className="h-[41px] w-full bg-background border-b border-border animate-pulse" aria-hidden="true" />
          }>
            <SystemStatusTicker dictionary={dictionary.system_status} />
          </Suspense>

          {/* VIEWPORT PRINCIPAL */}
          <main className="grow relative z-0 flex flex-col" id="main-content">
            {children}
          </main>

          {/* PIE DE PÁGINA (Compliance & Trust) */}
          <Footer
            content={dictionary.footer}
            newsletterContent={dictionary.newsletter_form}
            navLabels={dictionary['nav-links'].nav_links}
            tagline={dictionary.header.tagline}
          />

          {/* --- CAPA DE PORTALES (Overlay Layer) --- 
              @pilar_XII: MEA/UX - Gestión de modales y HUDs. Envueltos en Suspense
              para no bloquear la hidratación del hilo principal.
          */}
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