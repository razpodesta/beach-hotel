/**
 * @file apps/portfolio-web/src/lib/schemas/index.ts
 * @description Fachada Pública Soberana del Dominio de Validación.
 *              Exporta todos los contratos Zod para garantizar una única
 *              fuente de verdad (SSoT).
 *              Refactorizado: Erradicación de extensiones .js para 
 *              alineación con la resolución "Bundler" de Next.js 15.
 * @version 2.0 - SWC Resolution Sync
 * @author Raz Podestá - MetaShark Tech
 */

export * from './about_section.schema';
export * from './blog.schema';
export * from './contact.schema';
export * from './contact_page.schema';
export * from './dictionary.schema';
export * from './festival_experience.schema';
export * from './footer.schema';
export * from './guest_experience.schema';
export * from './header.schema';
export * from './hero.schema';
export * from './history_section.schema';
export * from './homepage.schema';
export * from './hotel.schema';
export * from './language_switcher.schema';
export * from './legal_page.schema';
export * from './library_page.schema';
export * from './mission_vision.schema';
export * from './nav-links.schema';
export * from './not_found.schema';
export * from './profile_page.schema';
export * from './project_details.schema';
export * from './quienes_somos.schema';
export * from './seo.schema';
export * from './suite_gallery.schema';
export * from './system_status.schema';
export * from './value_proposition.schema';