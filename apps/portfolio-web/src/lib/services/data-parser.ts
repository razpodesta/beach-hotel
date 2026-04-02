/**
 * @file apps/portfolio-web/src/lib/services/data-parser.ts
 * @description Enterprise Data Parser Engine (Silo C Infrastructure).
 *              Orquestador de procesamiento de buffers para la ingesta masiva.
 *              Refactorizado: Auditoría de errores por fila, saneamiento 
 *              proactivo y mapeo multilingüe de cabeceras.
 * @version 3.0 - Forensic Reporting & Multilingual Mapping
 * @author Raz Podestá - Staff Engineer, MetaShark Tech
 */

import * as XLSX from 'xlsx';
import { z } from 'zod';

/**
 * CONTRATO DE NORMALIZACIÓN (SSoT)
 * @description Define la estructura mínima requerida para un nodo de audiencia.
 */
const audienceNodeSchema = z.object({
  email: z.string().email('INVALID_EMAIL_FORMAT').toLowerCase().trim(),
  name: z.string().min(2, 'NAME_TOO_SHORT').optional(),
  phone: z.string().optional(),
  source: z.string().default('bulk_import'),
});

export type AudienceNode = z.infer<typeof audienceNodeSchema>;

/**
 * @interface ParserIssue
 * @description Registro de anomalía detectada en una fila específica.
 */
export interface ParserIssue {
  row: number;
  error: string;
  data: unknown;
}

export interface ParserResult {
  success: boolean;
  data: AudienceNode[];
  issues: ParserIssue[]; // Trazabilidad forense
  metrics: {
    totalRows: number;
    validNodes: number;
    duplicatesRemoved: number;
    failedRows: number;
    latencyMs: string;
  };
  error?: string;
}

/**
 * CLASS: DataParserEngine
 * @description Motor de procesamiento de alta fidelidad para el Data Pipeline.
 */
class DataParserEngine {
  /**
   * HELPER: Extractor Tipado Multilingüe
   * @description Busca llaves alternativas en el objeto (soporte para EN, ES, PT).
   */
  private extractAndSanitize(obj: Record<string, unknown>, keys: string[]): string | undefined {
    for (const key of keys) {
      const value = obj[key];
      if (value !== undefined && value !== null) {
        // Limpieza proactiva de ruido y espacios en blanco
        const sanitized = String(value).trim().replace(/[\u200B-\u200D\uFEFF]/g, '');
        if (sanitized !== '') return sanitized;
      }
    }
    return undefined;
  }

  /**
   * MODULE: parseExcelBuffer
   * @description Transmuta un buffer binario en un inventario de nodos de audiencia.
   * @pilar_X: Performance O(n) con reporte de incidentes en tiempo real.
   */
  public async parseExcelBuffer(buffer: ArrayBuffer): Promise<ParserResult> {
    const startTime = performance.now();
    const traceId = `parser_${Date.now()}`;
    console.group(`[SYSTEM][PARSER] Data Transmutation Initiated: ${traceId}`);

    try {
      // 1. HANDSHAKE BINARIO
      const workbook = XLSX.read(buffer, { 
        type: 'array',
        cellDates: true,
        cellText: false 
      });
      
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];

      // 2. EXTRACCIÓN SANEADA (Zero Any Protocol)
      const rawData = XLSX.utils.sheet_to_json(worksheet) as Record<string, unknown>[];
      const totalRows = rawData.length;

      console.log(`[PARSER] Direct throughput: ${totalRows} entries detected.`);

      // 3. PIPELINE DE NORMALIZACIÓN, VALIDACIÓN Y AUDITORÍA
      const seenEmails = new Set<string>();
      const validNodes: AudienceNode[] = [];
      const issues: ParserIssue[] = [];
      let duplicatesCount = 0;

      // Mapeo exhaustivo de cabeceras comerciales
      const EMAIL_KEYS = ['email', 'e-mail', 'mail', 'correo', 'contacto'];
      const NAME_KEYS = ['name', 'nombre', 'nome', 'fullname', 'cliente'];
      const PHONE_KEYS = ['phone', 'tel', 'whatsapp', 'celular', 'telefone'];

      rawData.forEach((entry, index) => {
        const rowNumber = index + 2; // Offset para coincidir con el Excel (Header + 0-index)
        
        try {
          const rawNode = {
            email: this.extractAndSanitize(entry, EMAIL_KEYS),
            name: this.extractAndSanitize(entry, NAME_KEYS),
            phone: this.extractAndSanitize(entry, PHONE_KEYS),
            source: 'enterprise_bulk_ingestion'
          };

          if (!rawNode.email) {
            throw new Error('MISSING_MANDATORY_EMAIL');
          }

          // Validación atómica Zod
          const validated = audienceNodeSchema.parse(rawNode);

          // Deduplicación inteligente
          if (seenEmails.has(validated.email)) {
            duplicatesCount++;
            return;
          }

          seenEmails.add(validated.email);
          validNodes.push(validated);

        } catch (err: unknown) {
          const msg = err instanceof z.ZodError 
            ? err.issues.map(i => i.message).join(', ') 
            : (err as Error).message;
            
          issues.push({
            row: rowNumber,
            error: msg,
            data: entry
          });
        }
      });

      const endTime = performance.now();
      const latency = (endTime - startTime).toFixed(2);

      console.log(`[SUCCESS] Transmutation Concluded. Issues: ${issues.length}`);
      
      return {
        success: true,
        data: validNodes,
        issues,
        metrics: {
          totalRows,
          validNodes: validNodes.length,
          duplicatesRemoved: duplicatesCount,
          failedRows: issues.length,
          latencyMs: `${latency}ms`
        }
      };

    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'BINARY_STREAM_CORRUPTION';
      console.error(`[CRITICAL][PARSER] Pipeline Aborted: ${msg}`);
      
      return {
        success: false,
        data: [],
        issues: [],
        metrics: { totalRows: 0, validNodes: 0, duplicatesRemoved: 0, failedRows: 0, latencyMs: '0ms' },
        error: msg
      };
    } finally {
      console.groupEnd();
    }
  }

  /**
   * MODULE: sanitizeField
   * @description Purga caracteres peligrosos de strings desconocidos.
   */
  public sanitize(value: unknown): string {
    if (typeof value !== 'string') return '';
    return value.trim().replace(/[<>"{}$%]/g, '');
  }
}

export const dataParser = new DataParserEngine();