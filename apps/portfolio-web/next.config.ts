/**
 * @file apps/portfolio-web/next.config.ts
 * @description Orquestador Soberano de Compilación.
 *              Refactorizado: Erradicación de colisiones de distDir y
 *              limpieza de opciones experimentales no reconocidas para
 *              garantizar la compatibilidad con Vercel/Nx.
 * @version 2.0 - Build Stable Edition
 * @author Staff Engineer - MetaShark Tech
 */

import type { NextConfig } from 'next';
import { withNx } from '@nx/next/plugins/with-nx';
import { withPayload } from '@payloadcms/next/withPayload';

const nextConfig: NextConfig = {
  /**
   * @pilar V: Adherencia arquitectónica.
   * Eliminamos 'distDir' para permitir que Nx gestione los outputs.
   * Vercel detectará el build basándose en nuestro 'outputDirectory' definido en vercel.json.
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

  serverExternalPackages: ['sharp', 'pg', 'bcryptjs'],

  staticPageGenerationTimeout: 300,

  experimental: {
    typedRoutes: true,
    // Eliminado 'turbopack' de aquí, ya que no es una opción de NextConfig
  },
};

export default withPayload(withNx(nextConfig));