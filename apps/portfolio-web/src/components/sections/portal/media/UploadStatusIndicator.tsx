/**
 * @file UploadStatusIndicator.tsx
 * @description Módulo de telemetría forense para el pipeline S3.
 *              Refactorizado: Gestión de estados de error, feedback visual
 *              de latencia y acoplamiento semántico con el diseño boutique.
 * @version 2.0 - Forensic UI & Semantic Error Handling
 * @author Raz Podestá - MetaShark Tech
 */

import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { 
  CheckCircle2, 
  CloudUpload, 
  HardDrive, 
  AlertCircle 
} from 'lucide-react';
import { cn } from '../../../../lib/utils/cn';

interface StatusProps {
  status: 'idle' | 'uploading' | 'success' | 'error';
  progress: number;
  label: string;
}

export const UploadStatusIndicator = memo(({ status, progress, label }: StatusProps) => {
  return (
    <div className={cn(
      "p-8 rounded-4xl border flex flex-col justify-center transition-all duration-700",
      "bg-surface border-border/40",
      status === 'error' ? "border-red-500/30 hover:border-red-500/50" : "hover:border-success/20"
    )}>
      <p className="flex items-center gap-2 text-[10px] font-mono text-muted-foreground uppercase tracking-widest font-bold mb-6">
        <HardDrive size={14} className={cn(
          "transition-colors duration-500",
          status === 'error' ? "text-red-500" : "text-success"
        )} /> 
        Status S3
      </p>
      
      <div className="min-h-40 flex items-center">
        {status === 'uploading' ? (
          <div className="w-full space-y-3 animate-in fade-in">
            <div className="flex justify-between text-[10px] font-bold text-primary uppercase tracking-widest">
              <span>{label}</span>
              <span>{progress}%</span>
            </div>
            <div className="h-1.5 w-full bg-primary/10 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }} 
                className="h-full bg-primary transition-all duration-300" 
              />
            </div>
          </div>
        ) : status === 'success' ? (
          <div className="flex items-center gap-4 text-success animate-in zoom-in duration-500">
            <CheckCircle2 size={32} />
            <span className="text-xs font-bold uppercase tracking-widest">OK</span>
          </div>
        ) : status === 'error' ? (
          <div className="flex items-center gap-4 text-red-500 animate-in shake duration-500">
            <AlertCircle size={32} />
            <span className="text-xs font-bold uppercase tracking-widest">ERROR</span>
          </div>
        ) : (
          <div className="flex items-center gap-4 text-muted-foreground/30">
            <CloudUpload size={32} />
            <span className="text-xs font-bold uppercase tracking-widest italic">Ready for handshake...</span>
          </div>
        )}
      </div>
    </div>
  );
});

UploadStatusIndicator.displayName = 'UploadStatusIndicator';