// RUTA: apps/portfolio-web/src/lib/schemas/history_section.schema.ts
// VERSIÓN: 1.0 - Contrato de datos para la sección de Historia.
// DESCRIPCIÓN: Este aparato define la estructura y el contrato de datos para el
//              contenido de internacionalización (i18n) de la sección final de
//              la homepage ('HistorySection'). Su creación resuelve una dependencia
//              faltante en el 'dictionary.schema.ts', eliminando el error de
//              compilación TS2307 y completando la infraestructura de datos para
//              esta nueva característica.

import { z } from 'zod';

export const historySectionSchema = z.object({
  title: z.string(),
  subtitle: z.string(),
});
