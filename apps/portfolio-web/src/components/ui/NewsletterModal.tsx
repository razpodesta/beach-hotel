/**
 * @file apps/portfolio-web/src/components/ui/NewsletterModal.tsx
 * @description Orquestador de captación de leads mediante modal emergente persistente.
 *              Implementa control de cookies para evitar la saturación del usuario (UX),
 *              animaciones físicas y cumplimiento estricto de fronteras de Nx.
 * @version 6.0
 * @author Raz Podestá - MetaShark Tech
 */

'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { getCookie, setCookie } from 'cookies-next';

/**
 * IMPORTACIONES NIVELADAS (Cumplimiento @nx/enforce-module-boundaries)
 */
import { NewsletterForm } from '../shared/NewsletterForm';

const COOKIE_NAME = 'newsletter_modal_seen';

/**
 * Aparato de UI: NewsletterModal
 * Gestiona el ciclo de vida de la invitación al ecosistema digital.
 */
export function NewsletterModal() {
  const [isOpen, setIsOpen] = useState(false);

  /**
   * Lógica de activación: Verifica la existencia de la cookie de sesión 
   * para disparar el modal tras un delay de cortesía (5s).
   */
  useEffect(() => {
    const hasSeen = getCookie(COOKIE_NAME);
    if (!hasSeen) {
      const timer = setTimeout(() => setIsOpen(true), 5000);
      return () => clearTimeout(timer);
    }
  }, []);

  /**
   * Cierre y Persistencia: Marca al usuario para no volver a mostrar el modal
   * por un periodo de 1 año (UX de Élite).
   */
  const handleClose = () => {
    setCookie(COOKIE_NAME, 'true', { 
      maxAge: 60 * 60 * 24 * 365, // 1 Año
      path: '/',
      sameSite: 'lax'
    });
    setIsOpen(false);
  };

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
            {/* Botón de Cierre Boutique */}
            <button
              onClick={handleClose}
              className="absolute right-4 top-4 z-20 rounded-full bg-white/5 p-2 text-zinc-400 transition-all hover:bg-white hover:text-black active:scale-90"
              aria-label="Cerrar invitación"
            >
              <X size={20} />
            </button>

            {/* Inyección del Formulario Atómico */}
            <div className="relative z-10">
               <NewsletterForm />
            </div>

            {/* Efecto decorativo de fondo */}
            <div className="absolute -bottom-12 -right-12 h-64 w-64 rounded-full bg-purple-500/10 blur-3xl pointer-events-none" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}