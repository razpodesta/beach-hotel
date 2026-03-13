/**
 * @file apps/portfolio-web/src/lib/schemas/project_details.schema.ts
 * @description Contrato soberano (SSoT) para los activos digitales y proyectos.
 *              Sincronizado con la colección del CMS Core y el Protocolo 33.
 * @version 5.1 - Elite Options Contract Integration
 * @author Raz Podestá - MetaShark Tech
 */

import { z } from 'zod';

// ============================================================================
// 1. ESQUEMAS ATÓMICOS DE SOPORTE
// ============================================================================

/**
 * Catálogo de estilos de maquetación permitidos.
 */
export const ProjectLayoutStyle = z.enum([
  'minimal', 
  'immersive', 
  'editorial', 
  'corporate', 
  'brutalist'
]);

const projectBrandingSchema = z.object({
  primary_color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Formato Hex inválido'),
  layout_style: ProjectLayoutStyle,
});

const projectBackendSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional().nullable(),
  features: z.array(z.string()),
});

const projectIntroductionSchema = z.object({
  heading: z.string().min(1),
  body: z.string().min(1),
});

/**
 * Esquema para características premium del activo.
 */
const projectEliteOptionSchema = z.object({
  name: z.string().min(1),
  detail: z.string().min(1),
});

// ============================================================================
// 2. CONTRATO DE ENTIDAD (DATA SSoT)
// ============================================================================

export const projectEntitySchema = z.object({
  // Identidad de Infraestructura
  id: z.string().uuid().or(z.string()),
  tenantId: z.string().min(1), 
  status: z.enum(['draft', 'published']),
  
  // Metadatos de Negocio
  slug: z.string().min(1),
  title: z.string().min(1),
  subtitle: z.string().optional().nullable(),
  description: z.string().min(1),
  
  // Gestión de Assets
  imageUrl: z.string().url().or(z.string()), 
  
  // Enlaces y Taxonomía
  liveUrl: z.string().url().optional().nullable().or(z.literal('#')),
  codeUrl: z.string().url().optional().nullable(),
  tags: z.array(z.string()),
  tech_stack: z.array(z.string()),
  
  // Estructura Editorial (ProjectTechModal Support)
  introduction: projectIntroductionSchema,
  backend_architecture: projectBackendSchema.optional().nullable(),
  
  /**
   * @property elite_options
   * @pilar II: Sincronización de nuevas características.
   * Colección de implementaciones de alto nivel para el activo.
   */
  elite_options: z.array(projectEliteOptionSchema).optional().nullable(),
  
  // Protocolo 33: Gamificación
  reputationWeight: z.number().int().min(0).default(10),
  
  // Estética
  branding: projectBrandingSchema,
});

// ============================================================================
// 3. CONTRATO DE DICCIONARIO (UI LABELS)
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

/**
 * INFERENCIA DE TIPOS SOBERANA
 */
export type ProjectEntity = z.infer<typeof projectEntitySchema>;
export type ProjectDetailsDictionary = z.infer<typeof projectDetailsDictionarySchema>;
export type ProjectEliteOption = z.infer<typeof projectEliteOptionSchema>;
export type ProjectLayoutStyleType = z.infer<typeof ProjectLayoutStyle>;