/**
 * @file PartnerNetworkManager.tsx
 * @description Enterprise Partner Relationship Management (PRM) Console.
 *              Orquestador del Silo B para la gestión de nodos comerciales.
 *              Refactorizado: Agregación de métricas de rendimiento (Yield), 
 *              filtros inteligentes con conteo y optimización de renderizado GPU.
 * @version 4.0 - Enterprise Intelligence & Performance Sync
 * @author Raz Podestá - Staff Engineer, MetaShark Tech
 */

'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UserCheck, 
  ShieldCheck, 
  ShieldAlert, 
  XCircle, 
  Search, 
  TrendingUp, 
  Wallet,
  Users
} from 'lucide-react';

/** IMPORTACIONES DE INFRAESTRUCTRURA */
import { cn } from '../../../lib/utils/cn';
import { AgencyRow } from './media/AgencyRow';
import type { AgencyEntity, StatusConfig } from './types';
import type { Dictionary } from '../../../lib/schemas/dictionary.schema';

/**
 * @interface PartnerNetworkManagerProps
 */
interface PartnerNetworkManagerProps {
  /** Inventario de agencias sincronizado con el Core CMS */
  agencies: AgencyEntity[];
  /** Diccionario del Silo B validado por SSoT */
  dictionary: Dictionary['partner_network'];
  className?: string;
}

/**
 * APARATO PRINCIPAL: PartnerNetworkManager
 * @description Terminal de control para la Red de Alianzas B2B.
 */
export function PartnerNetworkManager({ 
  agencies, 
  dictionary, 
  className 
}: PartnerNetworkManagerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('ALL');

  /**
   * PROTOCOLO HEIMDALL: Telemetría de Red
   */
  useEffect(() => {
    console.log(`[HEIMDALL][SILO-B] Partner Cluster active. Nodes: ${agencies.length}`);
  }, [agencies.length]);

  /**
   * MOTOR DE FILTRADO Y BÚSQUEDA (High Performance)
   * @description Filtrado O(n) con normalización semántica.
   */
  const filteredNodes = useMemo(() => {
    return agencies.filter(node => {
      const matchesSearch = node.brandName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          node.taxId.includes(searchQuery);
      const matchesFilter = activeFilter === 'ALL' || node.jurisdiction === activeFilter;
      return matchesSearch && matchesFilter;
    });
  }, [agencies, searchQuery, activeFilter]);

  /**
   * INTELIGENCIA COMERCIAL: Agregados de Clúster
   * @description Calcula el valor acumulado de los nodos visibles.
   */
  const stats = useMemo(() => {
    return filteredNodes.reduce((acc, curr) => ({
      totalYield: acc.totalYield + curr.totalYield,
      pendingCommissions: acc.pendingCommissions + curr.pendingCommission
    }), { totalYield: 0, pendingCommissions: 0 });
  }, [filteredNodes]);

  /**
   * RESOLVER DE ESTADO (Oxygen Engine Standards)
   */
  const getStatusConfig = (status: string): StatusConfig => {
    const map: Record<string, StatusConfig> = {
      active: { icon: ShieldCheck, color: 'text-success', bg: 'bg-success/10', label: 'Verificada' },
      blocked: { icon: XCircle, color: 'text-red-500', bg: 'bg-red-500/10', label: 'Bloqueada' }
    };
    return map[status] || { icon: ShieldAlert, color: 'text-yellow-500', bg: 'bg-yellow-500/10', label: 'Em Revisão' };
  };

  return (
    <div className={cn("space-y-10 animate-in fade-in duration-1000", className)}>
      
      {/* --- 1. CLUSTER PERFORMANCE STRIP --- */}
      <header className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-8 rounded-4xl bg-surface/60 border border-border shadow-luxury group transition-all hover:bg-surface">
           <div className="flex items-center justify-between mb-2">
             <span className="text-[8px] font-mono text-muted-foreground uppercase tracking-widest">Marketplace Yield</span>
             <TrendingUp size={14} className="text-success" />
           </div>
           <p className="text-3xl font-display font-bold text-foreground tracking-tighter">
             R$ {stats.totalYield.toLocaleString()}
           </p>
        </div>
        
        <div className="p-8 rounded-4xl bg-surface/60 border border-border shadow-luxury">
           <div className="flex items-center justify-between mb-2">
             <span className="text-[8px] font-mono text-muted-foreground uppercase tracking-widest">Allocated Commissions</span>
             <Wallet size={14} className="text-primary" />
           </div>
           <p className="text-3xl font-display font-bold text-foreground tracking-tighter">
             R$ {stats.pendingCommissions.toLocaleString()}
           </p>
        </div>

        <div className="p-8 rounded-4xl bg-primary/5 border border-primary/20 shadow-luxury flex items-center justify-between">
           <div>
             <span className="block text-[8px] font-mono text-primary uppercase tracking-widest mb-1">Active Reach</span>
             <p className="text-3xl font-display font-bold text-primary tracking-tighter">{filteredNodes.length}</p>
           </div>
           <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
              <Users size={24} />
           </div>
        </div>
      </header>

      {/* --- 2. TACTICAL FILTER BAR --- */}
      <nav className="flex flex-col xl:flex-row gap-6 items-center justify-between bg-surface/40 backdrop-blur-xl p-4 rounded-4xl border border-border/50">
        <div className="relative w-full md:w-80 group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground/40 group-focus-within:text-primary transition-colors" size={16} />
          <input 
            type="text"
            className="w-full bg-background/40 border border-border/50 rounded-2xl py-3 pl-12 pr-6 text-sm outline-none focus:border-primary/40 transition-all text-foreground font-sans"
            placeholder="Buscar por Marca ou CNPJ..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)} 
          />
        </div>

        <div className="flex items-center gap-2 bg-background/20 p-1.5 rounded-2xl border border-border/40 overflow-x-auto no-scrollbar">
             {['ALL', 'BR', 'CL', 'INTL'].map((region) => {
               const count = region === 'ALL' ? agencies.length : agencies.filter(a => a.jurisdiction === region).length;
               const isActive = activeFilter === region;
               return (
                 <button
                   key={region}
                   onClick={() => setActiveFilter(region)}
                   className={cn(
                     "flex items-center gap-3 px-5 py-2 rounded-xl text-[9px] font-bold transition-all uppercase tracking-widest outline-none whitespace-nowrap",
                     isActive ? "bg-foreground text-background shadow-md" : "text-muted-foreground hover:text-foreground"
                   )}
                 >
                   {region}
                   <span className={cn("px-1.5 py-0.5 rounded-md text-[8px]", isActive ? "bg-background/20 text-background" : "bg-foreground/5 text-muted-foreground")}>
                     {count}
                   </span>
                 </button>
               );
             })}
        </div>

        <button className="flex items-center gap-3 px-8 py-3.5 rounded-full bg-foreground text-background text-[10px] font-bold uppercase tracking-widest hover:bg-primary hover:text-white transition-all shadow-xl active:scale-95 shrink-0">
           <UserCheck size={16} /> {dictionary.agent_management.add_agent}
        </button>
      </nav>

      {/* --- 3. PARTNER REPOSITORY GRID --- */}
      <motion.div layout className="grid grid-cols-1 gap-4 min-h-[400px]">
        <AnimatePresence mode="popLayout">
          {filteredNodes.length > 0 ? (
            filteredNodes.map((agency) => (
              <AgencyRow 
                key={agency.id} 
                agency={agency} 
                status={getStatusConfig(agency.status)} 
              />
            ))
          ) : (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-40 text-center space-y-4 rounded-5xl border border-dashed border-border bg-surface/20"
            >
              <Users size={48} className="mx-auto text-muted-foreground/20" strokeWidth={1} />
              <p className="text-muted-foreground font-mono uppercase tracking-[0.4em] text-[10px]">
                Nenhum nó comercial localizado neste perímetro.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}