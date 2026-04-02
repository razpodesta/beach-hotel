'use client';

import React, { memo } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Briefcase, MoreVertical } from 'lucide-react';
import { cn } from '../../../../lib/utils/cn';
import type { AgencyEntity, StatusConfig } from '../types';

export const AgencyRow = memo(({ agency, status }: { agency: AgencyEntity; status: StatusConfig }) => {
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
          <h4 className="font-display text-lg font-bold text-foreground leading-tight tracking-tight">{agency.brandName}</h4>
          <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">{agency.taxId} • {agency.iataCode || 'NO-IATA'}</p>
        </div>
      </div>

      <div className="flex items-center gap-12 mt-6 md:mt-0 px-8">
          <div className="text-center space-y-1">
            <span className="block text-[8px] font-bold text-muted-foreground uppercase tracking-widest">Credibilidade</span>
            <div className="flex items-center gap-2">
                <div className="w-16 h-1.5 bg-foreground/5 rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${agency.trustScore}%` }} className={cn("h-full", agency.trustScore > 70 ? 'bg-success' : 'bg-primary')} />
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

      <button className="p-3 ml-6 rounded-xl bg-background border border-border hover:text-primary transition-all active:scale-90">
        <MoreVertical size={18} />
      </button>
    </motion.article>
  );
});

AgencyRow.displayName = 'AgencyRow';