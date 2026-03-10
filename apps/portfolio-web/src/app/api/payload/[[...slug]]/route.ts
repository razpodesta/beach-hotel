// RUTA: apps/portfolio-web/src/app/api/payload/[[...slug]]/route.ts
import { handlePayload } from '@payloadcms/next/route';
import config from '@metashark-cms/core/payload.config';

// Payload 3.0: El manejador gestiona todas las rutas dinámicas
export const { GET, POST, PUT, PATCH, DELETE, OPTIONS, HEAD } = handlePayload(config);