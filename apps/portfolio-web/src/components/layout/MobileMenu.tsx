/**
 * @file MobileMenu.tsx
 * @description Centro de navegación móvil inmersivo. 
 *              Implementa orquestación de rutas anidadas, bloqueo de scroll resiliente
 *              y cumplimiento estricto de accesibilidad (FocusTrap).
 * @version 4.0 - Nested Navigation & i18n Hardening
 * @author Raz Podestá - MetaShark Tech
 */

'use client';

import React, { useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { X, ChevronRight, CalendarCheck } from 'lucide-react';
import FocusTrap from 'focus-trap-react';

/**
 * IMPORTACIONES DE INFRAESTRUCTRURA
 */
import { cn } from '../../lib/utils/cn';
import { useUIStore } from '../../lib/store/ui.store';
import { mainNavStructure, type NavItem, type NavLink } from '../../lib/nav-links';
import { getLocalizedHref } from '../../lib/utils/link-helpers';
import { i18n, type Locale } from '../../config/i18n.config';
import { LanguageSwitcher } from '../ui/LanguageSwitcher';
import { ThemeToggle } from '../ui/ThemeToggle';
import type { Dictionary } from '../../lib/schemas/dictionary.schema';

interface MobileMenuProps {
  /** Diccionario soberano inyectado desde el Layout */
  dictionary: Dictionary;
}

/**
 * APARATO: MobileMenu
 * @returns {JSX.Element} Menú de pantalla completa optimizado para ergonomía táctil.
 */
export function MobileMenu({ dictionary }: MobileMenuProps) {
  const { isMobileMenuOpen, closeMobileMenu } = useUIStore();
  const pathname = usePathname();
  
  const currentLang = useMemo(() => 
    (pathname?.split('/')[1] as Locale) || i18n.defaultLocale, 
  [pathname]);

  const labels = useMemo(() => ({ 
    ...dictionary.header, 
    ...dictionary['nav-links'].nav_links 
  }), [dictionary]);

  /**
   * PROTOCOLO HEIMDALL: Observabilidad
   * @pilar IV: Rastreo de estado de navegación móvil.
   */
  useEffect(() => {
    if (isMobileMenuOpen) {
      console.log('[HEIMDALL][UX] Mobile Menu Opened');
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
            className="fixed inset-0 z-100 flex flex-col bg-background p-6 shadow-3xl"
            role="dialog"
            aria-modal="true"
          >
            {/* 1. HEADER: Identidad y Cierre */}
            <div className="flex items-center justify-between mb-10">
              <div className="flex flex-col">
                <span className="font-display text-2xl font-bold text-foreground">
                   {/* @pilar VI: Título localizado desde el esquema */}
                   {labels.mobile_title}
                </span>
                <span className="text-[10px] font-mono tracking-[0.3em] uppercase text-primary">
                   {labels.mobile_subtitle}
                </span>
              </div>
              <button 
                onClick={closeMobileMenu} 
                className="p-3 rounded-full bg-muted/50 hover:bg-muted transition-all active:scale-90"
                aria-label="Cerrar"
              >
                <X size={24} />
              </button>
            </div>

            {/* 2. NAVEGACIÓN: Orquestación de Rutas (Pilar II) */}
            <nav className="flex flex-col gap-2 overflow-y-auto grow custom-scrollbar pr-2">
              {mainNavStructure.map((nav: NavItem) => {
                const hasChildren = nav.children && nav.children.length > 0;
                const localizedHref = getLocalizedHref(nav.href ?? '/', currentLang);

                return (
                  <div key={nav.labelKey} className="flex flex-col">
                    {/* Link Principal o Padre */}
                    <Link
                      href={localizedHref}
                      onClick={closeMobileMenu}
                      className={cn(
                        "flex items-center justify-between py-4 px-4 rounded-2xl transition-all active:bg-primary/5",
                        pathname === localizedHref ? "bg-primary/10 text-primary" : "text-foreground"
                      )}
                    >
                      <div className="flex items-center gap-5">
                        <div className={cn(
                          "flex items-center justify-center h-12 w-12 rounded-xl bg-muted/50",
                          pathname === localizedHref && "bg-primary/20"
                        )}>
                          {nav.Icon && <nav.Icon size={22} />}
                        </div>
                        <span className="font-display text-2xl font-bold tracking-tight">
                          {labels[nav.labelKey as keyof typeof labels] || nav.labelKey}
                        </span>
                      </div>
                      {hasChildren && <ChevronRight size={18} className="opacity-30" />}
                    </Link>

                    {/* Sub-enlaces (Nivelación de Regresiones) */}
                    {hasChildren && (
                      <div className="ml-16 flex flex-col gap-1 border-l border-border pl-6 mb-4 mt-1">
                        {nav.children?.map((child: NavLink) => {
                          const childHref = getLocalizedHref(child.href, currentLang);
                          return (
                            <Link
                              key={child.labelKey}
                              href={childHref}
                              onClick={closeMobileMenu}
                              className={cn(
                                "py-3 text-lg font-sans transition-colors",
                                pathname === childHref ? "text-primary font-bold" : "text-muted-foreground"
                              )}
                            >
                              {labels[child.labelKey as keyof typeof labels] || child.labelKey}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
              
              {/* ACCIÓN DE RESERVA (Pilar XII - Conversion) */}
              <Link
                href={getLocalizedHref('/#reservas', currentLang)}
                onClick={closeMobileMenu}
                className="mt-6 flex items-center justify-center gap-4 py-5 rounded-4xl bg-foreground text-background font-bold uppercase tracking-[0.2em] text-xs shadow-xl active:scale-95 transition-transform"
              >
                <CalendarCheck size={18} />
                {labels.talk}
              </Link>
            </nav>

            {/* 3. FOOTER: Herramientas y Marca */}
            <div className="mt-auto pt-8 border-t border-border space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <LanguageSwitcher dictionary={dictionary.language_switcher} />
                  <ThemeToggle />
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                    Status: Online
                  </p>
                  <p className="text-[9px] font-mono text-zinc-800">
                    {dictionary.footer.made_by.split('|')[0]}
                  </p>
                </div>
              </div>
              
              <div className="bg-primary/5 rounded-2xl p-4 text-center">
                <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-primary/60">
                   {dictionary.header.tagline}
                </p>
              </div>
            </div>
          </motion.div>
        </FocusTrap>
      )}
    </AnimatePresence>
  );
}