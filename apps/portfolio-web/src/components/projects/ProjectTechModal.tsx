// RUTA: apps/portfolio-web/src/components/projects/ProjectTechModal.tsx
// VERSIÓN: 1.1 - Corrección de Límites de Módulo y Linting CSS
// DESCRIPCIÓN: Modal Técnico de Ingeniería.
//              - Se corrige la importación de '@/' a ruta relativa '../../'.
//              - Se optimiza la clase z-index a su forma canónica.

'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Cpu, ShieldCheck, Layers, Database, Zap } from 'lucide-react';

// --- CORRECCIÓN 1: Importación Relativa Estricta (Nx Compliance) ---
import type { ProjectDetailItem } from '../../lib/schemas/project_details.schema';

type ProjectTechModalProps = {
  data: ProjectDetailItem;
};

export function ProjectTechModal({ data }: ProjectTechModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Lógica Proactiva: Abrir después de 1.5s para permitir que el usuario vea el Hero primero
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
          // --- CORRECCIÓN 2: Uso de clase canónica 'z-60' en lugar de arbitraria 'z-[60]' ---
          className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 p-4 backdrop-blur-md"
          onClick={() => setIsOpen(false)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="relative w-full max-w-3xl overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header con Branding del Proyecto */}
            <div className="relative h-32 w-full overflow-hidden bg-zinc-900">
              <div className="absolute inset-0 bg-linear-to-br from-zinc-800 to-black opacity-50" />
              {/* Acento de color dinámico basado en el JSON */}
              <div
                className="absolute inset-0 opacity-20"
                style={{ backgroundColor: data.branding.primary_color }}
              />

              <button
                onClick={() => setIsOpen(false)}
                className="absolute right-4 top-4 z-10 rounded-full bg-black/20 p-2 text-white backdrop-blur-md transition-colors hover:bg-white/20"
              >
                <X size={20} />
              </button>

              <div className="absolute bottom-0 left-0 p-8">
                <div className="mb-2 flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-white/70 backdrop-blur-sm">
                    <Cpu size={10} /> Ingeniería de Élite
                  </span>
                </div>
                <h2 className="font-display text-3xl font-bold text-white">{data.title}</h2>
                <p className="font-sans text-sm text-zinc-300">{data.subtitle}</p>
              </div>
            </div>

            {/* Contenido Scrollable */}
            <div className="max-h-[60vh] overflow-y-auto p-8 font-sans custom-scrollbar">

              {/* 1. Introducción Estratégica */}
              <div className="mb-8">
                <h3 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-zinc-500">
                  <Zap size={16} className="text-yellow-500" /> Objetivo Arquitectónico
                </h3>
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
                  <h4 className="mb-2 text-lg font-bold text-white">{data.introduction.heading}</h4>
                  <p className="text-sm leading-relaxed text-zinc-400">
                    {data.introduction.body}
                  </p>
                </div>
              </div>

              {/* 2. Grid Técnico (Stack & Backend) */}
              <div className="grid gap-8 md:grid-cols-2">
                {/* Stack Frontend */}
                <div>
                  <h3 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-zinc-500">
                    <Layers size={16} className="text-blue-500" /> Tech Stack
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {data.tech_stack.map((tech) => (
                      <span key={tech} className="rounded-md border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs font-medium text-zinc-300">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Arquitectura Backend */}
                <div>
                  <h3 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-zinc-500">
                    <Database size={16} className="text-green-500" /> {data.backend_architecture.title}
                  </h3>
                  <ul className="space-y-2">
                    {data.backend_architecture.features.map((feat, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-zinc-400">
                        <span className="mt-0.5 block h-1.5 w-1.5 rounded-full bg-green-500/50" />
                        {feat}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* 3. Opcionales de Élite */}
              <div className="mt-8 border-t border-zinc-800 pt-8">
                <h3 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-zinc-500">
                  <ShieldCheck size={16} className="text-purple-500" /> Capacidades "Sovereign"
                </h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  {data.elite_options.map((opt) => (
                    <div key={opt.name} className="group rounded-lg border border-zinc-800 bg-zinc-900/30 p-4 transition-colors hover:border-purple-500/30 hover:bg-zinc-900/80">
                      <div className="mb-1 text-sm font-bold text-zinc-200 group-hover:text-purple-300">
                        {opt.name}
                      </div>
                      <div className="text-xs text-zinc-500 group-hover:text-zinc-400">
                        {opt.detail}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Footer */}
            <div className="border-t border-zinc-800 bg-zinc-900/50 p-4 text-center">
              <button
                onClick={() => setIsOpen(false)}
                className="w-full rounded-lg bg-white px-4 py-3 text-sm font-bold text-black transition-transform hover:scale-[1.02] active:scale-[0.98]"
              >
                Explorar Demo en Vivo
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
