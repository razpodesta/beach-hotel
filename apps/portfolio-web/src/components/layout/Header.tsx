/**
 * @file Header.tsx
 * @description Orquestador soberano de la cabecera (NavDesk). 
 *              Implementa conciencia de scroll, navegación localizada y 
 *              telemetría de usuario integrada.
 * @version 13.0 - Scroll-Aware & Semantic Navigation
 * @author Raz Podestá - MetaShark Tech
 */

'use client';

import React, { useMemo, useCallback, useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, Globe, ChevronDown, CalendarCheck } from 'lucide-react';

/**
 * IMPORTACIONES DE INFRAESTRUCTRURA
 */
import { cn } from '../../lib/utils/cn';
import { useUIStore } from '../../lib/store/ui.store';
import { LanguageSwitcher } from '../ui/LanguageSwitcher';
import { ThemeToggle } from '../ui/ThemeToggle';
import { ColorWaveBar } from '../ui/ColorWaveBar';
import { DropdownMenu } from '../ui/DropdownMenu';
import { NestedDropdownContent } from '../ui/NestedDropdownContent';
import { mainNavStructure, type NavItem } from '../../lib/nav-links';
import { getLocalizedHref } from '../../lib/utils/link-helpers';
import { i18n, isValidLocale, type Locale } from '../../config/i18n.config';
import type { Dictionary } from '../../lib/schemas/dictionary.schema';

/**
 * SUB-APARATO: HeaderBrand
 * @description Identidad visual con micro-interacciones de lujo.
 */
const HeaderBrand = ({ currentLang }: { currentLang: Locale }) => (
  <motion.div
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
  >
    <Link 
      href={`/${currentLang}`} 
      className="group block select-none outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-xl transition-all" 
      aria-label="Volver al inicio"
    >
      <div className="flex flex-col">
        <h2 className="font-display text-2xl sm:text-3xl leading-none text-foreground transition-all duration-500 group-hover:text-primary">
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
export function Header({ dictionary }: { dictionary: Dictionary }) {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  
  // Detección de Scroll para dinámica visual (Pilar X)
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const currentLang = useMemo(() => {
    const segments = pathname?.split('/') ?? [];
    const candidate = segments[1];
    return isValidLocale(candidate) ? (candidate as Locale) : i18n.defaultLocale;
  }, [pathname]);

  const { isVisitorHudOpen, hasHydrated, toggleVisitorHud, toggleMobileMenu } = useUIStore();

  const labels = useMemo(() => ({ 
    ...dictionary.header, 
    ...dictionary['nav-links'].nav_links 
  }), [dictionary]);

  /**
   * PROTOCOLO HEIMDALL: Telemetría de Navegación
   * @description Registra interacciones tácticas para el motor de XP.
   */
  const trackInteraction = useCallback((label: string) => {
    console.log(`[HEIMDALL][UX] Interaction Triggered: Header -> ${label}`);
  }, []);

  return (
    <header 
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-500 border-b border-transparent",
        isScrolled 
          ? "h-16 bg-background/90 backdrop-blur-3xl border-border/50 shadow-lg" 
          : "h-24 bg-background/80 backdrop-blur-2xl"
      )} 
      role="banner"
    >
      <div className="container mx-auto h-full px-6">
        <div className="flex h-full items-center justify-between gap-8">
          
          <div className="flex items-center gap-12">
            <HeaderBrand currentLang={currentLang} />

            {/* NAVEGACIÓN DESKTOP */}
            <nav className="hidden lg:flex items-center gap-1" aria-label="Navegación Principal">
              {mainNavStructure.map((nav: NavItem) => {
                const localizedHref = getLocalizedHref(nav.href ?? '/', currentLang);
                const isActive = pathname === localizedHref;
                const label = labels[nav.labelKey as keyof typeof labels] || nav.labelKey;
                
                if (nav.children?.length) {
                  return (
                    <DropdownMenu key={nav.labelKey} trigger={
                      <button className="flex items-center gap-2 px-5 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest text-foreground/70 hover:bg-muted hover:text-foreground transition-all outline-none group">
                        {nav.Icon && <nav.Icon size={14} className="opacity-70 group-hover:text-primary transition-colors" />}
                        {label}
                        <ChevronDown size={12} className="opacity-40" />
                      </button>
                    }>
                      <NestedDropdownContent 
                        links={nav.children as NavItem[]} 
                        dictionary={labels as Record<string, string>} 
                      />
                    </DropdownMenu>
                  );
                }

                return (
                  <Link 
                    key={nav.labelKey} 
                    href={localizedHref} 
                    onClick={() => trackInteraction(`Nav:${nav.labelKey}`)}
                    aria-current={isActive ? 'page' : undefined}
                    className={cn(
                      "relative flex items-center gap-2 px-5 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all duration-300 outline-none",
                      isActive 
                        ? "text-primary bg-primary/10" 
                        : "text-foreground/70 hover:bg-muted hover:text-foreground"
                    )}
                  >
                    {nav.Icon && <nav.Icon size={14} className={cn("opacity-70", isActive && "opacity-100")} />}
                    {label}
                    {isActive && (
                      <motion.div 
                        layoutId="nav-pill" 
                        className="absolute inset-0 border border-primary/20 rounded-full" 
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            {/* ACCIÓN DE RESERVA (MEA/UX) */}
            <Link 
              href={getLocalizedHref('/#reservas', currentLang)}
              onClick={() => trackInteraction('Booking_Intent')}
              className={cn(
                "hidden sm:flex items-center gap-3 rounded-full bg-foreground px-8 py-3 text-[10px] font-bold uppercase tracking-[0.2em] text-background transition-all hover:bg-primary active:scale-95 shadow-xl",
                isScrolled && "py-2.5"
              )}
            >
              <CalendarCheck size={16} strokeWidth={2} />
              {labels.talk}
            </Link>

            <div className="flex items-center gap-1 border-l border-border pl-4">
              <div className="hidden md:flex items-center gap-1 pr-2 border-r border-border mr-2">
                <LanguageSwitcher dictionary={dictionary.language_switcher} />
                <ThemeToggle />
              </div>
              
              {/* BOTÓN HUD (Telemetría) */}
              <button
                onClick={toggleVisitorHud}
                disabled={!hasHydrated}
                className={cn(
                  "p-2.5 rounded-full transition-all duration-300 outline-none", 
                  hasHydrated && isVisitorHudOpen 
                    ? "text-primary bg-primary/10 shadow-[0_0_15px_rgba(168,85,247,0.2)]" 
                    : "text-muted-foreground hover:bg-muted"
                )}
                aria-label="Abrir Telemetría"
              >
                <Globe size={20} strokeWidth={1.5} className={cn(isVisitorHudOpen && "animate-spin-slow")} />
              </button>
            </div>

            <button onClick={toggleMobileMenu} className="lg:hidden p-3 rounded-full hover:bg-muted transition-colors" aria-label="Abrir menú móvil">
              <Menu size={24} />
            </button>
          </div>
        </div>
      </div>
      
      {/* Indicador de Gradiente (Branding) */}
      <AnimatePresence>
        {!isScrolled && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <ColorWaveBar position="bottom" variant="hotel" className="h-0.5 opacity-30" />
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}