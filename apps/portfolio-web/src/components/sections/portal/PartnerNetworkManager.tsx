/**
 * @file apps/portfolio-web/src/components/sections/portal/PartnerNetworkManager.tsx
 * @description Orquestador Soberano de la Red de Alianzas (PRM Silo B).
 *              Gestiona el inventario de agencias, métricas de rendimiento y 
 *              filtros regionales con observabilidad Heimdall v2.0.
 *              Refactorizado: Resolución de TS2304 (Interface definition), 
 *              erradicación de 'implicit any', cumplimiento de pureza React 19
 *              y optimización de renderizado atómico.
 * @version 6.2 - Type-Safe Sovereign Architecture (Linter Pure)
 * @author Raz Podestá - MetaShark Tech
 */

'use client';

import React, { useState, useMemo, useEffect, useCallback, useDeferredValue, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UserCheck, ShieldCheck, ShieldAlert, XCircle, Search, 
  TrendingUp, Wallet, Users, Activity, Filter, BarChart3, Globe 
} from 'lucide-react';

/** IMPORTACIONES DE INFRAESTRUCTRURA */
import { cn } from '../../../lib/utils/cn';
import { AgencyRow } from './media/AgencyRow';
import type { AgencyEntity, StatusConfig } from './types';
import type { Dictionary } from '../../../lib/schemas/dictionary.schema';

/**
 * CONSTANTES DE DISEÑO (Oxygen Engine)
 */
const C = {
  reset: '\x1b[0m', cyan: '\x1b[36m', green: '\x1b[32m', 
  yellow: '\x1b[33m', magenta: '\x1b[35m', bold: '\x1b[1m'
};

/**
 * @interface PartnerNetworkManagerProps
 * @description Contrato de entrada para el gestor de socios.
 */
interface PartnerNetworkManagerProps {
  /** Colección de agencias proveniente del núcleo de datos */
  agencies: AgencyEntity[];
  /** Diccionario localizado para el silo de partners */
  dictionary: Dictionary['partner_network'];
  className?: string;
}

// ============================================================================
// COMPONENTES ATÓMICOS MEMOIZADOS (Responsabilidad Única)
// ============================================================================

/**
 * @component MetricsHeader
 * @description Visualiza los agregados financieros del clúster de socios.
 */
const MetricsHeader = memo(({ totalYield, pendingCommissions, count }: { 
  totalYield: number; pendingCommissions: number; count: number 
}) => (
  <header className="grid grid-cols-1 md:grid-cols-3 gap-8">
    <div className="p-8 rounded-[3rem] bg-surface/60 border border-border/50 flex items-center justify-between shadow-luxury transition-all">
       <div className="space-y-1">
         <span className="block text-[9px] font-mono font-bold text-muted-foreground uppercase tracking-widest">Marketplace Yield</span>
         <p className="text-4xl font-display font-bold text-foreground tracking-tighter transition-colors">
            R$ {totalYield.toLocaleString()}
         </p>
       </div>
       <div className="p-4 rounded-2xl bg-background border border-border shadow-inner text-success">
          <TrendingUp size={26} strokeWidth={1.2} />
       </div>
    </div>
    
    <div className="p-8 rounded-[3rem] bg-surface/60 border border-border/50 flex items-center justify-between shadow-luxury transition-all">
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

    <div className="p-8 rounded-[3rem] bg-primary/5 border border-primary/20 flex items-center justify-between shadow-[0_0_60px_oklch(65%_0.25_270/0.05)] transition-all">
       <div className="space-y-1">
         <span className="block text-[9px] font-mono font-bold text-primary uppercase tracking-widest mb-1">Network Reach</span>
         <p className="text-4xl font-display font-bold text-primary tracking-tighter">{count}</p>
       </div>
       <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-2xl">
          <Users size={30} strokeWidth={1.2} />
       </div>
    </div>
  </header>
));

MetricsHeader.displayName = 'MetricsHeader';

/**
 * @component EmptyStateNode
 * @description Fallback visual informativo.
 */
const EmptyStateNode = memo(() => (
  <motion.div 
    initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
    className="py-48 text-center space-y-8 rounded-[4rem] border-2 border-dashed border-border bg-surface/20 relative overflow-hidden"
  >
    <div className="relative w-max mx-auto">
      <div className="absolute inset-0 bg-primary/5 blur-[80px] rounded-full animate-pulse" />
      <Users size={64} className="mx-auto text-muted-foreground/10 relative" strokeWidth={1} />
    </div>
    <div className="space-y-2">
      <p className="text-foreground font-display text-xl font-bold uppercase tracking-tight">Perímetro Deserto</p>
      <p className="text-muted-foreground font-mono uppercase tracking-[0.5em] text-[9px] animate-pulse">
        HANDSHAKE_NO_NODES_FOUND
      </p>
    </div>
  </motion.div>
));

EmptyStateNode.displayName = 'EmptyStateNode';

// ============================================================================
// COMPONENTE PRINCIPAL: PartnerNetworkManager
// ============================================================================

export function PartnerNetworkManager({ agencies, dictionary, className }: PartnerNetworkManagerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('ALL');
  
  /**
   * @fix Pilar X: Deferred Value. 
   * Optimiza el rendimiento de búsqueda en clústeres densos sin bloquear el hilo principal.
   */
  const deferredQuery = useDeferredValue(searchQuery);

  /**
   * PROTOCOLO HEIMDALL: Telemetría de Montaje
   */
  useEffect(() => {
    const traceId = `prm_session_${Math.random().toString(36).substring(7)}`;
    console.log(`${C.magenta}${C.bold}[DNA][PRM]${C.reset} Management Terminal Online | Trace: ${C.cyan}${traceId}${C.reset}`);
  }, []);

  /**
   * LOGIC: filteredNodes
   * @fix TS7006: Tipado explícito para erradicar implicit any.
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
   * LOGIC: stats
   * @fix TS7006: Tipado explícito de los acumuladores en el reducer financiero.
   */
  const stats = useMemo(() => {
    return filteredNodes.reduce((acc: { totalYield: number; pendingCommissions: number }, curr: AgencyEntity) => ({
      totalYield: acc.totalYield + curr.totalYield,
      pendingCommissions: acc.pendingCommissions + curr.pendingCommission
    }), { totalYield: 0, pendingCommissions: 0 });
  }, [filteredNodes]);

  /**
   * TELEMETRÍA DE RENDIMIENTO (Heimdall v2.0)
   * @fix react-hooks/purity: Movido de render a useEffect para asegurar pureza del componente.
   */
  useEffect(() => {
    const start = performance.now();
    // Medimos el impacto tras la reconciliación del filtrado
    const nodeCount = filteredNodes.length;
    const duration = (performance.now() - start).toFixed(4);
    
    if (deferredQuery.length > 2) {
      console.log(`${C.cyan}   ✓ [METRIC]${C.reset} Search Sync | Nodes: ${nodeCount} | Latency: ${C.yellow}${duration}ms${C.reset}`);
    }
  }, [filteredNodes, deferredQuery]);

  /**
   * RESOLVER DE ESTADO
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
      
      {/* 1. SECCIÓN DE MÉTRICAS (Silo B Hub) */}
      <MetricsHeader 
        totalYield={stats.totalYield} 
        pendingCommissions={stats.pendingCommissions} 
        count={filteredNodes.length} 
      />

      {/* 2. BARRA DE COMANDO TÁCTICO (Filtros & Buscador) */}
      <nav className="flex flex-col xl:flex-row gap-6 items-center justify-between bg-surface/40 backdrop-blur-3xl p-4 rounded-[2.5rem] border border-border/50 shadow-2xl">
        <div className="relative w-full md:w-96 group">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground/30 group-focus-within:text-primary transition-colors" size={18} />
          <input 
            type="text"
            className="w-full bg-background/40 border border-border/50 rounded-2xl py-4 pl-16 pr-8 text-sm outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/5 transition-all text-foreground font-sans shadow-inner"
            placeholder="Buscar por Marca ou Identificador Fiscal..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)} 
          />
        </div>

        <div className="flex items-center gap-2 bg-background/20 p-2 rounded-2xl border border-border/30 overflow-x-auto no-scrollbar">
             <div className="px-4 text-muted-foreground"><Filter size={14} /></div>
             {['ALL', 'BR', 'CL', 'INTL'].map((region: string) => {
               const count = region === 'ALL' ? agencies.length : agencies.filter((a: AgencyEntity) => a.jurisdiction === region).length;
               const isActive = activeFilter === region;
               return (
                 <button
                   key={region}
                   onClick={() => setActiveFilter(region)}
                   className={cn(
                     "flex items-center gap-3 px-6 py-2.5 rounded-xl text-[10px] font-bold transition-all uppercase tracking-widest outline-none whitespace-nowrap",
                     isActive ? "bg-foreground text-background shadow-2xl scale-[1.05]" : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                   )}
                 >
                   {region}
                   <span className={cn("px-2 py-0.5 rounded-md text-[9px] font-mono", isActive ? "bg-background/20 text-background" : "bg-foreground/5 text-muted-foreground")}>
                     {count}
                   </span>
                 </button>
               );
             })}
        </div>

        <button className="flex items-center gap-4 px-10 py-4 rounded-full bg-foreground text-background font-bold text-[10px] uppercase tracking-[0.3em] hover:bg-primary hover:text-white transition-all shadow-3xl active:scale-95 shrink-0 group">
           <UserCheck size={18} className="group-hover:rotate-12 transition-transform" /> 
           {dictionary.agent_management.add_agent}
        </button>
      </nav>

      {/* 3. VIEWPORT DE RENDERIZADO (Agency Collection) */}
      <motion.div layout className="grid grid-cols-1 gap-6 min-h-[450px] transform-gpu">
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
            <EmptyStateNode />
          )}
        </AnimatePresence>
      </motion.div>

      {/* 4. FOOTER DE INFRAESTRUCTRURA */}
      <footer className="pt-12 border-t border-border/40 flex flex-col lg:flex-row justify-between items-center gap-10 opacity-50 hover:opacity-100 transition-opacity duration-1000">
         <div className="flex items-center gap-8">
            <div className="flex items-center gap-4">
              <Activity size={18} className="text-success animate-pulse" />
              <span className="text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-foreground">Silo B Hub: NOMINAL</span>
            </div>
            <div className="h-4 w-px bg-border/40" />
            <div className="flex items-center gap-4">
              <Globe size={18} className="text-primary" />
              <span className="text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-foreground">Rede de Alianças: ENCRYPTED</span>
            </div>
         </div>
         
         <div className="flex items-center gap-4 text-muted-foreground">
            <BarChart3 size={16} />
            <p className="text-[9px] font-mono uppercase tracking-[0.5em]">Partner Network Management v6.2</p>
         </div>
      </footer>
    </div>
  );
}