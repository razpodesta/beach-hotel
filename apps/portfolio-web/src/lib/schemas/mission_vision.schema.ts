// RUTA: apps/portfolio-web/src/lib/schemas/mission_vision.schema.ts
// VERSIÓN: 1.1 - Exportación de Tipos Inferidos.
// DESCRIPCIÓN: Se exporta el tipo `VisionPillar` inferido de Zod para ser
//              utilizado en componentes, reforzando la seguridad de tipos.

import { z } from 'zod';

const visionPillarSchema = z.object({
  title: z.string(),
  description: z.string(),
});

export const missionVisionSchema = z.object({
  mission_title: z.string(),
  mission_description: z.string(),
  vision_title: z.string(),
  vision_subtitle: z.string(),
  vision_pillars: z.array(visionPillarSchema).length(3),
});

// --- INICIO DE LA MEJORA PROACTIVA ---
// Exportamos el tipo de un único pilar para usarlo en el .map() del componente.
export type VisionPillar = z.infer<typeof visionPillarSchema>;
// --- FIN DE LA MEJORA PROACTIVA ---
