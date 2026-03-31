/**
 * @file apps/portfolio-web/src/lib/schemas/dictionary.schema.ts
 * @description Master SSoT (Single Source of Truth) - Enterprise Level 4.0.
 *              Orquesta la validación atómica de los Silos Operativos (A, B, C, D)
 *              y los Dominios de Experiencia. Nivelado para erradicar tipos 'unknown'
 *              y garantizar inferencia estricta en el Frontend.
 * @version 28.0 - Strict ESM Resolution Standard & Full Type Sync
 * @author Staff Engineer - MetaShark Tech
 */

import { z } from 'zod';

/** 1. CORE INFRASTRUCTURE SCHEMAS */
import { headerSchema } from './header.schema.js';
import { navLinksSchema } from './nav-links.schema.js';
import { footerSchema } from './footer.schema.js';
import { newsletterFormSchema } from './newsletter_form.schema.js';
import { systemStatusSchema } from './system_status.schema.js';
import { visitorHudSchema } from './visitor_hud.schema.js';
import { languageSwitcherSchema } from './language_switcher.schema.js';
import { authPortalSchema } from './auth_portal.schema.js';
import { portalSchema } from './portal.schema.js';
import { adminMediaSchema } from './admin_media.schema.js';
import { gamificationSchema } from './gamification.schema.js';

/** 2. SILO A: REVENUE & SALES ENGINE */
import { flashSalesSchema } from './offers/flash_sales.schema.js';
import { offersSchema } from './offers.schema.js';

/** 3. SILO B: PARTNER NETWORK (B2B) */
import { partnerNetworkSchema } from './partners/network.schema.js';
import { partnerFormSchema } from './partners/registration_form.schema.js';

/** 4. SILO C: INTELLIGENCE & MARKETING CLOUD */
import { ingestionVaultSchema } from './marketing/ingestion.schema.js';
import { marketingCloudSchema } from './marketing/cloud.schema.js';

/** 5. SILO D: COMMUNICATION DOMAINS (COMMS HUB) */
import { commsHubSchema } from './comms/hub.schema.js';

/** 6. EXPERIENCE APPARATUS & NARRATIVES */
import { heroSchema } from './hero.schema.js';
import { blogPageSchema } from './blog.schema.js';
import { suiteGallerySchema } from './suite_gallery.schema.js';
import { quienesSomosSchema } from './quienes_somos.schema.js';
import { legalPageSchema } from './legal_page.schema.js';
import { notFoundSchema, maintenanceSchema, serverErrorSchema } from './not_found.schema.js';
import { aboutSectionSchema } from './about_section.schema.js';
import { historySectionSchema } from './history_section.schema.js';
import { valuePropositionSectionSchema } from './value_proposition.schema.js';
import { aiGallerySectionSchema } from './homepage.schema.js';
import { festivalPageSchema } from './festival_experience.schema.js';
import { missionVisionSchema } from './mission_vision.schema.js';
import { contactMessagesSchema } from './contact.schema.js';
import { contactPageSchema } from './contact_page.schema.js';
import { profilePageSchema } from './profile_page.schema.js';
import { libraryPageSchema } from './library_page.schema.js';
import { projectDetailsDictionarySchema } from './project_details.schema.js';

/**
 * APARATO PRINCIPAL: dictionarySchema
 * @description Único validador de frontera para el ecosistema industrial MetaShark.
 */
export const dictionarySchema = z.object({
  // --- CORE DOMAINS ---
  header: headerSchema,
  'nav-links': navLinksSchema,
  footer: footerSchema,
  system_status: systemStatusSchema,
  visitor_hud: visitorHudSchema,
  language_switcher: languageSwitcherSchema,
  auth_portal: authPortalSchema,
  portal: portalSchema,
  admin_media: adminMediaSchema,
  gamification: gamificationSchema,
  newsletter_form: newsletterFormSchema, 

  // --- SILO A: REVENUE ENGINE ---
  offers_flash: flashSalesSchema,
  offers: offersSchema,
  
  // --- SILO B: PARTNER NETWORK ---
  partner_network: partnerNetworkSchema,
  partner_form: partnerFormSchema,
  
  // --- SILO C: INTELLIGENCE & CLOUD ---
  ingestion_vault: ingestionVaultSchema,
  marketing_cloud: marketingCloudSchema,
  
  // --- SILO D: COMMS HUB ---
  comms_hub: commsHubSchema,
  
  // --- EXPERIENCE DOMAINS (The Sanctuary) ---
  hero: heroSchema,
  about: aboutSectionSchema,
  value_proposition: valuePropositionSectionSchema,
  ai_gallery_section: aiGallerySectionSchema,
  history: historySectionSchema,
  festival: festivalPageSchema,
  quienes_somos: quienesSomosSchema,
  mission_vision: missionVisionSchema,
  contact: contactMessagesSchema,
  contact_page: contactPageSchema,
  blog_page: blogPageSchema,
  suite_gallery: suiteGallerySchema,
  profile_page: profilePageSchema,
  lucide_page: libraryPageSchema,
  project_details: projectDetailsDictionarySchema,
  
  // --- SYSTEM RECOVERY & LEGAL ---
  legal: z.object({
    privacy_policy: legalPageSchema,
    terms_of_service: legalPageSchema,
  }),
  not_found: notFoundSchema,
  maintenance: maintenanceSchema,
  server_error: serverErrorSchema,
  
  // Generic Placeholders for auxiliary pages (Strictness isolation)
  homepage: z.record(z.string(), z.unknown()).optional(),
  design_system_page: z.record(z.string(), z.unknown()).optional(),
  cocreation_page: z.record(z.string(), z.unknown()).optional(),
});

/** 
 * @type Dictionary
 * @description SSoT Tipado Inyectable para todos los Server y Client Components.
 */
export type Dictionary = z.infer<typeof dictionarySchema>;