/**
 * @file apps/portfolio-web/src/components/sections/portal/partners/PartnerNetworkManager.tsx
 * @description Orquestador Soberano del Silo B. Gestiona la inteligencia de red,
 *              agregación de Yield y estado concurrente de la UI Oxygen.
 *              Refactorizado: Erradicación de redundancias y sello de exportación.
 * @version 11.2 - Orchestrator Restored & Logic Sealed
 * @author Staff Engineer - MetaShark Tech
 */

'use client';

import React, { useState, useMemo, useCallback, useDeferredValue, useTransition, useEffect } from 'react';
import { cn } from '../../../../lib/utils/cn';
import { useUIStore } from '../../../../lib/store/ui.store';
import type { AgencyEntity } from '../types';
import type { Dictionary } from '../../../../lib/schemas/dictionary.schema';

/** APARATOS ATOMIZADOS (Silo B Components) */
import { PartnerMetricsStrip } from './PartnerMetricsStrip';
import { PartnerFilters } from './PartnerFilters';
import { PartnerList } from './PartnerList';
import { PartnerFooter } from './PartnerFooter';

const C = { 
  reset: '\x1b[0m', 
  magenta: '\x1b[35m', 
  cyan: '\x1b[36m', 
  yellow: '\x1b[33m',
  bold: '\x1b[1m'
};

/**
 * APARATO: PartnerNetworkManager
 * @description Centro de mando para la red de alianzas B2B.
 */
export function PartnerNetworkManager({ agencies = [], dictionary, className }: { 
  agencies: AgencyEntity[]; 
  dictionary: Dictionary['partner_network']; 
  className?: string;
}) {
  const { session } = useUIStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'BR' | 'CL' | 'US' | 'INTL'>('ALL');
  const [isPending, startTransition] = useTransition();
  const deferredQuery = useDeferredValue(searchQuery);

  /**
   * MOTOR DE ANÁLISIS SOBERANO (Pilar X)
   * @description Agregación O(n) para KPIs financieros y de confianza.
   */
  const analysis = useMemo(() => {
    const query = deferredQuery.toLowerCase().trim();
    const result = agencies.reduce((acc, node) => {
      const matchesSearch = node.brandName.toLowerCase().includes(query) || node.taxId.includes(query);
      const matchesFilter = activeFilter === 'ALL' || node.jurisdiction === activeFilter;
      
      if (matchesSearch && matchesFilter) {
        acc.nodes.push(node);
        acc.totalYield += node.totalYield;
        if (node.trustScore >= 90) acc.eliteCount += 1;
      }
      return acc;
    }, { nodes: [] as AgencyEntity[], totalYield: 0, eliteCount: 0 });

    return {
      ...result,
      avgYield: result.nodes.length > 0 ? Math.round(result.totalYield / result.nodes.length) : 0
    };
  }, [agencies, deferredQuery, activeFilter]);

  /** PROTOCOLO HEIMDALL: Telemetría de Sincronía */
  useEffect(() => {
    const traceId = `prm_sync_${Date.now().toString(36).toUpperCase()}`;
    if (process.env.NODE_ENV !== 'production') {
      console.log(`${C.magenta}${C.bold}[DNA][PRM]${C.reset} Analysis Synchronized | Nodes: ${analysis.nodes.length} | Trace: ${traceId}`);
    }
  }, [analysis.nodes.length]);

  const handleFilterChange = useCallback((region: 'ALL' | 'BR' | 'CL' | 'US' | 'INTL') => {
    startTransition(() => setActiveFilter(region));
  }, []);

  if (!dictionary) return null;

  return (
    <div className={cn("space-y-12 animate-in fade-in duration-1000", className)}>
      {/* 1. Capa de Analíticas */}
      <PartnerMetricsStrip 
        totalYield={analysis.totalYield}
        avgYield={analysis.avgYield}
        count={analysis.nodes.length}
        isPending={isPending}
        labels={dictionary.metrics}
      />

      {/* 2. Capa de Control */}
      <PartnerFilters 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        activeFilter={activeFilter}
        onFilterChange={handleFilterChange}
        dictionary={dictionary}
      />

      {/* 3. Capa de Visualización */}
      <PartnerList 
        nodes={analysis.nodes}
        isPending={isPending}
      />

      {/* 4. Capa de Telemetría Footer */}
      <PartnerFooter 
        tenantId={session?.tenantId}
        activeFilter={activeFilter}
      />
    </div>
  );
}