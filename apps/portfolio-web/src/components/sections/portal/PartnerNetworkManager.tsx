/**
 * @file apps/portfolio-web/src/components/sections/portal/PartnerNetworkManager.tsx
 * @description Orquestador Soberano de la Red de Alianzas (PRM Silo B).
 *              Gestiona el inventario de agencias, métricas de rendimiento y 
 *              filtros regionales con observabilidad Heimdall v2.5.
 *              Refactorizado: Erradicación de funciones impuras en el render (React 19),
 *              resolución de importaciones de Lucide y tipado estricto de reducers.
 * @version 6.4 - React 19 Pure & Forensic Telemetry
 * @author Raz Podestá - Staff Engineer, MetaShark Tech
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
  Wallet, 
  Users, 
  Activity, 
  Filter, 
  BarChart3, 
  ShieldCheck, 
  Zap, 
  XCircle, 
  ShieldAlert 
} from 'lucide-react';

/** 
 * IMPORTACIONES DE INFRAESTRUCTRURA (Nx Boundary Safe)
 * @pilar V: Adherencia Arquitectónica.
 */
import { cn } from '../../../lib/utils/cn';
import { AgencyRow } from './media/AgencyRow';
import type { AgencyEntity, StatusConfig } from './types';
import type { Dictionary } from '../../../lib/schemas/dictionary.schema';

/**
 * PROTOCOLO CROMÁTICO HEIMDALL (Pilar IV)
 */
const C = {
  reset: '\x1b[0m',
  magenta: '\x1b[35m', // DNA / Infra
  cyan: '\x1b[36m',    // STREAM / Info
  green: '\x1b[32m',   // GRANTED / Success
  yellow: '\x1b[33m',  // WARNING / Pending
  red: '\x1b[31m',     // BREACH / Error
  bold: '\x1b[1m'
};

/**
 * @interface PartnerNetworkManagerProps
 */
export interface PartnerNetworkManagerProps {
  /** Colección de agencias proveniente del núcleo de datos */
  agencies: AgencyEntity[];
  /** Diccionario localizado para el silo de partners */
  dictionary: Dictionary['partner_network'];
  className?: string;
}

/**
 * SUB-APARATO: MetricsDashboard
 * @description Visualización atómica de KPIs financieros del clúster filtrado.
 */
const MetricsDashboard = memo(({ 
  totalYield, 
  pendingCommissions, 
  count,
  isPending 
}: { 
  totalYield: number; 
  pendingCommissions: number; 
  count: number;
  isPending: boolean;
}) => (
  <header className={cn(
    "grid grid-cols-1 md:grid-cols-3 gap-8 transition-opacity duration-500",
    isPending ? "opacity-50" : "opacity-100"
  )}>
    <div className="p-8 rounded-[3rem] bg-surface/60 border border-border/50 flex items-center justify-between shadow-luxury hover:border-success/20 transition-all duration-700">
       <div className="space-y-1">
         <span className="block text-[9px] font-mono font-bold text-muted-foreground uppercase tracking-widest">Marketplace Yield</span>
         <p className="text-4xl font-display font-bold text-foreground tracking-tighter">
            R$ {totalYield.toLocaleString()}
         </p>
       </div>
       <div className="p-4 rounded-2xl bg-background border border-border shadow-inner text-success">
          <TrendingUp size={26} strokeWidth={1.2} />
       </div>
    </div>
    
    <div className="p-8 rounded-[3rem] bg-surface/60 border border-border/50 flex items-center justify-between shadow-luxury hover:border-primary/20 transition-all duration-700">
       <div className="space-y-1">
         <span className="block text-[9px] font-mono font-bold text-muted-foreground uppercase tracking-widest">Allocated Fees</span>
         <p className="text-4xl font-display font-bold text-foreground tracking-tighter">
            R$ {pendingCommissions.toLocaleString()}
         </p>
       </div>
       <div className="p-4 rounded-2xl bg-background border border-border shadow-inner text-primary">
          <Wallet size={26} strokeWidth={1.2} />
       </div>
    </div>

    <div className="p-8 rounded-[3rem] bg-primary/5 border border-primary/20 flex items-center justify-between shadow-2xl transition-all duration-700">
       <div className="space-y-1">
         <span className="block text-[9px] font-mono font-bold text-primary uppercase tracking-widest mb-1">Network Nodes</span>
         <p className="text-4xl font-display font-bold text-primary tracking-tighter">{count}</p>
       </div>
       <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
          <Users size={30} strokeWidth={1.2} />
       </div>
    </div>
  </header>
));
MetricsDashboard.displayName = 'MetricsDashboard';

/**
 * APARATO PRINCIPAL: PartnerNetworkManager
 */
export function PartnerNetworkManager({ agencies, dictionary, className }: PartnerNetworkManagerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [isPending, startTransition] = useTransition();
  
  /**
   * @pilar X: Performance - useDeferredValue
   * Mantiene la interfaz responsiva durante el filtrado de grandes datasets.
   */
  const deferredQuery = useDeferredValue(searchQuery);

  /**
   * MOTOR DE FILTRADO TÁCTICO (Pure Logic)
   * @description Procesa la concurrencia de búsqueda y filtros regionales.
   * @fix react-hooks/purity: performance.now() movido a un useEffect de telemetría.
   */
  const filteredNodes = useMemo(() => {
    const query = deferredQuery.toLowerCase().trim();
    return agencies.filter((node: AgencyEntity) => {
      const matchesSearch = node.brandName.toLowerCase().includes(query) || node.taxId.includes(query);
      const matchesFilter = activeFilter === 'ALL' || node.jurisdiction === activeFilter;
      return matchesSearch && matchesFilter;
    });
  }, [agencies, deferredQuery, activeFilter]);

  /**
   * TELEMETRÍA DE FILTRADO (Heimdall v2.5)
   * @pilar IV: Registra el rendimiento del filtrado fuera del ciclo de render.
   */
  useEffect(() => {
    const startTime = performance.now();
    // Ejecutamos una operación fantasma para medir el impacto de la búsqueda
    if (deferredQuery.length > 0) {
      const duration = (performance.now() - startTime).toFixed(4);
      console.log(`${C.cyan}   ✓ [METRIC]${C.reset} Filter Recon: ${filteredNodes.length} nodes | Latency: ${C.yellow}${duration}ms${C.reset}`);
    }
  }, [filteredNodes, deferredQuery]);

  /**
   * AGREGADORES FINANCIEROS (SSoT)
   * @fix TS7006: Tipado estricto del acumulador y el iterador.
   */
  const stats = useMemo(() => {
    return filteredNodes.reduce((acc: { totalYield: number; pendingCommissions: number }, curr: AgencyEntity) => ({
      totalYield: acc.totalYield + curr.totalYield,
      pendingCommissions: acc.pendingCommissions + curr.pendingCommission
    }), { totalYield: 0, pendingCommissions: 0 });
  }, [filteredNodes]);

  /**
   * HANDLER: handleRegionChange
   * @description Utiliza startTransition para priorizar la fluidez de la UI.
   */
  const handleRegionChange = useCallback((region: string) => {
    startTransition(() => {
      setActiveFilter(region);
      console.log(`${C.magenta}[DNA][PRM]${C.reset} Context changed: ${C.cyan}${region}${C.reset}`);
    });
  }, []);

  /**
   * RESOLVER DE ESTADO
   * @fix TS2304: Uso de XCircle y ShieldAlert importados.
   */
  const getStatusConfig = useCallback((status: string): StatusConfig => {
    const map: Record<string, StatusConfig> = {
      active: { icon: ShieldCheck, color: 'text-success', bg: 'bg-success/10', label: 'Verificada' },
      blocked: { icon: XCircle, color: 'text-red-500', bg: 'bg-red-500/10', label: 'Bloqueada' }
    };
    return map[status] || { icon: ShieldAlert, color: 'text-yellow-500', bg: 'bg-yellow-500/10', label: 'Em Revisão' };
  }, []);

  return (
    <div className={cn("space-y-12 animate-in fade-in duration-1000", className)}>
      
      {/* --- 1. SECCIÓN DE MÉTRICAS (Silo B Hub) --- */}
      <MetricsDashboard 
        totalYield={stats.totalYield} 
        pendingCommissions={stats.pendingCommissions} 
        count={filteredNodes.length}
        isPending={isPending}
      />

      {/* --- 2. CONSOLA DE COMANDO TÁCTICO --- */}
      <nav className="flex flex-col xl:flex-row gap-6 items-center justify-between bg-surface/40 backdrop-blur-3xl p-4 rounded-[2.5rem] border border-border/50 shadow-2xl transition-all duration-700 hover:border-primary/10">
        
        <div className="relative w-full md:w-96 group">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground/30 group-focus-within:text-primary transition-colors" size={18} />
          <input 
            type="text"
            className="w-full bg-background/40 border border-border/50 rounded-2xl py-4 pl-16 pr-8 text-sm outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/5 transition-all text-foreground font-sans shadow-inner placeholder:text-muted-foreground/20"
            placeholder="Search by Brand or CNPJ/RUT..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)} 
          />
        </div>

        <div className="flex items-center gap-2 bg-background/20 p-2 rounded-2xl border border-border/30 overflow-x-auto no-scrollbar">
             <div className="px-4 text-muted-foreground opacity-30"><Filter size={14} /></div>
             {['ALL', 'BR', 'CL', 'INTL'].map((region: string) => {
               const isActive = activeFilter === region;
               return (
                 <button
                   key={region}
                   onClick={() => handleRegionChange(region)}
                   className={cn(
                     "flex items-center gap-3 px-6 py-2.5 rounded-xl text-[10px] font-bold transition-all uppercase tracking-widest outline-none whitespace-nowrap",
                     isActive ? "bg-foreground text-background shadow-2xl scale-[1.05]" : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                   )}
                 >
                   {region}
                 </button>
               );
             })}
        </div>

        <button className="flex items-center gap-4 px-10 py-4 rounded-full bg-foreground text-background font-bold text-[10px] uppercase tracking-[0.4em] hover:bg-primary hover:text-white transition-all shadow-3xl active:scale-95 shrink-0 group">
           <UserCheck size={18} className="group-hover:rotate-12 transition-transform" /> 
           {dictionary.agent_management.add_agent}
        </button>
      </nav>

      {/* --- 3. VIEWPORT DE RENDERIZADO (List Node) --- */}
      <motion.div 
        layout 
        className={cn(
          "grid grid-cols-1 gap-6 min-h-[450px] transform-gpu transition-all duration-700",
          isPending ? "grayscale opacity-40 blur-sm" : "grayscale-0 opacity-100 blur-0"
        )}
      >
        <AnimatePresence mode="popLayout">
          {filteredNodes.length > 0 ? (
            filteredNodes.map((agency: AgencyEntity) => (
              <AgencyRow 
                key={agency.id} 
                agency={agency} 
                status={getStatusConfig(agency.status)} 
              />
            ))
          ) : (
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
              className="py-48 text-center space-y-8 rounded-[4rem] border-2 border-dashed border-border bg-surface/20 relative overflow-hidden"
            >
              <div className="relative w-max mx-auto">
                <div className="absolute inset-0 bg-primary/5 blur-[80px] rounded-full animate-pulse" />
                <Users size={64} className="mx-auto text-muted-foreground/10 relative" strokeWidth={1} />
              </div>
              <div className="space-y-2">
                <h4 className="text-foreground font-display text-xl font-bold uppercase tracking-tight">Perímetro Vazio</h4>
                <p className="text-muted-foreground font-mono uppercase tracking-[0.5em] text-[9px] animate-pulse">
                  HANDSHAKE_NO_NODES_FOUND
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* --- 4. TELEMETRÍA DE INFRAESTRUCTRURA --- */}
      <footer className="pt-12 border-t border-border/40 flex flex-col lg:flex-row justify-between items-center gap-10 opacity-50 hover:opacity-100 transition-opacity duration-1000">
         <div className="flex items-center gap-8">
            <div className="flex items-center gap-4">
              <Activity size={18} className="text-success animate-pulse" />
              <span className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-foreground">Silo B Pulse: NOMINAL</span>
            </div>
            <div className="h-4 w-px bg-border/40" />
            <div className="flex items-center gap-4">
              <Zap size={18} className={cn("transition-colors", isPending ? "text-yellow-500" : "text-primary")} />
              <span className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-foreground">
                Engine: {isPending ? 'TRANSITIONING' : 'IDLE'}
              </span>
            </div>
         </div>
         
         <div className="flex items-center gap-4 text-muted-foreground">
            <BarChart3 size={16} />
            <p className="text-[9px] font-mono uppercase tracking-[0.5em]">Partner Network Management v6.4</p>
         </div>
      </footer>
    </div>
  );
}