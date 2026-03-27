/**
 * @file apps/portfolio-web/next.config.ts
 * @description Orquestador Soberano de Compilación (The Build Engine).
 *              Refactorizado para Next.js 15.2+, eliminando claves obsoletas
 *              o mal ubicadas para erradicar ruidos de advertencia en Vercel.
 * @version 18.0 - Next.js 15 Strict Compliance & Clean Logs
 * @author Raz Podestá - MetaShark Tech
 */

import type { NextConfig } from 'next';
import { withNx } from '@nx/next/plugins/with-nx';
import { withPayload } from '@payloadcms/next/withPayload';

const nextConfig: NextConfig = {
  /**
   * @pilar V: Adherencia Arquitectónica (Pure Source-First).
   * Permite que Next.js compile las librerías del monorepo directamente
   * desde su código fuente (.ts), facilitando el HMR y la consistencia de tipos.
   */
  transpilePackages: [
    '@metashark/cms-core',
    '@metashark/cms-ui',
    '@metashark/protocol-33',
    '@metashark/auth-shield'
  ],

  /**
   * GESTIÓN SOBERANA DE IMÁGENES
   * @pilar I: Visión Holística - Conectividad con Supabase y CDN de banderas.
   */
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'flagcdn.com' },
      { protocol: 'https', hostname: '*.supabase.co' }
    ],
    dangerouslyAllowSVG: true,
    // Optimización de caché de activos visuales
    minimumCacheTTL: 60,
  },

  /**
   * @pilar II: Cero Regresiones (Standalone Mode).
   * Genera un bundle aislado para despliegues optimizados en Vercel.
   */
  output: 'standalone',

  /**
   * @pilar IX: Escape de Emergencia (External Packages).
   * Sharp debe ser tratado como binario externo para evitar corrupciones en el bundle.
   */
  serverExternalPackages: ['sharp'],

  /**
   * @pilar IV: Observabilidad (Heimdall).
   * Limpieza de logs para enfocarse en trazas de negocio y no ruidos de fetch.
   */
  logging: {
    fetches: {
      fullUrl: false,
    },
  },

  /**
   * @pilar III: Seguridad de Tipos.
   * Habilita rutas fuertemente tipadas para evitar rumbos rotos en la navegación.
   */
  experimental: {
    typedRoutes: true,
  },

  /**
   * @nivelación: Se elimina la clave 'telemetry' de la raíz.
   * Next.js no reconoce esta propiedad dentro del config. Para desactivarla, 
   * el estándar es el uso de la variable de entorno NEXT_TELEMETRY_DISABLED=1.
   */
};

/**
 * ORQUESTACIÓN DE PLUGINS
 * @description Aplica la inteligencia de Nx y Payload CMS sobre la configuración base.
 */
export default withPayload(withNx(nextConfig));