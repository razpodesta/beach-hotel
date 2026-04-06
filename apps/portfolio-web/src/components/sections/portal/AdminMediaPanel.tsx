/**
 * @file apps/portfolio-web/src/components/sections/portal/AdminMediaPanel.tsx
 * @description Orquestador de ingesta multimedia con composición de átomos.
 *              Refactorizado: Gestión segura de memoria (ObjectURL cleanup),
 *              telemetría de latencia Heimdall v2.0, validación de perímetros
 *              y feedback detallado de errores del clúster S3.
 * @version 4.0 - Memory Safe & Forensic Enabled
 * @author Raz Podestá - Staff Engineer, MetaShark Tech
 */

'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, CloudUpload, CheckCircle2, AlertCircle } from 'lucide-react';

/**
 * IMPORTACIONES DE INFRAESTRUCTRURA (Rutas Relativas - Nx Boundary Compliance)
 * @pilar V: Adherencia Arquitectónica.
 */
import { cn } from '../../../lib/utils/cn';
import { useUIStore } from '../../../lib/store/ui.store';
import { uploadMediaAction } from '../../../lib/portal/actions/media.actions';
import { MediaDropzone } from './media/MediaDropzone';
import { MetadataInput } from './media/MetadataInput';
import { UploadStatusIndicator } from './media/UploadStatusIndicator';
import type { AdminMediaDictionary } from '../../../lib/schemas/admin_media.schema';

/**
 * @interface AdminMediaPanelProps
 */
interface AdminMediaPanelProps {
  /** Diccionario administrativo nivelado v5.0 */
  mediaLabels: AdminMediaDictionary;
}

const C = {
  reset: '\x1b[0m', cyan: '\x1b[36m', green: '\x1b[32m', 
  yellow: '\x1b[33m', magenta: '\x1b[35m', bold: '\x1b[1m'
};

/**
 * APARATO: AdminMediaPanel
 * @description Centro de mando para la inyección de activos en la bóveda S3.
 */
export function AdminMediaPanel({ mediaLabels }: AdminMediaPanelProps) {
  const { session } = useUIStore();
  
  // --- ESTADOS DE CONTROL ---
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [altText, setAltText] = useState('');
  const [status, setStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  // Referencia para limpieza de timers
  const resetTimerRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * MOTOR DE PREVISUALIZACIÓN (Pilar VIII: Gestión de Recursos)
   * @description Crea la URL de previsualización y asegura su purga de memoria.
   */
  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }

    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    // Cleanup: Revoca la URL al cambiar de archivo o desmontar
    return () => URL.revokeObjectURL(url);
  }, [file]);

  /**
   * HANDLER: onFileChange
   */
  const onFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setStatus('idle');
      setErrorMessage(null);
      setProgress(0);
    }
  }, []);

  /**
   * ACCIÓN SOBERANA: handleUpload
   * @description Orquesta el despacho hacia la Server Action con telemetría DNA.
   */
  const handleUpload = async () => {
    if (!file || !altText || !session?.tenantId) return;

    const traceId = `media_sync_${Date.now().toString(36).toUpperCase()}`;
    const startTime = performance.now();

    console.group(`${C.magenta}${C.bold}[DNA][VAULT]${C.reset} Initializing Ingestion | Trace: ${traceId}`);
    
    setStatus('uploading');
    setErrorMessage(null);
    setProgress(20); // Fase: Handshake de red

    const formData = new FormData();
    formData.append('file', file);
    formData.append('alt', altText);
    formData.append('tenantId', session.tenantId);

    try {
      setProgress(45); // Fase: Stream binario
      
      const result = await uploadMediaAction(formData);

      if (result.success) {
        const duration = (performance.now() - startTime).toFixed(2);
        console.log(`${C.green}   ✓ [SUCCESS]${C.reset} Asset persisted in S3 | Latency: ${duration}ms`);
        
        setProgress(100);
        setStatus('success');

        // Reset programado con protección de limpieza
        resetTimerRef.current = setTimeout(() => {
          setFile(null);
          setAltText('');
          setStatus('idle');
        }, 3000);

      } else {
        throw new Error(result.error || 'UNEXPECTED_CLUSTER_DRIFT');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'CLUSTER_SYNC_FAILED';
      console.error(`${C.bold}   ✕ [CRITICAL] Ingestion Aborted:${C.reset} ${msg}`);
      setStatus('error');
      setErrorMessage(msg);
    } finally {
      console.groupEnd();
    }
  };

  // Limpieza de timers al desmontar
  useEffect(() => {
    return () => {
      if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
    };
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="space-y-8 max-w-4xl mx-auto"
    >
      {/* 1. ZONA DE SOLTADO (Dropzone) */}
      <MediaDropzone 
        file={file} 
        previewUrl={previewUrl} 
        onFileChange={onFileChange} 
        labels={{ 
          prompt: mediaLabels.dropzone_prompt, 
          subtext: mediaLabels.dropzone_subtext 
        }} 
      />
      
      {/* 2. CONSOLA DE METADATOS Y TELEMETRÍA */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <MetadataInput 
          value={altText} 
          onChange={setAltText} 
          label={mediaLabels.label_alt_text} 
          placeholder={mediaLabels.placeholder_alt_text} 
        />
        
        <div className="relative">
          <UploadStatusIndicator 
            status={status} 
            progress={progress} 
            label={mediaLabels.status_uploading} 
          />
          
          <AnimatePresence>
            {status === 'error' && errorMessage && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute -bottom-6 left-2 flex items-center gap-2 text-[9px] font-mono font-bold text-red-500 uppercase tracking-widest"
              >
                <AlertCircle size={10} />
                {errorMessage}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* 3. DISPARADOR DE ACCIÓN (Sovereign Button) */}
      <button 
        onClick={handleUpload} 
        disabled={!file || !altText || status === 'uploading' || status === 'success'}
        className={cn(
          "w-full flex items-center justify-center gap-5 py-7 rounded-4xl font-bold uppercase tracking-[0.4em] text-[11px] transition-all transform-gpu",
          (file && altText && status === 'idle') 
            ? "bg-foreground text-background hover:bg-primary hover:text-white active:scale-[0.98] shadow-3xl" 
            : (status === 'success' 
                ? "bg-success text-white cursor-default" 
                : "bg-surface text-muted-foreground/30 border border-border cursor-not-allowed")
        )}
      >
         {status === 'uploading' ? (
           <Loader2 className="animate-spin" size={20} />
         ) : status === 'success' ? (
           <CheckCircle2 size={20} className="animate-in zoom-in" />
         ) : (
           <CloudUpload size={20} className={cn(file && altText && "animate-pulse")} />
         )}
         
         {status === 'success' ? mediaLabels.status_success : mediaLabels.btn_upload}
      </button>

      {/* FOOTER DE INFRAESTRUCTRURA */}
      <div className="flex justify-center pt-4 opacity-20">
         <span className="text-[7px] font-mono uppercase tracking-[0.8em] text-foreground">
           Sovereign Vault Ingestion Engine v4.0
         </span>
      </div>
    </motion.div>
  );
}