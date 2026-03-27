/**
 * @file apps/portfolio-web/next.config.ts
 * @description Orquestador Soberano de Compilación (The Build Engine).
 *              Refactorizado: Eliminación de 'standalone' para garantizar 
 *              compatibilidad nativa con el motor de ruteo de Vercel.
 * @version 19.0 - Vercel Deployment Fix (Native Optimization)
 * @author Raz Podestá - MetaShark Tech
 */

import type { NextConfig } from 'next';
import { withNx } from '@nx/next/plugins/with-nx';
import { withPayload } from '@payloadcms/next/withPayload';

const nextConfig: NextConfig = {
  /**
   * @pilar V: Adherencia Arquitectónica (Pure Source-First).
   */
  transpilePackages: [
    '@metashark/cms-core',
    '@metashark/cms-ui',
    '@metashark/protocol-33',
    '@metashark/auth-shield'
  ],

  /**
   * GESTIÓN SOBERANA DE IMÁGENES
   */
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'flagcdn.com' },
      { protocol: 'https', hostname: '*.supabase.co' }
    ],
    dangerouslyAllowSVG: true,
    minimumCacheTTL: 60,
  },

  /**
   * @nivelación: Se ELIMINA 'output: standalone'.
   * Vercel optimiza automáticamente las Serverless Functions. Mantener standalone
   * genera una estructura de carpetas incompatible con el agente de Vercel
   * cuando se orquesta vía Nx.
   */

  /**
   * @pilar IX: Escape de Emergencia.
   */
  serverExternalPackages: ['sharp'],

  /**
   * @pilar IV: Observabilidad (Heimdall).
   */
  logging: {
    fetches: {
      fullUrl: false,
    },
  },

  /**
   * @pilar III: Seguridad de Tipos.
   */
  experimental: {
    typedRoutes: true,
  },
};

export default withPayload(withNx(nextConfig));