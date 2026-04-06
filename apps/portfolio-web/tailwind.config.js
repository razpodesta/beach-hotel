/** 
 * @file apps/portfolio-web/tailwind.config.js
 * @description Orquestador de escaneo de clases para el motor CSS.
 *              Refactorizado: Convertido a ESM (export default) para compatibilidad
 *              con 'type: module' y Next.js 15.
 * @version 3.1 - ESM Compliant Standard
 */

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    /* 1. CONTENIDO LOCAL */
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    
    /* 2. CONTENIDO SOBERANO (Librerías) */
    '../../packages/*/src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};