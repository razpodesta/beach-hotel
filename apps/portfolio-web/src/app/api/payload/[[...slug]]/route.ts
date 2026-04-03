/**
 * @file apps/portfolio-web/src/app/api/payload/[[...slug]]/route.ts
 * @description Gateway Soberano de la API de Payload CMS 3.0.
 *              Refactorizado: Inyección dinámica de configuración para evitar
 *              errores de resolución de módulos durante el Build de Vercel.
 * @version 8.3 - Next.js 15 & Vercel Build Resilience
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

// @fix: Importación dinámica para prevenir errores de compilación de Webpack
// en entornos Serverless durante el build.
const getPayloadConfig = async () => {
  const config = await import('@metashark/cms-core/config');
  return config.default;
};

type PayloadHandler = (
  request: Request, 
  args: { params: Promise<{ slug?: string[] }> }
) => Promise<Response>;

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

// --- HANDLERS NORMALIZADOS ---
// Inyectamos la promesa de config mediante un wrapper de ejecución tardía
export const GET = async (req: Request, args: { params: Promise<{ slug?: string[] }> }) => 
  withTelemetry(REST_GET(await getPayloadConfig()), 'GET')(req, args);

export const POST = async (req: Request, args: { params: Promise<{ slug?: string[] }> }) => 
  withTelemetry(REST_POST(await getPayloadConfig()), 'POST')(req, args);

export const PUT = async (req: Request, args: { params: Promise<{ slug?: string[] }> }) => 
  withTelemetry(REST_PUT(await getPayloadConfig()), 'PUT')(req, args);

export const PATCH = async (req: Request, args: { params: Promise<{ slug?: string[] }> }) => 
  withTelemetry(REST_PATCH(await getPayloadConfig()), 'PATCH')(req, args);

export const DELETE = async (req: Request, args: { params: Promise<{ slug?: string[] }> }) => 
  withTelemetry(REST_DELETE(await getPayloadConfig()), 'DELETE')(req, args);

export const OPTIONS = async (req: Request, args: { params: Promise<{ slug?: string[] }> }) => 
  withTelemetry(REST_OPTIONS(await getPayloadConfig()), 'OPTIONS')(req, args);