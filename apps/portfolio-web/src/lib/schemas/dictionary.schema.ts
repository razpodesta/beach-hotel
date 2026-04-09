/**
 * @file apps/portfolio-web/src/lib/schemas/dictionary.schema.ts
 * @description Master SSoT (Single Source of Truth) - Enterprise Level 5.0.
 *              Orquesta la validación atómica de los Silos Operativos y Dominios.
 *              Refactorizado: Integración del Gateway de Identidad Autónomo y
 *              resolución de dependencias cruzadas mediante alias de librería.
 *              Garantiza que el script de pre-build (MACS) valide la integridad 
 *              de los JSONs frente a los contratos de las librerías externas.
 * @version 30.0 - Identity Gateway Library Integration (SSoT Sealed)
 * @author Staff Engineer - MetaShark Tech
 */

import { z } from 'zod';

/** 1. CORE INFRASTRUCTURE SCHEMAS (Locales) */
import { headerSchema } from './header.schema';
import { navLinksSchema } from './nav-links.schema';
import { footerSchema } from './footer.schema';
import { newsletterFormSchema } from './newsletter_form.schema';
import { systemStatusSchema } from './system_status.schema';
import { visitorHudSchema } from './visitor_hud.schema';
import { languageSwitcherSchema } from './language_switcher.schema';
import { portalSchema } from './portal.schema';
import { adminMediaSchema } from './admin_media.schema';
import { gamificationSchema } from './gamification.schema';

/** 
 * 2. EXTERNAL SOVEREIGN SCHEMAS (Library Driven)
 * @pilar IX: Desacoplamiento total. El contrato de identidad es dictado
 * por la librería autónoma @metashark/identity-gateway.
 */
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
import { suiteGallerySchema } from './suite_gallery.schema';
import { quienesSomosSchema } from './quienes_somos.schema';
import { legalPageSchema } from './legal_page.schema';
import { notFoundSchema, maintenanceSchema, serverErrorSchema } from './not_found.schema';
import { aboutSectionSchema } from './about_section.schema';
import { historySectionSchema } from './history_section.schema';
import { valuePropositionSectionSchema } from './value_proposition.schema';
import { aiGallerySectionSchema } from './homepage.schema';
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
 * @pilar III: Inferencia obligatoria desde contratos de librería.
 * @pilar VI: i18n Nativa - Erradicación de Hardcoding.
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
  admin_media: adminMediaSchema,
  gamification: gamificationSchema,
  newsletter_form: newsletterFormSchema, 

  // --- IDENTITY & ACCESS (Library Driven) ---
  /** 
   * @fix: Consumo directo del esquema de la librería. 
   * Cualquier cambio en @metashark/identity-gateway invalidará 
   * automáticamente el build si los JSONs no se actualizan.
   */
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