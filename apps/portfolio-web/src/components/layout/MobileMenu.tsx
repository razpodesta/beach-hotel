/**
 * @file MobileMenu.tsx
 * @description Centro de Navegación Móvil de Élite (The Takeover).
 *              Implementa ergonomía táctil, coreografía de animaciones secuenciales
 *              y blindaje de hidratación atómica.
 * @version 5.0 - Thumb-Driven UX & Staggered Coreography
 * @author Raz Podestá - MetaShark Tech
 */

'use client';

import React, { useEffect, useMemo, useCallback, useSyncExternalStore } from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { X, ChevronRight, CalendarCheck, Sparkles } from 'lucide-react';
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

/**
 * VARIANTES DE ANIMACIÓN (Coreografía MEA/UX)
 */
const overlayVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const panelVariants: Variants = {
  hidden: { x: '100%', transition: { type: 'spring', damping: 30, stiffness: 300 } },
  visible: { 
    x: 0, 
    transition: { 
      type: 'spring', 
      damping: 25, 
      stiffness: 200,
      staggerChildren: 0.08,
      delayChildren: 0.2
    } 
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, x: 20 },
  visible: { opacity: 1, x: 0 },
};

/**
 * Hook de Hidratación de Élite
 */
function useIsMounted(): boolean {
  const subscribe = useCallback(() => () => {
    /* No-op: Estado estático en cliente */
  }, []);
  return useSyncExternalStore(subscribe, () => true, () => false);
}

/**
 * APARATO: MobileMenu
 */
export function MobileMenu({ dictionary }: { dictionary: Dictionary }) {
  const isMounted = useIsMounted();
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
   * PROTOCOLO HEIMDALL: Control de Scroll Perimetral
   */
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
      console.log('[HEIMDALL][UX] Mobile Interface Locked: Focus on Navigation');
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isMobileMenuOpen]);

  if (!isMounted) return null;

  return (
    <AnimatePresence>
      {isMobileMenuOpen && (
        <FocusTrap active={isMobileMenuOpen}>
          <div className="fixed inset-0 z-100 overflow-hidden">
            {/* 1. OVERLAY DE FONDO (Glassmorphism) */}
            <motion.div
              variants={overlayVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              onClick={closeMobileMenu}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />

            {/* 2. PANEL DE NAVEGACIÓN */}
            <motion.div
              variants={panelVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="absolute inset-y-0 right-0 w-full max-w-sm bg-background shadow-3xl flex flex-col"
              role="dialog"
              aria-modal="true"
            >
              {/* HEADER: Branding & Cierre */}
              <div className="flex items-center justify-between p-8 border-b border-white/5">
                <div className="flex flex-col">
                  <span className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
                     <Sparkles size={18} className="text-primary animate-pulse" />
                     {labels.mobile_title}
                  </span>
                  <span className="text-[10px] font-mono tracking-[0.4em] uppercase text-muted-foreground">
                     {labels.mobile_subtitle}
                  </span>
                </div>
                <button 
                  onClick={closeMobileMenu} 
                  className="p-3 rounded-full bg-muted/50 hover:bg-muted transition-all active:scale-90"
                  aria-label="Cerrar menú"
                >
                  <X size={24} />
                </button>
              </div>

              {/* BODY: Navegación Recursiva Staggered */}
              <nav className="flex-1 overflow-y-auto px-6 py-8 custom-scrollbar">
                <div className="flex flex-col gap-2">
                  {mainNavStructure.map((nav: NavItem) => {
                    const hasChildren = nav.children && nav.children.length > 0;
                    const localizedHref = getLocalizedHref(nav.href ?? '/', currentLang);
                    const isActive = pathname === localizedHref;

                    return (
                      <motion.div key={nav.labelKey} variants={itemVariants} className="flex flex-col">
                        <Link
                          href={localizedHref}
                          onClick={closeMobileMenu}
                          className={cn(
                            "flex items-center justify-between py-5 px-6 rounded-3xl transition-all duration-300 active:scale-[0.98]",
                            isActive ? "bg-primary/10 text-primary" : "hover:bg-muted/30 text-foreground"
                          )}
                        >
                          <div className="flex items-center gap-5">
                            <div className={cn(
                              "flex items-center justify-center h-12 w-12 rounded-2xl bg-muted/50 transition-colors",
                              isActive && "bg-primary/20"
                            )}>
                              {nav.Icon && <nav.Icon size={22} strokeWidth={isActive ? 2 : 1.5} />}
                            </div>
                            <span className="font-display text-2xl font-bold tracking-tight">
                              {labels[nav.labelKey as keyof typeof labels] || nav.labelKey}
                            </span>
                          </div>
                          {hasChildren && <ChevronRight size={18} className="opacity-30" />}
                        </Link>

                        {/* SUB-ENLACES: Indentación de Élite */}
                        {hasChildren && (
                          <div className="ml-16 flex flex-col gap-1 border-l border-border/50 pl-8 mb-4 mt-1">
                            {nav.children?.map((child: NavLink) => {
                              const childHref = getLocalizedHref(child.href, currentLang);
                              return (
                                <Link
                                  key={child.labelKey}
                                  href={childHref}
                                  onClick={closeMobileMenu}
                                  className={cn(
                                    "py-3 text-lg font-sans transition-colors",
                                    pathname === childHref ? "text-primary font-bold" : "text-muted-foreground hover:text-foreground"
                                  )}
                                >
                                  {labels[child.labelKey as keyof typeof labels] || child.labelKey}
                                </Link>
                              );
                            })}
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              </nav>

              {/* FOOTER: Thumb-Driven Interaction (Zona de Acción Crítica) */}
              <div className="p-8 border-t border-white/5 space-y-6 bg-muted/10">
                <motion.div variants={itemVariants}>
                  <Link
                    href={getLocalizedHref('/#reservas', currentLang)}
                    onClick={closeMobileMenu}
                    className="flex items-center justify-center gap-4 py-5 rounded-full bg-foreground text-background font-bold uppercase tracking-[0.2em] text-xs shadow-2xl active:scale-95 transition-transform"
                  >
                    <CalendarCheck size={20} />
                    {labels.talk}
                  </Link>
                </motion.div>

                <motion.div variants={itemVariants} className="flex items-center justify-between">
                  <div className="flex gap-3">
                    <LanguageSwitcher dictionary={dictionary.language_switcher} />
                    <ThemeToggle />
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground">
                      Security Level: High
                    </p>
                    <p className="text-[9px] font-mono text-zinc-800">
                      Sovereign Infrastructure
                    </p>
                  </div>
                </motion.div>

                <motion.div variants={itemVariants} className="bg-primary/5 rounded-2xl p-4 border border-primary/10">
                  <p className="text-[9px] font-mono uppercase tracking-[0.3em] text-primary/70 text-center leading-relaxed">
                     {dictionary.header.tagline}
                  </p>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </FocusTrap>
      )}
    </AnimatePresence>
  );
}