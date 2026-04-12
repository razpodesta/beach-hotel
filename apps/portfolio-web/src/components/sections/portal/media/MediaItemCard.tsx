/**
 * @file MediaItemCard.tsx
 * @description Unidad atómica para visualizar activos en el inventario.
 *              Implementa el SAFE-DELETE SHIELD (Doble Confirmación) para 
 *              protección de la bóveda S3.
 *              Concepto: "Sovereign Pointer" - Los activos no se borran al sustituirlos,
 *              quedan en el inventario a menos que esta acción destructiva se ejecute.
 * @version 2.0 - Safe Destruction Protocol
 * @author Raz Podestá - MetaShark Tech
 * @pilar III: Seguridad de Tipos - Props explícitas y etiquetas i18n.
 * @pilar VIII: Resiliencia - Escudo contra eliminaciones accidentales.
 * @pilar XII: MEA/UX - Transiciones de estado de alerta cromática.
 */

'use client';

import React, { useState, useCallback } from 'react';
import Image from 'next/image';
import { 
  Trash2, 
  ExternalLink, 
  Copy, 
  FileText, 
  Image as ImageIcon, 
  Film, 
  AlertTriangle, 
  X 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * IMPORTACIONES DE INFRAESTRUCTRURA
 */
import { cn } from '../../../../lib/utils/cn';
import type { SovereignMedia } from '../../../../lib/portal';

/**
 * @interface MediaItemCardProps
 */
interface MediaItemCardProps {
  /** Activo multimedia proveniente del clúster */
  item: SovereignMedia;
  /** Acción destructiva de purga en S3 y DB */
  onDelete: (id: string) => void;
  /** Diccionario nivelado v2.0 */
  labels: { 
    delete: string; 
    copy: string; 
    view: string;
    confirm_delete_title: string;
    confirm_delete_cta: string;
    cancel_cta: string;
  };
}

export function MediaItemCard({ item, onDelete, labels }: MediaItemCardProps) {
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  
  const isImage = item.mimeType.startsWith('image/');
  const isVideo = item.mimeType.startsWith('video/');

  const copyToClipboard = useCallback(() => {
    navigator.clipboard.writeText(item.url);
    console.log(`[HEIMDALL][UX] URL Copied: ${item.id}`);
  }, [item.url, item.id]);

  return (
    <motion.article
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-[2.5rem] border transition-all duration-500 shadow-xl transform-gpu",
        isConfirmingDelete 
          ? "border-red-500/50 bg-red-500/5" 
          : "border-border bg-surface/40 hover:border-primary/30"
      )}
    >
      {/* 1. VISUAL PREVIEW LAYER */}
      <div className="relative h-44 w-full overflow-hidden bg-background/50">
        {isImage ? (
          <Image 
            src={item.url} 
            alt={item.alt} 
            fill 
            className="object-cover transition-transform duration-700 group-hover:scale-110"
            sizes="300px"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center text-muted-foreground gap-2">
            {isVideo ? <Film size={32} /> : <FileText size={32} />}
            <span className="text-[8px] font-mono uppercase tracking-widest">{item.mimeType}</span>
          </div>
        )}
        
        {/* Overlay dinámico según estado */}
        <div className={cn(
            "absolute inset-0 transition-opacity duration-500",
            isConfirmingDelete ? "bg-red-950/40" : "bg-linear-to-t from-background/80 via-transparent to-transparent opacity-60"
        )} />
        
        {/* Alerta de Destrucción (Fase de Confirmación) */}
        <AnimatePresence>
            {isConfirmingDelete && (
                <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute inset-0 z-30 flex flex-col items-center justify-center p-6 text-center gap-2"
                >
                    <AlertTriangle size={32} className="text-red-500 animate-pulse" />
                    <p className="text-[10px] font-bold text-white uppercase tracking-widest">
                        {labels.confirm_delete_title}
                    </p>
                </motion.div>
            )}
        </AnimatePresence>

        {/* Type Badge */}
        {!isConfirmingDelete && (
            <div className="absolute top-4 left-4">
              <div className="bg-background/60 backdrop-blur-xl border border-border/40 p-2 rounded-xl text-primary shadow-lg">
                {isImage ? <ImageIcon size={12} /> : <Film size={12} />}
              </div>
            </div>
        )}
      </div>

      {/* 2. METADATA & ACTIONS LAYER */}
      <div className="p-6 space-y-4 relative">
        <div className="space-y-1">
          <h4 className={cn(
            "text-sm font-bold truncate uppercase tracking-tight transition-colors",
            isConfirmingDelete ? "text-red-500" : "text-foreground"
          )} title={item.alt}>
            {item.alt}
          </h4>
          <div className="flex items-center gap-3 text-[9px] font-mono text-muted-foreground">
             <span>{(item.filesize / 1024).toFixed(1)} KB</span>
             <span className="h-1 w-1 rounded-full bg-border" />
             <span>{item.dimensions.width}x{item.dimensions.height} PX</span>
          </div>
        </div>

        {/* 3. ACTION BAR: Orquestación Táctica de Botones */}
        <footer className="flex items-center justify-between pt-4 border-t border-border/40">
          <AnimatePresence mode="wait">
            {!isConfirmingDelete ? (
              <motion.div 
                key="actions"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="flex items-center justify-between w-full"
              >
                <div className="flex gap-2">
                    <button 
                      onClick={copyToClipboard}
                      className="p-2.5 rounded-xl bg-surface border border-border hover:text-primary hover:border-primary/20 transition-all active:scale-90"
                      title={labels.copy}
                    >
                      <Copy size={14} />
                    </button>
                    <a 
                      href={item.url} 
                      target="_blank" 
                      rel="noreferrer"
                      className="p-2.5 rounded-xl bg-surface border border-border hover:text-primary hover:border-primary/20 transition-all active:scale-90"
                      title={labels.view}
                    >
                      <ExternalLink size={14} />
                    </a>
                </div>

                <button 
                  onClick={() => setIsConfirmingDelete(true)}
                  className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white transition-all active:scale-95"
                  title={labels.delete}
                >
                  <Trash2 size={14} />
                </button>
              </motion.div>
            ) : (
              <motion.div 
                key="confirm"
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                className="flex items-center gap-2 w-full"
              >
                <button 
                  onClick={() => onDelete(item.id)}
                  className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-[9px] font-bold uppercase tracking-widest hover:bg-red-600 transition-all shadow-lg active:scale-95"
                >
                  {labels.confirm_delete_cta}
                </button>
                <button 
                  onClick={() => setIsConfirmingDelete(false)}
                  className="p-2.5 rounded-xl bg-surface border border-border text-muted-foreground hover:text-foreground transition-all active:scale-90"
                  title={labels.cancel_cta}
                >
                  <X size={14} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </footer>
      </div>
    </motion.article>
  );
}