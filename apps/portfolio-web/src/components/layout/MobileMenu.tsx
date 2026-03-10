// RUTA: apps/portfolio-web/src/components/layout/MobileMenu.tsx

/**
 * @file Menú de Navegación Móvil
 * @version 3.0 - Resilient & Smooth
 * @description Overlay de navegación de pantalla completa con bloqueo de scroll 
 *              de alto rendimiento y soporte para navegación por teclado (FocusTrap).
 * @author Raz Podestá - MetaShark Tech
 */

'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { X } from 'lucide-react';
import FocusTrap from 'focus-trap-react';
import { cn } from '../../lib/utils/cn';
import { useUIStore } from '../../lib/store/ui.store';
import { mainNavStructure } from '../../lib/nav-links';
import { getLocalizedHref } from '../../lib/utils/link-helpers';
import { i18n, type Locale } from '../../config/i18n.config';
import type { Dictionary } from '../../lib/schemas/dictionary.schema';

interface MobileMenuProps {
  dictionary: Dictionary;
}

export function MobileMenu({ dictionary }: MobileMenuProps) {
  const { isMobileMenuOpen, closeMobileMenu } = useUIStore();
  const pathname = usePathname();
  const currentLang = (pathname?.split('/')[1] as Locale) || i18n.defaultLocale;
  
  const navLabels = { ...dictionary.header, ...dictionary['nav-links'].nav_links };

  // Bloqueo de Scroll: Cuando el menú está abierto, deshabilitamos el scroll del body.
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isMobileMenuOpen]);

  return (
    <AnimatePresence>
      {isMobileMenuOpen && (
        <FocusTrap active={isMobileMenuOpen}>
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[100] flex flex-col bg-background p-6 shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-label="Menú de Navegación"
          >
            {/* Header: Optimizado para pulgar */}
            <div className="flex items-center justify-between mb-12">
              <span className="font-display text-2xl font-bold">Menu</span>
              <button 
                onClick={closeMobileMenu} 
                className="p-3 rounded-full bg-secondary hover:bg-muted transition-all active:scale-95"
                aria-label="Cerrar menú"
              >
                <X size={24} />
              </button>
            </div>

            {/* Navegación: Espaciado generoso para dedos */}
            <nav className="flex flex-col gap-6 font-display text-3xl font-bold overflow-y-auto">
              {mainNavStructure.map((nav) => (
                <Link
                  key={nav.labelKey}
                  href={getLocalizedHref(nav.href ?? '/', currentLang)}
                  onClick={closeMobileMenu}
                  className={cn(
                    "flex items-center gap-4 group transition-colors",
                    "hover:text-primary"
                  )}
                >
                  <div className="flex items-center justify-center h-14 w-14 rounded-full bg-secondary group-hover:bg-primary/10 transition-colors">
                    {nav.Icon && <nav.Icon size={24} className="text-primary" />}
                  </div>
                  {navLabels[nav.labelKey as keyof typeof navLabels] || nav.labelKey}
                </Link>
              ))}
            </nav>

            {/* Footer */}
            <div className="mt-auto pt-10 border-t border-border flex items-center justify-between text-muted-foreground">
              <p className="text-[10px] font-mono uppercase tracking-[0.2em]">Canasvieiras Fest 2026</p>
            </div>
          </motion.div>
        </FocusTrap>
      )}
    </AnimatePresence>
  );
}