/**
 * @file SuiteGallery.tsx
 * @description Galería interactiva y filtrable de suites de lujo. 
 *              Refactorizado: Sincronización total con el Manifiesto Day-First, 
 *              erradicación de hardcoding, trazabilidad Heimdall y clases canónicas.
 * @version 5.0 - Atmosphere Master & Zero Hardcode
 * @author Raz Podestá - MetaShark Tech
 */

'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Search, BedDouble, Info, Sparkles, ArrowRight } from 'lucide-react';
import Image from 'next/image';

/**
 * IMPORTACIONES DE INFRAESTRUCTRURA
 * @pilar V: Adherencia arquitectónica.
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
 */
interface SuiteGalleryProps {
  /** Listado de suites nivelado desde el CMS */
  suites: SuiteEntry[];
  /** 
   * @pilar III: Seguridad de Tipos. 
   * Mapeo directo al contrato nivelado. 
   */
  dictionary: Dictionary['suite_gallery'];
  className?: string;
}

/**
 * APARATO: SuiteGallery
 * @description Orquesta el catálogo de activos inmobiliarios adaptándose a la atmósfera global.
 */
export function SuiteGallery({ suites, dictionary, className }: SuiteGalleryProps) {
  const [search] = useState<string>('');
  const [activeCategory, setActiveCategory] = useState<string>('All');

  /**
   * PROTOCOLO HEIMDALL: Telemetría de Filtrado
   * @pilar IV: Registra el comportamiento del huésped en el catálogo.
   */
  const trackFilter = useCallback((category: string) => {
    console.group(`[HEIMDALL][UX] Catalog Filter: ${category}`);
    console.log(`Search_Query: "${search}"`);
    console.groupEnd();
  }, [search]);

  useEffect(() => {
    if (activeCategory !== 'All') trackFilter(activeCategory);
  }, [activeCategory, trackFilter]);

  /**
   * MEMOIZACIÓN DE CATEGORÍAS (Pilar X)
   */
  const categoryFilters = useMemo(() => [
    { id: 'All', label: dictionary.cat_all },
    { id: 'Master', label: dictionary.cat_master },
    { id: 'Deluxe', label: dictionary.cat_deluxe },
    { id: 'Standard', label: dictionary.cat_standard }
  ], [dictionary]);

  /**
   * LÓGICA DE FILTRADO SOBERANA (High-Performance)
   */
  const filteredSuites = useMemo(() => {
    const list = suites || [];
    return list.filter((suite: SuiteEntry) => {
      const matchesSearch = suite.name.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = activeCategory === 'All' || suite.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [search, activeCategory, suites]);

  if (!dictionary) return null;

  return (
    <div className={cn("space-y-16 transition-colors duration-1000", className)}>
      
      {/* 1. BARRA DE CONTROL TÁCTICO (Atmosphere Aware) */}
      <header 
        className="sticky top-24 z-30 bg-surface/80 backdrop-blur-2xl p-6 rounded-4xl border border-border shadow-3xl flex flex-col md:flex-row gap-8 items-center justify-between transition-all duration-700"
      >
        <div className="relative w-full md:w-96 group">
          <Search 
            className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" 
            size={18} 
          />
          <input
            type="text"
            placeholder={dictionary.search_placeholder}
            value={search}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-full bg-background/50 border border-border/60 py-4 pl-16 pr-8 text-sm focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all placeholder:text-muted-foreground/50 text-foreground font-sans shadow-inner"
          />
        </div>
        
        <nav className="flex flex-wrap justify-center gap-3" aria-label="Filtros de categoría">
            {categoryFilters.map((cat) => {
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={cn(
                      "px-8 py-2.5 rounded-full text-[10px] font-bold transition-all border uppercase tracking-[0.25em] outline-none",
                      isActive 
                        ? "bg-foreground text-background border-foreground shadow-xl scale-105" 
                        : "bg-background/20 border-border text-muted-foreground hover:border-primary/40 hover:text-primary"
                  )}
                >
                  {cat.label}
                </button>
              );
            })}
        </nav>
      </header>

      {/* 2. GRID DE ACTIVOS (Luxury Architecture) */}
      <div className="relative min-h-[400px]">
        {filteredSuites.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 md:gap-12">
            {filteredSuites.map((suite: SuiteEntry) => (
              <article 
                key={suite.id} 
                className="group relative rounded-5xl overflow-hidden border border-border bg-surface/40 transition-all duration-1000 hover:border-primary/40 hover:-translate-y-3 hover:shadow-primary/10 shadow-4xl transform-gpu"
              >
                <div className="relative h-80 w-full overflow-hidden">
                    <Image 
                      src={suite.imageUrl} 
                      alt={suite.name} 
                      fill 
                      className="object-cover transition-transform duration-2000 ease-out group-hover:scale-110 brightness-100 [data-theme='dark']:brightness-[0.8]"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    
                    {/* Atmosphere Overlay adaptable al fondo del tema */}
                    <div className="absolute inset-0 bg-linear-to-t from-background via-transparent to-transparent opacity-90 transition-colors duration-1000" />
                    
                    {/* Badge de Categoría (MEA/UX) */}
                    <div className="absolute top-8 left-8">
                      <span className="inline-flex items-center gap-3 rounded-full bg-background/60 backdrop-blur-xl border border-border/40 px-5 py-2 text-[9px] font-bold uppercase tracking-widest text-primary shadow-2xl">
                        <Sparkles size={12} className="animate-pulse" />
                        {suite.category}
                      </span>
                    </div>
                </div>

                <div className="p-12 relative z-10">
                    <div className="flex justify-between items-start mb-8">
                        <h3 className="text-3xl font-display font-bold text-foreground tracking-tighter group-hover:text-primary transition-colors duration-500">
                          {suite.name}
                        </h3>
                        <div className="text-right">
                          <span className="block text-[9px] font-mono text-muted-foreground uppercase tracking-widest mb-1">
                             {dictionary.label_from || "Starting at"}
                          </span>
                          <span className="text-2xl font-display font-bold text-foreground">
                             {suite.price}
                          </span>
                        </div>
                    </div>
                    
                    <footer className="flex items-center justify-between text-muted-foreground border-t border-border/40 pt-8 mt-4 group/footer">
                        <div className="flex items-center gap-3 text-[10px] uppercase tracking-[0.3em] font-bold">
                            <BedDouble size={18} className="text-primary" />
                            <span>{suite.category} {dictionary.label_suite_suffix || "Boutique Suite"}</span>
                        </div>
                        <ArrowRight size={18} className="transition-transform group-hover/footer:translate-x-2 opacity-30 group-hover/footer:opacity-100 text-primary" />
                    </footer>
                </div>

                {/* Sello de atmósfera interior (MEA/UX) */}
                <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none" />
              </article>
            ))}
          </div>
        ) : (
          /* ESTADO DE RESILIENCIA: Fallback i18n (Pilar VIII) */
          <div className="flex flex-col items-center justify-center py-48 rounded-5xl border border-dashed border-border bg-surface/20 text-center animate-in fade-in zoom-in duration-700">
              <div className="relative mb-8">
                 <div className="absolute -inset-6 bg-primary/5 blur-3xl rounded-full" />
                 <Info size={56} className="text-muted-foreground/30 relative" />
              </div>
              <p className="text-foreground font-display text-xl font-bold uppercase tracking-tight mb-2">
                 {dictionary.empty_state_title || "Signal Lost"}
              </p>
              <p className="text-muted-foreground font-mono text-[10px] uppercase tracking-[0.5em] animate-pulse">
                 {dictionary.empty_state_signal || "EMPTY SANCTUARY"}
              </p>
          </div>
        )}
      </div>
    </div>
  );
}