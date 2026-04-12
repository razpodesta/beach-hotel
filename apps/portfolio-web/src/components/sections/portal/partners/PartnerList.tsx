/**
 * @file apps/portfolio-web/src/components/sections/portal/partners/PartnerList.tsx
 * @description Viewport de renderizado para los nodos de agencia.
 *              Refactorizado: Restauración de lógica de prestigio y AnimatePresence.
 * @version 2.1 - Content Restored & Prestige Engine
 * @author Staff Engineer - MetaShark Tech
 */

'use client';

import React, { memo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Star, ShieldCheck, Activity, XCircle, ShieldAlert } from 'lucide-react';
import { cn } from '../../../../lib/utils/cn';
import { AgencyRow } from '../media/AgencyRow';
import type { AgencyEntity, StatusConfig } from '../types';

interface PartnerListProps {
  nodes: AgencyEntity[];
  isPending: boolean;
}

export const PartnerList = memo(({ nodes, isPending }: PartnerListProps) => {
  
  /**
   * RESOLVER DE ESTADO
   * @pilar III: Mapeo de identidad visual verificado.
   */
  const getStatusConfig = useCallback((status: string): StatusConfig => {
    const map: Record<string, StatusConfig> = {
      active: { icon: ShieldCheck, color: 'text-success', bg: 'bg-success/10', label: 'Verified' },
      review: { icon: Activity, color: 'text-yellow-500', bg: 'bg-yellow-500/10', label: 'Auditing' },
      blocked: { icon: XCircle, color: 'text-red-500', bg: 'bg-red-500/10', label: 'Blocked' }
    };
    return map[status] || { icon: ShieldAlert, color: 'text-muted-foreground', bg: 'bg-surface', label: 'Unknown' };
  }, []);

  return (
    <div className={cn(
      "grid grid-cols-1 gap-6 min-h-[450px] transform-gpu transition-all duration-700", 
      isPending ? "opacity-40 blur-sm" : "opacity-100"
    )}>
      <AnimatePresence mode="popLayout">
        {nodes.length > 0 ? (
          nodes.map((agency) => {
            const isElite = agency.trustScore >= 90;
            return (
              <motion.div 
                key={agency.id} 
                layout 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative group"
              >
                 {isElite && (
                   <div className="absolute -top-3 -right-3 z-20">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-yellow-500 shadow-[0_0_20px_oklch(70%_0.15_80)] border-2 border-surface animate-in zoom-in duration-500">
                         <Star size={14} className="text-black fill-current" />
                      </div>
                   </div>
                 )}
                 <div className={cn(
                   "transition-all duration-700 rounded-4xl p-0.5",
                   isElite ? "bg-linear-to-br from-yellow-500/20 via-transparent to-primary/20" : "bg-transparent"
                 )}>
                    <AgencyRow 
                      agency={agency} 
                      status={getStatusConfig(agency.status)} 
                    />
                 </div>
              </motion.div>
            );
          })
        ) : (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="py-48 text-center space-y-8 rounded-[4rem] border-2 border-dashed border-border bg-surface/10 flex flex-col items-center justify-center"
          >
            <Globe size={64} className="mx-auto text-muted-foreground/10 animate-pulse" />
            <p className="font-mono text-[9px] uppercase tracking-[0.6em] text-muted-foreground">
               HANDSHAKE_NO_NODES_FOUND
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

PartnerList.displayName = 'PartnerList';