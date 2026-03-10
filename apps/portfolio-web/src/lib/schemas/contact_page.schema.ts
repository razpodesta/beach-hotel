// RUTA: apps/portfolio-web/src/lib/schemas/contact_page.schema.ts
// VERSIÓN: 1.0 - Contrato para la Página de Contacto.
// DESCRIPCIÓN: Define la estructura del contenido i18n para la página dedicada de contacto.

import { z } from 'zod';

export const contactPageSchema = z.object({
  page_title: z.string(),
  page_description: z.string(),
  title: z.string(),
  subtitle: z.string(),
});
