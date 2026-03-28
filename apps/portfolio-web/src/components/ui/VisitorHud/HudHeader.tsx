/**
 * @file HudHeader.tsx
 * @description Cabecera de navegación del HUD de Telemetría.
 *              Refactorizado: Sincronización con data-theme, erradicación de 
 *              hardcoding i18n y optimización de contraste semántico.
 * @version 3.0 - Atmosphere Aware & i18n Compliant
 * @author Raz Podestá - MetaShark Tech
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

/**
 * IMPORTACIONES DE INFRAESTRUCTRURA
 */
import { cn } from '../../../lib/utils/cn';

export type HudTab = 'identity' | 'telemetry';

/**
 * @interface HudHeaderProps
 * @description Contrato de propiedades para la navegación del HUD.
 */
interface HudHeaderProps {
  activeTab: HudTab;
  setActiveTab: (tab: HudTab) => void;
  onClose: () => void;
  /** Etiquetas localizadas y accesibilidad */
  labels: { 
    identity: string; 
    telemetry: string;
    close_action: string; // @fix: Inyectado para eliminar hardcoding
  };
}

/**
 * APARATO: HudHeader
 * @description Orquesta la navegación entre los módulos de identidad y datos ambientales.
 */
export function HudHeader({ activeTab, setActiveTab, onClose, labels }: HudHeaderProps) {
  const tabs: HudTab[] = ['identity', 'telemetry'];

  return (
    <div className="flex items-center justify-between px-6 py-5 bg-foreground/5 border-b border-border/50">
      <nav className="flex gap-4" role="tablist">
        {tabs.map((tab) => {
          const isActive = activeTab === tab;
          return (
            <button 
              key={tab}
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "text-[10px] font-bold uppercase tracking-[0.2em] transition-all relative py-1 outline-none",
                "focus-visible:ring-1 focus-visible:ring-primary rounded-sm",
                isActive 
                  ? "text-primary" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {labels[tab]}
              
              {isActive && (
                <motion.div 
                  layoutId="hud-tab-indicator" 
                  className="absolute bottom-0 left-0 right-0 h-px bg-primary shadow-[0_0_8px_var(--color-primary)]" 
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </nav>

      {/* Botón de Cierre Boutique */}
      <button 
        onClick={onClose} 
        className={cn(
          "p-2 rounded-full transition-all active:scale-90 outline-none",
          "text-muted-foreground hover:bg-foreground/10 hover:text-foreground",
          "focus-visible:ring-2 focus-visible:ring-primary"
        )}
        aria-label={labels.close_action}
        title={labels.close_action}
      >
        <X size={16} strokeWidth={2.5} />
      </button>
    </div>
  );
}