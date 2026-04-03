/**
 * @file next.config.ts
 * @description Orquestador del Compilador Next.js 15 (The Artisan).
 *              Refactorizado: Restauración de Neutralidad de Salida y 
 *              activación estricta de React Strict Mode.
 * @version 10.6 - Neutralized Build Standard & Strict Sync
 * @author Raz Podestá - MetaShark Tech
 */

import type { NextConfig } from 'next';
import { withNx } from '@nx/next/plugins/with-nx';
import { withPayload } from '@payloadcms/next/withPayload';

const nextConfig: NextConfig = {
  /**
   * @pilar_XIII: Simplificación de Infraestructura.
   * Sin 'distDir', Next.js generará su carpeta '.next' nativamente
   * dentro de 'apps/portfolio-web', alineándose perfectamente con Vercel.
   */

  /** @pilar_X: Rigor de Renderizado */
  reactStrictMode: true,

  /**
   * @pilar_V: Arquitectura Source-First.
   * Mantenemos la transpilación directa de paquetes para asegurar
   * la sincronía de tipos en el build masivo.
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
    minimumCacheTTL: 60,
  },

  serverExternalPackages: ['sharp', 'pg', 'bcryptjs'],

  staticPageGenerationTimeout: 300,

  webpack: (config, { isServer }) => {
    if (!isServer) {
      /**
       * BÓVEDA DE SEGURIDAD (Client Shield):
       * Bloqueo físico de lógica de servidor en el bundle del cliente.
       */
      config.resolve.alias = {
        ...config.resolve.alias,
        '@metashark/cms-core/config': false,
        'payload': false,
        'sharp': false,
        'pg': false,
        'canvas': false,
      };
    }
    return config;
  },

  experimental: {
    typedRoutes: true,
  },
};

export default withPayload(withNx(nextConfig));