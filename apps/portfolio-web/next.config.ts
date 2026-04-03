/**
 * @file next.config.ts
 * @description Orquestador del Compilador Next.js 15 (The Artisan).
 *              Refactorizado: Blindaje de fronteras Servidor/Cliente y 
 *              optimización de resolución para el entorno Serverless de Vercel.
 * @version 10.2 - Vercel Build Resilience Standard
 * @author Raz Podestá - MetaShark Tech
 */

import type { NextConfig } from 'next';
import { withNx } from '@nx/next/plugins/with-nx';
import { withPayload } from '@payloadcms/next/withPayload';

const nextConfig: NextConfig = {
  /**
   * PILAR V: Arquitectura Source-First.
   * Obligamos a Next.js a procesar el código vivo de los paquetes del monorepo,
   * eliminando la dependencia de artefactos pre-compilados en dist/.
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
   * PILAR XIII: Sincronización de Infraestructura.
   * Excluimos binarios que no deben ser empaquetados en el bundle de la función Lambda.
   */
  serverExternalPackages: ['sharp', 'pg', 'bcryptjs'],

  /**
   * PROTOCOLO DE RESILIENCIA:
   * Aumentamos el timeout para la generación estática de páginas (SSG) 
   * debido a la alta densidad de datos del Journal y el Festival.
   */
  staticPageGenerationTimeout: 300,

  webpack: (config, { isServer }) => {
    // Optimización de resolución de módulos
    if (!isServer) {
      /**
       * BÓVEDA DE SEGURIDAD (Client Shield):
       * Bloqueamos físicamente la inclusión de lógica de base de datos y 
       * configuraciones sensibles en el bundle del navegador.
       */
      config.resolve.alias = {
        ...config.resolve.alias,
        '@metashark/cms-core/config': false,
        'payload': false,
        'sharp': false,
        'pg': false,
        'canvas': false, // Evita errores de dependencias de visualización en el build
      };
    }
    return config;
  },

  experimental: {
    /* PILAR III: Seguridad de Tipos en el Enrutamiento */
    typedRoutes: true,
  },
};

/**
 * COMPOSICIÓN SOBERANA:
 * Envolvemos la configuración con los plugins de Nx y Payload.
 * El orden es crítico para la correcta inyección de variables de entorno.
 */
export default withPayload(withNx(nextConfig));