/**
 * @file quienes_somos.schema.ts
 * @description Contrato Soberano para la sección institucional "Nuestra Historia".
 *              Valida la narrativa de marca, los pilares de hospitalidad y 
 *              metadatos SEO críticos para el Beach Hotel Canasvieiras.
 * @version 2.0 - Hospitality Narrative Sync
 * @author Raz Podestá - MetaShark Tech
 */

import { z } from 'zod';

/**
 * @description Definición de un pilar de hospitalidad.
 */
const hospitalityPillarSchema = z.object({
  /** Título del pilar (ej: Lujo Consciente) */
  title: z.string().min(1, 'Pillar title is required'),
  /** Descripción detallada del valor ofrecido */
  description: z.string().min(1, 'Pillar description is required'),
});

/**
 * @description Esquema maestro para el diccionario Quienes Somos.
 * @pilar III: Seguridad de Tipos Absoluta.
 */
export const quienesSomosSchema = z.object({
  /** SEO: Título de la página */
  page_title: z.string().min(1),
  /** SEO: Meta descripción técnica */
  page_description: z.string().min(1),
  
  /** Título de impacto del Hero narrativo */
  hero_title: z.string().min(1),
  /** Bajada de texto del Hero */
  hero_subtitle: z.string().min(1),
  
  /** Pilar I: Excelencia y exclusividad */
  luxury_pillar: hospitalityPillarSchema,
  /** Pilar II: Bienestar y refugio */
  comfort_pillar: hospitalityPillarSchema,
  /** Pilar III: Atención personalizada */
  service_pillar: hospitalityPillarSchema,
  
  /** Título para la sección de conversión final */
  cta_title: z.string().min(1),
  /** Etiqueta del botón de reserva */
  cta_button: z.string().min(1),
});

/** TIPO SOBERANO INFERIDO */
export type QuienesSomosDictionary = z.infer<typeof quienesSomosSchema>;