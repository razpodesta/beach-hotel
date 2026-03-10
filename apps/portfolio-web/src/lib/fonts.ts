// RUTA: apps/portfolio-web/src/lib/fonts.ts
// VERSIÓN: 1.0 - Sistema de Tipografía Soberano
// DESCRIPCIÓN: Orquestador de fuentes locales y de Google. Implementa variables CSS
//              para garantizar que el diseño sea controlado semánticamente.

import { Inter } from 'next/font/google';
import localFont from 'next/font/local';

/**
 * 1. FUENTES DE GOOGLE (Para cuerpo y legibilidad)
 * Inter es la fuente base elegida por su legibilidad extrema y soporte global.
 */
export const fontInter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});

/**
 * 2. FUENTES LOCALES (Para identidad de élite)
 * Se cargan desde /public/fonts/.
 */

// Voz de firma (Dicaten): Elegante, cursiva, para toques boutique.
export const fontSignature = localFont({
  src: '../../public/fonts/Dicaten.woff2',
  variable: '--font-signature',
  display: 'swap',
  preload: true,
});

// Voz de impacto (Clash Display): Audaz, moderna, para títulos.
export const fontClashDisplay = localFont({
  src: [
    { path: '../../public/fonts/ClashDisplay-Regular.woff2', weight: '400', style: 'normal' },
    { path: '../../public/fonts/ClashDisplay-Bold.woff2', weight: '700', style: 'normal' },
  ],
  variable: '--font-display',
  display: 'swap',
  preload: true,
});

/**
 * 3. EXPORTACIÓN DE VARIABLES CSS
 * Exportamos la combinación de clases para inyectar en el layout raíz.
 */
export const fontVariables = `${fontInter.variable} ${fontSignature.variable} ${fontClashDisplay.variable}`;

/**
 * @fileoverview
 * Para implementar estas fuentes:
 * 1. En el layout.tsx: <body className={`${fontVariables} font-sans`}>
 * 2. En el tailwind.config.js (o global.css):
 *    --font-sans: var(--font-inter);
 *    --font-display: var(--font-display);
 *    --font-signature: var(--font-signature);
 */