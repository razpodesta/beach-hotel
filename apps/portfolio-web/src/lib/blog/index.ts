// RUTA: apps/portfolio-web/src/lib/blog/index.ts
// VERSIÓN: 1.0 - Fachada Pública del Módulo de Datos del Blog.
// DESCRIPCIÓN: Este "barrel file" actúa como el único punto de entrada para
//              la capa de acceso a datos del blog. Re-exporta las funciones
//              necesarias desde los archivos de implementación internos (como actions.ts),
//              ocultando la estructura interna del módulo y proveyendo una API limpia
//              y cohesiva para el resto de la aplicación.

export * from './actions';
