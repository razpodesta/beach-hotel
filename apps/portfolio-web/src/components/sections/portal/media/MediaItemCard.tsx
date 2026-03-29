/**
 * @file MediaItemCard.tsx
 * @description Unidad atómica para visualizar activos en el inventario.
 *              Muestra metadatos físicos y provee acciones de gestión S3.
 * @version 1.0 - Media Metadata Display
 */

'use client';

import React from 'react';
import Image from 'next/image';
import { Trash2, ExternalLink, Copy, FileText, Image as ImageIcon, Film } from 'lucide-react';
import { motion } from 'framer-motion';

/**
 * IMPORTACIONES DE INFRAESTRUCTRURA
 */
//import { cn } from '../../../../lib/utils/cn';
import type { SovereignMedia } from '../../../../lib/portal';

interface MediaItemCardProps {
  item: SovereignMedia;
  onDelete: (id: string) => void;
  labels: { delete: string; copy: string; view: string };
}

export function MediaItemCard({ item, onDelete, labels }: MediaItemCardProps) {
  const isImage = item.mimeType.startsWith('image/');
  const isVideo = item.mimeType.startsWith('video/');

  const copyToClipboard = () => {
    navigator.clipboard.writeText(item.url);
    console.log(`[HEIMDALL][UX] URL Copied: ${item.id}`);
  };

  return (
    <motion.article
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="group relative flex flex-col overflow-hidden rounded-[2.5rem] border border-border bg-surface/40 hover:border-primary/30 transition-all duration-500 shadow-xl transform-gpu"
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
        <div className="absolute inset-0 bg-linear-to-t from-background/80 via-transparent to-transparent opacity-60" />
        
        {/* Type Badge */}
        <div className="absolute top-4 left-4">
          <div className="bg-background/60 backdrop-blur-xl border border-border/40 p-2 rounded-xl text-primary shadow-lg">
            {isImage ? <ImageIcon size={12} /> : <Film size={12} />}
          </div>
        </div>
      </div>

      {/* 2. METADATA LAYER */}
      <div className="p-6 space-y-4">
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-foreground truncate uppercase tracking-tight" title={item.alt}>
            {item.alt}
          </h4>
          <div className="flex items-center gap-3 text-[9px] font-mono text-muted-foreground">
             <span>{(item.filesize / 1024).toFixed(1)} KB</span>
             <span className="h-1 w-1 rounded-full bg-border" />
             <span>{item.dimensions.width}x{item.dimensions.height} PX</span>
          </div>
        </div>

        {/* 3. ACTION BAR */}
        <footer className="flex items-center justify-between pt-4 border-t border-border/40">
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
            onClick={() => onDelete(item.id)}
            className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white transition-all active:scale-95"
            title={labels.delete}
          >
            <Trash2 size={14} />
          </button>
        </footer>
      </div>
    </motion.article>
  );
}