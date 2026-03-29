/**
 * @file media.shaper.ts
 * @description Transformador de entidades multimedia.
 * @version 1.0 - Forensic Data Shaper
 */

import type { Media as PayloadMedia } from '@metashark/cms-core/payload-types';

export interface SovereignMedia {
  id: string;
  url: string;
  alt: string;
  mimeType: string;
  filesize: number;
  dimensions: { width: number; height: number };
}

/**
 * @description Transforma el documento crudo de Payload en un Activo Soberano.
 * @pilar III: Seguridad de Tipos.
 */
export function shapeMediaEntity(doc: PayloadMedia): SovereignMedia {
  return {
    id: doc.id,
    url: doc.url || '',
    alt: doc.alt,
    mimeType: doc.mimeType || 'image/unknown',
    filesize: doc.filesize || 0,
    dimensions: {
      width: doc.width || 0,
      height: doc.height || 0,
    },
  };
}