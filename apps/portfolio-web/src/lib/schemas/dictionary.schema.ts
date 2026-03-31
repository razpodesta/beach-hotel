/**
 * @file apps/portfolio-web/src/lib/schemas/dictionary.schema.ts
 * @description Master SSoT (Single Source of Truth) - Enterprise Level 4.0.
 *              Orquesta la validación atómica de los Silos Operativos (A, B, C, D).
 *              Refactorizado: Resolución de TS2307, TS6133 y TS5097 mediante 
 *              importaciones ESM estrictas (.js) para compatibilidad SWC/Vercel.
 * @version 27.0 - Strict ESM Resolution Standard
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

/** 3. SILO B: PARTNER NETWORK (B2B) */
import { partnerNetworkSchema } from './partners/network.schema.js';

/** 4. SILO C: INTELLIGENCE & MARKETING CLOUD */
import { ingestionVaultSchema } from './marketing/ingestion.schema.js';
// @fix TS5097: Extensión corregida a .js para resolución nativa
import { marketingCloudSchema } from './marketing/cloud.schema.js';

/** 5. SILO D: COMMUNICATION DOMAINS (COMMS HUB) */
// @fix TS5097: Extensión corregida a .js para resolución nativa
import { commsHubSchema } from './comms/hub.schema.js';

/** 6. EXPERIENCE APPARATUS */
import { heroSchema } from './hero.schema.js';
import { blogPageSchema } from './blog.schema.js';
import { suiteGallerySchema } from './suite_gallery.schema.js';
import { quienesSomosSchema } from './quienes_somos.schema.js';
import { legalPageSchema } from './legal_page.schema.js';
import { notFoundSchema, maintenanceSchema, serverErrorSchema } from './not_found.schema.js';

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
  
  // --- SILO B: PARTNER NETWORK ---
  partner_network: partnerNetworkSchema,
  
  // --- SILO C: INTELLIGENCE & CLOUD ---
  ingestion_vault: ingestionVaultSchema,
  marketing_cloud: marketingCloudSchema,
  
  // --- SILO D: COMMS HUB ---
  comms_hub: commsHubSchema,
  
  // --- EXPERIENCE DOMAINS ---
  hero: heroSchema,
  blog_page: blogPageSchema,
  suite_gallery: suiteGallerySchema,
  quienes_somos: quienesSomosSchema,
  
  // --- SYSTEM RECOVERY ---
  legal: z.object({
    privacy_policy: legalPageSchema,
    terms_of_service: legalPageSchema,
  }),
  not_found: notFoundSchema,
  maintenance: maintenanceSchema,
  server_error: serverErrorSchema,
  
  // Legacy support placeholders (Ready for purge)
  homepage: z.record(z.string(), z.unknown()).optional(),
  about: z.record(z.string(), z.unknown()).optional(),
  history: z.record(z.string(), z.unknown()).optional(),
  value_proposition: z.record(z.string(), z.unknown()).optional(),
});

export type Dictionary = z.infer<typeof dictionarySchema>;