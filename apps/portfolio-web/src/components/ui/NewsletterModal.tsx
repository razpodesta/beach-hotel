/**
 * @file NewsletterModal.tsx
 * @description Orquestador de captación de leads controlado por estado global.
 *              Refactorizado: Sincronización con el contrato 'newsletter_form' v1.0,
 *              persistencia inteligente via cookies y optimización de capas visuales.
 * @version 8.0 - Congruent Schema Sync & MEA/UX Optimized
 * @author Raz Podestá - MetaShark Tech
 */

'use client';

import React, { useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { getCookie, setCookie } from 'cookies-next';

/**
 * IMPORTACIONES DE INFRAESTRUCTRURA
 * @pilar V: Adherencia arquitectónica a las fronteras de Nx.
 */
import { NewsletterForm } from '../shared/NewsletterForm';
import { useUIStore } from '../../lib/store/ui.store';
import type { Dictionary } from '../../lib/schemas/dictionary.schema';

/**
 * CONSTANTES DE INFRAESTRUCTRURA
 * @description Definición de parámetros de persistencia y telemetría.
 */
const COOKIE_NAME = 'newsletter_modal_seen';
const DISPLAY_DELAY_MS = 5000;

/**
 * @interface NewsletterModalProps
 * @description Contrato de propiedades nivelado con el esquema de congruencia.
 */
interface NewsletterModalProps {
  /** Fragmento del diccionario 'newsletter_form' validado por Zod */
  dictionary: Dictionary['newsletter_form'];
}

/**
 * APARATO: NewsletterModal
 * @description Gestiona el ciclo de vida de la invitación al ecosistema.
 *              Implementa el Pilar XII (MEA/UX) mediante transiciones físicas.
 */
export function NewsletterModal({ dictionary }: NewsletterModalProps) {
  // Selección quirúrgica de estado global (Pilar X: Performance)
  const isOpen = useUIStore((s) => s.isNewsletterModalOpen);
  const hasHydrated = useUIStore((s) => s.hasHydrated);
  const openModal = useUIStore((s) => s.openNewsletterModal);
  const closeModal = useUIStore((s) => s.closeNewsletterModal);

  /**
   * PROTOCOLO DE DISPARO (Heimdall Ingestion)
   * @description Evalúa la elegibilidad del visitante tras el handshake de hidratación.
   */
  useEffect(() => {
    if (!hasHydrated) return;

    const hasSeen = getCookie(COOKIE_NAME);
    let timer: ReturnType<typeof setTimeout> | null = null;

    if (!hasSeen) {
      timer = setTimeout(() => {
        console.log('[HEIMDALL][CONVERSION] Eligible visitor detected. Dispatched invitation.');
        openModal();
      }, DISPLAY_DELAY_MS);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [hasHydrated, openModal]);

  /**
   * ACCIÓN SOBERANA: handleDismiss
   * @description Cierra el portal y persiste la decisión para evitar fatiga de UX.
   */
  const handleDismiss = useCallback(() => {
    setCookie(COOKIE_NAME, 'true', { 
      maxAge: 60 * 60 * 24 * 30, // Ventana de respeto: 30 días
      path: '/',
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production'
    });
    closeModal();
  }, [closeModal]);

  /**
   * GUARDIÁN DE HIDRATACIÓN (Pilar VIII)
   * @description Evita discrepancias entre el servidor y el cliente (Hydration Mismatch).
   */
  if (!hasHydrated || !dictionary) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 p-4 backdrop-blur-md"
          role="dialog"
          aria-modal="true"
          aria-labelledby="newsletter-title"
          onClick={handleDismiss}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 40 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 40 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="relative w-full max-w-md overflow-hidden rounded-[3.5rem] border border-border bg-surface shadow-3xl transform-gpu"
            onClick={(e) => e.stopPropagation()}
          >
            {/* CONTROL DE CIERRE BOUTIQUE */}
            <button
              onClick={handleDismiss}
              className="absolute right-8 top-8 z-20 rounded-full bg-background/50 p-2.5 text-muted-foreground transition-all hover:bg-surface hover:text-foreground active:scale-90 outline-none focus-visible:ring-2 focus-visible:ring-primary"
              aria-label="Cerrar invitación"
            >
              <X size={20} strokeWidth={2.5} />
            </button>

            <div className="relative z-10">
              {/* 
                  RELEVÓ DE RESPONSABILIDAD:
                  El modal solo gestiona visibilidad y persistencia.
                  La lógica de negocio reside en el aparato especializado.
              */}
               <NewsletterForm content={dictionary} />
            </div>

            {/* ARTEFACTO ATMOSFÉRICO (Pilar XII) */}
            <div className="absolute -bottom-16 -right-16 h-64 w-64 rounded-full bg-primary/10 blur-[100px] pointer-events-none" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}