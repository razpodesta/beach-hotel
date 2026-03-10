// RUTA: apps/portfolio-web/src/app/api/payload/[[...slug]]/route.ts

/**
 * @file Hub de Comunicaciones Payload CMS
 * @version 1.2 - Hotfix: Exportación Específica
 * @description Ruta dinámica para Payload CMS 3.0. 
 *              Utilizamos el patrón de manejador de servidor de Payload.
 */

import { handlePayload } from '@payloadcms/next/route';
// Corregimos la importación para apuntar al archivo generado por TS 
// y asegurar compatibilidad con la estructura de exportación
import config from '@metashark-cms/core/payload.config';

// Payload 3.0 requiere que el manejador esté envuelto en el context de Next.js
export const GET = handlePayload(config);
export const POST = handlePayload(config);
export const PUT = handlePayload(config);
export const PATCH = handlePayload(config);
export const DELETE = handlePayload(config);
export const OPTIONS = handlePayload(config);
export const HEAD = handlePayload(config);