/**
 * @file InventoryExplorer.tsx
 * @description Orquestador de gestión de biblioteca multimedia (Dashboard).
 *              Implementa la lógica de filtrado por GPU, búsqueda semántica,
 *              y cierre del ciclo de activos (CRUD S3) mediante Server Actions.
 * @version 2.1 - React Compiler Compliant & S3 Purge Action
 * @author Raz Podestá - MetaShark Tech
 */

'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { Search, X, SlidersHorizontal, Image as ImageIcon, Film, LayoutGrid } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * IMPORTACIONES DE INFRAESTRUCTRURA
 */
import { cn } from '../../../../lib/utils/cn';
import type { SovereignMedia } from '../../../../lib/portal';
import type { AdminMediaDictionary } from '../../../../lib/schemas/admin_media.schema';
import { MediaItemCard } from './MediaItemCard';
import { deleteMediaAction } from '../../../../lib/portal/actions/media.actions';
import { useUIStore } from '../../../../lib/store/ui.store';

interface InventoryExplorerProps {
  /** Colección de activos sincronizada con S3 */
  items: SovereignMedia[];
  /** Diccionario administrativo nivelado */
  dictionary: AdminMediaDictionary;
}

/** 
 * @type FilterType 
 * @description Contrato estricto para las categorías de filtrado.
 */
type FilterType = 'all' | 'image' | 'video';

export function InventoryExplorer({ items, dictionary }: InventoryExplorerProps) {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  
  /**
   * @pilar X: Extracción selectiva del estado global.
   * Evita el React Compiler Error extrayendo directamente el ID necesario.
   */
  const tenantId = useUIStore((state) => state.session?.tenantId);

  /**
   * MOTOR DE FILTRADO SOBERANO (Pilar X: Performance)
   * @description Normalización de búsqueda y discriminación por MIME.
   */
  const filteredItems = useMemo(() => {
    const list = items ||[];
    return list.filter((item) => {
      const matchesSearch = item.alt.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = activeFilter === 'all' || item.mimeType.startsWith(activeFilter);
      return matchesSearch && matchesType;
    });
  }, [items, searchQuery, activeFilter]);

  /**
   * ACCIÓN DE PURGA (Sovereign S3 Cycle)
   * @description Dispara la acción de servidor para destruir el activo, 
   * inyectando el tenantId del usuario activo.
   */
  const handleDelete = useCallback(async (id: string) => {
    if (!tenantId) {
      console.error('[HEIMDALL][SECURITY] Purge aborted: Missing Tenant ID.');
      return;
    }

    console.log(`[HEIMDALL][MEDIA-PURGE] Request dispatched for ID: ${id}`);
    
    try {
      const result = await deleteMediaAction(id, tenantId);
      if (!result.success) {
        console.error('[HEIMDALL][ERROR] Purge failed:', result.error);
      }
    } catch (err) {
      console.error('[HEIMDALL][ERROR] Unexpected error during purge:', err);
    }
  }, [tenantId]);

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      
      {/* --- 1. CONSOLA DE FILTRADO TÁCTICO (Atmosphere Aware) --- */}
      <header className="flex flex-col lg:flex-row gap-6 items-center justify-between bg-surface/60 backdrop-blur-3xl p-6 rounded-[2.5rem] border border-border shadow-2xl transition-all duration-700">
        
        {/* Buscador de Activos */}
        <div className="relative w-full lg:w-96 group">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={18} />
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={dictionary.placeholder_alt_text}
            className="w-full bg-background/50 border border-border/50 rounded-full py-4 pl-14 pr-12 text-sm outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/5 transition-all text-foreground font-sans"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')} 
              className="absolute right-4 top-1/2 -translate-y-1/2 p-2 hover:text-primary transition-colors"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Navegación por Tipos (SSoT Filters) */}
        <nav className="flex items-center gap-2 bg-background/40 p-1.5 rounded-full border border-border/50" aria-label="MIME Filters">
          {[
            { id: 'all' as FilterType, label: 'TUDO', icon: LayoutGrid },
            { id: 'image' as FilterType, label: 'IMAGENS', icon: ImageIcon },
            { id: 'video' as FilterType, label: 'VÍDEOS', icon: Film }
          ].map((type) => {
            const isActive = activeFilter === type.id;
            return (
              <button
                key={type.id}
                onClick={() => setActiveFilter(type.id)}
                className={cn(
                  "flex items-center gap-3 px-6 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all outline-none",
                  isActive 
                    ? "bg-foreground text-background shadow-lg scale-105" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <type.icon size={14} />
                {type.label}
              </button>
            );
          })}
        </nav>
      </header>

      {/* --- 2. GRID DE ACTIVOS (Layout Orchestration) --- */}
      <motion.div layout className="relative min-h-[400px]">
        <AnimatePresence mode="popLayout">
          {filteredItems.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
              {filteredItems.map((item) => (
                <MediaItemCard 
                  key={item.id} 
                  item={item} 
                  onDelete={handleDelete}
                  labels={{ 
                    delete: 'Apagar', 
                    copy: 'Copiar URL', 
                    view: 'Visualizar Original' 
                  }}
                />
              ))}
            </div>
          ) : (
            /* ESTADO: NO CORRESPONDENCE (Pilar VIII) */
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-32 rounded-[4rem] border border-dashed border-border bg-surface/20 text-center"
            >
              <div className="relative mb-6">
                 <div className="absolute -inset-6 bg-primary/5 blur-3xl rounded-full" />
                 <SlidersHorizontal size={48} className="text-muted-foreground/30 relative" strokeWidth={1} />
              </div>
              <p className="font-display text-xl font-bold text-foreground uppercase tracking-tight">Sem correspondências</p>
              <p className="text-[10px] text-muted-foreground mt-2 font-mono uppercase tracking-widest animate-pulse">
                {dictionary.status_error}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}