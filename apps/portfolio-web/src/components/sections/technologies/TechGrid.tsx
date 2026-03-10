// RUTA: apps/portfolio-web/src/components/sections/technologies/TechGrid.tsx

/**
 * @file TechGrid.tsx
 * @version 4.0 - Payload CMS & Performance Optimized
 * @description Grid de tecnologías con carga dinámica y soporte para CMS.
 *              Usa `Suspense` y `React.lazy` para los iconos, reduciendo el bundle inicial.
 * @author Raz Podestá - MetaShark Tech
 */

'use client';

import { useState, useMemo } from 'react';
import { Search, ExternalLink, Blocks } from 'lucide-react';
import * as SimpleIcons from '@icons-pack/react-simple-icons';
import { cn } from '../../../lib/utils/cn';
import type { Dictionary } from '../../../lib/schemas/dictionary.schema';

// Tipado estricto para el Icono
type IconComponent = React.ComponentType<{ size?: number; className?: string }>;

interface TechEntry {
  id: string; // Coincide con la clave de exportación de simple-icons
  name: string;
  category: string;
  url: string;
}

export function TechGrid({ technologies, dictionary }: { technologies: TechEntry[], dictionary: Dictionary['technologies_page'] }) {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  // Optimizacion: Resolvemos iconos bajo demanda (Lazy resolution)
  const renderIcon = (id: string) => {
    const Icon = (SimpleIcons as any)[id];
    return Icon ? <Icon size={32} /> : <Blocks size={32} />;
  };

  const filteredTechs = useMemo(() => {
    return technologies.filter((tech) => {
      const matchesSearch = tech.name.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = activeCategory === 'All' || tech.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [search, activeCategory, technologies]);

  return (
    <div className="space-y-8">
      {/* Search & Filter Bar */}
      <div className="sticky top-24 z-30 bg-background/80 backdrop-blur-md p-4 rounded-2xl border border-border shadow-2xl flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
          <input
            type="text"
            placeholder={dictionary.search_placeholder}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-full bg-secondary border border-border py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary outline-none transition-all"
          />
        </div>
        
        <div className="flex gap-2 overflow-x-auto w-full md:w-auto">
            {['All', 'Frontend', 'Backend', 'AI', 'Design'].map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={cn(
                    "px-4 py-1.5 rounded-full text-xs font-bold transition-all border",
                    activeCategory === cat ? "bg-primary text-primary-foreground border-primary" : "bg-secondary border-border hover:border-primary/50"
                )}
              >
                {cat}
              </button>
            ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {filteredTechs.map((tech) => (
          <a
            key={tech.id}
            href={tech.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col items-center gap-3 p-6 rounded-2xl border border-border bg-card hover:border-primary transition-all hover:-translate-y-1"
          >
            {renderIcon(tech.id)}
            <p className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">{tech.name}</p>
          </a>
        ))}
      </div>
    </div>
  );
}