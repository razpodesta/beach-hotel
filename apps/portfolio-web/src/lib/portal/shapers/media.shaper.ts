/**
 * @file media.shaper.ts
 * @description Transformador soberano de entidades multimedia (The Alchemist).
 *              Refactorizado: Resolución dinámica de URLs absolutas (anti-404),
 *              normalización de metadatos físicos y resiliencia de carga Cloud S3.
 * @version 3.0 - S3 Absolute URL Resolver & CLS Protection
 * @author Raz Podestá - MetaShark Tech
 */

/**
 * IMPORTACIONES DE CONTRATO
 * @pilar V: Adherencia a las fronteras de Nx.
 */
import type { PayloadMediaDoc } from '@metashark/cms-core';

/**
 * @interface SovereignMedia
 * @description Contrato de salida para la UI de alta fidelidade.
 */
export interface SovereignMedia {
  id: string;
  url: string;
  alt: string;
  mimeType: string;
  filesize: number;
  dimensions: { 
    width: number; 
    height: number;
    aspectRatio: number;
  };
}

/**
 * @description Transforma el documento crudo de Payload en un Activo Soberano 
 *              garantizando que la URL sea absoluta y los metadatos íntegros.
 * @pilar III: Seguridad de Tipos Absoluta.
 * @pilar VIII: Resiliencia de Infraestructura.
 */
export function shapeMediaEntity(doc: PayloadMediaDoc): SovereignMedia {
  // 1. RESOLUCIÓN DE RUMBO (The Sovereign Path)
  // @fix: Detectamos si la URL es relativa y la vinculamos al servidor del CMS.
  let finalUrl = typeof doc.url === 'string' ? doc.url : '';
  
  if (finalUrl && !finalUrl.startsWith('http')) {
    const cmsBaseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    // Saneamos slashes duplicados
    finalUrl = `${cmsBaseUrl.replace(/\/$/, '')}/${finalUrl.replace(/^\//, '')}`;
  }

  // 2. NORMALIZACIÓN DE DIMENSIONES (CLS Protection)
  const width = doc.width || 1200;
  const height = doc.height || 630;
  const aspectRatio = width / height;

  // 3. RETORNO DE ENTIDAD PURIFICADA
  return {
    id: doc.id,
    url: finalUrl,
    alt: doc.alt || 'Beach Hotel Boutique Asset',
    mimeType: doc.mimeType || 'image/webp', // Default moderno
    filesize: doc.filesize || 0,
    dimensions: {
      width,
      height,
      aspectRatio,
    },
  };
}