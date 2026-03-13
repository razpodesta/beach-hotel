/**
 * @file apps/portfolio-web/src/components/projects/ProjectTechModal.tsx
 * @description Modal de especificaciones técnicas avanzadas.
 * @version 4.0
 * @author Raz Podestá - MetaShark Tech
 */

'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Cpu, ShieldCheck, Layers, Zap } from 'lucide-react';

/**
 * IMPORTACIONES NIVELADAS
 */
import { cn } from '../../lib/utils/cn';
import type { ProjectEntity } from '../../lib/schemas/project_details.schema';

interface ProjectTechModalProps {
  /** Objeto de datos que contiene la configuración de arquitectura del proyecto */
  data: ProjectEntity;
}

/**
 * Aparato Visual: ProjectTechModal
 */
export function ProjectTechModal({ data }: ProjectTechModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsOpen(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          onClick={() => setIsOpen(false)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 30 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={cn(
              "relative w-full max-w-3xl overflow-hidden rounded-4xl border border-white/10 bg-zinc-950 shadow-3xl",
              "before:absolute before:inset-0 before:bg-linear-to-b before:from-white/5 before:to-transparent before:pointer-events-none"
            )}
            onClick={(e) => e.stopPropagation()}
          >
            <header className="relative h-40 w-full overflow-hidden bg-zinc-900">
              <div 
                className="absolute inset-0 opacity-20 transition-colors duration-1000"
                style={{ backgroundColor: data.branding.primary_color }} 
              />
              
              <button
                onClick={() => setIsOpen(false)}
                className="absolute right-6 top-6 z-20 rounded-full bg-black/40 p-2.5 text-white backdrop-blur-xl hover:bg-white hover:text-black transition-all active:scale-90"
                aria-label="Cerrar modal"
              >
                <X size={20} />
              </button>

              <div className="absolute bottom-0 left-0 p-8 z-10">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/40 px-3 py-1 text-[9px] font-bold uppercase tracking-[0.3em] text-purple-400 mb-3 backdrop-blur-md">
                  <Cpu size={12} /> Ingeniería de Élite
                </div>
                <h2 id="modal-title" className="font-display text-4xl font-bold text-white tracking-tighter">
                  {data.title}
                </h2>
              </div>
            </header>

            <div className="max-h-[60vh] overflow-y-auto p-8 space-y-10 scrollbar-thin scrollbar-thumb-white/10 custom-scrollbar">
              
              <section className="space-y-4">
                <h3 className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.3em] text-purple-500">
                  <Zap size={16} /> Objetivo del Sistema
                </h3>
                <div className="rounded-3xl border border-white/5 bg-white/2 p-6">
                  <h4 className="mb-2 font-bold text-zinc-100">{data.introduction.heading}</h4>
                  <p className="text-sm leading-relaxed text-zinc-400 font-sans">{data.introduction.body}</p>
                </div>
              </section>

              <div className="grid gap-10 md:grid-cols-2">
                <section>
                  <h3 className="mb-5 flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.3em] text-pink-500">
                    <Layers size={16} /> Tech Stack
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {data.tech_stack.map((tech: string) => (
                      <span 
                        key={tech} 
                        className="rounded-xl border border-white/5 bg-zinc-900 px-4 py-2 text-xs font-mono font-medium text-zinc-300"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </section>

                <section>
                  <h3 className="mb-5 flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.3em] text-blue-500">
                    <ShieldCheck size={16} /> {data.backend_architecture?.title ?? 'Arquitectura Backend'}
                  </h3>
                  <ul className="space-y-3">
                    {data.backend_architecture?.features.map((feat: string, i: number) => (
                      <li key={i} className="flex items-start gap-3 text-xs text-zinc-500 font-sans">
                        <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
                        {feat}
                      </li>
                    ))}
                  </ul>
                </section>
              </div>
            </div>

            <footer className="border-t border-white/5 bg-white/1 p-6">
              <button
                onClick={() => setIsOpen(false)}
                className="w-full rounded-2xl bg-white py-4 text-[10px] font-bold uppercase tracking-[0.4em] text-black hover:bg-purple-600 hover:text-white transition-all duration-300 shadow-xl"
              >
                Cerrar Especificaciones
              </button>
            </footer>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}