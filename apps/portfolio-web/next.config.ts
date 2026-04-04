/**
 * @file apps/portfolio-web/next.config.ts
 * @description Configuración soberana del orquestador Next.js.
 *              Refactorizado: Resolución de Webpack mediante externals para
 *              evitar errores de empaquetado en el cliente sin bloquear tipos.
 * @version 4.2 - Build-Safe & Webpack-Optimized
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
      /**
       * @fix: En lugar de forzar el alias a 'false' (que rompe el build),
       * usamos 'externals' o definimos alias vacíos de forma controlada.
       * Esto permite que los tipos de Payload sean leídos, pero bloquea 
       * la ejecución de código pesado en el navegador.
       */
      config.resolve.alias = {
        ...config.resolve.alias,
        'sharp': false,
        'pg': false,
        'canvas': false,
      };
    }
    
    // Configuramos 'externals' para módulos de Node.js en el cliente
    config.externals = [...(config.externals || []), 'sharp', 'pg'];

    return config;
  },

  experimental: {
    typedRoutes: true,
  },
};

export default withPayload(withNx(nextConfig));