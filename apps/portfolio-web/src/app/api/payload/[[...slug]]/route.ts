/**
 * @file apps/portfolio-web/src/app/api/payload/[[...slug]]/route.ts
 * @description Gateway Soberano de la API de Payload CMS 3.0.
 *              Orquesta el tráfico entre el Dashboard, el motor de persistencia
 *              y el clúster de almacenamiento S3. Implementa telemetría forense
 *              Heimdall para trazabilidad de operaciones administrativas.
 * @version 8.0 - Sovereign Gateway & Forensic Telemetry
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

/**
 * RESOLUCIÓN DE CONFIGURACIÓN
 * @pilar III: Seguridad de Tipos. Asegura que el contrato del CMS esté
 * disponible antes de instanciar los handlers.
 */
const config = await configPromise;

/**
 * PROTOCOLO HEIMDALL: Interceptor de Telemetría
 * @pilar IV: Observabilidad. Esta utilidad envuelve los handlers nativos
 * para registrar rumbos y tiempos de respuesta en el perímetro.
 */
const withTelemetry = (handler: Function, method: string) => {
  return async (request: Request, ...args: unknown[]) => {
    const url = new URL(request.url);
    const traceId = `api_${method}_${Date.now()}`;
    
    console.group(`[HEIMDALL][GATEWAY] ${method}: ${url.pathname} | ID: ${traceId}`);
    
    const startTime = performance.now();
    try {
      const response = await handler(request, ...args);
      const endTime = performance.now();
      
      console.log(`[STATUS] Success | Latency: ${(endTime - startTime).toFixed(2)}ms`);
      return response;
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Internal Engine Drift';
      console.error(`[CRITICAL] Gateway Aborted: ${msg}`);
      throw error;
    } finally {
      console.groupEnd();
    }
  };
};

/**
 * EXPORTACIÓN DE HANDLERS SOBERANOS
 * @description Punto de entrada para el Media Uploader y el Dashboard RBAC.
 */
export const GET = withTelemetry(REST_GET(config), 'GET');
export const POST = withTelemetry(REST_POST(config), 'POST');
export const PUT = withTelemetry(REST_PUT(config), 'PUT');
export const PATCH = withTelemetry(REST_PATCH(config), 'PATCH');
export const DELETE = withTelemetry(REST_DELETE(config), 'DELETE');
export const OPTIONS = withTelemetry(REST_OPTIONS(config), 'OPTIONS');