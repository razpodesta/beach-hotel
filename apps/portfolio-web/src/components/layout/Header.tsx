// RUTA: apps/portfolio-web/src/components/layout/Header.tsx
// VERSIÓN: 26.0 - Strict Typing & Lint Free
// DESCRIPCIÓN: Header con tipado fuerte (Zero 'any').
//              - Se eliminan variables no usadas.
//              - Se definen interfaces para sub-componentes.

'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ChevronDown, Globe, LogIn } from 'lucide-react';
import type { Dictionary } from '../../lib/schemas/dictionary.schema';
import { useUIStore } from '../../lib/store/ui.store';
import { DropdownMenu } from '../ui/DropdownMenu';
import { LanguageSwitcher } from '../ui/LanguageSwitcher';
import { ThemeToggle } from '../ui/ThemeToggle';
import { NestedDropdownContent } from '../ui/NestedDropdownContent';
import { ColorWaveBar } from '../ui/ColorWaveBar';
import { mainNavStructure, type NavItem } from '../../lib/nav-links';
import { getLocalizedHref } from '../../lib/utils/link-helpers';
import { i18n, type Locale } from '../../config/i18n.config';

// --- TIPOS LOCALES ---

type BrandProps = {
  // 'isMobile' eliminado por falta de uso (Clean Code)
  onLinkClick?: () => void;
  currentLang: Locale;
  dictionary: Dictionary['header'];
};

type SocialMenuItemProps = {
  // Extraemos el tipo específico de ítem social de la unión NavItem
  item: Extract<NavItem, { isSocial: true }>;
};

// --- SUB-COMPONENTES ---

const Brand = ({ onLinkClick, currentLang }: BrandProps) => (
    <Link href={`/${currentLang}`} className="block group" onClick={onLinkClick}>
        <div className="text-left">
          <h1 className="font-signature text-3xl md:text-4xl text-white leading-none pt-1 group-hover:text-purple-300 transition-colors">
            Raz Podestá
          </h1>
        </div>
    </Link>
);

const SimpleMenuItem = ({ item, label, currentLang }: { item: NavItem; label: string; currentLang: Locale }) => {
  if (!('href' in item) || !item.href) return null;
  const finalHref = getLocalizedHref(item.href, currentLang);
  return (
    <Link
      href={finalHref}
      target={item.href.startsWith('http') ? '_blank' : undefined}
      className="flex items-center gap-3 p-2 text-sm rounded-md text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors"
    >
      {item.Icon && <item.Icon size={16} />}
      {label}
    </Link>
  );
};

const SocialMenuItem = ({ item }: SocialMenuItemProps) => (
  <>
    <div className="h-px my-2 bg-zinc-800" />
    <div className="flex items-center justify-center gap-2 p-2">
      {item.links.map((link) => (
        <Link
          key={link.label}
          href={link.href}
          target="_blank"
          aria-label={link.label}
          className="p-2 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
        >
          <link.icon size={18} />
        </Link>
      ))}
    </div>
  </>
);

type HeaderProps = { dictionary: Dictionary; };

// --- COMPONENTE PRINCIPAL ---

export function Header({ dictionary }: HeaderProps) {
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
            <Brand
              dictionary={dictionary.header}
              currentLang={currentLang}
            />
          </div>

          <nav className="flex items-center gap-1">
            {mainNavStructure.map((navGroup) => {
              const isContactPill = navGroup.labelKey === 'contacto';

              return (
                <DropdownMenu key={navGroup.labelKey} trigger={
                  <button
                    className={`
                      flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-full transition-all duration-300 uppercase tracking-wide
                      ${isContactPill
                        ? 'bg-purple-900/30 border border-purple-500/30 text-purple-200 hover:bg-purple-600 hover:border-purple-500 hover:text-white hover:shadow-[0_0_15px_rgba(147,51,234,0.3)]'
                        : 'text-white hover:bg-white/10'
                      }
                    `}
                  >
                    {navGroup.Icon && <navGroup.Icon size={14} className={isContactPill ? 'text-purple-300 group-hover:text-white' : ''} />}
                    {navLabels[navGroup.labelKey as keyof typeof navLabels]}
                    {!isContactPill && <ChevronDown size={12} className="opacity-50" />}
                  </button>
                }>
                  {navGroup.isNested ? (
                    <NestedDropdownContent links={navGroup.children as NavItem[]} dictionary={dictionary['nav-links'].nav_links} />
                  ) : (
                    <div className="w-48 p-2 space-y-1">
                      {navGroup.children?.map((item) => {
                        if ('isSeparator' in item) return <div key="sep" className="h-px my-2 bg-zinc-800" />;
                        // TypeScript ahora infiere correctamente que item es SocialMenuItemProps['item'] aquí
                        if ('isSocial' in item) return <SocialMenuItem key="soc" item={item} />;

                        const label = navLabels[item.labelKey as keyof typeof navLabels];
                        return <SimpleMenuItem key={label} item={item} label={label} currentLang={currentLang} />;
                      })}
                    </div>
                  )}
                </DropdownMenu>
              );
            })}
          </nav>

          <div className="flex items-center gap-4 border-l border-white/10 pl-6 h-8">
             <LanguageSwitcher dictionary={dictionary.language_switcher} />
             <ThemeToggle />

             <button
               onClick={toggleVisitorHud}
               className={`flex items-center justify-center w-8 h-8 rounded-full transition-colors ${isVisitorHudOpen ? 'bg-white text-black' : 'text-zinc-400 hover:text-white hover:bg-white/10'}`}
             >
               <Globe size={16} />
             </button>

             {/* TEXT LINK SIMPLIFICADO "JOIN" */}
             <Link
               href={`/${currentLang}/login`}
               className="ml-2 flex items-center gap-2 text-[10px] font-bold text-white hover:text-purple-400 transition-colors uppercase tracking-[0.2em]"
             >
                {dictionary.header.talk}
                <LogIn size={14} />
              </Link>
          </div>
        </div>

        {/* Mobile Header Simplificado */}
        <div className="flex items-center justify-between h-16 md:hidden">
          <Brand
            onLinkClick={() => setIsMenuOpen(false)}
            dictionary={dictionary.header}
            currentLang={currentLang}
          />
          <button onClick={() => setIsMenuOpen(true)} className="p-2 text-white">
            <Menu size={24} />
          </button>
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
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-60 bg-[#050505] p-6 flex flex-col"
          >
             <div className="flex justify-between items-center mb-8">
                <span className="font-signature text-3xl text-white">Raz Podestá</span>
                <button onClick={() => setIsMenuOpen(false)} className="p-2 text-zinc-400 hover:text-white"><X size={24} /></button>
             </div>

             <nav className="flex flex-col gap-6 text-xl font-bold text-white">
                {mainNavStructure.map(item => (
                   <Link
                     key={item.labelKey}
                     href={('href' in item) ? getLocalizedHref(item.href, currentLang) : '#'}
                     onClick={() => setIsMenuOpen(false)}
                     className="flex items-center gap-4 hover:text-purple-400"
                   >
                      {item.Icon && <item.Icon size={20} />}
                      {navLabels[item.labelKey as keyof typeof navLabels]}
                   </Link>
                ))}
             </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
