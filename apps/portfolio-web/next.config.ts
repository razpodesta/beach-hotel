/**
 * @file apps/portfolio-web/next.config.ts
 * @description Orquestador Soberano Next.js 15 (Oxygen Engine).
 *              Refactorizado: Implementación de "Graph-Safe Configuration" para 
 *              evitar errores de procesamiento en el Daemon de Nx.
 *              Sincronizado: Inclusión de @metashark/identity-access-management en el
 *              pipeline de transpilación y purga de configuraciones obsoletas.
 * @version 8.0 - Graph-Safe & Next.js 15 Ready
 * @author Staff Engineer - MetaShark Tech
 */

import type { NextConfig } from 'next';
import { withNx } from '@nx/next/plugins/with-nx';
import { withPayload } from '@payloadcms/next/withPayload';

/**
 * CONFIGURACIÓN BASE DE NEXT.JS
 * @pilar X: Performance y Resiliencia.
 */
const nextConfig: NextConfig = {
  reactStrictMode: true,

  /**
   * @pilar V: Adherencia Arquitectónica.
   * Transpilación obligatoria para los paquetes del monorepo Nx para permitir
   * el modo "Pure Source-First".
   */
  transpilePackages: [
    '@metashark/cms-core',
    '@metashark/cms-ui',
    '@metashark/reputation-engine',
    '@metashark/auth-shield',
    '@metashark/identity-access-management',
  ],

  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'flagcdn.com' },
      { protocol: 'https', hostname: '*.supabase.co' },
    ],
    dangerouslyAllowSVG: true,
    minimumCacheTTL: 60,
  },

  /**
   * @pilar XIII: Build Isolation.
   * Evita que Next.js intente empaquetar binarios nativos de Node.js en el cliente.
   */
  serverExternalPackages: ['sharp', 'pg', 'bcryptjs'],

  staticPageGenerationTimeout: 300,

  /**
   * @description Modificación Quirúrgica del AST de Webpack 5.
   * Resuelve dependencias fantasma en el lado del cliente.
   */
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        sharp: false,
        pg: false,
        canvas: false,
        fs: false,
        crypto: false,
      };
    }
    return config;
  },

  experimental: {
    typedRoutes: true,
  },
};

/**
 * ORQUESTACIÓN DE PLUGINS SOBERANOS
 * 
 * @pilar IX: Desacoplamiento de Infraestructura.
 * El plugin de Payload inyecta alias y rutas basándose en payload.config.ts.
 * 
 * @fix Graph-Safe Pattern:
 * El plugin de Nx inyecta 'turbopack: {}' por defecto, lo cual dispara warnings 
 * en Next.js 15. Realizamos una limpieza profunda antes de la exportación final.
 */
const nxConfig = withNx(nextConfig);
const payloadConfig = withPayload(nxConfig);

/**
 * @function sanitizeFinalConfig
 * @description Purga propiedades incompatibles inyectadas por orquestadores externos.
 */
function sanitizeFinalConfig(config: unknown): NextConfig {
  const cfg = { ...(config as Record<string, unknown>) };
  
  // Eliminamos rastro de turbopack inyectado por @nx/next:build que genera error 'undefined'
  if ('turbopack' in cfg) {
    delete cfg.turbopack;
  }

  return cfg as NextConfig;
}

const finalConfig = sanitizeFinalConfig(payloadConfig);

export default finalConfig;