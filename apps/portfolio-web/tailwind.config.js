/** 
 * @file apps/portfolio-web/tailwind.config.js
 * @description Orquestador de escaneo de clases para el motor CSS.
 *              Nivelado para capturar estilos de librerías compartidas (Source-First).
 * @version 3.0 - Monorepo Content Sync
 * @author Raz Podestá - MetaShark Tech
 */

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    /* 
       1. CONTENIDO LOCAL:
       Escanea todos los componentes y páginas de la aplicación web.
    */
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    
    /* 
       2. CONTENIDO SOBERANO (Librerías):
       PILAR II: CERO REGRESIONES.
       Añadimos la ruta hacia el código fuente de los paquetes. 
       Esto garantiza que las clases de Tailwind utilizadas en @metashark/cms-ui
       y otras librerías visuales sean incluidas en el bundle final.
    */
    '../../packages/*/src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      /* 
         Nota: La mayoría de los tokens (colores, fuentes) se gestionan 
         mediante OKLCH y variables CSS en apps/portfolio-web/src/app/global.css 
         siguiendo el estándar de Tailwind v4.
      */
    },
  },
  plugins: [],
};