/**
 * @file apps/portfolio-web/src/components/sections/suites/SuiteGallery.tsx
 * @description Galería interactiva y filtrable de suites de lujo. 
 *              Refactorizado: Cumplimiento del Manifiesto MACS v1.0 (Acceso Aplanado).
 *              Implementa lógica de búsqueda, filtrado categórico y UX editorial.
 * @version 4.0 - MACS Flattened Sync & Performance Hardening
 * @author Raz Podestá - MetaShark Tech
 */

'use client';

import React, { useState, useMemo } from 'react';
import { Search, BedDouble, Info } from 'lucide-react';
import Image from 'next/image';

/**
 * IMPORTACIONES DE INFRAESTRUCTRURA
 * @pilar V: Adherencia arquitectónica mediante fronteras Nx.
 */
import { cn } from '../../../lib/utils/cn';
import type { Dictionary } from '../../../lib/schemas/dictionary.schema';

/**
 * @interface SuiteEntry
 * @description Contrato de datos para una unidad habitacional.
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
 * @description Propiedades del componente con tipado derivado del SSoT.
 */
interface SuiteGalleryProps {
  /** Listado de suites proveniente del CMS */
  suites: SuiteEntry[];
  /** 
   * @pilar III: Seguridad de Tipos. 
   * Mapeo directo al aparato 'suite_gallery' tras la nivelación MACS.
   */
  dictionary: Dictionary['suite_gallery'];
}

/**
 * APARATO: SuiteGallery
 * @description Orquesta el catálogo de activos inmobiliarios del Santuario.
 */
export function SuiteGallery({ suites, dictionary }: SuiteGalleryProps) {
  const [search, setSearch] = useState<string>('');
  const [activeCategory, setActiveCategory] = useState<string>('All');

  /**
   * MEMOIZACIÓN DE CATEGORÍAS
   * @pilar X: Rendimiento de Élite.
   */
  const categoryFilters = useMemo(() => [
    { id: 'All', label: dictionary.cat_all },
    { id: 'Master', label: dictionary.cat_master },
    { id: 'Deluxe', label: dictionary.cat_deluxe },
    { id: 'Standard', label: dictionary.cat_standard }
  ], [dictionary]);

  /**
   * LÓGICA DE FILTRADO SOBERANA
   * @description Filtrado multi-dimensional (Texto + Dominio) con resiliencia.
   */
  const filteredSuites = useMemo(() => {
    const list = suites || [];
    return list.filter((suite: SuiteEntry) => {
      const matchesSearch = suite.name.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = activeCategory === 'All' || suite.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [search, activeCategory, suites]);

  /**
   * GUARDIÁN DE RESILIENCIA (Pilar VIII)
   */
  if (!dictionary) return null;

  return (
    <div className="space-y-12">
      {/* 1. BARRA DE CONTROL TÁCTICO (NavDesk Complement) */}
      <header 
        className="sticky top-24 z-30 bg-background/80 backdrop-blur-xl p-6 rounded-[2.5rem] border border-white/10 flex flex-col md:flex-row gap-6 items-center justify-between shadow-3xl"
      >
        <div className="relative w-full md:w-80">
          <Search 
            className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-500" 
            size={18} 
            aria-hidden="true"
          />
          <input
            type="text"
            placeholder={dictionary.search_placeholder}
            value={search}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
            className="w-full rounded-full bg-zinc-900/50 border border-white/5 py-4 pl-14 pr-6 text-sm focus:ring-2 focus:ring-purple-500/50 outline-none transition-all placeholder:text-zinc-600 text-white font-sans"
            aria-label="Buscar suites"
          />
        </div>
        
        <nav className="flex flex-wrap justify-center gap-2" aria-label="Filtros de categoría">
            {categoryFilters.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={cn(
                    "px-8 py-2.5 rounded-full text-[10px] font-bold transition-all border uppercase tracking-[0.2em] outline-none",
                    "focus-visible:ring-2 focus-visible:ring-purple-500",
                    activeCategory === cat.id 
                      ? "bg-white text-black border-white shadow-xl scale-105" 
                      : "bg-transparent border-white/10 text-zinc-500 hover:border-white/30 hover:text-white"
                )}
              >
                {cat.label}
              </button>
            ))}
        </nav>
      </header>

      {/* 2. GRID DE ACTIVOS (Luxury Showcase) */}
      {filteredSuites.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
          {filteredSuites.map((suite: SuiteEntry) => (
            <article 
              key={suite.id} 
              className="group relative rounded-[3rem] overflow-hidden border border-white/5 bg-zinc-900/20 transition-all duration-700 hover:border-purple-500/30 hover:-translate-y-2 hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.7)] transform-gpu"
            >
              <div className="relative h-72 w-full overflow-hidden">
                  <Image 
                    src={suite.imageUrl} 
                    alt={suite.name} 
                    fill 
                    className="object-cover transition-transform duration-1000 group-hover:scale-110"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-zinc-950 via-transparent to-transparent opacity-80" />
                  
                  {/* Badge de Categoría */}
                  <div className="absolute top-6 left-6">
                    <span className="inline-flex items-center gap-2 rounded-full bg-black/40 backdrop-blur-md border border-white/10 px-4 py-1.5 text-[9px] font-bold uppercase tracking-widest text-purple-400">
                      {suite.category}
                    </span>
                  </div>
              </div>

              <div className="p-10">
                  <div className="flex justify-between items-start mb-6">
                      <h3 className="text-2xl font-display font-bold text-white tracking-tighter group-hover:text-purple-300 transition-colors">
                        {suite.name}
                      </h3>
                      <div className="text-right">
                        <span className="block text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-1">From</span>
                        <span className="text-xl font-display font-bold text-white">{suite.price}</span>
                      </div>
                  </div>
                  
                  <div className="flex items-center gap-3 text-zinc-500 text-[10px] uppercase tracking-[0.3em] font-bold border-t border-white/5 pt-6">
                      <BedDouble size={16} className="text-purple-500" />
                      <span>{suite.category} Sanctuary Suite</span>
                  </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        /* ESTADO DE RESILIENCIA (Pilar VIII) */
        <div className="flex flex-col items-center justify-center py-32 rounded-[3rem] border border-dashed border-white/10 bg-white/1 text-center">
            <Info size={48} className="text-zinc-800 mb-6" />
            <p className="text-zinc-500 font-mono text-[10px] uppercase tracking-[0.5em] animate-pulse">
               {/* Fallback semántico si no hay resultados */}
               Empty Sanctuary Signal
            </p>
        </div>
      )}
    </div>
  );
}