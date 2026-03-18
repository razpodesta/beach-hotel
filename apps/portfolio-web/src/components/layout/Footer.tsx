/**
 * @file Footer.tsx
 * @description Pie de Página Institucional y Centro de Conversión. 
 *              Orquesta la navegación legal, social y la captación de leads soberanos.
 * @version 11.0 - Newsletter Integration & Staggered Navigation
 * @author Raz Podestá - MetaShark Tech
 */

'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, type Variants } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';

/**
 * IMPORTACIONES DE INFRAESTRUCTRURA
 */
import { cn } from '../../lib/utils/cn';
import { i18n, type Locale } from '../../config/i18n.config';
import { socialLinks } from '../../lib/social-links';
import { footerNavStructure, type FooterColumn, type NavLink } from '../../lib/nav-links';
import { getLocalizedHref } from '../../lib/utils/link-helpers';
import { NewsletterForm } from '../shared/NewsletterForm';
import type { Dictionary } from '../../lib/schemas/dictionary.schema';

interface FooterProps {
  /** Contenido específico del Footer validado por esquema */
  content: Dictionary['footer'];
  /** Etiquetas de navegación compartidas */
  navLabels: Dictionary['nav-links']['nav_links'];
  /** Tagline de marca inyectado desde el Header */
  tagline: string;
  className?: string;
}

/**
 * VARIANTES DE ANIMACIÓN (Pilar XII - MEA/UX)
 */
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } 
  }
};

/**
 * SUB-APARATO: FooterBrand
 */
const FooterBrand = ({ currentLang }: { currentLang: Locale }) => (
  <motion.div variants={itemVariants}>
    <Link 
      href={`/${currentLang}`} 
      className="group block mb-8 outline-none focus-visible:ring-2 focus-visible:ring-purple-500 rounded-lg transition-all" 
      aria-label="Retornar para a recepção"
    >
      <h2 className="font-display text-3xl font-bold text-white transition-colors group-hover:text-purple-400 leading-none">
        Beach Hotel
      </h2>
      <span className="text-[10px] font-mono tracking-[0.5em] uppercase text-purple-500 block mt-2 group-hover:tracking-[0.6em] transition-all">
        Canasvieiras
      </span>
    </Link>
  </motion.div>
);

/**
 * APARATO PRINCIPAL: Footer
 */
export function Footer({ content, navLabels, tagline, className }: FooterProps) {
  const pathname = usePathname();
  
  const currentLang = useMemo(() => 
    (pathname?.split('/')[1] as Locale) || i18n.defaultLocale, 
  [pathname]);

  // @pilar VIII: Resiliencia - Guardia ante fallos de carga en el servidor
  if (!content || !navLabels) return null;

  return (
    <footer 
      className={cn("border-t border-white/5 bg-[#020202] text-zinc-500", className)} 
      role="contentinfo"
    >
      <div className="container mx-auto px-6 py-24 lg:py-32">
        
        {/* 1. SECCIÓN DE CONVERSIÓN: INTEGRACIÓN NEWSLETTER FORM */}
        <div className="mb-24 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div 
            initial="hidden" 
            whileInView="visible" 
            viewport={{ once: true }} 
            variants={itemVariants}
          >
            <span className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.4em] text-zinc-600 mb-6">
              <Sparkles size={12} className="text-purple-500" />
              Sovereign Ecosystem
            </span>
            <h3 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 tracking-tighter leading-[0.9]">
              {content.newsletter_title}
            </h3>
            <p className="text-zinc-400 text-lg max-w-md leading-relaxed font-light italic">
              {tagline}
            </p>
          </motion.div>

          <motion.div 
            initial="hidden" 
            whileInView="visible" 
            viewport={{ once: true }} 
            variants={itemVariants}
            className="rounded-[3rem] bg-white/2 border border-white/5 backdrop-blur-sm"
          >
            <NewsletterForm content={content} />
          </motion.div>
        </div>

        {/* 2. ARQUITECTURA DE NAVEGACIÓN STAGGERED */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-24 border-t border-white/5 pt-20"
        >
          <div className="col-span-2 md:col-span-1">
            <FooterBrand currentLang={currentLang} />
          </div>

          {footerNavStructure.map((column: FooterColumn) => (
            <motion.div key={column.columnKey} variants={itemVariants} className="flex flex-col">
              <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/80 mb-10">
                {content[column.columnKey as keyof typeof content]}
              </h4>
              <nav className="flex flex-col gap-6">
                {column.links.map((link: NavLink) => (
                  <Link
                    key={link.labelKey}
                    href={getLocalizedHref(link.href, currentLang)}
                    className="group text-sm text-zinc-500 hover:text-white transition-all duration-300 inline-flex items-center outline-none focus-visible:text-purple-400"
                  >
                    <span className="w-0 group-hover:w-5 opacity-0 group-hover:opacity-100 transition-all text-purple-500 overflow-hidden">
                       <ArrowRight size={14} />
                    </span>
                    {navLabels[link.labelKey as keyof typeof navLabels] || link.labelKey}
                  </Link>
                ))}
              </nav>
            </motion.div>
          ))}
        </motion.div>

        {/* 3. SOCIAL & LEGAL COMPLIANCE */}
        <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="flex flex-col gap-3 text-center md:text-left">
            <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-600 font-medium">
              {content.rights_reserved}
            </p>
            <p className="text-[9px] font-mono text-zinc-800 uppercase tracking-widest">
              {content.made_by}
            </p>
          </div>

          <div className="flex gap-4">
            {socialLinks.map(({ href, label, icon: Icon }) => (
              <motion.a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ y: -4, backgroundColor: 'rgba(255,255,255,0.05)' }}
                className="w-12 h-12 rounded-2xl border border-white/5 flex items-center justify-center text-zinc-500 hover:text-white hover:border-purple-500/30 transition-all outline-none"
                aria-label={label}
              >
                <Icon size={20} strokeWidth={1.5} />
              </motion.a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}