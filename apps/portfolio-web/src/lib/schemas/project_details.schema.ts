/**
 * @file apps/portfolio-web/src/lib/schemas/project_details.schema.ts
 * @version 4.0 - Sincronización Estricta
 * @description Sincronizado con ProjectTechModal.tsx. Ahora exporta ProjectEntity 
 *              como la SSoT para los datos de proyecto.
 * @author Raz Podestá - MetaShark Tech
 */

import { z } from 'zod';

// ============================================================================
// 1. CONTRATO DE DATOS (DATA SSoT)
// ============================================================================

const projectBrandingSchema = z.object({
  primary_color: z.string(),
  layout_style: z.enum(['minimal', 'immersive', 'editorial', 'corporate', 'brutalist']),
});

const projectBackendSchema = z.object({
  title: z.string(),
  description: z.string().optional().nullable(),
  features: z.array(z.string()),
});

const projectEliteOptionSchema = z.object({
  name: z.string(),
  detail: z.string(),
});

// Esquema para la sección de introducción requerida por ProjectTechModal
const projectIntroductionSchema = z.object({
  heading: z.string(),
  body: z.string(),
});

export const projectEntitySchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  subtitle: z.string().optional().nullable(),
  description: z.string(),
  imageUrl: z.string(),
  liveUrl: z.string().optional().nullable(),
  codeUrl: z.string().optional().nullable(),
  tags: z.array(z.string()),
  tech_stack: z.array(z.string()),
  introduction: projectIntroductionSchema, // Añadido para ProjectTechModal
  backend_architecture: projectBackendSchema.optional().nullable(),
  elite_options: z.array(projectEliteOptionSchema).optional().nullable(),
  branding: projectBrandingSchema,
});

// ============================================================================
// 2. CONTRATO DE INTERFAZ (UI LABELS SSoT)
// ============================================================================

export const projectDetailsDictionarySchema = z.object({
  section_title: z.string(),
  section_subtitle: z.string(),
  label_live_demo: z.string(),
  label_source_code: z.string(),
  label_tech_stack: z.string(),
  label_backend_arch: z.string(),
  label_elite_options: z.string(),
  label_objective: z.string(),
  label_close_modal: z.string(),
  empty_state: z.string(),
});

// Inferencia de tipos estricta
export type ProjectEntity = z.infer<typeof projectEntitySchema>;
export type ProjectDetailsDictionary = z.infer<typeof projectDetailsDictionarySchema>;