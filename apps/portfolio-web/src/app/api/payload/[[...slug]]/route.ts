// RUTA: apps/portfolio-web/src/app/api/payload/[[...slug]]/route.ts
import { handlePayload } from '@payloadcms/next/route';
import config from '@metashark-cms/core/payload.config';

// Payload 3.0: Manejador estándar de ruta dinámica
export const GET = handlePayload(config);
export const POST = handlePayload(config);
export const PUT = handlePayload(config);
export const PATCH = handlePayload(config);
export const DELETE = handlePayload(config);
export const OPTIONS = handlePayload(config);
export const HEAD = handlePayload(config);