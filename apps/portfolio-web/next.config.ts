/**
 * @file apps/portfolio-web/next.config.ts
 * @description Orquestador Soberano de Compilación (The Build Engine).
 *              Refactorizado: 
 *              1. Eliminación de 'standalone' para Vercel Native Routing.
 *              2. Estrangulamiento de hilos (SSG) para proteger el Pooler de Supabase.
 *              3. Protección de binarios nativos (pg, bcryptjs).
 * @version 20.0 - Vercel SSG & Pooler Resilience
 * @author Raz Podestá - MetaShark Tech
 */

import type { NextConfig } from 'next';
import { withNx } from '@nx/next/plugins/with-nx';
import { withPayload } from '@payloadcms/next/withPayload';

const nextConfig: NextConfig = {
  /**
   * @pilar V: Adherencia Arquitectónica (Pure Source-First).
   */
  transpilePackages:[
    '@metashark/cms-core',
    '@metashark/cms-ui',
    '@metashark/protocol-33',
    '@metashark/auth-shield'
  ],

  /**
   * GESTIÓN SOBERANA DE IMÁGENES
   */
  images: {
    remotePatterns:[
      { protocol: 'https', hostname: 'flagcdn.com' },
      { protocol: 'https', hostname: '*.supabase.co' }
    ],
    dangerouslyAllowSVG: true,
    minimumCacheTTL: 60,
  },

  /**
   * @pilar IX: Escape de Emergencia y Resiliencia Nativa.
   * Excluimos módulos con binarios nativos C++ para evitar que 
   * el empaquetador rompa la capa de persistencia y encriptación en Vercel.
   */
  serverExternalPackages: ['sharp', 'pg', 'bcryptjs'],

  /**
   * RESILIENCIA DE BUILD (SSG Timeouts)
   * Aumentamos el tiempo de espera por página para compensar 
   * el estrangulamiento de hilos en la generación estática.
   */
  staticPageGenerationTimeout: 300,

  /**
   * @pilar IV: Observabilidad (Heimdall).
   */
  logging: {
    fetches: {
      fullUrl: false,
    },
  },

  /**
   * @pilar VIII: Resiliencia de Infraestructura y Datos.
   */
  experimental: {
    typedRoutes: true,
    
    /**
     * PROTECCIÓN DEL POOLER DE SUPABASE
     * Durante el build (SSG), Next.js lanza múltiples workers. Cada uno
     * instancia Payload y abre conexiones, saturando el puerto 6543 (Pooler).
     * Al forzar cpus: 1 y workerThreads: false, serializamos la generación
     * estática, garantizando que Supabase no rechace las queries.
     */
    cpus: 1,
    workerThreads: false,
  },
};

export default withPayload(withNx(nextConfig));