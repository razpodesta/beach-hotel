// RUTA: apps/portfolio-web/next.config.js
// VERSIÓN: 3.4 - Type Safety & Stability Fix
// DESCRIPCIÓN: Se reemplaza el tipo interno roto de @nx/next por el estándar
//              de Next.js para eliminar el error TS2306.

// @ts-check
const { composePlugins, withNx } = require('@nx/next');

/**
 * @type {import('next').NextConfig}
 **/
const nextConfig = {
  // El objeto 'nx' se mantiene implícito para que el plugin lo maneje,
  // pero ya no bloquea el tipado estático.
  nx: {
    // Configuración limpia.
  },
  output: 'standalone',

  // --- OPTIMIZACIÓN DE BUILD ---
  transpilePackages: [
    '@metashark-cms/ui',
    '@metashark-cms/core',
    '@razpodesta/protocol-33',
    '@razpodesta/auth-shield'
  ],

  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'flagcdn.com' },
      { protocol: 'https', hostname: 'api.qrserver.com' },
      { protocol: 'https', hostname: 'github.com' },
      { protocol: 'https', hostname: 'raw.githubusercontent.com' },
      { protocol: 'https', hostname: '*.supabase.co' }
    ],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

module.exports = composePlugins(withNx)(nextConfig);
