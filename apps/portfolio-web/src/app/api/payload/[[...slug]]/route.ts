/**
 * @file apps/portfolio-web/src/app/api/payload/[[...slug]]/route.ts
 * @description Gateway Soberano para Payload CMS 3.0.
 *              Refactorizado para Build-Time Isolation: Se utiliza importación 
 *              dinámica dentro de los handlers para evitar colisiones de dependencias Nx.
 *              Nivelado: Resolución de TS2352 mediante casting doble de seguridad
 *              hacia contratos de configuración sanitizada.
 * @version 8.16 - Sanitized Config Resolution (No Overlap Fix)
 * @author Staff Engineer - MetaShark Tech
 */

import { NextRequest } from 'next/server';

/**
 * CONTRATOS DE TIPO SOBERANOS
 */
type RouteArgs = { params: Promise<{ slug?: string[] }> };

/**
 * @description Firma estricta para la función resultante del builder.
 */
type RouteHandler = (req: NextRequest, args: RouteArgs) => Promise<Response>;

/**
 * @description Firma para los constructores de rutas de Payload.
 * Acepta unknown para el config para permitir la transición entre Config y SanitizedConfig.
 */
type RouteHandlerBuilder = (config: unknown) => RouteHandler;

/**
 * @description Orquestador de ejecución diferida.
 * @pilar XIII: Build Isolation - Protege contra fugas de contexto durante el build.
 */
const executeHandler = async (
  method: string, 
  req: NextRequest, 
  args: RouteArgs,
  handlerName: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'OPTIONS'
): Promise<Response> => {
  const traceId = `api_${method}_${Date.now()}`;
  console.group(`[HEIMDALL][GATEWAY] ${method}: ${req.nextUrl.pathname} | ID: ${traceId}`);
  
  const startTime = performance.now();
  
  try {
    // 1. IMPORTACIÓN DINÁMICA (Lazy-Load Pipeline)
    const routesModule = await import('@payloadcms/next/routes');
    const configModule = await import('@metashark/cms-core/config');
    
    // 2. HANDSHAKE DE CONFIGURACIÓN
    const config = configModule.default;
    
    /**
     * 3. MAPEO DE HANDLERS (Resolución de TS2352)
     * Realizamos un casting doble (unknown -> RouteHandlerBuilder) para satisfacer
     * al compilador sobre el contrato de SanitizedConfig de Payload.
     */
    const handlers: Record<string, RouteHandlerBuilder> = {
        GET: routesModule.REST_GET as unknown as RouteHandlerBuilder,
        POST: routesModule.REST_POST as unknown as RouteHandlerBuilder,
        PUT: routesModule.REST_PUT as unknown as RouteHandlerBuilder,
        PATCH: routesModule.REST_PATCH as unknown as RouteHandlerBuilder,
        DELETE: routesModule.REST_DELETE as unknown as RouteHandlerBuilder,
        OPTIONS: routesModule.REST_OPTIONS as unknown as RouteHandlerBuilder
    };
    
    // 4. EJECUCIÓN SOBERANA
    const handler = handlers[handlerName](config);
    const response = await handler(req, args);
    
    const endTime = performance.now();
    console.log(`[STATUS] Success | Latency: ${(endTime - startTime).toFixed(2)}ms`);
    return response;
    
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Internal Engine Drift';
    console.error(`[CRITICAL] Gateway Aborted: ${msg}`);
    
    return new Response(
      JSON.stringify({ 
        error: 'CMS_OFFLINE', 
        message: 'El clúster de datos no respondió al handshake inicial.',
        trace: traceId 
      }), 
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } finally {
    console.groupEnd();
  }
};

/**
 * --- HANDLERS NORMALIZADOS ---
 */
export const GET = (req: NextRequest, args: RouteArgs) => executeHandler('GET', req, args, 'GET');
export const POST = (req: NextRequest, args: RouteArgs) => executeHandler('POST', req, args, 'POST');
export const PUT = (req: NextRequest, args: RouteArgs) => executeHandler('PUT', req, args, 'PUT');
export const PATCH = (req: NextRequest, args: RouteArgs) => executeHandler('PATCH', req, args, 'PATCH');
export const DELETE = (req: NextRequest, args: RouteArgs) => executeHandler('DELETE', req, args, 'DELETE');
export const OPTIONS = (req: NextRequest, args: RouteArgs) => executeHandler('OPTIONS', req, args, 'OPTIONS');