/**
 * @file apps/portfolio-web/src/app/api/payload/[[...slug]]/route.ts
 * @description Gateway Soberano para Payload CMS 3.0.
 *              Refactorizado para Build-Time Isolation: Se utiliza importación 
 *              dinámica dentro de los handlers para evitar colisiones de dependencias Nx.
 * @version 8.14 - Production Hardened & Boundary Compliant
 * @author Staff Engineer - MetaShark Tech
 */

import { NextRequest } from 'next/server';

/**
 * CONTRATOS DE TIPO SOBERANOS
 */
type RouteArgs = { params: Promise<{ slug?: string[] }> };

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
    // Importación dinámica "Lazy-Load" para romper el grafo de dependencias de Nx
    const { REST_GET, REST_POST, REST_PUT, REST_PATCH, REST_DELETE, REST_OPTIONS } = await import('@payloadcms/next/routes');
    const configModule = await import('@metashark/cms-core/config');
    const { importMap } = await import('@payloadcms/next/importMap');
    
    const config = configModule.default;
    const handlers = {
        GET: REST_GET,
        POST: REST_POST,
        PUT: REST_PUT,
        PATCH: REST_PATCH,
        DELETE: REST_DELETE,
        OPTIONS: REST_OPTIONS
    };
    
    const handler = handlers[handlerName](config as any, importMap);
    const response = await handler(req as any, args as any);
    
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