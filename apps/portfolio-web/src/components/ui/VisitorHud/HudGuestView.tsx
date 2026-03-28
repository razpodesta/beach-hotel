/**
 * @file HudGuestView.tsx
 * @description Vista de conversión para visitantes anónimos del HUD.
 *              Refactorizado: Sincronización con el Manifiesto Day-First, 
 *              uso de tokens semánticos y optimización de contraste.
 * @version 3.0 - Atmosphere Aware & MEA/UX Ready
 * @author Raz Podestá - MetaShark Tech
 */

'use client';

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { ScanFace, LogIn } from 'lucide-react';

/**
 * IMPORTACIONES DE INFRAESTRUCTRURA
 * @pilar V: Adherencia arquitectónica.
 */
import { cn } from '../../../lib/utils/cn';
import type { VisitorHudDictionary } from '../../../lib/schemas/visitor_hud.schema';

/**
 * @interface HudGuestViewProps
 * @property {VisitorHudDictionary} t - Diccionario de telemetría validado por SSoT.
 */
interface HudGuestViewProps {
  t: VisitorHudDictionary;
}

/**
 * APARATO: HudGuestView
 * @description Interfaz de invitación para vincular la identidad al Protocolo 33.
 */
export function HudGuestView({ t }: HudGuestViewProps) {
  
  /**
   * PROTOCOLO HEIMDALL: Telemetría de Conversión
   * @pilar IV: Registra la impresión del estado invitado.
   */
  useEffect(() => {
    console.log('[HEIMDALL][UX] Conversion View: Guest Identity active.');
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="py-4 text-center space-y-8 transform-gpu"
    >
      {/* 1. ARTE VISUAL: Identidad Latente */}
      <div className="relative mx-auto h-24 w-24 flex items-center justify-center">
          {/* Círculo de Progresión (Dashed) - Color adaptativo */}
          <div className="absolute inset-0 rounded-full border-2 border-dashed border-border animate-spin-slow opacity-40" />
          
          <div className="relative">
            <div className="absolute -inset-4 bg-primary/10 blur-2xl rounded-full animate-pulse" />
            <ScanFace size={48} className="text-muted-foreground relative" strokeWidth={1.2} />
          </div>
      </div>
      
      {/* 2. NARRATIVA DE CONVERSIÓN */}
      <div className="space-y-3 px-2">
        <h4 className="text-foreground font-display text-xl font-bold uppercase tracking-tight leading-none">
          {t.guest_title}
        </h4>
        <p className="text-muted-foreground text-xs leading-relaxed max-w-[220px] mx-auto italic font-light">
          {t.guest_description}
        </p>
      </div>

      {/* 3. ACCIÓN SOBERANA: Vincular Identidad 
          @pilar VII: El botón invierte sus colores basados en el tema (Sovereign Flip).
      */}
      <button 
        className={cn(
          "w-full flex items-center justify-center gap-4 py-5 rounded-3xl transition-all duration-500",
          "bg-foreground text-background font-bold text-[10px] uppercase tracking-[0.3em]",
          "hover:bg-primary hover:text-white hover:shadow-primary/20 hover:shadow-4xl active:scale-[0.98] shadow-2xl",
          "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
        )}
        aria-label={t.guest_cta}
      >
        <LogIn size={16} /> 
        {t.guest_cta}
      </button>

      {/* Decoración de fondo sutil */}
      <div className="pt-2">
         <div className="h-px w-12 bg-linear-to-r from-transparent via-border to-transparent mx-auto" />
      </div>
    </motion.div>
  );
}