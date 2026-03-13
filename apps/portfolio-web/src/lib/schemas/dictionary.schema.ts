/**
 * @file apps/portfolio-web/src/lib/schemas/dictionary.schema.ts
 * @version 30.0 - Resolución Determinista Corregida
 * @description Se eliminan las extensiones .js de las importaciones para permitir
 *              que el resolvedor de módulos de 'bundler' gestione la extensión .ts nativa.
 */

import { z } from 'zod';
import { headerSchema } from './header.schema';
import { navLinksSchema } from './nav-links.schema';
import { footerSchema } from './footer.schema';
import { languageSwitcherSchema } from './language_switcher.schema';
import { notFoundSchema, serverErrorSchema, maintenanceSchema } from './not_found.schema';
import { missionVisionSchema } from './mission_vision.schema';
import { blogPageSchema } from './blog.schema';
import { homepageSchema } from './homepage.schema';
import { contactPageSchema } from './contact_page.schema';
import { legalPageSchema } from './legal_page.schema';
import { projectDetailsDictionarySchema } from './project_details.schema';
import { quienesSomosSchema } from './quienes_somos.schema';
import { libraryPageSchema } from './library_page.schema';
import { systemStatusSchema } from './system_status.schema';

export const dictionarySchema = z.object({
  header: headerSchema,
  'nav-links': navLinksSchema,
  footer: footerSchema,
  language_switcher: languageSwitcherSchema,
  homepage: homepageSchema,
  mission_vision: missionVisionSchema,
  quienes_somos: quienesSomosSchema,
  blog_page: blogPageSchema,
  contact_page: contactPageSchema,
  legal: z.object({
    privacy_policy: legalPageSchema,
    terms_of_service: legalPageSchema
  }),
  project_details: projectDetailsDictionarySchema,
  technologies_page: libraryPageSchema,
  lucide_page: libraryPageSchema,
  system_status: systemStatusSchema,
  visitor_hud: z.object({
    label_visitor_info: z.string(),
    label_ip_visitor: z.string(),
    footer_credits: z.string(),
    status_calibrating: z.string(),
    status_error: z.string(),
    label_location: z.string(),
    label_weather: z.string(),
    weather_sunny: z.string(),
    weather_rainy: z.string(),
    weather_cloudy: z.string(),
    label_time: z.string(),
    coords_format: z.string(),
  }),
  not_found: notFoundSchema,
  server_error: serverErrorSchema,
  maintenance: maintenanceSchema,
});

export type Dictionary = z.infer<typeof dictionarySchema>;