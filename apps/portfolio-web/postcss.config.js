// RUTA: apps/portfolio-web/postcss.config.js
// VERSIÓN: 4.0 - Definitiva y Forzada
// DESCRIPCIÓN: Esta configuración utiliza 'module.exports' y el plugin correcto
//              '@tailwindcss/postcss'. Esta es la única configuración que el
//              proceso de build debe leer.

module.exports = {
  plugins: {
    '@tailwindcss/postcss': {},
    autoprefixer: {},
  },
};
