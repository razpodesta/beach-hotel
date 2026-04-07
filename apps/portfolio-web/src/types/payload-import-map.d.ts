/**
 * @file apps/portfolio-web/src/types/payload-import-map.d.ts
 * @description [DEPRECATED] Archivo neutralizado para evitar "Module Shadowing".
 *              En Payload 3.x, el importMap se resuelve dinámicamente vía 
 *              '@payloadcms/next/importMap', cuya declaración soberana ya 
 *              reside de forma segura en 'src/payload-types.d.ts'.
 * @version 2.0 - Shadowing Purged
 * @author Staff Engineer - MetaShark Tech
 */

// Al exportar un objeto vacío, TypeScript reconoce este archivo como un 
// módulo aislado y deja de sobrescribir la librería global 'payload'.
export {};