// RUTA: apps/portfolio-web/tailwind.config.js
// VERSIÓN: 2.0 - Simplificada para Tailwind v4
// DESCRIPCIÓN: Con la configuración de tema movida al CSS, este archivo
//              solo mantiene su responsabilidad más importante: definir
//              las rutas de contenido que Tailwind debe escanear.

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {},
  },
  plugins: [],
};
