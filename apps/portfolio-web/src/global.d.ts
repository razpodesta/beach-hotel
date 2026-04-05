/**
 * @file apps/portfolio-web/src/global.d.ts
 * @description Escudo de Infraestructura Global y Declaraciones Ambientales.
 *              Refactorizado: Declaración pura de 'server-only' para erradicar 
 *              el error TS2882/TS2664 y blindaje de entorno NodeJS.
 * @version 4.1 - Master Infrastructure Shield
 * @author Staff Engineer - MetaShark Tech
 */

/** 
 * @fix TS2882 / TS2664: Definición ambiental pura.
 * Al estar en un archivo de declaración global sin imports, 
 * TypeScript lo registra en el ámbito global del compilador.
 */
declare module 'server-only' {}

declare module '*.svg' {
  import type { FC, SVGProps } from 'react';
  const content: string;
  export const ReactComponent: FC<SVGProps<SVGSVGElement>>;
  export default content;
}

declare module '*.css' {
  const content: Record<string, string>;
  export default content;
}

declare module '*.module.css' {
  const classes: Readonly<Record<string, string>>;
  export default classes;
}

declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: 'development' | 'production' | 'test';
    NEXT_PHASE: string;
    VERCEL: string;
    DATABASE_URL: string;
    PAYLOAD_SECRET: string;
    NEXT_PUBLIC_BASE_URL: string;
    PAYLOAD_GENERATE: 'true' | 'false' | undefined;
    NEXT_PUBLIC_SUPABASE_URL: string;
    NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
    RESEND_API_KEY: string;
    S3_ENDPOINT: string;
    S3_BUCKET: string;
    NEXT_PUBLIC_AUTH_BYPASS: 'true' | 'false' | undefined;
  }
}