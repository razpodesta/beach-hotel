// RUTA: apps/portfolio-web/src/lib/schemas/library_page.schema.ts
// VERSIÓN: 4.0 - Sincronización Total
import { z } from 'zod';

export const libraryPageSchema = z.object({
  page_title: z.string(),
  page_description: z.string(),
  header_title: z.string(),
  header_subtitle: z.string(),
  search_placeholder: z.string(),

  // --- INICIO DE LA UNIFICACIÓN SEMÁNTICA FINAL ---
  load_more_button: z.string(),
  showing_results: z.string(),
  // --- FIN DE LA UNIFICACIÓN SEMÁNTICA FINAL ---

  visit_official: z.string(),
  copy_import: z.string(),
  view_details: z.string(),
  modal_install_title: z.string(),
  modal_usage_title: z.string(),
  modal_close: z.string(),
  scroll_top: z.string(),
  scroll_bottom: z.string(),
  library_help_btn: z.string(),
  library_help_title: z.string(),
  library_help_desc: z.string(),
  btn_docs: z.string(),
  btn_repo: z.string(),
  category_all: z.string(),
});
