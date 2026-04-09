/**
 * @file apps/portfolio-web/src/components/sections/portal/IngestionManager.tsx
 * @description Enterprise Ingestion Console (Silo C Manager).
 *              Refactorizado: Erradicación de tipos 'any', purga de imports 
 *              huérfanos y normalización de sintaxis OKLCH para Tailwind v4.
 *              Estándar: Heimdall v2.5 Forensic Ingestion & React 19 Pure.
 * @version 5.6 - Linter Pure & Tailwind Canonical Standard
 * @author Raz Podestá -  MetaShark Tech
 */

'use client';

import React, { useState, useCallback, useMemo, useEffect, useRef, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CloudUpload, FileSpreadsheet, Mic, MessageSquare, 
  CheckCircle2, Loader2, Database, Zap, Users, 
  AlertCircle, Trash2, ChevronDown, ChevronUp, 
  Clock, Share2, Activity, Cpu, ShieldCheck,
  Send, ArrowRight, Info, Fingerprint
} from 'lucide-react';

/** IMPORTACIONES DE INFRAESTRUCTRURA (Nx Boundary Safe) */
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
  /** Diccionario de ingesta validado por el Master Schema */
  dictionary: Dictionary['ingestion_vault'];
  className?: string;
}

type IngestType = 'document' | 'image' | 'audio' | 'text';

// --- PROTOCOLO CROMÁTICO HEIMDALL v2.5 ---
const C = {
  reset: '\x1b[0m', magenta: '\x1b[35m', cyan: '\x1b[36m', 
  green: '\x1b[32m', yellow: '\x1b[33m', red: '\x1b[31m', bold: '\x1b[1m'
};

// ============================================================================
// 1. SUB-APARATO: IngestionSidebar (Control Panel)
// ============================================================================
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
  <aside className="group/sidebar relative flex h-full flex-col overflow-hidden rounded-[3.5rem] border border-border/50 bg-surface/60 p-10 shadow-luxury transition-all duration-700 hover:border-primary/20 transform-gpu">
    <header className="mb-12 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-success/10 text-success shadow-inner transition-transform group-hover/sidebar:rotate-6">
          <Zap size={24} className="animate-pulse fill-current" />
        </div>
        <div className="flex flex-col">
          <span className="font-mono text-[10px] font-bold uppercase tracking-[0.4em] text-muted-foreground">Pipeline Guard</span>
          <span className="text-xs font-bold text-foreground uppercase tracking-tighter">Silo C Intelligence</span>
        </div>
      </div>
      <Activity size={18} className="text-muted-foreground/30 animate-pulse" />
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
            /** @fix: Normalización canónica de sombra OKLCH para Tailwind v4 */
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
          placeholder="Injection instructions or manual data parameters..."
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
          <span>HANDSHAKING...</span>
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

// ============================================================================
// APARATO PRINCIPAL: IngestionManager
// ============================================================================
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
   * PROTOCOLO HEIMDALL: Telemetría de Montaje
   */
  useEffect(() => {
    const handshakeId = `hsk_ing_${Date.now().toString(36).toUpperCase()}`;
    console.log(`${C.magenta}${C.bold}[DNA][SiloC]${C.reset} Ingestion Terminal Active | ID: ${handshakeId}`);
    
    return () => {
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, []);

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
   * @pilar IV: Trazabilidad Forense.
   */
  const handleExecuteMission = async () => {
    if ((!file && !textInput) || !session?.tenantId) return;

    const missionId = `mission_${Date.now().toString(36).toUpperCase()}`;
    const startTime = performance.now();

    console.group(`${C.cyan}${C.bold}[HEIMDALL][PIPELINE]${C.reset} Processing: ${missionId}`);
    
    setStatus('processing');
    setProgress(20);
    abortControllerRef.current = new AbortController();

    try {
      const formData = new FormData();
      if (file) formData.append('file', file);

      // Despacho Real hacia el Pipeline del Servidor
      const result = await executeDataIngestion(formData, {
        subject: file?.name || `MANUAL_INGEST_${Date.now()}`,
        type: ingestType,
        channel: 'web',
        tenant: session.tenantId,
        content: textInput,
        traceId: missionId,
        sender: { email: session.email, role: session.role }
      }) as unknown as LocalIngestionReport;

      const duration = (performance.now() - startTime).toFixed(4);

      if (result.success) {
        setProgress(100);
        setStatus('success');
        setPipelineReport({ ...result, traceId: missionId });
        console.log(`${C.green}   ✓ [GRANTED]${C.reset} Ingestion successful | Nodes: ${result.metrics?.nodesInjected} | Latency: ${duration}ms`);
      } else {
        throw new Error(result.error || 'PIPELINE_ERROR');
      }
    } catch (err: unknown) {
      /** @pilar VIII: Manejo de Errores Resiliente - Erradicación de 'any' */
      const msg = err instanceof Error ? err.message : 'CORE_PIPELINE_EXCEPTION';
      console.error(`${C.red}   ✕ [BREACH] Ingestion failed: ${msg}${C.reset}`);
      setStatus('error');
    } finally {
      abortControllerRef.current = null;
      console.groupEnd();
    }
  };

  return (
    <div className={cn("max-w-6xl mx-auto space-y-12 animate-in fade-in duration-1000", className)}>
      
      {/* 1. SELECCIÓN DE MODALIDAD (Oxygen UI) */}
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
                "group flex items-center gap-3 rounded-2xl px-8 py-4 text-[10px] font-bold uppercase tracking-[0.2em] transition-all outline-none transform-gpu",
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

      {/* 2. AREA DE CARGA & SIDEBAR */}
      <div className="grid grid-cols-1 gap-10 items-stretch xl:grid-cols-12">
        <div className="xl:col-span-8">
          <div className={cn(
            "group relative flex h-[500px] flex-col items-center justify-center overflow-hidden rounded-[4rem] border-2 border-dashed transition-all duration-1000 transform-gpu",
            file ? "border-primary/40 bg-primary/2" : "border-border/60 bg-surface/20 hover:border-primary/20"
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
                <p className="max-w-sm font-sans text-sm font-light italic text-muted-foreground">
                  Universal capture for B2B nodes and elite audiences. <br /> 
                  <span className="mt-2 block font-mono text-[10px] uppercase tracking-widest text-primary/60">Boundary Gate: 10MB Limit</span>
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
                       {(file.size / 1024).toFixed(1)} KB
                    </span>
                    <span className="rounded-full border border-border bg-surface px-4 py-1.5 font-mono text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
                       {file.type || 'BINARY_NODE'}
                    </span>
                 </div>
                 <button 
                  /** @fix: Unificación de purga de buffers */
                  onClick={handleClearSelection}
                  className="group flex items-center gap-3 rounded-2xl bg-red-500/5 px-8 py-3.5 text-[10px] font-bold uppercase tracking-[0.3em] text-red-500/60 shadow-xl transition-all hover:bg-red-500 hover:text-white transform-gpu active:scale-95"
                 >
                    <Trash2 size={16} className="group-hover:rotate-12 transition-transform" /> 
                    Purge Node
                 </button>
              </div>
            )}
            <div className="pointer-events-none absolute inset-0 opacity-[0.03] rotate-12">
               <Database size={500} className="absolute -bottom-32 -right-32" />
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

      {/* 3. MISSION REPORT VIEWPORT & CONVERGENCE (Silo C Bridge) */}
      <AnimatePresence mode="wait">
        {status === 'success' && pipelineReport && (
          <motion.div 
            initial={{ opacity: 0, y: 40, scale: 0.98 }} 
            animate={{ opacity: 1, y: 0, scale: 1 }} 
            className="space-y-8 transform-gpu"
          >
            {/* Summary Block de Élite */}
            <div className="relative grid grid-cols-1 items-center gap-12 overflow-hidden rounded-[4rem] border border-success/20 bg-success/5 p-12 shadow-2xl lg:grid-cols-12 backdrop-blur-sm">
              <div className="flex items-center gap-10 lg:col-span-7">
                  <div className="relative">
                    <div className="absolute inset-0 animate-pulse rounded-full bg-success/20 blur-[50px]" />
                    <div className="relative flex h-24 w-24 items-center justify-center rounded-full border border-success/30 bg-success/20 text-success shadow-inner">
                      <ShieldCheck size={48} strokeWidth={1} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-display text-4xl font-bold uppercase leading-none tracking-tighter text-foreground">
                      Mission Synchronized
                    </h4>
                    <p className="font-sans text-sm font-light italic text-muted-foreground">
                       Handshake verified by Silo C Intelligence. Trace ID: <span className="font-mono text-foreground select-all bg-foreground/5 px-2 py-0.5 rounded">{pipelineReport.traceId}</span>
                    </p>
                  </div>
              </div>
              
              <div className="lg:col-span-5 flex justify-end">
                  <button className="group flex items-center gap-5 px-10 py-6 rounded-full bg-foreground text-background font-bold text-[11px] uppercase tracking-[0.4em] transition-all hover:bg-primary hover:text-white shadow-3xl active:scale-95 transform-gpu">
                    <Send size={18} className="group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform" />
                    Initialize Marketing Mission
                    <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
                  </button>
              </div>
            </div>

            {/* Metrics Cluster Cluster */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { label: 'Nodes Injected', value: pipelineReport.metrics?.nodesInjected, icon: Users, color: 'text-primary' },
                  { label: 'Anomalies Detected', value: pipelineReport.metrics?.failedRows, icon: AlertCircle, color: pipelineReport.metrics?.failedRows ? 'text-red-500' : 'text-success' },
                  { label: 'Sync Latency', value: pipelineReport.metrics?.latencyMs, icon: Clock, color: 'text-blue-400' }
                ].map((m, i) => (
                  <div key={i} className="p-8 rounded-4xl bg-surface/40 border border-border/50 flex items-center justify-between shadow-xl transition-all hover:border-primary/20 group transform-gpu hover:-translate-y-1">
                     <div className="space-y-1">
                       <span className="block text-[8px] font-mono font-bold text-muted-foreground uppercase tracking-widest">{m.label}</span>
                       <span className="text-3xl font-display font-bold text-foreground">{m.value ?? 0}</span>
                     </div>
                     <m.icon size={28} className={cn("opacity-40 transition-all group-hover:opacity-100 group-hover:scale-110", m.color)} strokeWidth={1.2} />
                  </div>
                ))}
            </div>

            {/* Forensic Anomaly Ledger */}
            {pipelineReport.issues && pipelineReport.issues.length > 0 && (
              <div className="overflow-hidden rounded-[3.5rem] border border-border bg-surface/40 shadow-xl">
                <button 
                  onClick={() => setShowIssues(!showIssues)}
                  className="group/audit flex w-full items-center justify-between p-8 transition-colors hover:bg-white/2"
                >
                   <div className="flex items-center gap-5">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-500/10 text-yellow-500">
                        <AlertCircle size={20} />
                      </div>
                      <div className="text-left">
                        <span className="block text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">Anomaly Intelligence</span>
                        <span className="text-sm font-bold text-foreground">{pipelineReport.issues.length} row incidents detected</span>
                      </div>
                   </div>
                   <div className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-muted-foreground transition-all group-hover/audit:border-primary/30 group-hover/audit:text-primary">
                      {showIssues ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                   </div>
                </button>
                <AnimatePresence>
                  {showIssues && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }} 
                      animate={{ height: 'auto', opacity: 1 }} 
                      exit={{ height: 0, opacity: 0 }} 
                      className="overflow-hidden border-t border-border/50 bg-background/20"
                    >
                       <div className="max-h-[500px] space-y-4 overflow-y-auto p-8 custom-scrollbar">
                          {pipelineReport.issues.map((issue, i) => (
                            <div key={i} className="group/row flex items-start gap-6 rounded-3xl border border-red-500/10 bg-red-500/3 p-6 transition-all hover:bg-red-500/6">
                               <div className="flex flex-col gap-2 shrink-0">
                                  <span className="rounded-lg bg-red-500/10 px-3 py-1.5 font-mono text-[10px] font-bold text-red-500/60">ROW_{issue.row}</span>
                                  <div className="flex justify-center">
                                    <Fingerprint size={16} className="text-muted-foreground/20" />
                                  </div>
                               </div>
                               <div className="flex-1 space-y-2">
                                  <p className="font-mono text-xs font-bold leading-relaxed text-foreground">{issue.error}</p>
                                  <div className="flex items-center gap-2 text-[9px] font-mono text-muted-foreground uppercase tracking-widest opacity-40 group-hover/row:opacity-100 transition-opacity">
                                    <Info size={10} /> Suggested Action: Verify node identity protocol (RFC 5322).
                                  </div>
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

      {/* --- 4. FOOTER TELEMÉTRICO --- */}
      <footer className="flex flex-col items-center justify-between gap-6 border-t border-border/40 pt-8 opacity-40 transition-opacity duration-1000 hover:opacity-100 sm:flex-row">
         <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-surface text-primary">
               <Cpu size={20} strokeWidth={1.5} />
            </div>
            <div className="flex flex-col">
               <span className="font-mono text-[9px] font-bold uppercase tracking-widest">Silo C Intelligence Node</span>
               <span className="text-[10px] font-bold text-foreground uppercase tracking-tight">v5.6 Forensic Engine • MetaShark Standard</span>
            </div>
         </div>
         <div className="flex items-center gap-3">
            <div className="h-2 w-2 rounded-full bg-success animate-pulse shadow-[0_0_8px_oklch(70%_0.18_140)]" />
            <span className="font-mono text-[9px] uppercase tracking-[0.4em] text-success">Perimeter: SECURE</span>
         </div>
      </footer>
    </div>
  );
}