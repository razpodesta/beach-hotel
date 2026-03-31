/**
 * @file apps/portfolio-web/src/lib/services/data-parser.ts
 * @description Enterprise Data Parser Engine (Silo C Infrastructure).
 *              Orquestador de procesamiento de buffers para la ingesta masiva.
 *              Implementa normalización forense, deduplicación inteligente,
 *              erradicación total de 'any' y extracción tipada.
 * @version 2.0 - Zero Any & Strict Type Extraction
 * @author Staff Engineer - MetaShark Tech
 */

import * as XLSX from 'xlsx';
import { z } from 'zod';

/**
 * CONTRATO DE NORMALIZACIÓN (SSoT)
 * @description Define la estructura mínima requerida para un nodo de audiencia.
 */
const audienceNodeSchema = z.object({
  email: z.string().email().toLowerCase().trim(),
  name: z.string().min(2).optional(),
  phone: z.string().optional(),
  source: z.string().default('bulk_import'),
});

export type AudienceNode = z.infer<typeof audienceNodeSchema>;

export interface ParserResult {
  success: boolean;
  data: AudienceNode[];
  metrics: {
    totalRows: number;
    validNodes: number;
    duplicatesRemoved: number;
    latencyMs: string;
  };
  error?: string;
}

/**
 * HELPER: Extractor Tipado Dinámico
 * @description Busca llaves alternativas en un objeto desconocido y retorna su valor como string.
 * @pilar III: Seguridad de Tipos (Sustituye al uso de 'any').
 */
const extractString = (obj: Record<string, unknown>, keys: string[]): string | undefined => {
  for (const key of keys) {
    const value = obj[key];
    if (value !== undefined && value !== null && String(value).trim() !== '') {
      return String(value).trim();
    }
  }
  return undefined;
};

/**
 * CLASS: DataParserEngine
 * @description Motor de procesamiento de alta fidelidad para el Data Pipeline.
 */
class DataParserEngine {
  /**
   * MODULE: parseExcelBuffer
   * @description Procesa un buffer de Excel y lo transforma en un inventario de contactos.
   * @pilar X: Performance - Procesamiento O(n) con deduplicación en memoria.
   */
  public async parseExcelBuffer(buffer: ArrayBuffer): Promise<ParserResult> {
    const startTime = performance.now();
    const traceId = `parser_${Date.now()}`;
    console.group(`[SYSTEM][PARSER] Data Transmutation Initiated: ${traceId}`);

    try {
      // 1. LECTURA DE STREAM (Sovereign Buffer Handshake)
      const workbook = XLSX.read(buffer, { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];

      // 2. EXTRACCIÓN SANEADA (Zero Any Protocol)
      const rawData = XLSX.utils.sheet_to_json(worksheet) as Record<string, unknown>[];
      const totalRows = rawData.length;

      console.log(`[PARSER] Raw throughput detected: ${totalRows} entries.`);

      // 3. PIPELINE DE NORMALIZACIÓN Y DEDUPLICACIÓN
      const seenEmails = new Set<string>();
      const validNodes: AudienceNode[] = [];
      let duplicatesCount = 0;

      for (const entry of rawData) {
        try {
          // Mapeo dinámico seguro utilizando el extractor tipado
          const nodeData = {
            email: extractString(entry, ['email', 'Email', 'EMAIL', 'correo', 'MAIL']),
            name: extractString(entry, ['name', 'nombre', 'FullName', 'Nome']),
            phone: extractString(entry, ['phone', 'tel', 'whatsapp', 'Telefone']),
            source: extractString(entry, ['source', 'Origen']) || 'enterprise_bulk_sync'
          };

          // Si no hay email, descartamos silenciosamente la fila
          if (!nodeData.email) continue;

          // Validación Atómica contra el Contrato Zod
          const validatedNode = audienceNodeSchema.parse(nodeData);

          // Deduplicación Inteligente en memoria
          if (seenEmails.has(validatedNode.email)) {
            duplicatesCount++;
            continue;
          }

          seenEmails.add(validatedNode.email);
          validNodes.push(validatedNode);
        } catch {
          // Ignoramos filas corruptas para mantener el rendimiento del pipeline
          continue;
        }
      }

      const endTime = performance.now();
      const latency = (endTime - startTime).toFixed(2);

      console.log(`[SUCCESS] Transmutation Complete. Throughput: ${validNodes.length} nodes/batch.`);
      
      return {
        success: true,
        data: validNodes,
        metrics: {
          totalRows,
          validNodes: validNodes.length,
          duplicatesRemoved: duplicatesCount,
          latencyMs: `${latency}ms`
        }
      };

    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'BINARY_CORRUPTION_DETECTED';
      console.error(`[CRITICAL][PARSER] Transmutation Aborted: ${msg}`);
      
      return {
        success: false,
        data: [],
        metrics: { totalRows: 0, validNodes: 0, duplicatesRemoved: 0, latencyMs: '0ms' },
        error: msg
      };
    } finally {
      console.groupEnd();
    }
  }

  /**
   * HELPER: Sanitación de Ruido
   * @description Limpia caracteres peligrosos de una cadena de entrada.
   * @fix ESLint: Reemplazo de 'any' por 'unknown' con validación estricta.
   */
  public sanitizeField(value: unknown): string {
    if (value === undefined || value === null) return '';
    return String(value).trim().replace(/[<>"{}]/g, '');
  }
}

/**
 * INSTANCIA SOBERANA (Singleton)
 * @description Exportación del motor para su consumo en las Server Actions de Ingesta.
 */
export const dataParser = new DataParserEngine();