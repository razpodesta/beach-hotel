/**
 * @file apps/portfolio-web/src/components/ui/ProjectCard.tsx
 * @description Enterprise Asset Manager (Module UI).
 *              Orquesta la exhibición de activos de alta ingeniería, implementando
 *              sincronización atmosférica Day-First, telemetría de inspección
 *              y un motor de branding dinámico basado en OKLCH.
 * @version 6.0 - Enterprise Level 4.0 Standard
 * @author Staff Engineer - MetaShark Tech
 */

'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { ExternalLink, Github, Cpu, Star, ArrowUpRight, ShieldCheck } from 'lucide-react';

/**
 * IMPORTACIONES DE INFRAESTRUCTRURA (SSoT)
 * @pilar V: Adherencia arquitectónica.
 */
import { cn } from '../../lib/utils/cn';
import type { 
  ProjectEntity, 
  ProjectDetailsDictionary 
} from '../../lib/schemas/project_details.schema';
import { ProjectTechModal } from '../projects/ProjectTechModal';

/**
 * @interface EnterpriseAssetCardProps
 * @description Contrato de propiedades para la unidad de gestión de activos.
 */
interface EnterpriseAssetCardProps {
  /** Entidad del activo validada por el Core Engine */
  project: ProjectEntity;
  /** Diccionario de etiquetas técnicas corporativas */
  dictionary: ProjectDetailsDictionary;
  className?: string;
}

/**
 * MODULE: ProjectCard
 * @description Punto de entrada para la visualización de activos digitales.
 *              Fase de Embudo: Authority & Technical Trust.
 */
export function ProjectCard({ project, dictionary, className }: EnterpriseAssetCardProps) {
  const [isTechnicalConsoleOpen, setIsTechnicalConsoleOpen] = useState(false);

  /**
   * PROTOCOLO HEIMDALL: Telemetría de Inspección (Trace Audit)
   * @pilar IV: Registra el enganche con las especificaciones técnicas.
   */
  const openAssetTechnicalConsole = useCallback(() => {
    const traceId = `inspect_asset_${project.slug}_${Date.now()}`;
    console.group(`[ENTERPRISE][UX] Asset Technical Inspection: ${traceId}`);
    console.log(`Asset_ID: ${project.id}`);
    console.log(`Reputation_Reward: ${project.reputationWeight} RZB`);
    console.groupEnd();
    setIsTechnicalConsoleOpen(true);
  }, [project.slug, project.id, project.reputationWeight]);

  const closeAssetTechnicalConsole = useCallback(() => {
    setIsTechnicalConsoleOpen(false);
  }, []);

  return (
    <>
      <motion.article
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        /**
         * @pilar VII: Semantic Theming (Oxygen Engine)
         * Se utilizan variables de color-mix para asegurar legibilidad en Modo Día.
         */
        className={cn(
          "group relative flex h-full flex-col overflow-hidden rounded-[2.5rem] border border-border/50",
          "bg-surface/40 backdrop-blur-xl transition-all duration-1000",
          "hover:border-primary/40 hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] transform-gpu",
          className
        )}
      >
        {/* --- 1. VISUAL REPOSITORY LAYER --- */}
        <div className="relative h-64 w-full overflow-hidden bg-background">
          <Image
            src={project.imageUrl}
            alt={project.title}
            fill
            className="object-cover transition-transform duration-2000 ease-out group-hover:scale-105 brightness-100 [data-theme='dark']:brightness-[0.8]"
            sizes="(max-width: 768px) 100vw, 500px"
            priority={false}
          />
          
          {/* Atmosphere Overlay (Alpha Channel Sync) */}
          <div className="absolute inset-0 bg-linear-to-t from-background via-transparent to-transparent opacity-90 transition-colors duration-1000" />
          
          {/* BADGES DE STATUS & REPUTACIÓN (Silo D) */}
          <div className="absolute top-6 left-6 flex items-center gap-2 rounded-full bg-background/60 backdrop-blur-2xl border border-border/40 px-4 py-1.5 text-[9px] font-bold text-yellow-500 uppercase tracking-widest shadow-xl">
            <Star size={12} className="fill-yellow-500" />
            {project.reputationWeight} RZB
          </div>

          <button 
            onClick={openAssetTechnicalConsole}
            className="absolute top-6 right-6 p-3 rounded-full bg-surface/80 backdrop-blur-2xl border border-border/60 text-foreground hover:bg-primary hover:text-white transition-all active:scale-90 shadow-lg outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-label={dictionary.label_tech_stack}
          >
            <Cpu size={18} />
          </button>
        </div>

        {/* --- 2. INFORMATION ARCHITECTURE LAYER --- */}
        <div className="flex grow flex-col p-8 md:p-10 relative z-10">
          <header className="flex items-center justify-between mb-5">
            <h3 className="font-display text-2xl md:text-3xl font-bold text-foreground tracking-tighter leading-none group-hover:text-primary transition-colors duration-500">
              {project.title}
            </h3>
            {project.codeUrl && (
              <Link 
                href={project.codeUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors p-1"
                aria-label={dictionary.label_source_code}
                onClick={() => console.log(`[AUDIT][DEV-ACCESS] Code Repository Opened: ${project.slug}`)}
              >
                <Github size={20} />
              </Link>
            )}
          </header>

          <p className="grow text-sm md:text-base text-muted-foreground font-sans font-light leading-relaxed line-clamp-3 mb-10 transition-colors duration-1000 italic">
            {project.description}
          </p>

          {/* ASSET METADATA (Technology Stack) */}
          <div className="flex flex-wrap gap-2.5 mb-2">
            {project.tech_stack.slice(0, 3).map((tech) => (
              <span 
                key={tech} 
                className="rounded-xl bg-foreground/5 border border-border/40 px-4 py-2 text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-widest transition-all group-hover:border-primary/20 group-hover:text-foreground"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>

        {/* --- 3. ENTERPRISE ACTION BAR --- */}
        <div className="mt-auto border-t border-border/40 p-8 bg-background/20 backdrop-blur-sm flex items-center justify-between">
           <button 
             onClick={openAssetTechnicalConsole}
             className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground hover:text-primary transition-all flex items-center gap-3 group/btn"
           >
              <ShieldCheck size={14} className="text-primary opacity-40 group-hover/btn:opacity-100 transition-opacity" />
              {dictionary.label_objective} 
              <ArrowUpRight size={14} className="transition-transform group-hover/btn:-translate-y-1 group-hover/btn:translate-x-1" />
           </button>

           {project.liveUrl && project.liveUrl !== '#' && (
             <Link 
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              /**
               * @pilar VII: Sovereign Flip (Tailwind v4 Standard)
               * Invierte la paleta cromática según la atmósfera activa.
               */
              className="flex items-center gap-3 rounded-full bg-foreground px-8 py-3 text-[10px] font-bold text-background uppercase tracking-[0.2em] transition-all hover:bg-primary hover:text-white shadow-2xl active:scale-95"
             >
               <ExternalLink size={14} strokeWidth={2.5} />
               {dictionary.label_live_demo}
             </Link>
           )}
        </div>

        {/* INDICADOR DE IDENTIDAD VISUAL (Dynamic Accent) */}
        <div 
          className="absolute bottom-0 left-0 h-1 w-full transition-all duration-700 opacity-20 group-hover:opacity-100"
          style={{ backgroundColor: project.branding.primary_color }} 
        />
      </motion.article>

      {/* --- 4. ASSET TECHNICAL CONSOLE (Modal Instance) --- */}
      <AnimatePresence>
        {isTechnicalConsoleOpen && (
          <ProjectTechModal 
            data={project} 
            onClose={closeAssetTechnicalConsole} 
            dictionary={dictionary} 
          />
        )}
      </AnimatePresence>
    </>
  );
}