/**
 * @file apps/portfolio-web/src/global.d.ts
 * @description Declaraciones de tipos globales para módulos no-TS.
 *              Refactorizado: Erradicación total del tipo 'any' y de 
 *              bypasses del linter. Tipado estricto para SVG y CSS.
 * @version 3.0 - Zero-Any Compliance Standard
 * @author Staff Engineer - MetaShark Tech
 */

declare module '*.svg' {
  import type { FC, SVGProps } from 'react';
  
  /** 
   * Representación estándar exportada para compatibilidad con Next/Image.
   * Usualmente una URL en formato string.
   */
  const content: string;
  
  /** 
   * Representación como Componente React (vía SVGR plugin).
   * Blindado con propiedades nativas de SVG para Intellisense.
   */
  export const ReactComponent: FC<SVGProps<SVGSVGElement>>;
  
  export default content;
}

/** 
 * @description Permite la importación de archivos CSS globales.
 *              Esto silencia el error TS2307 en layout.tsx durante procesos Nx.
 */
declare module '*.css' {
  const content: Record<string, string>;
  export default content;
}

/** 
 * @description Soporte estricto para CSS Modules.
 *              Las clases inyectadas son inmutables (Readonly).
 */
declare module '*.module.css' {
  const classes: Readonly<Record<string, string>>;
  export default classes;
}