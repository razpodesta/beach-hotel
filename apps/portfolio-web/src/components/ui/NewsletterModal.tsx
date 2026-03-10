// RUTA: apps/portfolio-web/src/components/ui/NewsletterModal.tsx
// VERSIÓN: 5.1 - Fix: Importación corregida a @/components/shared

'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { getCookie, setCookie } from 'cookies-next';
import { cn } from '../../lib/utils/cn';
// CORRECCIÓN: Uso del alias @/ para evitar problemas de profundidad relativa
import { NewsletterForm } from '@/components/shared/NewsletterForm';

const COOKIE_NAME = 'newsletter_modal_seen';

export function NewsletterModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const hasSeen = getCookie(COOKIE_NAME);
    if (!hasSeen) {
      const timer = setTimeout(() => setIsOpen(true), 5000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setCookie(COOKIE_NAME, 'true', { maxAge: 60 * 60 * 24 * 365, path: '/' });
    setIsOpen(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="relative w-full max-w-md overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={handleClose}
              className="absolute right-3 top-3 z-10 rounded-full p-1.5 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white"
            >
              <X size={20} />
            </button>
            <NewsletterForm />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}