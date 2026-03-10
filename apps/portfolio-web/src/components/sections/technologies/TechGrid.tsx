/**
 * @file Grid de Tecnologías Interactivo.
 * @description Renderiza una colección filtrable de iconos con paginación virtual.
 * @version 3.3 - Filtrado de Tipos y Corrección de Lógica
 */
'use client';

import { useState, useMemo, type ComponentType } from 'react';
import { Search, ExternalLink } from 'lucide-react';
import * as SimpleIcons from '@icons-pack/react-simple-icons';
import type { Dictionary } from '@/lib/schemas/dictionary.schema';

type TechEntry = {
  id: string;
  name: string;
  category: string;
  url: string;
};

type TechGridProps = {
  technologies: TechEntry[];
  dictionary: Dictionary['technologies_page'];
};

const CATEGORIES = ['All', 'Frontend', 'Backend', 'Database', 'DevOps', 'AI', 'Design', 'Other'];

export function TechGrid({ technologies, dictionary }: TechGridProps) {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [visibleCount, setVisibleCount] = useState(60);

  // --- INICIO DE LA SOLUCIÓN DE ÉLITE: FILTRADO Y MAPEO MEMOIZADO ---
  const iconMap = useMemo(() => {
    // 1. Filtramos las entradas para quedarnos solo con las que son componentes (funciones).
    const componentEntries = Object.entries(SimpleIcons).filter(
      ([, value]) => typeof value === 'function'
    );

    // 2. Ahora, creamos el Map con la seguridad de que solo contiene componentes válidos.
    return new Map<string, ComponentType<{ size?: number; className?: string }>>(
      componentEntries as [string, ComponentType<{ size?: number; className?: string }>][]
    );
  }, []);
  // --- FIN DE LA SOLUCIÓN DE ÉLITE ---

  const filteredTechs = useMemo(() => {
    return technologies.filter((tech) => {
      const matchesSearch = tech.name.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = activeCategory === 'All' || tech.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [search, activeCategory, technologies]);

  const visibleTechs = filteredTechs.slice(0, visibleCount);

  // --- INICIO DE LA CORRECCIÓN: FUNCIÓN FALTANTE ---
  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + 60);
  };
  // --- FIN DE LA CORRECCIÓN ---

  const getCategoryLabel = (cat: string) => {
    if (cat === 'All') return dictionary.category_all;
    if (cat === 'Frontend') return dictionary.category_frontend;
    if (cat === 'Backend') return dictionary.category_backend;
    if (cat === 'Database') return 'Database';
    if (cat === 'DevOps') return dictionary.category_devops;
    if (cat === 'AI') return dictionary.category_ai;
    if (cat === 'Design') return dictionary.category_design;
    if (cat === 'Other') return dictionary.category_other;
    return cat;
  };

  return (
    <div className="space-y-8">
      <div className="sticky top-24 z-30 flex flex-col gap-4 rounded-2xl border border-zinc-800 bg-zinc-950/80 p-4 backdrop-blur-xl md:flex-row md:items-center md:justify-between shadow-2xl">
        <div className="relative w-full md:w-80 shrink-0">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            placeholder={dictionary.search_placeholder}
            value={search}
            onChange={(e) => { setSearch(e.target.value); setVisibleCount(60); }}
            className="w-full rounded-full border border-zinc-700 bg-zinc-900 py-2 pl-10 pr-4 text-sm text-white placeholder-zinc-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar mask-linear-fade">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => { setActiveCategory(cat); setVisibleCount(60); }}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap border ${
                activeCategory === cat
                  ? 'bg-purple-600 text-white border-purple-500 shadow-lg shadow-purple-500/20'
                  : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:bg-zinc-800 hover:text-white hover:border-zinc-700'
              }`}
            >
              {getCategoryLabel(cat)}
            </button>
          ))}
        </div>
      </div>

      <div className="text-sm text-zinc-500 pl-2">
        {dictionary.showing_results.replace('{count}', filteredTechs.length.toString())}
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {visibleTechs.map((tech) => {
          const IconComponent = iconMap.get(tech.id);

          if (!IconComponent) return null;

          return (
            <a
              key={tech.id}
              href={tech.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative flex flex-col items-center justify-center gap-4 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 transition-all duration-300 hover:border-purple-500/40 hover:bg-zinc-800 hover:-translate-y-1 hover:shadow-xl hover:shadow-purple-900/10"
            >
              <div className="absolute top-3 right-3 opacity-0 transition-opacity group-hover:opacity-100">
                <ExternalLink size={14} className="text-zinc-500 hover:text-purple-400" />
              </div>

              <IconComponent
                size={36}
                className="text-zinc-500 transition-colors duration-300 group-hover:text-white"
              />

              <div className="text-center w-full">
                <p className="text-sm font-bold text-zinc-400 transition-colors group-hover:text-white truncate px-1">
                  {tech.name}
                </p>
                <p className="text-[10px] font-medium text-zinc-600 uppercase tracking-wider mt-1 group-hover:text-purple-400/80 transition-colors">
                  {getCategoryLabel(tech.category)}
                </p>
              </div>
            </a>
          );
        })}
      </div>

      {visibleCount < filteredTechs.length && (
        <div className="flex justify-center py-12">
          <button
            onClick={handleLoadMore}
            className="group relative px-8 py-3 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300 font-bold transition-all hover:bg-zinc-800 hover:text-white hover:border-zinc-700 hover:shadow-lg active:scale-95"
          >
            <span>{dictionary.load_more_button}</span>
            <div className="absolute inset-0 rounded-full ring-2 ring-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        </div>
      )}
    </div>
  );
}
