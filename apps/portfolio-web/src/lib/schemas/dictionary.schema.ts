/**
 * @file dictionary.schema.ts
 * @description Constitución Soberana de Datos (Master SSoT). 
 *              Orquestador definitivo de los contratos de contenido para el ecosistema.
 *              Nivelado: Integración del Protocolo 33 y validación de perfil.
 * @version 9.0 - Protocol 33 Full Integration Sync
 * @author Raz Podestá - MetaShark Tech
 */

import { z } from 'zod';

import { headerSchema } from './header.schema';
import { navLinksSchema } from './nav-links.schema';
import { footerSchema } from './footer.schema';
import { heroSchema } from './hero.schema';
import { aboutSectionSchema } from './about_section.schema';
import { valuePropositionSectionSchema } from './value_proposition.schema';
import { contactMessagesSchema } from './contact.schema';
import { historySectionSchema } from './history_section.schema';
import { aiGallerySectionSchema } from './homepage.schema';
import { systemStatusSchema } from './system_status.schema';
import { visitorHudSchema } from './visitor_hud.schema';
import { languageSwitcherSchema } from './language_switcher.schema';
import { legalPageSchema } from './legal_page.schema';
import { blogPageSchema } from './blog.schema';
import { notFoundSchema, maintenanceSchema } from './not_found.schema';
import { missionVisionSchema } from './mission_vision.schema';
import { profilePageSchema } from './profile_page.schema';

/**
 * ESQUEMA MAESTRO: dictionarySchema
 * @description Contrato inmutable contra el cual se validan todos los archivos JSON de mensajes.
 * @pilar III: Seguridad de Tipos Absoluta.
 */
export const dictionarySchema = z.object({
  header: headerSchema,
  'nav-links': navLinksSchema,
  footer: footerSchema,
  system_status: systemStatusSchema,
  visitor_hud: visitorHudSchema,
  language_switcher: languageSwitcherSchema,
  
  // Aparatos granulares de marca y narrativa
  hero: heroSchema,
  about: aboutSectionSchema,
  value_proposition: valuePropositionSectionSchema,
  contact: contactMessagesSchema,
  history: historySectionSchema,
  ai_gallery_section: aiGallerySectionSchema,
  blog_page: blogPageSchema,
  mission_vision: missionVisionSchema,

  /**
   * @pilar I: Visión Holística.
   * Integración del centro de mando del usuario (Reputación & XP).
   */
  profile_page: profilePageSchema,
  
  legal: z.object({
    privacy_policy: legalPageSchema,
    terms_of_service: legalPageSchema,
  }),

  not_found: notFoundSchema,
  maintenance: maintenanceSchema,
});

/**
 * TIPO SOBERANO INFERIDO
 * Fuente de verdad única para props y hooks en toda la plataforma web.
 */
export type Dictionary = z.infer<typeof dictionarySchema>;