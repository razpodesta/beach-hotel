/**
 * @file apps/portfolio-web/src/components/sections/portal/partners/PartnerFilters.tsx
 * @description Consola de control táctico para la búsqueda y filtrado de la red de alianzas.
 *              Refactorizado: Erradicación de 'any', sellado de contratos SSoT y
 *              optimización de accesibilidad ARIA para controles regionales.
 *              Estándar: Oxygen UI v4 & Linter Pure.
 * @version 2.0 - Type Safe & SSoT Hardened
 * @author Staff Engineer - MetaShark Tech
 */

'use client';

import React, { memo } from 'react';
import { Search, Filter, UserCheck } from 'lucide-react';

/** IMPORTACIONES DE INFRAESTRUCTRURA (Nx Boundary Safe) */
import { cn } from '../../../../lib/utils/cn';
import type { PartnerNetworkDictionary } from '../../../../lib/schemas/partners/network.schema';

/**
 * @type JurisdictionFilter
 * @description Contrato de perímetros jurisdiccionales soportados por el PRM.
 */
type JurisdictionFilter = 'ALL' | 'BR' | 'CL' | 'US' | 'INTL';

/**
 * @interface PartnerFiltersProps
 * @pilar III: Props explícitas y documentadas.
 */
export interface PartnerFiltersProps {
  /** Valor actual de la búsqueda semántica */
  searchQuery: string;
  /** Dispatcher para actualizar el estado de búsqueda */
  setSearchQuery: (val: string) => void;
  /** Filtro de jurisdicción activo */
  activeFilter: string;
  /** Handler para la conmutación de perímetros */
  onFilterChange: (region: JurisdictionFilter) => void;
  /** Fragmento del diccionario validado por esquema Zod */
  dictionary: PartnerNetworkDictionary;
  className?: string;
}

/**
 * APARATO: PartnerFilters
 * @description Provee la interfaz de comandos para segmentar y localizar nodos en el Silo B.
 */
export const PartnerFilters = memo(({ 
  searchQuery, 
  setSearchQuery, 
  activeFilter, 
  onFilterChange, 
  dictionary,
  className
}: PartnerFiltersProps) => {

  const regions: JurisdictionFilter[] = ['ALL', 'BR', 'CL', 'US', 'INTL'];

  return (
    <nav 
      className={cn(
        "flex flex-col xl:flex-row gap-6 items-center justify-between p-4 rounded-[2.5rem] border",
        "bg-surface/40 backdrop-blur-3xl border-border/50 shadow-2xl transition-all duration-700 hover:border-primary/20",
        className
      )}
      aria-label="Filtros de Red de Partners"
    >
      {/* 1. BUSCADOR SEMÁNTICO (Node Finder) */}
      <div className="relative w-full md:w-96 group">
        <Search 
          className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground/30 group-focus-within:text-primary transition-colors" 
          size={18} 
        />
        <input 
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={cn(
            "w-full bg-background/40 border border-border/50 rounded-2xl py-4 pl-16 pr-8 text-sm outline-none transition-all",
            "focus:border-primary/40 focus:ring-4 focus:ring-primary/5 text-foreground font-sans shadow-inner",
            "placeholder:text-muted-foreground/20"
          )}
          placeholder="Search Brand or Tax ID..." 
        />
      </div>

      {/* 2. SELECTOR DE PERÍMETRO (Jurisdiction Gating) */}
      <div 
        className="flex items-center gap-2 bg-background/20 p-2 rounded-2xl border border-border/30 overflow-x-auto no-scrollbar"
        role="tablist"
      >
           <div className="px-3 text-muted-foreground/30" aria-hidden="true">
              <Filter size={14} />
           </div>
           
           {regions.map((region) => {
             const isActive = activeFilter === region;
             return (
               <button
                 key={region}
                 role="tab"
                 aria-selected={isActive}
                 onClick={() => onFilterChange(region)}
                 className={cn(
                   "px-6 py-2.5 rounded-xl text-[10px] font-bold transition-all uppercase tracking-widest outline-none whitespace-nowrap transform-gpu",
                   isActive 
                    ? "bg-foreground text-background shadow-lg scale-[1.05]" 
                    : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                 )}
               >
                 {region}
               </button>
             );
           })}
      </div>

      {/* 3. ACCIÓN OPERATIVA (Node Provisioning) */}
      <button 
        className={cn(
          "flex items-center gap-4 px-10 py-4 rounded-full font-bold text-[10px] uppercase tracking-[0.3em] transition-all active:scale-95 shrink-0 group",
          "bg-foreground text-background hover:bg-primary hover:text-white shadow-3xl"
        )}
        onClick={() => console.log('[HEIMDALL][PRM] Initializing agent authorization flow.')}
      >
         <UserCheck size={18} className="group-hover:rotate-12 transition-transform duration-500" /> 
         {dictionary.agent_management.add_agent}
      </button>
    </nav>
  );
});

PartnerFilters.displayName = 'PartnerFilters';