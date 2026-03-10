// RUTA: apps/portfolio-web/src/lib/schemas/header.schema.ts
// VERSIÓN: 3.0 - Soporte Específico para Móvil
// DESCRIPCIÓN: Se añaden claves para controlar el texto del branding en dispositivos
//              móviles, separándolo de los títulos descriptivos de escritorio/SEO.

import { z } from 'zod';

export const headerSchema = z.object({
  talk: z.string(),
  tagline: z.string(),
  personal_portfolio: z.string(),
  job_title: z.string(),
  // --- NUEVAS CLAVES ---
  mobile_title: z.string(),
  mobile_subtitle: z.string(),
});
