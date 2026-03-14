/**
 * @file apps/portfolio-web/src/components/layout/Header.tsx
 * @description Orquestador soberano de la cabecera (Lego System). 
 *              Gestiona la identidad visual, navegación localizada, estados anidados
 *              y telemetría Heimdall para el flujo de conversión.
 * @version 11.1 - ESLint Hardening & Atomic Hydration
 * @author Raz Podestá - MetaShark Tech
 */

'use client';

import React, { useMemo, useCallback, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, Globe, ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';

/**
 * IMPORTACIONES NIVELADAS
 * @pilar V: Adherencia arquitectónica mediante fronteras Nx.
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
import { i18n, isValidLocale } from '../../config/i18n.config';
import type { Dictionary } from '../../lib/schemas/dictionary.schema';

/**
 * Hook de Hidratación Atómica
 * @pilar VIII: Previene "Hydration Mismatch" bajo estándar React 19.
 * @pilar X: Saneado para evitar funciones vacías prohibidas por el linter.
 */
function useIsMounted(): boolean {
  const subscribe = useCallback(() => {
    const unsubscribe = () => {
      /* Intencionalmente vacío: Estado de montaje estático en cliente */
    };
    return unsubscribe;
  }, []);

  return useSyncExternalStore(
    subscribe, 
    () => true,  // Valor en Cliente
    () => false // Valor en Servidor
  );
}

/**
 * COMPONENTE ATÓMICO: HeaderBrand
 * Representa la identidad visual premium del hotel.
 */
const HeaderBrand = ({ currentLang }: { currentLang: string }) => (
  <Link 
    href={`/${currentLang}`} 
    className="group block select-none outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg transition-all" 
    aria-label="Volver a la recepción"
  >
    <h2 className="font-display text-2xl sm:text-3xl leading-none text-foreground transition-all duration-300 group-hover:text-primary">
      Beach Hotel
    </h2>
    <span className="text-[9px] font-mono tracking-[0.4em] uppercase text-muted-foreground transition-colors group-hover:text-foreground block mt-0.5">
      Canasvieiras
    </span>
  </Link>
);

/**
 * APARATO VISUAL: Header
 */
export function Header({ dictionary }: { dictionary: Dictionary }) {
  const isMounted = useIsMounted();
  const pathname = usePathname();
  
  // Resolución de idioma soberana
  const currentLang = useMemo(() => {
    const segments = pathname?.split('/') ?? [];
    const candidate = segments[1];
    return isValidLocale(candidate) ? candidate : i18n.defaultLocale;
  }, [pathname]);

  const { 
    isVisitorHudOpen, 
    toggleVisitorHud, 
    toggleMobileMenu,
  } = useUIStore();

  const labels = useMemo(() => ({ 
    ...dictionary.header, 
    ...dictionary['nav-links'].nav_links 
  }), [dictionary]);

  /**
   * TELEMETRÍA: trackNavInteraction
   * @pilar IV: Registro forense de navegación principal.
   */
  const trackNavInteraction = useCallback((label: string) => {
    console.log(`[HEIMDALL][UX] Navegación: ${label} | Path: ${pathname}`);
  }, [pathname]);

  return (
    <header 
      className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-2xl transition-all duration-500"
      role="banner"
    >
      <div className="container mx-auto px-6">
        <div className="flex h-20 items-center justify-between">
          
          <HeaderBrand currentLang={currentLang} />

          {/* NAVEGACIÓN DESKTOP: SOPORTE RECURSIVO (Pilar I) */}
          <nav className="hidden lg:flex items-center gap-1" aria-label="Navegación Principal">
            {mainNavStructure.map((nav: NavItem) => {
              const localizedHref = getLocalizedHref(nav.href ?? '/', currentLang);
              const isActive = pathname === localizedHref;
              const hasChildren = nav.children && nav.children.length > 0;

              if (hasChildren) {
                return (
                  <DropdownMenu
                    key={nav.labelKey}
                    trigger={
                      <button className="flex items-center gap-2 px-5 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest text-foreground/70 hover:bg-muted hover:text-foreground transition-all outline-none">
                        {nav.Icon && <nav.Icon size={14} className="opacity-70" />}
                        {labels[nav.labelKey as keyof typeof labels] || nav.labelKey}
                        <ChevronDown size={12} className="opacity-40" />
                      </button>
                    }
                  >
                    <NestedDropdownContent 
                      links={nav.children as NavItem[]} 
                      dictionary={labels as unknown as Record<string, string>} 
                    />
                  </DropdownMenu>
                );
              }

              return (
                <Link
                  key={nav.labelKey}
                  href={localizedHref}
                  onClick={() => trackNavInteraction(nav.labelKey)}
                  className={cn(
                    "relative flex items-center gap-2 px-5 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all duration-300 outline-none",
                    isActive ? "text-primary bg-primary/5" : "text-foreground/70 hover:bg-muted hover:text-foreground",
                    nav.labelKey === 'festival' && "bg-primary/10 text-primary border border-primary/20 hover:scale-105"
                  )}
                >
                  {nav.Icon && <nav.Icon size={14} className={cn("opacity-70", isActive && "opacity-100")} />}
                  {labels[nav.labelKey as keyof typeof labels] || nav.labelKey}
                  
                  {isActive && (
                    <motion.div 
                      layoutId="header-active-pill"
                      className="absolute inset-0 rounded-full border border-primary/20 -z-10"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-1 border-r border-border pr-3">
              <LanguageSwitcher dictionary={dictionary.language_switcher} />
              <ThemeToggle />
              
              <button
                onClick={toggleVisitorHud}
                className={cn(
                  "p-2.5 rounded-full transition-all duration-300 outline-none",
                  isMounted && isVisitorHudOpen 
                    ? "text-primary bg-primary/5" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
                aria-label="Información de clima"
              >
                <Globe size={18} strokeWidth={1.5} />
              </button>
            </div>

            <Link 
              href={getLocalizedHref('/#reservas', currentLang)}
              onClick={() => trackNavInteraction('reservas_cta')}
              className="hidden sm:flex px-8 py-3 rounded-full bg-foreground text-background text-[10px] font-bold uppercase tracking-widest hover:bg-primary hover:text-primary-foreground transition-all duration-500 shadow-xl active:scale-95"
            >
              {dictionary.header.talk}
            </Link>

            <button 
              onClick={toggleMobileMenu} 
              className="lg:hidden p-3 rounded-full hover:bg-muted text-foreground transition-colors active:scale-90 outline-none"
              aria-label="Menú"
            >
              <Menu size={24} />
            </button>
          </div>
        </div>
      </div>
      
      <ColorWaveBar position="bottom" variant="hotel" className="h-0.5 opacity-30" />
    </header>
  );
}