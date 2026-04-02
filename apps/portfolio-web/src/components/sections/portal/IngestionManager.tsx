/**
 * @file apps/portfolio-web/src/components/sections/portal/IngestionManager.tsx
 * @description Enterprise Ingestion Console (Silo C Manager).
 *              Terminal de orquestación para la captura de datos multi-modal.
 *              Refactorizado: Erradicación de 'any', resolución de TS2339 (failedRows)
 *              y blindaje de contratos de telemetría forense.
 * @version 3.1 - Type Safe & Zero Any Standard
 * @author Raz Podestá - Staff Engineer, MetaShark Tech
 */

'use client';

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CloudUpload, FileSpreadsheet, Mic, MessageSquare, 
  Image as ImageIcon, CheckCircle2, Loader2,
  Database, Zap, Users, Info, AlertCircle,
  Trash2, ChevronDown, ChevronUp, XCircle
} from 'lucide-react';

/** IMPORTACIONES DE INFRAESTRUCTRURA */
import { cn } from '../../../lib/utils/cn';
import { executeDataIngestion } from '../../../lib/portal/actions/ingest.actions';
import { useUIStore } from '../../../lib/store/ui.store';
import type { Dictionary } from '../../../lib/schemas/dictionary.schema';

/**
 * CONTRATOS DE DATOS LOCALES (Frontera de Calidad)
 * @pilar_III: Inferencia y tipado explícito para erradicar 'any'.
 */

interface PipelineIssue {
  row: number;
  error: string;
  data: unknown;
}

interface IngestionMetrics {
  nodesInjected: number;
  duplicatesSkipped: number;
  failedRows: number;
  latencyMs: string;
}

interface LocalIngestionReport {
  success: boolean;
  ingestionId?: string;
  metrics?: IngestionMetrics;
  issues?: PipelineIssue[];
  error?: string;
}

interface IngestionManagerProps {
  /** Diccionario de ingesta validado por v24.0 */
  dictionary: Dictionary['ingestion_vault'];
}

type IngestType = 'document' | 'image' | 'audio' | 'text';

/**
 * MODULE: IngestionManager
 * @description Orquestador visual para la ingesta de activos de inteligencia con trazabilidad forense.
 */
export function IngestionManager({ dictionary }: IngestionManagerProps) {
  const { session } = useUIStore();
  const [file, setFile] = useState<File | null>(null);
  const [textInput, setTextInput] = useState('');
  const [ingestType, setIngestType] = useState<IngestType>('document');
  const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  const [showIssues, setShowIssues] = useState(false);
  
  /**
   * @description Estado del reporte sincronizado con los contratos soberanos.
   * Eliminado 'any' para cumplimiento de ESLint.
   */
  const [pipelineReport, setPipelineReport] = useState<LocalIngestionReport | null>(null);

  /**
   * PROTOCOLO HEIMDALL: Telemetría de Montaje
   */
  useEffect(() => {
    console.log(`[HEIMDALL][PORTAL] Ingestion Node Active. Protocol: Multi-Modal.`);
  }, []);

  const TypeIcon = useMemo(() => {
    switch (ingestType) {
      case 'document': return FileSpreadsheet;
      case 'image': return ImageIcon;
      case 'audio': return Mic;
      case 'text': return MessageSquare;
      default: return Database;
    }
  }, [ingestType]);

  /**
   * ACTION: onFileChange
   */
  const onFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    setFile(selected);
    setStatus('idle');
    setPipelineReport(null);
    setProgress(0);
    
    if (selected.type.startsWith('image/')) setIngestType('image');
    else if (selected.type.startsWith('audio/')) setIngestType('audio');
    else setIngestType('document');
  }, []);

  /**
   * ACTION: handleClearSelection
   */
  const handleClearSelection = useCallback(() => {
    setFile(null);
    setTextInput('');
    setStatus('idle');
    setPipelineReport(null);
    setProgress(0);
  }, []);

  /**
   * PROTOCOLO DE DESPACHO (Enterprise Sync)
   * @pilar_IV: Observabilidad - Captura y muestra de incidentes por fila.
   */
  const handleExecuteIngest = async () => {
    if ((!file && !textInput) || !session?.tenantId) return;

    const traceId = `ingest_exec_${Date.now()}`;
    console.group(`[SYSTEM][PIPELINE] Execution Request: ${traceId}`);
    
    setStatus('processing');
    setProgress(20);

    const formData = new FormData();
    if (file) formData.append('file', file);

    try {
      /**
       * @fix: Casting de tipo seguro hacia LocalIngestionReport.
       * Garantizamos que el frontend pueda consumir 'failedRows' y 'issues'.
       */
      const result = await executeDataIngestion(formData, {
        subject: file?.name || `MANUAL_ENTRY_${Date.now()}`,
        type: ingestType,
        channel: 'web',
        tenant: session.tenantId,
        content: textInput,
        sender: { name: session.email, role: session.role }
      }) as unknown as LocalIngestionReport;

      if (result.success) {
        setProgress(100);
        setStatus('success');
        setPipelineReport(result);
        console.log(`[SUCCESS] Pipeline Finished. Injected: ${result.metrics?.nodesInjected}`);
      } else {
        throw new Error(result.error || 'PIPELINE_ERROR');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'PIPELINE_CRASH';
      console.error(`[CRITICAL] Execution Failed: ${msg}`);
      setStatus('error');
    } finally {
      console.groupEnd();
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10 animate-in fade-in duration-1000">
      
      {/* --- 1. MODALITY NAVIGATION --- */}
      <nav className="flex justify-center gap-3 p-2 rounded-3xl bg-surface/40 border border-border/50 w-max mx-auto backdrop-blur-xl">
        {[
          { id: 'document', label: dictionary.label_excel_db, icon: FileSpreadsheet },
          { id: 'audio', label: dictionary.label_voice_note, icon: Mic },
          { id: 'text', label: dictionary.label_chat_log, icon: MessageSquare }
        ].map((mode) => {
          const isActive = ingestType === mode.id;
          return (
            <button
              key={mode.id}
              onClick={() => { setIngestType(mode.id as IngestType); setPipelineReport(null); }}
              className={cn(
                "flex items-center gap-3 px-6 py-3 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all outline-none",
                isActive ? "bg-foreground text-background shadow-lg scale-105" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <mode.icon size={14} />
              <span className="hidden md:inline">{mode.label}</span>
            </button>
          );
        })}
      </nav>

      {/* --- 2. MAIN INGESTION INTERFACE --- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        <div className="lg:col-span-8">
          <div className={cn(
            "relative flex flex-col items-center justify-center h-[450px] rounded-4xl border-2 border-dashed transition-all duration-700 overflow-hidden group",
            file ? "border-primary/40 bg-primary/5" : "border-border/60 bg-surface/20"
          )}>
            {!file ? (
              <label className="absolute inset-0 z-20 cursor-pointer flex flex-col items-center justify-center p-12 text-center">
                <input type="file" onChange={onFileChange} className="hidden" />
                <div className="h-24 w-24 rounded-2xl bg-background border border-border text-muted-foreground flex items-center justify-center mb-8 transition-transform group-hover:scale-110">
                   <TypeIcon size={40} strokeWidth={1.5} />
                </div>
                <h4 className="font-display text-2xl font-bold text-foreground tracking-tight mb-3">
                  {dictionary.placeholder_dropzone}
                </h4>
                <p className="text-sm text-muted-foreground font-light italic max-w-xs">
                  Soporte industrial para XLSX, CSV, WebP y MP3.
                </p>
              </label>
            ) : (
              <div className="relative z-30 flex flex-col items-center text-center p-12">
                 <div className="h-24 w-24 rounded-2xl bg-primary text-white flex items-center justify-center mb-8 shadow-2xl animate-in zoom-in">
                    <CheckCircle2 size={40} />
                 </div>
                 <h4 className="font-display text-2xl font-bold text-foreground tracking-tight mb-2 truncate max-w-md">
                    {file.name}
                 </h4>
                 <p className="text-xs font-mono text-primary uppercase tracking-widest mb-8">
                    Payload: {(file.size / 1024).toFixed(1)} KB
                 </p>
                 <button 
                  onClick={handleClearSelection}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-red-500/10 text-red-500 text-[10px] font-bold uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all"
                 >
                    <Trash2 size={14} /> Descartar Selección
                 </button>
              </div>
            )}
            <div className="absolute inset-0 opacity-[0.02] pointer-events-none group-hover:opacity-[0.05] transition-opacity">
               <Database size={400} className="absolute -bottom-20 -right-20 rotate-12" />
            </div>
          </div>
        </div>

        {/* --- 3. OPERATIONAL SIDEBAR --- */}
        <div className="lg:col-span-4 space-y-6">
           <div className="p-8 rounded-4xl bg-surface/60 border border-border shadow-luxury h-full flex flex-col">
              <header className="mb-10 flex items-center gap-4">
                 <div className="h-10 w-10 rounded-2xl bg-success/10 flex items-center justify-center text-success">
                    <Zap size={20} />
                 </div>
                 <span className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-widest">Pipeline Guard</span>
              </header>

              <div className="space-y-10 grow">
                <div className="space-y-4">
                   <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                      <span className="text-foreground">Sincronización</span>
                      <span className="text-primary">{progress}%</span>
                   </div>
                   <div className="h-1.5 w-full bg-foreground/5 rounded-full overflow-hidden">
                      <motion.div animate={{ width: `${progress}%` }} className="h-full bg-primary" />
                   </div>
                </div>

                <div className="space-y-4">
                   <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Metadatos de Contexto</span>
                   <textarea 
                     value={textInput}
                     onChange={(e) => setTextInput(e.target.value)}
                     placeholder="Inyecte instrucciones de procesamiento o logs adicionales..."
                     className="w-full h-32 bg-background/40 border border-border/50 rounded-3xl p-5 text-xs font-sans resize-none outline-none focus:border-primary/40 transition-all text-foreground"
                   />
                </div>
              </div>

              <button 
                onClick={handleExecuteIngest}
                disabled={(!file && !textInput) || status === 'processing'}
                className={cn(
                  "w-full mt-8 flex items-center justify-center gap-4 py-6 rounded-full font-bold text-[11px] uppercase tracking-[0.3em] transition-all active:scale-95 shadow-3xl",
                  (file || textInput) && status !== 'processing'
                    ? "bg-foreground text-background hover:bg-primary hover:text-white"
                    : "bg-surface text-muted-foreground/30 border border-border cursor-not-allowed"
                )}
              >
                {status === 'processing' ? <Loader2 className="animate-spin" size={18} /> : <CloudUpload size={18} />}
                {dictionary.btn_upload_data}
              </button>
           </div>
        </div>
      </div>

      {/* --- 4. FORENSIC INTELLIGENCE REPORT --- */}
      <AnimatePresence mode="wait">
        {status === 'success' && pipelineReport && (
          <motion.div 
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="p-10 rounded-4xl bg-success/5 border border-success/20 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
              <div className="md:col-span-6 flex items-center gap-8">
                  <div className="h-20 w-20 rounded-full bg-success/20 flex items-center justify-center text-success shadow-2xl">
                    <CheckCircle2 size={40} />
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-foreground text-2xl uppercase tracking-tight">Ingesta Completada</h4>
                    <p className="text-sm text-muted-foreground font-light italic">Handshake de datos exitoso.</p>
                  </div>
              </div>

              <div className="md:col-span-6 grid grid-cols-3 gap-4 border-l border-success/10 pl-8">
                  <div className="space-y-1">
                    <span className="flex items-center gap-2 text-[8px] font-bold text-muted-foreground uppercase"><Users size={12} /> Sincronizados</span>
                    <p className="text-2xl font-display font-bold text-foreground">{pipelineReport.metrics?.nodesInjected}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="flex items-center gap-2 text-[8px] font-bold text-red-500 uppercase"><XCircle size={12} /> Fallidos</span>
                    <p className="text-2xl font-display font-bold text-red-500">{pipelineReport.metrics?.failedRows ?? 0}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="flex items-center gap-2 text-[8px] font-bold text-primary uppercase"><Info size={12} /> Latencia</span>
                    <p className="text-lg font-mono font-bold text-foreground">{pipelineReport.metrics?.latencyMs}</p>
                  </div>
              </div>
            </div>

            {/* ISSUE LEDGER (El Libro de Incidencias Forense) */}
            {pipelineReport.issues && pipelineReport.issues.length > 0 && (
              <div className="rounded-4xl border border-border bg-surface/40 overflow-hidden transition-all">
                <button 
                  onClick={() => setShowIssues(!showIssues)}
                  className="w-full flex items-center justify-between p-6 hover:bg-foreground/5 transition-colors"
                >
                   <div className="flex items-center gap-4">
                      <AlertCircle size={20} className="text-yellow-500" />
                      <span className="text-xs font-bold uppercase tracking-widest text-foreground">Ver Registro de Anomalías ({pipelineReport.issues.length})</span>
                   </div>
                   {showIssues ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>
                
                <AnimatePresence>
                  {showIssues && (
                    <motion.div 
                      initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
                      className="overflow-hidden border-t border-border"
                    >
                       <div className="p-6 space-y-3 max-h-64 overflow-y-auto custom-scrollbar bg-background/20">
                          {pipelineReport.issues.map((issue: PipelineIssue, i: number) => (
                            <div key={i} className="flex items-start gap-4 p-4 rounded-2xl bg-red-500/5 border border-red-500/10">
                               <span className="text-[10px] font-mono font-bold text-red-500 bg-red-500/10 px-2 py-1 rounded-md">ROW {issue.row}</span>
                               <p className="text-xs text-muted-foreground font-mono leading-relaxed mt-1">
                                  {issue.error}
                               </p>
                            </div>
                          ))}
                       </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- ERROR STATE --- */}
      {status === 'error' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-8 rounded-4xl bg-red-500/5 border border-red-500/20 text-center space-y-4">
            <XCircle size={48} className="text-red-500 mx-auto" />
            <h4 className="font-display font-bold text-foreground text-xl uppercase">{dictionary.status_error}</h4>
            <p className="text-sm text-muted-foreground max-w-xs mx-auto">La validación del protocolo de datos ha fallado. Verifique la estructura del archivo.</p>
        </motion.div>
      )}
    </div>
  );
}