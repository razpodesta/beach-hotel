/**
 * @file apps/portfolio-web/src/lib/schemas/dictionary.schema.ts
 * @description Constitución Soberana de Datos (Master SSoT). 
 *              Orquesta la validación integral de todos los activos i18n.
 *              Nivelado: Desacoplamiento del dominio Gamification y sincronía
 *              con la arquitectura de 33 artefactos del Protocolo 33.
 * @version 19.0 - Protocol 33 Granular Integration
 * @author Raz Podestá - MetaShark Tech
 */

import { z } from 'zod';

/**
 * IMPORTACIONES DE ESQUEMAS ATÓMICOS
 * @pilar V: Adherencia arquitectónica (Pure Source-First).
 */
import { headerSchema } from './header.schema.js';
import { navLinksSchema } from './nav-links.schema.js';
import { footerSchema } from './footer.schema.js';
import { newsletterFormSchema } from './newsletter_form.schema.js';
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
import { authPortalSchema } from './auth_portal.schema.js';
import { portalSchema } from './portal.schema.js';
import { adminMediaSchema } from './admin_media.schema.js';

/** 
 * INYECCIÓN DE GAMIFICACIÓN 
 * @pilar II: Gamificación Inmersiva (SSoT).
 */
import { gamificationSchema } from './gamification.schema.js';

/**
 * APARATO PRINCIPAL: dictionarySchema
 * @description Único Punto de Verdad para la validación de diccionarios JSON.
 *              Garantiza que el build de Next.js sea 100% Type-Safe.
 */
export const dictionarySchema = z.object({
  // --- INFRAESTRUCTRURA DEL SHELL ---
  header: headerSchema,
  'nav-links': navLinksSchema,
  footer: footerSchema,
  newsletter_form: newsletterFormSchema,
  system_status: systemStatusSchema,
  visitor_hud: visitorHudSchema,
  language_switcher: languageSwitcherSchema,
  auth_portal: authPortalSchema,
  portal: portalSchema,
  admin_media: adminMediaSchema,
  
  // --- NUCLEO DE REPUTACIÓN (PROTOCOL 33) ---
  gamification: gamificationSchema, 
  
  // --- APARATOS DE NARRATIVA ---
  hero: heroSchema,
  about: aboutSectionSchema,
  value_proposition: valuePropositionSectionSchema,
  ai_gallery_section: aiGallerySectionSchema,
  suite_gallery: suiteGallerySchema,
  festival: festivalPageSchema,
  quienes_somos: quienesSomosSchema,
  history: historySectionSchema,
  
  // --- APARATOS INSTITUCIONALES Y EDITORIALES ---
  contact: contactMessagesSchema,
  blog_page: blogPageSchema,
  mission_vision: missionVisionSchema,
  profile_page: profilePageSchema,
  lucide_page: libraryPageSchema,
  
  // --- DOMINIOS ADICIONALES ---
  homepage: z.record(z.string(), z.unknown()).optional(),
  legal: z.object({
    privacy_policy: legalPageSchema,
    terms_of_service: legalPageSchema,
  }),
  not_found: notFoundSchema,
  maintenance: maintenanceSchema,
  server_error: serverErrorSchema,
});

export type Dictionary = z.infer<typeof dictionarySchema>;