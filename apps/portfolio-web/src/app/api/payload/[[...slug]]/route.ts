/**
 * @file apps/portfolio-web/src/app/api/payload/[[...slug]]/route.ts
 * @description Gateway Soberano de la API de Payload CMS 3.0.
 *              Refactorizado: Resolución de TS2345 mediante firma estricta
 *              de handlers Next.js 15 (params as Promise).
 * @version 8.2 - Next.js 15 Handler Compliance
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
 */
const config = await configPromise;

/**
 * TIPO DE HANDLER SOBERANO (Next.js 15 Standard)
 * @description Firma que incluye explícitamente los parámetros de ruta asíncronos.
 */
type PayloadHandler = (
  request: Request, 
  args: { params: Promise<{ slug?: string[] }> }
) => Promise<Response>;

/**
 * PROTOCOLO HEIMDALL: Interceptor de Telemetría
 * @description Envuelve los handlers nativos preservando la firma de Next.js 15.
 */
const withTelemetry = (handler: PayloadHandler, method: string) => {
  return async (
    request: Request, 
    args: { params: Promise<{ slug?: string[] }> }
  ): Promise<Response> => {
    const url = new URL(request.url);
    const traceId = `api_${method}_${Date.now()}`;
    
    console.group(`[HEIMDALL][GATEWAY] ${method}: ${url.pathname} | ID: ${traceId}`);
    
    const startTime = performance.now();
    try {
      const response = await handler(request, args);
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
 */
export const GET = withTelemetry(REST_GET(config), 'GET');
export const POST = withTelemetry(REST_POST(config), 'POST');
export const PUT = withTelemetry(REST_PUT(config), 'PUT');
export const PATCH = withTelemetry(REST_PATCH(config), 'PATCH');
export const DELETE = withTelemetry(REST_DELETE(config), 'DELETE');
export const OPTIONS = withTelemetry(REST_OPTIONS(config), 'OPTIONS');