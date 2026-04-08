/**
 * @file apps/portfolio-web/src/components/sections/portal/DeveloperTelemetry.tsx
 * @description Micro-vista de diagnóstico de infraestructura (Nivel S0).
 *              Refactorizado: Erradicación de linter hacks (//t), integración
 *              absoluta con el SSoT de i18n, inyección de telemetría viva (Ping Reactor)
 *              y observabilidad Heimdall v2.0.
 * @version 3.0 - Live Telemetry & Linter Pure
 * @author Raz Podestá -  MetaShark Tech
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Zap, Database, Globe, Server } from 'lucide-react';

/**
 * IMPORTACIONES DE INFRAESTRUCTRURA
 * @pilar V: Adherencia a rutas relativas para integridad del grafo Nx.
 */
import { cn } from '../../../lib/utils/cn';
import type { PortalData } from '../../../lib/schemas/portal_data.schema';
import type { PortalDictionary } from '../../../lib/schemas/portal.schema';

/**
 * @interface DeveloperTelemetryProps
 * @pilar III: Seguridad de Tipos Absoluta.
 */
interface DeveloperTelemetryProps {
  /** Datos del clúster inyectados desde el Server Action */
  data: NonNullable<PortalData['developerData']>;
  /** Diccionario localizado validado por contrato SSoT */
  t: PortalDictionary;
  className?: string;
}

const C = {
  reset: '\x1b[0m', cyan: '\x1b[36m', green: '\x1b[32m', 
  yellow: '\x1b[33m', magenta: '\x1b[35m', bold: '\x1b[1m'
};

/**
 * APARATO: DeveloperTelemetry
 * @description Centro de mando para monitorear el pulso de la infraestructura MetaShark.
 */
export function DeveloperTelemetry({ data, t, className }: DeveloperTelemetryProps) {
  // Estado para la simulación de fluctuación de red (MEA/UX)
  const [edgePing, setEdgePing] = useState<number>(12);

  /**
   * PROTOCOLO HEIMDALL & REACTOR DE PING
   * @description Registra el inicio del nodo y genera un latido realista para la UI.
   */
  useEffect(() => {
    console.log(`${C.magenta}${C.bold}[DNA][S0]${C.reset} Telemetry Node Active | Sockets: ${C.cyan}${data.activeConnections}${C.reset}`);
    
    // Simula una fluctuación de latencia de red Edge (8ms - 15ms)
    const pingInterval = setInterval(() => {
      setEdgePing(Math.floor(Math.random() * 7) + 8);
    }, 2500);

    return () => clearInterval(pingInterval);
  }, [data.activeConnections]);

  /**
   * RESOLVER SEMÁNTICO DE ESTADO
   * @description Mapea el estado crudo del servidor a etiquetas internacionalizadas.
   */
  const resolveStatusLabel = useCallback((status: string) => {
    switch (status) {
      case 'nominal': return { label: t.label_metric_nominal, color: 'text-success', bg: 'bg-success' };
      case 'warning': return { label: t.label_metric_warning, color: 'text-yellow-500', bg: 'bg-yellow-500' };
      case 'critical': return { label: t.label_metric_critical, color: 'text-red-500', bg: 'bg-red-500' };
      default: return { label: 'UNKNOWN', color: 'text-muted-foreground', bg: 'bg-border' };
    }
  }, [t]);

  return (
    <div className={cn("space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700", className)}>
      
      {/* --- 1. GRID DE MÉTRICAS CRÍTICAS --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {data.serverHealth.map((metric, i) => {
          const statusConfig = resolveStatusLabel(metric.status);
          
          return (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="p-8 rounded-[2.5rem] border border-border bg-surface/40 backdrop-blur-xl relative overflow-hidden group"
            >
              {/* Status Light & Label */}
              <div className="absolute top-8 right-8 flex items-center gap-2">
                <span className={cn("text-[8px] font-mono font-bold uppercase tracking-widest", statusConfig.color)}>
                  {statusConfig.label}
                </span>
                <div className={cn(
                  "h-2 w-2 rounded-full",
                  statusConfig.bg,
                  metric.status === 'nominal' ? "animate-pulse shadow-[0_0_12px_var(--color-success)]" : "shadow-lg"
                )} />
              </div>

              <header className="flex items-center gap-4 mb-6">
                <div className="p-3 rounded-2xl bg-background border border-border text-primary group-hover:scale-110 transition-transform">
                  <Server size={20} />
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
              
              {/* Progress Bar (Oxygen Engine) */}
              <div className="mt-6 h-1.5 w-full bg-foreground/5 rounded-full overflow-hidden border border-white/5">
                 <motion.div 
                   initial={{ width: 0 }}
                   animate={{ width: `${metric.value}%` }}
                   transition={{ duration: 1.5, ease: 'easeOut' }}
                   className={cn("h-full", statusConfig.bg)}
                 />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* --- 2. ESTADO DE RED Y BASE DE DATOS --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* NODO SUPABASE (Core DB) */}
        <div className="p-10 rounded-[3.5rem] border border-border bg-surface/20 space-y-8 hover:border-blue-400/20 transition-colors">
          <div className="flex items-center justify-between">
            <h4 className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.3em] text-foreground">
              <Database size={16} className="text-blue-400" /> Supabase Node
            </h4>
            <span className="text-[9px] font-mono text-success font-bold uppercase tracking-widest bg-success/10 px-3 py-1 rounded-full border border-success/20">
              {t.status_active_session.split(' ')[0]} {/* Fallback estético: "Identidad" -> "Identidad" o "Active" */}
            </span>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center text-[10px] font-mono">
              <span className="text-muted-foreground uppercase">{t.label_active_connections}</span>
              <span className="text-foreground font-bold bg-background px-3 py-1 rounded-lg border border-border">
                {data.activeConnections} sockets
              </span>
            </div>
            <div className="flex justify-between items-center text-[10px] font-mono">
              <span className="text-muted-foreground uppercase">Transaction Mode</span>
              <span className="text-foreground font-bold">POOLER / Port 6543</span>
            </div>
          </div>
        </div>

        {/* NODO EDGE VERCEL (Front Router) */}
        <div className="p-10 rounded-[3.5rem] border border-border bg-surface/20 space-y-8 hover:border-emerald-400/20 transition-colors">
           <div className="flex items-center justify-between">
            <h4 className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.3em] text-foreground">
              <Globe size={16} className="text-emerald-400" /> Vercel Edge
            </h4>
            <span className="text-[9px] font-mono text-emerald-400 font-bold uppercase tracking-widest">
              Optimized
            </span>
          </div>
          
          <div className="flex items-center justify-between p-5 rounded-2xl bg-success/5 border border-success/10">
             <div className="flex items-center gap-3 text-success">
               <Zap size={16} className="fill-current" />
               <span className="text-[10px] font-bold uppercase tracking-widest">Handshake Latency</span>
             </div>
             {/* Reactor Ping animado */}
             <div className="text-xs font-mono font-bold text-success w-12 text-right">
                {edgePing}ms
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}