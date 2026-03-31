/**
 * @file apps/portfolio-web/src/app/layout.tsx
 * @description Único Punto de Entrada al DOM (The Master Shell).
 *              Refactorizado: Centralización de tipografía híbrida (Google + Local),
 *              erradicación de errores de decodificación de fuentes y
 *              optimización de renderizado para Next.js 15.
 * @version 4.0 - Font Orchestrator Sync & OTS Error Fix
 * @author Raz Podestá - MetaShark Tech
 */

import React from 'react';
import { fontVariables } from '../lib/fonts';
import { cn } from '../lib/utils/cn';
import './global.css';

/**
 * @interface RootLayoutProps
 */
interface RootLayoutProps {
  children: React.ReactNode;
}

/**
 * APARATO: RootLayout
 * @description Este es el ÚNICO lugar del ecosistema donde residen las etiquetas <html> y <body>.
 *              Garantiza una base tipográfica y estética inmutable para toda la aplicación.
 */
export default function RootLayout({ children }: RootLayoutProps) {
  return (
    /**
     * @pilar VIII: Resiliencia de Hidratación.
     * 'suppressHydrationWarning' es vital para que 'next-themes' inyecte 
     * el atributo 'data-theme' sin generar errores de discrepancia.
     */
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        {/* 
            Precarga de recursos críticos. 
            El orquestador de fuentes ya gestiona el preloading de Google Fonts.
        */}
      </head>
      <body
        className={cn(
          fontVariables, // Inyección de Sora (Impacto), Inter (Claridad) y Dicaten (Marca)
          "font-sans bg-background text-foreground antialiased selection:bg-primary/30",
          "transition-colors duration-1000 min-h-screen"
        )}
      >
        {children}
      </body>
    </html>
  );
}