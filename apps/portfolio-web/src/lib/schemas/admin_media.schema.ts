/**
 * @file admin_media.schema.ts
 * @description Contrato soberano para la gestión de activos en el Dashboard.
 *              Valida las etiquetas del uploader y el feedback del cluster S3.
 * @version 1.0 - Media Ops Standard
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
});

export type AdminMediaDictionary = z.infer<typeof adminMediaSchema>;