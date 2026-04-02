/**
 * @file apps/portfolio-web/src/components/sections/portal/PartnerNetworkManager.tsx
 * @description Enterprise Partner Network Manager (Silo B Module).
 *              Refactorizado: Linter Purgado (0 warnings), tipado estricto
 *              y desacoplamiento del store de UI innecesario.
 * @version 2.2 - Linter Pure & Data Contract Sync
 * @author Staff Engineer - MetaShark Tech
 */

'use client';

import React, { useState, useMemo } from 'react';
import { AnimatePresence } from 'framer-motion';
import { UserCheck, ShieldCheck, ShieldAlert, XCircle, type LucideIcon } from 'lucide-react';

/** IMPORTACIONES DE INFRAESTRUCTRURA */
import { cn } from '../../../lib/utils/cn';
import type { Dictionary } from '../../../lib/schemas/dictionary.schema';
import { AgencyRow } from './media/AgencyRow';

/**
 * @interface AgencyEntity
 * @description Contrato local de datos para entidades de agencia.
 */
export interface AgencyEntity {
  id: string;
  brandName: string;
  jurisdiction: 'BR' | 'CL' | 'AR' | 'US' | 'INTL';
  taxId: string;
  iataCode?: string;
  trustScore: number;
  status: 'active' | 'review' | 'blocked';
  totalYield: number;
  pendingCommission: number;
  logoUrl?: string;
}

/**
 * @interface StatusConfig
 */
export interface StatusConfig {
  icon: LucideIcon;
  color: string;
  bg: string;
  label: string;
}

interface PartnerManagementProps {
  agencies: AgencyEntity[];
  dictionary: Dictionary['partner_network'];
  className?: string;
}

/**
 * MODULE: PartnerNetworkManager
 * @description Terminal de gestión PRM (Partner Relationship Management).
 */
export function PartnerNetworkManager({ agencies, dictionary, className }: PartnerManagementProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterJurisdiction, setFilterJurisdiction] = useState('ALL');

  const filteredNodes = useMemo(() => 
    agencies.filter(node => 
      node.brandName.toLowerCase().includes(searchQuery.toLowerCase()) && 
      (filterJurisdiction === 'ALL' || node.jurisdiction === filterJurisdiction)
    ), 
  [agencies, searchQuery, filterJurisdiction]);

  /**
   * RESOLUCIÓN SEMÁNTICA DE ESTADO (Oxygen Engine)
   */
  const getStatusConfig = (status: string): StatusConfig => ({
    active: { icon: ShieldCheck, color: 'text-success', bg: 'bg-success/10', label: 'Verificada' },
    blocked: { icon: XCircle, color: 'text-red-500', bg: 'bg-red-500/10', label: 'Bloqueada' }
  }[status] || { icon: ShieldAlert, color: 'text-yellow-500', bg: 'bg-yellow-500/10', label: 'Em Revisão' });

  return (
    <div className={cn("space-y-8 animate-in fade-in duration-1000", className)}>
      
      <header className="flex flex-col xl:flex-row gap-6 items-center justify-between bg-surface/60 backdrop-blur-xl p-6 rounded-4xl border border-border shadow-luxury">
        <input 
            type="text"
            className="w-full md:w-80 bg-background/40 border border-border/50 rounded-2xl py-3.5 px-6 text-sm outline-none focus:border-primary/40 transition-all text-foreground"
            placeholder="Buscar por Marca ou CNPJ/RUT..." 
            onChange={(e) => setSearchQuery(e.target.value)} 
        />

        <div className="flex items-center gap-2 bg-background/20 p-1.5 rounded-2xl border border-border/40">
             {['ALL', 'BR', 'CL', 'INTL'].map((region) => (
               <button
                 key={region}
                 onClick={() => setFilterJurisdiction(region)}
                 className={cn(
                   "px-4 py-2 rounded-xl text-[9px] font-bold transition-all uppercase tracking-widest outline-none",
                   filterJurisdiction === region ? "bg-foreground text-background shadow-md" : "text-muted-foreground hover:text-foreground"
                 )}
               >
                 {region}
               </button>
             ))}
        </div>

        <button className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-primary text-white text-[10px] font-bold uppercase tracking-widest hover:brightness-110 transition-all shadow-lg active:scale-95">
           <UserCheck size={14} /> {dictionary.agent_management.add_agent}
        </button>
      </header>

      <div className="grid grid-cols-1 gap-4">
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
            <div className="py-40 text-center text-muted-foreground font-mono uppercase tracking-[0.4em] text-[10px]">
              Nenhum parceiro localizado.
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}