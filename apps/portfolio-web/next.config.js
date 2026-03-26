/**
 * @file next.config.js
 * @description Orquestador de compilación para portfolio-web.
 *              Habilita el Modo Source-First (Fase A) del Manifiesto TypeScript.
 */
const { withNx } = require('@nx/next/plugins/with-nx');
const { withPayload } = require('@payloadcms/next/withPayload');

/** @type {import('next').NextConfig} */
const nextConfig = {
  /* 
     PILAR II: CERO REGRESIONES (Source-First)
     Obligamos a Next.js a mirar el 'src/' de nuestras librerías internas.
     Esto soluciona los errores de "módulo no encontrado" en el runtime.
  */
  transpilePackages: [
    '@metashark/cms-core',
    '@metashark/cms-ui',
    '@metashark/protocol-33',
    '@metashark/auth-shield'
  ],
  
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'flagcdn.com' },
      { protocol: 'https', hostname: '*.supabase.co' }
    ],
    dangerouslyAllowSVG: true,
  },

  /* Optimización para despliegues escalables */
  output: 'standalone',
  
  // Desactiva la telemetría de Next.js para mayor privacidad de infraestructura
  telemetry: false 
};

module.exports = withPayload(withNx(nextConfig));