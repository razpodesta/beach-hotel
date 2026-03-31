/**
 * @file offers.schema.ts
 * @description Contrato de validación para la interfaz de Paquetes y Programas.
 *              Valida etiquetas de filtrado, estados de reserva y metadatos SEO.
 * @version 1.0 - SSoT for Hospitality Offers
 * @author Raz Podestá - MetaShark Tech
 */

import { z } from 'zod';

export const offersSchema = z.object({
  // --- METADATOS SEO ---
  page_title: z.string().min(1),
  page_description: z.string().min(1),

  // --- NARRATIVA HERO ---
  hero_title: z.string().min(1),
  hero_subtitle: z.string().min(1),
  
  // --- FILTRADO TÁCTICO ---
  filter_all: z.string().min(1),
  filter_packages: z.string().min(1),
  filter_programs: z.string().min(1),
  filter_promos: z.string().min(1),

  // --- ETIQUETAS DE ACCIÓN Y CARD ---
  cta_book: z.string().min(1),
  cta_details: z.string().min(1),
  label_nights: z.string().min(1),
  label_from: z.string().min(1),
  label_inclusions: z.string().min(1),

  // --- ESTADOS DE RESILIENCIA ---
  empty_state: z.string().min(1),
  loading_state: z.string().min(1),
});

export type OffersDictionary = z.infer<typeof offersSchema>;