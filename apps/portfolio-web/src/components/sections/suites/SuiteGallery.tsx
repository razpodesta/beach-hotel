/**
 * @file apps/portfolio-web/src/components/sections/suites/SuiteGallery.tsx
 * @description Orquestador interactivo del catálogo de activos habitacionales (Suites).
 *              Refactorizado: Resolución de infracciones de pureza (React 19),
 *              eliminación de variables huérfanas, cumplimiento de fronteras Nx
 *              y telemetría de búsqueda optimizada.
 * @version 8.0 - Linter Pure & Architecture Ready
 * @author Raz Podestá - Staff Engineer, MetaShark Tech
 */

'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Search, BedDouble, Info, Sparkles, ArrowRight, X, LayoutGrid } from 'lucide-react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * IMPORTACIONES DE INFRAESTRUCTRURA (Rutas Relativas - Nx Boundary Compliance)
 * @pilar V: Adherencia Arquitectónica.
 */
import { cn } from '../../../lib/utils/cn';
import { useUIStore } from '../../../lib/store/ui.store';
import type { Dictionary } from '../../../lib/schemas/dictionary.schema';
import type { SuiteEntry } from '../../../lib/schemas/suite_gallery.schema';

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
  reset: '\x1b[0m', 
  cyan: '\x1b[36m', 
  green: '\x1b[32m', 
  yellow: '\x1b[33m', 
  magenta: '\x1b[35m', 
  bold: '\x1b[1m'
};

/**
 * APARATO: SuiteGallery
 * @description Centro de mando para la exhibición y reserva de suites de lujo.
 */
export function SuiteGallery({ suites, dictionary, className }: SuiteGalleryProps) {
  // --- IDENTIDAD Y ESTADO ---
  const { session } = useUIStore();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeCategory, setActiveCategory] = useState<string>('All');

  /**
   * PROTOCOLO HEIMDALL: Telemetría de Montaje e Identidad
   */
  useEffect(() => {
    const traceId = `catalog_hsk_${Date.now().toString(36).toUpperCase()}`;
    console.log(
      `${C.magenta}${C.bold}[DNA][CATALOG]${C.reset} Node Synchronized | ` +
      `Tenant: ${C.cyan}${session?.tenantId || 'MASTER_PERIMETER'}${C.reset} | ` +
      `Items: ${suites.length} | Trace: ${traceId}`
    );
  }, [suites.length, session?.tenantId]);

  /**
   * MEMOIZACIÓN DE FILTROS (Pilar X)
   */
  const categoryFilters = useMemo(() => [
    { id: 'All', label: dictionary.cat_all, icon: LayoutGrid },
    { id: 'Master', label: dictionary.cat_master, icon: Sparkles },
    { id: 'Deluxe', label: dictionary.cat_deluxe, icon: BedDouble },
    { id: 'Standard', label: dictionary.cat_standard, icon: BedDouble }
  ], [dictionary]);

  /**
   * MOTOR DE FILTRADO SOBERANO (Pure Logic)
   * @pilar III: Inferencia de tipos y transformación de datos.
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
   * TELEMETRÍA DE RESULTADOS (Heimdall v2.1)
   * @description Reporta cambios en el clúster de resultados fuera del ciclo de render.
   */
  useEffect(() => {
    if (searchQuery.length > 0 || activeCategory !== 'All') {
      console.log(
        `${C.cyan}   ✓ [FILTER_UPDATE]${C.reset} Query: "${searchQuery}" | ` +
        `Category: ${activeCategory} | Nodes: ${filteredSuites.length}`
      );
    }
  }, [searchQuery, activeCategory, filteredSuites.length]);

  /**
   * HANDLERS DE INTERFAZ
   */
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
          <Search 
            className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" 
            size={18} 
          />
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
        
        <nav 
          className="flex flex-wrap justify-center gap-3 bg-background/20 p-2 rounded-2xl border border-border/40" 
          role="tablist"
        >
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
                      "group flex items-center gap-3 px-6 py-3 rounded-xl text-[10px] font-bold transition-all uppercase tracking-widest outline-none",
                      isActive 
                        ? "bg-foreground text-background shadow-2xl scale-[1.05]" 
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
        className="relative min-h-[500px] transform-gpu"
        aria-live="polite"
      >
        <AnimatePresence mode="popLayout">
          {filteredSuites.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 xl:gap-12">
              {filteredSuites.map((suite) => (
                <motion.article 
                  key={suite.id}
                  layout
                  initial={{ opacity: 0, scale: 0.98, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  className="group relative flex flex-col overflow-hidden rounded-[3.5rem] border border-border bg-surface/40 hover:border-primary/40 transition-all duration-700 hover:-translate-y-2 shadow-2xl"
                >
                  <div className="relative h-80 w-full overflow-hidden bg-background">
                      <Image 
                        src={suite.imageUrl} 
                        alt={suite.name} 
                        fill 
                        className="object-cover transition-transform duration-2000 group-hover:scale-105 brightness-100 [data-theme='dark']:brightness-90"
                        sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 400px"
                      />
                      <div className="absolute inset-0 bg-linear-to-t from-background/90 via-background/20 to-transparent opacity-90" />
                      
                      <div className="absolute top-8 left-8">
                        <span className="inline-flex items-center gap-2.5 rounded-full bg-background/60 backdrop-blur-2xl border border-border/40 px-5 py-2 text-[9px] font-bold uppercase tracking-[0.25em] text-primary shadow-xl">
                          <Sparkles size={12} className="animate-pulse" />
                          {suite.category}
                        </span>
                      </div>
                  </div>

                  <div className="p-12 relative z-10 flex flex-col grow">
                      <div className="flex justify-between items-start mb-8">
                          <h3 className="text-3xl font-display font-bold text-foreground tracking-tighter group-hover:text-primary transition-colors duration-500 leading-none">
                            {suite.name}
                          </h3>
                          <div className="text-right">
                            <span className="block text-[9px] font-mono text-muted-foreground uppercase tracking-widest mb-1.5 font-bold">
                               {dictionary.label_from}
                            </span>
                            <span className="text-2xl font-display font-bold text-foreground bg-primary/5 border border-primary/10 px-4 py-1.5 rounded-xl">
                               {suite.price}
                            </span>
                          </div>
                      </div>
                      
                      <p className="text-muted-foreground text-sm font-sans font-light leading-relaxed mb-10 italic line-clamp-3">
                         {suite.description}
                      </p>
                      
                      <footer className="mt-auto flex items-center justify-between border-t border-border/40 pt-8">
                          <div className="flex items-center gap-4 text-[10px] uppercase tracking-[0.3em] font-bold text-muted-foreground/60 transition-colors group-hover:text-foreground">
                              <BedDouble size={18} className="text-primary opacity-40 group-hover:opacity-100" />
                              <span>{suite.category} {dictionary.label_suite_suffix}</span>
                          </div>
                          <div className="h-10 w-10 rounded-full border border-primary/20 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all shadow-lg active:scale-90">
                             <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" />
                          </div>
                      </footer>
                  </div>
                </motion.article>
              ))}
            </div>
          ) : (
            /* ESTADO DE RESILIENCIA */
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
      <div className="pt-8 opacity-20 hover:opacity-100 transition-opacity duration-1000">
         <span className="font-mono text-[8px] uppercase tracking-[0.6em] text-muted-foreground">
           MetaShark Hospitality Engine • Perimeter: {session?.tenantId || 'Sovereign_Root'}
         </span>
      </div>
    </div>
  );
}