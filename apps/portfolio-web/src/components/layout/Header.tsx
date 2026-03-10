// RUTA: apps/portfolio-web/src/components/layout/Header.tsx

/**
 * @file Header.tsx
 * @version 6.0 - Orchestration Layer
 * @description Header semántico, accesible y altamente performante.
 *              Divide responsabilidades entre Brand, Desktop, Mobile e UI.
 * @author Raz Podestá - MetaShark Tech
 */

'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, Globe } from 'lucide-react';
import { cn } from '../../lib/utils/cn';
import { useUIStore } from '../../lib/store/ui.store';
import { LanguageSwitcher } from '../ui/LanguageSwitcher';
import { ThemeToggle } from '../ui/ThemeToggle';
import { ColorWaveBar } from '../ui/ColorWaveBar';
import { mainNavStructure } from '../../lib/nav-links';
import { getLocalizedHref } from '../../lib/utils/link-helpers';
import { i18n, type Locale } from '../../config/i18n.config';
import type { Dictionary } from '../../lib/schemas/dictionary.schema';

// --- Sub-componente: Brand ---
const Brand = ({ currentLang, onClick }: { currentLang: Locale; onClick?: () => void }) => (
  <Link href={`/${currentLang}`} className="group block" onClick={onClick}>
    <h2 className="font-signature text-3xl leading-none text-foreground transition-colors group-hover:text-primary">
      Beach Hotel
    </h2>
    <span className="text-[9px] font-mono tracking-[0.3em] uppercase text-muted-foreground transition-colors group-hover:text-foreground">
      Canasvieiras
    </span>
  </Link>
);

export function Header({ dictionary }: { dictionary: Dictionary }) {
  const { toggleVisitorHud, isVisitorHudOpen, toggleMobileMenu } = useUIStore();
  const pathname = usePathname();
  const currentLang = (pathname?.split('/')[1] as Locale) || i18n.defaultLocale;

  const navLabels = useMemo(() => ({ 
    ...dictionary.header, 
    ...dictionary['nav-links'].nav_links 
  }), [dictionary]);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto px-4">
        <div className="flex h-20 items-center justify-between">
          <Brand currentLang={currentLang} />

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {mainNavStructure.map((nav) => (
              <Link
                key={nav.labelKey}
                href={getLocalizedHref(nav.href ?? '/', currentLang)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wide transition-all",
                  nav.labelKey === 'festival' 
                    ? "bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20" 
                    : "text-foreground/80 hover:bg-muted hover:text-foreground"
                )}
              >
                {nav.Icon && <nav.Icon size={14} />}
                {navLabels[nav.labelKey as keyof typeof navLabels] || nav.labelKey}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="hidden md:flex items-center gap-2 border-l border-border pl-4">
            <LanguageSwitcher dictionary={dictionary.language_switcher} />
            <ThemeToggle />
            <button
              onClick={toggleVisitorHud}
              className={cn("p-2 rounded-full transition-colors", isVisitorHudOpen ? "text-primary" : "text-muted-foreground hover:text-foreground")}
              aria-label="Toggle Status HUD"
            >
              <Globe size={18} />
            </button>
            <Link href={`/${currentLang}/reservas`} className="ml-2 px-6 py-2 rounded-full bg-foreground text-background text-[10px] font-bold uppercase tracking-widest hover:opacity-90">
              {dictionary.header.talk}
            </Link>
          </div>

          {/* Mobile Trigger */}
          <button onClick={toggleMobileMenu} className="md:hidden p-2 text-foreground">
            <Menu size={24} />
          </button>
        </div>
      </div>
      <ColorWaveBar position="bottom" variant="hotel" />
    </header>
  );
}