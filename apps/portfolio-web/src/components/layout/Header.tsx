/**
 * @file Header.tsx
 * @description Orquestador soberano de la cabecera.
 *              Nivelado: Erradicado el uso de 'any', tipado estricto de diccionarios
 *              y cumplimiento de las normas de higiene de código.
 * @version 12.2 - Elite Security & Contract Hardening
 * @author Raz Podestá - MetaShark Tech
 */

'use client';

import React, { useMemo, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, Globe, ChevronDown, CalendarCheck } from 'lucide-react';

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

const HeaderBrand = ({ currentLang }: { currentLang: Locale }) => (
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
);

export function Header({ dictionary }: { dictionary: Dictionary }) {
  const pathname = usePathname();
  
  const currentLang = useMemo(() => {
    const segments = pathname?.split('/') ?? [];
    const candidate = segments[1];
    return isValidLocale(candidate) ? (candidate as Locale) : i18n.defaultLocale;
  }, [pathname]);

  const { isVisitorHudOpen, hasHydrated, toggleVisitorHud, toggleMobileMenu } = useUIStore();

  const labels = useMemo(() => ({ 
    ...dictionary?.header, 
    ...dictionary?.['nav-links']?.nav_links 
  }), [dictionary]);

  const trackInteraction = useCallback((label: string) => {
    console.log(`[HEIMDALL][UX] Interaction: Header -> ${label}`);
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-2xl transition-all duration-500" role="banner">
      <div className="container mx-auto px-6">
        <div className="flex h-20 items-center justify-between gap-8">
          
          <div className="flex items-center gap-12">
            <HeaderBrand currentLang={currentLang} />

            <nav className="hidden lg:flex items-center gap-1" aria-label="Navegación Principal">
              {mainNavStructure.map((nav: NavItem) => {
                const localizedHref = getLocalizedHref(nav.href ?? '/', currentLang);
                const isActive = pathname === localizedHref;
                const label = labels[nav.labelKey as keyof typeof labels] || nav.labelKey;
                
                if (nav.children?.length) {
                  return (
                    <DropdownMenu key={nav.labelKey} trigger={
                        <button className="flex items-center gap-2 px-5 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest text-foreground/70 hover:bg-muted hover:text-foreground transition-all outline-none">
                          {nav.Icon && <nav.Icon size={14} className="opacity-70" />}
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
                    className={cn(
                      "relative flex items-center gap-2 px-5 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all duration-300 outline-none",
                      isActive ? "text-primary bg-primary/5" : "text-foreground/70 hover:bg-muted hover:text-foreground"
                    )}
                  >
                    {nav.Icon && <nav.Icon size={14} className={cn("opacity-70", isActive && "opacity-100")} />}
                    {label}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <Link 
              href={getLocalizedHref('/#reservas', currentLang)}
              onClick={() => trackInteraction('Booking_Click')}
              className={cn("hidden sm:flex items-center gap-3 rounded-full bg-foreground px-8 py-3 text-[10px] font-bold uppercase tracking-[0.2em] text-background transition-all hover:bg-primary active:scale-95")}
            >
              <CalendarCheck size={16} strokeWidth={2} />
              {labels.talk || 'BOOK NOW'}
            </Link>

            <div className="flex items-center gap-1 border-l border-border pl-4">
              <div className="hidden md:flex items-center gap-1 pr-2 border-r border-border mr-2">
                <LanguageSwitcher dictionary={dictionary.language_switcher} />
                <ThemeToggle />
              </div>
              
              <button
                onClick={toggleVisitorHud}
                disabled={!hasHydrated}
                className={cn("p-2.5 rounded-full transition-all duration-300 outline-none", hasHydrated && isVisitorHudOpen ? "text-primary bg-primary/5" : "text-muted-foreground hover:bg-muted")}
                aria-label="Alternar telemetría"
              >
                <Globe size={20} strokeWidth={1.5} />
              </button>
            </div>

            <button onClick={toggleMobileMenu} className="lg:hidden p-3 rounded-full hover:bg-muted" aria-label="Abrir menu">
              <Menu size={24} />
            </button>
          </div>
        </div>
      </div>
      <ColorWaveBar position="bottom" variant="hotel" className="h-0.5 opacity-30" />
    </header>
  );
}