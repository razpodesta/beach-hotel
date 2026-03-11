/**
 * @file apps/portfolio-web/src/components/layout/Header.tsx
 * @description Orquestador soberano de la cabecera (Lego System). 
 *              Gestiona la identidad visual, navegación localized y el estado 
 *              global de la UI con protección de hidratación.
 * @version 10.0
 * @author Raz Podestá - MetaShark Tech
 */

'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, Globe } from 'lucide-react';

/**
 * IMPORTACIONES NIVELADAS (Rutas relativas para cumplimiento arquitectónico Nx)
 */
import { cn } from '../../lib/utils/cn';
import { useUIStore } from '../../lib/store/ui.store';
import { LanguageSwitcher } from '../ui/LanguageSwitcher';
import { ThemeToggle } from '../ui/ThemeToggle';
import { ColorWaveBar } from '../ui/ColorWaveBar';
import { mainNavStructure } from '../../lib/nav-links';
import { getLocalizedHref } from '../../lib/utils/link-helpers';
import { i18n, type Locale, isValidLocale } from '../../config/i18n.config';
import type { Dictionary } from '../../lib/schemas/dictionary.schema';

/**
 * COMPONENTE ATÓMICO: HeaderBrand
 * Representa la identidad visual boutique del hotel.
 */
const HeaderBrand = ({ currentLang }: { currentLang: Locale }) => (
  <Link 
    href={`/${currentLang}`} 
    className="group block select-none outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg transition-all" 
    aria-label="Volver a la recepción"
  >
    <h2 className="font-display text-2xl sm:text-3xl leading-none text-foreground transition-all duration-300 group-hover:text-primary">
      Beach Hotel
    </h2>
    {/* CORRECCIÓN SINTÁCTICA: Se cierra correctamente la etiqueta span */}
    <span className="text-[9px] font-mono tracking-[0.4em] uppercase text-muted-foreground transition-colors group-hover:text-foreground block mt-0.5">
      Canasvieiras
    </span>
  </Link>
);

/**
 * APARATO VISUAL: Header
 * Orquestador principal de la experiencia de navegación del ecosistema.
 */
export function Header({ dictionary }: { dictionary: Dictionary }) {
  const pathname = usePathname();
  
  /**
   * RESOLUCIÓN DE IDIOMA SOBERANA:
   * Extrae el locale de la ruta y valida contra la configuración centralizada.
   */
  const currentLang = useMemo(() => {
    const segments = pathname?.split('/') ?? [];
    const candidate = segments[1];
    return isValidLocale(candidate) ? candidate : i18n.defaultLocale;
  }, [pathname]);

  const { 
    isVisitorHudOpen, 
    toggleVisitorHud, 
    toggleMobileMenu, 
    hasHydrated 
  } = useUIStore();

  /**
   * CONSOLIDACIÓN DE ETIQUETAS:
   * Une los fragmentos de diccionario requeridos por la interfaz de navegación.
   */
  const labels = useMemo(() => ({ 
    ...dictionary.header, 
    ...dictionary['nav-links'].nav_links 
  }), [dictionary]);

  return (
    <header 
      className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-2xl transition-all duration-500"
      role="banner"
    >
      <div className="container mx-auto px-6">
        <div className="flex h-20 items-center justify-between">
          
          {/* 1. LADO IZQUIERDO: IDENTIDAD VISUAL */}
          <HeaderBrand currentLang={currentLang} />

          {/* 2. CENTRO: NAVEGACIÓN DESKTOP (Optimized Map) */}
          <nav className="hidden lg:flex items-center gap-1" aria-label="Navegación Principal">
            {mainNavStructure.map((nav) => {
              const localizedHref = getLocalizedHref(nav.href ?? '/', currentLang);
              const isActive = pathname === localizedHref;

              return (
                <Link
                  key={nav.labelKey}
                  href={localizedHref}
                  aria-current={isActive ? 'page' : undefined}
                  className={cn(
                    "flex items-center gap-2 px-5 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all duration-300 outline-none focus-visible:bg-muted",
                    isActive ? "text-primary bg-primary/5" : "text-foreground/70 hover:bg-muted hover:text-foreground",
                    nav.labelKey === 'festival' && "bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 hover:scale-105"
                  )}
                >
                  {nav.Icon && <nav.Icon size={14} className={cn("opacity-70", isActive && "opacity-100")} />}
                  {labels[nav.labelKey as keyof typeof labels] || nav.labelKey}
                </Link>
              );
            })}
          </nav>

          {/* 3. LADO DERECHO: ACCIONES & UTILIDADES */}
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-1 border-r border-border pr-3">
              <LanguageSwitcher dictionary={dictionary.language_switcher} />
              <ThemeToggle />
              
              {/* Gatillo del Visitor HUD (Heimdall Guard para persistencia) */}
              <button
                onClick={toggleVisitorHud}
                className={cn(
                  "p-2.5 rounded-full transition-all duration-300 outline-none focus-visible:ring-2 focus-visible:ring-primary",
                  hasHydrated && isVisitorHudOpen 
                    ? "text-primary bg-primary/5" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
                aria-label="Información de clima y ubicación"
                aria-pressed={isVisitorHudOpen}
              >
                <Globe size={18} strokeWidth={1.5} />
              </button>
            </div>

            {/* BOTÓN DE RESERVA (Main CTA) */}
            <Link 
              href={`/${currentLang}/reservas`} 
              className="hidden sm:flex px-8 py-3 rounded-full bg-foreground text-background text-[10px] font-bold uppercase tracking-widest hover:bg-primary hover:text-primary-foreground transition-all duration-300 shadow-xl shadow-black/5 active:scale-95"
            >
              {dictionary.header.talk}
            </Link>

            {/* TRIGGER MÓVIL (Touch Optimized) */}
            <button 
              onClick={toggleMobileMenu} 
              className="lg:hidden p-3 rounded-full hover:bg-muted text-foreground transition-colors active:scale-90 outline-none focus-visible:ring-2 focus-visible:ring-primary"
              aria-label="Abrir menú"
            >
              <Menu size={24} />
            </button>
          </div>
        </div>
      </div>
      
      {/* 
         BARRA DE ACENTO: 
         Implementa h-0.5 canónico para consistencia en el motor de estilos.
      */}
      <ColorWaveBar position="bottom" variant="hotel" className="h-0.5 opacity-50" />
    </header>
  );
}