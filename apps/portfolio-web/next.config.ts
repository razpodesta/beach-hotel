/**
 * @file next.config.ts
 * @description Orquestador Soberano de Compilación para portfolio-web.
 *              Implementa arquitectura Next.js 15.2 Standard, integración con Payload 3.0
 *              y alineación estricta con el pipeline de construcción de Vercel.
 * @version 17.0 - Next 15 Stable Sync & Infrastructure Noise Reduction
 * @author Raz Podestá - MetaShark Tech
 */

import type { NextConfig } from 'next';
import { withNx } from '@nx/next/plugins/with-nx';
import { withPayload } from '@payloadcms/next/withPayload';

/**
 * CONFIGURACIÓN MAESTRA: nextConfig
 * @pilar II: CERO REGRESIONES - Preserva el acceso a fuentes de las librerías internas.
 * @pilar XIII: ALINEACIÓN CON EL MOTOR - Erradica advertencias de claves obsoletas.
 */
const nextConfig: NextConfig = {
  /**
   * MODO SOURCE-FIRST (DX & Build)
   * Obliga al compilador a procesar el código fuente de los paquetes del monorepo.
   * Crucial para evitar errores de "Module not found" en el despliegue standalone.
   */
  transpilePackages: [
    '@metashark/cms-core',
    '@metashark/cms-ui',
    '@metashark/protocol-33',
    '@metashark/auth-shield'
  ],

  /**
   * MOTOR DE IMÁGENES SOBERANO
   * @description Configuración de perímetros de seguridad y optimización de activos.
   */
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'flagcdn.com' },
      { protocol: 'https', hostname: '*.supabase.co' }
    ],
    dangerouslyAllowSVG: true,
    // @pilar VIII: Resiliencia - Cabeceras de seguridad para entrega de activos.
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  /**
   * INFRAESTRUCTRURA DE DESPLIEGUE
   * 'standalone' genera un bundle optimizado con solo las dependencias necesarias.
   */
  output: 'standalone',

  /**
   * GESTIÓN DE BINARIOS EXTERNOS
   * Sharp se marca como externo para que Vercel utilice el binario optimizado de su runtime
   * en lugar de intentar empaquetarlo, evitando fallos de memoria en el build.
   */
  serverExternalPackages: ['sharp'],

  /**
   * CONFIGURACIÓN EXPERIMENTAL NIVELADA
   * @pilar III: Seguridad de Tipos - Soporte para rutas tipadas nativas.
   */
  experimental: {
    typedRoutes: true,
    // Eliminamos 'turbopack' de aquí si existiera para evitar el ruido detectado en los logs.
  },

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