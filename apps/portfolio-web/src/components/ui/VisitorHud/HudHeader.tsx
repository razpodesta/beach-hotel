/**
 * @file HudHeader.tsx
 * @description Cabecera de navegación del HUD.
 * @version 2.0 - Strict Prop Validation
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '../../../lib/utils/cn';

export type HudTab = 'identity' | 'telemetry';

interface HudHeaderProps {
  activeTab: HudTab;
  setActiveTab: (tab: HudTab) => void;
  onClose: () => void;
  /** Etiquetas localizadas */
  labels: { identity: string; telemetry: string };
}

export function HudHeader({ activeTab, setActiveTab, onClose, labels }: HudHeaderProps) {
  const tabs: HudTab[] = ['identity', 'telemetry'];

  return (
    <div className="flex items-center justify-between px-6 py-5 bg-white/5 border-b border-white/5">
      <div className="flex gap-4">
        {tabs.map((tab) => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "text-[10px] font-bold uppercase tracking-[0.2em] transition-all relative py-1 outline-none",
              activeTab === tab ? "text-primary" : "text-zinc-500 hover:text-zinc-300"
            )}
          >
            {labels[tab]}
            {activeTab === tab && (
              <motion.div layoutId="hud-tab-indicator" className="absolute bottom-0 left-0 right-0 h-px bg-primary" />
            )}
          </button>
        ))}
      </div>
      <button 
        onClick={onClose} 
        className="p-1.5 rounded-full hover:bg-white/10 text-zinc-600 transition-colors active:scale-90"
        aria-label="Fechar HUD"
      >
        <X size={16} />
      </button>
    </div>
  );
}