/**
 * @file apps/portfolio-web/src/lib/blog-api.ts
 * @description Fachada Pública Soberana del Dominio Editorial (The Concierge Journal).
 *              Refactorizado: Normalización de exportaciones para Next.js 15 y 
 *              blindaje de contratos de tipos bajo el estándar SSoT.
 * @version 5.1 - Next.js 15 Bundle Sync
 * @author Raz Podestá - MetaShark Tech
 */

/**
 * EXPORTACIONES LÓGICAS (Server Actions)
 * @pilar V: Adherencia Arquitectónica. 
 * Estas funciones orquestan el flujo entre la base de datos y la UI,
 * implementando el degradado elegante hacia Mocks en caso de falla de red.
 */
export { 
  getAllPosts, 
  getPostBySlug, 
  getPostsByTag 
} from './blog/actions';

/**
 * EXPORTACIONES DE CONTRATO (Sovereign Schemas)
 * @pilar III: Seguridad de Tipos Absoluta.
 * El uso de 'export type' es innegociable para asegurar que estos 
 * artefactos no generen código en el bundle final del cliente.
 */
export type { 
  PostWithSlug, 
  BlogPost, 
  BlogPageDictionary,
  AtmosphereVibeType 
} from './schemas/blog.schema';

/**
 * @description Nota de Infraestructura:
 * Este aparato actúa como una interfaz inmutable. Cualquier fallo en la 
 * recuperación de datos debe resolverse en el núcleo lógico: './blog/actions'.
 */