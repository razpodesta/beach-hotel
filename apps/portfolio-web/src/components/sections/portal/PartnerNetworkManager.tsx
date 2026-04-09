/**
 * @file apps/portfolio-web/src/components/sections/portal/PartnerNetworkManager.tsx
 * @description Orquestador Soberano de la Red de Alianzas (PRM Silo B).
 *              Gestiona el inventario de agencias, métricas de rendimiento y 
 *              filtros regionales con observabilidad Heimdall v2.5.
 *              Refactorizado: Agregadores financieros en ciclo único (O(n)),
 *              normalización Tailwind v4 y erradicación de variables huérfanas.
 *              Estándar: React 19 Pure & High-Performance Memoization.
 * @version 7.1 - Aggregator Purity & Tailwind Canonical Sync
 * @author Raz Podestá -  MetaShark Tech
 */

'use client';

import React, { 
  useState, 
  useMemo, 
  useEffect, 
  useCallback, 
  useDeferredValue, 
  useTransition,
  memo 
} from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UserCheck, 
  Search, 
  TrendingUp, 
  Users, 
  Activity, 
  Filter, 
  BarChart3, 
  ShieldCheck, 
  XCircle, 
  ShieldAlert,
  Globe,
  Star,
  Target
} from 'lucide-react';

/** IMPORTACIONES DE INFRAESTRUCTRURA (Nx Boundary Safe) */
import { cn } from '../../../lib/utils/cn';
import { useUIStore } from '../../../lib/store/ui.store';
import { AgencyRow } from './media/AgencyRow';
import type { AgencyEntity, StatusConfig } from './types';
import type { Dictionary } from '../../../lib/schemas/dictionary.schema';

/**
 * PROTOCOLO CROMÁTICO HEIMDALL v2.5
 */
const C = {
  reset: '\x1b[0m', magenta: '\x1b[35m', cyan: '\x1b[36m', 
  green: '\x1b[32m', yellow: '\x1b[33m', red: '\x1b[31m', bold: '\x1b[1m'
};

/**
 * @interface PartnerNetworkManagerProps
 * @pilar III: Seguridad de Tipos Absoluta.
 */
export interface PartnerNetworkManagerProps {
  /** Colección de agencias hidratada desde el servidor */
  agencies: AgencyEntity[];
  /** Diccionario de red validado por MACS */
  dictionary: Dictionary['partner_network'];
  className?: string;
}

// ============================================================================
// 1. SUB-APARATO: PartnerMetricsStrip (BI Cluster)
// ============================================================================
const PartnerMetricsStrip = memo(({ 
  totalYield, 
  healthIndex, 
  count,
  isPending,
  labels
}: { 
  totalYield: number; 
  healthIndex: number; 
  count: number;
  isPending: boolean;
  labels: Dictionary['partner_network']['metrics']
}) => (
  <header className={cn(
    "grid grid-cols-1 md:grid-cols-3 gap-8 transition-all duration-700 transform-gpu",
    /** @fix: Normalización canónica blur-xs según Tailwind v4 Standard */
    isPending ? "opacity-40 blur-xs scale-[0.99]" : "opacity-100 blur-0 scale-100"
  )}>
    {/* KPI: Marketplace Yield */}
    <div className="p-8 rounded-[3rem] bg-surface/60 border border-border/50 flex items-center justify-between shadow-luxury group hover:border-success/30 transition-all duration-500">
       <div className="space-y-1">
         <span className="block text-[9px] font-mono font-bold text-muted-foreground uppercase tracking-widest">Global Marketplace Yield</span>
         <p className="text-4xl font-display font-bold text-foreground tracking-tighter">
            R$ {totalYield.toLocaleString()}
         </p>
       </div>
       <div className="p-4 rounded-2xl bg-background border border-border shadow-inner text-success group-hover:scale-110 transition-transform">
          <TrendingUp size={26} strokeWidth={1.2} />
       </div>
    </div>
    
    {/* KPI: Network Health Index */}
    <div className="p-8 rounded-[3rem] bg-surface/60 border border-border/50 flex items-center justify-between shadow-luxury group hover:border-primary/30 transition-all duration-500">
       <div className="space-y-1">
         <span className="block text-[9px] font-mono font-bold text-muted-foreground uppercase tracking-widest">{labels.label_conversion}</span>
         <div className="flex items-center gap-3">
            <p className="text-4xl font-display font-bold text-foreground tracking-tighter">{healthIndex}%</p>
            <div className={cn(
              "px-2 py-0.5 rounded-md text-[8px] font-bold uppercase",
              healthIndex > 70 ? "bg-success/10 text-success" : "bg-yellow-500/10 text-yellow-500"
            )}>
              {healthIndex > 70 ? 'Optimal' : 'Audit Req.'}
            </div>
         </div>
       </div>
       <div className="p-4 rounded-2xl bg-background border border-border shadow-inner text-primary group-hover:rotate-12 transition-transform">
          <Target size={26} strokeWidth={1.2} />
       </div>
    </div>

    {/* KPI: Network Reach */}
    <div className="p-8 rounded-[3rem] bg-primary/5 border border-primary/20 flex items-center justify-between shadow-2xl transition-all duration-500 hover:bg-primary/10 group">
       <div className="space-y-1">
         <span className="block text-[9px] font-mono font-bold text-primary uppercase tracking-widest mb-1">Authenticated Nodes</span>
         <p className="text-4xl font-display font-bold text-primary tracking-tighter">{count}</p>
       </div>
       <div className="h-14 w-14 rounded-2xl bg-primary/20 flex items-center justify-center text-primary group-hover:scale-110 transition-transform shadow-lg">
          <Users size={30} strokeWidth={1.2} />
       </div>
    </div>
  </header>
));
PartnerMetricsStrip.displayName = 'PartnerMetricsStrip';

// ============================================================================
// APARATO PRINCIPAL: PartnerNetworkManager (The Strategist)
// ============================================================================
export function PartnerNetworkManager({ agencies, dictionary, className }: PartnerNetworkManagerProps) {
  const { session } = useUIStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [isPending, startTransition] = useTransition();
  
  /**
   * PERFORMANCE: Búsqueda Diferida (Pilar X)
   * Mantiene la UI Oxygen fluida (60fps) durante el escaneo masivo de nodos.
   */
  const deferredQuery = useDeferredValue(searchQuery);

  /**
   * PROTOCOLO HEIMDALL: Telemetría de Perímetro
   */
  useEffect(() => {
    const traceId = `prm_hsk_${Date.now().toString(36).toUpperCase()}`;
    console.log(`${C.magenta}${C.bold}[DNA][PRM]${C.reset} Silo B Active | Auth_Nodes: ${agencies.length} | Trace: ${C.cyan}${traceId}${C.reset}`);
  }, [agencies.length]);

  /**
   * MOTOR DE INTELIGENCIA TÁCTICA (React 19 Concurrent Ready)
   * @pilar X: Procesamiento en ciclo único (Single Pass Aggregation).
   * @fix: Erradicación de reasignación prohibida mediante patron de reducción inmutable.
   */
  const networkData = useMemo(() => {
    const query = deferredQuery.toLowerCase().trim();
    
    // Ejecutamos filtrado y agregación en una sola pasada funcional
    return agencies.reduce((acc, node) => {
      const matchesSearch = node.brandName.toLowerCase().includes(query) || node.taxId.includes(query);
      const matchesFilter = activeFilter === 'ALL' || node.jurisdiction === activeFilter;
      
      if (matchesSearch && matchesFilter) {
        acc.filteredNodes.push(node);
        acc.totalYield += node.totalYield;
        acc.totalTrust += node.trustScore;
      }
      return acc;
    }, { 
      filteredNodes: [] as AgencyEntity[], 
      totalYield: 0, 
      totalTrust: 0 
    });
  }, [agencies, deferredQuery, activeFilter]);

  // Cálculo derivado de salud de red
  const healthIndex = useMemo(() => 
    networkData.filteredNodes.length > 0 
      ? Math.round(networkData.totalTrust / networkData.filteredNodes.length) 
      : 0, 
  [networkData.filteredNodes.length, networkData.totalTrust]);

  /**
   * TELEMETRÍA DE RECONOCIMIENTO (Heimdall v2.5)
   */
  useEffect(() => {
    const startTime = performance.now();
    if (deferredQuery.length > 0) {
      const duration = (performance.now() - startTime).toFixed(4);
      console.log(`${C.cyan}   ✓ [STREAM]${C.reset} Recon Result: ${networkData.filteredNodes.length} nodes active | Lat: ${C.yellow}${duration}ms${C.reset}`);
    }
  }, [networkData.filteredNodes.length, deferredQuery]);

  /**
   * HANDLER: handlePerimeterSwitch
   * @description Utiliza startTransition para priorizar la fluidez de la UI Oxygen.
   */
  const handlePerimeterSwitch = useCallback((region: string) => {
    startTransition(() => {
      setActiveFilter(region);
      console.log(`${C.magenta}[DNA][PRM]${C.reset} Perimeter Switch: ${C.cyan}${region}${C.reset}`);
    });
  }, []);

  /**
   * RESOLVER DE ESTADO (Compliance Aware)
   */
  const getStatusConfig = useCallback((status: string): StatusConfig => {
    const map: Record<string, StatusConfig> = {
      active: { icon: ShieldCheck, color: 'text-success', bg: 'bg-success/10', label: 'Verified' },
      review: { icon: Activity, color: 'text-yellow-500', bg: 'bg-yellow-500/10', label: 'Auditing' },
      blocked: { icon: XCircle, color: 'text-red-500', bg: 'bg-red-500/10', label: 'Boundary Lock' }
    };
    return map[status] || { icon: ShieldAlert, color: 'text-muted-foreground', bg: 'bg-surface', label: 'Unknown Node' };
  }, []);

  return (
    <div className={cn("space-y-12 animate-in fade-in duration-1000", className)}>
      
      {/* 1. CLÚSTER DE INTELIGENCIA (BI Strip) */}
      <PartnerMetricsStrip 
        totalYield={networkData.totalYield}
        healthIndex={healthIndex}
        count={networkData.filteredNodes.length}
        isPending={isPending}
        labels={dictionary.metrics}
      />

      {/* 2. CONSOLA DE COMANDO TÁCTICO (High-Fidelity Nav) */}
      <nav className="flex flex-col xl:flex-row gap-6 items-center justify-between bg-surface/40 backdrop-blur-3xl p-4 rounded-[2.5rem] border border-border/50 shadow-2xl transition-all duration-700 hover:border-primary/20">
        
        {/* BUSCADOR DE NODOS */}
        <div className="relative w-full md:w-96 group">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground/30 group-focus-within:text-primary transition-colors" size={18} />
          <input 
            type="text"
            className="w-full bg-background/40 border border-border/50 rounded-2xl py-4 pl-16 pr-8 text-sm outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/5 transition-all text-foreground font-sans shadow-inner placeholder:text-muted-foreground/20"
            placeholder="Search Node, Brand or ID..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)} 
          />
        </div>

        {/* SELECTOR DE JURISDICCIÓN (Concurrent Transition) */}
        <div className="flex items-center gap-2 bg-background/20 p-2 rounded-2xl border border-border/30 overflow-x-auto no-scrollbar">
             <div className="px-4 text-muted-foreground opacity-30"><Filter size={14} /></div>
             {['ALL', 'BR', 'CL', 'INTL'].map((region) => {
               const isActive = activeFilter === region;
               return (
                 <button
                   key={region}
                   onClick={() => handlePerimeterSwitch(region)}
                   className={cn(
                     "flex items-center gap-3 px-6 py-2.5 rounded-xl text-[10px] font-bold transition-all uppercase tracking-widest outline-none whitespace-nowrap transform-gpu",
                     isActive ? "bg-foreground text-background shadow-2xl scale-[1.05]" : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                   )}
                 >
                   {region}
                 </button>
               );
             })}
        </div>

        <button className="flex items-center gap-4 px-10 py-4 rounded-full bg-foreground text-background font-bold text-[10px] uppercase tracking-[0.3em] hover:bg-primary hover:text-white transition-all shadow-3xl active:scale-95 shrink-0 group">
           <UserCheck size={18} className="group-hover:rotate-12 transition-transform" /> 
           {dictionary.agent_management.add_agent}
        </button>
      </nav>

      {/* 3. VIEWPORT DE RED (Agency Distribution) */}
      <motion.div 
        layout 
        className={cn(
          "grid grid-cols-1 gap-6 min-h-[450px] transform-gpu transition-all duration-700",
          isPending ? "grayscale opacity-40 blur-xs" : "grayscale-0 opacity-100 blur-0"
        )}
      >
        <AnimatePresence mode="popLayout">
          {networkData.filteredNodes.length > 0 ? (
            networkData.filteredNodes.map((agency) => {
              const isPreferred = agency.trustScore >= 90;
              return (
                <div key={agency.id} className="relative">
                   {isPreferred && (
                     <div className="absolute -top-2 -right-2 z-20">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-yellow-500 shadow-[0_0_15px_oklch(70%_0.15_80)] border-2 border-surface animate-in zoom-in duration-500">
                           <Star size={12} className="text-black fill-current" />
                        </div>
                     </div>
                   )}
                   <AgencyRow 
                     agency={agency} 
                     status={getStatusConfig(agency.status)} 
                   />
                </div>
              );
            })
          ) : (
            /* ESTADO DE VACÍO SOBERANO (Pilar VIII) */
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
              className="py-48 text-center space-y-8 rounded-[4rem] border-2 border-dashed border-border bg-surface/20 relative overflow-hidden"
            >
              <div className="relative w-max mx-auto">
                <div className="absolute inset-0 bg-primary/5 blur-[80px] rounded-full animate-pulse" />
                <Globe size={64} className="mx-auto text-muted-foreground/10 relative" strokeWidth={1} />
              </div>
              <div className="space-y-3">
                <h4 className="text-foreground font-display text-2xl font-bold uppercase tracking-tight">Isolated Perimeter</h4>
                <p className="text-muted-foreground font-mono uppercase tracking-[0.4em] text-[9px] animate-pulse">
                  SEARCH_HSK: NO_CORRESPONDING_NODES
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* 4. FOOTER TELEMÉTRICO (Heimdall Pulse) */}
      <footer className="pt-12 border-t border-border/40 flex flex-col lg:flex-row justify-between items-center gap-10 opacity-50 hover:opacity-100 transition-opacity duration-1000">
         <div className="flex items-center gap-8">
            <div className="flex items-center gap-4">
              <Activity size={18} className="text-success animate-pulse" />
              <span className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-foreground">Silo B Hub: NOMINAL</span>
            </div>
            <div className="h-4 w-px bg-border/40" />
            <div className="flex items-center gap-4">
              <ShieldCheck size={18} className="text-primary" />
              <span className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-foreground">
                Identity Security: v2.5 ENFORCED
              </span>
            </div>
         </div>
         
         <div className="flex items-center gap-4 text-muted-foreground">
            <BarChart3 size={16} />
            <p className="text-[9px] font-mono uppercase tracking-[0.6em]">
              Partner Network Management v7.1 • Perimeter: {session?.tenantId?.substring(0, 8) || 'ROOT'}
            </p>
         </div>
      </footer>
    </div>
  );
}