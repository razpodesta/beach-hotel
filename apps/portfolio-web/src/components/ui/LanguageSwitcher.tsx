/**
 * @file LanguageSwitcher.tsx
 * @description Globalization Hub de Alta Fidelidad (The World Engine).
 *              Orquesta el Códice de 127+ idiomas con filtrado dinámico,
 *              persistencia soberana y estética Takeover.
 * @version 7.0 - Elite Globalization Standard
 * @author Raz Podestá - MetaShark Tech
 */

'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { setCookie } from 'cookies-next';
import { 
  Globe, 
  Search, 
  X, 
  Check, 
  Sparkles,
  Navigation2
} from 'lucide-react';

/**
 * IMPORTACIONES DE INFRAESTRUCTRURA
 * @pilar V: Adherencia arquitectónica.
 */
import { cn } from '../../lib/utils/cn';
import { i18n, type Locale } from '../../config/i18n.config';
import { LANGUAGES_CODEX, type LanguageEntry, type RegionGroup } from '../../lib/config/languages-codex';
import { Flag } from './Flag';
import type { LanguageSwitcherDictionary } from '../../lib/schemas/language_switcher.schema';

interface LanguageSwitcherProps {
  /** Diccionario validado por contrato v9.0 */
  dictionary: LanguageSwitcherDictionary;
  className?: string;
}

/**
 * APARATO: LanguageSwitcher (Globalization Hub)
 */
export function LanguageSwitcher({ dictionary, className }: LanguageSwitcherProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const currentLocale = (pathname?.split('/')[1] as Locale) || i18n.defaultLocale;

  /**
   * ACCIÓN SOBERANA: handleLanguageChange
   * @description Sincroniza la preferencia y redirige el tráfico.
   */
  const handleLanguageChange = useCallback((newLocale: string, isImplemented: boolean) => {
    if (!isImplemented) return;
    if (newLocale === currentLocale) {
      setIsOpen(false);
      return;
    }

    console.group(`[HEIMDALL][I18N] Region Switch`);
    console.log(`Target_Locale: ${newLocale}`);
    
    setCookie(i18n.cookieName, newLocale, { 
      maxAge: 31536000, 
      path: '/',
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production'
    });

    const segments = pathname.split('/');
    segments[1] = newLocale;
    
    setIsOpen(false);
    router.push(segments.join('/'));
    console.groupEnd();
  }, [currentLocale, pathname, router]);

  /**
   * MOTOR DE FILTRADO (High Performance)
   * @pilar X: Optimización de búsqueda sobre el Códice.
   */
  const filteredCodex = useMemo(() => {
    if (!searchQuery) return LANGUAGES_CODEX;
    
    const query = searchQuery.toLowerCase().trim();
    return LANGUAGES_CODEX.map(group => ({
      ...group,
      languages: group.languages.filter(lang => 
        lang.nativeName.toLowerCase().includes(query) ||
        lang.intName.toLowerCase().includes(query) ||
        lang.regionName.toLowerCase().includes(query) ||
        lang.intRegionName.toLowerCase().includes(query) ||
        lang.code.toLowerCase().includes(query)
      )
    })).filter(group => group.languages.length > 0);
  }, [searchQuery]);

  /**
   * SUB-APARATO: LanguageCard
   */
  const LanguageCard = ({ lang }: { lang: LanguageEntry }) => {
    const isSelected = currentLocale === lang.code;
    
    return (
      <button
        onClick={() => handleLanguageChange(lang.code, lang.isImplemented)}
        disabled={!lang.isImplemented && !isSelected}
        className={cn(
          "group relative flex items-center gap-4 p-4 rounded-2xl border transition-all duration-500",
          "text-left outline-none focus-visible:ring-2 focus-visible:ring-primary",
          lang.isImplemented 
            ? "bg-white/5 border-white/5 hover:border-primary/40 hover:bg-white/10" 
            : "bg-black/20 border-white/2 opacity-40 cursor-not-allowed",
          isSelected && "bg-primary/10 border-primary/30 opacity-100"
        )}
      >
        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg shadow-2xl">
          <Flag countryCode={lang.code.split('-')[1] || 'UN'} className="h-full w-full object-cover" />
          {!lang.isImplemented && !isSelected && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px] flex items-center justify-center">
              <Sparkles size={12} className="text-zinc-500" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-white truncate group-hover:text-primary transition-colors">
            {lang.nativeName}
          </p>
          <p className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 truncate">
            {lang.regionName}
          </p>
        </div>

        {isSelected && (
          <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center shadow-lg animate-in zoom-in duration-300">
            <Check size={14} className="text-white" strokeWidth={3} />
          </div>
        )}
      </button>
    );
  };

  return (
    <>
      {/* 1. DISPARADOR (Trigger) */}
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          "flex items-center justify-center p-2.5 rounded-full transition-all duration-500 group",
          "bg-surface border border-border hover:border-primary/40 hover:bg-primary/5 active:scale-95",
          className
        )}
        aria-label={dictionary.label}
      >
        <Globe size={18} className="text-zinc-400 group-hover:text-primary transition-colors" />
      </button>

      {/* 2. EL HUB GLOBAL (Takeover Modal) */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-100 flex items-center justify-center p-4 sm:p-6 lg:p-8">
            {/* Backdrop Cinemático */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-background/80 backdrop-blur-2xl"
            />

            {/* Contenedor del Hub */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative w-full max-w-6xl h-[85vh] bg-zinc-950/90 rounded-[3rem] border border-white/10 shadow-3xl overflow-hidden flex flex-col"
            >
              {/* HEADER DEL HUB */}
              <header className="p-8 md:p-12 border-b border-white/5 bg-white/2">
                <div className="flex items-center justify-between mb-10">
                  <div>
                    <span className="inline-flex items-center gap-2 text-[10px] font-bold text-primary uppercase tracking-[0.5em] mb-3">
                      <Navigation2 size={12} fill="currentColor" /> {dictionary.label_regions}
                    </span>
                    <h2 className="font-display text-4xl md:text-5xl font-bold text-white tracking-tighter">
                      Globalization Hub
                    </h2>
                  </div>
                  <button 
                    onClick={() => setIsOpen(false)}
                    className="p-4 rounded-full bg-white/5 border border-white/10 text-white hover:bg-white hover:text-black transition-all active:scale-90"
                  >
                    <X size={24} />
                  </button>
                </div>

                {/* Buscador de Inteligencia */}
                <div className="relative group">
                  <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-primary transition-colors" size={20} />
                  <input 
                    type="text"
                    placeholder={dictionary.label_search}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-2xl py-5 pl-16 pr-8 text-white placeholder:text-zinc-600 outline-none focus:border-primary/50 focus:bg-primary/5 transition-all font-sans"
                  />
                </div>
              </header>

              {/* CUERPO DEL HUB (Scrollable) */}
              <div className="flex-1 overflow-y-auto p-8 md:p-12 custom-scrollbar">
                <div className="space-y-20">
                  {filteredCodex.map((region: RegionGroup) => (
                    <section key={region.region}>
                      <header className="flex items-center gap-6 mb-8">
                        <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.5em] whitespace-nowrap">
                          {region.region}
                        </h3>
                        <div className="h-px w-full bg-linear-to-r from-white/5 to-transparent" />
                      </header>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {region.languages.map((lang: LanguageEntry) => (
                          <LanguageCard key={lang.code} lang={lang} />
                        ))}
                      </div>
                    </section>
                  ))}
                </div>
              </div>

              {/* FOOTER DEL HUB */}
              <footer className="p-8 md:p-10 border-t border-white/5 bg-black/40 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-8">
                  <div className="flex items-center gap-3">
                     <div className="h-2 w-2 rounded-full bg-primary shadow-[0_0_8px_var(--color-primary)]" />
                     <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">{dictionary.label_implemented}</span>
                  </div>
                  <div className="flex items-center gap-3">
                     <div className="h-2 w-2 rounded-full bg-zinc-800" />
                     <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">{dictionary.label_future}</span>
                  </div>
                </div>
                <p className="text-[9px] font-mono text-zinc-700 uppercase tracking-[0.3em]">
                   MetaShark Sovereign Infrastructure • Globalization Node 3.0
                </p>
              </footer>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}