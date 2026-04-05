/**
 * @file apps/portfolio-web/src/lib/fonts.ts
 * @description Orquestador Soberano de Tipografía (Oxygen Typography Engine).
 *              Gestiona el sistema híbrido de fuentes (Google Fonts + Local)
 *              optimizado para Core Web Vitals (LCP < 1.2s) y Tailwind v4.
 *              Refactorizado: Inyección de telemetría Heimdall, optimización 
 *              de fallbacks y blindaje de rutas para Vercel Build.
 * @version 4.0 - DNA Typography Standard (High-Fidelity LCP)
 * @author Raz Podestá - MetaShark Tech
 */

import { Inter, Sora } from 'next/font/google';
import localFont from 'next/font/local';

/**
 * CONSTANTES CROMÁTICAS PARA TELEMETRÍA (Protocolo Heimdall)
 */
const C = {
  reset: '\x1b[0m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  bold: '\x1b[1m'
};

const typographyStart = performance.now();
console.log(`\n${C.magenta}${C.bold}[DNA][TYPOGRAPHY]${C.reset} Calibrando motor Oxygen...`);

/**
 * 1. VOZ DE CLARIDAD TÉCNICA: Inter (Sans-Serif)
 * @pilar X: Performance - Fuente variable para reducir peticiones HTTP.
 * @description Utilizada para párrafos, telemetría y entradas de datos.
 */
export const fontSans = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  /** 
   * @fix: adjustFontFallback: true
   * Minimiza el CLS al ajustar automáticamente el tamaño de la fuente del sistema
   * mientras se descarga el binario de Google.
   */
  adjustFontFallback: true,
});

/**
 * 2. VOZ DE IMPACTO BOUTIQUE: Sora (Display)
 * @pilar I: Soberanía de Marca.
 * @description Utilizada para Títulos, Hero y Badges de lujo. 
 * Se mapea al token '--font-clash' para compatibilidad con el Oxygen Engine heredado.
 */
export const fontDisplay = Sora({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-clash',
  weight: ['400', '600', '700', '800'],
  preload: true,
});

/**
 * 3. VOZ DE IDENTIDAD SOBERANA: Dicaten (Local Signature)
 * @pilar I: Soberanía de Marca.
 * @description Fuente caligráfica innegociable para Logos y firmas de autoría.
 * @fix: Ruta absoluta relativa al proyecto para estabilidad en Vercel Build Workers.
 */
export const fontSignature = localFont({
  src: '../../public/fonts/Dicaten.woff2',
  variable: '--font-signature',
  display: 'swap',
  /** 
   * @pilar VIII: Resiliencia. 
   * Preload true asegura que el logo no sufra FOUT (Flash of Unstyled Text).
   */
  preload: true,
  style: 'normal',
});

/**
 * 4. ACUMULADOR DE VARIABLES SOBERANAS
 * @description Inyectado en el Root Layout para exponer los tokens CSS al DOM.
 * Permite que Tailwind v4 acceda a:
 * - var(--font-inter)
 * - var(--font-clash)
 * - var(--font-signature)
 */
export const fontVariables = [
  fontSans.variable,
  fontDisplay.variable,
  fontSignature.variable
].join(' ');

const typographyDuration = (performance.now() - typographyStart).toFixed(4);
console.log(`   ${C.green}✓ [OK]${C.reset} Oxygen Engine calibrated | Time: ${typographyDuration}ms\n`);