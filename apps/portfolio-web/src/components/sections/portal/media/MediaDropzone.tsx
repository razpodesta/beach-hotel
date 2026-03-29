/**
 * @file MediaDropzone.tsx
 * @description Micro-aparato para la selección y previsualización de archivos.
 */

'use client';

import React from 'react';
import Image from 'next/image';
import { CloudUpload } from 'lucide-react';
import { cn } from '../../../../lib/utils/cn';

interface MediaDropzoneProps {
  file: File | null;
  previewUrl: string | null;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  labels: { prompt: string; subtext: string };
}

export function MediaDropzone({ file, previewUrl, onFileChange, labels }: MediaDropzoneProps) {
  return (
    <div className={cn(
      "relative h-64 w-full rounded-[3rem] border-2 border-dashed flex flex-col items-center justify-center transition-all duration-700 overflow-hidden transform-gpu",
      file ? "border-primary/40 bg-surface/50" : "border-border/60 bg-surface/20 hover:border-primary/20"
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
            unoptimized // Necesario para blob: URLs locales
            className="object-cover opacity-20 blur-sm scale-110" 
          />
        </div>
      )}

      <div className="relative z-10 flex flex-col items-center gap-4 text-center px-6">
        <div className="h-16 w-16 rounded-3xl bg-primary/10 flex items-center justify-center text-primary shadow-2xl transition-transform group-hover:scale-110">
          <CloudUpload size={32} />
        </div>
        <div className="space-y-1">
          <p className="font-display font-bold text-xl uppercase tracking-tight text-foreground">
            {file ? file.name : labels.prompt}
          </p>
          <p className="text-xs text-muted-foreground font-light italic">
            {labels.subtext}
          </p>
        </div>
      </div>
    </div>
  );
}