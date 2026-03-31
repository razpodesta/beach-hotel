/**
 * @file apps/portfolio-web/src/components/sections/portal/PartnerManagement.tsx
 * @description Centro de Mando para la Red de Alianzas B2B (HopEx v4.0).
 *              Orquesta la auditoría de agencias, monitoreo de Trust Score 
 *              y segmentación por jurisdicción legal.
 *              Refactorizado: Purga de linter, optimización LCP (Next/Image) 
 *              y normalización de clases Tailwind v4.
 * @version 1.1 - Linter Pure & Image Optimized
 * @author Staff Engineer - MetaShark Tech
 */

'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, ShieldAlert, Globe, Briefcase, 
  BarChart3, MoreVertical, XCircle, UserCheck 
} from 'lucide-react';

/** IMPORTACIONES DE INFRAESTRUCTRURA */
import { cn } from '../../../lib/utils/cn';
import type { Dictionary } from '../../../lib/schemas/dictionary.schema';

/**
 * @interface AgencyEntity
 */
interface AgencyEntity {
  id: string;
  brandName: string;
  legalName: string;
  taxId: string;
  jurisdiction: 'BR' | 'CL' | 'AR' | 'US' | 'INTL';
  trustScore: number;
  status: 'active' | 'review' | 'blocked';
  iataCode?: string;
  logoUrl?: string;
}

interface PartnerManagementProps {
  agencies: AgencyEntity[];
  dictionary: Dictionary['partner_network'];
  className?: string;
}

/**
 * MODULE: PartnerManagement
 */
export function PartnerManagement({ agencies, dictionary, className }: PartnerManagementProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterJurisdiction, setFilterJurisdiction] = useState<string>('ALL');
  const [filterStatus] = useState<string>('ALL');

  /**
   * MOTOR DE FILTRADO CORPORATIVO
   */
  const filteredAgencies = useMemo(() => {
    return agencies.filter(agency => {
      const matchesSearch = agency.brandName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            agency.taxId.includes(searchQuery);
      const matchesJurisdiction = filterJurisdiction === 'ALL' || agency.jurisdiction === filterJurisdiction;
      const matchesStatus = filterStatus === 'ALL' || agency.status === filterStatus;
      
      return matchesSearch && matchesJurisdiction && matchesStatus;
    });
  }, [agencies, searchQuery, filterJurisdiction, filterStatus]);

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'active': return { icon: ShieldCheck, color: 'text-success', bg: 'bg-success/10', label: 'Verificada' };
      case 'blocked': return { icon: XCircle, color: 'text-red-500', bg: 'bg-red-500/10', label: 'Bloqueada' };
      default: return { icon: ShieldAlert, color: 'text-yellow-500', bg: 'bg-yellow-500/10', label: 'Em Revisão' };
    }
  };

  return (
    <div className={cn("space-y-8 animate-in fade-in duration-1000", className)}>
      
      {/* --- 1. BARRA DE CONTROL TÁCTICO --- */}
      <header className="flex flex-col xl:flex-row gap-6 items-center justify-between bg-surface/60 backdrop-blur-xl p-6 rounded-4xl border border-border shadow-luxury">
        
        <div className="flex flex-col md:flex-row items-center gap-4 w-full xl:w-auto">
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por Marca ou CNPJ/RUT..."
            className="w-full md:w-80 bg-background/40 border border-border/50 rounded-2xl py-3.5 px-6 text-sm outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/5 transition-all text-foreground"
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
        </div>

        <button className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-primary text-white text-[10px] font-bold uppercase tracking-widest hover:brightness-110 transition-all shadow-lg active:scale-95">
           <UserCheck size={14} />
           {dictionary.agent_management.add_agent}
        </button>
      </header>

      {/* --- 2. GRID DE MONITOREO B2B --- */}
      <div className="grid grid-cols-1 gap-4">
        <AnimatePresence mode="popLayout">
          {filteredAgencies.length > 0 ? (
            filteredAgencies.map((agency, index) => {
              const status = getStatusConfig(agency.status);
              const StatusIcon = status.icon;

              return (
                <motion.article
                  key={agency.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="group flex flex-col md:flex-row items-center justify-between p-6 rounded-4xl border border-border bg-surface/30 hover:bg-surface/50 hover:border-primary/30 transition-all duration-500"
                >
                  <div className="flex items-center gap-6 flex-1">
                    <div className="h-14 w-14 rounded-2xl bg-background border border-border flex items-center justify-center overflow-hidden shrink-0 group-hover:border-primary/20 transition-colors">
                       {agency.logoUrl ? (
                         <Image 
                            src={agency.logoUrl} 
                            alt={agency.brandName} 
                            width={40} height={40} 
                            className="object-contain p-2" 
                         />
                       ) : (
                         <Briefcase size={24} className="text-muted-foreground/30" />
                       )}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                         <h4 className="font-display text-lg font-bold text-foreground leading-tight tracking-tight">
                           {agency.brandName}
                         </h4>
                         <span className={cn("px-2 py-0.5 rounded-md text-[8px] font-bold uppercase tracking-widest border", status.bg, status.color, "border-current/10")}>
                           {agency.jurisdiction}
                         </span>
                      </div>
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

                     <div className="hidden lg:block text-right space-y-1 border-l border-border/50 pl-12">
                        <span className="block text-[8px] font-bold text-muted-foreground uppercase tracking-widest">Status de Auditoria</span>
                        <div className={cn("flex items-center gap-2 font-bold text-[10px] uppercase tracking-wider", status.color)}>
                           <StatusIcon size={14} />
                           {status.label}
                        </div>
                     </div>
                  </div>

                  <div className="flex items-center gap-3 ml-6">
                     <button className="p-3 rounded-xl bg-background border border-border hover:border-primary/40 text-muted-foreground hover:text-primary transition-all active:scale-90">
                        <BarChart3 size={18} />
                     </button>
                     <button className="p-3 rounded-xl bg-background border border-border hover:bg-foreground hover:text-background transition-all active:scale-90">
                        <MoreVertical size={18} />
                     </button>
                  </div>
                </motion.article>
              );
            })
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-40 text-center space-y-6 bg-surface/10 rounded-[3rem] border border-dashed border-border">
               <Globe size={48} className="mx-auto text-muted-foreground/20 animate-pulse" />
               <p className="text-sm font-mono text-muted-foreground uppercase tracking-[0.4em]">Nenhum parceiro localizado no perímetro</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}