/**
 * @file apps/portfolio-web/src/app/layout.tsx
 * @description Único Punto de Entrada al DOM (The Master Shell).
 *              Refactorizado: Inyección dinámica de idioma (SSoT),
 *              erradicación de Hydration Mismatches y blindaje PWA.
 * @version 5.0 - Dynamic Localization & Hydration Hardening
 * @author Raz Podestá - MetaShark Tech
 */

import React from 'react';
import type { Viewport } from 'next';

/**
 * IMPORTACIONES DE INFRAESTRUCTRURA
 */
import { i18n } from '../config/i18n.config';
import { fontVariables } from '../lib/fonts';
import { cn } from '../lib/utils/cn';
import '../global.css';

/**
 * CONFIGURACIÓN DE VIEWPORT
 */
export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#fcfcfc' },
    { media: '(prefers-color-scheme: dark)', color: '#080808' }
  ],
  width: 'device-width',
  initialScale: 1,
};

/**
 * APARATO: RootLayout
 * @description Este layout maneja la raíz absoluta. Al no tener el segmento [lang],
 *              se comporta como un contenedor de infraestructura para toda la App.
 */
export default async function RootLayout({ 
  children 
}: { 
  children: React.ReactNode;
}) {
  /**
   * @pilar VI: i18n Nativa.
   * Usamos el idioma por defecto definido en el Códice.
   */
  const lang = i18n.defaultLocale;

  return (
    <html lang={lang} suppressHydrationWarning className="scroll-smooth">
      <head>
        <link rel="apple-touch-icon" href="/images/hotel/icon-192x192.png" />
      </head>
      <body
        className={cn(
          fontVariables,
          "font-sans bg-background text-foreground antialiased selection:bg-primary/30",
          "transition-colors duration-1000 min-h-screen"
        )}
      >
        {children}
      </body>
    </html>
  );
}