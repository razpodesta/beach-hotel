/**
 * @file apps/portfolio-web/src/payload-types.d.ts
 * @description Escudo de Infraestructura de Tipos (Ambient Declarations).
 *              Resuelve el error TS2307 blindando los puntos de entrada dinámicos
 *              del núcleo de Payload 3.0 dentro del App Router de Next.js 15.
 *              Refactorizado: Modelado estricto de Props administrativas (SSoT)
 *              y erradicación absoluta de ambigüedades.
 * @version 3.0 - Forensic Type Shield (Build-Resilient)
 * @author Raz Podestá - MetaShark Tech
 */

import { type ReactNode } from 'react';

/**
 * @module @payloadcms/next/views/Admin
 * @description Punto de montaje para el orquestador visual del CMS.
 */
declare module '@payloadcms/next/views/Admin' {
  /**
   * @interface AdminViewProps
   * @description Contrato inmutable para la vista de administración.
   * Representa el handshake entre el orquestador Next.js y el cerebro de datos.
   */
  export interface AdminViewProps {
    /** Promesa de configuración nivelada del monorepo */
    config: Promise<import('payload').SanitizedConfig> | import('payload').SanitizedConfig;
    /** Mapa de componentes y rutas generado durante el prebuild */
    importMap: Record<string, unknown>;
    /** Segmentos de ruta resueltos dinámicamente */
    params?: string[];
    /** Parámetros de búsqueda para filtrado y paginación en el admin */
    searchParams?: Record<string, string | string[] | undefined>;
  }

  /**
   * @function AdminView
   * @description Componente de servidor que renderiza la interfaz administrativa.
   */
  export function AdminView(props: AdminViewProps): ReactNode;
}

/**
 * @module @payloadcms/next/importMap
 * @description Registro de resolución de componentes para el modo 'Source-First'.
 */
declare module '@payloadcms/next/importMap' {
  /** 
   * @constant importMap
   * @description Diccionario de hidratación dinámica. 
   * Representado como Record<string, unknown> para satisfacer la naturaleza
   * heterogénea de las importaciones del CMS sin comprometer la pureza del build.
   */
  export const importMap: Record<string, unknown>;
}

/**
 * @note Protocolo Heimdall:
 * Estas declaraciones son innegociables para un build exitoso en Vercel.
 * Aseguran que el analizador estático reconozca los artefactos sintetizados
 * por el script 'sovereign-prebuild.ts' antes de la fase de compilación final.
 */