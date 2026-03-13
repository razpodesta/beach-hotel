/**
 * @file packages/cms/ui/src/global.d.ts
 * @version 3.0 - Ambient Declarations
 * @description Declaraciones globales para módulos CSS. Al usar el nombre
 *              'global.d.ts', evitamos el "Shadowing" con 'index.ts',
 *              permitiendo que todo el paquete reconozca los estilos.
 */

declare module '*.module.css' {
  const classes: { readonly [key: string]: string };
  export default classes;
}

declare module '*.css' {
  const content: string;
  export default content;
}