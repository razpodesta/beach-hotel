/**
 * @file apps/portfolio-web/src/app/api/payload/[[...slug]]/route.ts
 * @description Orquestador soberano de la API de Payload CMS 3.0.
 *              Exportaciones explícitas de handlers REST para compatibilidad estable.
 * @version 7.1 - Estable
 * @author Raz Podestá - MetaShark Tech
 */

import { 
  REST_GET, 
  REST_POST, 
  REST_PUT, 
  REST_PATCH, 
  REST_DELETE, 
  REST_OPTIONS 
} from '@payloadcms/next/routes';
import configPromise from '@metashark/cms-core/config';

// Resolviendo la promesa de configuración para los handlers
const config = await configPromise;

export const GET = REST_GET(config);
export const POST = REST_POST(config);
export const PUT = REST_PUT(config);
export const PATCH = REST_PATCH(config);
export const DELETE = REST_DELETE(config);
export const OPTIONS = REST_OPTIONS(config);