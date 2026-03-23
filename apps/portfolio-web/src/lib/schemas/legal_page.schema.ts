/**
 * @file legal_page.schema.ts
 * @description Contrato Soberano para el Marco Legal y Transparencia.
 *              Orquesta el contenido de Privacidad y Términos de Servicio.
 * @version 2.0 - Elite Compliance Standard
 * @author Raz Podestá - MetaShark Tech
 */

import { z } from 'zod';

/**
 * ESQUEMA: legalPageSchema
 * @description Define la estructura inmutable para la documentación legal del ecosistema.
 */
export const legalPageSchema = z.object({
  // --- METADATOS SEO ---
  meta_title: z.string().min(1),
  meta_description: z.string().min(1),

  // --- CABECERA EDITORIAL ---
  title: z.string().min(1),
  badge_label: z.string().min(1), // Ej: "Compliance & Transparency"
  last_updated_prefix: z.string().min(1), // Ej: "Última actualización:"
  last_updated_date: z.string().min(1), // Fecha localizada
  
  // --- NAVEGACIÓN Y ACCIONES ---
  back_button_label: z.string().min(1),
  print_button_label: z.string().min(1),

  // --- CUERPO DEL DOCUMENTO ---
  /** Permite un array de secciones legales estructuradas */
  content: z.array(z.object({
    heading: z.string().min(1),
    /** El body puede contener HTML sanitizado para enlaces y listas */
    body: z.string().min(1),
  })).min(1),

  // --- FOOTER DE MARCA ---
  infrastructure_label: z.string().min(1), // Ej: "Sovereign Digital Infrastructure"
});

export type LegalDictionary = z.infer<typeof legalPageSchema>;