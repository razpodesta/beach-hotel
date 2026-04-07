/**
 * @file apps/portfolio-web/src/lib/portal/shapers/media.shaper.ts
 * @description Transformador soberano de entidades multimedia (The Alchemist).
 *              Refactorizado: Blindaje contra divisiones por cero, normalización
 *              estricta de URLs base y erradicación de comportamientos 
 *              indeterminados durante el build.
 * @version 4.1 - Resilience Hardened & Linter Pure
 * @author Raz Podestá - Staff Engineer, MetaShark Tech
 */

import type { PayloadMediaDoc } from '@metashark/cms-core';

/**
 * @interface SovereignMedia
 * @description Contrato de salida inmutable para la UI.
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
 * @description Transforma el documento crudo de Payload en un Activo Soberano.
 * @param {PayloadMediaDoc} doc - Documento crudo del CMS.
 * @param {string} [currentTenantId] - Si se provee, blinda el activo contra acceso cross-tenant.
 * @returns {SovereignMedia | null} Entidad purificada o null si hay violación de seguridad.
 */
export function shapeMediaEntity(
  doc: PayloadMediaDoc, 
  currentTenantId?: string
): SovereignMedia | null {
  
  // 1. BLINDAJE DE SEGURIDAD (Tenant Boundary Shield)
  const docTenant = typeof doc.tenant === 'object' && doc.tenant !== null 
    ? doc.tenant.id 
    : doc.tenant;

  if (currentTenantId && docTenant !== currentTenantId) {
    console.warn(`[HEIMDALL][SECURITY-ALERT] Attempted tenant leak detected. Asset: ${doc.id}`);
    return null;
  }

  // 2. RESOLUCIÓN DE RUMBO (The Sovereign Path)
  let finalUrl = typeof doc.url === 'string' ? doc.url : '';
  
  if (!finalUrl) {
    console.warn(`[HEIMDALL][VAULT] Asset URL missing: ${doc.id}`);
    return null;
  }
  
  // Normalización de Base URL con Fail-Safe para Build Environments
  if (!finalUrl.startsWith('http')) {
    const cmsBaseUrl = (process.env.NEXT_PUBLIC_BASE_URL ?? 'https://beachhotelcanasvieiras.com').replace(/\/$/, '');
    finalUrl = `${cmsBaseUrl}/${finalUrl.replace(/^\//, '')}`;
  }

  // 3. NORMALIZACIÓN DE DIMENSIONES (CLS Protection & Division-by-Zero Guard)
  const width = doc.width && doc.width > 0 ? doc.width : 1200;
  const height = doc.height && doc.height > 0 ? doc.height : 630;
  const aspectRatio = width / height;
  
  return {
    id: doc.id,
    url: finalUrl,
    alt: doc.alt || 'Beach Hotel Boutique Asset',
    mimeType: doc.mimeType || 'image/webp',
    filesize: doc.filesize || 0,
    dimensions: {
      width,
      height,
      aspectRatio,
    },
  };
}