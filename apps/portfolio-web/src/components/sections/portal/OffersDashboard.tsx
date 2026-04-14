/**
 * @file apps/portfolio-web/src/components/sections/portal/OffersDashboard.tsx
 * @description Enterprise Revenue Orchestrator (Silo A Manager).
 *              Terminal de alta fidelidad para la gestión de Yield y Distribución.
 *              Refactorizado: Purificación de Linter (ESLint no-console fix), 
 *              validación de contrato post-fetch e inyección de telemetría Heimdall v2.5.
 *              Estándar: Revenue BI Hardened & React 19 Pure.
 * 
 * @version 9.0 - Linter Pure & Revenue BI Hardened
 * @author Staff Engineer - MetaShark Tech
 */

'use client';

import React, { useState, useMemo, useEffect, useCallback, memo, useTransition } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, Package, Plus, BarChart3, TrendingUp, 
  Timer, ShieldCheck, Database, 
  AlertTriangle, Radio, RefreshCw, ArrowUpRight
} from 'lucide-react';

/** IMPORTACIONES DE INFRAESTRUCTRURA (Nx Boundary Safe) */
import { cn } from '../../../lib/utils/cn';
import { useUIStore } from '../../../lib/store/ui.store';
import { FlashAssetCard } from './media/FlashAssetCard';
import type { Dictionary } from '../../../lib/schemas/dictionary.schema';
import { calculateNetPrice, calculateStockHealth } from '../../../lib/portal/revenue.engine';

/** ACCIONES DE SERVIDOR (Silo A Nodes) */
import { getActiveOffersAction } from '../../../lib/portal/actions/campaign.actions';

// --- PROTOCOLO CROMÁTICO HEIMDALL v2.5 ---
const C = {
  reset: '\x1b[0m', magenta: '\x1b[35m', cyan: '\x1b[36m', 
  green: '\x1b[32m', yellow: '\x1b[33m', red: '\x1b[31m', bold: '\x1b[1m'
};

export interface RevenueAsset {
  id: string;
  title: string;
  basePrice: number;
  discount: number;
  stock: number;
  capacity: number;
  expiresAt: string;
  type: 'flash' | 'enterprise';
  vibe: 'day' | 'night';
  status: 'active' | 'sold_out' | 'expired';
}

type RevenueView = 'flash' | 'enterprise';

// ============================================================================
// 1. SUB-APARATO: MetricNode (BI Unit)
// ============================================================================
const MetricNode = memo(({ label, value, icon: Icon, color, isCritical, loading }: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
  isCritical?: boolean;
  loading?: boolean;
}) => (
  <div className={cn(
    "p-8 rounded-4xl border transition-all duration-700 transform-gpu overflow-hidden relative",
    "bg-surface/60 border-border shadow-luxury",
    isCritical ? "border-red-500/20 bg-red-500/3" : "hover:border-primary/20",
    loading && "animate-pulse"
  )}>
    <div className="flex items-center justify-between mb-5 relative z-10">
      <span className="text-[8px] font-mono text-muted-foreground uppercase tracking-widest font-bold opacity-60">{label}</span>
      <Icon size={16} className={cn("transition-transform duration-500", color, isCritical && "animate-pulse")} />
    </div>
    <p className={cn(
      "text-3xl font-display font-bold tracking-tighter transition-colors relative z-10 leading-none",
      isCritical ? "text-red-500" : "text-foreground"
    )}>
      {value}
    </p>
    
    {isCritical && !loading && (
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className="mt-4 flex items-center gap-2 text-red-500 relative z-10"
      >
         <AlertTriangle size={12} />
         <span className="text-[8px] font-bold uppercase tracking-tighter">Inventory Risk Detected</span>
      </motion.div>
    )}

    {/* Efecto de fondo para métricas críticas (MEA/UX) */}
    {isCritical && (
      <div className="absolute -right-4 -bottom-4 h-24 w-24 bg-red-500/5 blur-2xl rounded-full" />
    )}
  </div>
));
MetricNode.displayName = 'MetricNode';

// ============================================================================
// APARATO PRINCIPAL: OffersDashboard
// ============================================================================
export function OffersDashboard({ dictionary, className }: { dictionary: Dictionary; className?: string }) {
  const { session } = useUIStore();
  const [activeView, setActiveView] = useState<RevenueView>('flash');
  const [assets, setAssets] = useState<RevenueAsset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [syncLatency, setSyncLatency] = useState<string | null>(null);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const t = dictionary.offers_flash;
  const sysError = dictionary.server_error;

  /**
   * PROTOCOLO HEIMDALL: Sync & Integrity Check
   * @pilar IV: Trazabilidad Forense.
   */
  const fetchInventory = useCallback(async () => {
    if (!session?.tenantId) return;
    
    setIsLoading(true);
    setErrorStatus(null);
    const traceId = `rev_sync_${Date.now().toString(36).toUpperCase()}`;
    const startTime = performance.now();

    try {
      const response = await getActiveOffersAction(session.tenantId, activeView);
      const duration = (performance.now() - startTime).toFixed(4);

      if (response.success && Array.isArray(response.data)) {
        /** @pilar III: Validación de Integridad del Nodo */
        const validatedData = response.data.map(item => {
           const asset = item as RevenueAsset;
           // Aseguramos que existan los campos numéricos para el Math Engine
           return {
             ...asset,
             basePrice: asset.basePrice || 0,
             discount: asset.discount || 0,
             stock: asset.stock ?? 0
           };
        });

        setAssets(validatedData);
        setSyncLatency(duration);
        
        // @fix: console.info para cumplimiento Linter
        console.info(`${C.green}   ✓ [DNA][REVENUE]${C.reset} Silo A Handshake OK | Latency: ${duration}ms | Trace: ${traceId}`);
      } else {
        throw new Error(response.error || 'INVENTORY_SIGNAL_CORRUPTED');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'SIGNAL_DRIFT';
      setErrorStatus(msg);
      console.error(`${C.red}   ✕ [BREACH] Sync failed: ${msg}${C.reset}`);
    } finally {
      setIsLoading(false);
    }
  }, [session?.tenantId, activeView]);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  /** 
   * INTELIGENCIA DE REVENUE: Agregación en Ciclo Único
   * @pilar X: Performance - Procesamos métricas y riesgos en una sola pasada O(n).
   */
  const metrics = useMemo(() => {
    return assets.reduce((acc, curr) => {
      if (curr.status === 'active') {
        const net = calculateNetPrice(curr.basePrice, curr.discount);
        const { isCritical } = calculateStockHealth(curr.stock, curr.capacity);
        
        acc.onAirValue += (net * curr.stock);
        acc.totalNodes += 1;
        if (isCritical) acc.criticalCount += 1;
      }
      return acc;
    }, { onAirValue: 0, criticalCount: 0, totalNodes: 0 });
  }, [assets]);

  const handleViewChange = (view: RevenueView) => {
    startTransition(() => {
      setActiveView(view);
    });
  };

  return (
    <div className={cn("space-y-10 animate-in fade-in duration-1000", className)}>
      
      {/* 1. CLÚSTER DE MÉTRICAS (Sovereign BI) */}
      <header className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricNode 
          label="Estimated Yield Exposure" 
          value={isLoading ? '---' : `R$ ${metrics.onAirValue.toLocaleString()}`} 
          icon={TrendingUp} 
          color="text-success"
          loading={isLoading}
        />
        <MetricNode 
          label="Inventory Pressure" 
          value={isLoading ? '---' : `${metrics.criticalCount} Critical Nodes`} 
          icon={Timer} 
          color={metrics.criticalCount > 0 ? "text-red-500" : "text-primary"}
          isCritical={metrics.criticalCount > 0}
          loading={isLoading}
        />
        <MetricNode 
          label="Active Signal Channels" 
          value={isLoading ? '---' : `${metrics.totalNodes} Nodes`} 
          icon={BarChart3} 
          color="text-primary" 
          loading={isLoading}
        />
      </header>

      {/* 2. CONSOLA DE NAVEGACIÓN (Oxygen Glass) */}
      <nav className="flex flex-col md:flex-row gap-6 items-center justify-between bg-surface/30 p-2 rounded-3xl border border-border/50 backdrop-blur-xl transition-all duration-700 hover:border-primary/20">
        <div className="flex gap-2 p-1">
           <button 
             onClick={() => handleViewChange('flash')} 
             className={cn(
               "flex items-center gap-3 px-8 py-3.5 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all outline-none transform-gpu",
               activeView === 'flash' ? "bg-foreground text-background shadow-lg scale-105" : "text-muted-foreground hover:text-foreground hover:bg-surface"
             )}
            >
              <Zap size={14} className={cn(activeView === 'flash' && "fill-current")} /> {t.title}
           </button>
           <button 
             onClick={() => handleViewChange('enterprise')} 
             className={cn(
               "flex items-center gap-3 px-8 py-3.5 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all outline-none transform-gpu",
               activeView === 'enterprise' ? "bg-foreground text-background shadow-lg scale-105" : "text-muted-foreground hover:text-foreground hover:bg-surface"
             )}
            >
              <Package size={14} /> B2B / Partners
           </button>
        </div>

        <div className="hidden lg:flex items-center gap-3 px-6 text-[9px] font-mono font-bold text-muted-foreground uppercase tracking-widest border-l border-border/50">
           <ShieldCheck size={14} className={isLoading ? "animate-spin text-primary" : "text-success"} />
           {isLoading ? "SYNC_IN_PROGRESS" : t.status_active}
        </div>
      </nav>

      {/* 3. VIEWPORT DE ACTIVOS (Aceleración GPU) */}
      <div className={cn("grid grid-cols-1 md:grid-cols-2 gap-8 min-h-[400px] transition-all", isPending && "opacity-40 grayscale blur-xs")}>
        <AnimatePresence mode="popLayout">
            {isLoading ? (
              [1, 2, 3, 4].map(i => (
                <div key={i} className="h-85 w-full bg-surface/20 border border-border/30 rounded-[4rem] animate-pulse" />
              ))
            ) : errorStatus ? (
              <motion.div 
                key="error" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} 
                className="col-span-full py-32 text-center rounded-[4rem] border border-red-500/20 bg-red-500/5 space-y-8 transform-gpu"
              >
                <div className="relative w-max mx-auto">
                   <div className="absolute inset-0 bg-red-500/20 blur-3xl rounded-full animate-pulse" />
                   <AlertTriangle size={64} className="text-red-500 relative" />
                </div>
                <div className="space-y-3">
                   <h4 className="text-foreground font-display text-2xl font-bold uppercase tracking-tight leading-none">{sysError.title}</h4>
                   <p className="text-red-500/60 font-mono text-[10px] uppercase tracking-[0.5em]">{errorStatus}</p>
                </div>
                <button 
                  onClick={fetchInventory}
                  className="group flex items-center gap-4 mx-auto bg-foreground text-background px-10 py-5 rounded-full font-bold text-[10px] uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all active:scale-95 shadow-2xl"
                >
                  <RefreshCw size={14} className="group-active:rotate-180 transition-transform" />
                  {sysError.retry_button}
                </button>
              </motion.div>
            ) : assets.length > 0 ? (
              assets.map(asset => (
                <FlashAssetCard key={asset.id} asset={asset} labels={t} />
              ))
            ) : (
              <motion.div 
                key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} 
                className="col-span-full py-48 text-center rounded-[4rem] border-2 border-dashed border-border bg-surface/10"
              >
                <Database size={64} className="mx-auto text-muted-foreground/10 mb-8" />
                <p className="font-mono text-[10px] uppercase tracking-[0.6em] text-muted-foreground animate-pulse">HSK_NO_INVENTORY_DETECTED</p>
              </motion.div>
            )}
            
            {/* Botón de Inyección de Lujo (Pilar XII) */}
            {!isLoading && !errorStatus && (
              <motion.button 
                layout 
                className="flex flex-col items-center justify-center gap-8 rounded-[4rem] border-2 border-dashed border-border text-muted-foreground min-h-85 transition-all hover:border-primary/40 hover:bg-primary/2 group transform-gpu relative overflow-hidden"
              >
                  <div className="absolute inset-0 bg-linear-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative z-10 h-20 w-20 rounded-3xl bg-surface border border-border flex items-center justify-center group-hover:scale-110 group-hover:text-primary group-hover:border-primary/30 transition-all duration-700 shadow-xl group-hover:shadow-primary/10">
                    <Plus size={40} strokeWidth={1.2} />
                  </div>
                  <div className="relative z-10 text-center space-y-3 px-12">
                    <span className="flex items-center justify-center gap-3 text-[12px] font-bold uppercase tracking-[0.5em] group-hover:text-foreground transition-colors">
                        {activeView === 'flash' ? 'Inject Flash Opportunity' : 'New B2B Protocol'}
                        <ArrowUpRight size={16} className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
                    </span>
                    <p className="text-[9px] font-mono uppercase tracking-widest opacity-40 group-hover:opacity-70">Silo A Strategic Ingestion</p>
                  </div>
              </motion.button>
            )}
        </AnimatePresence>
      </div>

      {/* 4. TELEMETRY FOOTER (Forensic Pulse) */}
      <footer className="pt-10 border-t border-border/40 flex flex-col sm:flex-row justify-between items-center gap-8 opacity-40 hover:opacity-100 transition-opacity duration-1000">
          <div className="flex items-center gap-10">
            <div className="flex items-center gap-3 text-[9px] font-mono font-bold uppercase tracking-[0.4em] text-muted-foreground">
              <div className="h-1.5 w-1.5 rounded-full bg-primary animate-ping" />
              Pulse: {syncLatency ? `${syncLatency}ms` : 'SCANNING...'}
            </div>
            <div className="h-4 w-px bg-border/40 hidden sm:block" />
            <div className="flex items-center gap-3 text-[9px] font-mono font-bold uppercase tracking-[0.4em] text-success">
              <ShieldCheck size={14} />
              Protocol: v9.0_SEALED
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3 text-muted-foreground">
               <Radio size={14} className="animate-pulse" />
               <span className="text-[8px] font-mono uppercase tracking-[1em]">
                 NODE_{session?.tenantId?.substring(0, 8) || 'ROOT'}
               </span>
            </div>
          </div>
      </footer>
    </div>
  );
}