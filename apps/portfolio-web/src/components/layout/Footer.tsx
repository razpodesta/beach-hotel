// RUTA: apps/portfolio-web/src/components/layout/Footer.tsx
// VERSIÓN: 7.0 - Concierge Digital Edition
// DESCRIPCIÓN: Footer inmersivo. Integra Newsletter, navegación boutique y identidad visual de élite.

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, type Variants } from 'framer-motion';
import { Mail, ArrowRight } from 'lucide-react';
import { cn } from '../../lib/utils/cn';
import type { Dictionary } from '../../lib/schemas/dictionary.schema';
import { socialLinks } from '../../lib/social-links';
import { footerNavStructure } from '../../lib/nav-links';
import { getLocalizedHref } from '../../lib/utils/link-helpers';
import { i18n, type Locale } from '../../config/i18n.config';

interface FooterProps {
  content: Dictionary['footer'];
  navLabels: Dictionary['nav-links']['nav_links'];
  tagline: string;
  className?: string;
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } },
};

export function Footer({ content, navLabels, tagline, className }: FooterProps) {
  const pathname = usePathname();
  const currentLang = (pathname?.split('/')[1] as Locale) || i18n.defaultLocale;

  return (
    <footer className={cn("border-t border-white/10 bg-[#020202] text-zinc-400", className)}>
      <div className="container mx-auto px-6 py-20">
        
        {/* Newsletter Section */}
        <div className="mb-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="font-display text-4xl font-bold text-white mb-4">{content.newsletter_title}</h2>
            <p className="text-zinc-500">{tagline}</p>
          </div>
          <form className="relative group" onSubmit={(e) => e.preventDefault()}>
            <input 
              type="email" 
              placeholder={content.newsletter_placeholder}
              className="w-full bg-white/5 border border-white/10 rounded-full py-4 px-6 outline-none focus:border-purple-500 transition-colors"
            />
            <button className="absolute right-2 top-2 bottom-2 rounded-full bg-white text-black px-6 font-bold text-xs uppercase tracking-widest hover:bg-zinc-200 transition-all">
              {content.newsletter_button}
            </button>
          </form>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-20">
          <div className="col-span-2 md:col-span-1">
            <Link href={`/${currentLang}`} className="block mb-6">
              <h2 className="font-display text-2xl font-bold text-white">Beach Hotel</h2>
              <span className="text-[9px] font-mono tracking-[0.3em] uppercase text-purple-500">Canasvieiras</span>
            </Link>
          </div>

          {footerNavStructure.map((column) => (
            <motion.div variants={itemVariants} key={column.columnKey}>
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-white mb-6">
                {content[column.columnKey as keyof typeof content]}
              </h3>
              <ul className="space-y-4">
                {column.links.map((link) => (
                  <li key={link.labelKey}>
                    <Link
                      href={getLocalizedHref(link.href, currentLang)}
                      className="text-sm hover:text-white transition-colors flex items-center gap-2"
                    >
                      {navLabels[link.labelKey as keyof typeof navLabels]}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-[10px] uppercase tracking-widest text-zinc-600">
            {content.rights_reserved}
          </div>
          <div className="flex gap-6">
            {socialLinks.map(({ href, label, icon: Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-500 hover:text-white transition-colors"
                aria-label={label}
              >
                <Icon size={18} />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}