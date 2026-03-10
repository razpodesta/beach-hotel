// RUTA: apps/portfolio-web/src/lib/schemas/footer.schema.ts
// VERSIÓN: 2.0 - Arquitectura de Footer Potente.
// DESCRIPCIÓN: Se expande el esquema para incluir una estructura de columnas de
//              enlaces y textos para una llamada a la acción (CTA) de suscripción,
//              permitiendo un footer rico en contenido y funcional.

import { z } from 'zod';

export const footerSchema = z.object({
  // Textos para la llamada a la acción del boletín
  newsletter_title: z.string(),
  newsletter_placeholder: z.string(),
  newsletter_button: z.string(),

  // Títulos para las columnas de enlaces de navegación
  column_nav_title: z.string(),
  column_services_title: z.string(),
  column_legal_title: z.string(),

  // Textos legales y de derechos de autor
  rights_reserved: z.string(),
  made_by: z.string(),
});
