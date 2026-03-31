/**
 * @file ingestion.schema.ts
 * @description Contrato de validación para el Hub de Ingesta Multi-Modal.
 *              Valida estados de procesamiento, tipos de canal y feedback de carga.
 * @version 1.0 - Multi-Format Ingestion Standard
 */

import { z } from 'zod';

export const ingestionVaultSchema = z.object({
  title: z.string().min(1),
  subtitle: z.string().min(1),
  
  // Canales de Entrada
  channel_web: z.string().min(1),
  channel_whatsapp: z.string().min(1),
  channel_email: z.string().min(1),
  
  // Estados del Procesamiento
  status_pending: z.string().min(1),
  status_processing: z.string().min(1),
  status_success: z.string().min(1),
  status_error: z.string().min(1),
  status_ai_analysis: z.string().min(1),

  // Acciones y Etiquetas
  btn_upload_data: z.string().min(1),
  btn_cancel_ingest: z.string().min(1),
  label_voice_note: z.string().min(1),
  label_excel_db: z.string().min(1),
  label_chat_log: z.string().min(1),
  placeholder_dropzone: z.string().min(1),
  success_msg: z.string().min(1),
});

export type IngestionDictionary = z.infer<typeof ingestionVaultSchema>;