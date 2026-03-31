/**
 * @file fonts.ts
 * @description Orquestador Soberano de Tipografía (Oxygen Typography).
 *              Refactorizado: Migración a sistema híbrido (Sora/Inter via Google 
 *              Fonts + Dicaten Local) para erradicar errores de decodificación 
 *              OTS y optimizar el LCP en Vercel.
 * @version 3.1 - Hybrid Variable Font Sync
 * @author Raz Podestá - MetaShark Tech
 */

import { Inter, Sora } from 'next/font/google';
import localFont from 'next/font/local';

/**
 * 1. FUENTES DE CLARIDAD Y UI (Google Fonts Variable)
 * @pilar X: Performance. Las fuentes variables cargan un único binario 
 * optimizado que contiene todos los pesos, eliminando peticiones redundantes.
 */

/** Voz de Claridad Técnica: Inter (Párrafos, Inputs, Telemetría) */
export const fontSans = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

/** Voz de Impacto Boutique: Sora (Títulos, Hero, Badges) */
export const fontDisplay = Sora({
  subsets: ['latin'],
  variable: '--font-clash', // Sincronizado con el token CSS '--font-clash'
  display: 'swap',
  weight: ['400', '600', '700', '800'],
});

/**
 * 2. FUENTE DE IDENTIDAD (Sovereign Local Font)
 * @description Activo de marca exclusivo para el Logo y firmas de autoría.
 * @pilar I: Soberanía de Marca.
 */
export const fontSignature = localFont({
  src: '../../public/fonts/Dicaten.woff2',
  variable: '--font-signature',
  display: 'swap',
  preload: true,
});

/**
 * 3. ACUMULADOR DE VARIABLES SOBERANAS
 * @description Exportación unificada para inyección atómica en el body del Layout.
 *              Garantiza que Tailwind v4 reconozca los tokens dinámicamente.
 */
export const fontVariables = `${fontSans.variable} ${fontDisplay.variable} ${fontSignature.variable}`;