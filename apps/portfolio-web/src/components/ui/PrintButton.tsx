/**
 * @file apps/portfolio-web/src/components/ui/PrintButton.tsx
 * @description Aparato de acción soberano para la impresión de documentos y CV.
 *              Implementa hidratación atómica, micro-interacciones de lujo y 
 *              cumplimiento estricto de linter y WCAG 2.2.
 * @version 3.1 - Linter Hardening Edition
 * @author Raz Podestá - MetaShark Tech
 */

'use client';

import React, { useSyncExternalStore } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Printer } from 'lucide-react';
import { cn } from '../../lib/utils/cn';

/**
 * Propiedades del botón de impresión.
 * @pilar III: Props explícitas y documentadas.
 */
export interface PrintButtonProps {
  /** Texto localizado proveniente del diccionario i18n */
  text: string;
  /** Clases adicionales para posicionamiento o ajustes de estilo */
  className?: string;
}

/**
 * Hook interno para detectar el montaje en el cliente sin disparar cascading renders.
 * @pilar X: Rendimiento de Élite.
 * @description Utiliza useSyncExternalStore para una detección de entorno libre de parpadeos.
 */
function useIsMounted(): boolean {
  /**
   * FUNCIÓN DE SUSCRIPCIÓN (No-Op)
   * @pilar X: Se documenta explícitamente para el linter. 
   * No se requiere suscripción para una constante de entorno.
   */
  const subscribe = () => {
    const noopUnsubscribe = () => {
      /* Intencionalmente vacío: Estado estático */
    };
    return noopUnsubscribe;
  };

  return useSyncExternalStore(
    subscribe,
    () => true,  // Valor en Cliente
    () => false // Valor en Servidor (SSR)
  );
}

/**
 * Aparato Visual: PrintButton
 * @returns {JSX.Element | null} Botón animado y resiliente.
 */
export function PrintButton({ text, className }: PrintButtonProps) {
  const isMounted = useIsMounted();

  /**
   * MANEJADOR DE IMPRESIÓN SOBERANO
   * Ejecuta la API nativa de impresión con resiliencia ante entornos no-window.
   */
  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  return (
    <AnimatePresence>
      {isMounted && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handlePrint}
          className={cn(
            /* 
               Directriz de ocultamiento: 'print:hidden' garantiza que el 
               propio botón no aparezca en el documento impreso.
            */
            'print:hidden fixed bottom-8 right-8 z-50 flex items-center gap-3',
            'rounded-full bg-primary px-8 py-4 text-xs font-bold uppercase tracking-[0.2em]',
            'text-primary-foreground shadow-[0_20px_50px_rgba(0,0,0,0.3)] backdrop-blur-md',
            'border border-white/10 transition-colors hover:bg-primary/90',
            'focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-background',
            className
          )}
          aria-label={text}
          type="button"
        >
          <Printer size={18} strokeWidth={2} />
          <span className="font-sans">{text}</span>
        </motion.button>
      )}
    </AnimatePresence>
  );
}