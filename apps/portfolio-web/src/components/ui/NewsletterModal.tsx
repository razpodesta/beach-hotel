/**
 * @file NewsletterModal.tsx
 * @description Orquestador de captación de leads controlado por estado global.
 *              Implementa lógica de persistencia vía cookies y disparador temporizado.
 * @version 7.0 - Zustand Controlled & MEA/UX Optimized
 * @author Raz Podestá - MetaShark Tech
 */

'use client';

import React, { useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { getCookie, setCookie } from 'cookies-next';

import { NewsletterForm } from '../shared/NewsletterForm';
import { useUIStore } from '../../lib/store/ui.store';
import type { Dictionary } from '../../lib/schemas/dictionary.schema';

const COOKIE_NAME = 'newsletter_modal_seen';
const DISPLAY_DELAY_MS = 5000;

interface NewsletterModalProps {
  /** Fragmento del diccionario nivelado */
  dictionary: Dictionary['footer'];
}

export function NewsletterModal({ dictionary }: NewsletterModalProps) {
  // Selección quirúrgica de estado global (Pilar X)
  const isOpen = useUIStore((s) => s.isNewsletterModalOpen);
  const hasHydrated = useUIStore((s) => s.hasHydrated);
  const openModal = useUIStore((s) => s.openNewsletterModal);
  const closeModal = useUIStore((s) => s.closeNewsletterModal);

  /**
   * PROTOCOLO DE DISPARO (Heimdall HUD Integration)
   * @description Evalúa la elegibilidad del visitante tras el montaje.
   */
  useEffect(() => {
    if (!hasHydrated) return;

    const hasSeen = getCookie(COOKIE_NAME);
    let timer: ReturnType<typeof setTimeout> | null = null;

    if (!hasSeen) {
      timer = setTimeout(() => {
        console.log('[HEIMDALL][CONVERSION] Eligible visitor detected. Triggering Invitation.');
        openModal();
      }, DISPLAY_DELAY_MS);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [hasHydrated, openModal]);

  /**
   * ACCIÓN SOBERANA: handleDismiss
   * @description Cierra el portal y marca la sesión para evitar fatiga de usuario.
   */
  const handleDismiss = useCallback(() => {
    setCookie(COOKIE_NAME, 'true', { 
      maxAge: 60 * 60 * 24 * 30, // 30 días de "silencio"
      path: '/',
      sameSite: 'lax'
    });
    closeModal();
  }, [closeModal]);

  // Guardián de Hidratación (Pilar VIII)
  if (!hasHydrated || !dictionary) return null;

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
          onClick={handleDismiss}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 40 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 40 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="relative w-full max-w-md overflow-hidden rounded-[2.5rem] border border-white/10 bg-zinc-950 shadow-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Control de Cierre Boutique */}
            <button
              onClick={handleDismiss}
              className="absolute right-6 top-6 z-20 rounded-full bg-white/5 p-2 text-zinc-400 transition-all hover:bg-white hover:text-black active:scale-90 outline-none focus-visible:ring-2 focus-visible:ring-primary"
              aria-label="Cerrar invitación"
            >
              <X size={20} />
            </button>

            <div className="relative z-10">
               <NewsletterForm content={dictionary} />
            </div>

            {/* Artefacto Atmosférico (Pilar XII) */}
            <div className="absolute -bottom-12 -right-12 h-64 w-64 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}