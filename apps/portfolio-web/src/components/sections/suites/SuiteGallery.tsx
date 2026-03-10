// RUTA: apps/portfolio-web/src/components/sections/suites/SuiteGallery.tsx

/**
 * @file SuiteGallery.tsx
 * @version 1.0 - Hospitality Rebranding
 * @description Galería filtrable de suites de lujo. 
 * @author Raz Podestá - MetaShark Tech
 */

'use client';

import { useState, useMemo } from 'react';
import { Search, BedDouble } from 'lucide-react';
import Image from 'next/image';
import { cn } from '../../../lib/utils/cn';
import type { Dictionary } from '../../../lib/schemas/dictionary.schema';

interface SuiteEntry {
  id: string;
  name: string;
  category: 'Master' | 'Deluxe' | 'Standard';
  imageUrl: string;
  price: string;
}

export function SuiteGallery({ suites, dictionary }: { suites: SuiteEntry[], dictionary: Dictionary['technologies_page'] }) {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const filteredSuites = useMemo(() => {
    return suites.filter((suite) => {
      const matchesSearch = suite.name.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = activeCategory === 'All' || suite.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [search, activeCategory, suites]);

  return (
    <div className="space-y-12">
      {/* Barra de Filtro Elegante */}
      <div className="sticky top-24 z-30 bg-background/80 backdrop-blur-md p-6 rounded-3xl border border-white/10 flex flex-col md:flex-row gap-6 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
          <input
            type="text"
            placeholder={dictionary.search_placeholder}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-full bg-zinc-900 border border-white/10 py-3 pl-12 pr-4 text-sm focus:ring-2 focus:ring-purple-500 outline-none transition-all"
          />
        </div>
        
        <div className="flex gap-2">
            {['All', 'Master', 'Deluxe', 'Standard'].map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={cn(
                    "px-6 py-2 rounded-full text-xs font-bold transition-all border uppercase tracking-widest",
                    activeCategory === cat ? "bg-white text-black border-white" : "bg-transparent border-white/20 text-zinc-400 hover:border-white/50"
                )}
              >
                {cat === 'All' ? 'Todas' : cat}
              </button>
            ))}
        </div>
      </div>

      {/* Grid de Suites */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredSuites.map((suite) => (
          <div key={suite.id} className="group rounded-3xl overflow-hidden border border-white/10 bg-zinc-900/50 hover:border-purple-500/50 transition-all hover:-translate-y-2">
            <div className="relative h-64 w-full overflow-hidden">
                <Image src={suite.imageUrl} alt={suite.name} fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
            </div>
            <div className="p-8">
                <div className="flex justify-between items-start mb-4">
                    <h3 className="text-2xl font-display font-bold text-white">{suite.name}</h3>
                    <span className="text-purple-400 font-mono text-sm">{suite.price}</span>
                </div>
                <div className="flex items-center gap-2 text-zinc-500 text-xs uppercase tracking-widest font-bold">
                    <BedDouble size={14} /> {suite.category} Suite
                </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}