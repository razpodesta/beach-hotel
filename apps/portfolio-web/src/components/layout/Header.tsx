/**
 * @file Header.tsx
 * @version 27.0 - Production Build Fix
 * @description Header con navegación naturalizada y cierre sintáctico corregido.
 */

'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ChevronDown, Globe, LogIn, Hotel, Sparkles } from 'lucide-react';
import { useUIStore } from '../../lib/store/ui.store';
import { DropdownMenu } from '../ui/DropdownMenu';
import { LanguageSwitcher } from '../ui/LanguageSwitcher';
import { ThemeToggle } from '../ui/ThemeToggle';
import { ColorWaveBar } from '../ui/ColorWaveBar';
import { mainNavStructure } from '../../lib/nav-links';
import { getLocalizedHref } from '../../lib/utils/link-helpers';
import { i18n, type Locale } from '../../config/i18n.config';
import type { Dictionary } from '../../lib/schemas/dictionary.schema';

type BrandProps = {
  onLinkClick?: () => void;
  currentLang: Locale;
};

const Brand = ({ onLinkClick, currentLang }: BrandProps) => (
  <Link href={`/${currentLang}`} className="block group" onClick={onLinkClick}>
    <div className="text-left">
      <h1 className="font-signature text-3xl md:text-4xl text-white leading-none pt-1 group-hover:text-purple-300 transition-colors">
        Beach Hotel
      </h1>
      <span className="text-[9px] font-mono tracking-[0.3em] uppercase text-zinc-500 group-hover:text-zinc-300 transition-colors">
        Canasvieiras
      </span>
    </div>
  </Link>
);

export function Header({ dictionary }: { dictionary: Dictionary }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isVisitorHudOpen = useUIStore((state) => state.isVisitorHudOpen);
  const toggleVisitorHud = useUIStore((state) => state.toggleVisitorHud);

  const pathname = usePathname();
  const currentLang = (pathname?.split('/')[1] as Locale) || i18n.defaultLocale;

  const navLabels = useMemo(() => {
    return { ...dictionary.header, ...dictionary['nav-links'].nav_links };
  }, [dictionary]);

  return (
    <header className="sticky top-0 z-50 bg-[#050505]/85 backdrop-blur-xl border-b border-white/5">
      <div className="container px-4 mx-auto">
        <div className="items-center justify-between hidden h-20 md:flex gap-6">
          <div className="shrink-0">
            <Brand currentLang={currentLang} />
          </div>

          <nav className="flex items-center gap-1">
            {mainNavStructure.map((navGroup) => {
              const isFestival = navGroup.labelKey === 'festival';
              const label = navLabels[navGroup.labelKey as keyof typeof navLabels] || navGroup.labelKey;

              return (
                <Link
                  key={navGroup.labelKey}
                  href={navGroup.href ? getLocalizedHref(navGroup.href, currentLang) : '#'}
                  className={`
                    flex items-center gap-2 px-5 py-2 text-xs font-bold rounded-full transition-all duration-300 uppercase tracking-wide
                    ${isFestival 
                      ? 'bg-purple-900/30 border border-purple-500/30 text-purple-200 hover:bg-purple-600 hover:text-white hover:shadow-[0_0_15px_rgba(147,51,234,0.4)]' 
                      : 'text-white hover:bg-white/10'
                    }
                  `}
                >
                  {navGroup.Icon && <navGroup.Icon size={14} />}
                  {label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-4 border-l border-white/10 pl-6 h-8">
            <LanguageSwitcher dictionary={dictionary.language_switcher} />
            <ThemeToggle />

            <button
              onClick={toggleVisitorHud}
              className={`flex items-center justify-center w-8 h-8 rounded-full transition-colors ${isVisitorHudOpen ? 'bg-white text-black' : 'text-zinc-400 hover:text-white hover:bg-white/10'}`}
              title="Global Status"
            >
              <Globe size={16} />
            </button>

            <Link
              href={`/${currentLang}/reservas`}
              className="ml-2 flex items-center gap-2 px-6 py-2 rounded-full bg-white text-[10px] font-bold text-black hover:bg-zinc-200 transition-colors uppercase tracking-widest"
            >
              {dictionary.header.talk}
            </Link>
          </div>
        </div>

        {/* Mobile Header */}
        <div className="flex items-center justify-between h-16 md:hidden">
          <Brand currentLang={currentLang} />
          <div className="flex items-center gap-2">
             <button onClick={toggleVisitorHud} className="p-2 text-zinc-400"><Globe size={20} /></button>
             <button onClick={() => setIsMenuOpen(true)} className="p-2 text-white">
                <Menu size={24} />
             </button>
          </div>
        </div>
      </div>

      <ColorWaveBar position="bottom" />

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            className="fixed inset-0 z-60 bg-[#050505] p-6 flex flex-col"
          >
            <div className="flex justify-between items-center mb-12">
              <Brand currentLang={currentLang} />
              <button onClick={() => setIsMenuOpen(false)} className="p-2 text-zinc-400">
                <X size={32} />
              </button>
            </div>

            <nav className="flex flex-col gap-8 text-2xl font-bold text-white">
              {mainNavStructure.map((item) => (
                <Link
                  key={item.labelKey}
                  href={getLocalizedHref(item.href || '', currentLang)}
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-4 hover:text-purple-400 transition-colors uppercase tracking-tighter"
                >
                  {item.Icon && <item.Icon size={24} />}
                  {navLabels[item.labelKey as keyof typeof navLabels] || item.labelKey}
                </Link>
              ))}
            </nav>

            <div className="mt-auto pt-10 border-t border-white/5 flex justify-center gap-6">
               <LanguageSwitcher dictionary={dictionary.language_switcher} />
               <ThemeToggle />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}