/**
 * @file apps/portfolio-web/next.config.ts
 * @description Orquestador soberano Next.js.
 *              Refactorizado: Eliminación de 'configPath' redundante para 
 *              erradicar TS2353 y asegurar compatibilidad con Payload 3.80.0.
 * @version 5.1 - Clean Plugin Standard
 * @author Raz Podestá - MetaShark Tech
 */

import type { NextConfig } from 'next';
import { withNx } from '@nx/next/plugins/with-nx';
import { withPayload } from '@payloadcms/next/withPayload';

const nextConfig: NextConfig = {
  output: 'standalone',
  reactStrictMode: true,

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
      config.resolve.alias = {
        ...config.resolve.alias,
        'sharp': false,
        'pg': false,
        'canvas': false,
      };
      config.externals = [...(config.externals || []), 'sharp', 'pg'];
    }
    return config;
  },

  experimental: {
    typedRoutes: true,
  },
};

/**
 * @pilar IX: Desacoplamiento.
 * Ejecutamos withPayload y withNx sin configurar manualmente el configPath,
 * dejando que la magia de Payload encuentre la configuración por convención.
 */
export default withPayload(withNx(nextConfig));