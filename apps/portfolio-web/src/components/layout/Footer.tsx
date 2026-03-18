/**
 * @file Footer.tsx
 * @description Orquestador soberano del pie de página.
 *              Nivelado: Eliminación de advertencias de linter, tipado estricto
 *              y cumplimiento de estándares de accesibilidad WCAG.
 * @version 10.1 - Linter Compliant & Elite SEO
 * @author Raz Podestá - MetaShark Tech
 */

'use client';


import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, type Variants } from 'framer-motion';
import { ArrowRight, Send } from 'lucide-react';

/**
 * IMPORTACIONES DE INFRAESTRUCTRURA
 */
import { cn } from '../../lib/utils/cn';
import { i18n, type Locale } from '../../config/i18n.config';
import { socialLinks } from '../../lib/social-links';
import { footerNavStructure, type FooterColumn, type NavLink } from '../../lib/nav-links';
import { getLocalizedHref } from '../../lib/utils/link-helpers';
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

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } 
  },
};

const FooterBrand = ({ currentLang }: { currentLang: Locale }) => (
  <Link 
    href={`/${currentLang}`} 
    className="group block mb-8 outline-none focus-visible:ring-2 focus-visible:ring-purple-500 rounded-lg transition-all" 
    aria-label="Retornar para a recepção"
  >
    <h2 className="font-display text-2xl font-bold text-white transition-colors group-hover:text-purple-400">
      Beach Hotel
    </h2>
    <span className="text-[10px] font-mono tracking-[0.4em] uppercase text-purple-500 block mt-1">
      Canasvieiras
    </span>
  </Link>
);

export function Footer({ content, navLabels, tagline, className }: FooterProps) {
  const pathname = usePathname();
  const currentLang = (pathname?.split('/')[1] as Locale) || i18n.defaultLocale;

  const handleSubmitNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    /**
     * @pilar IV: Observabilidad.
     * En producción aquí se integra el servicio de marketing (Mailchimp/Brevo).
     */
    console.log("[HEIMDALL][LEAD] Newsletter subscription initiated.");
  };

  // @pilar VIII: Resiliencia - Guardia ante datos faltantes durante el build estático
  if (!content || !navLabels) return null;

  return (
    <footer 
      className={cn("border-t border-white/10 bg-[#020202] text-zinc-500", className)} 
      role="contentinfo"
      aria-labelledby="footer-heading"
    >
      <h2 id="footer-heading" className="sr-only">Rodapé</h2>
      
      <div className="container mx-auto px-6 py-24">
        
        {/* 1. SECCIÓN DE CONVERSIÓN: NEWSLETTER */}
        <div className="mb-24 grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
            <h3 className="font-display text-4xl md:text-5xl font-bold text-white mb-6 tracking-tighter">
              {content.newsletter_title}
            </h3>
            <p className="text-zinc-400 text-lg max-w-md leading-relaxed font-light italic">
              {tagline}
            </p>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
            <form className="relative w-full max-w-md" onSubmit={handleSubmitNewsletter}>
              <label htmlFor="footer-email-input" className="sr-only">Endereço de E-mail</label>
              <input 
                id="footer-email-input"
                type="email" 
                required
                placeholder={content.newsletter_placeholder}
                className="w-full bg-white/5 border border-white/10 rounded-full py-5 px-8 outline-none focus:border-purple-500 focus:bg-white/10 transition-all text-white placeholder:text-zinc-600 font-sans"
              />
              <button 
                type="submit"
                className="absolute right-2 top-2 bottom-2 rounded-full bg-white text-black px-8 font-bold text-[10px] uppercase tracking-widest hover:bg-purple-600 hover:text-white transition-all flex items-center gap-2 outline-none active:scale-95"
              >
                {content.newsletter_button} <Send size={12} />
              </button>
            </form>
          </motion.div>
        </div>

        {/* 2. ARQUITECTURA DE NAVEGACIÓN */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-24 border-t border-white/5 pt-16">
          <div className="col-span-2 md:col-span-1">
            <FooterBrand currentLang={currentLang} />
          </div>

          {footerNavStructure.map((column: FooterColumn) => (
            <div key={column.columnKey} className="flex flex-col">
              <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-white mb-8">
                {content[column.columnKey as keyof typeof content]}
              </h4>
              <nav className="flex flex-col gap-5">
                {column.links.map((link: NavLink) => (
                  <Link
                    key={link.labelKey}
                    href={getLocalizedHref(link.href, currentLang)}
                    className="text-sm hover:text-white hover:translate-x-1 transition-all duration-300 inline-flex items-center group outline-none focus-visible:text-purple-400"
                  >
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity mr-2 text-purple-500">
                       <ArrowRight size={12} />
                    </span>
                    {navLabels[link.labelKey as keyof typeof navLabels] || link.labelKey}
                  </Link>
                ))}
              </nav>
            </div>
          ))}
        </div>

        {/* 3. SOCIAL & LEGAL COMPLIANCE */}
        <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8 text-center md:text-left">
          <div className="flex flex-col gap-2">
            <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-600">
              {content.rights_reserved}
            </p>
            <p className="text-[9px] font-mono text-zinc-800">
              {content.made_by}
            </p>
          </div>

          <div className="flex gap-4">
            {socialLinks.map(({ href, label, icon: Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full border border-white/5 flex items-center justify-center text-zinc-600 hover:text-white hover:border-purple-500/50 hover:bg-purple-500/10 transition-all outline-none focus-visible:border-purple-500"
                aria-label={label}
              >
                <Icon size={18} strokeWidth={1.5} />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}