/**
 * @file apps/portfolio-web/src/components/sections/portal/IngestionManager.tsx
 * @description Enterprise Ingestion Console (Silo C Manager).
 *              Terminal de orquestación para la captura de datos multi-modal.
 *              Refactorizado: Inyección de Telemetría Heimdall v2.5, optimización 
 *              de gestión de memoria, resiliencia de red y pureza React 19.
 * @version 5.2 - Forensic Ingestion Standard (Heimdall v2.5 Injected)
 * @author Raz Podestá -  MetaShark Tech
 */

'use client';

import React, { useState, useCallback, useMemo, useEffect, useRef, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CloudUpload, FileSpreadsheet, Mic, MessageSquare, 
  CheckCircle2, Loader2, Database, Zap, Users, 
  AlertCircle, Trash2, ChevronDown, ChevronUp, 
  XCircle, Clock, Share2, Activity, Cpu, ShieldCheck
} from 'lucide-react';

/** 
 * IMPORTACIONES DE INFRAESTRUCTRURA (Nx Boundary Safe)
 * @pilar V: Adherencia Arquitectónica.
 */
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
  /** Clases adicionales para posicionamiento */
  className?: string;
}

type IngestType = 'document' | 'image' | 'audio' | 'text';

/**
 * PROTOCOLO CROMÁTICO HEIMDALL (Pilar IV)
 */
const C = {
  reset: '\x1b[0m',
  magenta: '\x1b[35m', // DNA / Infra
  cyan: '\x1b[36m',    // STREAM / Info
  green: '\x1b[32m',   // GRANTED / Success
  yellow: '\x1b[33m',  // WARNING / Pending
  red: '\x1b[31m',     // BREACH / Error
  bold: '\x1b[1m'
};

/**
 * SUB-APARATO: IngestionSidebar
 * @description Lateral informativo con métricas de progreso y contexto de log.
 */
const IngestionSidebar = memo(({ 
  progress, 
  textInput, 
  setTextInput, 
  status, 
  onExecute, 
  dictionary,
  canSubmit 
}: {
  progress: number;
  textInput: string;
  setTextInput: (val: string) => void;
  status: string;
  onExecute: () => void;
  dictionary: Dictionary['ingestion_vault'];
  canSubmit: boolean;
}) => (
  <aside className="group/sidebar relative flex h-full flex-col overflow-hidden rounded-[3.5rem] border border-border/50 bg-surface/60 p-10 shadow-luxury transition-all duration-700 hover:border-primary/20">
    <header className="mb-12 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-success/10 text-success shadow-inner">
          <Zap size={24} className="animate-pulse fill-current" />
        </div>
        <div className="flex flex-col">
          <span className="font-mono text-[10px] font-bold uppercase tracking-[0.4em] text-muted-foreground">Pipeline Guard</span>
          <span className="text-xs font-bold text-foreground uppercase tracking-tighter">Silo C Active</span>
        </div>
      </div>
      <Activity size={18} className="text-muted-foreground/30" />
    </header>

    <div className="grow space-y-12">
      <div className="space-y-4">
        <div className="flex items-end justify-between">
          <span className="text-[10px] font-bold uppercase tracking-widest text-foreground">Sync Progress</span>
          <span className="font-display text-xl font-bold tracking-tighter text-primary">{progress}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full border border-white/5 bg-foreground/5 p-0.5">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }} 
            className="h-full rounded-full bg-linear-to-r from-primary to-accent shadow-[0_0_15px_oklch(65%_0.25_270/0.3)]" 
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Share2 size={12} className="text-primary" />
          <span className="font-bold font-mono text-[9px] uppercase tracking-widest text-muted-foreground">Metadata Context</span>
        </div>
        <textarea 
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
          placeholder="Injection parameters..."
          className="h-40 w-full resize-none rounded-3xl border border-border/50 bg-background/40 p-6 font-sans text-xs font-light text-foreground outline-none transition-all focus:bg-background/60 focus:border-primary/40 shadow-inner custom-scrollbar"
        />
      </div>
    </div>

    <button 
      onClick={onExecute}
      disabled={!canSubmit || status === 'processing'}
      className={cn(
        "group/btn relative mt-10 flex w-full items-center justify-center gap-5 rounded-full py-7 text-[11px] font-bold uppercase tracking-[0.4em] shadow-3xl transition-all active:scale-95 transform-gpu",
        canSubmit && status !== 'processing'
          ? "bg-foreground text-background hover:bg-primary hover:text-white"
          : "cursor-not-allowed border border-border bg-surface text-muted-foreground/30"
      )}
    >
      {status === 'processing' ? (
        <>
          <Loader2 className="animate-spin" size={20} />
          <span>{dictionary.status_processing.split(' ')[0]}</span>
        </>
      ) : (
        <>
          <CloudUpload size={20} className="transition-transform group-hover/btn:-translate-y-1" />
          <span>{dictionary.btn_upload_data}</span>
        </>
      )}
    </button>
  </aside>
));
IngestionSidebar.displayName = 'IngestionSidebar';

/**
 * APARATO PRINCIPAL: IngestionManager
 */
export function IngestionManager({ dictionary, className }: IngestionManagerProps) {
  const { session } = useUIStore();
  
  // --- ESTADOS DE CONTROL ---
  const [file, setFile] = useState<File | null>(null);
  const [textInput, setTextInput] = useState('');
  const [ingestType, setIngestType] = useState<IngestType>('document');
  const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  const [showIssues, setShowIssues] = useState(false);
  const [pipelineReport, setPipelineReport] = useState<LocalIngestionReport | null>(null);
  
  const previewUrlRef = useRef<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  /**
   * PROTOCOLO HEIMDALL: Telemetría de Montaje e Infraestructura
   */
  useEffect(() => {
    const handshakeId = `hsk_ing_${Date.now().toString(36).toUpperCase()}`;
    console.log(`${C.magenta}${C.bold}[DNA][SiloC]${C.reset} Ingestion Terminal Online | ID: ${handshakeId}`);
    
    return () => {
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, []);

  /**
   * RESOLVER SENSORIAL: Iconografía y Temática
   */
  const typeConfig = useMemo(() => {
    const map = {
      document: { icon: FileSpreadsheet, color: 'text-primary' },
      image: { icon: Activity, color: 'text-blue-400' },
      audio: { icon: Mic, color: 'text-yellow-500' },
      text: { icon: MessageSquare, color: 'text-emerald-400' }
    };
    return map[ingestType] || { icon: Database, color: 'text-primary' };
  }, [ingestType]);

  /**
   * ACTION: handleClearSelection
   * @pilar VIII: Gestión de Memoria Forense.
   */
  const handleClearSelection = useCallback(() => {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }
    setFile(null);
    setTextInput('');
    setStatus('idle');
    setPipelineReport(null);
    setProgress(0);
    console.log(`${C.yellow}[HEIMDALL][VAULT] Local buffer purged.${C.reset}`);
  }, []);

  /**
   * ACTION: onFileChange
   * @description Detecta y normaliza el tipo de ingesta según el binario recibido.
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
   * ACTION: handleExecuteMission (Sovereign Data Dispatch)
   * @pilar IV: Trazabilidad DNA-Level y latencia nanométrica.
   */
  const handleExecuteMission = async () => {
    if ((!file && !textInput) || !session?.tenantId) return;

    const missionId = `mission_${Date.now().toString(36).toUpperCase()}`;
    const startTime = performance.now();

    console.group(`${C.cyan}${C.bold}[HEIMDALL][PIPELINE]${C.reset} Mission Start: ${missionId}`);
    
    setStatus('processing');
    setProgress(15);
    
    // Inicialización de Abort Signal para misiones pesadas
    abortControllerRef.current = new AbortController();

    try {
      const formData = new FormData();
      if (file) formData.append('file', file);

      // Despacho a Server Action
      const result = await executeDataIngestion(formData, {
        subject: file?.name || `MANUAL_DISPATCH_${Date.now()}`,
        type: ingestType,
        channel: 'web',
        tenant: session.tenantId,
        content: textInput,
        traceId: missionId,
        sender: { email: session.email, role: session.role }
      }) as unknown as LocalIngestionReport;

      const endTime = performance.now();
      const latency = (endTime - startTime).toFixed(4);

      if (result.success) {
        setProgress(100);
        setStatus('success');
        setPipelineReport({ ...result, traceId: missionId });
        
        console.log(`${C.green}   ✓ [GRANTED]${C.reset} Injected Nodes: ${result.metrics?.nodesInjected} | Latency: ${C.yellow}${latency}ms${C.reset}`);
      } else {
        throw new Error(result.error || 'PIPELINE_DRIFT');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'CORE_PIPELINE_EXCEPTION';
      console.error(`${C.red}   ✕ [BREACH] Dispatch Aborted: ${msg}${C.reset}`);
      setStatus('error');
    } finally {
      abortControllerRef.current = null;
      console.groupEnd();
    }
  };

  return (
    <div className={cn("max-w-6xl mx-auto space-y-12 animate-in fade-in duration-1000", className)}>
      
      {/* --- 1. MODALITY NAV (Oxygen Style) --- */}
      <nav className="mx-auto flex w-max justify-center gap-4 rounded-4xl border border-border/50 bg-surface/40 p-2.5 shadow-luxury backdrop-blur-2xl">
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
                "group flex items-center gap-3 rounded-2xl px-8 py-4 text-[10px] font-bold uppercase tracking-[0.2em] transition-all outline-none",
                isActive 
                  ? "bg-foreground text-background shadow-2xl scale-[1.02]" 
                  : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
              )}
            >
              <mode.icon size={16} className={cn("transition-colors", isActive ? "text-background" : mode.color)} />
              <span className="hidden lg:inline">{mode.label}</span>
            </button>
          );
        })}
      </nav>

      {/* --- 2. MULTI-MODAL DROPZONE & SIDEBAR --- */}
      <div className="grid grid-cols-1 gap-10 items-stretch xl:grid-cols-12">
        <div className="xl:col-span-8">
          <div className={cn(
            "group relative flex h-[500px] flex-col items-center justify-center overflow-hidden rounded-[4rem] border-2 border-dashed transition-all duration-1000 transform-gpu",
            file ? "border-primary/40 bg-primary/2 shadow-[inset_0_0_80px_oklch(65%_0.25_270/0.05)]" : "border-border/60 bg-surface/20 hover:border-primary/20"
          )}>
            {!file ? (
              <label className="absolute inset-0 z-20 flex cursor-pointer flex-col items-center justify-center p-16 text-center">
                <input type="file" onChange={onFileChange} className="hidden" />
                <div className="relative mb-10">
                   <div className="absolute -inset-8 rounded-full bg-primary/10 blur-[60px] transition-all group-hover:bg-primary/20" />
                   <div className="relative flex h-28 w-28 items-center justify-center rounded-3xl border border-border bg-background text-muted-foreground shadow-2xl transition-transform duration-700 group-hover:rotate-3 group-hover:scale-110">
                      <typeConfig.icon size={48} strokeWidth={1.2} />
                   </div>
                </div>
                <h4 className="font-display text-3xl font-bold tracking-tighter text-foreground mb-4 uppercase">
                  {dictionary.placeholder_dropzone}
                </h4>
                <p className="max-w-sm font-sans text-sm font-light italic leading-relaxed text-muted-foreground">
                  Universal capture for XLSX, CSV and forensic voice notes. <br /> 
                  <span className="mt-2 block font-mono text-[10px] uppercase tracking-widest text-primary/60">Boundary Gate: Max 10MB</span>
                </p>
              </label>
            ) : (
              <div className="relative z-30 flex flex-col items-center p-16 text-center animate-in zoom-in duration-700">
                 <div className="mb-10 flex h-32 w-32 items-center justify-center rounded-full border border-primary/20 bg-primary/10 shadow-[0_0_60px_oklch(65%_0.25_270/0.2)]">
                    <CheckCircle2 size={56} className="text-primary" />
                 </div>
                 <h4 className="max-w-lg truncate font-display text-3xl font-bold tracking-tighter text-foreground mb-3 uppercase">
                    {file.name}
                 </h4>
                 <div className="mb-10 flex gap-4">
                    <span className="rounded-full border border-border bg-surface px-4 py-1.5 font-mono text-[9px] font-bold uppercase tracking-widest text-primary">
                       Payload: {(file.size / 1024).toFixed(1)} KB
                    </span>
                    <span className="rounded-full border border-border bg-surface px-4 py-1.5 font-mono text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
                       MIME: {file.type || 'BINARY_NODE'}
                    </span>
                 </div>
                 <button 
                  onClick={handleClearSelection}
                  className="group flex items-center gap-3 rounded-2xl bg-red-500/5 px-8 py-3.5 text-[10px] font-bold uppercase tracking-[0.3em] text-red-500/60 shadow-xl transition-all hover:bg-red-500 hover:text-white active:scale-95"
                 >
                    <Trash2 size={16} className="transition-transform group-hover:rotate-12" /> 
                    Purge Node
                 </button>
              </div>
            )}
            
            <div className="pointer-events-none absolute inset-0 opacity-[0.03] transition-opacity duration-1000 group-hover:opacity-[0.06]">
               <Database size={500} className="absolute -bottom-32 -right-32 rotate-12" />
            </div>
          </div>
        </div>

        <div className="xl:col-span-4">
           <IngestionSidebar 
            progress={progress}
            textInput={textInput}
            setTextInput={setTextInput}
            status={status}
            onExecute={handleExecuteMission}
            dictionary={dictionary}
            canSubmit={!!file || textInput.length > 5}
           />
        </div>
      </div>

      {/* --- 3. MISSION REPORT VIEWPORT --- */}
      <AnimatePresence mode="wait">
        {status === 'success' && pipelineReport && (
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            <div className="relative grid grid-cols-1 items-center gap-12 overflow-hidden rounded-[4rem] border border-success/20 bg-success/5 p-12 shadow-2xl lg:grid-cols-12">
              <div className="flex items-center gap-10 lg:col-span-7">
                  <div className="relative">
                    <div className="absolute inset-0 animate-pulse rounded-full bg-success/20 blur-[50px]" />
                    <div className="relative flex h-24 w-24 items-center justify-center rounded-full border border-success/30 bg-success/20 text-success shadow-[0_0_60px_rgba(34,197,94,0.15)]">
                      <ShieldCheck size={48} strokeWidth={1} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-display text-4xl font-bold uppercase leading-none tracking-tighter text-foreground">
                      Mission Synchronized
                    </h4>
                    <p className="font-sans text-sm font-light italic text-muted-foreground">
                       Handshake verified by Silo C. Trace ID: <span className="font-mono text-foreground select-all">{pipelineReport.traceId}</span>
                    </p>
                  </div>
              </div>
              <div className="grid grid-cols-3 gap-8 border-l border-success/10 pl-12 lg:col-span-5">
                  <div className="space-y-1">
                    <span className="flex items-center gap-2 text-[8px] font-bold uppercase tracking-widest text-muted-foreground"><Users size={12} /> Indexed</span>
                    <p className="font-display text-3xl font-bold text-foreground">{pipelineReport.metrics?.nodesInjected}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="flex items-center gap-2 text-[8px] font-bold uppercase tracking-widest text-red-500"><XCircle size={12} /> Anomalies</span>
                    <p className="font-display text-3xl font-bold text-red-500/80">{pipelineReport.metrics?.failedRows ?? 0}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="flex items-center gap-2 text-[8px] font-bold uppercase tracking-widest text-primary"><Clock size={12} /> Latency</span>
                    <p className="font-mono text-xl font-bold text-foreground">{pipelineReport.metrics?.latencyMs}</p>
                  </div>
              </div>
            </div>

            {pipelineReport.issues && pipelineReport.issues.length > 0 && (
              <div className="overflow-hidden rounded-[3.5rem] border border-border bg-surface/40 shadow-xl transition-all">
                <button 
                  onClick={() => setShowIssues(!showIssues)}
                  className="group/audit flex w-full items-center justify-between p-8 transition-colors hover:bg-white/2"
                >
                   <div className="flex items-center gap-5">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-500/10 text-yellow-500">
                        <AlertCircle size={20} />
                      </div>
                      <div className="text-left">
                        <span className="block text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">Anomaly Ledger</span>
                        <span className="text-sm font-bold text-foreground">{pipelineReport.issues.length} incidents logged</span>
                      </div>
                   </div>
                   <div className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-muted-foreground transition-all group-hover/audit:border-primary/30 group-hover/audit:text-primary">
                      {showIssues ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                   </div>
                </button>
                <AnimatePresence>
                  {showIssues && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} 
                      className="overflow-hidden border-t border-border/50"
                    >
                       <div className="max-h-80 space-y-4 overflow-y-auto bg-background/10 p-8 custom-scrollbar">
                          {pipelineReport.issues.map((issue: PipelineIssue, i: number) => (
                            <div key={i} className="group/row flex items-start gap-6 rounded-3xl border border-red-500/10 bg-red-500/3 p-6 transition-colors hover:bg-red-500/6">
                               <span className="rounded-lg bg-red-500/10 px-3 py-1.5 font-mono text-[10px] font-bold text-red-500/60">Row {issue.row}</span>
                               <div className="flex-1 space-y-2">
                                  <p className="font-mono text-xs font-bold leading-relaxed text-foreground">{issue.error}</p>
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
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="rounded-[4rem] border border-red-500/20 bg-red-500/3 p-16 text-center shadow-3xl space-y-8">
            <XCircle size={64} className="mx-auto text-red-500" strokeWidth={1.5} />
            <h4 className="font-display text-3xl font-bold uppercase tracking-tighter text-foreground">{dictionary.status_error}</h4>
            <button onClick={() => setStatus('idle')} className="rounded-full bg-red-500 px-10 py-4 text-[10px] font-bold uppercase tracking-[0.4em] text-white shadow-xl transition-all hover:bg-white hover:text-black active:scale-95">
               Reinitialize Pipeline
            </button>
        </motion.div>
      )}

      {/* --- 4. SYSTEM STATUS FOOTER --- */}
      <footer className="flex flex-col items-center justify-between gap-6 border-t border-border/40 pt-8 opacity-40 transition-opacity duration-1000 hover:opacity-100 sm:flex-row">
         <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-surface text-primary">
               <Cpu size={20} strokeWidth={1.5} />
            </div>
            <div className="flex flex-col">
               <span className="font-mono text-[9px] font-bold uppercase tracking-widest">Silo C Intelligence Node</span>
               <span className="text-[10px] font-bold text-foreground">v5.2 Forensic Engine • MetaShark Standard</span>
            </div>
         </div>
      </footer>
    </div>
  );
}