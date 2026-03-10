// RUTA: apps/portfolio-web/src/app/api/payload/[[...slug]]/route.ts

/**
 * @file Hub de Comunicaciones Payload CMS
 * @version 1.1 - Importación Soberana (Nx Compliant)
 * @description Ruta dinámica que actúa como puerta de entrada para Payload CMS.
 *              Utiliza el módulo @metashark-cms/core para la configuración.
 * @author Raz Podestá - MetaShark Tech
 */

import { handlePayload } from '@payloadcms/next/route';
// Importación desde el paquete centralizado, respetando las fronteras del monorepo
import config from '@metashark-cms/core/payload.config';

// Payload CMS 3.0 exporta un manejador de peticiones para Next.js
// Exportamos las funciones necesarias para manejar el ciclo de vida del CMS
export const GET = handlePayload(config);
export const POST = handlePayload(config);
export const PUT = handlePayload(config);
export const PATCH = handlePayload(config);
export const DELETE = handlePayload(config);
export const OPTIONS = handlePayload(config);
export const HEAD = handlePayload(config);