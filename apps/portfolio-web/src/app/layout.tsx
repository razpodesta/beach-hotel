/**
 * @file apps/portfolio-web/src/app/layout.tsx
 * @description Authorized Shell Absoluto (Root Orchestrator).
 *              Responsabilidad: DOM Base, Inyección de Fuentes y Persistencia de Bóveda.
 *              Refactorizado: Centralización de Metadatos base y optimización de 
 *              Handshake de hidratación para Next.js 15.
 * 
 * @version 3.0 - DNA Infrastructure Standard
 * @author Staff Engineer - MetaShark Tech
 */

import React from 'react';
import type { Metadata, Viewport } from 'next';

/** 
 * IMPORTACIONES DE INFRAESTRUCTRURA (Nx Boundary Safe)
 * @pilar V: Adherencia Arquitectónica.
 */
import { fontVariables } from '../lib/fonts';
import { cn } from '../lib/utils/cn';
import { i18n } from '../config/i18n.config';
import { Providers } from '../components/layout/Providers';

/** 
 * MOTOR DE ESTILOS SOBERANO
 * @pilar VII: Theming Day-First (OKLCH).
 */
import './global.css';

/**
 * CONFIGURACIÓN DE VIEWPORT (Performance & UX)
 * @description Asegura que la UI se adapte correctamente a dispositivos móviles.
 */
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5, // A11Y Friendly
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#fbfaff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
  ],
};

/**
 * METADATOS BASE (SEO E-E-A-T)
 * @description Estos valores actúan como fallback global.
 */
export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:4200'),
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/images/hotel/icon-192x192.png',
  },
};

/**
 * @interface RootLayoutProps
 */
interface RootLayoutProps {
  children: React.ReactNode;
}

/**
 * APARATO: RootLayout
 * @pilar I: Visión Holística - Punto de entrada innegociable.
 */
export default function RootLayout({ children }: RootLayoutProps) {
  return (
    /**
     * @pilar VIII: Resiliencia de Hidratación.
     * suppressHydrationWarning es vital porque 'next-themes' inyectará 
     * un atributo 'data-theme' en tiempo de ejecución en el cliente.
     */
    <html 
      lang={i18n.defaultLocale} 
      className={cn(fontVariables, "scroll-smooth")} 
      suppressHydrationWarning
    >
      <body className={cn(
        "font-sans antialiased min-h-screen flex flex-col bg-background text-foreground",
        "selection:bg-primary/30 transition-colors duration-1000",
        "gpu-layer" // Aceleración por hardware para transiciones de tema
      )}>
        {/* 
            AUTHORIZED WRAPPER (The Vault)
            Encapsula la lógica de Temas, Sesión de Supabase y 
            Estado Global de UI. Vive en la raíz para ser inmutable.
        */}
        <Providers>
          {children}
        </Providers>

        {/* 
            SEO SENTINEL
            Inyección sutil de la identidad de la infraestructura.
        */}
        <div hidden id="infrastructure-signal" data-node="MetaShark-Core-v3.0" />
      </body>
    </html>
  );
}