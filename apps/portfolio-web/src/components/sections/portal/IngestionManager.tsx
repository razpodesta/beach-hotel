/**
 * @file apps/portfolio-web/src/components/sections/portal/IngestionManager.tsx
 * @description Enterprise Ingestion Console (Silo C Manager).
 *              Terminal de orquestación para la captura de datos multi-modal.
 *              Refactorizado: Resolución de TS2304 (Handlers missing),
 *              unificación de lógica de despacho, limpieza de variables huérfanas
 *              y nivelación de tokens Tailwind v4.
 * @version 4.1 - Handlers Synced & Linter Pure
 * @author Staff Engineer - MetaShark Tech
 */

'use client';

import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CloudUpload, FileSpreadsheet, Mic, MessageSquare, 
  CheckCircle2, Loader2,
  Database, Zap, Users, AlertCircle,
  Trash2, ChevronDown, ChevronUp, XCircle,
  Clock, Share2, Activity, Cpu
} from 'lucide-react';

/** IMPORTACIONES DE INFRAESTRUCTRURA */
import { cn } from '../../../lib/utils/cn';
import { executeDataIngestion } from '../../../lib/portal/actions/ingest.actions';
import { useUIStore } from '../../../lib/store/ui.store';
import type { Dictionary } from '../../../lib/schemas/dictionary.schema';

/**
 * CONTRATOS DE DATOS SOBERANOS (SSoT)
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
  throughputKbps?: number;
}

interface LocalIngestionReport {
  success: boolean;
  ingestionId?: string;
  metrics?: IngestionMetrics;
  issues?: PipelineIssue[];
  error?: string;
  traceId: string;
}

interface IngestionManagerProps {
  /** Diccionario de ingesta validado por el Master Schema v28.1 */
  dictionary: Dictionary['ingestion_vault'];
}

type IngestType = 'document' | 'image' | 'audio' | 'text';

/**
 * APARATO: IngestionManager
 * @description Orquestador de baja latencia para la ingesta de activos de inteligencia.
 */
export function IngestionManager({ dictionary }: IngestionManagerProps) {
  const { session } = useUIStore();
  const [file, setFile] = useState<File | null>(null);
  const [textInput, setTextInput] = useState('');
  const [ingestType, setIngestType] = useState<IngestType>('document');
  const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  const [showIssues, setShowIssues] = useState(false);
  const [pipelineReport, setPipelineReport] = useState<LocalIngestionReport | null>(null);
  
  const previewUrlRef = useRef<string | null>(null);

  /**
   * PROTOCOLO HEIMDALL: Telemetría de Montaje
   */
  useEffect(() => {
    const handshakeId = `hsk_${Date.now().toString(36)}`;
    console.log(`%c🛡️ [DNA][INGEST] Node Active | ID: ${handshakeId}`, 'color: #a855f7; font-weight: bold');
    
    return () => {
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    };
  }, []);

  /**
   * MEMOIZACIÓN SENSORIAL: TypeIcon Resolver
   */
  const TypeIcon = useMemo(() => {
    const map = {
      document: FileSpreadsheet,
      image: Activity,
      audio: Mic,
      text: MessageSquare
    };
    return map[ingestType] || Database;
  }, [ingestType]);

  /**
   * ACTION: handleClearSelection
   * @fix TS2304: Definición de lógica de limpieza desaparecida.
   */
  const handleClearSelection = useCallback(() => {
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    setFile(null);
    setTextInput('');
    setStatus('idle');
    setPipelineReport(null);
    setProgress(0);
  }, []);

  /**
   * ACTION: onFileChange
   */
  const onFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);

    setFile(selected);
    setStatus('idle');
    setPipelineReport(null);
    setProgress(0);
    
    if (selected.type.startsWith('image/')) {
      setIngestType('image');
      previewUrlRef.current = URL.createObjectURL(selected);
    } else if (selected.type.startsWith('audio/')) {
      setIngestType('audio');
    } else {
      setIngestType('document');
    }
  }, []);

  /**
   * ACTION: handleExecuteMission (The Sovereign Dispatch)
   * @fix TS2304: Unificación de nombres. handleExecuteIngest -> handleExecuteMission.
   * @description Orquesta la transmutación de datos con trazabilidad forense.
   */
  const handleExecuteMission = async () => {
    if ((!file && !textInput) || !session?.tenantId) return;

    const traceId = `trace_ingest_${Date.now().toString(36).toUpperCase()}`;
    const startTime = performance.now();

    console.group(`%c🚀 [HEIMDALL][PIPELINE] Execution: ${traceId}`, 'color: #3b82f6; font-weight: bold');
    
    setStatus('processing');
    setProgress(15);

    const formData = new FormData();
    if (file) formData.append('file', file);

    try {
      const result = await executeDataIngestion(formData, {
        subject: file?.name || `MANUAL_ENTRY_${Date.now()}`,
        type: ingestType,
        channel: 'web',
        tenant: session.tenantId,
        content: textInput,
        traceId,
        sender: { email: session.email, role: session.role }
      }) as unknown as LocalIngestionReport;

      const endTime = performance.now();
      const latency = (endTime - startTime).toFixed(2);

      if (result.success) {
        setProgress(100);
        setStatus('success');
        setPipelineReport({ ...result, traceId });
        
        console.log(`%c✓ [SUCCESS] Injected: ${result.metrics?.nodesInjected} | Latency: ${latency}ms`, 'color: #22c55e');
      } else {
        throw new Error(result.error || 'PIPELINE_DRIFT');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'UNEXPECTED_PIPELINE_CRASH';
      console.error(`%c✕ [CRITICAL] Pipeline Aborted: ${msg}`, 'color: #ef4444');
      setStatus('error');
    } finally {
      console.groupEnd();
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in duration-1000">
      
      {/* --- 1. MODALITY NAV (Oxygen Glass Design) --- */}
      <nav className="flex justify-center gap-4 p-2.5 rounded-4xl bg-surface/40 border border-border/50 w-max mx-auto backdrop-blur-2xl shadow-luxury">
        {[
          { id: 'document', label: dictionary.label_excel_db, icon: FileSpreadsheet, color: 'text-primary' },
          { id: 'audio', label: dictionary.label_voice_note, icon: Mic, color: 'text-blue-400' },
          { id: 'text', label: dictionary.label_chat_log, icon: MessageSquare, color: 'text-emerald-400' }
        ].map((mode) => {
          const isActive = ingestType === mode.id;
          return (
            <button
              key={mode.id}
              onClick={() => { setIngestType(mode.id as IngestType); setPipelineReport(null); }}
              className={cn(
                "group flex items-center gap-3 px-8 py-4 rounded-2xl text-[10px] font-bold uppercase tracking-[0.2em] transition-all outline-none",
                isActive 
                  ? "bg-foreground text-background shadow-2xl scale-[1.02]" 
                  : "text-muted-foreground hover:text-foreground hover:bg-white/5"
              )}
            >
              <mode.icon size={16} className={cn("transition-colors", isActive ? "text-background" : mode.color)} />
              <span className="hidden lg:inline">{mode.label}</span>
            </button>
          );
        })}
      </nav>

      {/* --- 2. MULTI-MODAL DROPZONE & ANALYTICS SIDEBAR --- */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 items-stretch">
        
        <div className="xl:col-span-8">
          <div className={cn(
            "relative flex flex-col items-center justify-center h-[500px] rounded-[4rem] border-2 border-dashed transition-all duration-1000 overflow-hidden transform-gpu group",
            file ? "border-primary/40 bg-primary/2 shadow-[inset_0_0_80px_oklch(65%_0.25_270/0.05)]" : "border-border/60 bg-surface/20 hover:border-primary/20"
          )}>
            {!file ? (
              <label className="absolute inset-0 z-20 cursor-pointer flex flex-col items-center justify-center p-16 text-center">
                <input type="file" onChange={onFileChange} className="hidden" />
                <div className="relative mb-10">
                   <div className="absolute -inset-8 bg-primary/10 blur-[60px] rounded-full group-hover:bg-primary/20 transition-all" />
                   <div className="h-28 w-28 rounded-3xl bg-background border border-border shadow-2xl text-muted-foreground flex items-center justify-center relative transition-transform duration-700 group-hover:scale-110 group-hover:rotate-3">
                      <TypeIcon size={48} strokeWidth={1.2} />
                   </div>
                </div>
                <h4 className="font-display text-3xl font-bold text-foreground tracking-tighter mb-4">
                  {dictionary.placeholder_dropzone}
                </h4>
                <p className="text-sm text-muted-foreground font-light italic max-w-sm leading-relaxed">
                  Sincronía industrial para XLSX, CSV, WebP y registros de voz. <br /> 
                  <span className="text-primary/60 font-mono text-[10px] uppercase tracking-widest mt-2 block">Boundary: Max 10MB</span>
                </p>
              </label>
            ) : (
              <div className="relative z-30 flex flex-col items-center text-center p-16 animate-in zoom-in duration-700">
                 <div className="h-32 w-32 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mb-10 shadow-[0_0_60px_oklch(65%_0.25_270/0.2)]">
                    <CheckCircle2 size={56} className="text-primary" />
                 </div>
                 <h4 className="font-display text-3xl font-bold text-foreground tracking-tighter mb-3 truncate max-w-lg">
                    {file.name}
                 </h4>
                 <div className="flex gap-4 mb-10">
                    <span className="px-4 py-1.5 rounded-full bg-surface border border-border text-[9px] font-mono text-primary font-bold uppercase tracking-widest">
                       Payload: {(file.size / 1024).toFixed(1)} KB
                    </span>
                    <span className="px-4 py-1.5 rounded-full bg-surface border border-border text-[9px] font-mono text-muted-foreground font-bold uppercase tracking-widest">
                       MIME: {file.type || 'RAW_BIN'}
                    </span>
                 </div>
                 <button 
                  onClick={handleClearSelection}
                  className="group flex items-center gap-3 px-8 py-3.5 rounded-2xl bg-red-500/5 text-red-500/60 text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-red-500 hover:text-white transition-all active:scale-95 shadow-xl"
                 >
                    <Trash2 size={16} className="group-hover:rotate-12 transition-transform" /> 
                    Descartar Nodo
                 </button>
              </div>
            )}
            
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none group-hover:opacity-[0.06] transition-opacity duration-1000">
               <Database size={500} className="absolute -bottom-32 -right-32 rotate-12" />
            </div>
          </div>
        </div>

        <div className="xl:col-span-4 space-y-6">
           <aside className="p-10 rounded-[3.5rem] bg-surface/60 border border-border/50 shadow-luxury h-full flex flex-col relative overflow-hidden group/sidebar">
              
              <header className="mb-12 flex items-center justify-between">
                 <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-success/10 flex items-center justify-center text-success shadow-inner">
                       <Zap size={24} className="fill-current animate-pulse" />
                    </div>
                    <div className="flex flex-col">
                       <span className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-[0.4em]">Pipeline Guard</span>
                       <span className="text-xs font-bold text-foreground">Silo C Active</span>
                    </div>
                 </div>
                 <Activity size={18} className="text-muted-foreground/30" />
              </header>

              <div className="space-y-12 grow">
                <div className="space-y-4">
                   <div className="flex justify-between items-end">
                      <span className="text-[10px] font-bold text-foreground uppercase tracking-widest">Sincronía de Nodo</span>
                      <span className="text-xl font-display font-bold text-primary tracking-tighter">{progress}%</span>
                   </div>
                   <div className="h-2 w-full bg-foreground/5 rounded-full overflow-hidden p-0.5 border border-white/5">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }} 
                        className="h-full bg-linear-to-r from-primary to-accent rounded-full shadow-[0_0_15px_oklch(65%_0.25_270/0.3)]" 
                      />
                   </div>
                </div>

                <div className="space-y-4">
                   <div className="flex items-center gap-2">
                      <Share2 size={12} className="text-primary" />
                      <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Instrucciones de Lógica</span>
                   </div>
                   <textarea 
                     value={textInput}
                     onChange={(e) => setTextInput(e.target.value)}
                     placeholder="Inyecte parámetros de procesamiento o logs adicionales de contexto..."
                     className="w-full h-40 bg-background/40 border border-border/50 rounded-3xl p-6 text-xs font-sans font-light resize-none outline-none focus:border-primary/40 focus:bg-background/60 transition-all text-foreground shadow-inner custom-scrollbar"
                   />
                </div>
              </div>

              <button 
                onClick={handleExecuteMission}
                disabled={(!file && !textInput) || status === 'processing'}
                className={cn(
                  "w-full mt-10 relative overflow-hidden group/btn flex items-center justify-center gap-5 py-7 rounded-full font-bold text-[11px] uppercase tracking-[0.4em] transition-all active:scale-95 shadow-3xl",
                  (file || textInput) && status !== 'processing'
                    ? "bg-foreground text-background hover:bg-primary hover:text-white"
                    : "bg-surface text-muted-foreground/30 border border-border cursor-not-allowed"
                )}
              >
                {status === 'processing' ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    <span>{dictionary.status_processing.split(' ')[0]}</span>
                  </>
                ) : (
                  <>
                    <CloudUpload size={20} className="group-hover/btn:-translate-y-1 transition-transform" />
                    <span>{dictionary.btn_upload_data}</span>
                  </>
                )}
              </button>
           </aside>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {status === 'success' && pipelineReport && (
          <motion.div 
            initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="p-12 rounded-[4rem] bg-success/5 border border-success/20 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center shadow-2xl relative overflow-hidden">
              <div className="lg:col-span-7 flex items-center gap-10">
                  <div className="relative">
                    <div className="absolute inset-0 bg-success/20 blur-[50px] rounded-full animate-pulse" />
                    <div className="h-24 w-24 rounded-full bg-success/20 border border-success/30 flex items-center justify-center text-success relative shadow-[0_0_60px_rgba(34,197,94,0.15)]">
                      <CheckCircle2 size={48} strokeWidth={1} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-display font-bold text-foreground text-4xl tracking-tighter uppercase leading-none">Ingesta Sincronizada</h4>
                    <p className="text-sm text-muted-foreground font-light italic">Handshake de datos verificado. Trace ID: <span className="font-mono text-foreground select-all">{pipelineReport.traceId}</span></p>
                  </div>
              </div>

              <div className="lg:col-span-5 grid grid-cols-3 gap-8 border-l border-success/10 pl-12">
                  <div className="space-y-1">
                    <span className="flex items-center gap-2 text-[8px] font-bold text-muted-foreground uppercase tracking-widest"><Users size={12} /> Indexados</span>
                    <p className="text-3xl font-display font-bold text-foreground">{pipelineReport.metrics?.nodesInjected}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="flex items-center gap-2 text-[8px] font-bold text-red-500 uppercase tracking-widest"><XCircle size={12} /> Anómalos</span>
                    <p className="text-3xl font-display font-bold text-red-500/80">{pipelineReport.metrics?.failedRows ?? 0}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="flex items-center gap-2 text-[8px] font-bold text-primary uppercase tracking-widest"><Clock size={12} /> Latencia</span>
                    <p className="text-xl font-mono font-bold text-foreground">{pipelineReport.metrics?.latencyMs}</p>
                  </div>
              </div>
            </div>

            {pipelineReport.issues && pipelineReport.issues.length > 0 && (
              <div className="rounded-[3.5rem] border border-border bg-surface/40 overflow-hidden transition-all shadow-xl">
                <button 
                  onClick={() => setShowIssues(!showIssues)}
                  className="w-full flex items-center justify-between p-8 hover:bg-white/2 transition-colors group/audit"
                >
                   <div className="flex items-center gap-5">
                      <div className="h-10 w-10 rounded-xl bg-yellow-500/10 flex items-center justify-center text-yellow-500">
                        <AlertCircle size={20} />
                      </div>
                      <div className="text-left">
                        <span className="block text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">Registro de Anomalías</span>
                        <span className="text-sm font-bold text-foreground">{pipelineReport.issues.length} incidentes detectados</span>
                      </div>
                   </div>
                   <div className="h-10 w-10 rounded-full border border-border flex items-center justify-center text-muted-foreground group-hover/audit:text-primary transition-all">
                      {showIssues ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                   </div>
                </button>
                
                <AnimatePresence>
                  {showIssues && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden border-t border-border/50"
                    >
                       <div className="p-8 space-y-4 max-h-80 overflow-y-auto custom-scrollbar bg-background/10">
                          {pipelineReport.issues.map((issue: PipelineIssue, i: number) => (
                            <div key={i} className="flex items-start gap-6 p-6 rounded-3xl bg-red-500/3 border border-red-500/10 group/row hover:bg-red-500/6 transition-colors">
                               <span className="text-[10px] font-mono font-bold text-red-500/60 bg-red-500/10 px-3 py-1.5 rounded-lg">Fila {issue.row}</span>
                               <div className="space-y-2 flex-1">
                                  <p className="text-xs text-foreground font-mono font-bold leading-relaxed">{issue.error}</p>
                               </div>
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

      {status === 'error' && (
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="p-16 rounded-[4rem] bg-red-500/3 border border-red-500/20 text-center space-y-8 shadow-3xl">
            <XCircle size={64} className="text-red-500 mx-auto" strokeWidth={1.5} />
            <h4 className="font-display font-bold text-foreground text-3xl uppercase tracking-tighter">{dictionary.status_error}</h4>
            <button 
              onClick={() => setStatus('idle')}
              className="px-10 py-4 rounded-full bg-red-500 text-white font-bold text-[10px] uppercase tracking-[0.4em] hover:bg-white hover:text-black transition-all shadow-xl"
            >
               Reinicializar Pipeline
            </button>
        </motion.div>
      )}

      <footer className="pt-8 border-t border-border/40 flex flex-col sm:flex-row justify-between items-center gap-6 opacity-40 hover:opacity-100 transition-opacity duration-1000">
         <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-surface border border-border flex items-center justify-center text-primary">
               <Cpu size={20} strokeWidth={1.5} />
            </div>
            <div className="flex flex-col">
               <span className="text-[9px] font-mono font-bold uppercase tracking-widest">Silo C Processing Engine</span>
               <span className="text-[10px] font-bold text-foreground">Standard v4.0 • MetaShark Cloud</span>
            </div>
         </div>
      </footer>
    </div>
  );
}