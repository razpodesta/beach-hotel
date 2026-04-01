/**
 * @file apps/portfolio-web/next.config.ts
 * @description Orquestador Soberano de Compilación.
 *              Actualización: Sincronización de distDir para paridad Nx/Vercel.
 */

import type { NextConfig } from 'next';
import { withNx } from '@nx/next/plugins/with-nx';
import { withPayload } from '@payloadcms/next/withPayload';

const nextConfig: NextConfig = {
  // Sincronización de salida para evitar que Vercel busque en carpetas incorrectas
  distDir: '.next', 

  transpilePackages:[
    '@metashark/cms-core',
    '@metashark/cms-ui',
    '@metashark/protocol-33',
    '@metashark/auth-shield'
  ],

  images: {
    remotePatterns:[
      { protocol: 'https', hostname: 'flagcdn.com' },
      { protocol: 'https', hostname: '*.supabase.co' }
    ],
    dangerouslyAllowSVG: true,
    minimumCacheTTL: 60,
  },

  serverExternalPackages: ['sharp', 'pg', 'bcryptjs'],

  staticPageGenerationTimeout: 300,

  experimental: {
    typedRoutes: true,
    cpus: 1,
    workerThreads: false,
  },
};

export default withPayload(withNx(nextConfig));