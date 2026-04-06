/**
 * @file apps/portfolio-web/src/app/[lang]/layout.tsx
 * @description Layout localizado. Refactorizado con importaciones relativas
 *              estrictas para cumplir con la política de fronteras de Nx.
 * @version 47.1 - Nx Boundary Compliant (Relative Imports)
 * @author Staff Engineer - MetaShark Tech
 */

import React, { Suspense } from 'react';
import type { Metadata, Viewport } from 'next';

// Rutas relativas para cumplir con @nx/enforce-module-boundaries
import { i18n, type Locale } from '../../config/i18n.config';
import { getDictionary } from '../../lib/get-dictionary';
import { fontVariables } from '../../lib/fonts';
import { cn } from '../../lib/utils/cn';

import { Providers } from '../../components/layout/Providers';
import { Header } from '../../components/layout/Header';
import { Footer } from '../../components/layout/Footer';
import { SystemStatusTicker } from '../../components/ui/SystemStatusTicker';
import { NewsletterModal } from '../../components/ui/NewsletterModal';
import { AuthPortal } from '../../components/ui/AuthPortal';
import { NavigationTracker } from '../../components/layout/NavigationTracker';
import { VisitorHud } from '../../components/ui/VisitorHud';

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#fcfcfc' },
    { media: '(prefers-color-scheme: dark)', color: '#080808' }
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export async function generateStaticParams() {
  return i18n.locales.map((locale) => ({ lang: locale }));
}

export async function generateMetadata(props: { params: Promise<{ lang: Locale }> }): Promise<Metadata> {
  const { lang } = await props.params;
  const dict = await getDictionary(lang);
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://beachhotelcanasvieiras.com';
  
  return {
    metadataBase: new URL(baseUrl),
    title: { template: `%s | ${dict.header.personal_portfolio}`, default: dict.header.tagline },
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

export default async function LocalizedLayout({ 
  children, 
  params 
}: { 
  children: React.ReactNode, 
  params: Promise<{ lang: Locale }> 
}) {
  const { lang } = await params;
  const dictionary = await getDictionary(lang);
  
  return (
    <div className={cn(
        fontVariables, 
        "font-sans antialiased min-h-screen flex flex-col bg-background text-foreground selection:bg-primary/30 transition-colors duration-1000"
      )}>
      <Providers>
        <NavigationTracker />
        
        <Header dictionary={dictionary} />
        
        <Suspense fallback={<div className="h-[41px] w-full bg-background border-b border-border animate-pulse" />}>
          <SystemStatusTicker dictionary={dictionary.system_status} />
        </Suspense>

        <main className="grow relative z-0 flex flex-col" id="main-content">
          {children}
        </main>

        <Footer
          content={dictionary.footer}
          newsletterContent={dictionary.newsletter_form}
          navLabels={dictionary['nav-links'].nav_links}
          tagline={dictionary.header.tagline}
        />

        <Suspense fallback={null}>
          <AuthPortal dictionary={dictionary.auth_portal} />
          <NewsletterModal dictionary={dictionary.newsletter_form} />
          <VisitorHud dictionary={dictionary} />
        </Suspense>
      </Providers>
    </div>
  );
}