/**
 * @file fonts.ts
 * @description Orquestador Soberano de Tipografía. 
 *              Gestiona la carga de fuentes de Google y locales, inyectando 
 *              variables CSS compatibles con el motor Tailwind v4.
 * @version 2.0 - Tailwind v4 Sync & Path Hardening
 * @author Raz Podestá - MetaShark Tech
 */

import { Inter } from 'next/font/google';
import localFont from 'next/font/local';

/**
 * 1. FUENTES DE GOOGLE (Voz de Claridad)
 * Inter: Seleccionada por su legibilidad técnica y soporte de glifos.
 */
export const fontInter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});

/**
 * 2. FUENTES LOCALES (Identidad de Élite)
 * Alojadas en /public/fonts/ para máxima performance y cumplimiento de privacidad.
 */

/**
 * Voz de Firma: Dicaten
 * Utilizada para micro-interacciones y detalles de marca boutique.
 */
export const fontSignature = localFont({
  src: '../../public/fonts/Dicaten.woff2',
  variable: '--font-signature',
  display: 'swap',
  preload: true,
});

/**
 * Voz de Impacto: Clash Display
 * @fix Nivelación de variable a '--font-clash' para sincronización nativa 
 * con el motor Oxygen de Tailwind v4.
 */
export const fontClashDisplay = localFont({
  src: [
    { 
      path: '../../public/fonts/ClashDisplay-Regular.woff2', 
      weight: '400', 
      style: 'normal' 
    },
    { 
      path: '../../public/fonts/ClashDisplay-Bold.woff2', 
      weight: '700', 
      style: 'normal' 
    },
  ],
  variable: '--font-clash',
  display: 'swap',
  preload: true,
});

/**
 * 3. EXPORTACIÓN DE INFRAESTRUCTRURA
 * @description Acumulador de variables CSS para inyección atómica en el layout raíz.
 */
export const fontVariables = `${fontInter.variable} ${fontSignature.variable} ${fontClashDisplay.variable}`;