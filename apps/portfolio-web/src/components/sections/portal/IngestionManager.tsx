/**
 * @file apps/portfolio-web/src/components/sections/portal/IngestionManager.tsx
 * @description Enterprise Ingestion Console (Silo C Manager).
 *              Terminal de orquestación para la captura de datos multi-modal.
 *              Implementa sincronización con el Data Pipeline 4.0, visualización
 *              de métricas de inyección CRM y feedback de latencia industrial.
 * @version 2.0 - Enterprise Level 4.0 | TS & Logic Refined
 * @author Staff Engineer - MetaShark Tech
 */

'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CloudUpload, FileSpreadsheet, Mic, MessageSquare, 
  Image as ImageIcon, CheckCircle2, Loader2,
  Database, Zap, Users, Info
} from 'lucide-react';

/** IMPORTACIONES DE INFRAESTRUCTRURA */
import { cn } from '../../../lib/utils/cn';
import { executeDataIngestion, type IngestionResponse } from '../../../lib/portal/actions/ingest.actions';
import { useUIStore } from '../../../lib/store/ui.store';
import type { Dictionary } from '../../../lib/schemas/dictionary.schema';

interface IngestionManagerProps {
  /** Diccionario de ingesta validado por v24.0 */
  dictionary: Dictionary['ingestion_vault'];
}

type IngestType = 'document' | 'image' | 'audio' | 'text';

/**
 * MODULE: IngestionManager
 * @description Orquestador visual para la ingesta de activos de inteligencia.
 */
export function IngestionManager({ dictionary }: IngestionManagerProps) {
  const { session } = useUIStore();
  const [file, setFile] = useState<File | null>(null);
  const [textInput, setTextInput] = useState('');
  const [ingestType, setIngestType] = useState<IngestType>('document');
  const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  
  // Estado para capturar el reporte de la Server Action
  const [pipelineReport, setPipelineReport] = useState<IngestionResponse | null>(null);

  /**
   * RESOLUCIÓN DE ICONO DINÁMICO
   */
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
   * HANDLER: File Selection & Intent Detection
   */
  const onFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    setFile(selected);
    setStatus('idle');
    setPipelineReport(null);
    
    // Inferencia de tipo automática por MIME
    if (selected.type.startsWith('image/')) setIngestType('image');
    else if (selected.type.startsWith('audio/')) setIngestType('audio');
    else setIngestType('document');
  }, []);

  /**
   * PROTOCOLO DE DESPACHO (Enterprise Sync)
   * @pilar IV: Observabilidad - Trazabilidad de la respuesta del pipeline.
   */
  const handleExecuteIngest = async () => {
    // @fix TS2551: Sincronización con session.tenantId
    if ((!file && !textInput) || !session?.tenantId) return;

    setStatus('processing');
    setProgress(15); // Handshake visual

    const formData = new FormData();
    if (file) formData.append('file', file);

    try {
      // @fix TS2305: Uso de la acción orquestadora executeDataIngestion
      const result = await executeDataIngestion(formData, {
        subject: file?.name || `MANUAL_LOG_${new Date().getTime()}`,
        type: ingestType,
        channel: 'web',
        tenant: session.tenantId, // @fix: tenantId
        content: textInput,
        sender: { name: session.email, role: session.role }
      });

      if (result.success) {
        setProgress(100);
        setStatus('success');
        setPipelineReport(result);

        // Reset táctico tras éxito (Pilar X)
        setTimeout(() => {
          if (status === 'success') {
            setFile(null);
            setTextInput('');
            setStatus('idle');
            setProgress(0);
          }
        }, 8000); // Ventana extendida para lectura de métricas
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      console.error('[CORE][PIPELINE-FAIL]', err);
      setStatus('error');
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10 animate-in fade-in duration-1000">
      
      {/* --- 1. TACTICAL MODALITY SWITCH --- */}
      <nav className="flex justify-center gap-3 p-2 rounded-3xl bg-surface/40 border border-border/50 w-max mx-auto backdrop-blur-xl">
        {[
          { id: 'document', label: dictionary.label_excel_db, icon: FileSpreadsheet },
          { id: 'image', label: 'Media Capture', icon: ImageIcon },
          { id: 'audio', label: dictionary.label_voice_note, icon: Mic },
          { id: 'text', label: dictionary.label_chat_log, icon: MessageSquare }
        ].map((mode) => {
          const isActive = ingestType === mode.id;
          return (
            <button
              key={mode.id}
              onClick={() => setIngestType(mode.id as IngestType)}
              className={cn(
                "flex items-center gap-3 px-6 py-3 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all outline-none",
                isActive ? "bg-primary text-white shadow-lg scale-105" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <mode.icon size={14} />
              <span className="hidden md:inline">{mode.label}</span>
            </button>
          );
        })}
      </nav>

      {/* --- 2. PIPELINE INTERFACE --- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        <div className="lg:col-span-8">
          <label className={cn(
            "relative flex flex-col items-center justify-center h-[450px] rounded-[4rem] border-2 border-dashed transition-all duration-700 overflow-hidden cursor-pointer group",
            file ? "border-primary/40 bg-primary/5" : "border-border/60 bg-surface/20 hover:border-primary/30"
          )}>
            <input type="file" onChange={onFileChange} className="absolute inset-0 opacity-0 z-20 cursor-pointer" />
            
            <div className="relative z-10 flex flex-col items-center text-center px-12">
               <div className={cn(
                 "h-24 w-24 rounded-[2.5rem] flex items-center justify-center mb-8 transition-transform duration-700 group-hover:scale-110 shadow-2xl",
                 file ? "bg-primary text-white" : "bg-background border border-border text-muted-foreground"
               )}>
                  <TypeIcon size={40} strokeWidth={1.5} />
               </div>
               <h4 className="font-display text-2xl font-bold text-foreground tracking-tight mb-3">
                 {file ? file.name : dictionary.placeholder_dropzone}
               </h4>
               <p className="text-sm text-muted-foreground font-light italic max-w-xs">
                 {file ? `Stream ready: ${(file.size / 1024 / 1024).toFixed(2)} MB` : "Protocols: XLSX, CSV, WebP, MP3"}
               </p>
            </div>

            {/* Background Atmosphere */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none group-hover:opacity-[0.07] transition-opacity">
               <Database size={400} className="absolute -bottom-20 -right-20 rotate-12" />
            </div>
          </label>
        </div>

        {/* --- 3. OPERATIONAL CONTROL PANEL --- */}
        <div className="lg:col-span-4 space-y-6">
           <div className="p-8 rounded-[3.5rem] bg-surface/60 border border-border shadow-luxury h-full flex flex-col">
              <header className="mb-10 flex items-center gap-4">
                 <div className="h-10 w-10 rounded-2xl bg-success/10 flex items-center justify-center text-success">
                    <Zap size={20} />
                 </div>
                 <span className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-widest">Pipeline Status</span>
              </header>

              <div className="space-y-10 grow">
                {/* Visual Tracker */}
                <div className="space-y-4">
                   <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                      <span className="text-foreground">Sincronización</span>
                      <span className="text-primary">{progress}%</span>
                   </div>
                   <div className="h-1.5 w-full bg-foreground/5 rounded-full overflow-hidden">
                      <motion.div animate={{ width: `${progress}%` }} className="h-full bg-primary" />
                   </div>
                </div>

                {/* Context Area */}
                <div className="space-y-4">
                   <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Notas Contextuales</span>
                   <textarea 
                     value={textInput}
                     onChange={(e) => setTextInput(e.target.value)}
                     placeholder="Inyecte logs de chat o instrucciones para el parser..."
                     className="w-full h-32 bg-background/50 border border-border/50 rounded-3xl p-5 text-xs font-sans resize-none outline-none focus:border-primary/40 transition-all text-foreground"
                   />
                </div>
              </div>

              <button 
                onClick={handleExecuteIngest}
                disabled={(!file && !textInput) || status === 'processing'}
                className={cn(
                  "w-full mt-8 flex items-center justify-center gap-4 py-6 rounded-full font-bold text-[11px] uppercase tracking-[0.3em] transition-all active:scale-95 shadow-2xl",
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

      {/* --- 4. DATA INTELLIGENCE REPORT (MEA/UX) --- */}
      <AnimatePresence mode="wait">
        {status === 'success' && pipelineReport && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="p-10 rounded-4xl bg-success/5 border border-success/20 grid grid-cols-1 md:grid-cols-12 gap-8 items-center"
          >
             <div className="md:col-span-7 flex items-center gap-8">
                <div className="h-16 w-16 rounded-full bg-success/20 flex items-center justify-center text-success shadow-[0_0_30px_rgba(34,197,94,0.3)]">
                   <CheckCircle2 size={32} />
                </div>
                <div>
                   <p className="font-display font-bold text-foreground text-xl uppercase tracking-tight">Ingesta Completada</p>
                   <p className="text-sm text-muted-foreground font-light italic">Pipeline de inteligencia sincronizado con éxito.</p>
                </div>
             </div>

             <div className="md:col-span-5 grid grid-cols-2 gap-4 border-l border-success/10 pl-8">
                <div className="space-y-1">
                   <span className="flex items-center gap-2 text-[9px] font-bold text-muted-foreground uppercase">
                      <Users size={12} className="text-success" /> Inyectados
                   </span>
                   <p className="text-2xl font-display font-bold text-foreground">{pipelineReport.metrics?.nodesInjected ?? 0}</p>
                </div>
                <div className="space-y-1">
                   <span className="flex items-center gap-2 text-[9px] font-bold text-muted-foreground uppercase">
                      <Info size={12} className="text-primary" /> Latencia
                   </span>
                   <p className="text-lg font-mono font-bold text-foreground">{pipelineReport.metrics?.latencyMs ?? 'N/A'}</p>
                </div>
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}