/**
 * @file Header Orquestador - Hospitality & Brand Experience.
 * @version 7.0 - MetaShark Elite Standard
 * @description Orquestador de navegación global. Implementa Hydration Guard para 
 *              estados de Zustand persistentes y arquitectura modular de componentes.
 * @author Raz Podestá - MetaShark Tech
 */

'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, Globe } from 'lucide-react';

// ALIAS SOBERANOS
import { cn } from '@/lib/utils/cn';
import { useUIStore } from '@/lib/store/ui.store';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { ColorWaveBar } from '@/components/ui/ColorWaveBar';
import { mainNavStructure } from '@/lib/nav-links';
import { getLocalizedHref } from '@/lib/utils/link-helpers';
import { i18n, type Locale } from '@/config/i18n.config';
import type { Dictionary } from '@/lib/schemas/dictionary.schema';

/**
 * Componente Atómico: Identidad Visual
 */
const HeaderBrand = ({ currentLang }: { currentLang: Locale }) => (
  <Link href={`/${currentLang}`} className="group block select-none" aria-label="Volver a Inicio">
    <h2 className="font-signature text-3xl leading-none text-foreground transition-all duration-300 group-hover:text-primary">
      Beach Hotel
    </h2>
    <span className="text-[9px] font-mono tracking-[0.4em] uppercase text-muted-foreground transition-colors group-hover:text-foreground block mt-0.5">
      Canasvieiras
    </span>
  </Link>
);

/**
 * Orquestador Principal: Header
 */
export function Header({ dictionary }: { dictionary: Dictionary }) {
  const pathname = usePathname();
  const currentLang = (pathname?.split('/')[1] as Locale) || i18n.defaultLocale;

  // Estado global y guardia de hidratación
  const { 
    isVisitorHudOpen, 
    toggleVisitorHud, 
    toggleMobileMenu, 
    hasHydrated 
  } = useUIStore();

  // Consolidación de etiquetas de navegación
  const labels = useMemo(() => ({ 
    ...dictionary.header, 
    ...dictionary['nav-links'].nav_links 
  }), [dictionary]);

  return (
    <header 
      className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-2xl transition-colors duration-500"
      role="banner"
    >
      <div className="container mx-auto px-6">
        <div className="flex h-20 items-center justify-between">
          
          {/* 1. LADO IZQUIERDO: BRANDING */}
          <HeaderBrand currentLang={currentLang} />

          {/* 2. CENTRO: NAVEGACIÓN DESKTOP */}
          <nav className="hidden lg:flex items-center gap-1" aria-label="Navegación Principal">
            {mainNavStructure.map((nav) => (
              <Link
                key={nav.labelKey}
                href={getLocalizedHref(nav.href ?? '/', currentLang)}
                className={cn(
                  "flex items-center gap-2 px-5 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all duration-300",
                  nav.labelKey === 'festival' 
                    ? "bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 hover:scale-105" 
                    : "text-foreground/70 hover:bg-muted hover:text-foreground"
                )}
              >
                {nav.Icon && <nav.Icon size={14} className="opacity-70" />}
                {labels[nav.labelKey as keyof typeof labels] || nav.labelKey}
              </Link>
            ))}
          </nav>

          {/* 3. LADO DERECHO: ACCIONES & UTILIDADES */}
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-1 border-r border-border pr-3">
              <LanguageSwitcher dictionary={dictionary.language_switcher} />
              <ThemeToggle />
              
              {/* Botón de HUD con protección de hidratación */}
              <button
                onClick={toggleVisitorHud}
                className={cn(
                  "p-2.5 rounded-full transition-all duration-300",
                  hasHydrated && isVisitorHudOpen 
                    ? "text-primary bg-primary/5" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
                aria-label="Alternar Panel de Información del Visitante"
                aria-pressed={isVisitorHudOpen}
              >
                <Globe size={18} strokeWidth={1.5} />
              </button>
            </div>

            <Link 
              href={`/${currentLang}/reservas`} 
              className="hidden sm:flex px-8 py-3 rounded-full bg-foreground text-background text-[10px] font-bold uppercase tracking-widest hover:bg-primary hover:text-primary-foreground transition-all duration-300 shadow-lg shadow-black/5 active:scale-95"
            >
              {dictionary.header.talk}
            </Link>

            {/* TRIGGER MÓVIL */}
            <button 
              onClick={toggleMobileMenu} 
              className="lg:hidden p-3 rounded-full hover:bg-muted text-foreground transition-colors active:scale-90"
              aria-label="Abrir Menú"
            >
              <Menu size={24} />
            </button>
          </div>
        </div>
      </div>
      
      {/* Barra de energía visual decorativa */}
      <ColorWaveBar position="bottom" variant="hotel" className="h-[2px] opacity-50" />
    </header>
  );
}