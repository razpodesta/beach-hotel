/**
 * @file next.config.ts
 * @description Orquestador Soberano de Compilación para portfolio-web.
 *              Refactorizado: Limpieza de logs, sincronización con Next.js 15.2+ 
 *              y blindaje de telemetría.
 * @version 17.1
 * @author Raz Podestá - MetaShark Tech
 */

import type { NextConfig } from 'next';
import { withNx } from '@nx/next/plugins/with-nx';
import { withPayload } from '@payloadcms/next/withPayload';

const nextConfig: NextConfig = {
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

  output: 'standalone',

  serverExternalPackages: ['sharp'],

  /**
   * @description Silenciado de ruido de build innecesario para cumplir con 
   * el protocolo de observabilidad y limpiar logs de Vercel.
   */
  logging: {
    fetches: {
      fullUrl: false,
    },
  },

  experimental: {
    typedRoutes: true,
  },

  telemetry: false,
};

export default withPayload(withNx(nextConfig));