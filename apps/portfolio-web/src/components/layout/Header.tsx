/**
 * @file apps/portfolio-web/src/components/layout/Header.tsx
 * @description Orquestador Soberano de la Cabecera (NavDesk). 
 *              Implementa conciencia de scroll, navegación localizada, 
 *              telemetría de usuario e integración con Tailwind v4.
 * @version 16.0 - Vercel Build Normalization & Type Hardening
 * @author Raz Podestá - MetaShark Tech
 */

'use client';

import React, { useMemo, useCallback, useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, Globe, ChevronDown, CalendarCheck } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

/**
 * IMPORTACIONES DE INFRAESTRUCTRURA (Rutas Saneadas)
 * @pilar V: Eliminación de extensiones .js para compatibilidad total con el build de Vercel.
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
 * SUB-APARATO: HeaderBrand
 * @description Identidad visual boutique. Sincronizado con tokens de Oxygen Engine.
 */
const HeaderBrand = ({ currentLang }: { currentLang: Locale }) => (
  <motion.div
    whileHover={{ scale: 1.01 }}
    whileTap={{ scale: 0.99 }}
    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
  >
    <Link 
      href={`/${currentLang}`} 
      className="group block select-none outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-xl transition-all" 
      aria-label="Volver al inicio"
    >
      <div className="flex flex-col">
        <h2 className="font-display text-2xl sm:text-3xl leading-none text-foreground transition-all duration-700 group-hover:text-primary">
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
  
  /**
   * DETECCIÓN DE SCROLL (Pilar X)
   * Optimizado con passive: true para no bloquear el hilo de renderizado.
   */
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

  // Selección quirúrgica de estado global
  const isVisitorHudOpen = useUIStore((s) => s.isVisitorHudOpen);
  const hasHydrated = useUIStore((s) => s.hasHydrated);
  const toggleVisitorHud = useUIStore((s) => s.toggleVisitorHud);
  const toggleMobileMenu = useUIStore((s) => s.toggleMobileMenu);

  /**
   * CONTRATO DE TRADUCCIÓN (Pilar VI)
   * Centraliza los tokens del Shell en una referencia estable.
   */
  const labels = useMemo(() => ({ 
    ...dictionary.header, 
    ...dictionary['nav-links'].nav_links 
  }), [dictionary]);

  /**
   * PROTOCOLO HEIMDALL: Telemetría Forense
   */
  const trackInteraction = useCallback((label: string) => {
    console.group(`[HEIMDALL][UX] Interaction: Header -> ${label}`);
    console.log(`Scroll_State: ${isScrolled ? 'Sticky' : 'Static'}`);
    console.log(`Timestamp: ${new Date().toISOString()}`);
    console.groupEnd();
  }, [isScrolled]);

  return (
    <header 
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-700 border-b border-transparent",
        isScrolled 
          ? "h-16 bg-background/90 backdrop-blur-3xl border-border/50 shadow-xl" 
          : "h-24 bg-background/80 backdrop-blur-2xl"
      )} 
      role="banner"
    >
      <div className="container mx-auto h-full px-6">
        <div className="flex h-full items-center justify-between gap-8">
          
          <div className="flex items-center gap-12">
            <HeaderBrand currentLang={currentLang} />

            {/* NAVEGACIÓN DESKTOP (Lego System) */}
            <nav className="hidden lg:flex items-center gap-1" aria-label="Navegação Principal">
              {mainNavStructure.map((nav: NavItem) => {
                const localizedHref = getLocalizedHref(nav.href ?? '/', currentLang);
                const isActive = pathname === localizedHref;
                const label = labels[nav.labelKey as keyof typeof labels] || nav.labelKey;
                const Icon = nav.Icon as LucideIcon | undefined;
                
                // Rama de Navegación Anidada
                if (nav.children?.length) {
                  return (
                    <DropdownMenu key={nav.labelKey} trigger={
                      <button className="flex items-center gap-2 px-5 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest text-foreground/70 hover:bg-muted hover:text-foreground transition-all outline-none group">
                        {Icon && <Icon size={14} className="opacity-70 group-hover:text-primary transition-colors" />}
                        {label}
                        <ChevronDown size={12} className="opacity-30 group-hover:translate-y-0.5 transition-transform" />
                      </button>
                    }>
                      <NestedDropdownContent 
                        links={nav.children} 
                        dictionary={labels} 
                      />
                    </DropdownMenu>
                  );
                }

                // Rama de Navegación Simple
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
                    {Icon && <Icon size={14} className={cn("opacity-70", isActive && "opacity-100")} />}
                    {label}
                    {isActive && (
                      <motion.div 
                        layoutId="nav-pill-desktop" 
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
            {/* CONVERSIÓN: ACCIÓN DE RESERVA (MEA/UX) */}
            <Link 
              href={getLocalizedHref('/#reservas', currentLang)}
              onClick={() => trackInteraction('Booking_Intent_Header')}
              className={cn(
                "hidden sm:flex items-center gap-3 rounded-full bg-foreground px-8 py-3 text-[10px] font-bold uppercase tracking-[0.25em] text-background transition-all hover:bg-primary hover:text-white active:scale-95 shadow-2xl",
                isScrolled && "py-2.5"
              )}
            >
              <CalendarCheck size={16} strokeWidth={2.5} />
              {labels.talk}
            </Link>

            <div className="flex items-center gap-1 border-l border-border pl-4">
              <div className="hidden md:flex items-center gap-1 pr-2 border-r border-border mr-2">
                <LanguageSwitcher dictionary={dictionary.language_switcher} />
                <ThemeToggle />
              </div>
              
              {/* TELEMETRÍA: BOTÓN HUD (Heimdall) */}
              <button
                onClick={toggleVisitorHud}
                disabled={!hasHydrated}
                className={cn(
                  "p-2.5 rounded-full transition-all duration-500 outline-none", 
                  hasHydrated && isVisitorHudOpen 
                    ? "text-primary bg-primary/10 shadow-[0_0_20px_rgba(168,85,247,0.25)] border border-primary/20" 
                    : "text-muted-foreground hover:bg-muted border border-transparent"
                )}
                aria-label="Alternar Telemetría"
                title="Sovereign Telemetry"
              >
                <Globe 
                  size={20} 
                  strokeWidth={1.5} 
                  className={cn(hasHydrated && isVisitorHudOpen && "animate-spin-slow")} 
                />
              </button>
            </div>

            {/* CONTROL MÓVIL (Takeover) */}
            <button 
              onClick={toggleMobileMenu} 
              className="lg:hidden p-3 rounded-full hover:bg-muted transition-all active:scale-90" 
              aria-label="Abrir navegación móvil"
            >
              <Menu size={24} />
            </button>
          </div>
        </div>
      </div>
      
      {/* SELLO DE MARCA (Branding Bar) */}
      <AnimatePresence>
        {!isScrolled && (
          <motion.div
            initial={{ opacity: 0, y: -2 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <ColorWaveBar position="bottom" variant="hotel" className="h-0.5 opacity-20" />
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}