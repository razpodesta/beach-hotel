/**
 * @file apps/portfolio-web/src/payload-types.d.ts
 * @description Blindaje contra el error TS2307. Declara los módulos dinámicos
 *              de Payload como módulos válidos para el compilador de TypeScript.
 *              Refactorizado: Erradicación total de 'any' para cumplimiento de ESLint.
 * @version 2.0 - Linter Compliant
 * @author Raz Podestá - MetaShark Tech
 */

declare module '@payloadcms/next/views/Admin' {
  import { ReactNode } from 'react';
  
  // AdminView acepta un objeto de configuración que Payload inyecta.
  // Usamos Record<string, unknown> para representar el objeto de configuración.
  export function AdminView(props: Record<string, unknown>): ReactNode;
}

declare module '@payloadcms/next/importMap' {
  /** 
   * El importMap es un objeto complejo que Payload mapea a las vistas.
   * Representamos la estructura mínima requerida para satisfacer la lógica de importación.
   */
  export const importMap: Record<string, unknown>;
}