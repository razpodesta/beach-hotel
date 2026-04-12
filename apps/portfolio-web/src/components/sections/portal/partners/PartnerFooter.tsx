/**
 * @file apps/portfolio-web/src/components/sections/portal/partners/PartnerFooter.tsx
 * @description Telemetría de cierre y acciones globales del Silo B (Partner Network).
 *              Refactorizado: Sello de tipos de infraestructura, lógica de exportación
 *              con trazabilidad Heimdall y animaciones de entrada coordinadas.
 *              Estándar: Oxygen UI v4 & Forensic Observability.
 * @version 2.1 - Forensic Export & Motion Injected
 * @author Staff Engineer - MetaShark Tech
 */

'use client';

import React, { memo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  Zap, 
  ShieldCheck, 
  BarChart3, 
  ChevronRight, 
  Radio, 
  DownloadCloud 
} from 'lucide-react';

/** IMPORTACIONES DE INFRAESTRUCTRURA */
import { cn } from '../../../../lib/utils/cn';

/**
 * @interface PartnerFooterProps
 * @pilar III: Seguridad de Tipos Absoluta.
 */
export interface PartnerFooterProps {
  /** Identificador único del perímetro (Tenant SSoT) */
  tenantId?: string | null;
  /** Filtro de jurisdicción activo para contextualizar la exportación */
  activeFilter: string;
  /** Clases adicionales para el orquestador de layout */
  className?: string;
}

/**
 * APARATO: PartnerFooter
 * @description Provee el cierre visual del Silo B con indicadores de salud de red y 
 *              puntos de entrada para auditoría de datos.
 */
export const PartnerFooter = memo(({ 
  tenantId, 
  activeFilter, 
  className 
}: PartnerFooterProps) => {

  /**
   * HANDLER: handleExportLedger
   * @description Simula el despacho de un reporte de red con telemetría forense.
   * @pilar IV: Trazabilidad DNA-Level.
   */
  const handleExportLedger = useCallback(() => {
    const traceId = `export_${Date.now().toString(36).toUpperCase()}`;
    console.group(`[HEIMDALL][ACTION] Partner Ledger Export: ${traceId}`);
    console.log(`Perimeter: ${tenantId || 'MASTER_ROOT'}`);
    console.log(`Region_Context: ${activeFilter}`);
    console.log(`Status: DISPATCHED`);
    console.groupEnd();
    
    // Aquí se integraría la lógica real de generación de CSV/PDF en Fase 7
  }, [tenantId, activeFilter]);

  return (
    <motion.footer 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "pt-12 border-t border-border/40 flex flex-col lg:flex-row justify-between items-center gap-10 opacity-60 hover:opacity-100 transition-opacity duration-1000",
        className
      )}
    >
      {/* --- 1. SECCIÓN DE SEÑALÉTICA (Heimdall Pulse) --- */}
      <div className="flex items-center gap-8">
        {/* Nodo de Análisis */}
        <div className="flex items-center gap-4 group/node">
          <div className="relative">
            <Zap size={18} className="text-primary group-hover/node:scale-110 transition-transform" />
            <div className="absolute inset-0 bg-primary/20 blur-md animate-pulse rounded-full" />
          </div>
          <span className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-foreground">
            Silo B Analysis: <span className="text-success">NOMINAL</span>
          </span>
        </div>
        
        <div className="h-4 w-px bg-border/40 hidden sm:block" />
        
        {/* Nodo de Perímetro */}
        <div className="flex items-center gap-4">
          <ShieldCheck size={18} className="text-success opacity-80" />
          <span className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-foreground">
            Perimeter: <b className="text-primary/80">{tenantId?.substring(0, 8) || 'MASTER'}</b>
          </span>
        </div>
      </div>
      
      {/* --- 2. SECCIÓN DE COMANDOS (Operational Actions) --- */}
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-4 text-muted-foreground/40">
           <Radio size={14} className="animate-pulse" />
           <BarChart3 size={16} />
        </div>
        
        <button 
          onClick={handleExportLedger}
          className={cn(
            "group flex items-center gap-4 px-6 py-2.5 rounded-2xl border border-border/50",
            "bg-surface/50 text-[10px] font-bold uppercase tracking-widest text-foreground",
            "hover:bg-foreground hover:text-background hover:border-foreground transition-all duration-500",
            "active:scale-95 transform-gpu outline-none focus-visible:ring-2 focus-visible:ring-primary"
          )}
        >
           <DownloadCloud size={14} className="group-hover:-translate-y-0.5 transition-transform" />
           Export Ledger ({activeFilter}) 
           <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* Sello de versión sutil para auditoría visual */}
      <div className="absolute bottom-2 right-4 opacity-10 pointer-events-none">
         <span className="text-[7px] font-mono uppercase tracking-widest">Silo-B Engine v2.1</span>
      </div>
    </motion.footer>
  );
});

PartnerFooter.displayName = 'PartnerFooter';