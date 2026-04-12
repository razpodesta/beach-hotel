/**
 * @file apps/portfolio-web/src/components/sections/suites/SuiteGallery.tsx
 * @description Orquestador interactivo del catálogo de activos habitacionales.
 *              Refactorizado: Sincronización con la Taxonomía Dinámica v6.0.
 *              Erradicación de TS2339 mediante el consumo del mapa 'category_filters'.
 * 
 * @version 10.0 - Dynamic SSoT Sync & Linter Pure
 * @author Staff Engineer - MetaShark Tech
 * 
 * @pilar III: Seguridad de Tipos - Eliminación de propiedades estáticas inexistentes.
 * @pilar VI: i18n Nativa - Las etiquetas de filtrado son 100% Data-Driven.
 * @pilar X: Performance - Filtrado O(n) sobre el inventario de suites.
 * @pilar XII: MEA/UX - Transiciones concurrentes (useTransition) para evitar bloqueos de UI.
 */

'use client';

import React, { useState, useMemo, useCallback, useEffect, useTransition } from 'react';
import { Search, BedDouble, Info, X, LayoutGrid } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/** IMPORTACIONES DE INFRAESTRUCTRURA (Nx Boundary Safe) */
import { cn } from '../../../lib/utils/cn';
import { useUIStore } from '../../../lib/store/ui.store';
import { SuiteCard } from './SuiteCard';
import type { SuiteEntry, SuiteGalleryDictionary } from '../../../lib/schemas/suite_gallery.schema';

/**
 * @interface SuiteGalleryProps
 */
interface SuiteGalleryProps {
  /** Colección de unidades habitacionales sincronizadas con el CMS */
  suites: SuiteEntry[];
  /** Diccionario de interfaz validado por SSoT v6.0 */
  dictionary: SuiteGalleryDictionary;
  className?: string;
}

const C = {
  reset: '\x1b[0m', magenta: '\x1b[35m', cyan: '\x1b[36m', 
  green: '\x1b[32m', yellow: '\x1b[33m', bold: '\x1b[1m'
};

/**
 * APARATO: SuiteGallery
 * @description Centro de mando para la exhibición de suites con filtrado inteligente.
 */
export function SuiteGallery({ suites = [], dictionary, className }: SuiteGalleryProps) {
  const { session } = useUIStore();
  
  // --- ESTADOS DE CONTROL TÁCTICO ---
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [isPending, startTransition] = useTransition();

  /**
   * PROTOCOLO HEIMDALL: Telemetría de Montaje
   */
  useEffect(() => {
    const traceId = `catalog_sync_${Date.now().toString(36).toUpperCase()}`;
    if (process.env.NODE_ENV !== 'production') {
      console.log(
        `${C.magenta}${C.bold}[DNA][CATALOG]${C.reset} Suite Cluster Ready | ` +
        `Items: ${suites.length} | Trace: ${traceId}`
      );
    }
  }, [suites.length]);

  /**
   * MEMOIZACIÓN DE FILTROS DINÁMICOS (Pilar X)
   * @description Genera los botones de filtrado iterando sobre 'category_filters'.
   * Resuelve el error TS2339 al no depender de llaves estáticas.
   */
  const categoryFilters = useMemo(() => {
    return Object.entries(dictionary.category_filters).map(([id, label]) => ({
      id,
      label,
      icon: id === 'All' ? LayoutGrid : BedDouble
    }));
  }, [dictionary.category_filters]);

  /**
   * MOTOR DE FILTRADO SOBERANO
   * @description Procesa la búsqueda semántica y el gating por categoría.
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

  /**
   * ACCIÓN: handleCategorySwitch
   * @description Cambia la categoría activa usando transiciones concurrentes de React 19.
   */
  const handleCategorySwitch = useCallback((categoryId: string) => {
    startTransition(() => {
      setActiveCategory(categoryId);
    });
  }, []);

  const handleClear = useCallback(() => {
    setSearchQuery('');
    setActiveCategory('All');
  }, []);

  if (!dictionary) return null;

  return (
    <div className={cn("space-y-12 transition-colors duration-1000", className)}>
      
      {/* --- 1. CONSOLA DE CONTROL TÁCTICO (Oxygen Glass) --- */}
      <header className="sticky top-24 z-30 bg-surface/80 backdrop-blur-3xl p-6 rounded-[3rem] border border-border shadow-3xl flex flex-col xl:flex-row gap-8 items-center justify-between transition-all duration-700">
        
        {/* Buscador de Inteligencia SSSoT */}
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
        
        {/* Navegación por Categorías Dinámicas */}
        <nav className="flex flex-wrap justify-center gap-3 bg-background/20 p-2 rounded-2xl border border-border/40" role="tablist">
            {categoryFilters.map((cat) => {
              const isActive = activeCategory === cat.id;
              const Icon = cat.icon;
              return (
                <button
                  key={cat.id}
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => handleCategorySwitch(cat.id)}
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
      <motion.div 
        layout 
        className={cn(
          "relative min-h-[500px] transform-gpu transition-all duration-500",
          isPending && "opacity-50 blur-sm"
        )} 
        aria-live="polite"
      >
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
           MetaShark Hospitality Engine • Dynamic Taxonomy Active • Perimeter: {session?.tenantId || 'ROOT'}
         </span>
      </footer>
    </div>
  );
}