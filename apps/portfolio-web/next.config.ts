/**
 * @file next.config.ts
 * @description Orquestador Soberano de Compilación para portfolio-web.
 *              Implementa arquitectura Next.js 15.2 Standard, integración con Payload 3.0
 *              y habilitación de Modo Source-First para el Monorepo.
 * @version 16.0 - TypeScript Migration & Next 15 Stable Sync
 * @author Raz Podestá - MetaShark Tech
 */

import type { NextConfig } from 'next';
import { withNx } from '@nx/next/plugins/with-nx';
import { withPayload } from '@payloadcms/next/withPayload';

/**
 * CONFIGURACIÓN MAESTRA: nextConfig
 * @pilar II: CERO REGRESIONES - Mantiene el mapeo directo a fuentes de librerías.
 * @pilar XIII: ALINEACIÓN CON EL MOTOR - Optimizado para despliegue en Vercel.
 */
const nextConfig: NextConfig = {
  /**
   * MODO SOURCE-FIRST (DX)
   * Obliga al compilador SWC a procesar el código fuente de las librerías internas.
   * Esto erradica el error de "módulo no encontrado" en el despliegue de Vercel.
   */
  transpilePackages: [
    '@metashark/cms-core',
    '@metashark/cms-ui',
    '@metashark/protocol-33',
    '@metashark/auth-shield'
  ],

  /**
   * MOTOR DE IMÁGENES SOBERANO
   * @description Configuración de perímetros para activos externos y soporte SVG.
   */
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'flagcdn.com' },
      { protocol: 'https', hostname: '*.supabase.co' }
    ],
    dangerouslyAllowSVG: true,
  },

  /**
   * INFRAESTRUCTRURA DE PRODUCCIÓN
   * @description 'standalone' es mandatorio para despliegues eficientes en Vercel.
   */
  output: 'standalone',

  /**
   * @pilar III: Seguridad de Tipos.
   * Habilita la validación de rutas tipadas en el ecosistema.
   */
  experimental: {
    typedRoutes: true,
  },

  /**
   * @description Exclusión de binarios pesados del bundle.
   * Sharp se gestiona como dependencia externa del servidor para evitar fallos de memoria.
   */
  serverExternalPackages: ['sharp'],

  /**
   * GOVERNANCE: Privacidad y Telemetría
   */
  telemetry: false,
};

/**
 * ENSAMBLAJE DE PLUGINS SOBERANOS
 * withPayload y withNx orquestan la inyección de rutas de CMS y dependencias del Monorepo.
 */
export default withPayload(withNx(nextConfig));