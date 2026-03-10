import { z } from 'zod';

// Esquema para características técnicas individuales (Upselling técnico)
const featureSchema = z.object({
  name: z.string(),
  detail: z.string(),
});

// Esquema para configuración de diseño (Branding por proyecto)
const designConfigSchema = z.object({
  font_heading: z.string(),
  font_body: z.string(),
  primary_color: z.string(),
  layout_style: z.enum(['minimal', 'immersive', 'editorial', 'corporate', 'brutalist']),
});

// Esquema de características de IA (Opcional)
const aiFeaturesSchema = z.object({
  enabled: z.boolean(),
  description: z.string().optional(),
  capabilities: z.array(z.string()).optional(),
});

// Esquema para la arquitectura del backend
const backendArchitectureSchema = z.object({
  title: z.string(),
  description: z.string(),
  features: z.array(z.string()),
});

// Esquema para la introducción narrativa
const introductionSchema = z.object({
  heading: z.string(),
  body: z.string(),
});

export const projectDetailItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  subtitle: z.string(),
  introduction: introductionSchema,
  tech_stack: z.array(z.string()),
  backend_architecture: backendArchitectureSchema,
  elite_options: z.array(featureSchema),
  ai_features: aiFeaturesSchema.optional(),
  ui_sections: z.array(z.string()),
  branding: designConfigSchema,
});

// Esquema para el diccionario completo (Record de slugs a detalles)
export const projectDetailsDictionarySchema = z.record(z.string(), projectDetailItemSchema);

export type ProjectDetailItem = z.infer<typeof projectDetailItemSchema>;
export type ProjectDetailsDictionary = z.infer<typeof projectDetailsDictionarySchema>;
