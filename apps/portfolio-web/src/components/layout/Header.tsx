/**
 * @file Header.tsx
 * @description Orquestador Soberano de la Cabecera (NavDesk). 
 *              Implementa las Cápsulas de Identidad Boutique, conciencia de scroll
 *              y gatillos para el sistema de navegación móvil.
 * @version 19.0 - Responsive Identity & Visibility Orchestration
 * @author Raz Podestá - MetaShark Tech
 */

'use client';

import React, { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Menu, 
  Globe, 
  ChevronDown, 
  //UserPlus, 
  //LogIn, 
  User,
  X
} from 'lucide-react';
//import type { LucideIcon } from 'lucide-react';

/**
 * IMPORTACIONES DE INFRAESTRUCTRURA
 * @pilar V: Adherencia arquitectónica.
 */
import { cn } from '../../lib/utils/cn';
import { useUIStore } from '../../lib/store/ui.store';
import { LanguageSwitcher } from '../ui/LanguageSwitcher';
import { ThemeToggle } from '../ui/ThemeToggle';
import { ColorWaveBar } from '../ui/ColorWaveBar';
import { DropdownMenu } from '../ui/DropdownMenu';
import { NestedDropdownContent } from '../ui/NestedDropdownContent';
import { mainNavStructure } from '../../lib/nav-links';
import type { NavItem } from '../../lib/nav-links';
import { getLocalizedHref } from '../../lib/utils/link-helpers';
import { i18n, isValidLocale } from '../../config/i18n.config';
import type { Locale } from '../../config/i18n.config';
import type { Dictionary } from '../../lib/schemas/dictionary.schema';

/**
 * @interface HeaderProps
 */
interface HeaderProps {
  /** Diccionario maestro nivelado */
  dictionary: Dictionary;
  className?: string;
}

/**
 * SUB-APARATO: HeaderBrand
 * @description Identidad visual boutique con inercia elástica.
 */
const HeaderBrand = ({ currentLang }: { currentLang: Locale }) => (
  <motion.div
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
  >
    <Link 
      href={`/${currentLang}`} 
      className="group block select-none outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-xl" 
      aria-label="Inicio"
    >
      <div className="flex flex-col">
        <h2 className="font-display text-2xl md:text-3xl leading-none text-foreground transition-all duration-700 group-hover:text-primary">
          Beach Hotel
        </h2>
        <span className="text-[9px] font-mono tracking-[0.4em] uppercase text-muted-foreground transition-colors group-hover:text-foreground block mt-1">
          Canasvieiras
        </span>
      </div>
    </Link>
  </motion.div>
);

/**
 * APARATO PRINCIPAL: Header
 */
export function Header({ dictionary, className }: HeaderProps) {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  
  const { 
    isVisitorHudOpen, 
    isMobileMenuOpen,
    hasHydrated, 
    session, 
    toggleVisitorHud, 
    toggleMobileMenu,
    toggleAuthModal 
  } = useUIStore();

  // Control de scroll optimizado (Pilar X)
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const currentLang = useMemo(() => {
    const segments = pathname?.split('/') ?? [];
    return isValidLocale(segments[1]) ? (segments[1] as Locale) : i18n.defaultLocale;
  }, [pathname]);

  const labels = useMemo(() => ({ 
    ...dictionary.header, 
    ...dictionary['nav-links'].nav_links 
  }), [dictionary]);

  return (
    <header 
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-700 border-b",
        isScrolled 
          ? "h-16 bg-background/80 backdrop-blur-3xl border-border shadow-2xl" 
          : "h-24 bg-background/60 backdrop-blur-xl border-transparent",
        className
      )} 
    >
      <div className="container mx-auto h-full px-6">
        <div className="flex h-full items-center justify-between gap-8">
          
          <div className="flex items-center gap-10">
            <HeaderBrand currentLang={currentLang} />

            {/* NAVEGACIÓN DESKTOP (Hidden on Mobile/Tablet) */}
            <nav className="hidden lg:flex items-center gap-1" aria-label="Desktop Nav">
              {mainNavStructure.map((nav: NavItem) => {
                const localizedHref = getLocalizedHref(nav.href ?? '/', currentLang);
                const isActive = pathname === localizedHref;
                const label = labels[nav.labelKey as keyof typeof labels] || nav.labelKey;
                
                if (nav.children?.length) {
                  return (
                    <DropdownMenu key={nav.labelKey} trigger={
                      <button className="flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest text-foreground/60 hover:bg-surface hover:text-primary transition-all group">
                        {label}
                        <ChevronDown size={12} className="opacity-30 group-hover:translate-y-0.5 transition-transform" />
                      </button>
                    }>
                      <NestedDropdownContent links={nav.children} dictionary={labels} />
                    </DropdownMenu>
                  );
                }

                return (
                  <Link 
                    key={nav.labelKey} 
                    href={localizedHref} 
                    className={cn(
                      "relative flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all duration-500",
                      isActive ? "text-primary bg-primary/10" : "text-foreground/60 hover:bg-surface hover:text-primary"
                    )}
                  >
                    {label}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            
            {/* CÁPSULAS DE IDENTIDAD BOUTIQUE (Hidden on Small Screens) */}
            <div className="hidden md:flex items-center bg-surface/50 border border-border/50 rounded-full p-1 gap-1">
              <AnimatePresence mode="wait">
                {hasHydrated && session ? (
                  <motion.button
                    key="auth-portal"
                    initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-3 px-6 py-2 rounded-full bg-primary text-white text-[10px] font-bold uppercase tracking-widest shadow-lg"
                  >
                    <User size={14} />
                    {labels.portal}
                  </motion.button>
                ) : (
                  <motion.div key="auth-guest" className="flex items-center gap-1" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <button 
                      onClick={toggleAuthModal}
                      className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-all"
                    >
                      {labels.login}
                    </button>
                    <button 
                      onClick={toggleAuthModal}
                      className="px-6 py-2 rounded-full bg-foreground text-background text-[10px] font-bold uppercase tracking-widest hover:bg-primary hover:text-white transition-all shadow-xl"
                    >
                      {labels.join}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="flex items-center gap-2 border-l border-border pl-4">
              <div className="hidden sm:flex items-center gap-1 mr-2">
                <LanguageSwitcher dictionary={dictionary.language_switcher} />
                <ThemeToggle dictionary={dictionary.language_switcher} />
              </div>
              
              <button
                onClick={toggleVisitorHud}
                disabled={!hasHydrated}
                className={cn(
                  "p-2.5 rounded-full transition-all duration-500", 
                  hasHydrated && isVisitorHudOpen 
                    ? "text-primary bg-primary/10 shadow-lg border border-primary/20" 
                    : "text-muted-foreground hover:bg-surface border border-transparent"
                )}
              >
                <Globe size={20} className={cn(hasHydrated && isVisitorHudOpen && "animate-spin-slow")} />
              </button>
            </div>

            {/* TRIGGER MÓVIL (Takeover) */}
            <button 
              onClick={toggleMobileMenu} 
              className="lg:hidden p-3 rounded-full hover:bg-surface transition-all active:scale-90 relative z-60"
              aria-label={isMobileMenuOpen ? "Cerrar" : "Menú"}
            >
              <AnimatePresence mode="wait">
                {isMobileMenuOpen ? (
                  <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
                    <X size={24} />
                  </motion.div>
                ) : (
                  <motion.div key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
                    <Menu size={24} />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>
      </div>
      
      <AnimatePresence>
        {!isScrolled && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <ColorWaveBar position="bottom" variant="hotel" className="h-0.5 opacity-20" />
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}