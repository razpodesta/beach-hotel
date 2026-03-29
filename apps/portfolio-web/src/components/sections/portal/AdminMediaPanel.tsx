/**
 * @file AdminMediaPanel.tsx
 * @description Orquestador de gestión multimedia para el Administrador.
 *              Refactorizado: Integración de uploadMediaAction (Server Action),
 *              resolución de errores de frontera Nx y atomización de UI.
 * @version 2.0 - S3 Live Sync & Nx Compliant
 * @author Raz Podestá - MetaShark Tech
 */

'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  CheckCircle2, 
  Loader2, 
  Camera,
  HardDrive,
  CloudUpload
} from 'lucide-react';

/**
 * IMPORTACIONES DE INFRAESTRUCTRURA (Rumbos Relativos Nivelados)
 * @pilar V: Adherencia a @nx/enforce-module-boundaries.
 */
import { cn } from '../../../lib/utils/cn';
import { useUIStore } from '../../../lib/store/ui.store';
import { uploadMediaAction } from '../../../lib/portal/actions/media.actions';

/**
 * IMPORTACIONES DE CONTRATO
 */
import type { AdminMediaDictionary } from '../../../lib/schemas/admin_media.schema';
import { MediaDropzone } from './media/MediaDropzone';

interface AdminMediaPanelProps {
  /** Diccionario nivelado de gestión media */
  mediaLabels: AdminMediaDictionary;
}

/**
 * APARATO: AdminMediaPanel
 * @description Punto de entrada para la ingesta de activos en el Santuario.
 */
export function AdminMediaPanel({ mediaLabels }: AdminMediaPanelProps) {
  const { session } = useUIStore();
  const [file, setFile] = useState<File | null>(null);
  const [altText, setAltText] = useState('');
  const [status, setStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [progress, setProgress] = useState(0);

  const previewUrl = useMemo(() => file ? URL.createObjectURL(file) : null, [file]);

  const onFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setStatus('idle');
      setProgress(0);
    }
  }, []);

  /**
   * PROTOCOLO DE INGESTA REAL (Pilar VIII)
   * @description Llama a la Server Action y gestiona el ciclo de vida de la carga.
   */
  const handleUpload = async () => {
    if (!file || !altText || !session?.tenantId) return;

    setStatus('uploading');
    setProgress(30); // Handshake visual

    const formData = new FormData();
    formData.append('file', file);
    formData.append('alt', altText);
    formData.append('tenantId', session.tenantId);

    try {
      const result = await uploadMediaAction(formData);
      
      if (result.success) {
        setProgress(100);
        setStatus('success');
        // Reset tras éxito (Pilar X)
        setTimeout(() => {
          setFile(null);
          setAltText('');
          setStatus('idle');
        }, 3000);
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      console.error('[HEIMDALL][S3-SYNC-FAIL]', err);
      setStatus('error');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="space-y-8 max-w-4xl mx-auto"
    >
      {/* 1. SECCIÓN: DROPZONE ATÓMICA */}
      <MediaDropzone 
        file={file} 
        previewUrl={previewUrl} 
        onFileChange={onFileChange} 
        labels={{ prompt: mediaLabels.dropzone_prompt, subtext: mediaLabels.dropzone_subtext }} 
      />

      {/* 2. GRID DE TELEMETRÍA Y METADATOS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Módulo: Metadatos SEO */}
        <div className="p-8 rounded-4xl bg-surface border border-border/40 space-y-6 transition-all hover:border-primary/20">
          <p className="flex items-center gap-2 text-[10px] font-mono text-muted-foreground uppercase tracking-widest font-bold">
            <Camera size={14} className="text-primary" /> {mediaLabels.label_alt_text}
          </p>
          <div className="space-y-4">
            <input 
              type="text" 
              value={altText}
              onChange={(e) => setAltText(e.target.value)}
              placeholder={mediaLabels.placeholder_alt_text}
              className="w-full bg-background/50 border border-border/50 rounded-2xl py-4 px-6 text-sm outline-none focus:border-primary/40 transition-all text-foreground"
            />
          </div>
        </div>

        {/* Módulo: Status del Cluster S3 */}
        <div className="p-8 rounded-4xl bg-surface border border-border/40 flex flex-col justify-center transition-all hover:border-success/20">
          <p className="flex items-center gap-2 text-[10px] font-mono text-muted-foreground uppercase tracking-widest font-bold mb-6">
            <HardDrive size={14} className="text-success" /> Status S3
          </p>
          
          <div className="min-h-40">
            {status === 'uploading' ? (
              <div className="space-y-3">
                <div className="flex justify-between text-[10px] font-bold text-primary uppercase tracking-widest">
                  <span>{mediaLabels.status_uploading}</span>
                  <span>{progress}%</span>
                </div>
                <div className="h-1.5 w-full bg-primary/10 rounded-full overflow-hidden">
                  <motion.div animate={{ width: `${progress}%` }} className="h-full bg-primary" />
                </div>
              </div>
            ) : status === 'success' ? (
              <div className="flex items-center gap-4 text-success animate-in zoom-in duration-500">
                <CheckCircle2 size={32} />
                <span className="text-xs font-bold uppercase tracking-widest">{mediaLabels.status_success}</span>
              </div>
            ) : (
              <div className="flex items-center gap-4 text-muted-foreground/30">
                <CloudUpload size={32} />
                <span className="text-xs font-bold uppercase tracking-widest italic">Ready for handshake...</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. FOOTER: DESPACHO SOBERANO */}
      <div className="flex items-center justify-between p-8 rounded-4xl bg-primary/5 border border-primary/20 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="relative h-3 w-3">
            <div className={cn("absolute inset-0 rounded-full bg-primary opacity-75", status === 'uploading' && "animate-ping")} />
            <div className="relative h-3 w-3 rounded-full bg-primary" />
          </div>
          <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-[0.2em]">
            {mediaLabels.label_sync_cloud}: {session?.tenantId?.substring(0, 8)}...
          </span>
        </div>

        <button 
          onClick={handleUpload}
          disabled={!file || !altText || status === 'uploading'}
          className={cn(
            "flex items-center gap-4 px-10 py-4 rounded-2xl transition-all duration-500 font-bold text-[10px] uppercase tracking-[0.3em]",
            file && altText && status !== 'uploading'
              ? "bg-foreground text-background hover:bg-primary hover:text-white shadow-2xl active:scale-95"
              : "bg-surface text-muted-foreground/40 cursor-not-allowed border border-border"
          )}
        >
          {status === 'uploading' ? <Loader2 size={16} className="animate-spin" /> : <CloudUpload size={16} />}
          {mediaLabels.btn_upload}
        </button>
      </div>
    </motion.div>
  );
}