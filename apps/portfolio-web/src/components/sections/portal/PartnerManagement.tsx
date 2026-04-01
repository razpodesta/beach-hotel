/**
 * @file apps/portfolio-web/src/components/sections/portal/PartnerManagement.tsx
 * @description Centro de Mando para la Red de Alianzas B2B (Silo B).
 *              Refactorizado: Tipado estricto en subcomponentes (Zero Any) 
 *              y purga final de variables no utilizadas (Linter Compliance).
 * @version 2.3 - Enterprise Level 4.0 Standard
 * @author Staff Engineer - MetaShark Tech
 */

'use client';

import React, { useState, useMemo, memo } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, ShieldAlert, Briefcase, 
  MoreVertical, XCircle, Globe, type LucideIcon 
} from 'lucide-react';

import { cn } from '../../../lib/utils/cn';
import type { Dictionary } from '../../../lib/schemas/dictionary.schema';

/**
 * @interface AgencyEntity
 */
export interface AgencyEntity {
  id: string;
  brandName: string;
  legalName: string;
  taxId: string;
  jurisdiction: 'BR' | 'CL' | 'AR' | 'US' | 'INTL';
  trustScore: number;
  status: 'active' | 'review' | 'blocked';
  totalYield: number;
  pendingCommission: number;
  iataCode?: string;
  logoUrl?: string;
}

/**
 * @interface StatusConfig
 * @description Contrato estricto para la configuración de estado. Erradica 'any'.
 */
interface StatusConfig {
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
 * SUB-APARATO: AgencyArticle
 * @description Unidad de visualización optimizada para evitar re-renders innecesarios.
 */
const AgencyArticle = memo(({ agency, status }: { agency: AgencyEntity; status: StatusConfig }) => {
  const StatusIcon = status.icon;
  
  return (
    <motion.article
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="group flex flex-col md:flex-row items-center justify-between p-6 rounded-4xl border border-border bg-surface/30 hover:bg-surface/50 hover:border-primary/30 transition-all duration-500"
    >
      <div className="flex items-center gap-6 flex-1">
        <div className="h-14 w-14 rounded-2xl bg-background border border-border flex items-center justify-center overflow-hidden shrink-0 group-hover:border-primary/20 transition-colors">
            {agency.logoUrl ? (
              <Image src={agency.logoUrl} alt={agency.brandName} width={40} height={40} className="object-contain p-2" />
            ) : (
              <Briefcase size={24} className="text-muted-foreground/30" />
            )}
        </div>
        <div>
          <h4 className="font-display text-lg font-bold text-foreground leading-tight tracking-tight">
            {agency.brandName}
          </h4>
          <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
            {agency.taxId} • {agency.iataCode || 'NO-IATA'}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-12 mt-6 md:mt-0 px-8">
          <div className="text-center space-y-1">
            <span className="block text-[8px] font-bold text-muted-foreground uppercase tracking-widest">Credibilidade</span>
            <div className="flex items-center gap-2">
                <div className="w-16 h-1.5 bg-foreground/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }} 
                    animate={{ width: `${agency.trustScore}%` }} 
                    className={cn("h-full", agency.trustScore > 70 ? 'bg-success' : 'bg-primary')} 
                  />
                </div>
                <span className="text-xs font-mono font-bold text-foreground">{agency.trustScore}%</span>
            </div>
          </div>
      </div>

      <div className="flex items-center gap-6 mt-6 md:mt-0 px-8 border-l border-border/50">
          <div className={cn("flex items-center gap-2 font-bold text-[10px] uppercase tracking-wider", status.color)}>
             <StatusIcon size={14} />
             {status.label}
          </div>
      </div>

      <div className="flex items-center gap-3 ml-6">
          <button className="p-3 rounded-xl bg-background border border-border hover:text-primary transition-all active:scale-90">
            <MoreVertical size={18} />
          </button>
      </div>
    </motion.article>
  );
});

AgencyArticle.displayName = 'AgencyArticle';

export function PartnerManagement({ agencies, dictionary: _dictionary, className }: PartnerManagementProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterJurisdiction, setFilterJurisdiction] = useState<string>('ALL');

  const filteredAgencies = useMemo(() => {
    return agencies.filter(agency => {
      const matchesSearch = agency.brandName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            agency.taxId.includes(searchQuery);
      const matchesJurisdiction = filterJurisdiction === 'ALL' || agency.jurisdiction === filterJurisdiction;
      return matchesSearch && matchesJurisdiction;
    });
  }, [agencies, searchQuery, filterJurisdiction]);

  const getStatusConfig = (status: string): StatusConfig => {
    switch (status) {
      case 'active': return { icon: ShieldCheck, color: 'text-success', bg: 'bg-success/10', label: 'Verificada' };
      case 'blocked': return { icon: XCircle, color: 'text-red-500', bg: 'bg-red-500/10', label: 'Bloqueada' };
      default: return { icon: ShieldAlert, color: 'text-yellow-500', bg: 'bg-yellow-500/10', label: 'Em Revisão' };
    }
  };

  return (
    <div className={cn("space-y-8 animate-in fade-in duration-1000", className)}>
      <header className="flex flex-col xl:flex-row gap-6 items-center justify-between bg-surface/60 backdrop-blur-xl p-6 rounded-4xl border border-border shadow-luxury">
        <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por Marca ou CNPJ/RUT..."
            className="w-full md:w-80 bg-background/40 border border-border/50 rounded-2xl py-3.5 px-6 text-sm outline-none focus:border-primary/40 transition-all text-foreground"
        />

        <div className="flex items-center gap-2 bg-background/20 p-1.5 rounded-2xl border border-border/40">
             {['ALL', 'BR', 'CL', 'INTL'].map((region) => (
               <button
                 key={region}
                 onClick={() => setFilterJurisdiction(region)}
                 className={cn(
                   "px-4 py-2 rounded-xl text-[9px] font-bold transition-all uppercase tracking-widest",
                   filterJurisdiction === region ? "bg-foreground text-background shadow-md" : "text-muted-foreground hover:text-foreground"
                 )}
               >
                 {region}
               </button>
             ))}
        </div>
      </header>

      <div className="grid grid-cols-1 gap-4">
        <AnimatePresence mode="popLayout">
          {filteredAgencies.length > 0 ? (
            filteredAgencies.map((agency) => (
               <AgencyArticle key={agency.id} agency={agency} status={getStatusConfig(agency.status)} />
            ))
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-40 text-center space-y-6 bg-surface/10 rounded-4xl border border-dashed border-border">
               <Globe size={48} className="mx-auto text-muted-foreground/20 animate-pulse" />
               <p className="text-sm font-mono text-muted-foreground uppercase tracking-[0.4em]">Nenhum parceiro localizado no perímetro</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}