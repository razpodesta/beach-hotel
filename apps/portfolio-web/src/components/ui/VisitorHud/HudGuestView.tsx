/**
 * @file HudGuestView.tsx
 * @description Vista de conversión para visitantes anónimos.
 * @version 2.0 - Zero Any Compliance
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ScanFace, LogIn } from 'lucide-react';
import type { VisitorHudDictionary } from '../../../lib/schemas/visitor_hud.schema';

interface HudGuestViewProps {
  /** Fragmento del diccionario de telemetría tipado por SSoT */
  t: VisitorHudDictionary;
}

export function HudGuestView({ t }: HudGuestViewProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="py-4 text-center space-y-6"
    >
      <div className="relative mx-auto h-20 w-20 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border border-dashed border-zinc-800 animate-spin-slow" />
          <ScanFace size={40} className="text-zinc-700 animate-pulse" />
      </div>
      
      <div className="space-y-2">
        <h4 className="text-white font-display text-lg font-bold uppercase tracking-tight">
          {t.guest_title}
        </h4>
        <p className="text-zinc-500 text-xs leading-relaxed max-w-[220px] mx-auto italic font-light">
          {t.guest_description}
        </p>
      </div>

      <button className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-white text-black text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-primary hover:text-white transition-all active:scale-95 shadow-2xl">
        <LogIn size={14} /> {t.guest_cta}
      </button>
    </motion.div>
  );
}