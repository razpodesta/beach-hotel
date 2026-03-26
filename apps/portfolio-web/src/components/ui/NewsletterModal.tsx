/**
 * @file apps/portfolio-web/src/components/ui/NewsletterModal.tsx
 * @description Orquestador de captación de leads mediante modal emergente persistente.
 *              Nivelado: Resolución de ciclo de vida en React (TS7030) garantizando
 *              limpieza determinista de timers y prevención de memory leaks.
 * @version 6.4 - Strict Lifecycle Sync
 * @author Raz Podestá - MetaShark Tech
 */

'use client';

import React, { useState, useEffect, useCallback, useSyncExternalStore } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { getCookie, setCookie } from 'cookies-next';

import { NewsletterForm } from '../shared/NewsletterForm';
import type { Dictionary } from '../../lib/schemas/dictionary.schema';

const COOKIE_NAME = 'newsletter_modal_seen';

/**
 * Hook de Hidratación de Élite
 * @description Previene discrepancias de hidratación detectando el montaje seguro.
 */
function useIsMounted(): boolean {
  const subscribe = useCallback(() => {
    return () => {
      /* No-op: Estado terminal */
    };
  },[]);
  return useSyncExternalStore(subscribe, () => true, () => false);
}

interface NewsletterModalProps {
  dictionary: Dictionary['footer'];
}

export function NewsletterModal({ dictionary }: NewsletterModalProps) {
  const isMounted = useIsMounted();
  const[isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isMounted) return;

    let timer: ReturnType<typeof setTimeout> | null = null;
    const hasSeen = getCookie(COOKIE_NAME);
    
    if (!hasSeen) {
      timer = setTimeout(() => setIsOpen(true), 5000);
    }

    // Retorno determinista: Garantiza limpieza independientemente del flujo
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isMounted]);

  const handleClose = () => {
    setCookie(COOKIE_NAME, 'true', { 
      maxAge: 60 * 60 * 24 * 365,
      path: '/',
      sameSite: 'lax'
    });
    setIsOpen(false);
  };

  if (!isMounted || !dictionary) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-100 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md"
          role="dialog"
          aria-modal="true"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 40 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 40 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="relative w-full max-w-md overflow-hidden rounded-4xl border border-white/10 bg-zinc-950 shadow-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={handleClose}
              className="absolute right-4 top-4 z-20 rounded-full bg-white/5 p-2 text-zinc-400 transition-all hover:bg-white hover:text-black active:scale-90"
              aria-label="Cerrar invitación"
            >
              <X size={20} />
            </button>

            <div className="relative z-10">
               {/* Propiedad inyectada correctamente para satisfacer contrato */}
               <NewsletterForm content={dictionary} />
            </div>

            <div className="absolute -bottom-12 -right-12 h-64 w-64 rounded-full bg-purple-500/10 blur-3xl pointer-events-none" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}