/**
 * @file apps/portfolio-web/src/components/sections/portal/OffersDashboard.tsx
 * @description Enterprise Revenue Orchestrator (Silo A Manager).
 *              Refactorizado: Erradicación de errores de Typecheck, purga de 'any',
 *              corrección de contratos de diccionario y limpieza de imports huérfanos.
 *              Integrado: Telemetría Heimdall v2.5 y Gating de Inventario Crítico.
 * @version 7.1 - Linter Pure & Signal Alignment
 * @author Staff Engineer - MetaShark Tech
 */

'use client';

import React, { useState, useMemo, useEffect, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, Package, Plus, BarChart3, TrendingUp, 
  Timer, ShieldCheck, Database, 
  AlertTriangle, History, Radio
} from 'lucide-react';

/** IMPORTACIONES DE INFRAESTRUCTRURA (Nx Boundary Safe) */
import { cn } from '../../../lib/utils/cn';
import { useUIStore } from '../../../lib/store/ui.store';
import { FlashAssetCard } from './media/FlashAssetCard';
import type { Dictionary } from '../../../lib/schemas/dictionary.schema';

/** 
 * ACCIONES DE SERVIDOR (Silo A Nodes) 
 * @pilar IX: Inversión de Control. 
 * @note Este miembro será inyectado en el próximo paso en campaign.actions.ts.
 */
import { getActiveOffersAction } from '../../../lib/portal/actions/campaign.actions';

// --- PROTOCOLO CROMÁTICO HEIMDALL v2.5 ---
const C = {
  reset: '\x1b[0m', magenta: '\x1b[35m', cyan: '\x1b[36m', 
  green: '\x1b[32m', yellow: '\x1b[33m', red: '\x1b[31m', bold: '\x1b[1m'
};

// --- CONTRATOS SOBERANOS ---
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
// 1. SUB-APARATO: RevenueMetricsStrip
// ============================================================================
const RevenueMetricsStrip = memo(({ 
  isLoading, 
  onAirValue, 
  criticalNodes, 
  totalCount 
}: { 
  isLoading: boolean;
  onAirValue: string;
  criticalNodes: number;
  totalCount: number;
}) => (
  <header className="grid grid-cols-1 md:grid-cols-3 gap-6">
    <MetricNode 
      label="Market Value Exposure" 
      value={isLoading ? '---' : onAirValue} 
      icon={TrendingUp} 
      color="text-success" 
    />
    <MetricNode 
      label="Inventory Pressure" 
      value={isLoading ? '---' : `${criticalNodes} Nodes`} 
      icon={Timer} 
      color={criticalNodes > 0 ? "text-red-500" : "text-primary"}
      isCritical={criticalNodes > 0}
    />
    <MetricNode 
      label="Active Signal Channels" 
      value={isLoading ? '---' : `${totalCount} Channels`} 
      icon={BarChart3} 
      color="text-primary" 
    />
  </header>
));
RevenueMetricsStrip.displayName = 'RevenueMetricsStrip';

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

  const t = dictionary.offers_flash;
  const sysError = dictionary.server_error;

  /**
   * PROTOCOLO HEIMDALL: Sincronización de Inventario Real
   * @pilar IV: Trazabilidad DNA-Level.
   */
  const fetchInventoryNodes = useCallback(async () => {
    if (!session?.tenantId) return;
    
    setIsLoading(true);
    setErrorStatus(null);
    const traceId = `rev_sync_${Date.now().toString(36).toUpperCase()}`;
    const startTime = performance.now();

    console.log(`${C.magenta}${C.bold}[DNA][REVENUE]${C.reset} Synchronizing Silo A | Trace: ${C.cyan}${traceId}${C.reset}`);

    try {
      const response = await getActiveOffersAction(session.tenantId, activeView);
      
      const duration = (performance.now() - startTime).toFixed(4);

      if (response.success && response.data) {
        setAssets(response.data as RevenueAsset[]);
        setSyncLatency(duration);
        console.log(`${C.green}   ✓ [GRANTED]${C.reset} Silo A Ready | Latency: ${duration}ms`);
      } else {
        throw new Error(response.error || 'OFFER_GATEWAY_TIMEOUT');
      }
    } catch (err: unknown) {
      /** @fix: Erradicación de 'any' y manejo de error resiliente */
      const msg = err instanceof Error ? err.message : 'INFRASTRUCTURE_DRIFT';
      setErrorStatus(msg);
      console.error(`${C.red}   ✕ [BREACH] Sync failed: ${msg} | Trace: ${traceId}`);
    } finally {
      setIsLoading(false);
    }
  }, [session?.tenantId, activeView]);

  useEffect(() => {
    fetchInventoryNodes();
  }, [fetchInventoryNodes]);

  /** 
   * INTELIGENCIA DE REVENUE (Deterministic Engine) 
   */
  const metrics = useMemo(() => {
    const activeAssets = assets.filter(a => a.status === 'active');
    
    const totalPotential = activeAssets.reduce((acc, curr) => {
      const netPrice = curr.basePrice * (1 - curr.discount / 100);
      return acc + (netPrice * curr.stock);
    }, 0);

    const criticalStockCount = activeAssets.filter(a => a.stock <= 3).length;

    return {
      onAirValue: `R$ ${totalPotential.toLocaleString()}`,
      criticalNodes: criticalStockCount,
      totalCount: activeAssets.length,
      filteredAssets: assets
    };
  }, [assets]);

  return (
    <div className={cn("space-y-10 animate-in fade-in duration-1000", className)}>
      
      {/* 1. MÉTRICAS DE EXPOSICIÓN (Revenue Strip) */}
      <RevenueMetricsStrip 
        isLoading={isLoading}
        onAirValue={metrics.onAirValue}
        criticalNodes={metrics.criticalNodes}
        totalCount={metrics.totalCount}
      />

      {/* 2. BARRA DE NAVEGACIÓN TÁCTICA (Silo Mode) */}
      <nav className="flex flex-col md:flex-row gap-6 items-center justify-between bg-surface/30 p-2 rounded-3xl border border-border/50 backdrop-blur-xl transition-all duration-700">
        <div className="flex gap-2 p-1">
           <button 
             onClick={() => setActiveView('flash')} 
             className={cn(
               "flex items-center gap-3 px-8 py-3.5 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all outline-none",
               activeView === 'flash' ? "bg-foreground text-background shadow-lg scale-105" : "text-muted-foreground hover:text-foreground hover:bg-surface"
             )}
            >
              <Zap size={14} className={cn(activeView === 'flash' && "fill-current")} /> {t.title}
           </button>
           <button 
             onClick={() => setActiveView('enterprise')} 
             className={cn(
               "flex items-center gap-3 px-8 py-3.5 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all outline-none",
               activeView === 'enterprise' ? "bg-foreground text-background shadow-lg scale-105" : "text-muted-foreground hover:text-foreground hover:bg-surface"
             )}
            >
              <Package size={14} /> B2B / Partners
           </button>
        </div>

        <div className="hidden lg:flex items-center gap-3 px-6 text-[9px] font-mono font-bold text-muted-foreground uppercase tracking-widest border-l border-border/50">
           <ShieldCheck size={14} className={isLoading ? "animate-spin text-primary" : "text-success"} />
           {isLoading ? "CALIBRATING..." : t.status_active}
        </div>
      </nav>

      {/* 3. VIEWPORT DE ACTIVOS COMERCIALES */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 min-h-[400px]">
        <AnimatePresence mode="popLayout">
            {isLoading ? (
              [1, 2, 3, 4].map(i => (
                <div key={i} className="h-80 w-full bg-surface/40 border border-border/40 rounded-[3.5rem] animate-pulse" />
              ))
            ) : errorStatus ? (
              /* @fix: Uso de sysError para corregir TS2339 (Propiedad faltante en 't') */
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} 
                className="col-span-full py-32 text-center rounded-[4rem] border border-red-500/20 bg-red-500/5 space-y-6"
              >
                <AlertTriangle size={48} className="mx-auto text-red-500" />
                <div className="space-y-2">
                   <h4 className="text-foreground font-display text-xl font-bold uppercase">{sysError.title}</h4>
                   <p className="text-red-500/60 font-mono text-[9px] uppercase tracking-widest">{errorStatus}</p>
                </div>
                <button 
                  onClick={fetchInventoryNodes}
                  className="rounded-full bg-red-500 px-8 py-3 text-[10px] font-bold text-white uppercase tracking-widest hover:bg-white hover:text-red-500 transition-all"
                >
                  {sysError.retry_button}
                </button>
              </motion.div>
            ) : metrics.filteredAssets.length > 0 ? (
              metrics.filteredAssets.map(asset => (
                <FlashAssetCard key={asset.id} asset={asset} labels={t} />
              ))
            ) : (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} 
                className="col-span-full py-32 text-center rounded-[4rem] border-2 border-dashed border-border bg-surface/10"
              >
                <Database size={48} className="mx-auto text-muted-foreground/10 mb-6" />
                <p className="font-mono text-[9px] uppercase tracking-[0.5em] text-muted-foreground animate-pulse">NO_ACTIVE_INVENTORY_IN_PERIMETER</p>
              </motion.div>
            )}
            
            {!isLoading && !errorStatus && (
              <motion.button 
                layout 
                className="flex flex-col items-center justify-center gap-6 rounded-[3.5rem] border-2 border-dashed border-border text-muted-foreground min-h-80 transition-all hover:border-primary/40 hover:bg-primary/2 group transform-gpu"
              >
                  <div className="h-16 w-16 rounded-full bg-surface border border-border flex items-center justify-center group-hover:scale-110 group-hover:text-primary group-hover:border-primary/40 transition-all shadow-xl">
                    <Plus size={32} strokeWidth={1.5} />
                  </div>
                  <div className="text-center space-y-2 px-8">
                    <span className="block text-[11px] font-bold uppercase tracking-[0.5em] group-hover:text-foreground transition-colors">
                        {activeView === 'flash' ? 'Inject Flash Sale' : 'Initialize B2B Program'}
                    </span>
                    <p className="text-[10px] font-mono italic opacity-40">Direct injection into Silo A cluster</p>
                  </div>
              </motion.button>
            )}
        </AnimatePresence>
      </div>

      {/* 4. FOOTER TELEMÉTRICO (Heimdall Pulse) */}
      <footer className="pt-8 border-t border-border/40 flex flex-col sm:flex-row justify-between items-center gap-6 opacity-40 hover:opacity-100 transition-opacity duration-1000">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3 text-[10px] font-mono font-bold uppercase tracking-widest text-muted-foreground">
              <Zap size={14} className="text-primary animate-pulse" />
              Sync Latency: {syncLatency ? `${syncLatency}ms` : '---'}
            </div>
            <div className="h-4 w-px bg-border/40 hidden sm:block" />
            <div className="flex items-center gap-3 text-[10px] font-mono font-bold uppercase tracking-widest text-muted-foreground">
              <Radio size={14} className="text-success" />
              Silo A Engine: STABLE
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <button className="group flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-foreground hover:text-primary transition-all outline-none">
              Deep Data Ledger <History size={14} className="group-hover:rotate-180 transition-transform duration-1000" />
            </button>
            <span className="text-[9px] font-mono uppercase tracking-[0.6em] text-muted-foreground">
              Revenue Operations v7.1 • Node: {session?.tenantId?.substring(0, 8) || 'ROOT'}
            </span>
          </div>
      </footer>
    </div>
  );
}

/**
 * SUB-APARATO: MetricNode
 */
const MetricNode = memo(({ label, value, icon: Icon, color, isCritical }: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
  isCritical?: boolean;
}) => (
  <div className={cn(
    "p-8 rounded-4xl bg-surface/60 border border-border shadow-luxury group transition-all duration-700 transform-gpu",
    isCritical ? "border-red-500/20 bg-red-500/3" : "hover:border-primary/20"
  )}>
    <div className="flex items-center justify-between mb-5">
      <span className="text-[8px] font-mono text-muted-foreground uppercase tracking-widest font-bold opacity-60">{label}</span>
      <Icon size={16} className={cn("transition-transform duration-500 group-hover:scale-110", color, isCritical && "animate-pulse")} />
    </div>
    <p className={cn("text-3xl font-display font-bold tracking-tighter transition-colors", isCritical ? "text-red-500" : "text-foreground")}>
      {value}
    </p>
    {isCritical && (
      <div className="mt-4 flex items-center gap-2 text-red-500 animate-in slide-in-from-left-2">
         <AlertTriangle size={12} />
         <span className="text-[8px] font-bold uppercase tracking-tighter">Immediate Attention Required</span>
      </div>
    )}
  </div>
));
MetricNode.displayName = 'MetricNode';