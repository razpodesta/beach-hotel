/**
 * @file apps/portfolio-web/src/app/layout.tsx
 * @description Authorized Shell Absoluto. Punto de anclaje físico innegociable.
 *              Responsable del DOM base, carga de fuentes soberanas y orquestación de Providers.
 * @version 2.0 - Infrastructure Centralization
 * @author Staff Engineer - MetaShark Tech
 */

import React from 'react';
import { fontVariables } from '../lib/fonts';
import { cn } from '../lib/utils/cn';
import { i18n } from '../config/i18n.config';
import { Providers } from '../components/layout/Providers';

/** 
 * MOTOR DE ESTILOS SOBERANO
 * Cargado en la raíz para garantizar persistencia visual absoluta.
 */
import './global.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    /**
     * @pilar VIII: Resiliencia de Hidratación.
     * suppressHydrationWarning es vital para evitar desajustes por extensiones del navegador o temas.
     */
    <html 
      lang={i18n.defaultLocale} 
      className={cn(fontVariables, "scroll-smooth")} 
      suppressHydrationWarning
    >
      <body className={cn(
        "font-sans antialiased min-h-screen flex flex-col bg-background text-foreground",
        "selection:bg-primary/30 transition-colors duration-1000"
      )}>
        {/* 
            AUTHORIZED WRAPPER
            Los Providers viven aquí para que el estado de temas y datos 
            persista durante el cambio de segmentos [lang].
        */}
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}