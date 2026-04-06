/**
 * @file apps/portfolio-web/src/types/payload-next.d.ts
 * @description Escudo de Infraestructura de Tipos (Ambient Declarations).
 *              Refactorizado: Erradicación total de 'any' mediante 'unknown'.
 * @version 3.1 - Forensic Type Shield (Build-Resilient)
 */

declare module '@payloadcms/next/views/Admin' {
  import { ReactNode } from 'react';
  import { SanitizedConfig } from 'payload';
  
  export interface AdminViewProps {
    config: SanitizedConfig | Promise<SanitizedConfig>;
    // Usamos unknown ya que la estructura interna de importMap es opaca y dinámica
    importMap: Record<string, unknown>;
    params: string[];
    searchParams: Record<string, string | string[] | undefined>;
  }

  export function AdminView(props: AdminViewProps): ReactNode;
}

declare module '@payloadcms/next/importMap' {
  // El mapa de importaciones es una inyección de módulos, 'unknown' es el tipo correcto
  export const importMap: Record<string, unknown>;
}