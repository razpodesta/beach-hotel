/**
 * @file next.config.ts
 * @description Orquestador del Compilador Next.js 15 (The Artisan).
 *              Refactorizado: Simplificación Soberana. Se elimina distDir manual 
 *              para permitir la detección nativa de Vercel y se blindan fronteras.
 * @version 10.4 - Sovereign Standard Sync
 * @author Raz Podestá - MetaShark Tech
 */

import type { NextConfig } from 'next';
import { withNx } from '@nx/next/plugins/with-nx';
import { withPayload } from '@payloadcms/next/withPayload';

const nextConfig: NextConfig = {
  /**
   * @pilar_XIII: Simplificación de Infraestructura.
   * Eliminamos la propiedad 'distDir'. Next.js construirá en la carpeta 
   * local '.next', permitiendo que Vercel localice los manifiestos de 
   * forma nativa sin desajustes de rutas relativas.
   */

  /**
   * @pilar_V: Arquitectura Source-First.
   * Transpilación de dependencias internas para garantizar que el código vivo
   * del monorepo sea procesado por el compilador de la aplicación.
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
   * @pilar_XIII: Higiene de Infraestructura.
   * Exclusión de binarios pesados para optimizar el tiempo de frío (Cold Start) 
   * de las funciones Lambda en Vercel.
   */
  serverExternalPackages: ['sharp', 'pg', 'bcryptjs'],

  /**
   * PROTOCOLO DE RESILIENCIA:
   * Margen de seguridad para procesos pesados de pre-renderizado.
   */
  staticPageGenerationTimeout: 300,

  webpack: (config, { isServer }) => {
    if (!isServer) {
      /**
       * BÓVEDA DE SEGURIDAD (Client Shield):
       * Bloqueo físico de lógica de servidor. Previene errores de resolución 
       * en el navegador y reduce el tamaño del bundle.
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
 * El orden de los wrappers es vital. Nx primero para resolver rutas, 
 * luego Payload para inyectar el entorno de datos.
 */
export default withPayload(withNx(nextConfig));