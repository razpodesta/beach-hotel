/**
 * @file apps/portfolio-web/src/lib/services/data-parser.ts
 * @description Enterprise Data Parser Engine (Silo C Infrastructure).
 *              Orquestador de procesamiento de buffers para la ingesta masiva.
 *              Refactorizado: Resolución de error ESLint no-control-regex,
 *              normalización de printables vía Unicode y blindaje de tipos.
 * @version 4.1 - Linter Pure & Modern Unicode Sync
 * @author Raz Podestá - Staff Engineer, MetaShark Tech
 */

import * as XLSX from 'xlsx';
import { z } from 'zod';

/**
 * CONTRATO DE NORMALIZACIÓN (SSoT)
 * @description Define la integridad mínima requerida para un nodo de audiencia.
 */
const audienceNodeSchema = z.object({
  email: z.string().email('INVALID_EMAIL_FORMAT').toLowerCase().trim(),
  name: z.string().min(2, 'NAME_TOO_SHORT').optional(),
  phone: z.string().optional(),
  source: z.string().default('bulk_import'),
});

/**
 * @type AudienceNode
 * @description Inferencia obligatoria desde el contrato soberano.
 */
export type AudienceNode = z.infer<typeof audienceNodeSchema>;

/**
 * @interface ParserIssue
 * @description Registro detallado de anomalía para el Ledger de Ingesta.
 */
export interface ParserIssue {
  row: number;
  error: string;
  data: unknown;
}

/**
 * @interface ParserResult
 * @description Contrato de salida del motor de transmutación.
 */
export interface ParserResult {
  success: boolean;
  data: AudienceNode[];
  issues: ParserIssue[];
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
   * HELPER: Deep Sanitize
   * @description Purga caracteres de control y basura visual que corrompen la DB.
   * @fix: Resolución de ESLint no-control-regex mediante Unicode Property Escapes.
   */
  private sanitize(value: unknown): string | undefined {
    if (typeof value !== 'string' && typeof value !== 'number') return undefined;
    const str = String(value).trim();
    
    /**
     * MOTOR DE LIMPIEZA UNICODE:
     * \p{Cc}: Coincide con caracteres de control (equivalente a [\x00-\x1F\x7F-\x9F]).
     * El flag 'u' es obligatorio para usar propiedades de caracteres Unicode.
     */
    return str
      .replace(/\p{Cc}/gu, "") 
      .replace(/[<>"{}$%]/g, '')
      .substring(0, 255);
  }

  /**
   * HELPER: Phone Normalizer
   * @description Estandariza números para integración con Silos de Mensajería.
   */
  private normalizePhone(val: unknown): string | undefined {
    const sanitized = this.sanitize(val);
    if (!sanitized) return undefined;
    // Conserva únicamente la estructura numérica y el prefijo internacional
    return sanitized.replace(/[^\d+]/g, '');
  }

  /**
   * HELPER: Extractor Tipado Multilingüe
   * @description Mapea cabeceras dinámicas hacia el contrato canónico.
   */
  private extractField(obj: Record<string, unknown>, keys: string[]): string | undefined {
    const matchedKey = keys.find(k => k.toLowerCase() in obj || k.toUpperCase() in obj || k in obj);
    return matchedKey ? this.sanitize(obj[matchedKey]) : undefined;
  }

  /**
   * MODULE: parseExcelBuffer
   * @description Transmuta un buffer binario en un inventario de nodos de audiencia.
   * @pilar_X: Performance - Optimizado para entornos Serverless (Zero Any Protocol).
   */
  public async parseExcelBuffer(buffer: ArrayBuffer, traceId?: string): Promise<ParserResult> {
    const startTime = performance.now();
    const currentTrace = traceId || `parser_${Date.now()}`;
    
    console.group(`[HEIMDALL][PARSER] Data Transmutation: ${currentTrace}`);

    try {
      // 1. HANDSHAKE BINARIO (Configuración de bajo consumo)
      const workbook = XLSX.read(buffer, { 
        type: 'array',
        cellDates: true,
        cellNF: false,
        cellText: false 
      });
      
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      if (!sheet) throw new Error('EMPTY_WORKBOOK_STRUCTURE');

      // 2. EXTRACCIÓN SANEADA
      const rawData = XLSX.utils.sheet_to_json(sheet, { defval: null }) as Record<string, unknown>[];
      const totalRows = rawData.length;

      // 3. PIPELINE DE NORMALIZACIÓN Y AUDITORÍA
      const seenEmails = new Set<string>();
      const validNodes: AudienceNode[] = [];
      const issues: ParserIssue[] = [];
      let duplicatesCount = 0;

      // Diccionario de cabeceras industriales mapeadas
      const MAP = {
        EMAIL: ['email', 'e-mail', 'mail', 'correo', 'contacto', 'contato'],
        NAME: ['name', 'nombre', 'nome', 'fullname', 'cliente'],
        PHONE: ['phone', 'tel', 'whatsapp', 'celular', 'telefone']
      };

      rawData.forEach((entry, index) => {
        const rowNumber = index + 2; // Offset (Header + 1)
        
        try {
          const rawNode = {
            email: this.extractField(entry, MAP.EMAIL),
            name: this.extractField(entry, MAP.NAME),
            phone: this.normalizePhone(this.extractField(entry, MAP.PHONE)),
            source: 'enterprise_bulk_ingestion'
          };

          if (!rawNode.email) throw new Error('MISSING_MANDATORY_EMAIL_NODE');

          // Validación atómica Zod
          const validated = audienceNodeSchema.parse(rawNode);

          // Deduplicación en buffer de memoria O(1)
          if (seenEmails.has(validated.email)) {
            duplicatesCount++;
            return;
          }

          seenEmails.add(validated.email);
          validNodes.push(validated);

        } catch (err: unknown) {
          const msg = err instanceof z.ZodError 
            ? err.issues.map(i => `${i.path}: ${i.message}`).join(' | ') 
            : (err as Error).message;
            
          issues.push({
            row: rowNumber,
            error: msg,
            data: entry
          });
        }
      });

      const totalLatency = (performance.now() - startTime).toFixed(2);
      console.log(`[SUCCESS] Pipeline Synchronized. Valid: ${validNodes.length} | Latency: ${totalLatency}ms`);
      
      return {
        success: true,
        data: validNodes,
        issues,
        metrics: {
          totalRows,
          validNodes: validNodes.length,
          duplicatesRemoved: duplicatesCount,
          failedRows: issues.length,
          latencyMs: `${totalLatency}ms`
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
}

export const dataParser = new DataParserEngine();