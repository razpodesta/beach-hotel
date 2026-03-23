/**
 * @file dictionary.schema.ts
 * @description Constitución Soberana de Datos (Master SSoT). 
 *              Orquesta la validación integral de todos los activos i18n del ecosistema.
 *              Nivelado: Integración de festival, quienes_somos y saneamiento de 
 *              residuos para asegurar un build 100% exitoso en Vercel.
 * @version 13.0 - Zero Regressions Standard
 * @author Raz Podestá - MetaShark Tech
 */

import { z } from 'zod';

/**
 * IMPORTACIONES DE ESQUEMAS ATÓMICOS
 * @pilar V: Adherencia arquitectónica mediante rutas relativas internas y extensiones ESM.
 */
import { headerSchema } from './header.schema.js';
import { navLinksSchema } from './nav-links.schema.js';
import { footerSchema } from './footer.schema.js';
import { heroSchema } from './hero.schema.js';
import { aboutSectionSchema } from './about_section.schema.js';
import { valuePropositionSectionSchema } from './value_proposition.schema.js';
import { contactMessagesSchema } from './contact.schema.js';
import { historySectionSchema } from './history_section.schema.js';
import { aiGallerySectionSchema } from './homepage.schema.js';
import { systemStatusSchema } from './system_status.schema.js';
import { visitorHudSchema } from './visitor_hud.schema.js';
import { languageSwitcherSchema } from './language_switcher.schema.js';
import { legalPageSchema } from './legal_page.schema.js';
import { blogPageSchema } from './blog.schema.js';
import { notFoundSchema, maintenanceSchema, serverErrorSchema } from './not_found.schema.js';
import { missionVisionSchema } from './mission_vision.schema.js';
import { profilePageSchema } from './profile_page.schema.js';
import { suiteGallerySchema } from './suite_gallery.schema.js';
import { festivalPageSchema } from './festival_experience.schema.js';
import { quienesSomosSchema } from './quienes_somos.schema.js';
import { libraryPageSchema } from './library_page.schema.js';

/**
 * ESQUEMA MAESTRO: dictionarySchema
 * @description Define la estructura final del objeto Dictionary tras el pre-build.
 * @pilar III: Seguridad de Tipos Absoluta e Inferencia Obligatoria.
 */
export const dictionarySchema = z.object({
  // --- INFRAESTRUCTRURA DEL SHELL (Soberanía Global) ---
  header: headerSchema,
  'nav-links': navLinksSchema,
  footer: footerSchema,
  system_status: systemStatusSchema,
  visitor_hud: visitorHudSchema,
  language_switcher: languageSwitcherSchema,
  
  // --- APARATOS DE NARRATIVA (MACS Flattened Protocol) ---
  /** @pilar I: Mapeo directo de hero.json */
  hero: heroSchema,
  /** @pilar I: Mapeo directo de about.json */
  about: aboutSectionSchema,
  /** @pilar I: Mapeo directo de value_proposition.json */
  value_proposition: valuePropositionSectionSchema,
  /** @pilar I: Mapeo directo de ai_gallery_section.json */
  ai_gallery_section: aiGallerySectionSchema,
  /** @pilar I: Mapeo directo de suite_gallery.json */
  suite_gallery: suiteGallerySchema,
  /** @pilar I: Mapeo directo de festival.json (Nivelado v2.0) */
  festival: festivalPageSchema,
  /** @pilar I: Mapeo directo de quienes_somos.json */
  quienes_somos: quienesSomosSchema,
  /** @pilar I: Mapeo directo de history.json */
  history: historySectionSchema,
  
  // --- APARATOS INSTITUCIONALES Y EDITORIALES ---
  contact: contactMessagesSchema,
  blog_page: blogPageSchema,
  mission_vision: missionVisionSchema,
  profile_page: profilePageSchema,
  lucide_page: libraryPageSchema,
  
  // --- DOMINIOS DE CONTENIDO ADICIONAL (Opcionales) ---
  homepage: z.record(z.string(), z.unknown()).optional(),

  // --- APARATOS LEGALES (Compliance) ---
  legal: z.object({
    privacy_policy: legalPageSchema,
    terms_of_service: legalPageSchema,
  }),

  // --- ESTADOS DEL SISTEMA Y RESILIENCIA (Pilar VIII) ---
  not_found: notFoundSchema,
  maintenance: maintenanceSchema,
  server_error: serverErrorSchema,
});

/**
 * INFERENCIA SOBERANA
 * @description El tipo Dictionary se deriva automáticamente del contrato SSoT.
 * @pilar III: Erradicación de any/manual interfaces.
 */
export type Dictionary = z.infer<typeof dictionarySchema>;