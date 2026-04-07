/**
 * @file apps/portfolio-web/next.config.ts
 * @description Orquestador Soberano Next.js 15.
 *              Refactorizado: Migración del parche cliente a Webpack 5 Fallbacks
 *              (evitando colisiones con config.externals como función),
 *              aislamiento total de binarios nativos (sharp, pg) y purga
 *              de la propiedad 'turbopack' inyectada por Nx para silenciar 
 *              advertencias en la consola de Vercel.
 * @version 6.0 - Webpack 5 Fallback & Zero Warnings Standard
 * @author Raz Podestá - Staff Engineer, MetaShark Tech
 */

import type { NextConfig } from 'next';
import { withNx } from '@nx/next/plugins/with-nx';
import { withPayload } from '@payloadcms/next/withPayload';

const nextConfig: NextConfig = {
  output: 'standalone',
  reactStrictMode: true,

  /**
   * @pilar V: Adherencia Arquitectónica.
   * Transpilación obligatoria para los paquetes del monorepo Nx.
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
   * @pilar XIII: Build Isolation.
   * Evita que Next.js intente empaquetar binarios nativos de Node.js.
   */
  serverExternalPackages: ['sharp', 'pg', 'bcryptjs'],

  staticPageGenerationTimeout: 300,

  /**
   * @description Modificación Quirúrgica del AST de Webpack 5.
   */
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // FIX CRÍTICO: En Webpack 5, los módulos de Node que no deben 
      // incluirse en el cliente se silencian a través de 'fallback', no 'alias'.
      config.resolve.fallback = {
        ...(config.resolve.fallback || {}),
        sharp: false,
        pg: false,
        canvas: false,
        fs: false,
        crypto: false,
      };

      // Nota: Se erradicó la mutación de `config.externals` en el cliente, 
      // ya que en Next.js 15 `externals` puede ser una función asíncrona, 
      // y mutarla como array causaría un Fatal Build Error.
    }
    return config;
  },

  experimental: {
    typedRoutes: true,
  },
};

/**
 * @pilar IX: Desacoplamiento de Infraestructura.
 * El plugin de Payload inyecta alias y rutas para el Admin UI basándose
 * en la convención del archivo payload.config.ts en la raíz.
 * 
 * @fix Zero Warnings Policy (Linter Pure):
 * El plugin de Nx inyecta configuraciones de Turbopack que Next.js 15
 * rechaza en modo estricto. Interceptamos la configuración generada y 
 * purgamos la clave no deseada antes de la exportación.
 */
const nxConfig = withNx(nextConfig);
const payloadNxConfig = withPayload(nxConfig);

// Mapeamos a unknown y luego al tipo de diccionario para poder eliminar la clave conflictiva.
const finalConfig = payloadNxConfig as Record<string, unknown>;
if ('turbopack' in finalConfig) {
  delete finalConfig.turbopack;
}

export default finalConfig as NextConfig;