/**
 * @file apps/portfolio-web/src/app/api/payload/[[...slug]]/route.ts
 * @description Gateway Soberano para Payload CMS 3.0.
 *              Refactorizado: Aislamiento total Build-Time, corrección de sintaxis
 *              en handlers y erradicación de referencias circulares de tipo.
 * @version 8.13 - Absolute Production Standard
 * @author Staff Engineer - MetaShark Tech
 */

import { 
  REST_GET, 
  REST_POST, 
  REST_PUT, 
  REST_PATCH, 
  REST_DELETE, 
  REST_OPTIONS 
} from '@payloadcms/next/routes';
import { type NextRequest } from 'next/server';

/**
 * CONTRATOS DE TIPO SOBERANOS
 * @description Next.js 15 exige que 'params' sea una Promesa.
 */
type RouteArgs = { params: Promise<{ slug?: string[] }> };

/** 
 * @type PayloadRESTHandler
 * @description Firma del handler interno que provee la librería de Payload.
 */
type PayloadRESTHandler = (req: Request, args: RouteArgs) => Promise<Response>;

/**
 * @type FactorySignature
 * @description Firma de la factoría (REST_GET, etc.). 
 *              Utilizamos 'unknown' para el config para romper la circularidad de tipos.
 */
type FactorySignature = (cfg: unknown) => PayloadRESTHandler;

/**
 * @description Orquestador de ejecución diferida.
 * @pilar XIII: Build Isolation - Protege contra el crash 'reading env' en Vercel.
 */
const executeHandler = async (
  method: string, 
  req: NextRequest, 
  args: RouteArgs,
  handlerFactory: FactorySignature
): Promise<Response> => {
  const traceId = `api_${method}_${Date.now()}`;
  console.group(`[HEIMDALL][GATEWAY] ${method}: ${req.nextUrl.pathname} | ID: ${traceId}`);
  
  const startTime = performance.now();
  
  try {
    /**
     * @pilar XIII: Dynamic Shield.
     * Importamos la configuración local solo cuando hay tráfico real.
     */
    const configModule = await import('@metashark/cms-core/config');
    const config = configModule.default;
    
    // Ejecución del handler de Payload
    const handler = handlerFactory(config);
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
 * Se eliminan castings innecesarios en la firma para evitar errores de sintaxis.
 */
export const GET = (req: NextRequest, args: RouteArgs) => 
  executeHandler('GET', req, args, REST_GET as FactorySignature);

export const POST = (req: NextRequest, args: RouteArgs) => 
  executeHandler('POST', req, args, REST_POST as FactorySignature);

export const PUT = (req: NextRequest, args: RouteArgs) => 
  executeHandler('PUT', req, args, REST_PUT as FactorySignature);

export const PATCH = (req: NextRequest, args: RouteArgs) => 
  executeHandler('PATCH', req, args, REST_PATCH as FactorySignature);

export const DELETE = (req: NextRequest, args: RouteArgs) => 
  executeHandler('DELETE', req, args, REST_DELETE as FactorySignature);

export const OPTIONS = (req: NextRequest, args: RouteArgs) => 
  executeHandler('OPTIONS', req, args, REST_OPTIONS as FactorySignature);