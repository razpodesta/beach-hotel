/**
 * @file festival_experience.schema.ts
 * @description Contrato Soberano para la Dimensión Festival.
 *              Nivelado: Inclusión de etiquetas de matriz de precios y créditos.
 * @version 2.1 - Schema Hardening
 * @author Raz Podestá - MetaShark Tech
 */

import { z } from 'zod';

export const experienceEventSchema = z.object({
  id: z.string().min(1),
  day: z.number().int().min(1).max(7),
  title: z.string().min(1),
  location: z.string().min(1),
  startTime: z.string().min(1),
  description: z.string().min(1),
  vibe: z.enum(['Techno', 'House', 'Pop', 'Chill', 'Disco']),
  isVipOnly: z.boolean(),
  image: z.string().min(1),
  neon_color: z.string().regex(/^#([A-Fa-f0-9]{6})$/, 'Invalid Hex Color'),
});

export const festivalPageSchema = z.object({
  hero: z.object({
    title: z.string().min(1),
    subtitle: z.string().min(1),
    video_url: z.string().url().optional(),
    countdown_target: z.string().min(1),
    cta_label: z.string().min(1),
  }),
  
  manifesto: z.string().min(1),

  vip_upsell: z.object({
    title: z.string().min(1),
    price_addon: z.string().min(1),
    per_guest_label: z.string().min(1), // Nivelado: "per guest"
    benefits: z.array(z.string()).min(1),
    cta_label: z.string().min(1),
  }),

  events: z.array(experienceEventSchema),

  packages_section: z.object({ // Nivelado: Labels de la sección de reserva
    title: z.string().min(1),
    subtitle: z.string().min(1),
    label_5_nights: z.string().min(1),
    label_7_nights: z.string().min(1),
    cta: z.string().min(1),
  }),

  packages: z.array(z.object({
    category: z.string().min(1),
    price_5_nights: z.string().min(1),
    price_7_nights: z.string().min(1),
    hotel_name: z.string().min(1),
    availability_label: z.string().min(1),
  })),

  footer_credits: z.string().min(1), // Nivelado: "Private Infrastructure..."
});

export type FestivalDictionary = z.infer<typeof festivalPageSchema>;