/**
 * @file hero.schema.ts
 * @description Contrato Soberano para la Recepción Cinemática.
 *              Incluye validación de activos multimedia para permitir
 *              gestión total desde el CMS.
 * @version 2.0 - Asset-Driven Sovereign Schema
 */

import { z } from 'zod';

/**
 * ESQUEMA: slideAssetSchema
 * @description Define los recursos técnicos para cada dimensión (Hotel/Festival).
 */
const slideAssetSchema = z.object({
  video_url: z.string().min(1),
  poster_url: z.string().min(1),
  audio_url: z.string().min(1),
});

export const heroSchema = z.object({
  page_title: z.string().min(1),
  page_description: z.string().min(1),
  
  // Textos Dinámicos
  HOTEL_TITLE: z.string().min(1),
  HOTEL_SUBTITLE: z.string().min(1),
  HOTEL_FEATURES: z.string().min(1),
  
  FESTIVAL_TITLE: z.string().min(1),
  FESTIVAL_SUBTITLE: z.string().min(1),
  FESTIVAL_FEATURES: z.string().min(1),
  
  CTA_BUTTON: z.string().min(1),
  
  // Etiquetas de Interfaz (MEA/UX)
  audio_active_label: z.string().min(1),
  audio_muted_label: z.string().min(1),
  
  // Configuración de Activos (MACS Compliance)
  assets: z.object({
    hotel: slideAssetSchema,
    festival: slideAssetSchema,
  }),
});

export type HeroDictionary = z.infer<typeof heroSchema>;