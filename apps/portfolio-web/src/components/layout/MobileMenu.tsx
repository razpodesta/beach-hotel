/**
 * @file MobileMenu.tsx
 * @description Centro de Navegación Móvil de Élite (The Takeover).
 *              Refactorizado: Sincronización con el Ciclo de Atmósfera Triple,
 *              corrección de error TS2741 y optimización de contraste Day-First.
 * @version 7.0 - Atmosphere Responsive & TS-Safe
 * @author Raz Podestá - MetaShark Tech
 */

'use client';

import React, { useEffect, useMemo, useCallback, useSyncExternalStore } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Variants } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { X, ChevronRight, CalendarCheck, Sparkles } from 'lucide-react';
import { FocusTrap } from 'focus-trap-react';

/**
 * IMPORTACIONES DE INFRAESTRUCTRURA
 * @pilar V: Adherencia arquitectónica.
 */
import { cn } from '../../lib/utils/cn.js';
import { useUIStore } from '../../lib/store/ui.store.js';
import { mainNavStructure } from '../../lib/nav-links.js';
import type { NavItem, NavLink as NavLinkType } from '../../lib/nav-links.js';
import { getLocalizedHref } from '../../lib/utils/link-helpers.js';
import { i18n } from '../../config/i18n.config.js';
import type { Locale } from '../../config/i18n.config.js';
import { LanguageSwitcher } from '../ui/LanguageSwitcher.js';
import { ThemeToggle } from '../ui/ThemeToggle.js';
import type { Dictionary } from '../../lib/schemas/dictionary.schema.js';

/**
 * COREOGRAFÍA MEA/UX (Pilar XII)
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
      damping: 28, 
      stiffness: 250,
      staggerChildren: 0.06,
      delayChildren: 0.1
    } 
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, x: 20, filter: 'blur(4px)' },
  visible: { opacity: 1, x: 0, filter: 'blur(0px)' },
};

/**
 * Hook de Hidratación de Élite: useIsMounted
 * @description Garantiza sincronía atómica con el DOM para evitar parpadeos de estilo.
 */
function useIsMounted(): boolean {
  const subscribe = useCallback(() => {
    return () => { /* No-op: Estado terminal en cliente */ };
  }, []);
  return useSyncExternalStore(subscribe, () => true, () => false);
}

/**
 * APARATO: MobileMenu
 * @description Orquestador de la navegación táctica a pantalla completa. 
 *              Reacciona dinámicamente a la atmósfera Día/Noche.
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
   * PROTOCOLO HEIMDALL: Control Perimetral & Telemetría
   */
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
      console.log(`[HEIMDALL][UX] Mobile Takeover Engaged. Path: ${pathname}`);
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isMobileMenuOpen, pathname]);

  const trackNavIntent = useCallback((label: string) => {
    console.log(`[HEIMDALL][UX] Navigation Intent (Mobile): ${label}`);
  }, []);

  if (!isMounted) return null;

  return (
    <AnimatePresence>
      {isMobileMenuOpen && (
        <FocusTrap active={isMobileMenuOpen}>
          <div className="fixed inset-0 z-100 overflow-hidden" role="dialog" aria-modal="true">
            
            {/* 1. OVERLAY DE FONDO (Atmosphere-Aware) */}
            <motion.div
              variants={overlayVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              onClick={closeMobileMenu}
              className="absolute inset-0 bg-background/40 backdrop-blur-md"
            />

            {/* 2. PANEL DE NAVEGACIÓN SOBERANO */}
            <motion.div
              variants={panelVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="absolute inset-y-0 right-0 w-full max-w-sm bg-surface shadow-3xl flex flex-col border-l border-border transition-colors duration-700"
            >
              {/* HEADER: Branding & Control */}
              <header className="flex items-center justify-between p-8 border-b border-border/50">
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
                  className="p-3 rounded-full bg-background/50 hover:bg-background transition-all active:scale-90 outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  aria-label="Fechar menu"
                >
                  <X size={24} />
                </button>
              </header>

              {/* BODY: Navegación Staggered */}
              <nav className="flex-1 overflow-y-auto px-6 py-8 custom-scrollbar scroll-smooth">
                <div className="flex flex-col gap-2">
                  {mainNavStructure.map((nav: NavItem) => {
                    const hasChildren = !!(nav.children && nav.children.length > 0);
                    const localizedHref = getLocalizedHref(nav.href ?? '/', currentLang);
                    const isActive = pathname === localizedHref;

                    return (
                      <motion.div key={nav.labelKey} variants={itemVariants} className="flex flex-col">
                        <Link
                          href={localizedHref}
                          onClick={() => {
                            trackNavIntent(nav.labelKey);
                            closeMobileMenu();
                          }}
                          className={cn(
                            "flex items-center justify-between py-5 px-6 rounded-3xl transition-all duration-300 active:scale-[0.98]",
                            isActive 
                              ? "bg-primary/10 text-primary" 
                              : "hover:bg-background/50 text-foreground"
                          )}
                        >
                          <div className="flex items-center gap-5">
                            <div className={cn(
                              "flex items-center justify-center h-12 w-12 rounded-2xl bg-background border border-border/40 transition-all",
                              isActive && "bg-primary/20 border-primary/30"
                            )}>
                              {nav.Icon && <nav.Icon size={22} strokeWidth={isActive ? 2 : 1.5} />}
                            </div>
                            <span className="font-display text-2xl font-bold tracking-tight">
                              {labels[nav.labelKey as keyof typeof labels] || nav.labelKey}
                            </span>
                          </div>
                          {hasChildren && <ChevronRight size={18} className="opacity-30" />}
                        </Link>

                        {/* SUB-ENLACES: Indentación Táctica (Pilar V) */}
                        <AnimatePresence>
                          {hasChildren && (
                            <div className="ml-16 flex flex-col gap-1 border-l border-border pl-8 mb-4 mt-1">
                              {nav.children?.map((child: NavLinkType) => {
                                const childHref = getLocalizedHref(child.href, currentLang);
                                const isChildActive = pathname === childHref;
                                return (
                                  <Link
                                    key={child.labelKey}
                                    href={childHref}
                                    onClick={() => {
                                      trackNavIntent(child.labelKey);
                                      closeMobileMenu();
                                    }}
                                    className={cn(
                                      "py-3 text-lg font-sans transition-colors outline-none",
                                      isChildActive 
                                        ? "text-primary font-bold" 
                                        : "text-muted-foreground hover:text-foreground"
                                    )}
                                  >
                                    {labels[child.labelKey as keyof typeof labels] || child.labelKey}
                                  </Link>
                                );
                              })}
                            </div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    );
                  })}
                </div>
              </nav>

              {/* FOOTER: Thumb-Driven Configuration */}
              <footer className="p-8 border-t border-border/50 space-y-6 bg-background/20">
                <motion.div variants={itemVariants}>
                  <Link
                    href={getLocalizedHref('/#reservas', currentLang)}
                    onClick={() => {
                      trackNavIntent('Conversion_Footer_Mobile');
                      closeMobileMenu();
                    }}
                    className="flex items-center justify-center gap-4 py-5 rounded-full bg-foreground text-background font-bold uppercase tracking-[0.2em] text-xs shadow-2xl active:scale-95 transition-all hover:bg-primary hover:text-white"
                  >
                    <CalendarCheck size={20} />
                    {labels.talk}
                  </Link>
                </motion.div>

                <motion.div variants={itemVariants} className="flex items-center justify-between px-2">
                  <div className="flex gap-4">
                    <LanguageSwitcher dictionary={dictionary.language_switcher} />
                    
                    {/* 
                       @fix TS2741: Inyección del contrato de atmósfera. 
                       Garantiza que los controles de tema sean localizados y tipados.
                    */ }
                    <ThemeToggle dictionary={dictionary.language_switcher} />
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] font-mono uppercase tracking-[0.2em] text-zinc-600">
                      Sovereign System 3.0
                    </p>
                  </div>
                </motion.div>
              </footer>
            </motion.div>
          </div>
        </FocusTrap>
      )}
    </AnimatePresence>
  );
}