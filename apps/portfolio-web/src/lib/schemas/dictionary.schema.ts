/**
 * @file dictionary.schema.ts
 * @description Constitución Soberana de Datos (Master SSoT). 
 *              Nivelado para ensamblaje granular de aparatos.
 * @version 8.1 - Flat Mapping Strategy
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

export const dictionarySchema = z.object({
  header: headerSchema,
  'nav-links': navLinksSchema,
  footer: footerSchema,
  system_status: systemStatusSchema,
  visitor_hud: visitorHudSchema,
  language_switcher: languageSwitcherSchema,
  
  // Aparatos granulares (Mapeo 1:1 con nombre de archivo JSON)
  hero: heroSchema,
  about: aboutSectionSchema,
  value_proposition: valuePropositionSectionSchema,
  contact: contactMessagesSchema,
  history: historySectionSchema,
  ai_gallery_section: aiGallerySectionSchema,
  blog_page: blogPageSchema,
  mission_vision: missionVisionSchema,
  
  legal: z.object({
    privacy_policy: legalPageSchema,
    terms_of_service: legalPageSchema,
  }),

  not_found: notFoundSchema,
  maintenance: maintenanceSchema,
});

export type Dictionary = z.infer<typeof dictionarySchema>;