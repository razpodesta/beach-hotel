/**
 * @file next.config.ts
 * @description Orquestador del Compilador Next.js 15 (The Artisan).
 *              Refactorizado: Optimización de resolución de módulos para Vercel
 *              y blindaje de fronteras entre Servidor/Cliente.
 * @version 10.1 - Staff Engineer Edition
 * @author Raz Podestá - MetaShark Tech
 */

import type { NextConfig } from 'next';
import { withNx } from '@nx/next/plugins/with-nx';
import { withPayload } from '@payloadcms/next/withPayload';

const nextConfig: NextConfig = {
  /* 
     PILAR V: Arquitectura Source-First.
     Obligamos a Next.js a transpilar el código fuente de los paquetes 
     internos para garantizar consistencia total sin depender de 'dist/'.
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

  /* 
     PILAR XIII: Sincronización de Infraestructura.
     Excluimos binarios pesados del bundle para evitar errores OTS en Vercel.
  */
  serverExternalPackages: ['sharp', 'pg', 'bcryptjs'],

  staticPageGenerationTimeout: 300,

  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Bóveda de Seguridad: Bloqueamos la fuga de lógica del servidor al cliente.
      // Sustituimos los módulos pesados por referencias nulas en el navegador.
      config.resolve.alias = {
        ...config.resolve.alias,
        '@metashark/cms-core/config': false,
        'payload': false,
        'sharp': false,
        'pg': false,
      };
    }
    return config;
  },

  experimental: {
    typedRoutes: true,
  },
};

export default withPayload(withNx(nextConfig));