/**
 * @file apps/portfolio-web/src/components/sections/suites/SuiteGallery.tsx
 * @description Orquestador interactivo del catálogo de activos habitacionales.
 *              Refactorizado: Atomización de componentes, tipado estricto de categorías
 *              y telemetría perimetral Heimdall v2.5.
 *              Estándar: Oxygen UI v4 & React 19 Pure.
 * @version 9.0 - Atomized Architecture & Type Safe Alliances
 * @author Staff Engineer - MetaShark Tech
 */

'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Search, BedDouble, Info, Sparkles, X, LayoutGrid } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/** IMPORTACIONES DE INFRAESTRUCTRURA (Nx Boundary Safe) */
import { cn } from '../../../lib/utils/cn';
import { useUIStore } from '../../../lib/store/ui.store';
import { SuiteCard } from './SuiteCard';
import type { Dictionary } from '../../../lib/schemas/dictionary.schema';
import type { SuiteEntry } from '../../../lib/schemas/suite_gallery.schema';

/**
 * @type SuiteCategory
 * @description Sincronizado con el esquema Zod de suite_gallery.
 */
type SuiteCategory = 'All' | 'Master' | 'Deluxe' | 'Standard';

/**
 * @interface SuiteGalleryProps
 * @pilar III: Seguridad de Tipos Absoluta.
 */
interface SuiteGalleryProps {
  /** Colección de unidades habitacionales sincronizadas con el CMS */
  suites: SuiteEntry[];
  /** Diccionario de interfaz validado por SSoT */
  dictionary: Dictionary['suite_gallery'];
  className?: string;
}

const C = {
  reset: '\x1b[0m', magenta: '\x1b[35m', cyan: '\x1b[36m', 
  green: '\x1b[32m', yellow: '\x1b[33m', bold: '\x1b[1m'
};

/**
 * APARATO: SuiteGallery
 * @description Centro de mando para la exhibición y reserva de suites de lujo.
 */
export function SuiteGallery({ suites = [], dictionary, className }: SuiteGalleryProps) {
  const { session } = useUIStore();
  
  // --- ESTADOS DE CONTROL TÁCTICO ---
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeCategory, setActiveCategory] = useState<SuiteCategory>('All');

  /**
   * PROTOCOLO HEIMDALL: Telemetría de Montaje
   * @pilar IV: Trazabilidad DNA-Level.
   */
  useEffect(() => {
    const traceId = `catalog_sync_${Date.now().toString(36).toUpperCase()}`;
    if (process.env.NODE_ENV !== 'production') {
      console.log(
        `${C.magenta}${C.bold}[DNA][CATALOG]${C.reset} Suite Cluster Ready | ` +
        `Items: ${suites.length} | Perimeter: ${C.cyan}${session?.tenantId || 'ROOT'}${C.reset} | ` +
        `Trace: ${traceId}`
      );
    }
  }, [suites.length, session?.tenantId]);

  /**
   * MEMOIZACIÓN DE FILTROS (Pilar X)
   */
  const categoryFilters = useMemo(() => [
    { id: 'All' as const, label: dictionary.cat_all, icon: LayoutGrid },
    { id: 'Master' as const, label: dictionary.cat_master, icon: Sparkles },
    { id: 'Deluxe' as const, label: dictionary.cat_deluxe, icon: BedDouble },
    { id: 'Standard' as const, label: dictionary.cat_standard, icon: BedDouble }
  ], [dictionary]);

  /**
   * MOTOR DE FILTRADO SOBERANO
   * @description Procesa la búsqueda semántica y el gating por categoría en una sola pasada.
   */
  const filteredSuites = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    return suites.filter((suite) => {
      const matchesSearch = 
        suite.name.toLowerCase().includes(query) || 
        suite.description.toLowerCase().includes(query);
      const matchesCategory = activeCategory === 'All' || suite.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, activeCategory, suites]);

  const handleClear = useCallback(() => {
    setSearchQuery('');
    setActiveCategory('All');
  }, []);

  if (!dictionary) return null;

  return (
    <div className={cn("space-y-12 transition-colors duration-1000", className)}>
      
      {/* --- 1. CONSOLA DE CONTROL TÁCTICO (Accessible Dashboard) --- */}
      <header 
        className="sticky top-24 z-30 bg-surface/80 backdrop-blur-3xl p-6 rounded-[3rem] border border-border shadow-3xl flex flex-col xl:flex-row gap-8 items-center justify-between transition-all duration-700"
      >
        <div className="relative w-full xl:w-96 group">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={18} />
          <input
            type="text"
            placeholder={dictionary.search_placeholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-full bg-background/50 border border-border/60 py-4.5 pl-14 pr-12 text-sm focus:border-primary/40 focus:ring-4 focus:ring-primary/5 outline-none transition-all placeholder:text-muted-foreground/30 text-foreground font-sans shadow-inner"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-muted-foreground hover:text-primary transition-colors"
              aria-label="Limpiar búsqueda"
            >
              <X size={16} />
            </button>
          )}
        </div>
        
        <nav className="flex flex-wrap justify-center gap-3 bg-background/20 p-2 rounded-2xl border border-border/40" role="tablist">
            {categoryFilters.map((cat) => {
              const isActive = activeCategory === cat.id;
              const Icon = cat.icon;
              return (
                <button
                  key={cat.id}
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActiveCategory(cat.id)}
                  className={cn(
                      "group flex items-center gap-3 px-6 py-3 rounded-xl text-[10px] font-bold transition-all uppercase tracking-widest outline-none whitespace-nowrap",
                      isActive 
                        ? "bg-foreground text-background shadow-lg scale-[1.05]" 
                        : "text-muted-foreground hover:text-foreground hover:bg-surface/50"
                  )}
                >
                  <Icon size={14} className={cn("transition-colors", isActive ? "text-primary" : "group-hover:text-primary")} />
                  {cat.label}
                </button>
              );
            })}
        </nav>

        {(searchQuery || activeCategory !== 'All') && (
           <button 
            onClick={handleClear}
            className="text-[9px] font-mono font-bold text-primary uppercase tracking-[0.2em] hover:underline transition-all outline-none"
           >
             Reset Filters
           </button>
        )}
      </header>

      {/* --- 2. GRID DE ACTIVOS (Aceleración GPU) --- */}
      <motion.div layout className="relative min-h-[500px] transform-gpu" aria-live="polite">
        <AnimatePresence mode="popLayout">
          {filteredSuites.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 xl:gap-12">
              {filteredSuites.map((suite) => (
                <SuiteCard 
                  key={suite.id} 
                  suite={suite} 
                  labelFrom={dictionary.label_from}
                  labelSuffix={dictionary.label_suite_suffix}
                />
              ))}
            </div>
          ) : (
            /* ESTADO DE RESILIENCIA (Pilar VIII) */
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center py-48 rounded-[4rem] border-2 border-dashed border-border bg-surface/20 text-center"
            >
                <div className="relative mb-8">
                   <div className="absolute -inset-8 bg-primary/10 blur-3xl rounded-full" />
                   <div className="h-24 w-24 rounded-full bg-background border border-border flex items-center justify-center text-muted-foreground/20 relative shadow-inner">
                      <Info size={48} strokeWidth={1} />
                   </div>
                </div>
                <h4 className="text-foreground font-display text-2xl font-bold uppercase tracking-tight mb-4">
                   {dictionary.empty_state_title}
                </h4>
                <p className="text-muted-foreground font-mono text-[9px] uppercase tracking-[0.5em] animate-pulse">
                   {dictionary.empty_state_signal}
                </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* FOOTER TELEMETRÍA */}
      <footer className="pt-8 opacity-20 hover:opacity-100 transition-opacity duration-1000 border-t border-border/20">
         <span className="font-mono text-[8px] uppercase tracking-[0.6em] text-muted-foreground">
           MetaShark Hospitality Engine • Suite Signal: NOMINAL • Perimeter: {session?.tenantId || 'ROOT'}
         </span>
      </footer>
    </div>
  );
}