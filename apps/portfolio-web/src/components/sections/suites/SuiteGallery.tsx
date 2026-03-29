/**
 * @file SuiteGallery.tsx
 * @description Orquestador interactivo del catálogo de activos habitacionales (Suites).
 *              Refactorizado: Resolución de error TS2304 (setSearchQuery), 
 *              optimización de filtrado por GPU, trazabilidad forense Heimdall
 *              y coreografía de entrada adaptativa.
 * @version 6.0 - Build Resilience & UX Performance
 * @author Raz Podestá - MetaShark Tech
 */

'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Search, BedDouble, Info, Sparkles, ArrowRight, X } from 'lucide-react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * IMPORTACIONES DE INFRAESTRUCTRURA
 * @pilar V: Adherencia arquitectónica a fronteras Nx.
 */
import { cn } from '../../../lib/utils/cn';
import type { Dictionary } from '../../../lib/schemas/dictionary.schema';

/**
 * @interface SuiteEntry
 * @description Contrato de datos para una unidad habitacional soberana.
 */
export interface SuiteEntry {
  id: string;
  name: string;
  category: 'Master' | 'Deluxe' | 'Standard';
  imageUrl: string;
  price: string;
}

/**
 * @interface SuiteGalleryProps
 * @pilar III: Props explícitas y tipadas.
 */
interface SuiteGalleryProps {
  /** Listado de suites nivelado desde la fachada del CMS */
  suites: SuiteEntry[];
  /** Diccionario de interfaz validado por contrato SSoT */
  dictionary: Dictionary['suite_gallery'];
  className?: string;
}

/**
 * APARATO: SuiteGallery
 * @description Gestiona la exhibición y búsqueda de activos habitacionales con adaptabilidad atmosférica.
 */
export function SuiteGallery({ suites, dictionary, className }: SuiteGalleryProps) {
  // --- ESTADO SOBERANO (Resolución TS2304) ---
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeCategory, setActiveCategory] = useState<string>('All');

  /**
   * PROTOCOLO HEIMDALL: Telemetría de Interacción
   * @pilar IV: Trazabilidad forense del comportamiento del huésped.
   */
  useEffect(() => {
    if (searchQuery.length > 2) {
      console.log(`[HEIMDALL][UX] Catalog Filter: "${searchQuery}" | Atmosphere: Active`);
    }
  }, [searchQuery]);

  /**
   * MEMOIZACIÓN DE FILTROS (Pilar X)
   */
  const categoryFilters = useMemo(() => [
    { id: 'All', label: dictionary.cat_all },
    { id: 'Master', label: dictionary.cat_master },
    { id: 'Deluxe', label: dictionary.cat_deluxe },
    { id: 'Standard', label: dictionary.cat_standard }
  ], [dictionary]);

  /**
   * MOTOR DE FILTRADO SOBERANO
   * @description Ejecuta el filtrado en memoria con complejidad O(n) y normalización.
   */
  const filteredSuites = useMemo(() => {
    const list = suites || [];
    return list.filter((suite: SuiteEntry) => {
      const matchesSearch = suite.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = activeCategory === 'All' || suite.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, activeCategory, suites]);

  /**
   * ACCIONES DE INTERFAZ
   */
  const clearSearch = useCallback(() => {
    setSearchQuery('');
  }, []);

  if (!dictionary) return null;

  return (
    <div className={cn("space-y-12 transition-colors duration-1000", className)}>
      
      {/* --- 1. CONSOLA DE CONTROL TÁCTICO (Atmosphere Aware) --- */}
      <header 
        className="sticky top-24 z-30 bg-surface/80 backdrop-blur-2xl p-6 rounded-[2.5rem] border border-border shadow-3xl flex flex-col md:flex-row gap-6 items-center justify-between transition-all duration-700"
      >
        {/* Input de Búsqueda de Élite */}
        <div className="relative w-full md:w-96 group">
          <Search 
            className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" 
            size={18} 
          />
          <input
            type="text"
            placeholder={dictionary.search_placeholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-full bg-background/50 border border-border/60 py-4 pl-14 pr-12 text-sm focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all placeholder:text-muted-foreground/40 text-foreground font-sans"
          />
          {searchQuery && (
            <button 
              onClick={clearSearch}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-muted-foreground hover:text-primary transition-colors"
              aria-label="Limpiar búsqueda"
            >
              <X size={16} />
            </button>
          )}
        </div>
        
        {/* Navegación de Categorías (Tab System) */}
        <nav className="flex flex-wrap justify-center gap-2" aria-label="Filtros de categoría">
            {categoryFilters.map((cat) => {
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={cn(
                      "px-6 py-2.5 rounded-full text-[10px] font-bold transition-all border uppercase tracking-widest outline-none",
                      isActive 
                        ? "bg-foreground text-background border-foreground shadow-lg scale-105" 
                        : "bg-background/20 border-border text-muted-foreground hover:border-primary/40 hover:text-primary"
                  )}
                >
                  {cat.label}
                </button>
              );
            })}
        </nav>
      </header>

      {/* --- 2. GRID DE ACTIVOS (Luxury Architecture) --- */}
      <motion.div 
        layout 
        className="relative min-h-[500px]"
      >
        <AnimatePresence mode="popLayout">
          {filteredSuites.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
              {filteredSuites.map((suite: SuiteEntry) => (
                <motion.article 
                  key={suite.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="group relative flex flex-col overflow-hidden rounded-[3rem] border border-border bg-surface/40 hover:border-primary/30 transition-all duration-700 hover:-translate-y-2 shadow-2xl transform-gpu"
                >
                  <div className="relative h-72 w-full overflow-hidden">
                      <Image 
                        src={suite.imageUrl} 
                        alt={suite.name} 
                        fill 
                        className="object-cover transition-transform duration-1000 group-hover:scale-110 brightness-100 [data-theme='dark']:brightness-90"
                        sizes="(max-width: 768px) 100vw, 400px"
                      />
                      <div className="absolute inset-0 bg-linear-to-t from-background/90 via-transparent to-transparent opacity-90 transition-colors duration-1000" />
                      
                      <div className="absolute top-6 left-6">
                        <span className="inline-flex items-center gap-2 rounded-full bg-background/60 backdrop-blur-xl border border-border/40 px-4 py-1.5 text-[8px] font-bold uppercase tracking-widest text-primary">
                          <Sparkles size={10} className="animate-pulse" />
                          {suite.category}
                        </span>
                      </div>
                  </div>

                  <div className="p-10 relative z-10 flex flex-col grow">
                      <div className="flex justify-between items-start mb-6">
                          <h3 className="text-2xl font-display font-bold text-foreground tracking-tight group-hover:text-primary transition-colors duration-500 leading-none">
                            {suite.name}
                          </h3>
                          <div className="text-right">
                            <span className="block text-[8px] font-mono text-muted-foreground uppercase tracking-widest mb-1">
                               {dictionary.label_from}
                            </span>
                            <span className="text-xl font-display font-bold text-foreground">
                               {suite.price}
                            </span>
                          </div>
                      </div>
                      
                      <footer className="mt-auto flex items-center justify-between border-t border-border/40 pt-6">
                          <div className="flex items-center gap-3 text-[9px] uppercase tracking-widest font-bold text-muted-foreground transition-colors group-hover:text-foreground">
                              <BedDouble size={16} className="text-primary" />
                              <span>{suite.category} {dictionary.label_suite_suffix}</span>
                          </div>
                          <ArrowRight size={18} className="text-primary transition-transform group-hover:translate-x-1.5" />
                      </footer>
                  </div>
                </motion.article>
              ))}
            </div>
          ) : (
            /* ESTADO DE RESILIENCIA: Fallback i18n (Pilar VIII) */
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-40 rounded-[3.5rem] border border-dashed border-border bg-surface/10 text-center"
            >
                <div className="relative mb-6">
                   <div className="absolute -inset-6 bg-primary/5 blur-3xl rounded-full" />
                   <Info size={56} className="text-muted-foreground/30 relative" />
                </div>
                <p className="text-foreground font-display text-xl font-bold uppercase tracking-tight mb-2">
                   {dictionary.empty_state_title}
                </p>
                <p className="text-muted-foreground font-mono text-[10px] uppercase tracking-[0.4em] animate-pulse">
                   {dictionary.empty_state_signal}
                </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}