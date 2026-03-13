/**
 * @file apps/portfolio-web/src/components/projects/ProjectTechModal.tsx
 * @description Escaparate de ingeniería avanzada para activos digitales.
 *              Orquesta la visualización de arquitectura, tech stack y opciones de élite.
 * @version 5.2 - Explicit Type Iteration & Safety
 * @author Raz Podestá - MetaShark Tech
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Cpu, ShieldCheck, Layers, Zap, Star, Layout, Crown } from 'lucide-react';

/**
 * IMPORTACIONES NIVELADAS
 */
import { cn } from '../../lib/utils/cn';
import type { ProjectEntity } from '../../lib/schemas/project_details.schema';

interface ProjectTechModalProps {
  /** Entidad del proyecto validada por el contrato de Zod */
  data: ProjectEntity;
}

/**
 * Aparato Visual: ProjectTechModal
 */
export function ProjectTechModal({ data }: ProjectTechModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  /**
   * @pilar IV: Observabilidad (Heimdall).
   */
  const trackOpening = useCallback(() => {
    if (data) {
      console.log(`[HEIMDALL][UX] Interacción: Modal de Ingeniería -> ${data.title}`);
      setIsOpen(true);
    }
  }, [data]);

  useEffect(() => {
    const timer = setTimeout(trackOpening, 1500);
    return () => clearTimeout(timer);
  }, [trackOpening]);

  // @pilar VIII: Guardia de Resiliencia
  if (!data) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-100 flex items-center justify-center bg-black/90 p-4 backdrop-blur-xl"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          aria-describedby="modal-description"
          onClick={() => setIsOpen(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 40 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 40 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={cn(
              "relative w-full max-w-4xl overflow-hidden rounded-[2.5rem] border border-white/10 bg-zinc-950 shadow-3xl",
              "before:absolute before:inset-0 before:bg-linear-to-b before:from-white/5 before:to-transparent before:pointer-events-none"
            )}
            onClick={(e) => e.stopPropagation()}
          >
            {/* 1. HEADER: BRANDING DINÁMICO */}
            <header className="relative h-48 w-full overflow-hidden bg-zinc-900">
              <div 
                className="absolute inset-0 opacity-30 transition-colors duration-1000"
                style={{ 
                  background: `radial-gradient(circle at top left, ${data.branding.primary_color}, transparent)` 
                }} 
              />
              
              <button
                onClick={() => setIsOpen(false)}
                className="absolute right-8 top-8 z-30 rounded-full bg-black/40 p-3 text-white backdrop-blur-2xl hover:bg-white hover:text-black transition-all active:scale-90 border border-white/10 outline-none focus-visible:ring-2 focus-visible:ring-purple-500"
                aria-label="Cerrar especificaciones"
              >
                <X size={20} />
              </button>

              <div className="absolute bottom-0 left-0 p-10 z-10">
                <div className="flex items-center gap-4 mb-4">
                  <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-4 py-1 text-[9px] font-bold uppercase tracking-[0.3em] text-purple-400 backdrop-blur-md">
                    <Cpu size={12} /> Ingeniería de Élite
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-yellow-500/30 bg-yellow-500/10 px-4 py-1 text-[9px] font-bold uppercase tracking-[0.3em] text-yellow-500 backdrop-blur-md">
                    <Star size={12} /> P33: {data.reputationWeight} RZB
                  </div>
                </div>
                <h2 id="modal-title" className="font-display text-4xl md:text-5xl font-bold text-white tracking-tighter">
                  {data.title}
                </h2>
              </div>
            </header>

            {/* 2. BODY: GRID DE ESPECIFICACIONES */}
            <div className="max-h-[65vh] overflow-y-auto p-10 space-y-12 scrollbar-hide custom-scrollbar">
              
              <section className="space-y-4">
                <h3 className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-500">
                  <Zap size={16} className="text-purple-500" /> Objetivo del Activo
                </h3>
                <div className="rounded-3xl border border-white/5 bg-white/2 p-8 transition-colors hover:border-white/10" id="modal-description">
                  <h4 className="mb-3 font-bold text-zinc-100 text-lg">{data.introduction.heading}</h4>
                  <p className="text-base leading-relaxed text-zinc-400 font-sans font-light italic">
                    "{data.introduction.body}"
                  </p>
                </div>
              </section>

              <div className="grid gap-12 md:grid-cols-2">
                <section>
                  <h3 className="mb-6 flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-500">
                    <Layers size={16} className="text-pink-500" /> Infrastructure Stack
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {data.tech_stack.map((tech: string) => (
                      <span 
                        key={tech} 
                        className="rounded-xl border border-white/5 bg-zinc-900/50 px-4 py-2.5 text-xs font-mono font-medium text-zinc-300 hover:border-pink-500/30 transition-colors"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </section>

                {data.backend_architecture && (
                  <section>
                    <h3 className="mb-6 flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-500">
                      <ShieldCheck size={16} className="text-blue-500" /> {data.backend_architecture.title}
                    </h3>
                    <ul className="space-y-4">
                      {data.backend_architecture.features.map((feat: string, i: number) => (
                        <li key={i} className="flex items-start gap-4 text-sm text-zinc-400 font-sans">
                          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500 shadow-[0_0_8px_#3b82f6]" />
                          {feat}
                        </li>
                      ))}
                    </ul>
                  </section>
                )}
              </div>

              {/* 
                 @pilar II: Opciones de Élite. 
                 Se implementa un Type Guard manual para evitar el error TS2339 
                 mientras se sincroniza el esquema físico.
              */}
              {(data as any).elite_options && (data as any).elite_options.length > 0 && (
                <section className="pt-4 border-t border-white/5">
                  <h3 className="mb-6 flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-500">
                    <Crown size={16} className="text-yellow-500" /> Elite Deployment Options
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(data as any).elite_options.map((option: { name: string; detail: string }) => (
                      <div key={option.name} className="p-5 rounded-2xl border border-white/5 bg-zinc-900/20 group hover:bg-zinc-900/40 transition-all">
                        <p className="text-xs text-white font-bold mb-1 flex items-center gap-2">
                           <span className="h-1 w-1 rounded-full bg-yellow-500" /> {option.name}
                        </p>
                        <p className="text-xs text-zinc-500 leading-relaxed font-sans">{option.detail}</p>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              <section className="pt-4">
                <h3 className="mb-6 flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-500">
                  <Layout size={16} className="text-cyan-500" /> Governance & Layout
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                   <div className="p-4 rounded-2xl border border-white/5 bg-zinc-900/30">
                      <p className="text-[9px] text-zinc-600 uppercase font-mono mb-1">Layout</p>
                      <p className="text-xs text-white font-bold capitalize">{data.branding.layout_style}</p>
                   </div>
                   <div className="p-4 rounded-2xl border border-white/5 bg-zinc-900/30">
                      <p className="text-[9px] text-zinc-600 uppercase font-mono mb-1">Status</p>
                      <p className="text-xs text-green-400 font-bold uppercase tracking-widest">{data.status}</p>
                   </div>
                   <div className="p-4 rounded-2xl border border-white/5 bg-zinc-900/30">
                      <p className="text-[9px] text-zinc-600 uppercase font-mono mb-1">Tenant ID</p>
                      <p className="text-[10px] text-zinc-400 font-mono truncate">{data.tenantId}</p>
                   </div>
                </div>
              </section>
            </div>

            <footer className="border-t border-white/5 bg-white/2 p-8">
              <button
                onClick={() => setIsOpen(false)}
                className="w-full rounded-2xl bg-white py-5 text-[10px] font-bold uppercase tracking-[0.5em] text-black hover:bg-purple-600 hover:text-white transition-all duration-500 shadow-2xl active:scale-[0.98] outline-none focus-visible:ring-2 focus-visible:ring-purple-500"
              >
                Cerrar Protocolo Técnico
              </button>
            </footer>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}