// RUTA: apps/portfolio-web/next.config.js

/**
 * @file Next.js Configuration (CMS Integration Layer)
 * @version 4.0 - Payload 3.0 Native Integration
 * @description Configura la integración nativa de Payload CMS 3.0 en el App Router.
 *              Incluye políticas de seguridad para media y transpilación modular.
 */

// @ts-check
const { composePlugins, withNx } = require('@nx/next');
const { withPayload } = require('@payloadcms/next/withPayload');

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuración de salida para despliegue en Vercel/Docker
  output: 'standalone',

  // --- OPTIMIZACIÓN DE BUILD ---
  // Mantenemos la transpilación de librerías soberanas del monorepo
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

// Integramos withPayload para habilitar el CMS en el App Router
// El orden de ejecución es crítico para la resolución de rutas
module.exports = composePlugins(
  withNx,
  withPayload
)(nextConfig);