/**
 * @file next.config.ts
 * @description Orquestador del Compilador Next.js 15 (The Artisan).
 *              Refactorizado: Anclaje de salida (distDir) para eliminar el 404
 *              y sincronización de fronteras para el entorno Vercel.
 * @version 10.3 - Sovereign Anchor Edition
 * @author Raz Podestá - MetaShark Tech
 */

import type { NextConfig } from 'next';
import { withNx } from '@nx/next/plugins/with-nx';
import { withPayload } from '@payloadcms/next/withPayload';

const nextConfig: NextConfig = {
  /**
   * PILAR XIII: Soberanía de Artefactos.
   * Forzamos al compilador a depositar el build (.next) en la carpeta dist.
   * Esto asegura que Vercel localice el 'routes-manifest.json' y elimina el 404.
   */
  distDir: '../../dist/apps/portfolio-web/.next',

  /**
   * PILAR V: Arquitectura Source-First.
   * Transpilación directa de dependencias internas para máxima consistencia.
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

  /**
   * PILAR XIII: Higiene de Infraestructura.
   * Evitamos que binarios nativos pesados contaminen la función Lambda.
   */
  serverExternalPackages: ['sharp', 'pg', 'bcryptjs'],

  /**
   * PROTOCOLO DE RESILIENCIA:
   * Timeout extendido para el ensamblaje de diccionarios MACS y Journal.
   */
  staticPageGenerationTimeout: 300,

  webpack: (config, { isServer }) => {
    if (!isServer) {
      /**
       * BÓVEDA DE SEGURIDAD (Client Shield):
       * Bloqueo físico de fuga de lógica de servidor hacia el cliente.
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

/**
 * COMPOSICIÓN SOBERANA:
 * El orden de los plugins garantiza que Nx maneje los alias y Payload 
 * inyecte el motor de base de datos antes de la exportación final.
 */
export default withPayload(withNx(nextConfig));