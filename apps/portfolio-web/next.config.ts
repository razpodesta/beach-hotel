/**
 * @file next.config.ts
 * @description Orquestador del Compilador Next.js 15 (The Artisan).
 *              Refactorizado: Restauración de Neutralidad de Salida. Se elimina 
 *              distDir para permitir que Nx y Vercel coordinen la ubicación 
 *              de los artefactos de forma nativa.
 * @version 10.5 - Neutralized Build Standard
 * @author Raz Podestá - MetaShark Tech
 */

import type { NextConfig } from 'next';
import { withNx } from '@nx/next/plugins/with-nx';
import { withPayload } from '@payloadcms/next/withPayload';

const nextConfig: NextConfig = {
  /**
   * @pilar_XIII: Simplificación de Infraestructura.
   * SE ELIMINA 'distDir'. Next.js usará su ubicación por defecto o la 
   * inyectada por el executor de Nx, evitando que los artefactos 
   * se "fuguen" a la raíz del monorepo durante el build de Vercel.
   */

  /**
   * @pilar_V: Arquitectura Source-First.
   * Mantenemos la transpilación directa de paquetes para asegurar
   * la sincronía de tipos en el build.
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