/**
 * @file admin_media.schema.ts
 * @description Contrato soberano para la gestión de activos en el Dashboard.
 *              Refactorizado: Inyección de etiquetas de filtrado y estados vacíos.
 * @version 3.0 - Full i18n Orchestration
 * @author Raz Podestá - MetaShark Tech
 */

import { z } from 'zod';

export const adminMediaSchema = z.object({
  title: z.string().min(1),
  dropzone_prompt: z.string().min(1),
  dropzone_subtext: z.string().min(1),
  label_alt_text: z.string().min(1),
  placeholder_alt_text: z.string().min(1),
  btn_upload: z.string().min(1),
  status_uploading: z.string().min(1),
  status_success: z.string().min(1),
  status_error: z.string().min(1),
  label_dimensions: z.string().min(1),
  label_file_size: z.string().min(1),
  label_sync_cloud: z.string().min(1),
  
  // --- SEGURIDAD: SAFE-DELETE SHIELD ---
  confirm_delete_title: z.string().min(1),
  confirm_delete_cta: z.string().min(1),
  cancel_cta: z.string().min(1),

  // --- FILTRADO: MIME TYPES ---
  filter_all: z.string().min(1),
  filter_images: z.string().min(1),
  filter_videos: z.string().min(1),

  // --- ESTADOS: EMPTY STATES ---
  empty_state_title: z.string().min(1),
  label_copy: z.string().min(1),
  label_view: z.string().min(1),
  label_delete: z.string().min(1),
});

export type AdminMediaDictionary = z.infer<typeof adminMediaSchema>;