/**
 * @file ContextualQR.tsx
 * @description Componente profesional de exhibición de puntos de acceso.
 *              Integra lógica de escaneo visual y estados de conectividad.
 * @version 1.0 - Enterprise UI Component
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { QrCode as QrIcon, Activity, Globe } from 'lucide-react';
import { cn } from '../../lib/utils/cn';
import { AnimatedQrCode } from './AnimatedQrCode';

interface ContextualQRProps {
  /** Identificador de la ruta dinámica configurada en el CMS */
  routeKey: string;
  /** Etiqueta descriptiva para el usuario */
  label: string;
  className?: string;
}

export function ContextualQR({ routeKey, label, className }: ContextualQRProps) {
  const redirectUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/r/${routeKey}`;

  return (
    <div className={cn(
      "relative p-8 rounded-3xl bg-surface border border-border shadow-sm transition-all hover:shadow-md",
      className
    )}>
      {/* Status Badge */}
      <div className="absolute -top-3 left-6 flex items-center gap-2 bg-background border border-border px-4 py-1.5 rounded-full">
         <Activity size={12} className="text-success animate-pulse" />
         <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Dynamic Point Active</span>
      </div>

      <div className="relative mb-6 mx-auto w-max rounded-2xl p-4 bg-white shadow-inner">
         <AnimatedQrCode url={redirectUrl} size={160} alt="Access QR Code" />
         {/* Scanning Animation Effect */}
         <motion.div 
           animate={{ top: ['0%', '100%', '0%'] }}
           transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
           className="absolute left-0 right-0 h-0.5 bg-primary/30 pointer-events-none" 
         />
      </div>

      <div className="space-y-4">
        <h4 className="font-display text-base font-bold text-foreground tracking-tight">{label}</h4>
        <div className="flex items-center justify-center gap-4 pt-4 border-t border-border/50">
           <div className="flex items-center gap-2 opacity-60">
              <Globe size={14} />
              <span className="text-[8px] font-mono font-bold uppercase">Cloud Sync</span>
           </div>
           <div className="h-1 w-1 rounded-full bg-border" />
           <div className="flex items-center gap-2 opacity-60">
              <QrIcon size={14} />
              <span className="text-[8px] font-mono font-bold uppercase">v2.0 Standard</span>
           </div>
        </div>
      </div>
    </div>
  );
}