// RUTA: apps/portfolio-web/src/app/api/payload/[[...slug]]/route.ts
/**
 * @file Manejador de API Dinámica - Payload CMS 3.0
 * @version 3.1
 * @description Punto de entrada para las funciones de servidor de Payload.
 *              Utiliza el nuevo alias de monorepo @metashark/cms-core/config.
 */

import { handleServerFunctions } from '@payloadcms/next/functions';
import config from '@metashark/cms-core/config';

/**
 * Orquestador de peticiones del CMS.
 * Se exportan los métodos HTTP estándar que Payload necesita para su API REST.
 */
export const GET = handleServerFunctions({ config });
export const POST = handleServerFunctions({ config });
export const PUT = handleServerFunctions({ config });
export const PATCH = handleServerFunctions({ config });
export const DELETE = handleServerFunctions({ config });
export const OPTIONS = handleServerFunctions({ config });
export const HEAD = handleServerFunctions({ config });