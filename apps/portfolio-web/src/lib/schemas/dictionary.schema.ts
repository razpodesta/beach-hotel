/**
 * @file apps/portfolio-web/src/lib/schemas/dictionary.schema.ts
 * @description Master SSoT (Single Source of Truth) - Enterprise Level 5.0.
 *              Orquesta la validación atómica de los Silos Operativos y Dominios.
 *              Refactorizado: Sincronización con las versiones niveladas de los 
 *              sub-esquemas (About v3, AdminMedia v3, AI Synth v7, Suites v6).
 * 
 * @version 31.0 - SSoT Type-Safe Final Seal
 * @author Staff Engineer - MetaShark Tech
 * 
 * @pilar III: Seguridad de Tipos - Inferencia obligatoria desde contratos de Silo.
 * @pilar IX: Desacoplamiento - Resolución de dependencias mediante contratos Zod.
 */

import { z } from 'zod';

/** 1. CORE INFRASTRUCTURE SCHEMAS */
import { headerSchema } from './header.schema';
import { navLinksSchema } from './nav-links.schema';
import { footerSchema } from './footer.schema';
import { newsletterFormSchema } from './newsletter_form.schema';
import { systemStatusSchema } from './system_status.schema';
import { visitorHudSchema } from './visitor_hud.schema';
import { languageSwitcherSchema } from './language_switcher.schema';
import { portalSchema } from './portal.schema';
import { adminMediaSchema } from './admin_media.schema'; // Nivelado v3.0
import { gamificationSchema } from './gamification.schema';

/** 2. EXTERNAL SOVEREIGN SCHEMAS (Library Driven) */
import { identityDictionarySchema } from '@metashark/identity-gateway';

/** 3. SILO A: REVENUE & SALES ENGINE */
import { flashSalesSchema } from './offers/flash_sales.schema';
import { offersSchema } from './offers.schema';

/** 4. SILO B: PARTNER NETWORK (B2B) */
import { partnerNetworkSchema } from './partners/network.schema';
import { partnerFormSchema } from './partners/registration_form.schema';

/** 5. SILO C: INTELLIGENCE & MARKETING CLOUD */
import { ingestionVaultSchema } from './marketing/ingestion.schema';
import { marketingCloudSchema } from './marketing/cloud.schema';

/** 6. SILO D: COMMUNICATION DOMAINS (COMMS HUB) */
import { commsHubSchema } from './comms/hub.schema';

/** 7. EXPERIENCE APPARATUS & NARRATIVES */
import { heroSchema } from './hero.schema';
import { blogPageSchema } from './blog.schema';
import { suiteGallerySchema } from './suite_gallery.schema'; // Nivelado v6.0
import { quienesSomosSchema } from './quienes_somos.schema';
import { legalPageSchema } from './legal_page.schema';
import { notFoundSchema, maintenanceSchema, serverErrorSchema } from './not_found.schema';
import { aboutSectionSchema } from './about_section.schema'; // Nivelado v3.0
import { historySectionSchema } from './history_section.schema';
import { valuePropositionSectionSchema } from './value_proposition.schema';
import { aiGallerySectionSchema } from './homepage.schema'; // Nivelado v7.0
import { festivalPageSchema } from './festival_experience.schema';
import { missionVisionSchema } from './mission_vision.schema';
import { contactMessagesSchema } from './contact.schema';
import { contactPageSchema } from './contact_page.schema';
import { profilePageSchema } from './profile_page.schema';
import { libraryPageSchema } from './library_page.schema';
import { projectDetailsDictionarySchema } from './project_details.schema';

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
  portal: portalSchema,
  admin_media: adminMediaSchema, // Sync: Confirm Delete, MIME Filters & Empty States.
  gamification: gamificationSchema,
  newsletter_form: newsletterFormSchema, 

  // --- IDENTITY & ACCESS (Library Driven) ---
  auth_portal: identityDictionarySchema,

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
  about: aboutSectionSchema, // Sync: image_url support.
  value_proposition: valuePropositionSectionSchema,
  ai_gallery_section: aiGallerySectionSchema, // Sync: items_metadata Mapping logic.
  history: historySectionSchema,
  festival: festivalPageSchema,
  quienes_somos: quienesSomosSchema,
  mission_vision: missionVisionSchema,
  contact: contactMessagesSchema,
  contact_page: contactPageSchema,
  blog_page: blogPageSchema,
  suite_gallery: suiteGallerySchema, // Sync: Dynamic category_filters.
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
  
  // Generic Placeholders (Strictness isolation)
  homepage: z.record(z.string(), z.unknown()).optional(),
  design_system_page: z.record(z.string(), z.unknown()).optional(),
  cocreation_page: z.record(z.string(), z.unknown()).optional(),
});

/** 
 * @type Dictionary
 * @description SSoT Tipado Inyectable para todos los Server y Client Components.
 */
export type Dictionary = z.infer<typeof dictionarySchema>;