/**
 * @file MobileMenu.tsx
 * @description Centro de Navegación Móvil de Élite (The Takeover).
 *              Refactorizado: Resolución de error de Linter (no-unused-expressions),
 *              estabilización de handlers y paridad de telemetría Heimdall.
 * @version 10.0 - Linter Pure & AST Compliant
 * @author Raz Podestá - MetaShark Tech
 */

'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  X, 
  ChevronDown, 
  LogIn, 
  UserPlus, 
  User, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { FocusTrap } from 'focus-trap-react';

/**
 * IMPORTACIONES DE INFRAESTRUCTRURA
 * @pilar V: Adherencia arquitectónica.
 */
import { cn } from '../../lib/utils/cn';
import { useUIStore } from '../../lib/store/ui.store';
import { mainNavStructure } from '../../lib/nav-links';
import type { NavItem, NavLink as NavLinkType } from '../../lib/nav-links';
import { getLocalizedHref } from '../../lib/utils/link-helpers';
import { i18n, isValidLocale } from '../../config/i18n.config';
import type { Locale } from '../../config/i18n.config';
import { LanguageSwitcher } from '../ui/LanguageSwitcher';
import { ThemeToggle } from '../ui/ThemeToggle';
import type { Dictionary } from '../../lib/schemas/dictionary.schema';

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
  hidden: { opacity: 0, x: 20, filter: 'blur(4px)' },
  visible: { opacity: 1, x: 0, filter: 'blur(0px)' },
};

/**
 * SUB-APARATO: MobileAccordionItem
 */
const MobileAccordionItem = ({ 
  item, 
  labels, 
  currentLang, 
  onClose 
}: { 
  item: NavItem; 
  labels: Record<string, string>; 
  currentLang: Locale; 
  onClose: () => void 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const hasChildren = !!(item.children && item.children.length > 0);
  const label = labels[item.labelKey] || item.labelKey;

  /**
   * @fix: Resolución de 'no-unused-expressions'.
   * Se sustituye el operador ternario por un bloque if explícito.
   */
  const handleToggle = useCallback(() => {
    if (hasChildren) {
      setIsOpen(!isOpen);
    } else {
      onClose();
    }
  }, [hasChildren, isOpen, onClose]);

  return (
    <motion.div variants={itemVariants} className="flex flex-col border-b border-border/30 last:border-0">
      {hasChildren ? (
        <button
          onClick={handleToggle}
          className="flex items-center justify-between py-6 px-4 group outline-none focus-visible:bg-surface/50"
        >
          <div className="flex items-center gap-5">
            <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-surface border border-border/50 text-muted-foreground group-active:text-primary transition-colors">
              {item.Icon && <item.Icon size={20} strokeWidth={1.5} />}
            </div>
            <span className="font-display text-2xl font-bold tracking-tight text-foreground">{label}</span>
          </div>
          <motion.div animate={{ rotate: isOpen ? 180 : 0 }}>
            <ChevronDown size={20} className="text-muted-foreground" />
          </motion.div>
        </button>
      ) : (
        <Link
          href={getLocalizedHref(item.href, currentLang)}
          onClick={onClose}
          className="flex items-center justify-between py-6 px-4 group outline-none focus-visible:bg-surface/50"
        >
          <div className="flex items-center gap-5">
            <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-surface border border-border/50 text-muted-foreground transition-colors">
              {item.Icon && <item.Icon size={20} strokeWidth={1.5} />}
            </div>
            <span className="font-display text-2xl font-bold tracking-tight text-foreground">{label}</span>
          </div>
          <ArrowRight size={18} className="opacity-0 group-active:opacity-100 text-primary transition-all" />
        </Link>
      )}

      <AnimatePresence>
        {isOpen && hasChildren && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden bg-foreground/5"
          >
            <div className="pl-16 pr-4 pb-6 flex flex-col gap-4">
              {item.children?.map((child: NavLinkType) => {
                const childLabel = labels[child.labelKey] || child.labelKey;
                const isChildActive = pathname === getLocalizedHref(child.href, currentLang);
                return (
                  <Link
                    key={child.labelKey}
                    href={getLocalizedHref(child.href, currentLang)}
                    onClick={onClose}
                    className={cn(
                      "py-2 text-lg font-sans transition-colors outline-none",
                      isChildActive ? "text-primary font-bold" : "text-muted-foreground"
                    )}
                  >
                    {childLabel}
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

/**
 * APARATO PRINCIPAL: MobileMenu
 */
export function MobileMenu({ dictionary }: { dictionary: Dictionary }) {
  const { isMobileMenuOpen, closeMobileMenu, session, hasHydrated, toggleAuthModal } = useUIStore();
  const pathname = usePathname();
  
  const currentLang = useMemo(() => {
    const segments = pathname?.split('/') ?? [];
    return isValidLocale(segments[1]) ? (segments[1] as Locale) : i18n.defaultLocale;
  }, [pathname]);

  const labels: Record<string, string> = useMemo(() => {
    return { 
      ...dictionary.header, 
      ...dictionary['nav-links'].nav_links 
    } as Record<string, string>;
  }, [dictionary]);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isMobileMenuOpen]);

  const handleAuthInteraction = useCallback((action: 'login' | 'join') => {
    console.log(`[HEIMDALL][UX] Mobile Access Triggered: ${action.toUpperCase()}`);
    closeMobileMenu();
    toggleAuthModal();
  }, [closeMobileMenu, toggleAuthModal]);

  if (!hasHydrated) return null;

  return (
    <AnimatePresence>
      {isMobileMenuOpen && (
        <FocusTrap active={isMobileMenuOpen}>
          <div className="fixed inset-0 z-100 overflow-hidden" role="dialog" aria-modal="true">
            
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={closeMobileMenu}
              className="absolute inset-0 bg-background/60 backdrop-blur-xl"
            />

            <motion.div
              variants={panelVariants} initial="hidden" animate="visible" exit="hidden"
              className="absolute inset-y-0 right-0 w-full max-w-sm bg-surface shadow-3xl flex flex-col border-l border-border transition-colors duration-700"
            >
              <header className="p-8 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
                       <Sparkles size={18} className="text-primary animate-pulse" />
                       {labels.mobile_title}
                    </span>
                    <span className="text-[10px] font-mono tracking-[0.4em] uppercase text-muted-foreground">
                       {labels.mobile_subtitle}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <LanguageSwitcher dictionary={dictionary.language_switcher} />
                    <ThemeToggle dictionary={dictionary.language_switcher} />
                    <button 
                      onClick={closeMobileMenu} 
                      className="p-3 rounded-full bg-background/50 text-foreground active:scale-90 ml-2 outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      aria-label="Cerrar menú"
                    >
                        <X size={24} />
                    </button>
                  </div>
                </div>

                <div className="p-1 bg-background/40 border border-border/50 rounded-3xl">
                  <AnimatePresence mode="wait">
                    {session ? (
                      <motion.button
                        key="active-user" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="w-full flex items-center gap-4 p-4 rounded-2xl bg-primary text-white outline-none focus-visible:ring-2 focus-visible:ring-accent"
                        onClick={closeMobileMenu}
                      >
                        <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center">
                          <User size={20} />
                        </div>
                        <div className="text-left">
                          <p className="text-[10px] font-bold uppercase tracking-widest opacity-70">{labels.portal}</p>
                          <p className="text-sm font-bold truncate max-w-[150px]">{session.email}</p>
                        </div>
                      </motion.button>
                    ) : (
                      <motion.div key="guest-actions" className="grid grid-cols-2 gap-1" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <button 
                          onClick={() => handleAuthInteraction('login')}
                          className="flex items-center justify-center gap-2 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors outline-none focus-visible:bg-surface"
                        >
                          <LogIn size={16} /> {labels.login}
                        </button>
                        <button 
                          onClick={() => handleAuthInteraction('join')}
                          className="flex items-center justify-center gap-2 py-4 rounded-2xl bg-foreground text-background text-[10px] font-bold uppercase tracking-widest shadow-xl hover:bg-primary hover:text-white transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary"
                        >
                          <UserPlus size={16} /> {labels.join}
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </header>

              <nav className="flex-1 overflow-y-auto px-4 custom-scrollbar">
                {mainNavStructure.map((nav) => (
                  <MobileAccordionItem 
                    key={nav.labelKey} 
                    item={nav} 
                    labels={labels} 
                    currentLang={currentLang} 
                    onClose={closeMobileMenu}
                  />
                ))}
              </nav>

              <footer className="p-8 border-t border-border/50 bg-background/20">
                <div className="flex items-center justify-between">
                  <div className="flex gap-4">
                    <LanguageSwitcher dictionary={dictionary.language_switcher} />
                    <ThemeToggle dictionary={dictionary.language_switcher} />
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] font-mono uppercase tracking-[0.2em] text-zinc-600">
                      Sovereign System v8.0
                    </p>
                  </div>
                </div>
              </footer>
            </motion.div>
          </div>
        </FocusTrap>
      )}
    </AnimatePresence>
  );
}