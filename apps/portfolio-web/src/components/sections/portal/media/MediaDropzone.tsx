/**
 * @file MediaDropzone.tsx
 * @description Micro-aparato para selección, validación y previsualización de archivos.
 *              Refactorizado: Gestión automática de memoria (ObjectURLs),
 *              validación estricta de peso (5MB) y feedback visual A11Y.
 * @version 2.0 - Memory Safe & Size Constrained
 * @author Staff Engineer - MetaShark Tech
 */

'use client';

import React, { useEffect } from 'react';
import Image from 'next/image';
import { CloudUpload, AlertCircle } from 'lucide-react';
import { cn } from '../../../../lib/utils/cn';

interface MediaDropzoneProps {
  file: File | null;
  previewUrl: string | null;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  labels: { prompt: string; subtext: string };
  className?: string;
}

export function MediaDropzone({ file, previewUrl, onFileChange, labels, className }: MediaDropzoneProps) {
  
  // Liberación automática de memoria (Pilar VIII: Gestión de recursos)
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const isTooLarge = file && file.size > 5 * 1024 * 1024;

  return (
    <div className={cn(
      "relative h-64 w-full rounded-[3rem] border-2 border-dashed flex flex-col items-center justify-center transition-all duration-700 overflow-hidden transform-gpu",
      file ? (isTooLarge ? "border-red-500/40 bg-red-500/5" : "border-primary/40 bg-surface/50") : "border-border/60 bg-surface/20 hover:border-primary/20",
      className
    )}>
      <input 
        type="file" 
        onChange={onFileChange} 
        className="absolute inset-0 opacity-0 cursor-pointer z-20" 
        accept="image/webp,image/avif,image/png,image/jpeg"
      />
      
      {previewUrl && (
        <div className="absolute inset-0 z-0">
          <Image 
            src={previewUrl} 
            alt="Preview" 
            fill 
            unoptimized 
            className={cn("object-cover transition-opacity", isTooLarge ? "opacity-10" : "opacity-20 blur-sm")} 
          />
        </div>
      )}

      <div className="relative z-10 flex flex-col items-center gap-4 text-center px-6">
        <div className={cn(
          "h-16 w-16 rounded-3xl flex items-center justify-center shadow-2xl transition-all",
          isTooLarge ? "bg-red-500/10 text-red-500" : "bg-primary/10 text-primary"
        )}>
          {isTooLarge ? <AlertCircle size={32} /> : <CloudUpload size={32} />}
        </div>
        
        <div className="space-y-1">
          <p className={cn("font-display font-bold text-xl uppercase tracking-tight", isTooLarge ? "text-red-500" : "text-foreground")}>
            {isTooLarge ? "Archivo Excede 5MB" : (file ? file.name : labels.prompt)}
          </p>
          {!isTooLarge && (
            <p className="text-xs text-muted-foreground font-light italic">
              {labels.subtext}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}