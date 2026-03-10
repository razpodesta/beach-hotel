// RUTA: apps/portfolio-web/src/components/projects/ProjectTechModal.tsx

/**
 * @file Modal Técnico de Proyecto
 * @version 2.0 - Semantic Theming & Portal Ready
 * @description Presentación de especificaciones técnicas para proyectos de élite.
 *              Usa tokens semánticos de Tailwind v4 y fusión de clases `cn()`.
 * @author Raz Podestá - MetaShark Tech
 */

'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Cpu, ShieldCheck, Layers, Database, Zap } from 'lucide-react';
import { cn } from '../../lib/utils/cn';
import type { ProjectDetailItem } from '../../lib/schemas/project_details.schema';

interface ProjectTechModalProps {
  data: ProjectDetailItem;
}

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
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-md"
          onClick={() => setIsOpen(false)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="relative w-full max-w-3xl overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header: Branding dinámico */}
            <header className="relative h-32 w-full overflow-hidden bg-muted">
              <div 
                className="absolute inset-0 opacity-10"
                style={{ backgroundColor: data.branding.primary_color }} 
              />
              
              <button
                onClick={() => setIsOpen(false)}
                className="absolute right-4 top-4 z-10 rounded-full bg-background/20 p-2 text-foreground backdrop-blur-md hover:bg-background/40 transition-colors"
              >
                <X size={20} />
              </button>

              <div className="absolute bottom-0 left-0 p-8">
                <span className="inline-flex items-center gap-1 rounded-full border border-border bg-background/50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">
                  <Cpu size={10} /> Ingeniería de Élite
                </span>
                <h2 className="font-display text-3xl font-bold text-foreground">{data.title}</h2>
              </div>
            </header>

            {/* Content: Scrollable con scrollbar semántico */}
            <div className="max-h-[60vh] overflow-y-auto p-8 space-y-8 scrollbar-thin scrollbar-thumb-border">
              
              {/* Sección 1: Objetivo */}
              <section>
                <h3 className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
                  <Zap size={16} /> Objetivo Arquitectónico
                </h3>
                <div className="rounded-xl border border-border bg-secondary p-5">
                  <h4 className="mb-2 font-bold text-foreground">{data.introduction.heading}</h4>
                  <p className="text-sm leading-relaxed text-muted-foreground">{data.introduction.body}</p>
                </div>
              </section>

              {/* Sección 2: Grid Técnico */}
              <div className="grid gap-8 md:grid-cols-2">
                <section>
                  <h3 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
                    <Layers size={16} /> Tech Stack
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {data.tech_stack.map((tech) => (
                      <span key={tech} className="rounded-md border border-border bg-secondary px-3 py-1.5 text-xs font-medium text-foreground">
                        {tech}
                      </span>
                    ))}
                  </div>
                </section>

                <section>
                  <h3 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
                    <Database size={16} /> {data.backend_architecture.title}
                  </h3>
                  <ul className="space-y-2">
                    {data.backend_architecture.features.map((feat, i) => (
                      <li key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                        {feat}
                      </li>
                    ))}
                  </ul>
                </section>
              </div>
            </div>

            {/* Footer */}
            <footer className="border-t border-border bg-secondary p-4">
              <button
                onClick={() => setIsOpen(false)}
                className="w-full rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground hover:opacity-90 transition-all"
              >
                Explorar Demo en Vivo
              </button>
            </footer>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}