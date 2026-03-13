/**
 * @file apps/portfolio-web/src/app/api/payload/[[...slug]]/route.ts
 * @description Orquestador soberano de la API de Payload CMS 3.0.
 *              Implementa manejadores explícitos con paso directo de configuración.
 * @version 6.1 - Strict Payload 3.0 Stable Contract
 * @author Raz Podestá - MetaShark Tech
 */

import { 
  REST_GET, 
  REST_POST, 
  REST_OPTIONS, 
  REST_PATCH, 
  REST_DELETE, 
  REST_PUT 
} from '@payloadcms/next/routes';
// @pilar V: Vinculación de infraestructura mediante alias soberano.
import config from '@metashark/cms-core/config';

/**
 * EXPORTACIÓN DE HANDLERS EXPLÍCITOS
 * @pilar III: Se elimina el objeto envoltorio { config } para pasar la 
 * configuración directamente, cumpliendo con la firma de SanitizedConfig.
 */

export const GET = REST_GET(config);
export const POST = REST_POST(config);
export const OPTIONS = REST_OPTIONS(config);
export const PATCH = REST_PATCH(config);
export const DELETE = REST_DELETE(config);
export const PUT = REST_PUT(config);