/**
 * @file TemplateLibrary.tsx
 * @description Catálogo de presets industriales.
 * @version 1.0 - Stateless Asset Display
 */

import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { Layout } from 'lucide-react';

export const TemplateLibrary = memo(() => {
  const templates = [
    { id: '1', name: 'Elite Fidelity', type: 'industrial' },
    { id: '2', name: 'Sanctuary Night', type: 'lifestyle' }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {templates.map((tmpl) => (
        <motion.div key={tmpl.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="group p-8 rounded-[2.5rem] border border-border bg-surface/40 hover:border-primary/40 transition-all duration-700 cursor-pointer">
          <div className="mb-8 h-12 w-12 rounded-xl border border-border bg-background flex items-center justify-center group-hover:text-primary transition-colors">
            <Layout size={20} />
          </div>
          <h5 className="font-display text-lg font-bold text-foreground uppercase">{tmpl.name}</h5>
          <span className="text-[8px] font-mono font-bold uppercase tracking-widest text-primary/60">{tmpl.type} Protocol</span>
        </motion.div>
      ))}
    </div>
  );
});

TemplateLibrary.displayName = 'TemplateLibrary';