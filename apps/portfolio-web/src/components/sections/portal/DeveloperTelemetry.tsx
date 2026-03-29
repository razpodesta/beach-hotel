/**
 * @file DeveloperTelemetry.tsx
 * @description Micro-vista de diagnóstico de infraestructura (Nivel S0).
 *              Refactorizado: Saneamiento de fronteras Nx (Rutas relativas),
 *              erradicación de importaciones huérfanas y limpieza de linter.
 * @version 1.2 - Contract Sync & Hygiene Hardened
 * @author Raz Podestá - MetaShark Tech
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Activity, Zap, Database, Globe } from 'lucide-react';

/**
 * IMPORTACIONES DE INFRAESTRUCTRURA
 * @pilar V: Adherencia a rutas relativas para integridad del grafo Nx.
 */
import { cn } from '../../../lib/utils/cn';
import type { PortalData } from '../../../lib/schemas/portal_data.schema';
import type { PortalDictionary } from '../../../lib/schemas/portal.schema';

interface DeveloperTelemetryProps {
  data: NonNullable<PortalData['developerData']>;
  /** Diccionario inyectado para cumplir con el contrato, aunque su uso sea diferido */
  t: PortalDictionary;
}

/**
 * APARATO: DeveloperTelemetry
 * @description Centro de mando para monitorear el pulso de la infraestructura MetaShark.
 */
export function DeveloperTelemetry({ 
  data, 
  //t
   }: DeveloperTelemetryProps) {
  // Uso del diccionario para satisfacer el linter si fuera necesario en el futuro,
  // por ahora lo dejamos disponible para la arquitectura.
  //const _labels = t; 

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* 1. GRID DE MÉTRICAS CRÍTICAS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {data.serverHealth.map((metric, i) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-8 rounded-[2.5rem] border border-border bg-surface/40 backdrop-blur-xl relative overflow-hidden group"
          >
            {/* Status Light */}
            <div className="absolute top-8 right-8">
              <div className={cn(
                "h-2 w-2 rounded-full animate-pulse",
                metric.status === 'nominal' ? "bg-success shadow-[0_0_12px_var(--color-success)]" : "bg-yellow-500 shadow-[0_0_12px_oklch(70%_0.15_80)]"
              )} />
            </div>

            <header className="flex items-center gap-4 mb-6">
              <div className="p-3 rounded-2xl bg-background border border-border text-primary">
                <Activity size={20} />
              </div>
              <span className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-widest">
                {metric.label}
              </span>
            </header>

            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-display font-bold text-foreground tracking-tighter">
                {metric.value}
              </span>
              <span className="text-xs font-mono text-muted-foreground uppercase">{metric.unit}</span>
            </div>
            
            {/* Mini Progress Bar */}
            <div className="mt-6 h-1 w-full bg-foreground/5 rounded-full overflow-hidden">
               <motion.div 
                 initial={{ width: 0 }}
                 animate={{ width: `${metric.value}%` }}
                 className="h-full bg-primary"
               />
            </div>
          </motion.div>
        ))}
      </div>

      {/* 2. ESTADO DE RED Y BASE DE DATOS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Nodo Supabase */}
        <div className="p-10 rounded-[3.5rem] border border-border bg-surface/20 space-y-8">
          <div className="flex items-center justify-between">
            <h4 className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.3em] text-foreground">
              <Database size={16} className="text-blue-400" /> Supabase Node
            </h4>
            <span className="text-[9px] font-mono text-success font-bold">CONNECTED</span>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between text-[10px] font-mono">
              <span className="text-muted-foreground uppercase">Active Connections</span>
              <span className="text-foreground">{data.activeConnections} sockets</span>
            </div>
            <div className="flex justify-between text-[10px] font-mono">
              <span className="text-muted-foreground uppercase">Transaction Mode</span>
              <span className="text-foreground">POOLER / Port 6543</span>
            </div>
          </div>
        </div>

        {/* Nodo Edge Vercel */}
        <div className="p-10 rounded-[3.5rem] border border-border bg-surface/20 space-y-8">
           <div className="flex items-center justify-between">
            <h4 className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.3em] text-foreground">
              <Globe size={16} className="text-emerald-400" /> Vercel Edge
            </h4>
            <span className="text-[9px] font-mono text-success font-bold">OPTIMIZED</span>
          </div>
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-success/5 border border-success/10 text-success">
             <Zap size={14} className="fill-current" />
             <span className="text-[10px] font-bold uppercase tracking-widest">Handshake Latency: 12ms</span>
          </div>
        </div>
      </div>
    </div>
  );
}